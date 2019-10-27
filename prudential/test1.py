#!/bin/python3

import sys

def check_pow_2(num):
    curr_num = num
    while curr_num != 2:
        if curr_num % 2 != 0:
            return False
        curr_num /= 2
    return True

print(check_pow_2(16))

#for line in sys.stdin:
#    print("true" if check_pow_2(int(line)) else "false")
