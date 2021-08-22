package utils

import (
	"math"

	"gonum.org/v1/gonum/mat"
)

// VectorWithVal creates a vector with length n with all elements of value val.
func VectorWithVal(n int, val float64) *mat.VecDense {
	data := make([]float64, n)
	for i := range data {
		data[i] = val
	}
	return mat.NewVecDense(n, data)
}

// GetUnitVector creates a unit vector of the given vector.
func GetUnitVector(vector *mat.VecDense) *mat.VecDense {
	numElements, _ := vector.Dims()
	// make a copy
	vector = mat.VecDenseCopyOf(vector)
	// do division
	vector.DivElemVec(vector, VectorWithVal(numElements, mat.Norm(vector, 2)))
	return vector
}

// AngleBetween outputs the angle between two given vectors.
func AngleBetween(vector1 *mat.VecDense, vector2 *mat.VecDense) float64 {
	unitVector1 := GetUnitVector(vector1)
	unitVector2 := GetUnitVector(vector2)
	dotProduct := mat.Dot(unitVector1, unitVector2)
	angle := math.Acos(dotProduct)
	return angle
}

// DegreesToRadians converts degrees to radians.
func DegreesToRadians(degrees float64) float64 {
	return degrees * math.Pi / 180
}
