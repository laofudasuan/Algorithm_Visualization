#include<bits/stdc++.h>
using namespace std;
int main() {
	freopen("tmp.in","w",stdout);
	const int n=50000;
	printf("%d 0\n",n*2);
	for (int i=1;i<=n;i++)
		printf("%d %d\n",-n-1+i,i);
	puts("0 0");
	for (int i=1;i<n;i++)
		printf("%d %.10lf\n",i,sqrt(1LL*n*n-1LL*i*i));
	puts("0");
}
