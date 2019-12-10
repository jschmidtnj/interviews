/**
 * 
 * Implement a MyCalendarTwo class to store your events. A new event can be added if adding the event will not cause a triple booking.

Your class will have one method, book(int start, int end). Formally, this represents a booking on the half open interval [start, end), the range of real numbers x such that start <= x < end.

A triple booking happens when three events have some non-empty intersection (ie., there is some time that is common to all 3 events.)

For each call to the method MyCalendar.book, return true if the event can be added to the calendar successfully without causing a triple booking. Otherwise, return false and do not add the event to the calendar.
Your class will be called like this: MyCalendar cal = new MyCalendar(); MyCalendar.book(start, end)

Example 1:

MyCalendar();
MyCalendar.book(10, 20); // returns true
MyCalendar.book(50, 60); // returns true
MyCalendar.book(10, 40); // returns true
MyCalendar.book(5, 15); // returns false
MyCalendar.book(5, 10); // returns true
MyCalendar.book(25, 55); // returns true
Explanation: 
The first two events can be booked.  The third event can be double booked.
The fourth event (5, 15) can't be booked, because it would result in a triple booking.
The fifth event (5, 10) can be booked, as it does not use time 10 which is already double booked.
The sixth event (25, 55) can be booked, as the time in [25, 40) will be double booked with the third event;
the time [40, 50) will be single booked, and the time [50, 55) will be double booked with the second event.

 

Note:

    The number of calls to MyCalendar.book per test case will be at most 1000.
    In calls to MyCalendar.book(start, end), start and end are integers in the range [0, 10^9].
*/

// another idea is to sort all bookings and check if there are 3 overlaps in the iteration

#include <list>

#define maxOverlap 2

using namespace std;

class MyCalendarTwo
{
public:
  MyCalendarTwo()
  {
  }

  struct booking
  {
    int start;
    int end;
    int overlaps;
    booking() {};
    booking(int s, int e) : start{s}, end{e}, overlaps{0} {};
    booking(int s, int e, int o) : start{s}, end{e}, overlaps{o} {};
  };

  list<booking> books;

  bool book(int start, int end)
  {
    list<booking>::iterator it;
    if (books.size() > 0)
    {
      for (it = books.begin(); it != books.end(); it++)
        if (start >= it->start)
          break;
      if (it == books.end()) {
        if (start >= it->end)
          books.push_back(booking(start, end));
        else {
          if (it->overlaps + 1 > maxOverlap)
            return false;
          int startoverlap = start;
          int endoverlap = it->end;
          it->end = startoverlap;
          books.push_back(booking(startoverlap, endoverlap, it->overlaps + 1));
          books.push_back(booking(endoverlap, end));
        }
      } else if (it == books.begin()) {
        if (end < it->start)
          books.push_front(booking(start, end));
        else {
          if (it->overlaps + 1 > maxOverlap)
            return false;
          int startoverlap = it->start;
          int endoverlap = end;
          it->start = endoverlap;
          books.push_front(booking(startoverlap, endoverlap, it->overlaps + 1));
          books.push_front(booking(start, startoverlap));
        }
      } else {
        // do something
        // next_iterator = it + 1;
        if (start < it->end) {
          // if (end)
        }
      }
    }
    else
      books.push_back(booking(start, end));
    return true;
  }
};

/**
 * Your MyCalendarTwo object will be instantiated and called as such:
 * MyCalendarTwo* obj = new MyCalendarTwo();
 * bool param_1 = obj->book(start,end);
 */