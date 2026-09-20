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
typedef double db;
const int N=2e5;
int gi() {
	int w=0;bool q=1;char c=getchar();
	while ((c<'0'||c>'9') && c!='-') c=getchar();
	if (c=='-') q=0,c=getchar();
	while (c>='0'&&c <= '9') w=w*10+c-'0',c=getchar();
	return q? w:-w;
}
const db eps=1e-8;
int n,tot;
LL A[N],B[N],C[N],D[N];
struct P{ db x,y,z; }p[N];
inline P operator - (const P &a,const P &b) { return (P){a.x-b.x,a.y-b.y,a.z-b.z}; }
inline P operator * (const P &a,const P &b) { return (P){a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x}; }
inline db dot(const P &a,const P &b) { return a.x*b.x+a.y*b.y+a.z*b.z; }
inline db V(const P &a,const P &b,const P &c,const P &d) { return dot(d-a,(b-a)*(c-a)); }
set< pair<int,int> >s;
int face[N][3],G[N];
inline void wrap(int a,int b) {
	if (s.count(make_pair(a,b))) return;
	int c=0,i;
	for (i=1;i<=n;i++)
		if (i!=a&&i!=b&&(!c||V(p[a],p[b],p[c],p[i])>0))
			c=i;
	s.insert(make_pair(a,b));
	s.insert(make_pair(b,c));
	s.insert(make_pair(c,a));
	face[++tot][0]=a,face[tot][1]=b,face[tot][2]=c;
	wrap(c,b);
	wrap(a,c);
}
int main()
{
#ifndef ONLINE_JUDGE
	freopen("uoj44.in","r",stdin);
	freopen("uoj44.out","w",stdout);
#endif
	n=gi();int i,m,a,b,c,d;db s,mx;P t;
	for (i=1;i<=n;i++) {
		a=A[i]=gi(),b=B[i]=gi(),c=C[i]=gi();
		s=a+b+c+(D[i]=gi());
		p[i]=(P){a/s,b/s,c/s};
	}
	for (i=2,a=1;i<=n;i++) if (p[i].x<p[a].x) a=i;
	for (i=1,mx=-1e10;i<=n;i++) if (i!=a&&(s=atan2(p[i].y-p[a].y,p[i].x-p[a].x))>mx) mx=s,b=i;
	wrap(a,b);
	for (i=1,n=0;i<=tot;i++) G[++n]=face[i][0],G[++n]=face[i][1],G[++n]=face[i][2];
	sort(G+1,G+1+n);
	n=unique(G+1,G+1+n)-G-1;
	for (m=gi();m--;)
		if (gi()==1) {
			a=gi(),b=gi(),c=gi();
			s=a+b+c+gi();
			t=(P){a/s,b/s,c/s};
			for (i=1;i<=tot;i++)
				if (V(p[face[i][0]],p[face[i][1]],p[face[i][2]],t)>eps)
					break;
			puts(i<=tot?"N":"Y");
		} else {
			a=gi(),b=gi(),c=gi(),d=gi();
			for (i=1;i<=n;i++)
				if (a*A[G[i]]+b*B[G[i]]+c*C[G[i]]+d*D[G[i]]>=0) break;
			puts(i<=n?"Y":"N");
		}
	return 0;
}
