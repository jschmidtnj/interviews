package main

// func getUsersInRange(satellite *utils.Element, users []*utils.Element, startIndex int) ([]*utils.Element, error) {
// 	if startIndex < 0 || startIndex >= len(users) {
// 		return nil, fmt.Errorf("invalid start index %d provided", startIndex)
// 	}
// 	if len(users) == 0 {

// 	}
// 	currentLeft := startIndex
// 	currentRight := startIndex
// 	startRange := -1
// 	endRange := -1
// 	for startRange < 0 || endRange < 0 {
// 		leftRange := getSatelliteRange(users[currentLeft], satellite)
// 		rightRange := getSatelliteRange(users[currentRight], satellite)
// 		if leftRange < 0 && rightRange < 0 {
// 			break
// 		}
// 		var changeRight bool
// 		if currentRight == len(users) - 1 {
// 			changeRight = true
// 		} else if
// 		if leftRange < 0 {
// 			if currentRight == len(users) - 1 {
// 				break
// 			}
// 			currentRight++
// 		} else if rightRange < 0 {
// 			if currentLeft == 0 {
// 				break
// 			}
// 			currentLeft--
// 		} else if leftRange < rightRange {
// 			rightIndex++
// 		} else {
// 			leftIndex--
// 		}
// 		if leftIndex < 0 {
// 			leftIndex = 0
// 			break
// 		}
// 		if rightIndex == len(users) {
// 			break
// 		}
// 	}

// 	return users[startRange:endRange + 1], nil
// }

// func getUsersInRange(satellite *utils.Element, users []*utils.Element, startIndex int) ([]*utils.Element, error) {
// 	if startIndex < 0 || startIndex >= len(users) {
// 		return nil, fmt.Errorf("invalid start index %d provided", startIndex)
// 	}
// 	sort.Search(startIndex, func (currentIndex int) bool  {
// 		currentRange := getSatelliteRange(users[currentIndex], satellite)
// 		return currentRange > 0
// 	})

// 	return users[leftIndex : rightIndex], nil
// }

// func getSatelliteRange(user *utils.Element, satellite *utils.Element) float64 {
// 	xSatelliteProjection := mat.Norm(satellite.Data.SliceVec(0, 2), 2)
// 	xUserProjection := xSatelliteProjection / math.Cos(maxSatelliteAngle*math.Pi/180)
// 	fmt.Println(xUserProjection - xSatelliteProjection)
// 	return xUserProjection - xSatelliteProjection
// }

// func getInterferenceAngle(user *utils.Element, satellite *utils.Element, interfering *utils.Element) float64 {
// 	// satellite to user vector
// 	satelliteToUser := mat.VecDenseCopyOf(user.Data)
// 	satelliteToUser.SubVec(satellite.Data, user.Data)

// 	interferenceToUser := mat.VecDenseCopyOf(user.Data)
// 	interferenceToUser.SubVec(user.Data, interfering.Data)
// 	angleBetween := utils.AngleBetween(interferenceToUser, satelliteToUser)
// 	// fmt.Println(user.Id, satellite.Id, interfering.Id, angleBetween)
// 	return angleBetween
// }

// type Connection struct {
// 	User      *Element
// 	Satellite *Element
// }

// func buildConnections(supportedUsers []*types.Element, localInterferences []*types.ConnectionPair, )
