package core

import (
	"sort"

	"github.com/jschmidtnj/spacex/enums"
	"github.com/jschmidtnj/spacex/types"
	"github.com/jschmidtnj/spacex/utils"
	"github.com/masatana/go-textdistance"
	"gonum.org/v1/gonum/mat"
)

func getUsersInRange(satellite *types.Element, users []*types.Element, userGeohashes []string) []*types.Element {
	closestUserIndex := sort.SearchStrings(userGeohashes, satellite.Geohash)

	usersInRange := []*types.Element{}
	if closestUserIndex == len(users) {
		return usersInRange
	}

	if (types.Connection{
		User:      users[closestUserIndex],
		Satellite: satellite,
	}.Angle()) >= utils.MaxSatelliteAngle {
		return usersInRange
	}

	leftIndex := closestUserIndex

	for {
		if leftIndex == 0 {
			break
		}
		leftAngle := types.Connection{
			User:      users[leftIndex-1],
			Satellite: satellite,
		}.Angle()
		if leftAngle >= utils.MaxSatelliteAngle {
			break
		}
		leftIndex--
	}

	rightIndex := closestUserIndex

	for {
		if rightIndex == len(users)-1 {
			break
		}
		rightAngle := types.Connection{
			User:      users[rightIndex+1],
			Satellite: satellite,
		}.Angle()
		if rightAngle >= utils.MaxSatelliteAngle {
			break
		}
		rightIndex++
	}

	usersInRange = users[leftIndex : rightIndex+1]

	sort.Slice(usersInRange, func(i, j int) bool {
		distance1 := textdistance.LevenshteinDistance(usersInRange[i].Geohash, satellite.Geohash)
		distance2 := textdistance.LevenshteinDistance(usersInRange[j].Geohash, satellite.Geohash)
		return distance1 < distance2
	})

	return usersInRange
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

			if currentAngle < utils.MaxInterferenceAngle {
				supported = false
				break
			}
		}
		if supported {
			supportedUsers = append(supportedUsers, user)
		}
	}

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
			if currentAngle < utils.MaxLocalInterferenceAngle {
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

func limitSatelliteConnections(satellites []*types.Element, satelliteConnections map[uint64][]*types.Connection) []*types.Connection {
	userCount := getUserCount(satelliteConnections)

	if utils.Debug {
		logUserStats(userCount)
	}

	connectionsAfterLimit := []*types.Connection{}

	for _, satellite := range satellites {
		possibleConnections := satelliteConnections[satellite.Id]
		if len(possibleConnections) > utils.MaxConnectionsPerSatellite {

			// remove far away vs remove with more connection options (or both)??? TODO
			// TODO - try removing connections that are further away
			sort.Slice(possibleConnections, func(i, j int) bool {
				return userCount[possibleConnections[i].User.Id] < userCount[possibleConnections[j].User.Id]
			})
			possibleConnections = possibleConnections[:utils.MaxConnectionsPerSatellite]
			satelliteConnections[satellite.Id] = possibleConnections
		}
		connectionsAfterLimit = append(connectionsAfterLimit, possibleConnections...)
	}

	return connectionsAfterLimit
}

func removeDuplicates(connectionsAfterLimit []*types.Connection, satelliteConnections map[uint64][]*types.Connection) []*types.Connection {
	removedDuplicationsConnections := []*types.Connection{}

	userCount := getUserCount(satelliteConnections)

	if utils.Debug {
		logUserStats(userCount)
	}

	// remove duplicates at the end
	for _, connection := range connectionsAfterLimit {
		count := userCount[connection.User.Id]
		if count == 1 {
			removedDuplicationsConnections = append(removedDuplicationsConnections, connection)
		}
	}

	return removedDuplicationsConnections
}
