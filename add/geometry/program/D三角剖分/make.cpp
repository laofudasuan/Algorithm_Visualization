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
const string Na="sgu383";
int main() {
	int n,m,x,y;
	set< pair<int,int> >s;
	srand(time(NULL));
	freopen("make.txt","r",stdin);
	freopen((Na+".in").c_str(),"w",stdout);
	cin>>n>>m;
	printf("%d\n",n);
	for (int i=1;i<=n;i++)
		while (1) 
			if (s.find(make_pair(x=rand()%m,y=rand()%m))==s.end()) {
				s.insert(make_pair(x,y));
				printf("%d %d\n",x,y);
				if (rand()&1) rand();
				break;
			}
	printf("%d\n",n);
	for (int i=1;i<=n;i++) {
		while ((x=rand()%n+1)==(y=rand()%n+1));
		printf("%d %d\n",x,y);
	}
	fclose(stdout);	
	return 0;
}
