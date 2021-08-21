package enums

import "fmt"

type ElementType int

const (
	User ElementType = iota
	Satellite
	Interferer
)

var ElementTypes = []ElementType{
	User,
	Satellite,
	Interferer,
}

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
