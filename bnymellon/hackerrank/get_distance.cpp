#include <bits/stdc++.h>

#include <cstdlib>
using namespace std;

vector<long> getDistanceMetrics(vector<int> arr) {
  vector<long> res;
  res.reserve(arr.size());
  unordered_map<size_t, vector<size_t>> indexes;
  indexes.reserve(100);
  for (size_t i = 0; i < arr.size(); i++) {
    if (indexes.find(arr[i]) == indexes.end()) {
      indexes[arr[i]] = vector<size_t>();
    }
    indexes[arr[i]].push_back(i);
    res.push_back(0);
  }
  for (const pair<size_t, vector<size_t>>& elem : indexes) {
    for (size_t i = 0; i < elem.second.size(); i++) {
      long current_sum = 0;
      for (size_t j = 0; j < elem.second.size(); j++) {
        current_sum += abs((long)elem.second[i] - (long)elem.second[j]);
      }
      res.at(elem.second[i]) = current_sum;
    }
  }
  return res;
}

int main() {
  vector<int>arr;
  arr.push_back(6);
  arr.push_back(1);
  arr.push_back(2);
  arr.push_back(2);
  arr.push_back(1);
  arr.push_back(5);
  arr.push_back(1);
  vector<long> res = getDistanceMetrics(arr);
  for (size_t i = 0; i < res.size(); i++) {
    cout << res.at(i) << ", ";
  }
  cout << endl;
}
