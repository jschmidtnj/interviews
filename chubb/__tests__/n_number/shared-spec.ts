import { nNumberSort } from '../../src/index';

test('Test number sort (counting sort)', () => {
  const out1 = nNumberSort([], []);
  expect(out1).toEqual([]);
  const out2 = nNumberSort(
    [-1, 1, 0, 0, 1, -1, 0, 1, -1],
    [-1, 0, 1]
  );
  expect(out2).toEqual([-1, -1, -1, 0, 0, 0, 1, 1, 1]);
  const out3 = nNumberSort(
    [-1, 0, 0, 1, 1, -1, 0, 1, -1],
    [1, -1, 0]
  );
  expect(out3).toEqual([1, 1, 1, -1, -1, -1, 0, 0, 0]);
  const out4 = nNumberSort(
    [0, 1, 0, 0, 0, -1, 0, 1, 1],
    [1, 0, -1]
  );
  expect(out4).toEqual([1, 1, 1, 0, 0, 0, 0, 0, -1]);
  const out5 = nNumberSort(
    [1, 1, 0, 0, 1, 0, 0, 1, -1],
    [-1, 1, 0]
  );
  expect(out5).toEqual([-1, 1, 1, 1, 1, 0, 0, 0, 0]);
});
