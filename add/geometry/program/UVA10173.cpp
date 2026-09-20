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
const int N=1e4;
int gi() {
	int w=0;bool q=1;char c=getchar();
	while ((c<'0'||c>'9') && c!='-') c=getchar();
	if (c=='-') q=0,c=getchar();
	while (c>='0'&&c <= '9') w=w*10+c-'0',c=getchar();
	return q? w:-w;
}
const db eps=1e-8;
struct P{
	db x,y;
}p[N],st[N];
inline db mo(const P &p) { return sqrt(p.x*p.x+p.y*p.y); }
inline P operator - (const P &a,const P &b) { return (P){a.x-b.x,a.y-b.y}; }
inline db operator * (const P &a,const P &b) { return a.x*b.y-a.y*b.x; }
inline db dot(const P &a,const P &b) { return a.x*b.x+a.y*b.y; }
inline bool operator < (const P &a,const P &b) {
	if (fabs(a*b)<eps)
		return mo(a)<mo(b);
	return a*b>0;
}
inline db dis(const P &p,const P &a,const P &b) { return (b-a)*(p-a)/mo(b-a); }
inline db proj(const P &p,const P &a,const P &b) { return dot(p-a,b-a)/mo(b-a); }
int main()
{
#ifndef ONLINE_JUDGE
	freopen("UVA10173.in","r",stdin);
	freopen("UVA10173.out","w",stdout);
#endif
	int n,i,k,top,L,R,E;
	db ans;
	while (n=gi()) {
		for (i=1;i<=n;i++) scanf("%lf%lf",&p[i].x,&p[i].y);
		for (i=2,k=1;i<=n;i++) if (p[i].y<p[k].y||(p[i].y==p[k].y&&p[i].x<p[k].x)) k=i;
		swap(p[1],p[k]);
		for (i=n;i;i--) p[i]=p[i]-p[1];
		sort(p+2,p+1+n);
		for (i=2,top=1;i<=n;i++) {
			while (top>1&&(p[i]-st[top-1])*(st[top]-st[top-1])>=0) top--;
			st[++top]=p[i];
		}
		if (top<3) {
			puts("0.0000");
			continue;
		}
		st[0]=st[top];
		L=R=E=0;
		for (i=1;i<top;i++) {
			if (dis(st[i],st[0],st[1])>dis(st[E],st[0],st[1])) E=i;
			if (proj(st[i],st[0],st[1])<proj(st[L],st[0],st[1])) L=i;
			if (proj(st[i],st[0],st[1])>proj(st[R],st[0],st[1])) R=i;
		}
		ans=1e10;
		for (i=0;i<top;i++) {
			while (dis(st[(E+1)%top],st[i],st[i+1])>dis(st[E],st[i],st[i+1])) (++E)%=top;
			while (proj(st[(L+1)%top],st[i],st[i+1])<proj(st[L],st[i],st[i+1])) (++L)%=top;
			while (proj(st[(R+1)%top],st[i],st[i+1])>proj(st[R],st[i],st[i+1])) (++R)%=top;
			ans=min(ans,(proj(st[R],st[i],st[i+1])-proj(st[L],st[i],st[i+1]))*dis(st[E],st[i],st[i+1]));
		}
		printf("%.4lf\n",ans);
	}
	return 0;
}
