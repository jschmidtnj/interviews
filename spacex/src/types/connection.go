package types

import (
	"fmt"

	"github.com/jschmidtnj/spacex/enums"
	"github.com/jschmidtnj/spacex/utils"
	"gonum.org/v1/gonum/mat"
)

// Connection is an object with a color (the frequency of the connection),
// the user, and the satellite the user is connecting to.
type Connection struct {
	Color     *enums.Color
	User      *Element
	Satellite *Element
}

// String is a toString method for the Connection object.
func (connection Connection) String() string {
	return fmt.Sprintf("connection [%s]: user [%s], satellite [%s]", connection.Color, connection.User, connection.Satellite)
}

// ConnectionPair is a pair of Connection objects, for use in graphs.
type ConnectionPair struct {
	Connection1 *Connection
	Connection2 *Connection
}

// String is a toString method for the ConnectionPair object.
func (pair ConnectionPair) String() string {
	return fmt.Sprintf("users: %d -> %d, colors: %s -> %s", pair.Connection1.User.Id, pair.Connection2.User.Id, pair.Connection1.Color, pair.Connection2.Color)
}

// Vector generates a dense vector for a given connection.
func (connection Connection) Vector() *mat.VecDense {
	satelliteToUser := mat.VecDenseCopyOf(connection.User.Data)
	satelliteToUser.SubVec(connection.Satellite.Data, connection.User.Data)
	return satelliteToUser
}

// Angle computes the angle between the user and the connecting vector.
func (connection Connection) Angle() float64 {
	angleBetween := utils.AngleBetween(connection.User.Data, connection.Vector())
	return angleBetween
}
