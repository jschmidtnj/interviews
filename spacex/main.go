//usr/bin/env go run "$0" "$@"; exit "$?"
package main

import (
	"log"
	"math/rand"

	"github.com/jschmidtnj/starlink/core"
	"github.com/jschmidtnj/starlink/utils"
)

// main entry point
func main() {
	// seed random numbers
	rand.Seed(42)

	inputFilePath := utils.ParseArgs()

	fileData, err := core.ReadFile(inputFilePath)
	if err != nil {
		log.Fatal(err)
	}

	connections, err := core.Solve(fileData)
	if err != nil {
		log.Fatal(err)
	}

	if !utils.Opts.Debug {
		core.OutputConnections(connections)
	}
}
