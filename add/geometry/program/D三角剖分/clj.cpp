#include<bits/stdc++.h>
using namespace std;
#define pb push_back
typedef long long ll;
#define rep(i,l,r) for (int i=(l);i<(int)(r);i++)
typedef double db;
const db EPS = 1e-9;

const int N = int(1e5) + 10;

int sign(ll x) { return x < 0 ? -1 : x > 0;}

struct P3{
	ll x,y,z;
	P3 operator - (P3 o) { return {x-o.x,y-o.y,z-o.z}; }
	ll operator * (P3 o) { return x*o.x+y*o.y+z*o.z; }
	P3 operator ^ (P3 o) { return {y*o.z-z*o.y,z*o.x-x*o.z,x*o.y-y*o.x}; }
};

vector<int>edges[N];

ll sqr(ll x) { return x*x; }

struct P {
	ll x,y;
	P operator - (P p) { return {x - p.x, y - p.y}; }
	bool operator < (P o) const {  return x != o.x ? x < o.x : y < o.y; }
	ll det(P p) { return x * p.y - y * p.x; }
	P3 get() { return {x,y,x*x+y*y}; }
	ll distTo2(P o) { return sqr(x-o.x) + sqr(y-o.y); }
};

void addEdge(int u,int v) {
	edges[u].pb(v);
	edges[v].pb(u);
}

#define cross(p1,p2,p3) ((p2.x-p1.x)*(p3.y-p1.y)-(p3.x-p1.x)*(p2.y-p1.y))
inline int crossOp(P p1,P p2,P p3) { return sign(cross(p1,p2,p3)); }

bool crsSS(P p1, P p2, P q1, P q2) {
 	return crossOp(p1,p2,q1) * crossOp(p1,p2,q2) < 0 && crossOp(q1,q2,p1) * crossOp(q1,q2,p2) < 0;
}

int inCircle(P a, P b, P c, P d) {
	b = b - a; c = c - a; d = d - a;
	if (b.det(c) < 0) swap(b,c);
	P3 pb = b.get(), pc = c.get(), pd = d.get();
	P3 o = pb ^ pc;
	return sign(pd * o);
}

int n;
P ps[N];
pair<P,int>q[N];

inline int crossOp(int i,int j,int k){ return crossOp(ps[i],ps[j],ps[k]); }
inline int dist2(int i,int j){ return ps[i].distTo2(ps[j]); }
inline int inCircle(int a,int b,int c,int d){ return inCircle(ps[a],ps[b],ps[c],ps[d]); }
inline bool crsSS(int a,int b,int c,int d){ return crsSS(ps[a],ps[b],ps[c],ps[d]); }

void construct(int l, int r) {//[l,r)
	if (r - l <= 3) {
		rep(i,l,r) rep(j,l+1,r) addEdge(i,j);
		return;
	}
	int m = (l + r) / 2; construct(l, m); construct(m, r);

	//find the common tangent
	int pl = l, pr = r - 1;
	for (;;) {
		int next = -1;
		for (int p : edges[pl]) {
			int op = crossOp(pr, pl, p);
			if (op > 0 || (op == 0 && dist2(p, pr) < dist2(pl, pr))) {
				next = p;
				break;
			}
		}
		if (next != -1)
			pl = next;
		else {
			next = -1;
			for (int p : edges[pr]) {
				int op = crossOp(pr, pl, p);
				if (op > 0 || (op == 0 && dist2(p, pl) < dist2(pr, pl))) {
					next = p;
					break;
				}
			}
			if (next != -1)
				pr = next;
			else
				break;
		}
	}

	//merge
	addEdge(pl,pr);
	for (; ; ) {
		int next = -1;
		bool which = 0;
		for (int p : edges[pl]) {
			if (crossOp(pr, pl, p) < 0 && (next == -1 || inCircle(next, pl, pr, p) == -1))
				next = p;
		}
		for (int p : edges[pr]) {
			if (crossOp(pl, pr, p) > 0 && (next == -1 || inCircle(next, pl, pr, p) == -1)) {
				next = p;
				which = 1;
			}
		}
		if (next == -1)
			break;
		if (!which) {//pl
			vector<int> nEdges;
			for (int p : edges[pl]) {
				if (!crsSS(next, pr, pl, p))
					nEdges.pb(p);
			}
			edges[pl] = nEdges;
			addEdge(pr,next);
			pl = next;
		} else {//pr
			vector<int> nEdges;
			for (int p : edges[pr]) {
				if (!crsSS(next, pl, pr, p))
					nEdges.pb(p);
			}
			edges[pr] = nEdges;
			addEdge(pl,next);
			pr = next;
		}
	}
}
int main() {
	freopen("drzava.in","r",stdin);
	freopen("2.out","w",stdout);
	cin>>n;
	for (int i=1;i<=n;i++) scanf("%lld%lld",&q[i].first.x,&q[i].first.y),q[i].second=i;
	sort(q+1,q+1+n);
	for (int i=1;i<=n;i++) ps[i]=q[i].first;
	construct(1,n+1);
	vector< pair<int,int> >back;
	for (int i=1;i<=n;i++)
		for (int j:edges[i])
			if (q[i].second<q[j].second)
				back.push_back(make_pair(q[i].second,q[j].second));
	sort(back.begin(),back.end());
	back.resize(unique(back.begin(),back.end())-back.begin());
	for (vector< pair<int,int> >::iterator it=back.begin();it!=back.end();it++)
		printf("%d %d\n",it->first,it->second);
	return 0;
}
