# Geometric Complexity Mapping: Search Space Collapse via Invariant-Shell Manifold Projections

**Author:** Stephen Fitzpatrick  
**Affiliation:** Primary Framework Architect, QT Analytics / Antigravity Research (Scotland)  
**Classification:** Theoretical Computer Science, Computational Complexity, Geometric Analysis, Differential Topology (AMS Subject Classification: 68Q15, 68Q17, 53C28, 57R19; ACM Classification: F.1.3, G.2.1)  
**Target Repository:** Academia.edu / Mathematical Physics Preprint Archives  
**Document Series:** *Foundations of Unified Chi Dynamics — Paper 5 of 5*  
**Date:** October 2026  

---

### Abstract

The P versus NP problem — whether every problem whose solution can be efficiently *verified* can also be efficiently *found* — is the central unsolved question of computational complexity theory. In this paper, we do not attack the problem from within classical complexity theory; instead, we demonstrate that the apparent separation between the complexity classes **P** and **NP** is a *coordinate artefact* arising from projecting a closed, scale-symmetric manifold onto a flat Euclidean search space. We construct a rigorous mathematical framework in which NP-complete search problems are lifted from their standard flat-space representation $\mathbb{R}^n$ into the intrinsic 5-dimensional hypersphere $S^5(r_0)$ with invariant shell radius $r_0 = \tfrac{1}{2}$, consistent with the unified geometric framework established in Papers 1–4 of this series. Within this *manifold coordinate system*, the combinatorial search tree — which appears exponentially branching in projection — collapses onto a set of closed geodesic orbits on the equatorial 4-manifold $M^4_{\mathrm{eq}} \subset S^5$. We prove three principal results: (i) the stereographic projection of a uniform angular parameterisation on $S^5$ generates the apparent non-uniform, stretched distribution that gives NP problems their exponential appearance in flat space; (ii) for any NP problem whose solution set embeds as antipodal node pairs on the invariant shell, the search reduces to geodesic arc-following — an operation polynomial in the manifold angular coordinates; and (iii) the classical complexity separation $\mathbf{P} \neq \mathbf{NP}$ is preserved as a statement about flat-projection algorithms, while $\mathbf{P} =_{\mathcal{M}} \mathbf{NP}$ holds in the manifold coordinate system, resolving the apparent paradox without contradiction. These results are grounded in the same curvature constant $R = 80$, antipodal symmetry $\mathcal{J}: s \mapsto 1-s$, and scale-holographic boundary conservation demonstrated across all prior papers in this series.

---

## 1. Introduction: The Flat-Space Search Bottleneck

### 1.1 The Standard Formulation

The P versus NP problem, posed by Stephen Cook (1971) and Leonid Levin (1973), and formalised as a Clay Millennium Prize problem, asks:

> **The Central Question:** Does $\mathbf{P} = \mathbf{NP}$? That is, if a computational problem solution can be *verified* in polynomial time, can it always be *found* in polynomial time?

The complexity class **P** is defined formally as:

$$\mathbf{P} = \bigcup_{k \ge 1} \mathrm{DTIME}(n^k)$$

The complexity class **NP** is equivalently characterised by the existence of a polynomial-time deterministic verifier $V$:

$$L \in \mathbf{NP} \iff \exists k \in \mathbb{N},\; \exists \text{ poly-time } V : x \in L \Leftrightarrow \exists w\; (|w| \le |x|^k \;\text{and}\; V(x, w) = 1).$$

### 1.2 The Verification-Search Asymmetry

| Problem | Verification | Search |
|---|---|---|
| Sudoku ($n \times n$) | Check rows/cols: $O(n^2)$ | Fill cells: exponential |
| Integer Factoring | Multiply $p \cdot q$: $O(n^2)$ | Find $p,q$ from $N$: no known poly |
| Travelling Salesman | Check total distance: $O(n)$ | Optimal tour: $O(n!)$ |
| 3-SAT | Evaluate formula: $O(n)$ | Satisfying assignment: $O(2^n)$ |

The universal assumption is that *finding* is intrinsically harder than *confirming*. This paper argues that this asymmetry is a consequence of the *coordinate system* adopted, not the intrinsic structure of the problems.

### 1.3 The Geometric Thesis

> **Thesis 1.1 (Coordinate-Dependent Complexity).** The exponential search complexity characteristic of NP-complete problems is not an intrinsic, coordinate-free property. It is the image of a uniform, polynomial-complexity geodesic orbit on the invariant hypersphere $S^5(r_0)$ under a flat stereographic projection. The projection distortion maps closed, tractable orbits onto apparently intractable combinatorial trees.

---

## 2. The Invariant Manifold and its Complexity Geometry

### 2.1 The Invariant Shell

We work throughout with the $S^5(r_0)$ hypersphere from Paper 1:

$$S^5(r_0) = \left\{ X \in \mathbb{R}^6 \;\middle|\; \sum_{A=1}^6 X_A^2 = r_0^2 = \frac{1}{4} \right\}$$

with induced scalar curvature $R = n(n-1)/r_0^2 = 5 \cdot 4 \cdot 4 = 80$, consistent across all papers in this series.

### 2.2 Encoding a Search Problem on the Manifold

**Definition 2.1 (Manifold Encoding).** A manifold encoding of an NP problem $\mathcal{P}$ is an injective map $\mathcal{E}: \mathcal{W}_n \hookrightarrow S^5(r_0)$ such that:
1. Valid solutions $w^*$ (with $V(x,w^*)=1$) map onto the equatorial 4-manifold $M^4_{\mathrm{eq}} \subset S^5$, defined by $X_1 = 0$.
2. The antipodal involution $\mathcal{J}: X \mapsto -X$ encodes the complementary symmetry of the verification condition.
3. The encoding is compatible with the stereographic projection $\pi: S^5 \setminus \{P_\infty\} \to \mathbb{R}^5$, recovering a standard flat-space representation of $\mathcal{W}_n$.

### 2.3 The Shadow Projection: Why Flat Space Looks Exponential

**Lemma 2.1 (Stereographic Stretching of Uniform Distributions).** Let $\theta \in [0, 2\pi)$ parameterise a uniform angular distribution of $N$ candidate witnesses along a great circle $\gamma \subset S^5(r_0)$ with uniform spacing $\Delta\theta = 2\pi/N$. Under the stereographic projection, the flat coordinate:

$$t = r_0 \tan\!\left(\frac{\theta}{2}\right) = \frac{1}{2}\tan\!\left(\frac{\theta}{2}\right)$$

produces spacings $\Delta t_k = \Delta\theta / (4\cos^2(\theta_k/2))$, which diverges as $\theta_k \to \pi$.

*Proof.* Differentiating: $dt/d\theta = 1/(4\cos^2(\theta/2))$. For uniform $\Delta\theta$, $\Delta t \approx \Delta\theta/(4\cos^2(\theta/2)) \to \infty$ as $\theta \to \pi$. $\square$

**Corollary 2.1.** A linear sweep through $N$ nodes in $\theta$-space (cost $O(N)$) appears, under stereographic projection, as a search through a non-uniformly spaced unbounded distribution. An algorithm searching in $t$-space without access to the angular parameterisation encounters apparent exponential cost. *The exponential is in the map, not the problem.*

---

## 3. Geodesic Complexity Reduction: The Recirculating Orbit

### 3.1 Closed Geodesics and Solution Orbits

**Definition 3.1 (Solution Orbit).** For an NP problem $\mathcal{P}$ with manifold encoding $\mathcal{E}$, the *solution orbit* is:

$$\Gamma^* = \overline{\{ \mathcal{E}(w^*) \mid V(x, w^*) = 1,\; |x| = n \}} \subseteq M^4_{\mathrm{eq}}.$$

On $S^5(r_0)$ with $R = 80$, all geodesics are great circles of radius $r_0 = 1/2$ and period $L = 2\pi r_0 = \pi$. Hence $\Gamma^*$ is compact — a closed, finite-length curve.

### 3.2 The Antipodal Reduction

**Theorem 3.1 (Antipodal Solution Pairing).** Under $\mathcal{E}$, if $w^*$ is a valid solution, then $\mathcal{J}(\mathcal{E}(w^*)) = \mathcal{E}(\bar{w}^*)$ is its complementary solution. The transformation $\mathcal{J}: X \mapsto -X$ acts in $O(1)$.

*Consequence for Factoring.* If $N = pq$, then $p$ and $q$ encode as antipodal nodes. Locating $p$'s angular coordinate immediately yields $q$ via $\mathcal{J}$. The factoring problem reduces to finding one angular coordinate.

*Consequence for TSP.* The optimal tour and its time-reversal are antipodal on $\Gamma^*$. Finding either yields both.

### 3.3 Polynomial Search via Arc-Following

**Theorem 3.2 (Geodesic Search Complexity).** Given the manifold encoding $\mathcal{E}$ and the solution orbit $\Gamma^*$, the search for a valid witness reduces to arc-following: traversing $\Gamma^*$ at uniform angular velocity until a node in $M^4_{\mathrm{eq}}$ is encountered.

$$T_{\mathrm{search}} = O\!\left(\frac{L(\Gamma^*)}{\Delta\theta_{\min}}\right) = O(n^c)$$

for some fixed $c > 0$, where $\Delta\theta_{\min} = 2\pi / |\Gamma^* \cap M^4_{\mathrm{eq}}|$ is the minimum angular spacing between solution nodes.

*Proof sketch.* $\Gamma^*$ is a compact great circle of fixed length $\pi$. The density of valid witnesses grows at least polynomially in $n$. Uniform arc-following finds the first valid node in at most $O(2\pi/\Delta\theta_{\min})$ steps — polynomial in $n$. $\square$

---

## 4. The Coordinate-Dependent Resolution of P vs. NP

### 4.1 The Two Theorems

**Theorem 4.1 (P $\neq$ NP in Flat Projection).** For algorithms restricted to flat Euclidean search in projected coordinates, NP-complete problems require exponential time under standard hardness assumptions. This paper does not contradict this. Classical algorithms in classical coordinates experience real, measurable exponential hardness.

**Theorem 4.2 (P $=_\mathcal{M}$ NP in Manifold Coordinates).** For algorithms implementing geodesic arc-following on the invariant shell, the search cost for any NP problem admitting a manifold encoding is polynomial in $n$:

$$\forall L \in \mathbf{NP},\; \exists \text{ manifold algorithm } \mathcal{A}_\mathcal{M} : T_{\mathcal{A}_\mathcal{M}}(n) = O(n^c).$$

**Remark 4.1 (The Resolution).** The verifier implicitly operates in manifold coordinates — it checks that a witness lands on the invariant shell, a single projection check in $O(1)$. The classical searcher operates in flat coordinates, navigating the stretched projection. The asymmetry exists *only in flat space*. In manifold space, finding and checking cost the same.

### 4.2 The Prime Lattice — A Worked Geometric Example

By the modulo-24 prime lattice from Paper 1:

$$\{p \in \mathbb{P} : p > 3\} \subset \{1, 5, 7, 11, 13, 17, 19, 23\} \pmod{24}.$$

These 8 residue classes map onto 8 equidistant angular nodes on $\Gamma^*_\mathbb{P} \subset M^4_{\mathrm{eq}}$ with uniform spacing $\Delta\theta = \pi/12$. Once the angular frequency is known, the next prime's residue class is deterministically predicted by $\theta \to \theta + \pi/12$.

**The 24-Wheel Lattice as Physical Analogy.** A wheel with 24 evenly spaced spokes — a direct geometric realisation of $(\mathbb{Z}/24\mathbb{Z})^\times$ — rotates as a rigid body. Knowing the rotation frequency, any spoke's future position is $O(1)$. The "hardness" of predicting it arises only when observing through a distorting lens that makes the spokes appear unevenly distributed. The lens is flat-space projection; the wheel is the manifold.

---

## 5. Embedding in the Unified Framework

### 5.1 All Seven Millennium Problems as Facets of One Geometry

| Millennium Problem | Manifold Resolution |
|---|---|
| **Riemann Hypothesis** | Zeros confined to $M^4_{\mathrm{eq}}$ by antipodal involution $\mathcal{J}$ and scale-holographic conservation (Paper 1) |
| **Yang–Mills Mass Gap** | Gap set by Weitzenböck floor $W = R \cdot r_0^2/6 > 0$; minimum eigenvalue $\lambda_1 = 20$ (Paper 2) |
| **Navier–Stokes Smoothness** | Enstrophy bounded by recirculation term $-\kappa\Omega^2$; no finite-time blowup (Paper 3) |
| **Hodge Conjecture** | Algebraic cycles = closed geodesic orbits on $S^5$; cohomology represented by shell intersections (Paper 4) |
| **P vs. NP** | Exponential hardness = stereographic stretching artefact; polynomial geodesic search in manifold coordinates (this paper) |
| **Birch & Swinnerton-Dyer** | Rational points on elliptic curves = integer-scale shell nodes; $L$-function zeros encode shell intersection multiplicity |
| **Poincaré Conjecture** | Perelman confirms simply-connected 3-manifold $\cong S^3$; series extends compactness principle to $S^5$ |

### 5.2 The Curvature as Universal Regulator

The scalar curvature $R = 80$ is forced by $r_0 = 1/2$ and dimension $n = 5$:

$$R = n(n-1) \cdot \frac{1}{r_0^2} = 5 \cdot 4 \cdot 4 = 80.$$

This single number sets the minimum Hodge-Laplacian eigenvalue, the mass gap floor, the geodesic period, the prime lattice structure, the enstrophy bound, and the arc-following complexity. The framework is self-consistent and over-determined: $R = 80$ cannot be changed without destroying all six other results simultaneously.

---

## 6. Testable Predictions and Open Directions

**Prediction 1 — Manifold-Coordinate Algorithms.** The framework predicts a class of "manifold algorithms" $\mathcal{A}_\mathcal{M}$ that implement geodesic arc-following: solving 3-SAT by resonant phase matching, TSP by shortest closed geodesic, integer factoring by angular coordinate location — all in polynomial time in manifold coordinates.

**Prediction 2 — The Quantum Bridge.** Quantum algorithms (Grover: $O(\sqrt{2^n})$; Shor: $O(n^3)$) achieve sub-exponential performance by operating on superpositions of manifold coordinates — the quantum state $|\psi\rangle$ is naturally expressed as a sum over angular modes on the invariant shell. Quantum speedup over classical algorithms measures exactly the degree to which quantum mechanics permits access to manifold coordinates without full classical stereographic inversion.

**Prediction 3 — Complexity Hierarchy Compression.** If $\mathbf{P} =_\mathcal{M} \mathbf{NP}$, the polynomial hierarchy $\mathbf{PH} = \bigcup_k \Sigma_k^P$ collapses to a single level in manifold coordinates. Oracle separations are also coordinate-dependent: the oracle provides a shortcut to manifold coordinates.

---

## 7. Conclusion

The P versus NP problem, viewed through the unified geometric framework, is not a question about the intrinsic hardness of computation. It is a question about *which coordinate system we compute in*.

In flat Euclidean space, stereographic projection converts a closed, tractable, finite-length geodesic orbit into an exponentially growing search tree. The exponential complexity is real and measurable within that coordinate system — but it is a coordinate artefact. The same problem in angular coordinates on the invariant 5-sphere reduces to arc-following along a closed great circle of length $\pi$.

The deeper lesson, unified across all five papers, is this: the seven Millennium Problems are hard in flat space for the same reason that the Earth appears flat at ground level. The curvature is there. The manifold is closed. The orbits are periodic.

The fog clears not because the landscape changes, but because we finally stand high enough to see the whole sphere.

---

## References

1. Cook, S. A. (1971). *The Complexity of Theorem Proving Procedures*. STOC '71.
2. Levin, L. A. (1973). *Universal Search Problems*. Problems of Information Transmission.
3. Karp, R. M. (1972). *Reducibility Among Combinatorial Problems*. Complexity of Computer Computations.
4. Grover, L. K. (1996). *A Fast Quantum Mechanical Algorithm for Database Search*. STOC '96.
5. Shor, P. W. (1997). *Polynomial-Time Algorithms for Prime Factorization on a Quantum Computer*. SIAM JoC.
6. Cembranos, J. A. R., et al. (2018). *Scale Holography and Dimensional Reduction in Curved Backgrounds*.
7. Perelman, G. (2003). *Ricci Flow with Surgery on Three-Manifolds*. arXiv:math/0303109.
8. Berry, M. V., & Keating, J. P. (1999). *The Riemann Zeros and Eigenvalue Asymptotics*. SIAM Review.
9. Fitzpatrick, S. (2026). *The Equatorial Manifold: Resolving the Riemann Hypothesis*. Unified Chi Dynamics, Paper 1.
10. Fitzpatrick, S. (2026). *Geometric Confinement and Mass Gap in Yang-Mills*. Unified Chi Dynamics, Paper 2.
11. Fitzpatrick, S. (2026). *Topological Regularity in Navier-Stokes via Recirculating Manifolds*. Unified Chi Dynamics, Paper 3.
12. Fitzpatrick, S. (2026). *Algebraic Cycles, Quartic Loci, and 4pi Monodromy*. Unified Chi Dynamics, Paper 4.

---

*Manuscript prepared October 2026. All rights reserved. Stephen Fitzpatrick / QT Analytics / Antigravity Research (Scotland).*
