# spacex starlink beam planning

## description

The goal of this technical challenge is to create a system for efficiently connecting users to the Starlink satellite network. There are a number of constraints, including the angle between multiple beams from the same satellite, the number of connections per satellite, the angle between non-Starlink and Starlink satellites, the angle between the user and the Starlink satellite, etc. With all of these constraints, some users are unable to get connectivity, but others can depending on the given system.

## implementation

This command-line program is written in golang. I am using version 1.17 with modules, and there are several dependencies. These dependencies are utility functions that are not used in the core functionality, things like getting the norm of a vector or converting between ECEF and latitude and longitude.

The main entry point is `main.go`. You can execute the file directly through `./main.go`, or by running `go run main.go`. The program requires one argument, the path to the input file (test cases). Here is a sample execution:

- `./main.go -h`
- `./main.go ./test_cases/00_example.txt | ./evaluate.py ./test_cases/00_example.txt`

with the binary (build with `make` or `go build`):

- `./starlink -h`
- `./starlink ./test_cases/00_example.txt | ./evaluate.py ./test_cases/00_example.txt`

The source files are split into four folders - `core/`, `enums/`, `types/`, and `utils/`. `core/` contains the main logic - functions for running the allocation algorithm, reading the file and writing to stdout, and logging debugging information. `enums/` contains different enumerations used in the program. `types/` contains different interface objects for storing intermediate data. `utils/` contains standalone functions for calculations and general constants.

## results

The application overall performed well, though it is hard to gauge what percent coverage is possible with larger numbers of users. The basic criteria, that the output passes all of the constraints, is met in every test case. For the simple examples (0 through 4), the program outputs the optimal solution. Test case 5 has `96.70%` coverage (when it should be `100%`), case 6 has `75.92%`, 7 has `74.0%`, 8 has `63.80%`, 9 has `77.32%`, 10 has `70.40%`, and 11 has up to `23.1%`. The low percentage for test 11 makes sense becaus the ratio of satellites to users is much lower than the others, at `1.44%` vs `7.2%` for tests 10 and 9. To achieve the best coverage for all tests, run with the `-m` flag.

The program takes up to 18.802 seconds to run (for the 100,000 user test using the binary, 57.342 seconds in performance), which is good given the lack of additional optimization. The tests were run on a 4 year old xps 15, so your results should be better.  Since the time limit for this challenge is much larger at 15 minutes, I thought to potentially try different combinations of users that have multiple connection options.

To improve the performance, it would help to parallelize testing different satellite and user combinations, especially at the check range / local interference steps. To improve coverage to the theoretical maximum in test case 5, it is necessary to change the color algorithm to run multiple iterations and randomize the input. As graph coloring is NP-complete, it is difficult to reach an optimal solution.
