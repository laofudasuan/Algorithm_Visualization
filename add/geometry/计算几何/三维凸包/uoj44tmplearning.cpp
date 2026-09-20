#include<iostream>
#include<algorithm>
#include<cmath>
#include<cstdio>
#include<cstdlib>
#include<cstring>
#include<set>
#include<queue>
#include<ctime>
#include<vector>
using namespace std;
inline int rd(){
	register char ch=getchar();
	register bool flag=false;
	register int res=0;
	while (ch<'0'||ch>'9') { flag=(ch=='-'); ch=getchar(); }
	while (ch>='0'&&ch<='9') { res=(res<<3)+(res<<1)+ch-'0'; ch=getchar(); }
	if (flag) res=-res;
	return res;
}
/*
  learningzhaglz...
  把D除掉，转化为三维问题。
  显然如果在凸包内部就可以满足要求1。
  （=a,b,c,d）
  对于要求2？？？(A*a+B*b+C*c+D*d>=0)对偶判断半空间交

  随机增量做法：
  1、构造：随机插入一个点p，
  删除所有可见面，
  加入新面，
  维护新面可见点的信息和所有点可见面的信息
  2、查找：如果不在原始凸包中，找到可见面被删除时创建的凸包，直到在凸包中为止
*/
typedef long double db;
bool prt;
const int maxn=4*51000;
const int maxs=5*maxn;
const db eps=1e-15;
struct P{
	db x,y,z;
	P() {}
	P(db _x,db _y,db _z) { x=_x;y=_y;z=_z; }
	P operator - (const P &o) { return P(x-o.x,y-o.y,z-o.z); }
	P operator * (const P &o) { return P(y*o.z-z*o.y,z*o.x-x*o.z,x*o.y-y*o.x); }//三维叉积
	db operator ^ (const P &o) { return x*o.x+y*o.y+z*o.z; }//点积
	void out() { printf("%.10lf %.10lf %.10lf\n",(double)x,(double)y,(double)z); }
};
struct surf{
	int pt[3],adj[3];
	surf() {}
	surf(int _a,int _b,int _c) {
		pt[0]=_a,pt[1]=_b,pt[2]=_c;
		adj[0]=adj[1]=adj[2]=0;
	}
};
struct convex_hull{
	P po[maxn];
	int ok[maxs];
	int n,tot,nxt[maxn];
	vector<int>see[maxn],beseen[maxn],newsur[maxn];
	surf sur[maxs];
	int onsur[maxn][3],vis[maxn],del[maxs];
	db len(P o) { return sqrt(o.x*o.x+o.y*o.y+o.z*o.z); }
	db area(P a,P b,P c) {//area *2
		return len((b-a)*(c-a));//本质上就是算一个平行四边形的面积（表现为三维向量的模长）
	}
	db volume(surf s,P o) {//volume*6
		P a=po[s.pt[0]],b=po[s.pt[1]],c=po[s.pt[2]];
		return ((b-a)*(c-a))^(o-a);//平行四边形棱柱（实际上应该是三棱锥）
	}
	void push(int p,int a,int s) {
		if (onsur[a][0]==p) onsur[a][2]=s;
		else onsur[a][0]=p,onsur[a][1]=s;
	}
	void Init() {
		srand(123456);
		random_shuffle(po,po+n);
		memset(nxt,0,sizeof(nxt));
		memset(onsur,0,sizeof(onsur));
		tot=0;
		for (int i=1;i<n;i++)
			if (len(po[i]-po[0])>eps) {//不是同一个点
				swap(po[i],po[1]);
				break;
			}
		for (int i=2;i<n;i++)
			if (area(po[0],po[1],po[i])>eps) {//不在线上
				swap(po[i],po[2]);
				break;
			}
		for (int i=3;i<n;i++)
			if (fabs(volume(surf(0,1,2),po[i]))>eps) {//不在面上
				swap(po[i],po[3]);
				break;
			}
		int bel[4][4];//边a->b代表一个面（边是有向，有顺序的，如果p[i]在上方，那么就是逆时针旋转）
		for (int i=0;i<4;i++) {
			int a=(i+1)%4,b=(i+2)%4,c=(i+3)%4;
			if (volume(surf(a,b,c),po[i])>0) swap(b,c);
			sur[++tot]=surf(a,b,c);
			bel[a][b]=bel[b][c]=bel[c][a]=tot;
			ok[tot]=1;//not delete
		}
		for (int i=1;i<=tot;i++)
			for (int j=0;j<3;j++) {
				int a=sur[i].pt[j],b=sur[i].pt[(j+1)%3];
				sur[i].adj[j]=bel[b][a];
			}//注意adj实质上是记录的面
		for (int i=1;i<=tot;i++) beseen[i].clear();
		for (int i=3;i<n;i++) {
			see[i].clear();
			for (int j=1;j<=tot;j++)
				if (volume(sur[j],po[i])>eps)
					see[i].push_back(j),beseen[j].push_back(i);//可见面和可见点
		}
		for (int i=0;i<n;i++) newsur[i].clear();
		for (int i=1;i<=tot;i++)
			newsur[0].push_back(i);
		memset(del,-1,sizeof(del));
	}
	void Build() {
		memset(vis,0,sizeof(vis));
		int col=0;
		//ok=0 ,deleted ,ok=1 not deleted,ok=-1,going to delete
		for (int p=4;p<n;p++) {//insert point #p 插入点p
			int tot2=tot;
			//delete 先把可见面都删掉
			for (int i=0;i<(int)see[p].size();i++) {
				int s=see[p][i];//delete 可见面#s
				if (ok[s])
					ok[s]=-1;
			}
			//insert 把可见点都与之连成面
			for (int i=0;i<(int)see[p].size();i++) {
				int s=see[p][i];
				if (!ok[s]) continue;
				for (int e=0;e<3;e++)
					if (ok[sur[s].adj[e]]==1) {//这个面并没有被删去
						sur[++tot]=surf(sur[s].pt[e],sur[s].pt[(e+1)%3],p);
						ok[tot]=1;
						sur[tot].adj[0]=sur[s].adj[e];
						for (int s2=sur[s].adj[e],e2=0;e2<3;e2++)
							if (sur[s2].adj[e2]==s) sur[s2].adj[e2]=tot;//s面被tot取代了
						//update onsur[]
						push(p,sur[s].pt[e],tot);
						push(p,sur[s].pt[(e+1)%3],tot);
						
						//update see[],beseen[]
						++col;
						for (int j=0;j<(int)beseen[s].size();j++) {
							int np=beseen[s][j];//看见s的点目前应该部分变成看见tot，还有部分是看见了另外一些面（暂时未处理）
							if (np<=p||vis[np]==col) continue;
							vis[np]=col;
							if (volume(sur[tot],po[np])>eps) {//np see tot
								see[np].push_back(tot);
								beseen[tot].push_back(np);
							}
						}
						int s2=sur[s].adj[e];
						for (int j=0;j<(int)beseen[s2].size();j++) {
							int np=beseen[s2][j];
							if (np<=p||vis[np]==col) continue;
							vis[np]=col;
							if (volume(sur[tot],po[np])>eps) {//np see tot
								see[np].push_back(tot);
								beseen[tot].push_back(np);
							}
						}
					}
			}
			//update adj
			for (int i=tot2+1;i<=tot;i++) {
				for (int e=0;e<3;e++)
					if (!sur[i].adj[e]) {//不可能没有面，需要找一个代替
						int a=sur[i].pt[e]==p?sur[i].pt[(e+1)%3]:sur[i].pt[e];//!=p的点
						sur[i].adj[e]=onsur[a][1]==i?onsur[a][2]:onsur[a][1];//!=i的面
					}
			}
			//clear+calc nxt[]
			for (int i=0;i<(int)see[p].size();i++) {
				int s=see[p][i];
				if (!ok[s]) continue;//被删掉就不要更新了
				ok[s]=0;
				if (tot2<tot) nxt[s]=tot2+1;
				beseen[s].clear();
				del[s]=p;
			}
			see[p].clear();
			//get newsur[p]
			for (int i=tot2+1;i<=tot;i++)
				newsur[p].push_back(i);//新的点全都加入面中
		}
	}
	void build() {
		Init();
		Build();
	}
	bool inhull(int t,P o) {//true=in convex hull
		for (int i=0,s;i<(int)newsur[t].size();i++)
			if (volume(sur[s=newsur[t][i]],o)>eps) {
				if (del[s]==-1) return false;
				else return inhull(del[s],o);
			}
		return true;
	}
	P getcenter() {
		P center(0,0,0);
		for (int i=0;i<n;i++) {
			center.x+=po[i].x;
			center.y+=po[i].y;
			center.z+=po[i].z;
		}
		return P(center.x/n,center.y/n,center.z/n); 
	}
}hull1,hull2;
struct surf2{ db a,b,c,d; };//ax+by+cz>=d
db mat[3][4],x[4];
void gomat(int k,P a) { mat[k][0]=a.x,mat[k][1]=a.y,mat[k][2]=a.z,mat[k][3]=-1; }
surf2 transform(surf s) {//
	P a=hull1.po[s.pt[0]],b=hull1.po[s.pt[1]],c=hull1.po[s.pt[2]];
	db x1=a.x,y1=a.y,z1=a.z,x2=b.x,y2=b.y,z2=b.z,x3=c.x,y3=c.y,z3=c.z;
	db X2=x1-x2,Y2=y1-y2,Z2=z1-z2,X3=x1-x3,Y3=y1-y3,Z3=z1-z3;
	db X1=Y2*Z3-Z2*Y3,Y1=Z2*X3-X2*Z3,Z1=X2*Y3-Y2*X3;
	return (surf2){X1,Y1,Z1,x1*X1+y1*Y1+z1*Z1};
}
P getpoint(surf2 s,P center) {
	s.d-=P(s.a,s.b,s.c)^center;
	return P(s.a/s.d,s.b/s.d,s.c/s.d);
}
bool answer[maxn];
void work() {
	int n,m;n=rd();
	hull1.n=0;
	for (int i=0,a,b,c,d;i<n;i++) {
		a=rd();b=rd();c=rd();d=rd();
		db s=a+b+c+d;
		hull1.po[hull1.n++]=P(a/s,b/s,c/s);
	}
	hull1.build();
	P center=hull1.getcenter();
	hull2.n=0;
	for(int i=1;i<=hull1.tot;i++)
		if (hull1.ok[i]==1) {
			surf2 tmp=transform(hull1.sur[i]);//surf->surf2
			hull2.po[hull2.n++]=getpoint(tmp,center);
		}
	hull2.build();
	scanf("%d",&m);
	while (m--) {
		double a,b,c,d;
		int k,ans;
		scanf("%d%lf%lf%lf%lf",&k,&a,&b,&c,&d);
		if (k==1) {
			d+=a+b+c;
			ans=hull1.inhull(0,P(a/d,b/d,c/d));
		} else {
			surf2 tmp;
			tmp.a=a-d,tmp.b=b-d,tmp.c=c-d,tmp.d=-d;
			if ((a-d)*center.x+(b-d)*center.y+(c-d)*center.z+d>-eps) ans=1;
			else ans=1-hull2.inhull(0,getpoint(tmp,center));
		}
		printf("%s\n",ans?"Y":"N");
	}
}
int main() {
	freopen("uoj44.in","r",stdin);
	freopen("uoj44.out","w",stdout);
	work();
	fclose(stdin);
	fclose(stdout);
	return 0;
}
