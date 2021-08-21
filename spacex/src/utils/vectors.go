package utils

import (
	"math"

	"gonum.org/v1/gonum/mat"
)

func VectorWithVal(n int, val float64) *mat.VecDense {
	data := make([]float64, n)
	for i := range data {
		data[i] = val
	}
	return mat.NewVecDense(n, data)
}

func GetUnitVector(vector *mat.VecDense) *mat.VecDense {
	numElements, _ := vector.Dims()
	// make a copy
	vector = mat.VecDenseCopyOf(vector)
	// do division
	vector.DivElemVec(vector, VectorWithVal(numElements, mat.Norm(vector, 2)))
	return vector
}

func AngleBetween(vector1 *mat.VecDense, vector2 *mat.VecDense) float64 {
	unitVector1 := GetUnitVector(vector1)
	unitVector2 := GetUnitVector(vector2)
	dotProduct := mat.Dot(unitVector1, unitVector2)
	angle := math.Acos(dotProduct)
	return angle
}

func DegreesToRadians(degrees float64) float64 {
	return degrees * math.Pi / 180
}
