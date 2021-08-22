package utils

// Epsilon is a number close to 0.
const Epsilon = 1e-8

// Debug mode is used for outputting debug log messages
const Debug = false

// MaxConnectionsPerSatellite is the max number of connections allowed
// per starlink satellite.
const MaxConnectionsPerSatellite = 32

// MaxSatelliteAngle is the maximum allowed angle between a user and a satellite.
var MaxSatelliteAngle = DegreesToRadians(45)

// MaxInterferenceAngle is the maximum angle in which there will be interference
// with another satellite.
var MaxInterferenceAngle = DegreesToRadians(20)

// MaxLocalInterferenceAngle is the maximum angle in which there will be
// interference with the same satellite.
var MaxLocalInterferenceAngle = DegreesToRadians(10)
