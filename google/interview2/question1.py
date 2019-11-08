#!/bin/python3.7

# can go right x_dim times
# can go down y_dim times

def num_paths_recurse(x_dim, y_dim):
  if x_dim < 0 or y_dim < 0:
    return 0
  if x_dim == 1 and y_dim == 1:
    return 1
  num_paths = 0
  if x_dim > 1:
    num_paths += num_paths_recurse(x_dim - 1, y_dim)
  if y_dim > 1:
    num_paths += num_paths_recurse(x_dim, y_dim - 1)
  return num_paths

#1, 1
#num_paths = recurse(0, 1)
#  -> recurse(0, 0)
#recurse(1, 0)
#-> recurse(0, 0)

#1, 1
#num_paths = 1

#1, 2
#x: returns 0
#y:
#num_paths += recurse(1, 1)
#  -> += 1
#=> 1 path
#X
#X




#1 2 X  1 X X  1 2 3  1 2 X  1 X X
#X 3 4  2 X X  X X 4  X 3 X  2 3 4
#X X 5  3 4 5  X X 5  X 4 5  X X 5  3 x 3 = 6

#1 X  1 2 -> 2x2 = 2
#2 3  X 3


#X X … H ->
#X X … |

def num_paths_dyn_helper(x_dim, y_dim, store):
  if x_dim == 1 and y_dim == 1:
    return 1
  current_key = str(x_dim) + "-" + str(y_dim)
  if current_key in store.keys():
    return store[current_key]
  num_paths = 0
  if x_dim > 1:
    num_paths += num_paths_dyn_helper(x_dim - 1, y_dim, store)
  if y_dim > 1:
    num_paths += num_paths_dyn_helper(x_dim, y_dim - 1, store)
  store[current_key] = num_paths
  return num_paths

def num_paths_dyn(x_dim, y_dim):
  if x_dim < 0 or y_dim < 0:
    return 0
  return num_paths_dyn_helper(x_dim, y_dim, {})


def seed_method(x_dim, y_dim):
  if x_dim < 0 or y_dim < 0:
    return 0
  store = []
  for x in range(0, x_dim):
    store.append([])
    for y in range(0, y_dim):
      if x > 0 and y > 0:
        store[x].append(store[x-1][y] + store[x][y - 1])
      elif y == 0 and x != 0:
        store[x].append(store[x - 1][0])
      elif x == 0 and y != 0:
        store[0].append(store[0][y - 1])
      elif x == 0 and y == 0:
        store[0].append(1)
  # print(store)
  return store[-1][-1]

#1 x … x x x
#x x … x H x

print(seed_method(10, 10))
