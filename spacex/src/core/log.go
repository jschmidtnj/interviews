package core

import (
	"log"

	"github.com/jschmidtnj/spacex/utils"
)

// logUserStats outputs data on the user count.
func logUserStats(userCount map[uint64]int) {
	numSingleUsers := 0
	numDuplicatedUsers := 0
	for _, count := range userCount {
		if count == 1 {
			numSingleUsers++
		} else if count > 1 {
			numDuplicatedUsers++
		}
	}
	log.Printf("users: %d single, %d duplicated\n", numSingleUsers, numDuplicatedUsers)
}

// logSatelliteStats logs data on the satellite counts.
func logSatelliteStats(satelliteCount map[uint64]int) {
	numSatellitesUnderLimit := 0
	numSatellitesOverLimit := 0
	for _, count := range satelliteCount {
		if count <= utils.MaxConnectionsPerSatellite && count > 0 {
			numSatellitesUnderLimit++
		} else if count > utils.MaxConnectionsPerSatellite {
			numSatellitesOverLimit++
		}
	}
	log.Printf("satellites over limit: %d / %d (%d)\n", numSatellitesOverLimit, numSatellitesUnderLimit+numSatellitesOverLimit, len(satelliteCount))
}
