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
const int N=40;
int gi() {
	int w=0;bool q=1;char c=getchar();
	while ((c<'0'||c>'9') && c!='-') c=getchar();
	if (c=='-') q=0,c=getchar();
	while (c>='0'&&c <= '9') w=w*10+c-'0',c=getchar();
	return q? w:-w;
}
const double eps=1e-8;
struct P{ double x,y; inline void in() { scanf("%lf%lf",&x,&y); } };
inline int dcmp(double x) { return (x>eps)-(x<-eps); }
inline P operator - (const P &a,const P &b) { return (P){a.x-b.x,a.y-b.y}; }
inline double operator * (const P &a,const P &b) { return a.x*b.y-a.y*b.x; }
struct line{ P a,b; }L[N];
inline bool cross(const line &a,const line &b) {
	return dcmp((a.a-b.a)*(b.b-b.a))*dcmp((a.b-b.a)*(b.b-b.a))<0&&dcmp((b.a-a.a)*(a.b-a.a))*dcmp((b.b-a.a)*(a.b-a.a))<0;
}
int main()
{
#ifndef ONLINE_JUDGE
	freopen("poj1066.in","r",stdin);
	freopen("poj1066.out","w",stdout);
#endif
	int n=gi(),i,j,c,ans=n;P S;line l;
	for (i=0;i<n;i++)
		L[i].a.in(),L[i].b.in();
	S.in();
	for (i=0;i<n<<1;i++) {
		l.a=S;
		l.b=i&1?L[i>>1].a:L[i>>1].b;
		c=0;
		for (j=0;j<n;j++)
			c+=cross(L[j],l);
		ans=min(ans,c);
	}
	printf("Number of doors = %d\n",ans+1);
	return 0;
}
