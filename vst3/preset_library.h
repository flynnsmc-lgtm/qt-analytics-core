/**
 * ============================================================================
 * CHI PHYSICS UNIFIED CORE — QUANTUM MODULE VST3 PRESET LIBRARY & DSP SPEC
 * ============================================================================
 * File: preset_library.h
 * Architecture: VST3 / Steinberg SDK Compliant DSP Parameter & Preset Matrix
 * Sound Design Grounding: Logic Pro Alchemy 4-Corner (X-Y) Morph Synthesis
 * Base Standard: Continuous Manifold Wave Mechanics (N1 x N2 ≈ N3)
 * Master Carrier: 432.000 Hz Pythagorean A • 7.830 Hz Schumann Lock
 * Headroom: +18.0 dB True Analog Margin (Soft-Knee Tanh Saturation)
 * ============================================================================
 */

#ifndef CHI_PHYSICS_VST3_PRESET_LIBRARY_H
#define CHI_PHYSICS_VST3_PRESET_LIBRARY_H

#include <stdint.h>
#include <stdbool.h>
#include <math.h>
#include <string.h>

#ifdef __cplusplus
namespace ChiPhysics {
namespace Vst3 {
#endif

/* --------------------------------------------------------------------------
 * 1. VST3 PARAMETER IDENTIFIERS (32-bit ParamID)
 * -------------------------------------------------------------------------- */
enum Vst3ParamIDs {
    // Carrier & Infrasonic Frequency
    kParamCarrierFreq       = 1000, // 432.0 Hz nominal [400.0 - 460.0 Hz]
    kParamCarrierDetune     = 1001, // Fine detune [-10.0 to +10.0 Hz]
    kParamSchumannEnable    = 1002, // 7.83 Hz Planetary Infrasonic Lock [0/1]
    kParamSchumannDepth     = 1003, // Schumann Modulation Depth [0.0 - 0.5]
    kParamSubGroundLevel    = 1004, // 54.0 Hz (f0/8) Sub-Bass Anchor [0.0 - 1.0]

    // Continuous Manifold & Tension Parameters
    kParamElphineAlpha      = 1010, // Golden Ratio Spectral Roll-off [1.0 - 3.0]
    kParamTensionSigma      = 1011, // Quark Flux Tension [0.4 - 2.5 GeV/fm]
    kParamSpringK           = 1012, // Linear Restoring Stiffness [100 - 2000 N/m]
    kParamDampingGamma      = 1013, // Viscous Fluid Damping [0.01 - 0.5]

    // Analog Headroom & Saturation
    kParamHeadroomDriveDb   = 1020, // Pre-saturation Drive [0.0 to +18.0 dB]
    kParamHarmonicKappa     = 1021, // Even-Order Harmonic Injection [0.0 - 0.5]
    kParamSoftKneeThreshold = 1022, // Knee Threshold [-6.0 to 0.0 dBu]

    // Logic Alchemy X-Y Modulation & Quadrature Phase
    kParamMorphX            = 1030, // In-Phase Axis (I) [-1.0 to +1.0]
    kParamMorphY            = 1031, // Quadrature Axis (Q) [-1.0 to +1.0]
    kParamPhaseAngleDeg     = 1032, // Continuous Phase θ [0.0 to 360.0°]
    kParamHostRedirectRoute = 1033, // Active Host Quadrant [0, 1, 2, 3]

    // Cymatics & Spatialization
    kParamBesselModeM       = 1040, // Radial Bessel Mode Index [1 - 8]
    kParamBesselModeN       = 1041, // Azimuthal Harmonic Mode Index [1 - 12]
    kParamSpatialSpread     = 1042  // Hypersphere 4D Spatializer Spread [0.0 - 1.0]
};

/* --------------------------------------------------------------------------
 * 2. LOGIC ALCHEMY 4-SOURCE CORNER DEFINITIONS
 * -------------------------------------------------------------------------- */
typedef enum {
    ALCHEMY_SOURCE_A_TUBE_BLOOM   = 0, // Top-Left:     Quad II (90°-180°)  +18dB Saturation Warmth
    ALCHEMY_SOURCE_B_ELPHINE_AIR  = 1, // Top-Right:    Quad I  (0°-90°)    C^inf Continuous Manifold
    ALCHEMY_SOURCE_C_FLUX_TENSION = 2, // Bottom-Left:  Quad III (180°-270°) Quark String/Spring Tension
    ALCHEMY_SOURCE_D_GROUND_SUB   = 3  // Bottom-Right: Quad IV (270°-360°) 54Hz Sub-Anchor + 7.83Hz
} AlchemyCornerSource;

typedef struct {
    float x; // [-1.0, +1.0] Normalized In-Phase (I)
    float y; // [-1.0, +1.0] Normalized Quadrature (Q)
} AlchemyMorphCoords;

typedef struct {
    float weightA; // Source A: Tube Bloom (+18dB)
    float weightB; // Source B: Elphine Air
    float weightC; // Source C: Flux Tension
    float weightD; // Source D: Ground Sub
} AlchemySourceWeights;

/* --------------------------------------------------------------------------
 * 3. VST3 PRESET DATA STRUCTURE
 * -------------------------------------------------------------------------- */
typedef struct {
    const char* id;
    const char* name;
    const char* category;      // "Ground", "Pad", "Lead", "Pluck", "Cymatic", "Overdrive"
    const char* description;
    
    // Logic Alchemy X-Y Vector Initial Position
    AlchemyMorphCoords morphCoords;
    AlchemySourceWeights defaultWeights;

    // Acoustic & Frequency Grounding
    float carrierFreqHz;       // Nominal 432.0 Hz
    float carrierDetuneHz;     // -10.0 to +10.0 Hz
    bool  schumannLockEnabled; // 7.83 Hz lock
    float schumannDepth;       // 0.0 to 0.5
    float subGroundLevel;      // 0.0 to 1.0 (54 Hz level)

    // Physics Engine Coupling
    float elphineAlpha;        // 1.618 Golden Ratio
    float tensionSigma;        // GeV/fm
    float springK;             // N/m

    // Headroom & Saturation
    float headroomDriveDb;     // 0.0 to +18.0 dB
    float harmonicKappa;       // Even harmonic injection
    
    // Cymatics
    int   besselModeM;
    int   besselModeN;

    // VST3 Host Routing
    int   targetQuadrant;      // 0: Quad I, 1: Quad II, 2: Quad III, 3: Quad IV
    const char* redirectHost;
} Vst3AlchemyPreset;

/* --------------------------------------------------------------------------
 * 4. FACTORY PRESET LIBRARY (8 CURATED FOUNDATIONAL PRESETS)
 * -------------------------------------------------------------------------- */
static const Vst3AlchemyPreset kFactoryAlchemyPresets[8] = {
    // 01: GROUND SUB-BASS FOUNDATION (Alchemy Basics Ground)
    {
        "PRESET_01_GROUND_SUB",
        "Ground Sub-Bass Foundation",
        "Ground",
        "Sub-octave 54 Hz anchor coupled with 7.83 Hz Schumann planetary pulse. Deep, visceral acoustic grounding.",
        { 0.75f, -0.75f },                          // Bottom-right quadrant (D dominant)
        { 0.05f, 0.10f, 0.15f, 0.70f },             // Source D: 70%
        432.0f, 0.0f, true, 0.22f, 0.95f,           // 54Hz sub 95%
        1.618f, 0.75f, 320.0f,                      // Compliant elastic
        +3.5f, 0.12f,                               // Gentle warmth
        1, 1,
        3, "host://cymatic-bus/port-432"            // Quadrant IV
    },

    // 02: CONTINUOUS ELPHINE AIR PAD
    {
        "PRESET_02_ELPHINE_AIR",
        "Continuous Elphine Air Pad",
        "Pad",
        "Infinitely differentiable C^inf harmonic curve. Golden ratio spectral roll-off (alpha=1.618). Zero digital aliasing.",
        { 0.65f, 0.70f },                           // Top-right quadrant (B dominant)
        { 0.10f, 0.75f, 0.05f, 0.10f },             // Source B: 75%
        432.0f, +0.15f, false, 0.05f, 0.20f,
        1.618f, 0.50f, 220.0f,                      // Elastic air
        +1.5f, 0.05f,                               // Clean linear
        2, 4,
        0, "vst3://localhost:8080/dsp-bridge"       // Quadrant I
    },

    // 03: QUANTUM PHASE QUADRATURE LEAD
    {
        "PRESET_03_PHASE_LEAD",
        "Quantum Phase Quadrature Lead",
        "Lead",
        "Rotating I/Q quadrature modulation. Fast phase velocity across the 4 VST3 host redirect quadrants.",
        { -0.20f, 0.85f },                          // Near 105° (Quadrant II boundary)
        { 0.45f, 0.45f, 0.05f, 0.05f },
        432.0f, +0.75f, true, 0.10f, 0.35f,
        1.450f, 1.10f, 650.0f,
        +8.0f, 0.25f,                               // Driving saturation
        3, 3,
        1, "host://daw-session-main/ch-1"           // Quadrant II
    },

    // 04: FLUX TUBE TENSION PLUCK
    {
        "PRESET_04_FLUX_PLUCK",
        "Flux Tube Tension Pluck",
        "Pluck",
        "Strings & springs physical modeling under critical confinement tension (sigma=1.85 GeV/fm). Rapid transient attack.",
        { -0.80f, -0.60f },                         // Bottom-left quadrant (C dominant)
        { 0.10f, 0.05f, 0.75f, 0.10f },             // Source C: 75%
        432.0f, -0.25f, false, 0.00f, 0.40f,
        1.800f, 1.85f, 1250.0f,                     // Tense regime
        +6.5f, 0.18f,
        4, 2,
        2, "http://localhost:8080/api/v2/quantum"   // Quadrant III (Anti-Gravity Metric Gateway)
    },

    // 05: CYMATIC CHLADNI BESSEL BELL
    {
        "PRESET_05_CYMATIC_BELL",
        "Cymatic Chladni Bessel Bell",
        "Cymatic",
        "12-fold Chladni nodal symmetry vibrating across the 4D hypersphere S^3 boundary. Resonant acoustic levitation points.",
        { 0.85f, -0.30f },                          // Near 340° (Quadrant IV)
        { 0.15f, 0.25f, 0.10f, 0.50f },
        432.0f, +0.50f, true, 0.18f, 0.60f,
        1.720f, 1.05f, 500.0f,
        +4.0f, 0.15f,
        3, 6,                                       // m=3, n=6 mode
        3, "host://cymatic-bus/port-432"            // Quadrant IV
    },

    // 06: ANALOG HEADROOM OVERDRIVE (+18 dB BLOOM)
    {
        "PRESET_06_HEADROOM_OVERDRIVE",
        "Analog Headroom Overdrive",
        "Overdrive",
        "True analog soft-knee saturation pushing +18.0 dB above nominal parity. Rich even-order harmonic bloom (864 & 1728 Hz).",
        { -0.75f, 0.65f },                          // Top-left quadrant (A dominant)
        { 0.80f, 0.10f, 0.05f, 0.05f },             // Source A: 80%
        432.0f, 0.0f, false, 0.08f, 0.50f,
        1.500f, 1.40f, 750.0f,
        +18.0f, 0.38f,                              // Maximum +18 dB headroom drive
        2, 2,
        1, "host://daw-session-main/ch-1"           // Quadrant II
    },

    // 07: SCHUMANN EARTH INFRASONIC PULSE
    {
        "PRESET_07_SCHUMANN_PULSE",
        "Schumann Earth Infrasonic Pulse",
        "Ground",
        "Planetary cavity entrainment at 7.830 Hz. Dual amplitude and frequency modulation sidebands into human alpha state.",
        { 0.20f, -0.90f },                          // Deep southern coordinate (near 280°)
        { 0.05f, 0.15f, 0.10f, 0.70f },
        432.0f, 0.0f, true, 0.35f, 0.80f,           // 35% Schumann depth
        1.618f, 0.80f, 380.0f,
        +2.0f, 0.08f,
        1, 3,
        3, "host://cymatic-bus/port-432"            // Quadrant IV
    },

    // 08: ALCHEMY 4-CORNER VECTOR MORPH
    {
        "PRESET_08_VECTOR_MORPH",
        "Alchemy 4-Corner Vector Morph",
        "Pad",
        "Dynamic center-equilibrium vector state with equal weighting across all four Alchemy sources and host quadrants.",
        { 0.00f, 0.00f },                           // Center point (0, 0)
        { 0.25f, 0.25f, 0.25f, 0.25f },             // 25% each corner
        432.0f, +0.10f, true, 0.15f, 0.50f,
        1.618f, 1.25f, 600.0f,
        +6.0f, 0.20f,
        2, 4,
        0, "vst3://localhost:8080/dsp-bridge"       // Quadrant I base
    }
};

/* --------------------------------------------------------------------------
 * 5. INLINE DSP & MORPHING MATHEMATICAL UTILITIES
 * -------------------------------------------------------------------------- */

/**
 * Computes 4-corner bilinear morph weights from normalized X-Y coordinates [-1.0, 1.0].
 * Matches Logic Pro Alchemy Remix / Morph Pad geometry:
 * Source A (Top-Left):     x = -1, y = +1
 * Source B (Top-Right):    x = +1, y = +1
 * Source C (Bottom-Left):  x = -1, y = -1
 * Source D (Bottom-Right): x = +1, y = -1
 */
static inline void calcAlchemyMorphWeights(float x, float y, AlchemySourceWeights* out) {
    if (!out) return;
    // Clamp to [-1.0, 1.0]
    float cx = (x < -1.0f) ? -1.0f : ((x > 1.0f) ? 1.0f : x);
    float cy = (y < -1.0f) ? -1.0f : ((y > 1.0f) ? 1.0f : y);

    // Map [-1, 1] to [0, 1]
    float u = (cx + 1.0f) * 0.5f; // 0 = Left, 1 = Right
    float v = (cy + 1.0f) * 0.5f; // 0 = Bottom, 1 = Top

    out->weightA = (1.0f - u) * v;          // Top-Left (A)
    out->weightB = u * v;                   // Top-Right (B)
    out->weightC = (1.0f - u) * (1.0f - v); // Bottom-Left (C)
    out->weightD = u * (1.0f - v);          // Bottom-Right (D)
}

/**
 * Calculates continuous quadrature phase angle θ in degrees [0, 360)
 * from In-Phase (X) and Quadrature (Y) coordinates.
 */
static inline void calcQuadraturePhase(float x, float y, float* phaseDeg, float* iVal, float* qVal) {
    float angleRad = atan2f(y, x);
    if (angleRad < 0.0f) {
        angleRad += 6.28318530718f; // + 2*pi
    }
    float deg = angleRad * (180.0f / 3.14159265359f);
    if (deg >= 360.0f) deg -= 360.0f;

    if (phaseDeg) *phaseDeg = deg;
    if (iVal) *iVal = cosf(angleRad);
    if (qVal) *qVal = sinf(angleRad);
}

/**
 * Returns the target host redirect URI and quadrant index [0..3]
 * based on the continuous phase angle θ ∈ [0°, 360°).
 */
static inline int getHostRedirectByPhase(float phaseDeg, const char** outHostUri) {
    int quadrant = 0;
    const char* uri = "vst3://localhost:8080/dsp-bridge";

    if (phaseDeg >= 0.0f && phaseDeg < 90.0f) {
        quadrant = 0; // Quadrant I: Primary Local DSP Bridge
        uri = "vst3://localhost:8080/dsp-bridge";
    } else if (phaseDeg >= 90.0f && phaseDeg < 180.0f) {
        quadrant = 1; // Quadrant II: Secondary Quantum Engine
        uri = "host://daw-session-main/ch-1";
    } else if (phaseDeg >= 180.0f && phaseDeg < 270.0f) {
        quadrant = 2; // Quadrant III: Anti-Gravity Metric Gateway
        uri = "http://localhost:8080/api/v2/quantum";
    } else {
        quadrant = 3; // Quadrant IV: Cymatic Harmonic Lattice Bus
        uri = "host://cymatic-bus/port-432";
    }

    if (outHostUri) *outHostUri = uri;
    return quadrant;
}

/**
 * Applies the "+18 dB Crossed Par" elastic soft-knee saturation transfer curve:
 * V_out = V_sat * tanh(V_in / V_thresh) + kappa * (V_in / V_thresh)^2
 */
static inline float applyHeadroomSaturation(float inputSample, float driveDb, float kappa) {
    float linearDrive = powf(10.0f, driveDb / 20.0f);
    float driven = inputSample * linearDrive;
    
    // Hyperbolic tangent soft-knee compression
    float saturated = tanhf(driven);

    // Controlled even-harmonic injection (tube warmth)
    float evenHarmonic = kappa * (driven * driven) * 0.15f;

    return saturated + evenHarmonic;
}

#ifdef __cplusplus
} // namespace Vst3
} // namespace ChiPhysics
#endif

#endif // CHI_PHYSICS_VST3_PRESET_LIBRARY_H
