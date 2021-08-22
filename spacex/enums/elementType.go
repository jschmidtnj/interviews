package enums

import "fmt"

// ElementType is an enum for elements in the system.
type ElementType int

// ElementType enum.
const (
	User ElementType = iota
	Satellite
	Interferer
)

// ElementTypes list of ElementType options.
var ElementTypes = []ElementType{
	User,
	Satellite,
	Interferer,
}

// String is a toString method for ElementType objects.
func (elem ElementType) String() string {
	switch elem {
	case User:
		return "user"
	case Satellite:
		return "satellite"
	case Interferer:
		return "interefer"
	default:
		return ""
	}
}

// NewElementType is a method for converting strings to ElementType enums.
func NewElementType(input string) (ElementType, error) {
	switch input {
	case "user":
		return User, nil
	case "sat":
		return Satellite, nil
	case "interferer":
		return Interferer, nil
	default:
		return -1, fmt.Errorf("invalid element provided: %s", input)
	}
}
