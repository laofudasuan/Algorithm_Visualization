#include <iostream>
#include<cstdio>
#include<cstring>
#include<algorithm>
#include<set>
#include<vector>
#include<map>
#include<cmath>
#define maxn 1000
using namespace std;
struct point {
	double x,y,z;
	point() {}
	point(double _x,double _y,double _z):x(_x),y(_y),z(_z) {}
};
point operator - (const point &a,const point &b) {
	return point(a.x-b.x,a.y-b.y,a.z-b.z);
}
double operator * (const point &a,const point &b)
{
	return a.x*b.x+a.y*b.y+a.z*b.z;
}
point operator ^ (const point &a,const point &b)
{
	return point(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);
}
double Volcume(const point &a,const point &b,const point &c,const point &d)
{
	return ((b-a)^(c-a))*(d-a);
}
set<pair<int,int> >myset;
vector<pair<int, pair<int,int> > >faces;
point data[maxn];
int n;
void wrap(int a,int b)
{
	if (myset.find(make_pair(a,b))==myset.end()) {
		int c=-1;
		for(int i=0; i<n; i++)
			if(i!=a&&i!=b) {
				if(c==-1||Volcume(data[c],data[a],data[b],data[i])>0)
					c=i;
			}
		if(c!=-1) {
			faces.push_back(make_pair(a,make_pair(b,c)));
			myset.insert(make_pair(a,b));
			myset.insert(make_pair(b,c));
			myset.insert(make_pair(c,a));
			wrap(c,b),wrap(a,c);
		}
	}
}
double sqr(double x)
{
	return x*x;
}
double dis(point a,point b)
{
	return sqrt(sqr(a.x-b.x)+sqr(a.y-b.y)+sqr(a.z-b.z));
}
double area(point a,point b,point c)
{
	double a1=dis(b,c),b1=dis(a,c),c1=dis(a,b),t=(a1+b1+c1)/2;
	return sqrt(t*(t-a1)*(t-b1)*(t-c1));
}
int main()
{
	while(~scanf("%d",&n)) {
		for (int i=0; i<n; i++)scanf("%lf%lf%lf",&data[i].x,&data[i].y,&data[i].z);
		for (int i=1; i<n; i++)
		 	if (data[i].x<data[0].x) swap(data[i],data[0]);
		for (int i=2; i<n; i++)
			if ((data[i].x-data[0].x)*(data[1].y-data[0].y)>(data[i].y-data[0].y)*(data[1].x-data[0].x))
				swap(data[1],data[i]);
		wrap(0,1);
		double ans=0;
		for(int i=0; i<(int)faces.size(); i++)
			ans+=area(data[faces[i].first],data[faces[i].second.first],data[faces[i].second.second]);
		printf("%.3f\n",ans);
	}
	return 0;
}
