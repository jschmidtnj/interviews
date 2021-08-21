package utils

import (
	"github.com/StefanSchroeder/Golang-Ellipsoid/ellipsoid"
	"gonum.org/v1/gonum/mat"
)

var earth = ellipsoid.Init("WGS84", ellipsoid.Degrees, ellipsoid.Meter, ellipsoid.LongitudeIsSymmetric, ellipsoid.BearingIsSymmetric)

func GetLatitudeLongitude(coordinates *mat.VecDense) (float64, float64, float64) {
	return earth.ToLLA(coordinates.AtVec(0), coordinates.AtVec(1), coordinates.AtVec(2))
}
