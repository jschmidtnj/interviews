package types

import (
	"fmt"
	"sort"

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
	return fmt.Sprintf("connection %s: user %s, satellite %s", connection.Color, connection.User, connection.Satellite)
}

type ConnectionPair struct {
	Connection1 *Connection
	Connection2 *Connection
}

func (pair ConnectionPair) String() string {
	return fmt.Sprintf("users %d to %d, colors %s to %s", pair.Connection1.User.Id, pair.Connection2.User.Id, pair.Connection1.Color, pair.Connection2.Color)
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

// SORTING

type ConnectionList []*Connection

func (list ConnectionList) Len() int {
	return len(list)
}

func (list ConnectionList) Less(i, j int) bool {
	if list[i].Satellite.Id != list[j].Satellite.Id {
		return list[i].Satellite.Id < list[j].Satellite.Id
	}
	return list[i].User.Id < list[j].User.Id
}

func (list ConnectionList) Swap(i, j int) {
	list[i], list[j] = list[j], list[i]
}

// sort connection counts

type ConnectionCountData struct {
	Count      int
	Connection *Connection
}

func SortConnectionCounts(data map[uint64]ConnectionCountData) ConnectionCountPairList {
	list := make(ConnectionCountPairList, len(data))
	i := 0
	for key, val := range data {
		list[i] = ConnectionCountPair{
			key,
			val,
		}
		i++
	}
	sort.Sort(sort.Reverse(list))
	return list
}

type ConnectionCountPair struct {
	Key   uint64
	Value ConnectionCountData
}

type ConnectionCountPairList []ConnectionCountPair

func (p ConnectionCountPairList) Len() int {
	return len(p)
}

func (p ConnectionCountPairList) Less(i, j int) bool {
	return p[i].Value.Count < p[j].Value.Count
}

func (p ConnectionCountPairList) Swap(i, j int) {
	p[i], p[j] = p[j], p[i]
}
