#!/bin/python3.7

#Separate the colors
#You are given a string made of solely of “b”’s and “r”’s. The goal is to modify the string such that it no longer contains the substring ‘br’. You do this by iteratively changing a ‘br’ into a ‘rb’. Return the number of iterations necessary to fully transform the input string.

#Input: "rbbrbr" → “rbbrrb” →  “rbrbrb" → "rbrrbb" → "rrbrbb" → “rrrbbb” ⇒ 5

#remove_br(“rbbrbr”)
#-> 2 + remove_br(“rbrbrb”)
#  -> + ... + ...

def remove_br(the_str):
  # base case is if there is no br in the string
  # first swap => the_str = rbrbbr
  num_swaps = 0
  for i in range(len(the_str) - 1):
    if the_str[i:i+2] == "br":
      the_str = the_str[:i] + "rb" + the_str[i + 2:]
      num_swaps += 1
  if num_swaps == 0:
    return 0
  return num_swaps + remove_br(the_str)


def remove_br_iterative(the_str):
  has_swap = True
  num_swaps = 0
  while has_swap:
    has_swap = False
    for i in range(len(the_str) - 1):
      if the_str[i:i+2] == "br":
        the_str = the_str[:i] + "rb" + the_str[i + 2:]
        num_swaps += 1
        has_swap = True
  return num_swaps

#“brbbrr”
#curr_str = “rbbrb”, num_swaps = 2
#curr_str = “rbrbb”, num_swaps = 3
#curr_str = “rrbbb”, num_swaps = 4
#-> 4

def remove_br_fast(the_str):
  num_swaps = 0
  b_count = 0
  for curr_char in the_str:
    if curr_char == 'b':
      b_count += 1
    else:
      num_swaps += b_count
  return num_swaps

print(remove_br_fast("rbbrrbbrb"))
