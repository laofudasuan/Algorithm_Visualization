#include <bits/stdc++.h>
using namespace std;
int getint(){
	int res=0,fh=1;char ch=getchar();
	while((ch>'9'||ch<'0')&&ch!='-')ch=getchar();
	if(ch=='-')fh=-1,ch=getchar();
	while(ch>='0'&&ch<='9')res=res*10+ch-'0',ch=getchar();
	return fh*res;
}
inline int R() {
	int s=0;
	for (int i=0;i<=30;i++) if (rand()%2) s|=1<<i;
	return s;
}
#define rand() R()
#define LL long long
const string Na="CCQPOINT";
struct P{ int x,y; }p[1010][1010];
inline P operator - (const P &a,const P &b) { return (P){a.x-b.x,a.y-b.y}; }
inline LL operator * (const P &a,const P &b) { return 1LL*a.x*b.y-1LL*a.y*b.x; }
inline bool operator < (const P &a,const P &b) { return a.x==b.x?a.y<b.y:a.x<b.x; }
inline bool operator == (const P &a,const P &b) { return a.x==b.x&&a.y==b.y; }
inline bool cross(const P &a,const P &b,const P &c,const P &d) {
	return ((a-c)*(d-c))*((b-c)*(d-c))<=0&&((c-a)*(b-a))*((d-a)*(b-a))<=0;
}
int main() {
	int N,Q,size,T;
	set<P>s;
	srand(time(NULL));
	freopen("make.txt","r",stdin);
	freopen((Na+".in").c_str(),"w",stdout);
	cin>>T>>N>>Q>>size;
	printf("%d\n",T);
	for (int t=1;t<=T;t++) {
		int n=rand()%(N-2)+3;
		while (1) {
			for (int i=1;i<=n;i++) {
				p[t][i]=(P){rand()%size+1,rand()%size+1};
				if (s.count(p[t][i])) i--;
			}
			p[t][0]=p[t][n];
			for (int i=0;i<n;i++) {
				if (i&&(p[t][i]-p[t][i-1])*(p[t][i+1]-p[t][i])==0) goto over;
				for (int j=i+1;j<n;j++) {
					if (p[t][i]==p[t][j]) goto over;
					if (i+1==j) continue;
					if (i==0&&j==n-1) continue;
					if (cross(p[t][i],p[t][i+1],p[t][j],p[t][j+1])) goto over;
				}
			}
			for (int i=0;i<n;i++)
				for (int j=1;j<t;j++)
					for (int k=0;!k||!(p[j][k]==p[j][0]);k++) {
						if (cross(p[t][i],p[t][i+1],p[j][k],p[j][k+1])) goto over;
					}
			break;
		over:;
		}
		printf("%d\n",n);
		for (int i=0;i<n;i++)
			printf("%d %d\n",p[t][i].x,p[t][i].y),s.insert(p[t][i]);
	}
	printf("%d\n",Q);
	while (Q--)
		printf("%d %d\n",rand()%size+1,rand()%size+1);
	fclose(stdout);	
	return 0;
}
