package utils

import (
	"log"
	"os"

	"github.com/jessevdk/go-flags"
)

// Opts is command line options
var Opts struct {
	// Debug mode is used for outputting debug log messages
	Debug bool `short:"d" long:"debug" description:"Show debug information instead of normal output."`

	// MaxPerformance is used to increase coverage at the expense of speed
	MaxPerformance bool `short:"m" long:"max" description:"Run in maximum performance mode, sacrificing speed for coverage."`

	// Plot mode used for outputting visualizations
	Plot bool `short:"p" long:"plot" description:"Show visualizations and plots."`
}

// ParseArgs reads the argv and makes sure there is a valid input file provided.
func ParseArgs() string {
	parser := flags.NewParser(&Opts, flags.Default)
	args, err := parser.Parse()
	if err != nil {
		log.Fatal(err)
	}
	if len(args) < 1 {
		parser.WriteHelp(os.Stdout)
		os.Exit(1)
	}
	inputFilePath := args[0]
	if _, err := os.Stat(inputFilePath); err != nil {
		if os.IsNotExist(err) {
			log.Fatalf("file %s does not exist", inputFilePath)
		}
		log.Fatalf("cannot stat file %s", inputFilePath)
	}
	return inputFilePath
}
