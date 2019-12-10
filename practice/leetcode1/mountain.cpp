/**
 * 
 * Given an array A of integers, return true if and only if it is a valid mountain array.

Recall that A is a mountain array if and only if:

    A.length >= 3
    There exists some i with 0 < i < A.length - 1 such that:
        A[0] < A[1] < ... A[i-1] < A[i]
        A[i] > A[i+1] > ... > A[A.length - 1]


 

Example 1:

Input: [2,1]
Output: false

Example 2:

Input: [3,5,5]
Output: false

Example 3:

Input: [0,3,2,1]
Output: true

 

Note:

    0 <= A.length <= 10000
    0 <= A[i] <= 10000 

*/

#include <vector>

using namespace std;

class Solution {
public:
    bool validMountainArray(vector<int>& A) {
        if (A.size() < 3)
            return false;
        bool reverse = false;
        for (unsigned long i = 1; i < A.size(); i++) {
            if (A[i-1] == A[i])
                return false;
            if (!reverse)
                if (A[i-1] < A[i])
                    continue;
                else if (i > 1)
                    reverse = true;
                else
                    return false;
            else if (A[i-1] > A[i])
                continue;
            else
                return false;
        }
        if (!reverse) return false;
        return true;
    }
};