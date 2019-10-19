#!/bin/python3
"""
Given a rectangular matrix m and an integer k, consider all the k × k contiguous square submatrices of m. Your task is the following:

Calculate the sum of all numbers within each k × k submatrix.
Determine the maximum of all these sums.
Find all the distinct numbers that appear in any of the squares with a sum equal to the maximum. Each integer from these squares should be calculated exactly once. Return the sum of these distinct numbers.
Example

For

m = [[1, 0, 1, 5, 6],
     [3, 3, 0, 3, 3],
     [2, 9, 2, 1, 2],
     [0, 2, 4, 2, 0]]
and k = 2, the output should be bestSquares(m, k) = 29.

example

If we consider all the 2 × 2 squares in m, there are 3 of them with a maximum sum of 17:

[[5, 6],
 [3, 3]]
(5 + 6 + 3 + 3 = 17)

[[3, 3],
 [2, 9]]
(3 + 3 + 2 + 9 = 17)

[[9, 2],
 [2, 4]]
(9 + 2 + 2 + 4 = 17)

Among these 3 squares which each have the maximum sum, only the distinct numbers 2, 3, 4, 5, 6, and 9 appear. So the answer is 2 + 3 + 4 + 5 + 6 + 9 = 29.

Input/Output

[execution time limit] 4 seconds (py3)

[input] array.array.integer m

A rectangular matrix of integers.

Guaranteed constraints:
1 ≤ m.length ≤ 100,
1 ≤ m[i].length ≤ 100,
0 ≤ m[i][j] ≤ 100.

[input] integer k

Guaranteed constraints:
1 ≤ k ≤ min(m.length, m[i].length).

[output] integer

The sum of all distinct integers within the k × k squares with the maximal sum.
"""
def bestSquares(m, size):
    max_sum = 0
    unique_items = []
    for i in range(len(m) - size + 1):
        for j in range(len(m[i]) - size + 1):
            current_vals = []
            for k in range(size):
                for l in range(size):
                    current_vals.append(m[i + k][j + l])
            current_sum = sum(current_vals)
            if current_sum > max_sum or (i == 0 and j == 0):
                max_sum = current_sum
                unique_items = []
            if current_sum == max_sum:
                for item in current_vals:
                  if item not in unique_items:
                    unique_items.append(item)
    return sum(unique_items)

m = [[1, 0, 1, 5, 6],
     [3, 3, 0, 3, 3],
     [2, 9, 2, 1, 2],
     [0, 2, 4, 2, 0]]

print(bestSquares(m, 2))
