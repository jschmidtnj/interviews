package core

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"sort"
	"strconv"
	"strings"

	"github.com/jschmidtnj/spacex/enums"
	"github.com/jschmidtnj/spacex/types"
	"github.com/jschmidtnj/spacex/utils"
	"github.com/mmcloughlin/geohash"
	"gonum.org/v1/gonum/mat"
)

func ValidateArgs() string {
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

func ReadFile(inputFilePath string) (map[enums.ElementType][]*types.Element, error) {
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
		element, err := ParseLine(line, currentLine)
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

func ParseLine(line string, lineNumber int) (*types.Element, error) {
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
			coordinates[i] = utils.Epsilon
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

func OutputConnections(connections types.ConnectionList) {
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
