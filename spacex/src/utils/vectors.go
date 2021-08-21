package utils

import (
	"math"

	"gonum.org/v1/gonum/mat"
)

func VectorToMatrix(vector mat.Dense) mat.Matrix {
	r, c := vector.Dims()
	return vector.Slice(0, r, 0, c)
}

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

func EuclidianDistance(vector1 *mat.VecDense, vector2 *mat.VecDense) float64 {
	difference := mat.VecDenseCopyOf(vector1)
	difference.SubVec(vector1, vector2)
	return mat.Norm(difference, 2)
}

func DegreesToRadians(degrees float64) float64 {
	return degrees * math.Pi / 180
}
