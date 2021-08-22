package core

import (
	"os"
	"sort"

	"github.com/jschmidtnj/starlink/enums"
	"github.com/jschmidtnj/starlink/types"
	"github.com/jschmidtnj/starlink/utils"
	"github.com/masatana/go-textdistance"
	"gonum.org/v1/gonum/mat"
)

// getNumCheckOutOfRange returns the number of consecutive checks
// the getUsersInRange function will perform on users not in range
func getNumCheckOutOfRange(numUsers int) int {
	const percent = 10
	const min = 1
	const max = 100
	const performance = 5000

	if utils.Opts.MaxPerformance {
		return performance
	}

	numCheckOutOfRange := numUsers / percent
	if numCheckOutOfRange < min {
		numCheckOutOfRange = min
	} else if numCheckOutOfRange > max {
		numCheckOutOfRange = max
	}

	return numCheckOutOfRange
}

// getUsersInRange outputs the users from the users list closest to the satellite and
// within range of the satellite.
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

	if utils.Opts.Plot {
		plotDistances(users, satellite)
		os.Exit(0)
	}

	usersInRange = append(usersInRange, users[closestUserIndex])

	numCheckOutOfRange := getNumCheckOutOfRange(len(users))

	leftIndex := closestUserIndex - 1
	if leftIndex < 0 {
		leftIndex = len(users) - 1
	}
	lastLeftIndex := leftIndex

	outOfRangeCount := 0
	for leftIndex != closestUserIndex && outOfRangeCount < numCheckOutOfRange {
		lastLeftIndex = leftIndex
		leftAngle := types.Connection{
			User:      users[leftIndex],
			Satellite: satellite,
		}.Angle()
		if leftAngle < utils.MaxSatelliteAngle {
			outOfRangeCount = 0
			usersInRange = append(usersInRange, users[leftIndex])
		} else {
			outOfRangeCount++
		}
		leftIndex--
		// wrap around
		if leftIndex < 0 {
			leftIndex = len(users) - 1
		}
	}

	rightIndex := (closestUserIndex + 1) % len(users)

	outOfRangeCount = 0
	for rightIndex != lastLeftIndex && outOfRangeCount < numCheckOutOfRange {
		rightAngle := types.Connection{
			User:      users[rightIndex],
			Satellite: satellite,
		}.Angle()
		if rightAngle < utils.MaxSatelliteAngle {
			outOfRangeCount = 0
			usersInRange = append(usersInRange, users[rightIndex])
		} else {
			outOfRangeCount++
		}
		rightIndex++
		// wrap around
		if rightIndex == len(users) {
			rightIndex = 0
		}
	}

	sort.Slice(usersInRange, func(i, j int) bool {
		distance1 := textdistance.LevenshteinDistance(usersInRange[i].Geohash, satellite.Geohash)
		distance2 := textdistance.LevenshteinDistance(usersInRange[j].Geohash, satellite.Geohash)
		return distance1 < distance2
	})

	return usersInRange
}

// removeInterfering tests for interference from external satellites,
// and if it exists, marks those user connections impossible.
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

// getLocalInterferences returns the pairs of connections that interfere with one another
// for a single satellite.
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

// colorConnections constructs a graph of connections for a single satellite that interfere with one
// another and adds different colors to mitigate this interference. It outputs the connections that
// would still interfere as well as a map between the user id and the color of the connection.
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

// getUserCount generates a map between user ids and the number of connections possible
// for each user.
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

// limitSatelliteConnections truncates the number of connections a satellite can have
// to the maximum allowed, as defined in the constants file.
func limitSatelliteConnections(satellites []*types.Element, satelliteConnections map[uint64][]*types.Connection) []*types.Connection {
	userCount := getUserCount(satelliteConnections)

	if utils.Opts.Debug {
		logUserStats(userCount)
	}

	connectionsAfterLimit := []*types.Connection{}

	seenUsers := map[uint64]bool{}
	for _, satellite := range satellites {
		possibleConnections := []*types.Connection{}
		for _, connection := range satelliteConnections[satellite.Id] {
			if _, ok := seenUsers[connection.User.Id]; ok {
				continue
			}
			seenUsers[connection.User.Id] = true
			possibleConnections = append(possibleConnections, connection)
		}

		if len(possibleConnections) > utils.MaxConnectionsPerSatellite {
			sort.Slice(possibleConnections, func(i, j int) bool {
				count1 := userCount[possibleConnections[i].User.Id]
				count2 := userCount[possibleConnections[j].User.Id]
				if count1 != count2 {
					return count1 > count2
				}
				distance1 := textdistance.LevenshteinDistance(possibleConnections[i].User.Geohash,
					possibleConnections[i].Satellite.Geohash)
				distance2 := textdistance.LevenshteinDistance(possibleConnections[j].User.Geohash,
					possibleConnections[j].Satellite.Geohash)
				return distance1 > distance2
			})
			possibleConnections = possibleConnections[:utils.MaxConnectionsPerSatellite]
			satelliteConnections[satellite.Id] = possibleConnections
		}
		connectionsAfterLimit = append(connectionsAfterLimit, possibleConnections...)
	}

	return connectionsAfterLimit
}
