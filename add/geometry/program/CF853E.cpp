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
#include<map>
#include<stack>
using namespace std;
typedef long long LL;
const int N=2e5;
int gi() {
	int w=0;bool q=1;char c=getchar();
	while ((c<'0'||c>'9') && c!='-') c=getchar();
	if (c=='-') q=0,c=getchar();
	while (c>='0'&&c <= '9') w=w*10+c-'0',c=getchar();
	return q? w:-w;
}
struct P{ int x,y; inline void in() { x=gi(),y=gi(); } };
inline P operator + (const P &a,const P &b) { return (P){a.x+b.x,a.y+b.y}; }
inline P operator - (const P &a,const P &b) { return (P){a.x-b.x,a.y-b.y}; }
inline LL operator * (const P &a,const P &b) { return 1LL*a.x*b.y-1LL*a.y*b.x; }
inline LL dot(const P &a,const P &b) { return 1LL*a.x*b.x+1LL*a.y*b.y; }
inline bool operator < (const P &a,const P &b) { return a*b>0; }
#define ps(x) (upper_bound(c+1,c+cn+1,x)-c-1)
P v[100],p[N],q[N],cur[N];
int w[N],lim[N],c[N];
struct work{
	double a; int x,y,z;
	inline bool operator < (const work &b) const {
		return fabs(a-b.a)<1e-7?z<b.z:a<b.a;
	}
}T[N*3];
LL s[N],ans[N];
inline void add(int k,int x) { for (;k<=1e5;k+=k&-k) s[k]+=x; }
inline LL sum(int k) {
	LL ans=0;
	for (;k;k^=k&-k) ans+=s[k];
	return ans;
}
int main()
{
#ifndef ONLINE_JUDGE
	freopen("CF853E.in","r",stdin);
	freopen("CF853E.out","w",stdout);
#endif
	int n=gi(),m=gi(),Q=gi(),i,j,cn;P all=(P){0,0};
	for (i=1;i<=n;i++) {
		v[i].in();
		if (v[i].x<0||(v[i].x==0&&v[i].y<0)) v[i].x*=-1,v[i].y*=-1;
		all=all+v[i];
	}
	sort(v+1,v+1+n);
	for (i=1;i<=m;i++) p[i].in(),w[i]=gi(),c[i]=p[i].x;
	sort(c+1,c+1+m);cn=unique(c+1,c+1+m)-c-1;
	for (i=1;i<=Q;i++) {
		q[i].in(),cur[i]=q[i],lim[i]=gi();
		q[i].x-=all.x*lim[i],q[i].y-=all.y*lim[i];
		lim[i]<<=1;
	}
	for (i=1;i<=n;i++) {
		if (!v[i].x) {
			for (j=1;j<=Q;j++) q[j].y+=v[i].y*lim[j];
			continue;
		}
		for (j=1;j<=m;j++)
			T[j]=(work){p[j].y-(double)p[j].x*v[i].y/v[i].x,p[j].x,w[j],0};
		for (j=1;j<=Q;j++) {
			T[m+j]=(work){q[j].y-(double)q[j].x*v[i].y/v[i].x,q[j].x,q[j].x+v[i].x*lim[j],-j};
			q[j].x+=v[i].x*lim[j],q[j].y+=v[i].y*lim[j];
		}
		memset(s,0,sizeof(s));
		sort(T+1,T+1+m+Q);
		for (j=1;j<=m+Q;j++)
			if (T[j].z)
				ans[-T[j].z]-=sum(ps(T[j].y))-sum(ps(T[j].x-(i<2)));
			else add(ps(T[j].x),T[j].y);
	}
	for (i=1;i<=n;i++) {
		if (!v[i].x) break;
		for (j=1;j<=m;j++)
			T[j]=(work){p[j].y-(double)p[j].x*v[i].y/v[i].x,p[j].x,w[j],0};
		for (j=1;j<=Q;j++) {
			T[m+j]=(work){q[j].y-(double)q[j].x*v[i].y/v[i].x,q[j].x-v[i].x*lim[j],q[j].x,j};
			q[j].x-=v[i].x*lim[j],q[j].y-=v[i].y*lim[j];
		}
		memset(s,0,sizeof(s));
		sort(T+1,T+1+m+Q);
		for (j=1;j<=m+Q;j++)
			if (T[j].z)
				ans[T[j].z]+=sum(ps(T[j].y-(i>1)))-sum(ps(T[j].x-1));
			else add(ps(T[j].x),T[j].y);
	}
	for (i=1;i<=Q;i++) printf("%I64d\n",ans[i]);
	return 0;
}
