"""Independent derivations for the nontrivial calculations in the first edition."""
import sympy as s
from fractions import Fraction as F
from pathlib import Path
import json

checks=[]
def check(name,condition):
    assert condition,name
    checks.append(name)

x,t,q,u,m,k,g,l,r,rd,pd,pdd=s.symbols('x theta q u m k g ell r rdot phidot phiddot',positive=True)
check('M02 integral',2*F(1,3)+5*F(2,3)==4)
for n in range(1,12):
 N=2**n
 check(f'M03 dyadic integral n={n}',sum(F(j,N*N) for j in range(N))==F(N-1,2*N))
check('M04 bounded powers limit',s.limit(1/(s.Symbol('n',positive=True)+1),s.Symbol('n',positive=True),s.oo)==0)
check('P01 variance',F(1,4)-F(1,4)**2==F(3,16))
check('P02 normalization',s.integrate(2*x,(x,0,1))==1)
check('P02 expectation',s.integrate(2*x*x,(x,0,1))==F(2,3))
X=[0,2,4,6];Y=[1,1,5,5]
check('P03 all observable events preserve integrals',all(sum(F(X[i],4) for i in A)==sum(F(Y[i],4) for i in A) for A in [[],[0,1],[2,3],[0,1,2,3]]))
score1=s.diff(s.log(t),t);score0=s.diff(s.log(1-t),t)
check('I01 score mean',s.simplify(t*score1+(1-t)*score0)==0)
fisher=s.simplify(t*score1**2+(1-t)*score0**2)
check('I01 Fisher information',s.simplify(fisher-1/(t*(1-t)))==0)
D=t*s.log(t/q)+(1-t)*s.log((1-t)/(1-q))
check('I02 KL first derivative',s.simplify(s.diff(D,q).subs(q,t))==0)
check('I02 KL second derivative',s.simplify(s.diff(D,q,2).subs(q,t)-fisher)==0)
check('I03 metric coordinate transform',s.trigsimp(s.diff(s.sin(u/2)**2,u)**2/(s.sin(u/2)**2*s.cos(u/2)**2))==1)
z=s.symbols('z');a=s.symbols('a',real=True)
check('C02 circle integral',s.integrate(s.I,(a,0,2*s.pi))==2*s.pi*s.I)
check('C02 z circle integral',s.integrate(s.I*s.exp(2*s.I*a),(a,0,2*s.pi))==0)
check('C03 residue e^z/z^2',s.residue(s.exp(z)/z**2,z,0)==1)
check('C04 residues',s.residue(1/(z*(z-1)),z,0)==-1 and s.residue(1/(z*(z-1)),z,1)==1)
v=s.symbols('v');L=m*v**2/2-k*q**2/2
check('L01 generalized momentum',s.diff(L,v)==m*v)
check('L01 potential force',s.diff(L,q)==-k*q)
L2=m*l**2*v**2/2-m*g*l*(1-s.cos(t))
check('L02 exact equation',s.diff(L2,t)==-m*g*l*s.sin(t))
L3=m*(rd**2+r**2*pd**2)/2
check('L03 angular momentum',s.diff(L3,pd)==m*r*r*pd)
T=s.symbols('T');rr=s.Function('r')(T);phi=s.Function('phi')(T)
check('L03 product rule',s.diff(m*rr**2*s.diff(phi,T),T).expand()==m*rr**2*s.diff(phi,T,2)+2*m*rr*s.diff(rr,T)*s.diff(phi,T))
print(f'{len(checks)} independent mathematical checks passed')
Path(__file__).resolve().parents[1].joinpath('reports/math-checks.json').write_text(json.dumps(dict(passed=len(checks),checks=checks),ensure_ascii=False,indent=2)+'\n')
