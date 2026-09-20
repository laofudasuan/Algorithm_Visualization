#include<iostream>
#include<vector>
#include<algorithm>
#include<cstring>
#include<cstdio>
#include<cmath>
#include<cstdlib>
#include<ctime>
#include<queue>
#include<set>
using namespace std;
typedef long long LL;
const int N=21;
int gi() {
	int w=0;bool q=1;char c=getchar();
	while ((c<'0'||c>'9') && c!='-') c=getchar();
	if (c=='-') q=0,c=getchar();
	while (c>='0'&&c <= '9') w=w*10+c-'0',c=getchar();
	return q? w:-w;
}
int main()
{
#ifndef ONLINE_JUDGE
	freopen("poj1654.in","r",stdin);
	freopen("poj1654.out","w",stdout);
#endif
	int T=gi(),x1,y1,x2,y2,w,area;char c;
	while (T--) {
		x1=y1=0;
		area=0;
		while ((c=getchar())!='5')
			if ('1'<=c&&c<='9') {
				w=c-'0';
				x2=x1,y2=y1;
				x2+=w%3==0;
				x2-=w%3==1;
				y2+=w>=7;
				y2-=w<=3;
				area+=x1*y2-x2*y1;
				x1=x2,y1=y2;
			}
		area=abs(area);
		printf("%d",area>>1);
		if (area&1) printf(".5");
		putchar(10);
	}
	return 0;
}
