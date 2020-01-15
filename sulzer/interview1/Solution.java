// package com.codility;

// you can also use imports, for example:
import java.util.*;

// https://play2048.co/

public class Solution {
    public static Integer[][] Board = new Integer[4][4];

    public static Integer[] mergeLeft(Integer[] row) {
        if (row.length <= 1) {
          throw new IllegalArgumentException("row must have length greater than 1");
        }
        Queue<Integer> onlyDefined = new LinkedList<Integer>();
        for (int i = 0; i < row.length; i++) {
          if (row[i] != null) {
            onlyDefined.add(row[i]);
          }
        }
        Queue<Integer> addedPairs = new LinkedList<Integer>();
        Integer lastElem = onlyDefined.peek();
        onlyDefined.remove();
        while (onlyDefined.size() > 0) {
          Integer currentElem = onlyDefined.peek();
          if (lastElem == currentElem) {
            addedPairs.add(lastElem + currentElem);
            lastElem = null;
          } else {
            if (lastElem != null) {
              addedPairs.add(lastElem);
            }
            lastElem = currentElem;
          }
          onlyDefined.remove();
        }
        if (lastElem != null) {
          addedPairs.add(lastElem);
        }
        for (int i = 0; i < row.length; i++) {
          if (addedPairs.size() > 0) {
            row[i] = addedPairs.peek();
            addedPairs.remove();
          } else {
            row[i] = null;
          }
        }
        return row;
    }

    public static void main(String[] args) {
        Board = new Integer[][]{
            {2, 2, 1, 3},
            {4, 2, 2, 2},
            {2, 2, 2, 2},
            {null, 2, null, 2}
        };
        for (Integer[] row : Board) {
            row = mergeLeft(row);
            System.out.println(Arrays.toString(row));
        }
    }
}