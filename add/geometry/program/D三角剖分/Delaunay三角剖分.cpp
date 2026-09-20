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
#include<bitset>
#include<stack>

using namespace std;

typedef long long LL;
typedef double lod;
typedef unsigned int u32;

const int N=1e5+100,M=N*8;

int gi() {
	int w=0;bool q=1;char c=getchar();
	while ((c<'0'||c>'9') && c!='-') c=getchar();
	if (c=='-') q=0,c=getchar();
	while (c>='0'&&c <= '9') w=w*10+c-'0',c=getchar();
	return q? w:-w;
}

struct P{ int x,y; inline lod mo() { return sqrt(1LL*x*x+1LL*y*y); } }p[N];
inline bool operator < (const P &a,const P &b) { return a.x==b.x?a.y<b.y:a.x<b.x; }
inline P operator + (const P &a,const P &b) { return (P){a.x+b.x,a.y+b.y}; }
inline P operator - (const P &a,const P &b) { return (P){a.x-b.x,a.y-b.y}; }
inline LL operator * (const P &a,const P &b) { return 1LL*a.x*b.y-1LL*a.y*b.x; }
inline LL dot(const P &a,const P &b) { return 1LL*a.x*b.x+1LL*a.y*b.y; }

struct P3{ lod x,y,z; };
inline P3 trans(const P &p) { return (P3){p.x,p.y,dot(p,p)}; }
inline P3 operator - (const P3 &a,const P3 &b) { return (P3){a.x-b.x,a.y-b.y,a.z-b.z}; }
inline P3 operator * (const P3 &a,const P3 &b) { return (P3){a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x}; }
inline lod dot(const P3 &a,const P3 &b) { return a.x*b.x+a.y*b.y+a.z*b.z; }
inline bool incircle(const P &a,const P &b,const P &c,const P &d) {
	P3 A=trans(a),B=trans(b),C=trans(c),D=trans(d);
	if ((b-a)*(c-a)<0) swap(B,C);
	return dot((B-A)*(C-A),D-A)<0;
}

pair<P,int>q[N];
int st[N],n;
int ls[M],rs[M],to[M],ST[M],TOP;

inline void link(int a,int b,int A=0,int B=0) {
	if (!A) A=a;if (!B) B=b;
	int cur=ST[--TOP];
	to[cur^1]=b,ls[cur^1]=ls[A],rs[cur^1]=A;
	ls[A]=rs[ls[A]]=cur^1;
	to[cur]=a,rs[cur]=rs[B],ls[cur]=B;
	rs[B]=ls[rs[B]]=cur;
}
inline void pop(int k) {
	rs[ls[k]]=rs[k];
	ls[rs[k]]=ls[k];
	rs[ls[k^1]]=rs[k^1];
	ls[rs[k^1]]=ls[k^1];
	ST[TOP++]=k;
}
inline int lc(int k) { return (k=ls[k])<=n?ls[k]:k; }
inline int rc(int k) { return (k=rs[k])<=n?rs[k]:k; }

inline void build(int l,int r) {
	if (l+1==r)
		link(l,r);
	else if (l+2==r)
		if ((p[r]-p[l])*(p[r-1]-p[l])>0)
			link(l,l+1),link(r-1,r),link(l,r);
		else if ((p[r]-p[l])*(p[r-1]-p[l]))
			link(l,r),link(l,l+1),link(r-1,r);
		else link(l,l+1),link(r-1,r);
	else {
		int mid=(l+r)>>1,i,top=0,a,b,A,B,AA,BB,k;
		build(l,mid);
		build(mid+1,r);
		for (i=l;i<=r;i++) {
			while (top>1&&(p[i]-p[st[top-1]])*(p[st[top]]-p[st[top-1]])>0) //!
				top--;
			st[++top]=i;
		}
		for (i=1;i<=top;i++) if (st[i]>mid) { a=st[i-1],b=st[i]; break; }
		link(a,b);
		while (1) {
			A=ST[TOP]^1,B=ST[TOP];
			while (1) {
				AA=lc(A);
				if ((p[to[AA]]-p[a])*(p[b]-p[a])>=0) { AA=0; break; }
				k=lc(AA);
				if (k==A||!incircle(p[a],p[b],p[to[AA]],p[to[k]])) break;//льепk==A
				pop(AA);
			}
			while (1) {
				BB=rc(B);
				if ((p[to[BB]]-p[b])*(p[a]-p[b])<=0) { BB=0; break; }
				k=rc(BB);
				if (k==B||!incircle(p[a],p[b],p[to[BB]],p[to[k]])) break;
				pop(BB);
			}
			if (!AA&&!BB) break;
			if (!BB||(AA&&!incircle(p[a],p[b],p[to[AA]],p[to[BB]]))) link(a=to[AA],b,AA^1,B);
			else link(a,b=to[BB],A,BB^1);
		}
	}
}
int main()
{
#ifndef ONLINE_JUDGE
	freopen("D.in","r",stdin);
	freopen("D.out","w",stdout);
#endif
	n=gi();int i,k;
	for (i=n|1;(i+=2)<n*8;) ST[TOP++]=i;
	for (i=1;i<=n;i++) {
		q[i].first.x=gi(),q[i].first.y=gi(),q[i].second=i;
		ls[i]=rs[i]=i;
	}
	sort(q+1,q+1+n);
	for (i=1;i<=n;i++) p[i]=q[i].first;
	build(1,n);
	vector< pair<int,int> >back;
	for (k=1;k<=n;k++)
		for (i=rs[k];i!=k;i=rs[i])
			if (k<to[i])
				back.push_back(make_pair(q[k].second,q[to[i]].second));
	for (vector< pair<int,int> >::iterator it=back.begin();it!=back.end();it++)
		if (it->first>it->second)
			swap(it->first,it->second);
	sort(back.begin(),back.end());
	for (vector< pair<int,int> >::iterator it=back.begin();it!=back.end();it++)
		printf("%d %d\n",it->first,it->second);
	return 0;
}
