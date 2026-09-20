#include<iostream>
using namespace std;
int main() {
	int s=0;
	while (1) {
		system("make.exe");
		system("sgu383.exe");system("2.exe");
		if (system("fc sgu383.out 2.out")) break;
		cout<<++s<<endl;
	}
}
