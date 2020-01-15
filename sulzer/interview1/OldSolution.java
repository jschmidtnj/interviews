package com.codility;

// you can also use imports, for example:
import java.util.*;

// https://play2048.co/

public class OldSolution {
    public static Integer[][] Board = new Integer[4][4];

    public static Integer[] mergeLeft(Integer[] row) {
        int currentAddResultLocation = 0;
        for (int i = 0; i < row.length - 1; i++) {
            if (row[i] != null && row[i] == row[i + 1]) {
                // add and shift
                int newVal = row[i] + row[i + 1];
                row[i] = null;
                row[i + 1] = null;
                row[currentAddResultLocation] = newVal;
                currentAddResultLocation++;
            } else if (row[i] != null) {
                int newVal1 = row[i];
                row[i] = null;
                row[currentAddResultLocation] = newVal1;
                currentAddResultLocation++;
            }
        }
        if (row[row.length - 2] == null) {
            row[row.length - 2] = row[row.length - 1];
            row[row.length - 1] = null;
        }
        return row;
    }

    public static void main(String[] args) {
        Board = new Integer[][]{
            {2, 2, 3, null},
            {4, 2, 2, 4},
            {2, 2, 2, 2},
            {null, 2, null, 2}
        };
        for (Integer[] row : Board) {
            row = mergeLeft(row);
            System.out.println(Arrays.toString(row));
        }
    }
}