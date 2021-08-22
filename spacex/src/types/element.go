package types

import (
	"fmt"

	"github.com/jschmidtnj/spacex/enums"
	"gonum.org/v1/gonum/mat"
)

// Element contains all positional and identification data for item
// in user-satellite system.
type Element struct {
	Id          uint64
	Data        *mat.VecDense
	ElementType enums.ElementType
	Latitude    float64
	Longitude   float64
	Altitude    float64
	Geohash     string
}

// String is a toString method for the Element object.
func (elem Element) String() string {
	return fmt.Sprintf("element %d: %s", elem.Id, elem.Geohash)
}
