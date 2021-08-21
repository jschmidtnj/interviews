package enums

type Color int

const (
	ColorA Color = iota
	ColorB
	ColorC
	ColorD
)

var Colors = []Color{
	ColorA,
	ColorB,
	ColorC,
	ColorD,
}

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
