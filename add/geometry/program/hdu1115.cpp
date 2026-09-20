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
typedef double db;
const int N=2e6;
int gi() {
	int w=0;bool q=1;char c=getchar();
	while ((c<'0'||c>'9') && c!='-') c=getchar();
	if (c=='-') q=0,c=getchar();
	while (c>='0'&&c <= '9') w=w*10+c-'0',c=getchar();
	return q? w:-w;
}
struct P{ db x,y; }p[N];
inline P operator + (const P &a,const P &b) { return (P){a.x+b.x,a.y+b.y}; }
//inline P operator - (const P &a,const P &b) { return (P){a.x-b.x,a.y-b.y}; }
inline P operator * (const P &a,const db &b) { return (P){a.x*b,a.y*b}; }
inline P operator / (const P &a,const db &b) { return (P){a.x/b,a.y/b}; }
inline db operator * (const P &a,const P &b) { return a.x*b.y-a.y*b.x; }
int main()
{
#ifndef ONLINE_JUDGE
	freopen("hdu1115.in","r",stdin);
	freopen("hdu1115.out","w",stdout);
#endif
	int T=gi(),i,n;
	db area;P C;
	while (T--) {
		n=gi();
		for (i=0;i<n;i++) p[i].x=gi(),p[i].y=gi();
		p[n]=p[0];area=0;
		C=(P){0,0};
		for (i=0;i<n;i++) {
			C=C+(p[i]+p[i+1])*(p[i]*p[i+1]);
			area+=p[i]*p[i+1];
		}
		C=C/area/3;
		printf("%.2lf %.2lf\n",C.x,C.y);
	}
	return 0;
}
