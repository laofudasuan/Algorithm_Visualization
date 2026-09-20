#include <cstdlib>
#include <cstdio>
#include <algorithm>
#include <cmath>
#include <vector>
#include <iostream>
#include <ctime>
#include <cassert>

using namespace std;

#define Eps 1e-10

#define C_TYPE(X) const X&
#define FOR(i,l,r) for (int i=(l); i<=(r); i++)
#define AUTO(x,y) __typeof(y) x=y
#define FOR_EACH(x,v) for (AUTO(x, (v).begin()); x!=(v).end(); x++)
#define list vector

#ifdef _WIN32
#define RAND(x) (((rand()<<14)+rand())%(x))
#else
#define RAND(x) (rand()%(x))
#endif

struct Point {
    double x,y,z;
    Point() {}
    Point(double _x, double _y, double _z)
    : x(_x), y(_y), z(_z) {}
};
struct Face {
    Point normal;
    double c;
    Face(C_TYPE(Point) a, C_TYPE(Point) b, C_TYPE(Point) c);
    Face() {}
};



Point operator +(C_TYPE(Point) a, C_TYPE(Point) b) {return Point(a.x+b.x, a.y+b.y, a.z+b.z);}
Point operator -(C_TYPE(Point) a, C_TYPE(Point) b) {return Point(a.x-b.x, a.y-b.y, a.z-b.z);}
Point operator *(C_TYPE(Point) a, double b) {return Point(a.x*b, a.y*b, a.z*b);}
Point operator /(C_TYPE(Point) a, double b) {return a*(1.0f/b);}
double operator *(C_TYPE(Point) a, C_TYPE(Point) b) {return a.x*b.x + a.y*b.y + a.z*b.z;}
Point cross(C_TYPE(Point) a, C_TYPE(Point) b) {return Point(a.y*b.z-a.z*b.y, a.z*b.x-a.x*b.z, a.x*b.y-a.y*b.x);}

double mo2(C_TYPE(Point) a) {return a.x*a.x + a.y*a.y + a.z*a.z;}
double mo(C_TYPE(Point) a) {return sqrt(mo2(a));}
Point norm(C_TYPE(Point) a) {return a/mo(a);}

Face::Face(C_TYPE(Point) a, C_TYPE(Point) b, C_TYPE(Point) c)
: normal(norm(cross(b-a, c-a))), c(normal * a) 
{}

double faceDis(C_TYPE(Face) face, C_TYPE(Point) point) {return face.normal * point - face.c;}
bool seeFace(C_TYPE(Face) face, C_TYPE(Point) point) {return faceDis(face, point) > -Eps;}

Point faceToPoint(Face f, Point center) {
    f.c -= f.normal * center;
    return f.normal / f.c;
}

struct CPoint;
struct CFace;
struct CLine;

struct CPoint {
    Point p;
    list<CFace*> see;
    list<CFace*> made;
};

struct CLine {
    CFace *face;
    CPoint *point;
    CLine *back;
    CLine* next_line();
};

struct CFace {
    Face f;
    CPoint *killed;
    list<CPoint*> saw;
    CLine line[3];
    CFace(CPoint *p0, CPoint *p1, CPoint *p2) : f(p0->p, p1->p, p2->p), killed(0) {
        line[0] = (CLine){this, p1, 0};
        line[1] = (CLine){this, p2, 0};
        line[2] = (CLine){this, p0, 0};
    }
    void setLineBack(CLine *l0, CLine *l1, CLine *l2) {
        line[0].back = l0, l0->back = line+0;
        line[1].back = l1, l1->back = line+1;
        line[2].back = l2, l2->back = line+2;
    }

    void findSee(C_TYPE(list<CPoint*>) cd) {
        FOR_EACH(cp, cd) {
            if (*cp != line[2].point && seeFace(this->f, (*cp)->p)) {
                saw.push_back((*cp));
                (*cp)->see.push_back(this);
            }
        }
    }

    void findSee(C_TYPE(list<CPoint*>) a, C_TYPE(list<CPoint*>) b) {
        saw.resize(a.size() + b.size());
        saw.clear();

        AUTO(ia, a.begin());
        AUTO(ib, b.begin());
        CPoint* v_max = (CPoint*)-1;// max &cp[0] + cp.size();
        while (ia!=a.end() || ib!=b.end()) {
            CPoint* va = (ia == a.end() ? v_max : *ia);
            CPoint* vb = (ib == b.end() ? v_max : *ib);
            ia += (va <= vb);
            ib += (vb <= va);
            CPoint* ck = min(va, vb);
            if (ck == line[2].point) continue;
            if (va == vb || seeFace(this->f, ck->p)) {
                saw.push_back(ck);
                ck->see.push_back(this);
            }
        }
    }
};

CLine* CLine::next_line() {
    return this->face->line+2 == this ? this->face->line : this+1;
}

ostream& operator <<(ostream &cout, C_TYPE(Point) p) {return cout<<"("<<p.x<<','<<p.y<<','<<p.z<<')';}
ostream& operator <<(ostream &cout, C_TYPE(list<CPoint*>) p) {
    cout<<'[';
    FOR_EACH(x,p) cout<<(*x)->p<<", ";
    cout<<']';
}


struct Hull3D {
    vector<CPoint> cp;
    vector<CPoint*> a;
    CPoint *root;
    int n;
    void initHull(CPoint *a, CPoint *b, CPoint *c);
    void insertPoint(CPoint *a);
    void clearAll();
    int inHull(Point p, CPoint *s);
    int inHull(Point p) {return inHull(p, root);}
    void build(vector<Point> points);
    vector<Face> getAllFace();
    Point getCenter();
};

void Hull3D::initHull(CPoint *a, CPoint *b, CPoint *c) {
    CFace *pf = new CFace(a, b, c);
    a->made.push_back(pf);
    CFace *pf2 = new CFace(c, b, a);
    pf2->setLineBack(pf->line+1, pf->line+0, pf->line+2);
    a->made.push_back(pf2);
    list<CPoint*> all;
    FOR(i,0,n-1) 
        if (&cp[i] != this->a[0] && &cp[i] != this->a[1] && &cp[i] != this->a[2])
            all.push_back(&cp[i]);
    pf->findSee(all);
    pf2->findSee(all);
}

void Hull3D::insertPoint(CPoint *a) {
    CLine *ps=0;
    FOR_EACH(f, a->see) if (!(*f)->killed) {
        (*f)->killed = a;
        if (ps == 0) {
            FOR(i,0,2) // improve
                if (!seeFace((*f)->line[i].back->face->f, a->p)) {
                    ps = (*f)->line + i;
                }
        }
    }
    if (ps==0) return;
    CFace *pre=0;
    CLine *pt=ps;
    while (1) {
        CFace *nf = new CFace(a, pt->back->point, pt->point);
        a->made.push_back(nf);
        nf->findSee(pt->face->saw, pt->back->face->saw);
        if (pre==0)
            nf->setLineBack(nf->line+2, pt->back, nf->line);
        else
            nf->setLineBack(pre->line+2, pt->back, pre->line[2].back);
        pre = nf;
        pt = pt->next_line();
        while (pt->back->face->killed)
            pt = pt->back->next_line();
        if (pt==ps) break;
    }
}

void Hull3D::clearAll() {
    FOR(i,0,n-1) {
        cp[i].made.clear();
        cp[i].see.clear();
    }
}

int Hull3D::inHull(Point p, CPoint *s) {
    FOR_EACH(i,s->made) {
        if (faceDis((*i)->f, p)>Eps) {
            if ((*i)->killed)
                return inHull(p, (*i)->killed);
            else
                return 0;
        }
    }
    return 1;
}

void Hull3D::build(vector<Point> points) {
    n = points.size();
    cp.resize(n);
    a.resize(n);
    FOR(i,0,n-1) {
        a[i] = &cp[i];
        swap(a[i], a[RAND(i+1)]);
        cp[i].p = points[i];
    }
    root = a[0];
    initHull(a[0], a[1], a[2]);
    FOR(i,3,n-1)
        insertPoint(a[i]);
}

vector<Face> Hull3D::getAllFace() {
    vector<Face> fs;
    for (auto &p : cp)
        for (auto &f : p.made)
            if (!f->killed)
                fs.push_back(f->f);
    return fs;
}

Point Hull3D::getCenter() {
    Point c(0,0,0);
    for (auto &p : cp)
        c = c + p.p;
    return c / cp.size();
}

int main(int argc, char **argv) {
    /*
    srand(time(0));
    if (argc>=3) {
        freopen(argv[1],"r",stdin);
        freopen(argv[2],"w",stdout);
    } else {
        freopen("input.txt","r",stdin);
        freopen("output2.txt","w",stdout);
    }
    */
    int n;
    scanf("%d",&n);
    vector<Point> points;
    FOR(i,1,n) {
        int x,y,z,p;
        scanf("%d%d%d%d", &x, &y, &z, &p);
        double s = x+y+z+p;
        points.push_back(Point(x/s, y/s, z/s));
    }

    Hull3D hull, hull2;
    hull.build(points);
    vector<Face> fs = hull.getAllFace();
    Point center = hull.getCenter();
    //cerr << "Face1: " << fs.size() << endl;

    points.clear();
    for (auto &f : fs)
        points.push_back(faceToPoint(f, center));
    hull2.build(points);

    int q,i=0;
    scanf("%d", &q);
    while (i++, q--) {
        int q;
        double a,b,c,d;
        scanf("%d%lf%lf%lf%lf", &q, &a, &b, &c, &d);
        int ans;
        if (q == 1) {
            ans = hull.inHull(Point(a,b,c) / (a+b+c+d));
            //cout << mo(Point(a,b,c) / (a+b+c+d)) << endl;
            //assert(0);
        }
        else {
            Face f;
            f.normal = Point(a-d, b-d, c-d);
            f.c = -d;
            if (!seeFace(f, center)) {// todo
                ans = 1 - hull2.inHull(faceToPoint(f, center));
            }
            else {
                ans = 1;
                //cerr << "NO!" << endl;
            }
        }
        if (ans) printf("Y\n"); else printf("N\n");
    }
    //cerr << "Face2: " << hull2.getAllFace().size() << endl;
}
