#include <string>
#include <unordered_map>
#include <iostream>

using namespace std;

int solution(string &A, string &B) {
  unordered_map<char, int> aLetters;
  for (const char & letter : A) {
    if (aLetters.find(letter) == aLetters.end()) {
      aLetters[letter] = 1;
    } else {
      aLetters[letter]++;
    }
  }
  int numUniqueB = 0;
  for (const char & letter : B) {
    if (aLetters.find(letter) != aLetters.end()) {
      if (aLetters[letter] == 1) {
        aLetters.erase(letter);
      } else {
        aLetters[letter]--;
      }
    } else {
      numUniqueB++;
    }
  }
  int numUniqueA = 0;
  for (pair<const char, int> & keyValue : aLetters) {
    numUniqueA += keyValue.second;
  }
  return numUniqueA + numUniqueB;
}

int main(const int argc, char *const argv[]) {
  if (argc < 3) {
    cerr << "problem";
  }
  string data1 = argv[1];
  string data2 = argv[2];
  cout << solution(data1, data2) << endl;
}
