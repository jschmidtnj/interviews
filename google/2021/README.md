# google round 1

2 questions, 1 really easy, 1 a little harder

palindrome of array of 2 letter strings. basically needed to get number of pairs of palindromes that are mirrored ("ck" and "kc" for example). then check if there are any remaining pairs when done iterating that have the same letters ("jj"). at the end, return 4 * num_pairs + (2 if found an instance of same_letter else 0)
