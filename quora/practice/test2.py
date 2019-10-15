"""
You are given an array of integers a. A new array b is generated by rearranging the elements of a in the following way:

b[0] is equal to a[0];
b[1] is equal to the last element of a;
b[2] is equal to a[1];
b[3] is equal to the second-last element of a;
and so on.
Your task is to determine whether the new array b is sorted in strictly ascending order or not.

Example

For a = [1, 3, 5, 6, 4, 2], the output should be alternatingSort(a) = true.

The new array b will look like [1, 2, 3, 4, 5, 6], which is in strictly ascending order, so the answer is true.

For a = [1, 4, 5, 6, 3], the output should be alternatingSort(a) = false.

The new array b will look like [1, 3, 4, 6, 5], which is not in strictly ascending order, so the answer is false.

Input/Output

[execution time limit] 4 seconds (py3)

[input] array.integer a

The given array of integers.

Guaranteed constraints:
1 ≤ a.length ≤ 105,
-109 ≤ a[i] ≤ 109.

[output] boolean

A boolean representing whether the new array b will be sorted in strictly ascending order or not.
"""

import math

def alternatingSort(a):
    if len(a) < 2:
       return True
    last_num = None
    for i in range(math.floor(len(a) / 2)):
        if a[i] >= a[len(a) - i - 1] or last_num == a[i]:
            return False
        last_num = a[len(a) - i - 1]
    if len(a) % 2 != 0 and a[math.floor(len(a) / 2)] <= a[math.floor(len(a) / 2) + 1]:
        return False
    elif len(a) % 2 == 1 and a[math.floor(len(a) / 2)] <= a[math.floor(len(a) / 2) + 1]:
        return False
    return True

print(alternatingSort([1, 4, 5, 6, 3]))
# print(alternatingSort([-52, 2, 31, 56, 47, 29, -35]))
# print(alternatingSort([-92, -23, 0, 45, 89, 96, 99, 95, 89, 41, -17, -48]))
