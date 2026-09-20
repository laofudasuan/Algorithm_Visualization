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
int gi() {
	int w=0;bool q=1;char c=getchar();
	while ((c<'0'||c>'9') && c!='-') c=getchar();
	if (c=='-') q=0,c=getchar();
	while (c>='0'&&c <= '9') w=w*10+c-'0',c=getchar();
	return q? w:-w;
}
typedef double db;
const int N=110;
struct P{
	db x,y;
	inline void in() { scanf("%lf%lf",&x,&y); }
	inline db mo() { return sqrt(x*x+y*y); }
	inline db mo2() { return x*x+y*y; }
}p[N];
const P O=(P){0,0};
const db eps=1e-10;
inline P operator + (const P &a,const P &b) { return (P){a.x+b.x,a.y+b.y}; }
inline P operator - (const P &a,const P &b) { return (P){a.x-b.x,a.y-b.y}; }
inline P operator * (const P &a,const db &b) { return (P){a.x*b,a.y*b}; }
inline P operator / (const P &a,const db &b) { return (P){a.x/b,a.y/b}; }
inline db operator * (const P &a,const P &b) { return a.x*b.y-a.y*b.x; }
inline db dot(const P &a,const P &b) { return a.x*b.x+a.y*b.y; }
inline db rad(P &a,P &b) {
	db d=a.mo2()+b.mo2()-(a-b).mo2();
	db g=2*a.mo()*b.mo();
	db D=d/g;
	db G=acos(d/2/a.mo()/b.mo());
	db f=atan2(a*b,dot(a,b));
	return a*b>=0?G:-G;//atan2(a*b,dot(a,b));
}
inline bool cross(db R,const P &a,const P &b,P &A,P &B) {
	db dis=fabs(a*b)/(a-b).mo();
	if (dis>R) return false;
	P center=a+(b-a)*dot(O-a,b-a)/(b-a).mo2();
	dis=sqrt(R*R-dis*dis);
	A=center;
	if ((center-a).mo()>eps) A=A+(a-center)*(dis/(center-a).mo());
	B=center;
	if ((center-b).mo()>eps) B=B+(b-center)*(dis/(center-b).mo());
	return true;
}
inline db solve(db R,P &a,P &b) {
	db d1=a.mo(),d2=b.mo();
	P A,B;
	if (d1<R&&d2<R) return a*b;
	if (!cross(R,a,b,A,B))
		return R*R*rad(a,b);
	if (d1>R&&d2>R)
		if ((A*a>0)==(A*b>0))
			return R*R*rad(a,b);
		else
			return R*R*(rad(a,A)+rad(B,b))+A*B;
	else if (d1>R) return R*R*rad(a,A)+A*b;
	else return a*B+R*R*rad(B,b);
}
int main()
{
#ifndef ONLINE_JUDGE
	freopen("poj3675.in","r",stdin);
	freopen("poj3675.out","w",stdout);
#endif
	int n,i;db R,ans=0;
	while (scanf("%lf",&R)==1) {
		n=gi();ans=0;
		for (i=0;i<n;i++) p[i].in();
		for (i=0;i<n;i++) {
			if (p[i]*p[i+1])
				ans+=solve(R,p[i],p[i+1]);
		}
		printf("%.2lf\n",fabs(ans)/2);
	}
	return 0;
}
