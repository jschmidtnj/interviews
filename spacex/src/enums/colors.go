package enums

// Color is an enum for a connection color (frequency).
type Color int

// Colors enum.
const (
	ColorA Color = iota
	ColorB
	ColorC
	ColorD
)

// Colors list of Color options.
var Colors = []Color{
	ColorA,
	ColorB,
	ColorC,
	ColorD,
}

// String is a toString method for colors.
func (color Color) String() string {
	switch color {
	case ColorA:
		return "A"
	case ColorB:
		return "B"
	case ColorC:
		return "C"
	case ColorD:
		return "D"
	default:
		return ""
	}
}
