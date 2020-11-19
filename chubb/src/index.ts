/**
 * nNumberSort
 * 
 * sorts numbers in O(1) space and O(n) time using counting sort algorithm
 * 
 * @param {number[]} inputArray array of unsorted numbers (arbitrary length)
 * @param {number[]} sortOrder sort number order (in problem is 3 in length)
 * @returns {number[]} sorted array
 */
export const nNumberSort = (inputArray: number[], sortOrder: number[]): number[] => {
  // O(1) space implementation
  // initialize count of numbers (space is size n, if only three numbers, then it's O(1))
  const countMap: Record<number, number> = {};
  for (const elem of sortOrder) {
    if (elem in countMap) {
      throw Error(`number ${elem} duplicated in sort order array`);
    }
    countMap[elem] = 0;
  }
  // O(num_elem) time
  for (const elem of inputArray) {
    if (!(elem in countMap)) {
      throw Error(`given number ${elem} not in sort order array`);
    }
    countMap[elem]++;
  }
  const res = inputArray;
  let startIndex = 0;
  // O(num_elem) time
  for (const elem of sortOrder) {
    for (let j = startIndex; j < startIndex + countMap[elem]; j++) {
      res[j] = elem;
    }
    startIndex = startIndex + countMap[elem];
  }
  return res;
};

if (require.main === module) {
  const inputArray: number[] = [1, 0, -1, 1, 0, -1];
  const sortOrder: number[] = [-1, 1, 0];
  // eslint-disable-next-line no-console
  console.log(nNumberSort(inputArray, sortOrder));
}

export default nNumberSort;
