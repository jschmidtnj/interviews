import sys

def sum_square_digits(num):
    '''
    sums the squares of the digits of a number
    '''
    res = 0
    curr_num = num
    while curr_num != 0:
        curr_digit = curr_num % 10
        res += curr_digit ** 2
        curr_num = curr_num // 10
    return res
    

def check_happy(num):
    '''
    checks if a number is a happy number
    '''
    if num < 1:
        return 0
    curr_num = num
    visited_nums = []
    while curr_num != 1:
        curr_num = sum_square_digits(curr_num)
        # checks for cycles
        if curr_num in visited_nums:
            return 0
        else:
            visited_nums.append(curr_num)
    return 1

if __name__ == "__main__":
    for line in sys.stdin:
        print(check_happy(int(line)))
