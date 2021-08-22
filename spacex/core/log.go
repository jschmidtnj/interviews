package core

import (
	"log"

	"github.com/jschmidtnj/starlink/types"
	"github.com/jschmidtnj/starlink/utils"
	"gonum.org/v1/plot"
	"gonum.org/v1/plot/plotter"
	"gonum.org/v1/plot/plotutil"
	"gonum.org/v1/plot/vg"
)

func plotDistances(users []*types.Element, satellite *types.Element) {
	points := make(plotter.XYs, len(users))
	for i, elem := range users {
		points[i].X = float64(i + 1)
		points[i].Y = utils.EuclidianDistance(elem.Data, satellite.Data)
	}

	distancePlot := plot.New()
	err := plotutil.AddLinePoints(distancePlot,
		"First", points)
	if err != nil {
		panic(err)
	}
	if err := distancePlot.Save(20*vg.Inch, 15*vg.Inch, "plot.png"); err != nil {
		panic(err)
	}
}

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
