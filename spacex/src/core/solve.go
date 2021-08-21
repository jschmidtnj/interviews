package core

import (
	"log"
	"math/rand"
	"sort"

	"github.com/jschmidtnj/spacex/enums"
	"github.com/jschmidtnj/spacex/types"
	"github.com/jschmidtnj/spacex/utils"
)

func Solve(data map[enums.ElementType][]*types.Element) ([]*types.Connection, error) {
	for _, elements := range data {
		sort.Slice(elements, func(i, j int) bool {
			return elements[i].Geohash < elements[j].Geohash
		})
	}
	userGeohashes := make([]string, len(data[enums.User]))
	for i, user := range data[enums.User] {
		userGeohashes[i] = user.Geohash
	}

	numInRange := 0
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

		// remaining after adding the colors
		remainingConnections, colorMap := colorConnections(localInterferences)

		remainingConnectionsSet := map[uint64]bool{}
		for _, connection := range remainingConnections {
			remainingConnectionsSet[connection.User.Id] = true
		}

		// create all possible connections by removing remaining connections (interferences) from supported users
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

		numInRange += len(inRange)
		satelliteCount[satellite.Id] = len(supportedUsers)
	}

	if utils.Debug {
		log.Printf("number of connections in range: %d\n", numInRange)
		logSatelliteStats(satelliteCount)
	}

	connectionsAfterLimit := limitSatelliteConnections(data[enums.Satellite], satelliteConnections)

	removedDuplicationsConnections := removeDuplicates(connectionsAfterLimit, satelliteConnections)

	if utils.Debug {
		log.Printf("final number connections: %d / %d (%.3f%%)\n", len(removedDuplicationsConnections),
			len(data[enums.User]), float64(len(removedDuplicationsConnections))*100/float64(len(data[enums.User])))
	}

	return removedDuplicationsConnections, nil
}
