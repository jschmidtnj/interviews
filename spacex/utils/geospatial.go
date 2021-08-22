package utils

import (
	"github.com/StefanSchroeder/Golang-Ellipsoid/ellipsoid"
	"gonum.org/v1/gonum/mat"
)

// Earth ellipsoid object for converting ECEF coordinates to longitude and latitude.
var Earth = ellipsoid.Init("WGS84", ellipsoid.Degrees, ellipsoid.Meter, ellipsoid.LongitudeIsSymmetric, ellipsoid.BearingIsSymmetric)

// GetLatitudeLongitude converts ECEF coordinates to longitude, latitude, and altitude.
func GetLatitudeLongitude(coordinates *mat.VecDense) (float64, float64, float64) {
	return Earth.ToLLA(coordinates.AtVec(0), coordinates.AtVec(1), coordinates.AtVec(2))
}
