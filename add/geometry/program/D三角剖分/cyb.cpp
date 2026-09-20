/*Delayyy*/
#include <map>
#include <cmath>
#include <cstdio>
#include <iostream>
#include<vector>
#include <algorithm>
#define REP(i, l, r) for (int i = l; i <= r; i ++)
#define DEP(i, r, l) for (int i = r; i >= l; i --)
#define sqr(_) ((_) * (_))
#define foredge(d) for (int j = qE[d], k; k = E[j].to, j; j = E[j].l)
using namespace std;

typedef double dbl;
typedef long long LL;

const bool DB = 0;
const int Sn = 500010;
const dbl rC = cos(0.1), rS = sin(0.1);
const dbl eps = 1e-7;

struct pt {
	dbl x, y; int id;
	void in(int id, LL& zx, LL& zy) {
		this->id = id;
		cin >> zx >> zy;
		//x=zx,y=zy;
		x = rC*zx - rS*zy;
		y = rS*zx + rC*zy;
	}
} p[Sn];
pt operator + (const pt& a, const pt& b) { return (pt){a.x + b.x, a.y + b.y}; }
pt operator - (const pt& a, const pt& b) { return (pt){a.x - b.x, a.y - b.y}; }
pt operator * (const pt& a, const dbl& b) { return (pt){a.x * b, a.y * b}; }
pt operator / (const pt& a, const dbl& b) { return (pt){a.x / b, a.y / b}; }
dbl cj(const pt& a, const pt& b) { return a.x * b.y - a.y * b.x; }
dbl dj(const pt& a, const pt& b) { return a.x * b.x + a.y * b.y; }
dbl dis2(const pt& a, const pt& b) { return sqr(a.x-b.x) + sqr(a.y-b.y); }
dbl cjs(const pt& pi, const pt& pj, const pt& pk) { return cj(pj - pi, pk - pi); }

struct pt3 {
	dbl x, y, z;
	void r (const pt& v) { x = v.x, y = v.y, z = sqr(x) + sqr(y); }
};
pt3 operator - (const pt3& a, const pt3& b) { return (pt3){a.x - b.x, a.y - b.y, a.z - b.z}; }
pt3 cj3(const pt3& a, const pt3& b) { return (pt3){a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x}; }
dbl dj3(const pt3& a, const pt3& b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
bool in_circle(const pt& a, const pt& b, const pt& c, const pt& d) {
	pt3 aa, bb, cc, dd;
	aa.r(a), bb.r(b), cc.r(c), dd.r(d);
	if (cjs(a, b, c) < 0) swap(bb, cc);
	dbl t=dj3(cj3(bb-aa, cc-aa), dd-aa);
	return dj3(cj3(bb-aa, cc-aa), dd-aa) < 0;
}
int dcmp(const dbl& x) {
	return x < -eps? -1: (x > eps);
}
bool cross(const pt& a, const pt& b, const pt& c, const pt& d) {
	bool ret = (dcmp(cjs(a,b,c)) * dcmp(cjs(a,b,d)) == -1 && dcmp(cjs(c,d,a)) * dcmp(cjs(c,d,b)) == -1);
	return ret;
}

struct tri { int u, v; dbl w; };
struct edge { int to, nx; dbl le; };
bool cmpe(const tri& a, const tri& b) { return a.w < b.w; }
vector< pair<int,int> >back;

struct edge2 { int to, l, r; } E[Sn*130];
int qE[Sn], En = 1;

int n, q, S[Sn], tS;
LL zx[Sn], zy[Sn];


bool cmpxy(const pt& a, const pt& b) { return a.x < b.x; }
void vlink(int u, int v) {
	E[++En] = (edge2){v, qE[u], 0}, E[qE[u]].r = En, qE[u] = En;
	E[++En] = (edge2){u, qE[v], 0}, E[qE[v]].r = En, qE[v] = En;
	if (DB) { printf("vlink: %d %d\n", u, v); }
}
void del(int j) {
	E[E[j].l].r = E[j].r;
	if (E[j].r) E[E[j].r].l = E[j].l;
	else qE[E[j^1].to]=E[j].l;
}
void DaC(int L, int R)
{
	int M = (L + R) / 2, ld = 0, rd = 0, pc, dr;
	if (R-L+1 == 2) vlink(L, R);
	if (R-L+1 <= 2) return;
	DaC(L, M); DaC(M+1, R);

	tS = 0;
	REP(i, L, R) {
		while (tS > 1 && cjs(p[S[tS-1]], p[S[tS]], p[i]) < -eps) tS --;
		S[++tS] = i;
	}
	REP(i, 1, tS-1)
		if (S[i] <= M && S[i+1] > M) ld = S[i], rd = S[i+1];
	
	for (; ; ) {
		vlink(ld, rd);
		pc = dr = 0;
		foredge(ld)
			if (cjs(p[ld], p[rd], p[k]) > +eps && (!pc || in_circle(p[ld], p[rd], p[pc], p[k]))) pc = k, dr = -1;
		foredge(rd)
			if (cjs(p[rd], p[ld], p[k]) < -eps && (!pc || in_circle(p[rd], p[ld], p[pc], p[k]))) pc = k, dr = +1;
		if (!pc) break;
		
		tS = 0;
		if (dr < 0) {
			foredge(ld)
				if (k != rd && k != pc && cross(p[ld], p[k], p[rd], p[pc])) S[++tS] = j;
			ld = pc;
		}
		if (dr > 0) {
			foredge(rd)
				if (k != ld && k != pc && cross(p[rd], p[k], p[ld], p[pc])) S[++tS] = j;
			rd = pc;
		}
		REP(i, 1, tS) del(S[i]), del(S[i]^1);
	}
}
void Delaunay()
{
	sort(p+1, p+n+1, cmpxy);
	DaC(1, n);
	REP(i, 1, n) foredge(i)
		if (p[i].id<p[k].id)
			back.push_back(make_pair(p[i].id,p[k].id));
}

int main()
{
#ifndef ONLINE_JUDGE
	freopen("drzava.in" , "r", stdin);
	freopen("2.out", "w", stdout);
#endif
	scanf("%d", &n);
	REP(i, 1, n) p[i].in(i, zx[i], zy[i]);
	Delaunay();
	sort(back.begin(),back.end());
	for (vector< pair<int,int> >::iterator it=back.begin();it!=back.end();it++)
		printf("%d %d\n",it->first,it->second);
	return 0;
}
