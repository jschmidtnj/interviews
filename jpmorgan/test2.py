#!/bin/python3

import sys

def check_valid_paren(the_str):
    '''
    check_valid_paren checks if the order
    of parenthesis is valid in the given string
    '''
    # the stack is of opening characters
    the_stack = []
    opening_chars = ['(', '{', '[']
    closing_chars = [')', '}', ']']
    for curr_char in the_str:
        if curr_char == '\n':
            # if end of string or nothing in string
            # default to true
            break
        if curr_char in opening_chars:
            # add to stack if it's an opening character
            the_stack.append(curr_char)
        else:
            # find and remove opening character from the
            # stack. only remove if passing below cases
            if len(the_stack) == 0:
                return False
            char_index = closing_chars.index(curr_char)
            if char_index < 0:
                return False
            if the_stack[-1] != opening_chars[char_index]:
                return False
            del the_stack[-1]
    return True

if __name__ == "__main__":
    for line in sys.stdin:
        print(check_valid_paren(line))
