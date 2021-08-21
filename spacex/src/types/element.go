package types

import (
	"fmt"

	"github.com/jschmidtnj/spacex/enums"
	"gonum.org/v1/gonum/mat"
)

type Element struct {
	Id          uint64
	Data        *mat.VecDense
	ElementType enums.ElementType
	Latitude    float64
	Longitude   float64
	Altitude    float64
	Geohash     string
}

func (elem Element) String() string {
	return fmt.Sprintf("element %d: %s", elem.Id, elem.Geohash)
}

type ElementPair struct {
	Element1 *Element
	Element2 *Element
}
