#include<iostream>
#include<vector>
#include<algorithm>
#include<cstring>
#include<cstdio>
#include<cmath>
#include<cstdlib>
#include<ctime>
#include<queue>
#include<map>
using namespace std;
typedef long long LL;
typedef long double lod;
const int N=3e5+100,logn=1e8;
const lod eps=1e-12;
int gi() {
	int w=0;bool q=1;char c=getchar();
	while ((c<'0'||c>'9') && c!='-') c=getchar();
	if (c=='-') q=0,c=getchar();
	while (c>='0'&&c <= '9') w=w*10+c-'0',c=getchar();
	return q? w:-w;
}

struct P{ int x,y; }p[N];
inline LL operator * (const P &a,const P &b) { return 1LL*a.x*b.y-1LL*a.y*b.x; }
struct line{ int x,l,r,id; }lin[N];
struct event{ int x,id; bool tp; inline bool operator < (const event &b) const { return x==b.x?tp<b.tp:x<b.x; } }eve[N<<1];
lod X;
int x[N],be[N];
lod K[N],B[N];
vector< pair<int,int> >T[N];
vector<int>ID[N];

int rt[N],st[N];
int lc[logn],rc[logn],id[logn],key[logn],tot;
inline lod F(int k) { return K[k]*X+B[k]; }
inline void update(int &x) {
	lc[++tot]=lc[x];
	rc[tot]=rc[x];
	id[tot]=id[x];
	key[tot]=key[x];
	x=tot;
}
inline int merge(int x,int y) {
	if (!x||!y) return x|y;
	if (key[x]>key[y]) {
		update(x);
		rc[x]=merge(rc[x],y);
		return x;
	} else {
		update(y);
		lc[y]=merge(x,lc[y]);
		return y;
	}
}
inline pair<int,int> split(int k,int p) {
	if (!k) return make_pair(0,0);
	pair<int,int>ans;
	update(k);
	if (F(p)<F(id[k])-eps) {//相等的放左边
		ans=split(lc[k],p);
		lc[k]=ans.second;ans.second=k;
	} else {
		ans=split(rc[k],p);
		rc[k]=ans.first,ans.first=k;
	}
	return ans;
}
inline int find(int k,int y) {
	if (!k) return 0;
	if (fabs(F(id[k])-y)<eps) return abs(be[id[k]]);
	if (y<F(id[k])) {//上下边界的判定条件不一样
		int t=find(lc[k],y);
		return t?t:be[id[k]];
	} else return find(rc[k],y);
}

inline void print(int x) {
	if (x<0) x=-1;
	printf("%d\n",x?x:-1);
	fflush(stdout);
}

inline void dfs(int k) {
	if (lc[k])
		dfs(lc[k]);
	printf("%d ",id[k]);
	if (rc[k])
		dfs(rc[k]);
}
int main()
{
#ifndef ONLINE_JUDGE
	freopen("CCQPOINT.in","r",stdin);
	freopen("CCQPOINT.out","w",stdout);
#endif
	srand(998244353);
	//cout<<sizeof(lc)*5/1024/1024<<endl;return 0;
	int n=gi(),i,t,k,m,Lin=0,len=0,all=0,All=0,top=0;
	LL area=0;pair<int,int>pr;P o;
	map< pair<int,int> ,int>mp;
	for (t=1;t<=n;t++) {
		m=gi();
		for (i=1;i<=m;i++) {
			p[i].x=x[++len]=gi(),p[i].y=gi();
			mp[make_pair(p[i].x,p[i].y)]=t;
		}
		area=p[m]*p[1];
		for (i=1;i<m;i++) area+=p[i]*p[i+1];
		if (area>0)
			reverse(p+1,p+1+m);
		p[0]=p[m];
		for (i=0;i<m;i++)
			if (p[i].x==p[i+1].x)
				lin[++Lin]=(line){p[i].x,min(p[i].y,p[i+1].y),max(p[i].y,p[i+1].y),t};
			else {
				be[++all]=p[i].x<p[i+1].x?t:-t;
				K[all]=1.*(p[i+1].y-p[i].y)/(p[i+1].x-p[i].x);
				B[all]=p[i].y-K[all]*p[i].x;
				eve[++All]=(event){min(p[i].x,p[i+1].x),all,1};
				eve[++All]=(event){max(p[i].x,p[i+1].x),all,0};
				id[++tot]=all;
				key[tot]=rand();
			}
	}
	sort(x+1,x+1+len);
	len=unique(x+1,x+1+len)-x-1;
	
	for (i=1;i<=Lin;i++) {
		t=lower_bound(x+1,x+1+len,lin[i].x)-x;
		T[t].push_back(make_pair(lin[i].l,lin[i].r));
		ID[t].push_back(lin[i].id);
	}
	for (i=1;i<=len;i++) sort(T[i].begin(),T[i].end());

	sort(eve+1,eve+1+All);
	for (t=i=1;t<=len;t++) {
		rt[t]=rt[t-1];
		for (;eve[i].x==x[t];i++) {
			X=x[t]+(eve[i].tp?0.5:-0.5);//调整标准坐标
			pr=split(rt[t],eve[i].id);
			if (eve[i].tp)
				rt[t]=merge(pr.first,merge(eve[i].id,pr.second));
			else
				if (!rc[pr.first]) rt[t]=merge(lc[pr.first],pr.second);
				else {
					for (k=pr.first;rc[k];k=rc[st[++top]=k]);
					rc[st[top]]=lc[k];
					while (--top)
						rc[st[top]]=st[top+1];
					rt[t]=merge(pr.first,pr.second);//记得合并
				}
		}
		//printf("%d :\n",x[t]);dfs(rt[t]);putchar(10);
	}
	n=gi();
	while (n--) {
		o.x=gi(),o.y=gi();
		if (mp.find(make_pair(o.x,o.y))!=mp.end()) {
			print(mp[make_pair(o.x,o.y)]);
			continue;
		}
		t=lower_bound(x+1,x+1+len,o.x)-x;
		if (x[t]==o.x) {
			i=lower_bound(T[t].begin(),T[t].end(),make_pair(o.y,1<<30))-T[t].begin();
			if (i&&T[t][--i].first<=o.y&&o.y<=T[t][i].second) {
				print(ID[t][i]);
				continue;
			}
		} else t--;
		X=o.x;
		print(find(rt[t],o.y));
	}
	return 0;
}
