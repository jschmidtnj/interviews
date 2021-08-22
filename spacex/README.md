# spacex starlink beam planning

## description

The goal of this technical challenge is to create a system for efficiently connecting users to the Starlink satellite network. There are a number of constraints, including the angle between multiple beams from the same satellite, the number of connections per satellite, the angle between non-Starlink and Starlink satellites, the angle between the user and the Starlink satellite, etc. With all of these constraints, some users are unable to get connectivity, but others are depending on the given system.

## implementation

This command-line program is written in golang. I was thinking about writing it in python, but decided to use go because I didn't write in it in a while. I am using version 1.17 with modules, and there are several dependencies used for convenience. These dependencies are utility functions that are not used in the core functionality, things like getting the norm of a vector or converting between ECEF and latitude and longitude.

The main entry point is `main.go`. You can execute the file directly through `./main.go`, or by running `go run main.go`. The program requires one argument, the path to the input file (test cases). Here is an sample execution (with the test cases in the same level):

`./main.go ./test_cases/00_example.txt | ./evaluate.py ./test_cases/00_example.txt`

The source files are split into four folders - `core/`, `enums/`, `types/`, and `utils/`. `core/` contains the main logic - functions for running the allocation algorithm, reading the file and writing to stdout, and logging debugging information. `enums/` contains different enumerations used in the program. `types/` contains different interface objects for storing intermediate data. `utils/` contains standalone functions for calculations and general constants.

## results

The application overall performed well, though it is hard to gauge what percent coverage is possible with larger numbers of users. The basic criteria, that the output passes all of the constraints, is met in every test case. For the simple examples (00 through 04), the program outputs the optimal solution. Test case 5 has `49.5%` coverage, case 6 has `42.76%`, 7 has `41.32%`, 9 has `40.43%`, 10 has `40.28%`, and 11 has a dismal `7.716%`. The low percentage for test 11 makes sense becaus the ratio of satellites to users is much lower than the others, at `1.44%` vs `7.2%` for tests 10 and 9.

The program takes up to 1.55 seconds to run (for the 100,000 user test, after creating a binary with `go build`), which is excellent given the lack of additional optimization. Since the time limit for this challenge is much larger at 15 minutes, I thought to potentially try different combinations of users that have multiple connection options. This would however complicate the original approach, and since it was unclear what the upper-bound is for overall performance, it is hard to judge whether that change is worth it. In the end I decided against adding it.
