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
const int N=1e5;
int gi() {
	int w=0;bool q=1;char c=getchar();
	while ((c<'0'||c>'9') && c!='-') c=getchar();
	if (c=='-') q=0,c=getchar();
	while (c>='0'&&c <= '9') w=w*10+c-'0',c=getchar();
	return q? w:-w;
}
struct P{
	db x,y,z;
	inline db mo() { return sqrt(x*x+y*y+z*z); }
}p[N];
inline P operator - (const P &a,const P &b) { return (P){a.x-b.x,a.y-b.y,a.z-b.z}; }
inline P operator * (const P &a,const P &b) { return (P){a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x}; }
struct Q{
	db a,b,c,d;
	inline P make() {
		db v1=1.0*rand()/RAND_MAX;
		db v2=1.0*rand()/RAND_MAX;
		if (a!=0) return (P){-(d+v1*b+v2*c)/a,v1,v2};
		if (b!=0) return (P){v1,-(d+v1*a+v2*c)/b,v2};
		return (P){v1,v2,-(d+v1*a+v2*b)/c};
	}
}q[N];
struct M{
	db v[4][4];
	inline void clear() {
		for (int i=0;i<4;i++)
			for (int j=0;j<4;j++)
				v[i][j]=0;
	}
	inline void init() {
		for (int i=0;i<4;i++)
			for (int j=0;j<4;j++)
				v[i][j]=i==j;
	}
};
inline M operator * (const M &a,const M &b) {
	M ans={};
	for (int i=0;i<4;i++)
		for (int j=0;j<4;j++)
			for (int k=0;k<4;k++)
				ans.v[i][j]+=a.v[i][k]*b.v[k][j];
	return ans;
}
inline M move(db a,db b,db c) {
	M v;v.init();
	v.v[3][0]+=a,v.v[3][1]+=b,v.v[3][2]+=c;
	return v;
}
inline M scale(db a,db b,db c) {
	M v={};
	v.v[0][0]=a;v.v[1][1]=b;v.v[2][2]=c;v.v[3][3]=1;
	return v;
}
inline P trans(M m,P p) {
	M t={};
	t.v[0][0]=p.x,t.v[0][1]=p.y,t.v[0][2]=p.z,t.v[0][3]=1;
	t=t*m;
	return (P){t.v[0][0],t.v[0][1],t.v[0][2]};
}
int main()
{
#ifndef ONLINE_JUDGE
	freopen("UVA12303.in","r",stdin);
	freopen("UVA12303.out","w",stdout);
#endif
	int n=gi(),m=gi(),T=gi(),i;
	M mat,cur;char c,ch;db A,B,C,theta,SIN,COS,t;
	P p0,p1,p2,d;
	const db pi=acos(-1);
	for (i=1;i<=n;i++) scanf("%lf%lf%lf",&p[i].x,&p[i].y,&p[i].z);
	for (i=1;i<=m;i++) scanf("%lf%lf%lf%lf",&q[i].a,&q[i].b,&q[i].c,&q[i].d);
	mat.init();
	while (T--) {
		while ((c=getchar())!='T'&&c!='R'&&c!='S');ch=c;
		while ('A'<=c&&c<='Z') c=getchar();
		scanf("%lf%lf%lf",&A,&B,&C);
		if (ch=='T') mat=mat*move(A,B,C);
		else if (ch=='R') {
			t=sqrt(A*A+B*B+C*C);
			A/=t;B/=t;C/=t;
			theta=gi()*pi/180;
			cur.init();
			SIN=sin(theta);COS=cos(theta);
			cur.v[0][0]=A*A+(1-A*A)*COS,cur.v[0][1]=A*B*(1-COS)+C*SIN,cur.v[0][2]=A*C*(1-COS)-B*SIN;
			cur.v[1][0]=A*B*(1-COS)-C*SIN,cur.v[1][1]=B*B*(1-COS)+COS,cur.v[1][2]=B*C*(1-COS)+A*SIN;
			cur.v[2][0]=A*C*(1-COS)+B*SIN,cur.v[2][1]=B*C*(1-COS)-A*SIN,cur.v[2][2]=C*C*(1-COS)+COS;
			mat=mat*cur;
		} else if (ch=='S') mat=mat*scale(A,B,C);
	}
	for (i=1;i<=n;i++) {
		p0=trans(mat,(P){p[i].x,p[i].y,p[i].z});
		printf("%.2lf %.2lf %.2lf\n",p0.x,p0.y,p0.z);
	}
	for (i=1;i<=m;i++) {
		p0=trans(mat,q[i].make());
		p1=trans(mat,q[i].make());
		p2=trans(mat,q[i].make());
		d=(p1-p0)*(p2-p0);
		t=d.mo();
		d.x/=t,d.y/=t,d.z/=t;
		printf("%.2lf %.2lf %.2lf %.2lf\n",d.x,d.y,d.z,-d.x*p0.x-d.y*p0.y-d.z*p0.z);
	}
	return 0;
}
