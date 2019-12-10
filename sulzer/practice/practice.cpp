#include <unordered_set>
#include <vector>
#include <iostream>

using namespace std;

int solution(vector<int> &A) {
  int smallestNum = 1;
  unordered_set<int> data;
  data.reserve(A.size());
  for (int & curr : A) {
    data.insert(curr);
  }
  while(data.find(smallestNum) != data.end()) {
    smallestNum++;
  }
  return smallestNum;
}

int main(const int argc, char *const argv[]) {
  vector<int> given = {1, 2, 3, 4};
  cout << solution(given) << endl;
}
