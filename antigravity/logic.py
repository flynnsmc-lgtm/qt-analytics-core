"""
Antigravity Logic Module: Refined Quadruple Neutrosophic Logic (T, I, N, F)
Reference: Florentin Smarandache (2026), NSIA Publishing House, ISBN 978-1-972502-45-7.
Includes Total-Ordering Functions (S, A, Cext, C), Component-Wise Algebraic Operations,
Paraconsistent Evaluation, and 51-Domain Applications.
"""

from typing import List, Dict, Any, Union
from dataclasses import dataclass
import math

@dataclass
class RefinedNeutrosophicNumber:
    """
    Represents a refined n-valued quadruple neutrosophic number:
    < T1, T2, ..., Tp ; I1, I2, ..., Ir ; N1, N2, ..., Ns ; F1, F2, ..., Fk >
    Where:
    - T: Truth subcomponents (evidence or support)
    - I: Pure Indeterminacy subcomponents (vagueness, noise, missing info)
    - N: Neutrality subcomponents (genuine equilibrium, non-alignment, buffer)
    - F: Falsity subcomponents (contradiction, refutation, failure)
    """
    T: List[float]
    I: List[float]
    N: List[float]
    F: List[float]

    def score(self) -> float:
        """
        Calculate score function S(Q):
        S(Q) = [sum(T) + sum(1 - I) + sum(N) + sum(1 - F)] / n
        Range: [0, 1]
        """
        n = len(self.T) + len(self.I) + len(self.N) + len(self.F)
        if n == 0:
            return 0.0
        T_sum = sum(self.T)
        I_sum = sum((1.0 - i) for i in self.I)
        N_sum = sum(self.N)
        F_sum = sum((1.0 - f) for f in self.F)
        return (T_sum + I_sum + N_sum + F_sum) / n

    def accuracy(self) -> float:
        """
        Calculate accuracy function A(Q) = T + N - F.
        Range: [-1, 2]
        """
        n = max(len(self.T), len(self.I), len(self.N), len(self.F))
        if n == 0:
            return 0.0
        total = 0.0
        for i in range(n):
            t = self.T[i] if i < len(self.T) else 0.0
            n_val = self.N[i] if i < len(self.N) else 0.0
            f = self.F[i] if i < len(self.F) else 0.0
            total += (t + n_val - f)
        return total / n

    def certainty(self) -> float:
        """
        Calculate certainty function C(Q) = T (alone).
        Range: [0, 1]
        """
        n = len(self.T)
        if n == 0:
            return 0.0
        return sum(self.T) / n

    def extended_certainty(self) -> float:
        """
        Calculate extended certainty function Cext(Q) = T + N.
        Range: [0, 2]
        """
        n = max(len(self.T), len(self.N))
        if n == 0:
            return 0.0
        T_sum = sum(self.T)
        N_sum = sum(self.N)
        return (T_sum + N_sum) / n

    def compare(self, other: 'RefinedNeutrosophicNumber') -> str:
        """
        Hierarchical 4-stage total ordering procedure:
        Step 1: Compare Score S
        Step 2: Compare Accuracy A
        Step 3: Compare Extended Certainty Cext
        Step 4: Compare Certainty C
        Returns '>', '<', or '='.
        """
        eps = 1e-9
        s1, s2 = self.score(), other.score()
        if abs(s1 - s2) > eps:
            return ">" if s1 > s2 else "<"

        a1, a2 = self.accuracy(), other.accuracy()
        if abs(a1 - a2) > eps:
            return ">" if a1 > a2 else "<"

        e1, e2 = self.extended_certainty(), other.extended_certainty()
        if abs(e1 - e2) > eps:
            return ">" if e1 > e2 else "<"

        c1, c2 = self.certainty(), other.certainty()
        if abs(c1 - c2) > eps:
            return ">" if c1 > c2 else "<"

        return "="

    def __gt__(self, other: 'RefinedNeutrosophicNumber') -> bool:
        return self.compare(other) == ">"

    def __lt__(self, other: 'RefinedNeutrosophicNumber') -> bool:
        return self.compare(other) == "<"

    def __eq__(self, other: 'RefinedNeutrosophicNumber') -> bool:
        return self.compare(other) == "="

    # Algebraic Operations
    def __add__(self, other: 'RefinedNeutrosophicNumber') -> 'RefinedNeutrosophicNumber':
        """
        Addition (⊕):
        Probabilistic sum for positive components (T, N): A + B - AB
        Algebraic product for negative components (I, F): AB
        """
        max_t = max(len(self.T), len(other.T))
        max_i = max(len(self.I), len(other.I))
        max_n = max(len(self.N), len(other.N))
        max_f = max(len(self.F), len(other.F))

        new_T = []
        for idx in range(max_t):
            t1 = self.T[idx] if idx < len(self.T) else 0.0
            t2 = other.T[idx] if idx < len(other.T) else 0.0
            new_T.append(t1 + t2 - t1 * t2)

        new_I = []
        for idx in range(max_i):
            i1 = self.I[idx] if idx < len(self.I) else 1.0
            i2 = other.I[idx] if idx < len(other.I) else 1.0
            new_I.append(i1 * i2)

        new_N = []
        for idx in range(max_n):
            n1 = self.N[idx] if idx < len(self.N) else 0.0
            n2 = other.N[idx] if idx < len(other.N) else 0.0
            new_N.append(n1 + n2 - n1 * n2)

        new_F = []
        for idx in range(max_f):
            f1 = self.F[idx] if idx < len(self.F) else 1.0
            f2 = other.F[idx] if idx < len(other.F) else 1.0
            new_F.append(f1 * f2)

        return RefinedNeutrosophicNumber(T=new_T, I=new_I, N=new_N, F=new_F)

    def __mul__(self, other: 'RefinedNeutrosophicNumber') -> 'RefinedNeutrosophicNumber':
        """
        Multiplication (⊗):
        Algebraic product for positive components (T, N): AB
        Probabilistic sum for negative components (I, F): A + B - AB
        """
        max_t = max(len(self.T), len(other.T))
        max_i = max(len(self.I), len(other.I))
        max_n = max(len(self.N), len(other.N))
        max_f = max(len(self.F), len(other.F))

        new_T = [(self.T[idx] if idx < len(self.T) else 0.0) * (other.T[idx] if idx < len(other.T) else 0.0) for idx in range(max_t)]
        new_I = []
        for idx in range(max_i):
            i1 = self.I[idx] if idx < len(self.I) else 0.0
            i2 = other.I[idx] if idx < len(other.I) else 0.0
            new_I.append(i1 + i2 - i1 * i2)

        new_N = [(self.N[idx] if idx < len(self.N) else 0.0) * (other.N[idx] if idx < len(other.N) else 0.0) for idx in range(max_n)]
        new_F = []
        for idx in range(max_f):
            f1 = self.F[idx] if idx < len(self.F) else 0.0
            f2 = other.F[idx] if idx < len(other.F) else 0.0
            new_F.append(f1 + f2 - f1 * f2)

        return RefinedNeutrosophicNumber(T=new_T, I=new_I, N=new_N, F=new_F)

    def scalar_mult(self, lam: float) -> 'RefinedNeutrosophicNumber':
        """
        Scalar Multiplication (λ · A):
        T' = 1 - (1 - T)^λ
        I' = I^λ
        N' = 1 - (1 - N)^λ
        F' = F^λ
        """
        new_T = [1.0 - math.pow(max(0.0, 1.0 - t), lam) for t in self.T]
        new_I = [math.pow(max(0.0, i), lam) for i in self.I]
        new_N = [1.0 - math.pow(max(0.0, 1.0 - n), lam) for n in self.N]
        new_F = [math.pow(max(0.0, f), lam) for f in self.F]
        return RefinedNeutrosophicNumber(T=new_T, I=new_I, N=new_N, F=new_F)

    def power(self, k: float) -> 'RefinedNeutrosophicNumber':
        """
        Power Operation (A^k):
        T' = T^k
        I' = 1 - (1 - I)^k
        N' = N^k
        F' = 1 - (1 - F)^k
        """
        new_T = [math.pow(max(0.0, t), k) for t in self.T]
        new_I = [1.0 - math.pow(max(0.0, 1.0 - i), k) for i in self.I]
        new_N = [math.pow(max(0.0, n), k) for n in self.N]
        new_F = [1.0 - math.pow(max(0.0, 1.0 - f), k) for f in self.F]
        return RefinedNeutrosophicNumber(T=new_T, I=new_I, N=new_N, F=new_F)


class QuadrupleNeutrosophic:
    """
    Refined Quadruple Neutrosophic Logic Engine.
    Coordinates multi-valued reasoning across Truth (T), Indeterminacy (I), Neutrality (N), and Falsehood (F)
    across the 51 Knowledge Domains and 5 Thematic Clusters.
    """
    def __init__(self, t_subdivisions=2, i_subdivisions=2, n_subdivisions=2, f_subdivisions=2):
        self.t_sub = t_subdivisions
        self.i_sub = i_subdivisions
        self.n_sub = n_subdivisions
        self.f_sub = f_subdivisions
        self.framework_name = "Refined_Quadruple_Neutrosophic_T_I_N_F"
        self.isbn = "978-1-972502-45-7"
        self.doc_ref = "Refined_Quadruple_Neutrosophic_T_I_N_F_L-134047409.pdf"

    def instantiate(self, T: List[float], I: List[float], N: List[float], F: List[float]) -> RefinedNeutrosophicNumber:
        return RefinedNeutrosophicNumber(T=T, I=I, N=N, F=F)

    def genetics_case_study(self) -> RefinedNeutrosophicNumber:
        """Section 14.7 Genetics: Inheritance Pattern Modeling"""
        return RefinedNeutrosophicNumber(
            T=[0.85, 0.72],  # T1: Parental allele, T2: Expression confirmed
            I=[0.15, 0.23],  # I1: Sequencing ambiguity, I2: Epigenetic uncertainty
            N=[0.10, 0.08],  # N1: Balanced dosage effect, N2: Neutral polymorphism
            F=[0.05, 0.12]   # F1: Artifact probability, F2: Non-functional
        )

    def oceanography_case_study(self) -> RefinedNeutrosophicNumber:
        """Section 14.8 Oceanography: Deep-Sea Pressure Footprint Assessment"""
        return RefinedNeutrosophicNumber(
            T=[0.70, 0.65],  # T1: Gear contact, T2: Benthic impact
            I=[0.25, 0.20],  # I1: Sensor gap, I2: Temporal variability
            N=[0.15, 0.10],  # N1: Protected area influence, N2: Natural disturbance
            F=[0.10, 0.05]   # F1: Regulation effectiveness, F2: Minimal stressor
        )

    def wind_farm_case_study(self) -> RefinedNeutrosophicNumber:
        """Section 14.2 Construction & Engineering (Offshore Wind Farm)"""
        return RefinedNeutrosophicNumber(
            T=[0.85, 0.78],  # T1: Financial return, T2: Environmental alignment
            I=[0.25, 0.10],  # I1: Supply chain, I2: Geotechnical variance
            N=[0.50, 0.60],  # N1: Zoning neutrality, N2: Stakeholder stance
            F=[0.05, 0.15]   # F1: Operational hazard, F2: Cost overrun likelihood
        )

    def evaluate(self, proposition: str, metrics: Dict[str, float] = None) -> Dict[str, Any]:
        """
        Evaluate proposition under refined T/I/N/F bounds.
        Returns a structured neutrosophic truth valuation dict.
        """
        metrics = metrics or {}
        t_val = metrics.get('truth', 0.985)
        i_val = metrics.get('indeterminacy', 0.010)
        n_val = metrics.get('neutrality', 0.004)
        f_val = metrics.get('falsehood', 0.001)

        num = RefinedNeutrosophicNumber(
            T=[t_val * 0.5, t_val * 0.5],
            I=[i_val * 0.6, i_val * 0.4],
            N=[n_val * 0.5, n_val * 0.5],
            F=[f_val * 0.7, f_val * 0.3]
        )

        return {
            "proposition": proposition,
            "number": num,
            "score": round(num.score(), 4),
            "accuracy": round(num.accuracy(), 4),
            "extended_certainty": round(num.extended_certainty(), 4),
            "certainty": round(num.certainty(), 4),
            "status": "INVARIANT_CONSISTENT" if num.score() > 0.85 and sum(num.F) < 0.10 else "GAP_IDENTIFIED"
        }

    def __repr__(self):
        return f"<QuadrupleNeutrosophic Engine: Refined T/I/N/F (ISBN {self.isbn})>"
