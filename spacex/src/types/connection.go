package types

import (
	"fmt"

	"github.com/jschmidtnj/spacex/enums"
	"github.com/jschmidtnj/spacex/utils"
	"gonum.org/v1/gonum/mat"
)

type Connection struct {
	Color     *enums.Color
	User      *Element
	Satellite *Element
}

func (connection Connection) String() string {
	return fmt.Sprintf("connection [%s]: user [%s], satellite [%s]", connection.Color, connection.User, connection.Satellite)
}

type ConnectionPair struct {
	Connection1 *Connection
	Connection2 *Connection
}

func (pair ConnectionPair) String() string {
	return fmt.Sprintf("users: %d -> %d, colors: %s -> %s", pair.Connection1.User.Id, pair.Connection2.User.Id, pair.Connection1.Color, pair.Connection2.Color)
}

func (connection Connection) Vector() *mat.VecDense {
	satelliteToUser := mat.VecDenseCopyOf(connection.User.Data)
	satelliteToUser.SubVec(connection.Satellite.Data, connection.User.Data)
	return satelliteToUser
}

func (connection Connection) Angle() float64 {
	angleBetween := utils.AngleBetween(connection.User.Data, connection.Vector())
	// fmt.Printf("%s: %f\n", connection, angleBetween)
	return angleBetween
}
