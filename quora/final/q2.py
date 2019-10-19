#!/bin/python3
"""
You are given two arrays of strings a and b. Some string is said to be a prefix-string if it is a concatenation of some prefix of the array a. Your task is to determine whether all the given strings in b are prefix-strings of a.

Example

For a = ["one", "two", "three"] and b = ["onetwo", "one"], the output should be prefixStrings(a, b) = true.

Since "one" and "two" are the first two elements in a respectively, both of the strings in b are prefix-strings (whereas something like "twoone" would not be).

For a = ["One", "TwoThree", "Four"] and b = ["One", "OneTwo"], the output should be prefixStrings(a, b) = false.

The second string in b is not prefix-string, since it doesn't fully match the concatenated elements of a ("OneTwoThree" would be fine, but "OneTwo" is incomplete).

For a = ["One", "Two", "Three"] and b = ["Two"], the output should be prefixStrings(a, b) = false.

Here is the list of prefix-strings:

"One",
"OneTwo",
"OneTwoThree".
"Two" isn't an option, so return false.
Input/Output

[execution time limit] 4 seconds (py3)

[input] array.string a

An array of strings. It is guaranteed that each its element only consist of English letters and the concatenated length of its elements is not greater than 104.

Guaranteed constraints:
1 ≤ a.length ≤ 104,
1 ≤ a[i].length ≤ 104.

[input] array.string b

An array of strings. It is guaranteed that each its element only consist of English letters.

Guaranteed constraints:
1 ≤ b.length ≤ 104,
1 ≤ b[i].length ≤ 104.

[output] boolean

Return true if every element from b is prefix-string and false otherwise.
"""

def prefixStrings(a, b):
  possible_prefixes = []
  for i in range(0, len(a)):
    prefix_string = "".join(a[:i + 1])
    possible_prefixes.append(prefix_string)
  for elem in b:
    if elem not in possible_prefixes:
      return False
  return True

a = ["a", "c", "b"]
b = ["a", "ac", "acb"]

print(prefixStrings(a, b))
