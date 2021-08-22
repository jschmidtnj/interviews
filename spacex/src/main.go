//usr/bin/env go run "$0" "$@"; exit "$?"
package main

import (
	"log"
	"math/rand"

	"github.com/jschmidtnj/spacex/core"
	"github.com/jschmidtnj/spacex/utils"
)

// main entry point
func main() {
	// seed random numbers
	rand.Seed(42)

	inputFilePath := core.ValidateArgs()

	fileData, err := core.ReadFile(inputFilePath)
	if err != nil {
		log.Fatal(err)
	}

	connections, err := core.Solve(fileData)
	if err != nil {
		log.Fatal(err)
	}

	if !utils.Debug {
		core.OutputConnections(connections)
	}
}
