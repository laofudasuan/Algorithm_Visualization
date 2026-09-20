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
const int N=1e5+100,M=8e5+100;
int gi() {
	int w=0;bool q=1;char c=getchar();
	while ((c<'0'||c>'9') && c!='-') c=getchar();
	if (c=='-') q=0,c=getchar();
	while (c>='0'&&c <= '9') w=w*10+c-'0',c=getchar();
	return q? w:-w;
}
struct P{ int x,y; inline db mo() { return sqrt(x*x+y*y); } };
inline bool operator < (const P &a,const P &b) { return a.x==b.x?a.y<b.y:a.x<b.x; }
inline P operator - (const P &a,const P &b) { return (P){a.x-b.x,a.y-b.y}; }
inline int operator * (const P &a,const P &b) { return a.x*b.y-a.y*b.x; }

struct P3{ LL x,y,z; inline void operator = (const P &b) { x=b.x,y=b.y,z=b.x*b.x+b.y*b.y; } };
inline P3 operator - (const P3 &a,const P3 &b) { return (P3){a.x-b.x,a.y-b.y,a.z-b.z}; }
inline P3 operator * (const P3 &a,const P3 &b) { return (P3){a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x}; }
inline LL dot(const P3 &a,const P3 &b) { return a.x*b.x+a.y*b.y+a.z*b.z;  }

inline bool incircle(const P &a,const P &b,const P &c,const P &d) {
	P3 A,B,C,D;A=a,B=b,C=c,D=d;
	if ((b-a)*(c-a)<0) swap(B,C);
	return dot((B-A)*(C-A),D-A)<0;
}

int ls[M],rs[M],to[M],ST[M],TOP,st[N],n;
P p[N];pair<P,int>q[N];
inline void add(int a,int b,int A=0,int B=0) {
	if (!A) A=a;if (!B) B=b;
	int k=ST[--TOP];
	to[k]=b,ls[k]=ls[A],rs[k]=A;
	ls[A]=rs[ls[A]]=k;
	k^=1;
	to[k]=a,rs[k]=rs[B],ls[k]=B;
	rs[B]=ls[rs[B]]=k;
}
inline void pop(int k) {
	ls[rs[k]]=ls[k];rs[ls[k]]=rs[k];
	ls[rs[k^1]]=ls[k^1];rs[ls[k^1]]=rs[k^1];
	ST[TOP++]=k;
}
inline int lc(int k) { return (k=ls[k])<=n?ls[k]:k; }
inline int rc(int k) { return (k=rs[k])<=n?rs[k]:k; }
inline void solve(int l,int r) {
	if (l+1==r)
		add(l,r);
	else if (l+2==r)
		if ((p[r]-p[l])*(p[l+1]-p[l])<0)
			add(l,r),add(l,l+1),add(r-1,r);
		else if ((p[r]-p[l])*(p[l+1]-p[l]))
			add(l,l+1),add(r-1,r),add(l,r);
		else add(l,l+1),add(r-1,r);
	else {
		int i,top=0,a,b,mid=(l+r)>>1,A,AA,B,BB;
		solve(l,mid);solve(mid+1,r);
		for (i=l;i<=r;st[++top]=i++)
			while (top>1&&(p[i]-p[st[top-1]])*(p[st[top]]-p[st[top-1]])>0) top--;
		for (i=2;i<=top;i++) if (st[i]>mid) { a=st[i-1]; b=st[i]; break; }
		add(a,b);
		while (1) {
			A=ST[TOP];B=ST[TOP]^1;
			while (1) {
				AA=lc(A);
				if ((p[to[AA]]-p[a])*(p[b]-p[a])>=0) { AA=0; break; }
				i=lc(AA);
				if (i==A||!incircle(p[a],p[b],p[to[AA]],p[to[i]])) break;
				pop(AA);
			}
			while (1) {
				BB=rc(B);
				if ((p[to[BB]]-p[b])*(p[a]-p[b])<=0) { BB=0; break; }
				i=rc(BB);
				if (i==B||!incircle(p[a],p[b],p[to[BB]],p[to[i]])) break;
				pop(BB);
			}
			if (AA&&(!BB||!incircle(p[a],p[b],p[to[AA]],p[to[BB]]))) add(a=to[AA],b,AA^1,B);
			else if (BB) add(a,b=to[BB],A,BB^1);
			else break;
		}
	}
}

struct E{ int u,v; db w; inline bool operator < (const E &b) const { return w<b.w; } }e[M];
int dep[N],fa[N],G[N];db T[N];inline int find(int x) { return fa[x]==x?x:fa[x]=find(fa[x]); }
inline int Find(int k) {
	int t=fa[k];
	if (fa[t]==t) return t;
	Find(t);
	T[k]=max(T[k],T[t]);
	return fa[k]=fa[t];
}
int head[N],next[N<<1];db w[N<<1];
int u[N],v[N],lca[N];vector<int>Q[N];db ans[N];
int sa[N],bug[N];
inline void dfs1(int k) {
	fa[k]=k;
	for (vector<int>::iterator it=Q[k].begin();it!=Q[k].end();it++)
		if (fa[k^u[*it]^v[*it]])
			lca[*it]=find(k^u[*it]^v[*it]);
	for (int i=head[k];i;i=next[i])
		if (!fa[to[i]]) {
			dep[to[i]]=dep[k]+1;
			dfs1(to[i]);
			fa[to[i]]=G[to[i]]=k;
			T[to[i]]=w[i];
		}
}
int main()
{
#ifndef ONLINE_JUDGE
	freopen("sgu383.in","r",stdin);
	freopen("sgu383.out","w",stdout);
#endif
	int i,k,m=0,tot=0,t;
	for (i=((n=gi())|1)+1;i<=n*8;i+=2) ST[TOP++]=i;
	for (i=1;i<=n;i++) {
		q[i].first.x=gi(),q[i].first.y=gi(),q[i].second=i;
		ls[i]=rs[i]=i;
	}
	sort(q+1,q+1+n);
	for (i=1;i<=n;i++) p[i]=q[i].first;
	solve(1,n);
	for (k=1;k<=n;k++)
		for (i=rs[k];i!=k;i=rs[i])
			if (k<to[i])
				e[++m]=(E){q[to[i]].second,q[k].second,(p[to[i]]-p[k]).mo()};
	sort(e+1,e+1+m);
	for (i=1;i<=n;i++) fa[i]=i;
	for (i=1;i<=m;i++) if (find(e[i].u)!=find(e[i].v)) {
			fa[find(e[i].u)]=e[i].v;
			to[++tot]=e[i].v,next[tot]=head[e[i].u],head[e[i].u]=tot;
			to[++tot]=e[i].u,next[tot]=head[e[i].v],head[e[i].v]=tot;
			w[tot]=w[tot-1]=e[i].w;
		}
	if (tot!=(n-1)*2)
		while (1) fprintf(stderr,"²»Á¬Í¨");
	m=gi();
	for (i=1;i<=m;i++)
		Q[u[i]=gi()].push_back(i),Q[v[i]=gi()].push_back(i);
	for (i=1;i<=n;i++) fa[i]=0;
	dfs1(1);
	for (i=1;i<=n;i++) fa[i]=i;
	for (i=1;i<=m;i++) bug[dep[lca[i]]]++;
	for (i=1;i<n;i++) bug[i]+=bug[i-1];
	for (i=1;i<=m;i++) sa[bug[dep[lca[i]]]--]=i;
	for (t=m;t;t--) {
		i=sa[t];
		if (u[i]!=lca[i]) {
			for (k=u[i];Find(k)!=lca[i];)
				fa[fa[k]]=G[fa[k]];
			ans[i]=max(ans[i],T[k]);
		}
		if (v[i]!=lca[i]) {
			for (k=v[i];Find(k)!=lca[i];)
				fa[fa[k]]=G[fa[k]];
			ans[i]=max(ans[i],T[k]);
		}
	}
	for (i=1;i<=m;i++)
		printf("%.10lf\n",ans[i]);
	return 0;
}
