#!/bin/python3.7

"""
Question 1:

You are given a binary tree whose nodes contain a data value of either 0 or 1.  E.g.

                                 0
                                /  \
                               1    0
                              / \   / \
                             1   0 1   1

Find the length (number of nodes) of the longest vertical path of all 1's.  In the example tree above, the longest vertical path of all 1's would have length 2.  The following example would have a longest vertical path length of 1:
                                 1
                                /  \
                               0    0
                              / \   / \
                             1   0 1   1

findMaxPath(root, 0, 0)
--> current_len = 0, current_max = 0
   --> max(findMaxPath(second node left, current_len = 1, current_max = 0), findMaxPath(second node right, current_len = 1, current_max = 0))
       --> max(findMaxPath(None, current_len = 2, current_max = 0), findMaxPath(None, current_len = 2, current_max = 0))
	    --> return 2
"""

class Node: 
  def __init__(self, val, left, right): 
    self.left = left
    self.right = right
    self.data = val

def findMaxPath(current_node, current_len, current_max):
  if current_len > current_max:
    current_max = current_len
  if current_node == None:
    return current_max
  if current_node.data == 1:
    return max(findMaxPath(current_node.left, current_len + 1, current_max), findMaxPath(current_node.right, current_len + 1, current_max))
  return max(findMaxPath(current_node.left, 0, current_max), findMaxPath(current_node.right, 0, current_max))

print(findMaxPath(Node(1, Node(0, Node(1, None, None), None), Node(0, None, None)), 0, 0))
print(findMaxPath(Node(1, Node(1, Node(1, None, None), None), Node(0, None, None)), 0, 0))
print(findMaxPath(Node(1, None, None), 0, 0))
