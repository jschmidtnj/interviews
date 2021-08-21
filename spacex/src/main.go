//usr/bin/env go run "$0" "$@"; exit "$?"
package main

import (
	"bufio"
	"fmt"
	"log"
	"math/rand"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/jschmidtnj/spacex/enums"
	"github.com/jschmidtnj/spacex/types"
	"github.com/jschmidtnj/spacex/utils"
	"github.com/mmcloughlin/geohash"
	"gonum.org/v1/gonum/mat"
)

const epsilon = 1e-8

const maxConnectionsPerSatellite = 32

var maxSatelliteAngle = utils.DegreesToRadians(45)
var maxInterferenceAngle = utils.DegreesToRadians(20)
var maxLocalInterferenceAngle = utils.DegreesToRadians(10)

// create a coverage map. what areas on earth are covered by the satellites

func parseLine(line string, lineNumber int) (*types.Element, error) {
	elementsPerLine := 5

	line = strings.TrimSpace(line)
	if len(line) == 0 || line[0] == '#' {
		return nil, nil
	}
	splitLine := strings.Split(line, " ")
	if lineLen := len(splitLine); lineLen != elementsPerLine {
		return nil, fmt.Errorf("input line %d has %d elements instead of %d", lineNumber+1, lineLen, elementsPerLine)
	}
	elementType, err := enums.NewElementType(splitLine[0])
	if err != nil {
		return nil, err
	}
	var id uint64
	if id, err = strconv.ParseUint(splitLine[1], 10, 64); err != nil || id < 1 {
		return nil, fmt.Errorf("input line %d has invalid id %s which is not >= 1", lineNumber+1, splitLine[1])
	}
	var coordinates [3]float64
	for i, coordinateStr := range splitLine[2:] {
		if coordinates[i], err = strconv.ParseFloat(coordinateStr, 64); err != nil {
			return nil, fmt.Errorf("input line %d has invalid coordinate number %s", lineNumber+1, coordinateStr)
		}
		if coordinates[i] == 0 {
			coordinates[i] = epsilon
		}
	}
	coordinatesMatrix := mat.NewVecDense(3, coordinates[:])
	latitude, longitude, altitude := utils.GetLatitudeLongitude(coordinatesMatrix)
	geocode := geohash.Encode(latitude, longitude)

	return &types.Element{
		Id:          id,
		Data:        coordinatesMatrix,
		ElementType: elementType,
		Latitude:    latitude,
		Longitude:   longitude,
		Altitude:    altitude,
		Geohash:     geocode,
	}, nil
}

func readFile(inputFilePath string) (map[enums.ElementType][]*types.Element, error) {
	inputFile, err := os.Open(inputFilePath)
	if err != nil {
		log.Fatal(err)
	}
	defer inputFile.Close()

	fileScanner := bufio.NewScanner(inputFile)

	data := make(map[enums.ElementType][]*types.Element)

	for _, elem := range enums.ElementTypes {
		data[elem] = []*types.Element{}
	}

	currentLine := 0

	for fileScanner.Scan() {
		line := strings.TrimSpace(fileScanner.Text())
		element, err := parseLine(line, currentLine)
		if err != nil {
			return nil, err
		}
		currentLine++
		if element == nil {
			continue
		}
		data[element.ElementType] = append(data[element.ElementType], element)
	}

	if err := fileScanner.Err(); err != nil {
		log.Fatal(err)
	}

	return data, nil
}

func validateArgs() string {
	if len(os.Args) < 2 {
		log.Fatal("no input file provided")
	}
	inputFilePath := os.Args[1]
	if _, err := os.Stat(inputFilePath); err != nil {
		if os.IsNotExist(err) {
			log.Fatalf("file %s does not exist", inputFilePath)
		}
		log.Fatalf("cannot stat file %s", inputFilePath)
	}
	return inputFilePath
}

func getUsersInRange(satellite *types.Element, users []*types.Element, startIndex int) []*types.Element {
	if (types.Connection{
		User:      users[startIndex],
		Satellite: satellite,
	}.Angle()) >= maxSatelliteAngle {
		return []*types.Element{}
	}

	leftIndex := startIndex

	for {
		if leftIndex == 0 {
			break
		}
		leftAngle := types.Connection{
			User:      users[leftIndex-1],
			Satellite: satellite,
		}.Angle()
		if leftAngle >= maxSatelliteAngle {
			break
		}
		leftIndex--
	}

	rightIndex := startIndex

	for {
		if rightIndex == len(users)-1 {
			break
		}
		rightAngle := types.Connection{
			User:      users[rightIndex+1],
			Satellite: satellite,
		}.Angle()
		if rightAngle >= maxSatelliteAngle {
			break
		}
		rightIndex++
	}

	inRange := users[leftIndex : rightIndex+1]

	// fmt.Printf("sat %d: %d / %d user(s) in range\n", satellite.Id, len(inRange), len(data[enums.User]))

	return inRange
}

func removeInterfering(satellite *types.Element, users []*types.Element, interfering []*types.Element) []*types.Element {
	supportedUsers := []*types.Element{}
	for _, user := range users {
		supported := true
		satelliteToUser := types.Connection{
			User:      user,
			Satellite: satellite,
		}.Vector()
		for _, interference := range interfering {
			interferenceToUser := mat.VecDenseCopyOf(user.Data)
			interferenceToUser.SubVec(interference.Data, user.Data)
			currentAngle := utils.AngleBetween(interferenceToUser, satelliteToUser)
			// fmt.Println(user.Id, satellite.Id, interference.Id, currentAngle)
			if currentAngle < maxInterferenceAngle {
				supported = false
				break
			}
		}
		if supported {
			supportedUsers = append(supportedUsers, user)
		}
	}

	// fmt.Printf("after interference - sat %d: %d / %d user(s) in range\n", satellite.Id, len(supportedUsers), len(users))

	return supportedUsers
}

func getLocalInterferences(satellite *types.Element, users []*types.Element) []*types.ConnectionPair {
	interferences := []*types.ConnectionPair{}
	userAngles := make(map[uint64]*mat.VecDense, len(users))
	for _, user := range users {
		userAngles[user.Id] = types.Connection{
			User:      user,
			Satellite: satellite,
		}.Vector()
	}
	connections := map[uint64]*types.Connection{}
	for i, user1 := range users {
		for _, user2 := range users[i+1:] {
			currentAngle := utils.AngleBetween(userAngles[user1.Id], userAngles[user2.Id])
			if currentAngle < maxLocalInterferenceAngle {
				if _, ok := connections[user1.Id]; !ok {
					connections[user1.Id] = &types.Connection{
						User:      user1,
						Satellite: satellite,
					}
				}
				if _, ok := connections[user2.Id]; !ok {
					connections[user2.Id] = &types.Connection{
						User:      user2,
						Satellite: satellite,
					}
				}
				interferences = append(interferences, &types.ConnectionPair{
					Connection1: connections[user1.Id],
					Connection2: connections[user2.Id],
				})
			}
		}
	}

	return interferences
}

func colorConnections(interferencePairs []*types.ConnectionPair) ([]*types.Connection, map[uint64]enums.Color) {
	currentColorindex := 0
	for _, interferencePair := range interferencePairs {
		if interferencePair.Connection1.Color == nil {
			interferencePair.Connection1.Color = &enums.Colors[currentColorindex]
		}
		if interferencePair.Connection2.Color == nil {
			interferencePair.Connection2.Color = &enums.Colors[currentColorindex]
		}
		if interferencePair.Connection1.Color == interferencePair.Connection2.Color {
			currentColorindex = (currentColorindex + 1) % len(enums.Colors)
			interferencePair.Connection2.Color = &enums.Colors[currentColorindex]
		}
	}

	remainingConnections := []*types.Connection{}
	colorMap := map[uint64]enums.Color{}
	for _, interferencePair := range interferencePairs {
		if interferencePair.Connection1.Color == interferencePair.Connection2.Color {
			remainingConnections = append(remainingConnections, interferencePair.Connection2)
		} else {
			colorMap[interferencePair.Connection1.User.Id] = *interferencePair.Connection1.Color
			colorMap[interferencePair.Connection2.User.Id] = *interferencePair.Connection2.Color
		}
	}

	return remainingConnections, colorMap
}

func getUserCount(satelliteConnections map[uint64][]*types.Connection) map[uint64]int {
	userCount := map[uint64]int{}
	for _, possibleConnections := range satelliteConnections {
		for _, connection := range possibleConnections {
			if _, ok := userCount[connection.User.Id]; !ok {
				userCount[connection.User.Id] = 0
			}
			userCount[connection.User.Id]++
		}
	}

	return userCount
}

func solve(data map[enums.ElementType][]*types.Element) ([]*types.Connection, error) {
	for _, elements := range data {
		sort.Slice(elements, func(i, j int) bool {
			return elements[i].Geohash < elements[j].Geohash
		})
	}
	userGeohashes := make([]string, len(data[enums.User]))
	for i, user := range data[enums.User] {
		userGeohashes[i] = user.Geohash
	}
	numInterfered := 0
	satelliteCount := map[uint64]int{}

	satelliteConnections := map[uint64][]*types.Connection{}

	for _, satellite := range data[enums.Satellite] {
		closestUserIndex := sort.SearchStrings(userGeohashes, satellite.Geohash)

		inRange := []*types.Element{}
		if closestUserIndex < len(data[enums.User]) {
			inRange = getUsersInRange(satellite, data[enums.User], closestUserIndex)
		}

		// sort users by closest to satellite in range - TODO

		supportedUsers := removeInterfering(satellite, inRange, data[enums.Interferer])

		// check local interference
		localInterferences := getLocalInterferences(satellite, supportedUsers)
		// fmt.Println("num local interferences", len(localInterferences))

		// remaining after adding the colors
		remainingConnections, colorMap := colorConnections(localInterferences)
		// fmt.Println("num remaining local connections", len(remainingConnections))
		remainingConnectionsSet := map[uint64]bool{}
		for _, connection := range remainingConnections {
			remainingConnectionsSet[connection.User.Id] = true
		}

		// create all possible connections
		possibleConnections := make([]*types.Connection, len(supportedUsers)-len(remainingConnectionsSet))
		i := 0
		for _, user := range supportedUsers {
			if _, ok := remainingConnectionsSet[user.Id]; ok {
				continue
			}
			color, ok := colorMap[user.Id]
			if !ok {
				color = enums.Colors[rand.Intn(len(enums.Colors))]
			}
			possibleConnections[i] = &types.Connection{
				User:      user,
				Satellite: satellite,
				Color:     &color,
			}
			i++
		}

		satelliteConnections[satellite.Id] = possibleConnections

		// statistics ::::::::::::::::
		numInterfered += len(inRange) - len(supportedUsers)
		satelliteCount[satellite.Id] = len(supportedUsers)
	}

	userCount := getUserCount(satelliteConnections)

	connectionsAfterLimit := []*types.Connection{}

	for _, satellite := range data[enums.Satellite] {
		possibleConnections := satelliteConnections[satellite.Id]
		if len(possibleConnections) > maxConnectionsPerSatellite {
			currentUsers := map[uint64]types.ConnectionCountData{}
			for _, connection := range possibleConnections {
				currentUsers[connection.User.Id] = types.ConnectionCountData{
					Count:      userCount[connection.User.Id],
					Connection: connection,
				}
			}
			currentUsersSorted := types.SortConnectionCounts(currentUsers)
			newConnections := make([]*types.Connection, maxConnectionsPerSatellite)
			// remove far away vs remove with more connection options (or both)??? TODO
			for i := range newConnections {
				newConnections[i] = currentUsersSorted[i].Value.Connection
			}
			possibleConnections = newConnections
		}
		connectionsAfterLimit = append(connectionsAfterLimit, possibleConnections...)
	}

	userCount = getUserCount(satelliteConnections)

	removedDuplicationsConnections := []*types.Connection{}

	// remove duplicates at the end
	for _, connection := range connectionsAfterLimit {
		count := userCount[connection.User.Id]
		if count == 1 {
			removedDuplicationsConnections = append(removedDuplicationsConnections, connection)
		}
	}

	// fmt.Println("final number connections", len(removedDuplicationsConnections))

	// fmt.Println("num interfered", numInterfered)
	// numSingleUsers := 0
	// numMultipleUsers := 0
	// for id, count := range userCount {
	// 	if count == 1 {
	// 		numSingleUsers++
	// 	} else if count > 1 {
	// 		numMultipleUsers++
	// 	}
	// 	// fmt.Println("user: ", id, count)
	// }
	// numUnderSatellites := 0
	// numOverSatellites := 0
	// for id, count := range satelliteCount {
	// 	if count <= 32 && count > 0 {
	// 		numUnderSatellites++
	// 	} else if count > 32 {
	// 		numOverSatellites++
	// 	}
	// 	// fmt.Println("satellite: ", id, count)
	// }
	// fmt.Println("num users", numSingleUsers, numMultipleUsers)
	// fmt.Println("num satellites", numUnderSatellites, numOverSatellites)

	return removedDuplicationsConnections, nil
}

func outputConnections(connections types.ConnectionList) {
	sort.Sort(connections)

	currentSatellite := connections[0].Satellite
	beamNumber := 0
	for _, connection := range connections {
		if connection.Satellite.Id != currentSatellite.Id {
			beamNumber = 0
			currentSatellite = connection.Satellite
		}
		beamNumber++
		fmt.Printf("sat %d beam %d user %d color %s\n", connection.Satellite.Id, beamNumber, connection.User.Id, connection.Color)
	}
}

func main() {
	inputFilePath := validateArgs()

	fileData, err := readFile(inputFilePath)
	if err != nil {
		log.Fatal(err)
	}

	// seed random numbers
	rand.Seed(time.Now().Unix())

	connections, err := solve(fileData)
	if err != nil {
		log.Fatal(err)
	}

	outputConnections(connections)
}
