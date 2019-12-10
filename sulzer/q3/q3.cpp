#include <iostream>

#include <algorithm>
#include <sstream>
#include <string>
#include <unordered_map>
#include <vector>

using namespace std;

const int maxLastNameLen = 8;

void toLowercase(string &givenStr) {
  for (char &currentChar : givenStr) {
    if (currentChar >= 'A' && currentChar <= 'Z') {
      currentChar = currentChar - 'A' + 'a';
    }
  }
}

string solution(string &rawNames, string &companyName) {
  string lowercaseComanyName = companyName;
  toLowercase(lowercaseComanyName);
  istringstream nameStream(rawNames);
  string fullName;
  istringstream splitStream;
  string nameSection;
  vector<string> currentName;
  unordered_map<string, int> pastNames;
  stringstream emailBuilder;
  stringstream nameBuilder;
  while (getline(nameStream, fullName, ';')) {
    splitStream.str(fullName);
    while (getline(splitStream, nameSection, ' ')) {
      if (nameSection.length() > 0) {
        toLowercase(nameSection);
        currentName.push_back(nameSection);
      }
    }
    // remove hyphens:
    currentName.back().erase(
        remove(currentName.back().begin(), currentName.back().end(), '-'),
        currentName.back().end());
    // truncate lastname:
    if (currentName.back().length() > maxLastNameLen) {
      currentName.back() = currentName.back().substr(0, maxLastNameLen);
    }
    nameBuilder << currentName.front() << '.' << currentName.back();
    string name = nameBuilder.str();
    emailBuilder << name;
    if (pastNames.find(name) == pastNames.end()) {
      pastNames[name] = 1;
    } else {
      pastNames[name]++;
      emailBuilder << pastNames[name];
    }
    emailBuilder << '@' << lowercaseComanyName << ".com; ";
    splitStream.clear();
    currentName.clear();
    nameBuilder.str("");
    nameBuilder.clear();
  }
  string emails = emailBuilder.str();
  if (emails.length() > 0) {
    emails = emails.substr(0, emails.size() - 2);
  }
  return emails;
}

int main(const int argc, char *const argv[]) {
  string names =
      "John Doe; Peter Benjamin Parker; Mary Jane Watson-Parker; John Elvis "
      "Doe; John Evan Doe; Jane Doe; Peter Brian Parker";
  string companyName = "example";
  cout << solution(names, companyName) << endl;
}
