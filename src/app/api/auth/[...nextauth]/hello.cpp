#include <iostream>
using namespace std;

int main() {
    int age;
    cout << "Enter your age: ";
    cin >> age;

    if (age >= 18)
        cout << "You're eligible to vote." << endl;
    else
        cout << "Sorry, you're not eligible to vote." << endl

    return 0;
}