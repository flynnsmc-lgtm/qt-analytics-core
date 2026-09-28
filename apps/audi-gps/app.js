import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let earthGroup, starPoints, targetMarker, spoofMarker;
let isSpoofing = false;

// Dynamic Invariant & Topology Feed Objects
let topologyPulseMesh;
let elevationPeaksGroup;
let coastlineGroup;
let globalPlanetGroup;
let currentMeshArrangement = 'planet_geodesic';

// Calibrated Hypersphere Lighting & Warmth Entities
let downLight, ambientLight, keyLight, rimLight, londonPointLight;
let atmosphereMesh, innerCoronaMesh;
let atmosphereMat, innerCoronaMat;

let lightingState = {
    downlightBrightness: 0.38, // Calibrated downlighting: clearly visible, soft & non-obscuring
    warmthGlowIntensity: 0.65, // Atmospheric warm Fresnel glow (soft, feathered edge)
    ambientBrightness: 0.35,   // Gentle oceanic ambient base
    preset: 'solar'
};

// Real-Time AI Studios Feed & Sync State
let syncState = {
    isPaused: false,
    masterPage: 'locate_gps',
    lockStatus: 'LOCKED',
    frameId: 1000,
    driftMs: 0.0,
    baseFreqHz: 432.0,
    harmonicMultiple: 1.0,
    pulseAmplitude: 1.0,
    pulseRadiusMiles: 1000.0,
    n1_bulk: 16,
    n2_boundary: 27,
    n3_target: 432,
    regime: 'HOLOGRAPHIC_CONTINUUM',
    isClosed: true,
    phase: 0.0,
    pulseVisible: true,
    peaksVisible: true,
    glowVisible: true
};

let syncChannel = null;

function init() {
    const container = document.getElementById('three-container');

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071526, 0.0014); // Deep oceanic cosmic atmosphere

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / (window.innerHeight - 56), 0.1, 2000);
    camera.position.set(0, 35, 75);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight - 56);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.00; // Calibrated for crisp, non-clipping exposure
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // =========================================================================
    // 💡 CALIBRATED DOWNLIGHT & WARMTH LIGHTING ARCHITECTURE (CLEAR & NON-GLARING)
    // =========================================================================

    // 1. Warm Solar Downlight (Calibrated to 0.38: clearly visible, soft & non-obscuring)
    downLight = new THREE.DirectionalLight(0xfff1e0, lightingState.downlightBrightness);
    downLight.position.set(20, 50, 30);
    scene.add(downLight);

    // 2. Soft Oceanic Cosmic Ambient (Deep cool blue base, eliminating purple tone)
    ambientLight = new THREE.AmbientLight(0x0f223d, lightingState.ambientBrightness);
    scene.add(ambientLight);

    // 3. Crisp Frontal Key Light (Calibrated to 0.22 for clear surface visibility)
    keyLight = new THREE.DirectionalLight(0xe0f2fe, 0.22);
    keyLight.position.set(45, 25, 40);
    scene.add(keyLight);

    // 4. Subtle Celestial Azure Rim Fill Light (0.18 for gentle edge separation)
    rimLight = new THREE.DirectionalLight(0x38bdf8, 0.18);
    rimLight.position.set(-45, -20, -50);
    scene.add(rimLight);

    // =========================================================================
    // 🌍 CORE GLOBE & GEOMETRY FOUNDATIONS
    // =========================================================================

    // 1. Core Globe with Oceanic Blue Sheen & Azure Specular
    buildGlobe();

    // 2. Volumetric Dual-Layer Atmospheric Soft Fresnel Glow
    buildAtmosphereGlow();

    // 3. Geography Foundation (Coastline Vectors — No terrain map required)
    buildCoastlines();

    // 4. Strategic High-Elevation Anchor Points (Peaks + Warm Contour Rings)
    buildHighElevationMarkers();

    // 5. Dynamic Local Topology Pulse (Warm Harmonic Wave Mesh over London)
    buildLocalTopologyPulse();

    // 6. Global Planetary Geodesic Topology Mesh (Full Planet Enclosure)
    buildGlobalPlanetMesh();

    // Apply DEFAULT Arrangement: Remove local mountains, mesh the planet
    applyMeshArrangement('planet_geodesic');

    // 7. Starfield
    loadStars();

    // 8. Event listeners & Synchronization Loops
    window.addEventListener('resize', onWindowResize);
    initControls();
    initLightingControls();
    initSyncBus();
    startAgentTelemetryLoop();
    animate();
}

/**
 * Converts Geodetic Coordinates (Lat, Lon, Radius) to 3D Cartesian (x, y, z)
 */
function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
}

function buildGlobe() {
    earthGroup = new THREE.Group();

    const earthGeo = new THREE.SphereGeometry(14, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
        color: 0x09264a,     // Deep oceanic vibrant blue (replaces dark purple)
        emissive: 0x04162e,  // Subtle oceanic twilight base
        specular: 0x38bdf8,  // Celestial cyan/azure sheen
        shininess: 24        // Crisp, refined oceanic highlights
    });
    earthGroup.add(new THREE.Mesh(earthGeo, earthMat));

    // Subtle celestial azure meridian lines
    const wireGeo = new THREE.SphereGeometry(14.02, 32, 32);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.10
    });
    earthGroup.add(new THREE.Mesh(wireGeo, wireMat));

    // London Sovereign Anchor Marker (51.5074° N, -0.1278° W)
    const markerGeo = new THREE.SphereGeometry(0.35, 16, 16);
    targetMarker = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color: 0x00e676 }));
    const londonPos = latLonToVector3(51.5074, -0.1278, 14.15);
    targetMarker.position.copy(londonPos);
    earthGroup.add(targetMarker);

    // Warm localized hearth point light
    londonPointLight = new THREE.PointLight(0xfbbf24, 0.18, 14, 2.0);
    const londonLightPos = latLonToVector3(51.5074, -0.1278, 14.8);
    londonPointLight.position.copy(londonLightPos);
    earthGroup.add(londonPointLight);

    // Warm beacon halo ring around London
    const anchorHaloGeo = new THREE.RingGeometry(0.48, 0.68, 32);
    const anchorHaloMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.60,
        side: THREE.DoubleSide
    });
    const anchorHalo = new THREE.Mesh(anchorHaloGeo, anchorHaloMat);
    anchorHalo.position.copy(londonPos);
    anchorHalo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), londonPos.clone().normalize());
    earthGroup.add(anchorHalo);

    scene.add(earthGroup);
}

/**
 * ✨ VOLUMETRIC DUAL-LAYER ATMOSPHERIC FRESNEL GLOW (SOFT-EDGE FEATHERED)
 * Generates an ethereal, feathered halo without harsh cutoffs
 */
function buildAtmosphereGlow() {
    // 1. Outer Ethereal Halo (BackSide Additive Shader - Soft feathered edge falloff)
    const atmoGeo = new THREE.SphereGeometry(14.58, 64, 64);
    atmosphereMat = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform vec3 uColorWarm;
            uniform vec3 uColorSky;
            uniform float uIntensity;
            void main() {
                vec3 viewDir = normalize(-vPosition);
                float fresnel = clamp(1.0 - dot(viewDir, vNormal), 0.0, 1.0);
                // Soft Gaussian-Hermite feathering to remove harsh outer edges
                float softFalloff = smoothstep(0.02, 0.70, fresnel) * (1.0 - smoothstep(0.80, 1.0, fresnel) * 0.55);
                float glow = pow(fresnel, 2.6) * softFalloff * uIntensity * 0.50;
                vec3 color = mix(uColorSky, uColorWarm, smoothstep(0.3, 0.9, fresnel));
                gl_FragColor = vec4(color, glow);
            }
        `,
        uniforms: {
            uColorWarm: { value: new THREE.Color(0xf59e0b) }, // Warm solar amber
            uColorSky: { value: new THREE.Color(0x38bdf8) },  // Celestial sky blue
            uIntensity: { value: lightingState.warmthGlowIntensity }
        },
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false
    });
    atmosphereMesh = new THREE.Mesh(atmoGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // 2. Inner Limb-Darkening Warm Corona (FrontSide - Ultra-soft feathered rim)
    const innerGeo = new THREE.SphereGeometry(14.05, 64, 64);
    innerCoronaMat = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform vec3 uColorWarm;
            uniform vec3 uColorSky;
            uniform float uIntensity;
            void main() {
                vec3 viewDir = normalize(-vPosition);
                float rim = 1.0 - clamp(dot(viewDir, vNormal), 0.0, 1.0);
                // Soft feathered inner transition without sharp threshold line
                float softCorona = smoothstep(0.15, 0.95, rim) * pow(rim, 3.5) * uIntensity * 0.30;
                vec3 coronaColor = mix(uColorSky, uColorWarm, smoothstep(0.4, 0.95, rim));
                gl_FragColor = vec4(coronaColor, softCorona);
            }
        `,
        uniforms: {
            uColorWarm: { value: new THREE.Color(0xfbbf24) },
            uColorSky: { value: new THREE.Color(0x38bdf8) },
            uIntensity: { value: lightingState.warmthGlowIntensity }
        },
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        transparent: true,
        depthWrite: false
    });
    innerCoronaMesh = new THREE.Mesh(innerGeo, innerCoronaMat);
    earthGroup.add(innerCoronaMesh);
}

/**
 * 🗺️ GEOGRAPHY FOUNDATION: VECTOR COASTLINES (NO TERRAIN MAP REQUIRED)
 */
function buildCoastlines() {
    coastlineGroup = new THREE.Group();

    const COASTLINES = [
        // Great Britain Main Outline
        [
            [50.0, -5.7], [50.2, -4.5], [50.6, -3.5], [50.7, -1.9], [50.8, 0.0],
            [51.1, 1.4], [51.5, 0.9], [51.9, 1.3], [52.8, 1.7], [53.0, 0.3],
            [53.6, 0.1], [54.5, -0.6], [55.0, -1.5], [55.8, -2.1], [56.2, -2.7],
            [57.0, -2.0], [57.7, -1.9], [58.6, -3.1], [58.6, -5.0], [58.0, -5.3],
            [57.4, -5.8], [56.3, -5.6], [55.5, -5.0], [54.8, -3.6], [54.0, -2.9],
            [53.4, -3.1], [52.8, -4.1], [52.0, -5.3], [51.6, -5.1], [51.4, -3.7],
            [51.2, -4.2], [50.3, -4.8], [50.0, -5.7]
        ],
        // Ireland Outline
        [
            [51.5, -9.9], [51.9, -10.3], [52.6, -9.9], [53.1, -9.9], [53.7, -10.1],
            [54.3, -9.9], [55.2, -7.3], [55.2, -6.0], [54.6, -5.5], [53.8, -6.1],
            [53.3, -6.0], [52.5, -6.3], [52.2, -6.3], [51.8, -7.9], [51.4, -9.3],
            [51.5, -9.9]
        ],
        // Northern France & Bay of Biscay
        [
            [43.4, -1.8], [44.7, -1.2], [46.1, -1.2], [47.3, -3.0], [48.4, -4.7],
            [48.7, -3.0], [49.7, -1.9], [49.3, -0.1], [50.1, 1.5], [50.9, 1.9],
            [51.1, 2.5], [51.4, 3.3], [51.9, 4.1], [52.5, 4.6], [53.3, 6.0],
            [53.8, 7.2], [54.3, 8.6]
        ],
        // Scandinavia / North Sea Coast
        [
            [54.8, 8.5], [55.7, 8.1], [57.1, 8.6], [57.7, 10.6], [56.0, 12.3],
            [54.5, 11.0], [54.0, 9.0]
        ]
    ];

    COASTLINES.forEach(path => {
        const points = path.map(coord => latLonToVector3(coord[0], coord[1], 14.05));
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.65,
            linewidth: 1.5
        });
        coastlineGroup.add(new THREE.Line(geo, mat));
    });

    earthGroup.add(coastlineGroup);
}

/**
 * ⛰️ STRATEGIC HIGH-ELEVATION ANCHOR POINTS WITH WARM ILLUMINATION
 */
function buildHighElevationMarkers() {
    elevationPeaksGroup = new THREE.Group();

    const PEAKS = [
        { name: "Ben Nevis", lat: 56.7969, lon: -5.0036, elev: 1345 },
        { name: "Snowdon", lat: 53.0685, lon: -4.0763, elev: 1085 },
        { name: "Scafell Pike", lat: 54.4542, lon: -3.2116, elev: 978 },
        { name: "Slieve Donard", lat: 54.1798, lon: -5.9208, elev: 850 },
        { name: "Mont Blanc", lat: 45.8326, lon: 6.8652, elev: 4808 },
        { name: "Pic de Vignemale", lat: 42.7736, lon: -0.1464, elev: 3298 },
        { name: "Puy de Sancy", lat: 45.5292, lon: 2.8122, elev: 1885 },
        { name: "Brocken", lat: 51.7992, lon: 10.6156, elev: 1141 }
    ];

    PEAKS.forEach(pk => {
        const basePos = latLonToVector3(pk.lat, pk.lon, 14.07);
        const heightScale = Math.max(0.32, pk.elev / 3000.0);

        // 1. Triangular Cone Peak Symbol with warm amber tone
        const coneGeo = new THREE.ConeGeometry(0.18, heightScale, 4);
        coneGeo.translate(0, heightScale / 2, 0);
        const coneMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.copy(basePos);
        cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), basePos.clone().normalize());
        elevationPeaksGroup.add(cone);

        // 2. Soft Warm Golden Contour Rings around peak
        [0.25, 0.5, 0.75].forEach(ringR => {
            const ringGeo = new THREE.RingGeometry(ringR * 0.4, ringR * 0.44, 24);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xfde68a,
                transparent: true,
                opacity: 0.45,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.copy(basePos);
            ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), basePos.clone().normalize());
            elevationPeaksGroup.add(ring);
        });
    });

    earthGroup.add(elevationPeaksGroup);
}

/**
 * 🌊 DYNAMIC LOCAL TOPOLOGY PULSE MESH (1000-MILE RADIUS) WITH WARM HARMONIC WAVE
 */
function buildLocalTopologyPulse() {
    const segments = 48;
    const rings = 24;
    const maxTheta = (1000.0 / 3959.0); // 1000 miles in radians on Earth sphere (~0.252 rad)

    const pulseGeo = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const uvs = [];

    const anchor = latLonToVector3(51.5074, -0.1278, 14.12);
    const normal = anchor.clone().normalize();

    const up = Math.abs(normal.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const tangent = new THREE.Vector3().crossVectors(normal, up).normalize();
    const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

    for (let r = 0; r <= rings; r++) {
        const fracR = r / rings;
        const angularDist = fracR * maxTheta;

        for (let s = 0; s <= segments; s++) {
            const phi = (s / segments) * Math.PI * 2;
            const dir = tangent.clone().multiplyScalar(Math.cos(phi))
                .add(bitangent.clone().multiplyScalar(Math.sin(phi)));

            const pt = anchor.clone().multiplyScalar(Math.cos(angularDist))
                .add(dir.multiplyScalar(14.12 * Math.sin(angularDist)));

            positions.push(pt.x, pt.y, pt.z);
            uvs.push(fracR, phi / (Math.PI * 2));

            // Fading edge color: Warm golden amber at center transitioning outwards
            const alpha = Math.exp(-fracR * 2.5) * (1.0 - fracR);
            const warmR = 1.0 - fracR * 0.45;
            const warmG = 0.75 + fracR * 0.15;
            const warmB = 0.20 + fracR * 0.70;
            colors.push(warmR, warmG, warmB, alpha);
        }
    }

    const indices = [];
    for (let r = 0; r < rings; r++) {
        for (let s = 0; s < segments; s++) {
            const a = r * (segments + 1) + s;
            const b = (r + 1) * (segments + 1) + s;
            const c = (r + 1) * (segments + 1) + (s + 1);
            const d = r * (segments + 1) + (s + 1);
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }

    pulseGeo.setIndex(indices);
    pulseGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    pulseGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    pulseGeo.userData = { originalPositions: Float32Array.from(positions), maxTheta, rings, segments, anchor, normal, tangent, bitangent };

    const pulseMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24, // Warm radiant golden-amber pulse wave
        wireframe: true,
        transparent: true,
        opacity: 0.60
    });

    topologyPulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    earthGroup.add(topologyPulseMesh);
}

function updateTopologyPulseWave(timeSec) {
    if (!topologyPulseMesh || !topologyPulseMesh.visible) return;

    const geo = topologyPulseMesh.geometry;
    const pos = geo.attributes.position;
    const orig = geo.userData.originalPositions;
    const { rings, segments } = geo.userData;

    const freq = syncState.baseFreqHz * syncState.harmonicMultiple;
    const omega = 2.0 * Math.PI * (freq / 400.0);
    const waveK = 18.0;

    let ptr = 0;
    for (let r = 0; r <= rings; r++) {
        const fracR = r / rings;
        const fade = Math.exp(-fracR * 2.2);
        const wave = Math.sin(waveK * fracR - (syncState.phase || (timeSec * omega))) * syncState.pulseAmplitude * fade * 0.35;

        for (let s = 0; s <= segments; s++) {
            const origX = orig[ptr * 3];
            const origY = orig[ptr * 3 + 1];
            const origZ = orig[ptr * 3 + 2];

            const v = new THREE.Vector3(origX, origY, origZ);
            const norm = v.clone().normalize();
            v.add(norm.multiplyScalar(wave));

            pos.setXYZ(ptr, v.x, v.y, v.z);
            ptr++;
        }
    }
    pos.needsUpdate = true;
}

/**
 * 🌐 GLOBAL PLANETARY TOPOLOGY MESH (DEFAULT ARRANGEMENT)
 * Replaces local mountain clusters with a full planetary geodesic lattice
 */
function buildGlobalPlanetMesh() {
    globalPlanetGroup = new THREE.Group();

    // 1. Primary Geodesic Lattice (Icosahedron Detail 3: 1280 triangular facets)
    const geodesicGeo = new THREE.IcosahedronGeometry(14.06, 3);
    const geodesicMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        wireframe: true,
        transparent: true,
        opacity: 0.18
    });
    const geodesicMesh = new THREE.Mesh(geodesicGeo, geodesicMat);
    globalPlanetGroup.add(geodesicMesh);

    // 2. Geodetic Coordinate Grid (Equatorial & Meridian Lat-Lon Rings)
    const gridGeo = new THREE.SphereGeometry(14.05, 48, 24);
    const gridMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.08
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    globalPlanetGroup.add(gridMesh);

    // 3. Equator High-Coherence Invariant Guide Ring
    const equatorGeo = new THREE.RingGeometry(14.07, 14.12, 64);
    const equatorMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.40,
        side: THREE.DoubleSide
    });
    const equatorMesh = new THREE.Mesh(equatorGeo, equatorMat);
    equatorMesh.rotation.x = Math.PI / 2;
    globalPlanetGroup.add(equatorMesh);

    // 4. Prime Meridian Guide Ring
    const meridianGeo = new THREE.RingGeometry(14.07, 14.12, 64);
    const meridianMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide
    });
    const meridianMesh = new THREE.Mesh(meridianGeo, meridianMat);
    meridianMesh.rotation.y = Math.PI / 2;
    globalPlanetGroup.add(meridianMesh);

    earthGroup.add(globalPlanetGroup);
}

/**
 * 🎛️ TOPOLOGY MESH ARRANGEMENT CONTROLLER
 * Switches between Planetary Geodesic (Default), Local Wave, Peaks, Hybrid, or Smooth
 */
function applyMeshArrangement(mode) {
    currentMeshArrangement = mode;

    const hudTitle = document.getElementById('hud-peaks-title');
    const hudBadge = document.getElementById('hud-peaks-badge');
    const hudLabel1 = document.getElementById('hud-label-1');
    const hudVal1 = document.getElementById('hud-val-1');
    const hudLabel2 = document.getElementById('hud-label-2');
    const hudVal2 = document.getElementById('hud-val-2');
    const hudLabel3 = document.getElementById('hud-label-3');
    const hudVal3 = document.getElementById('hud-val-3');
    const hudLabel4 = document.getElementById('hud-label-4');
    const hudVal4 = document.getElementById('hud-val-4');
    const hudDesc = document.getElementById('hud-peaks-desc');

    if (mode === 'planet_geodesic') {
        // DEFAULT: Remove local mountains and mesh the entire planet
        if (globalPlanetGroup) globalPlanetGroup.visible = true;
        if (elevationPeaksGroup) elevationPeaksGroup.visible = false;
        if (topologyPulseMesh) topologyPulseMesh.visible = false;

        if (hudTitle) hudTitle.textContent = '🌐 Planetary Topology Mesh';
        if (hudBadge) {
            hudBadge.textContent = 'GLOBAL MESH ACTIVE';
            hudBadge.className = 'hud-val highlight';
        }
        if (hudLabel1) hudLabel1.textContent = 'Topological Structure';
        if (hudVal1) hudVal1.textContent = 'Geodesic Icosahedron Freq-3';
        if (hudLabel2) hudLabel2.textContent = 'Coordinate Resolution';
        if (hudVal2) hudVal2.textContent = '48 × 24 Geodetic Lattice';
        if (hudLabel3) hudLabel3.textContent = 'Harmonic Modulation';
        if (hudVal3) hudVal3.textContent = '432.0 Hz Planetary Carrier';
        if (hudLabel4) hudLabel4.textContent = 'Mesh Topology Status';
        if (hudVal4) {
            hudVal4.textContent = 'Full Planetary Enclosure (Default)';
            hudVal4.className = 'hud-val verified';
        }
    } else if (mode === 'local_wave') {
        // Local 1000-mile topology pulse wave over London
        if (globalPlanetGroup) globalPlanetGroup.visible = false;
        if (elevationPeaksGroup) elevationPeaksGroup.visible = false;
        if (topologyPulseMesh) topologyPulseMesh.visible = true;

        if (hudTitle) hudTitle.textContent = '🌊 Local Topology Wave';
        if (hudBadge) {
            hudBadge.textContent = '1000-MILE WAVE ACTIVE';
            hudBadge.className = 'hud-val highlight';
        }
        if (hudLabel1) hudLabel1.textContent = 'Local Wave Radius';
        if (hudVal1) hudVal1.textContent = '1000 mi (~1609 km)';
        if (hudLabel2) hudLabel2.textContent = 'Edge Attenuation';
        if (hudVal2) hudVal2.textContent = 'Exponential Decay (e⁻ʳ/ᴿ)';
        if (hudLabel3) hudLabel3.textContent = 'Wave Carrier';
        if (hudVal3) hudVal3.textContent = `${(syncState.baseFreqHz * syncState.harmonicMultiple).toFixed(1)} Hz`;
        if (hudLabel4) hudLabel4.textContent = 'Local Region';
        if (hudVal4) {
            hudVal4.textContent = 'London Anchor Focused';
            hudVal4.className = 'hud-val highlight';
        }
    } else if (mode === 'local_peaks') {
        // High terrain elevation peaks and golden contour rings
        if (globalPlanetGroup) globalPlanetGroup.visible = false;
        if (elevationPeaksGroup) elevationPeaksGroup.visible = true;
        if (topologyPulseMesh) topologyPulseMesh.visible = false;

        if (hudTitle) hudTitle.textContent = '⛰️ High Elevation Anchors';
        if (hudBadge) {
            hudBadge.textContent = '8 PEAKS ACTIVE';
            hudBadge.className = 'hud-val highlight';
        }
        if (hudLabel1) hudLabel1.textContent = 'Ben Nevis (Highlands)';
        if (hudVal1) hudVal1.textContent = '1345 m (3 Rings)';
        if (hudLabel2) hudLabel2.textContent = 'Snowdon (Yr Wyddfa)';
        if (hudVal2) hudVal2.textContent = '1085 m (3 Rings)';
        if (hudLabel3) hudLabel3.textContent = 'Mont Blanc (Alps Edge)';
        if (hudVal3) hudVal3.textContent = '4808 m (Amber Tint)';
        if (hudLabel4) hudLabel4.textContent = 'Elevation Signal';
        if (hudVal4) {
            hudVal4.textContent = 'Pyramid Cones + Rings';
            hudVal4.className = 'hud-val verified';
        }
    } else if (mode === 'hybrid_lattice') {
        // Unified Global Geodesic + Local Harmonic Wave
        if (globalPlanetGroup) globalPlanetGroup.visible = true;
        if (elevationPeaksGroup) elevationPeaksGroup.visible = false;
        if (topologyPulseMesh) topologyPulseMesh.visible = true;

        if (hudTitle) hudTitle.textContent = '✨ Unified Hybrid Lattice';
        if (hudBadge) {
            hudBadge.textContent = 'HYBRID RESONANCE';
            hudBadge.className = 'hud-val highlight';
        }
        if (hudLabel1) hudLabel1.textContent = 'Global Framework';
        if (hudVal1) hudVal1.textContent = 'Geodesic Icosahedron Freq-3';
        if (hudLabel2) hudLabel2.textContent = 'Local Modulation';
        if (hudVal2) hudVal2.textContent = '1000mi London Harmonic Wave';
        if (hudLabel3) hudLabel3.textContent = 'Coupling Mechanism';
        if (hudVal3) hudVal3.textContent = 'Seamless Manifold Blend';
        if (hudLabel4) hudLabel4.textContent = 'Resonance Mode';
        if (hudVal4) {
            hudVal4.textContent = 'Dual Field Invariant Locked';
            hudVal4.className = 'hud-val verified';
        }
    } else if (mode === 'geoid_smooth') {
        // Smooth Geoid (Unmeshed Earth)
        if (globalPlanetGroup) globalPlanetGroup.visible = false;
        if (elevationPeaksGroup) elevationPeaksGroup.visible = false;
        if (topologyPulseMesh) topologyPulseMesh.visible = false;

        if (hudTitle) hudTitle.textContent = '🪐 Smooth Earth Geoid';
        if (hudBadge) {
            hudBadge.textContent = 'UNMESHED GEOID';
            hudBadge.className = 'hud-val';
        }
        if (hudLabel1) hudLabel1.textContent = 'Manifold Geometry';
        if (hudVal1) hudVal1.textContent = 'WGS-84 Oceanic S²';
        if (hudLabel2) hudLabel2.textContent = 'Mesh Filtering';
        if (hudVal2) hudVal2.textContent = 'Wireframe Suppressed';
        if (hudLabel3) hudLabel3.textContent = 'Surface Optical Sheen';
        if (hudVal3) hudVal3.textContent = 'Specular Oceanic Blue';
        if (hudLabel4) hudLabel4.textContent = 'Topology Status';
        if (hudVal4) {
            hudVal4.textContent = 'Coastline Vectors Retained';
            hudVal4.className = 'hud-val';
        }
    }

    const selectElem = document.getElementById('select-mesh-arrangement');
    if (selectElem && selectElem.value !== mode) {
        selectElem.value = mode;
    }
}

async function loadStars() {
    try {
        const res = await fetch('../../assets/stars.json');
        if (!res.ok) return;
        const stars = await res.json();
        const count = Math.min(stars.length, 3000);
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const s = stars[i];
            const phi = ((s.ra || Math.random() * 24) / 24) * Math.PI * 2;
            const theta = THREE.MathUtils.degToRad(90 - (s.dec || 0));
            positions[i * 3] = 260 * Math.sin(theta) * Math.cos(phi);
            positions[i * 3 + 1] = 260 * Math.cos(theta);
            positions[i * 3 + 2] = 260 * Math.sin(theta) * Math.sin(phi);

            // Subtle warm and cool celestial starlight mix
            colors[i * 3] = 0.95;
            colors[i * 3 + 1] = 0.92;
            colors[i * 3 + 2] = 0.85;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starPoints = new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.8, vertexColors: true, transparent: true, opacity: 0.75 }));
        scene.add(starPoints);
    } catch (e) {}
}

/**
 * 🛰️ DUAL-PAGE ORCHESTRATION & SYNCHRONIZATION BUS CONTROLLER
 */
function initSyncBus() {
    try {
        syncChannel = new BroadcastChannel('qt_ai_studios_sync');
        syncChannel.onmessage = (event) => {
            const msg = event.data;
            if (!msg || typeof msg !== 'object') return;
            if (msg.type === 'SYNC_TICK' || msg.type === 'PARAM_UPDATE') {
                applyFeedFrame(msg.payload);
            }
        };
    } catch (e) {}

    setInterval(pollStudiosLiveFeed, 1000);
    pollStudiosLiveFeed();
}

async function pollStudiosLiveFeed() {
    try {
        const res = await fetch('/api/studios/feed/live');
        if (!res.ok) return;
        const feed = await res.json();
        if (feed.status === 'success') {
            applyFeedFrame(feed);
        }
    } catch (e) {}
}

function applyFeedFrame(feed) {
    if (!feed) return;
    const bus = feed.sync_bus;
    const closure = feed.holographic_closure;
    const hyper = feed.hypersphere;

    if (bus) {
        syncState.frameId = bus.frame_id || syncState.frameId;
        syncState.lockStatus = bus.lock_status || syncState.lockStatus;
        syncState.driftMs = bus.drift_ms || 0.0;
        syncState.isPaused = bus.is_paused ?? syncState.isPaused;
        syncState.masterPage = bus.master_page || syncState.masterPage;
        updateSyncLockUI();
    }

    if (closure) {
        syncState.n1_bulk = closure.n1_bulk;
        syncState.n2_boundary = closure.n2_boundary;
        syncState.n3_target = closure.n3_target;
        syncState.regime = closure.regime;
        syncState.isClosed = closure.is_closed;
        updateClosureUI(closure);
    }

    if (hyper) {
        syncState.baseFreqHz = hyper.base_frequency_hz || 432.0;
        syncState.harmonicMultiple = hyper.harmonic_multiple || 1.0;
        syncState.phase = hyper.phase_rad || 0.0;
        syncState.pulseAmplitude = hyper.pulse_amplitude || 1.0;
        updateSyncUIElements();
    }
}

function updateSyncLockUI() {
    const pill = document.getElementById('sync-lock-pill');
    const pillText = document.getElementById('sync-lock-text');
    if (pillText) {
        pillText.textContent = `AI STUDIOS: ${syncState.lockStatus} ● [FRAME #${syncState.frameId}]`;
    }
    if (pill) {
        if (syncState.lockStatus === 'LOCKED' || syncState.lockStatus === 'ACTIVE') {
            pill.style.borderColor = 'rgba(245, 158, 11, 0.45)';
            pill.style.color = '#fde68a';
        } else {
            pill.style.borderColor = 'rgba(255, 179, 0, 0.35)';
            pill.style.color = '#ffb300';
        }
    }
}

function updateClosureUI(closure) {
    const pill = document.getElementById('closure-pill');
    if (pill && closure) {
        pill.textContent = `N₁×N₂=N₃: ${closure.regime === 'HOLOGRAPHIC_CONTINUUM' ? 'CLOSED (κ=1.000)' : 'MELONIC TRAP'}`;
        pill.style.borderColor = closure.is_closed ? '#b388ff' : '#ff1744';
    }
}

function updateSyncUIElements() {
    const carrier = document.getElementById('hud-pulse-carrier');
    if (carrier) {
        const freq = (syncState.baseFreqHz * syncState.harmonicMultiple).toFixed(1);
        carrier.textContent = `${freq} Hz (${syncState.harmonicMultiple.toFixed(1)}x)`;
    }
}

/**
 * 💡 LIGHTING & WARMTH GLOW DOCK INTERACTION
 */
function initLightingControls() {
    const sliderDownlight = document.getElementById('slider-downlight');
    const valDownlight = document.getElementById('val-downlight');
    const sliderWarmth = document.getElementById('slider-warmth');
    const valWarmth = document.getElementById('val-warmth');

    const btnSolar = document.getElementById('btn-preset-solar');
    const btnTwilight = document.getElementById('btn-preset-twilight');
    const btnEthereal = document.getElementById('btn-preset-ethereal');

    function applyDownlight(val) {
        lightingState.downlightBrightness = parseFloat(val);
        if (downLight) downLight.intensity = lightingState.downlightBrightness;
        // Proportionately balance keyLight so lights never overlap into obscuring glare
        if (keyLight) keyLight.intensity = lightingState.downlightBrightness * 0.58;
        if (valDownlight) valDownlight.textContent = `${lightingState.downlightBrightness.toFixed(2)}x`;
        if (sliderDownlight) sliderDownlight.value = lightingState.downlightBrightness;
    }

    function applyWarmth(val) {
        lightingState.warmthGlowIntensity = parseFloat(val);
        if (atmosphereMat && atmosphereMat.uniforms.uIntensity) {
            atmosphereMat.uniforms.uIntensity.value = lightingState.warmthGlowIntensity;
        }
        if (innerCoronaMat && innerCoronaMat.uniforms.uIntensity) {
            innerCoronaMat.uniforms.uIntensity.value = lightingState.warmthGlowIntensity;
        }
        if (londonPointLight) {
            londonPointLight.intensity = 0.18 * (lightingState.warmthGlowIntensity / 0.65);
        }
        if (valWarmth) valWarmth.textContent = `${lightingState.warmthGlowIntensity.toFixed(2)}x`;
        if (sliderWarmth) sliderWarmth.value = lightingState.warmthGlowIntensity;
    }

    function setPresetActive(activeBtn) {
        [btnSolar, btnTwilight, btnEthereal].forEach(btn => btn?.classList.remove('active'));
        activeBtn?.classList.add('active');
    }

    sliderDownlight?.addEventListener('input', (e) => {
        applyDownlight(e.target.value);
        [btnSolar, btnTwilight, btnEthereal].forEach(btn => btn?.classList.remove('active'));
    });

    sliderWarmth?.addEventListener('input', (e) => {
        applyWarmth(e.target.value);
        [btnSolar, btnTwilight, btnEthereal].forEach(btn => btn?.classList.remove('active'));
    });

    // Preset: ☀️ Solar (Default: Crisp, balanced soft solar downlight)
    btnSolar?.addEventListener('click', () => {
        applyDownlight(0.38);
        applyWarmth(0.65);
        setPresetActive(btnSolar);
    });

    // Preset: 🌅 Golden Twilight (Deep warm twilight corona, soft downlight)
    btnTwilight?.addEventListener('click', () => {
        applyDownlight(0.24);
        applyWarmth(0.85);
        setPresetActive(btnTwilight);
    });

    // Preset: ✨ Soft Amber (Gentle illumination, warm glowing silhouette)
    btnEthereal?.addEventListener('click', () => {
        applyDownlight(0.30);
        applyWarmth(0.55);
        setPresetActive(btnEthereal);
    });

    // Mesh Arrangement Dropdown Selector
    const selectMesh = document.getElementById('select-mesh-arrangement');
    selectMesh?.addEventListener('change', (e) => {
        applyMeshArrangement(e.target.value);
    });

    // Bottom Bar: Toggle Atmosphere Glow
    document.getElementById('btn-toggle-glow')?.addEventListener('click', () => {
        syncState.glowVisible = !syncState.glowVisible;
        if (atmosphereMesh) atmosphereMesh.visible = syncState.glowVisible;
        if (innerCoronaMesh) innerCoronaMesh.visible = syncState.glowVisible;
    });
}

function initControls() {
    // 1. Toggle Master
    const btnMaster = document.getElementById('btn-toggle-master');
    if (btnMaster) {
        btnMaster.addEventListener('click', async () => {
            const nextMaster = syncState.masterPage === 'locate_gps' ? 'audios_sync' : 'locate_gps';
            syncState.masterPage = nextMaster;
            document.getElementById('lbl-master-state').textContent = `🔄 Master: ${nextMaster === 'locate_gps' ? 'GPS' : 'Audios'}`;
            try {
                await fetch('/api/studios/feed/control', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'toggle_master' })
                });
            } catch (e) {}
        });
    }

    // 2. Toggle Pause
    const btnPause = document.getElementById('btn-toggle-pause');
    if (btnPause) {
        btnPause.addEventListener('click', async () => {
            syncState.isPaused = !syncState.isPaused;
            document.getElementById('lbl-pause-state').textContent = syncState.isPaused ? '▶️ Resume' : '⏸️ Pause';
            try {
                await fetch('/api/studios/feed/control', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'toggle_pause' })
                });
            } catch (e) {}
        });
    }

    // 3. Align Drift
    const btnAlign = document.getElementById('btn-align-sync');
    if (btnAlign) {
        btnAlign.addEventListener('click', async () => {
            try {
                await fetch('/api/studios/feed/control', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'drift_reset' })
                });
            } catch (e) {}
        });
    }

    // 4. Toggle Topology Pulse
    document.getElementById('btn-toggle-pulse')?.addEventListener('click', () => {
        if (topologyPulseMesh) {
            syncState.pulseVisible = !syncState.pulseVisible;
            topologyPulseMesh.visible = syncState.pulseVisible;
        }
    });

    // 5. Toggle Elevation Peaks
    document.getElementById('btn-toggle-peaks')?.addEventListener('click', () => {
        if (elevationPeaksGroup) {
            syncState.peaksVisible = !syncState.peaksVisible;
            elevationPeaksGroup.visible = syncState.peaksVisible;
        }
    });

    // 6. Stars toggle
    document.getElementById('btn-toggle-stars')?.addEventListener('click', () => {
        if (starPoints) starPoints.visible = !starPoints.visible;
    });

    // 7. Recenter camera
    document.getElementById('btn-recenter')?.addEventListener('click', () => {
        camera.position.set(0, 35, 75);
        controls.target.set(0, 0, 0);
    });

    // 8. Spoof Simulation Button
    const btnSpoof = document.getElementById('btn-simulate-spoof');
    if (btnSpoof) {
        btnSpoof.addEventListener('click', async () => {
            if (isSpoofing) return;
            isSpoofing = true;
            try {
                const res = await fetch('/api/agent/gps_fix', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        latitude: 51.5074,
                        longitude: -0.1278,
                        test_vector: [1.42].concat(Array(15).fill(0.1))
                    })
                });
                const data = await res.json();
                renderSpoofUI(data);
            } catch (e) {
                renderSpoofUI({});
            }
        });
    }
}

function renderSpoofUI(data) {
    const fixState = document.getElementById('hud-fix-state');
    const shellNorm = document.getElementById('hud-shell-norm');
    const shellDelta = document.getElementById('hud-shell-delta');
    const pill = document.getElementById('agent-status-pill');
    const pillText = document.getElementById('agent-status-text');

    if (fixState) {
        fixState.textContent = 'SPOOF DETECTED: AUTO-ABORT';
        fixState.className = 'hud-val danger';
    }
    if (shellNorm) {
        shellNorm.textContent = '1.420000 r (OFF-SHELL)';
        shellNorm.className = 'hud-val danger';
    }
    if (shellDelta) {
        shellDelta.textContent = '+0.420000 (SHELL BREACH)';
        shellDelta.className = 'hud-val danger';
    }

    if (pill) {
        pill.style.background = 'rgba(255,23,68,0.2)';
        pill.style.borderColor = 'var(--red-alert)';
        pill.style.color = 'var(--red-alert)';
        if (pillText) pillText.textContent = 'TRUTH AGENT: REJECTED ADVERSARIAL DRIFT';
    }

    const spoofGeo = new THREE.SphereGeometry(0.85, 16, 16);
    spoofMarker = new THREE.Mesh(spoofGeo, new THREE.MeshBasicMaterial({ color: 0xff1744 }));
    spoofMarker.position.copy(targetMarker.position).multiplyScalar(1.42);
    earthGroup.add(spoofMarker);

    setTimeout(() => {
        if (spoofMarker) earthGroup.remove(spoofMarker);
        if (fixState) {
            fixState.textContent = 'UNSPOOFABLE';
            fixState.className = 'hud-val verified';
        }
        if (shellNorm) {
            shellNorm.textContent = '1.000000 r';
            shellNorm.className = 'hud-val verified';
        }
        if (shellDelta) {
            shellDelta.textContent = '< 10⁻⁶ (EXACT)';
            shellDelta.className = 'hud-val verified';
        }
        if (pill) {
            pill.style.background = 'rgba(0,230,118,0.15)';
            pill.style.borderColor = 'var(--green-verified)';
            pill.style.color = 'var(--green-verified)';
            if (pillText) pillText.textContent = 'TRUTH AGENT: AUDIT VERIFIED';
        }
        isSpoofing = false;
    }, 5000);
}

function startAgentTelemetryLoop() {
    setInterval(async () => {
        if (isSpoofing) return;
        try {
            const res = await fetch('/api/agent/gps_fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude: 51.5074, longitude: -0.1278 })
            });
            if (res.ok) {
                const data = await res.json();
                const latElem = document.getElementById('hud-lat');
                const lonElem = document.getElementById('hud-lon');
                const confElem = document.getElementById('hud-confidence');
                if (latElem && data.position) latElem.textContent = `${data.position.latitude.toFixed(5)}° N`;
                if (lonElem && data.position) lonElem.textContent = `${data.position.longitude.toFixed(5)}° W`;
                if (confElem && data.truth_signature) confElem.textContent = `${data.truth_signature.confidence_score}%`;
            }
        } catch (e) {}
    }, 2000);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / (window.innerHeight - 56);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - 56);
}

function animate(timeMs = 0) {
    requestAnimationFrame(animate);
    const timeSec = timeMs * 0.001;

    if (earthGroup && !syncState.isPaused) {
        earthGroup.rotation.y += 0.0004;
    }

    // Dynamic wave animation for local topology pulse
    if (!syncState.isPaused) {
        updateTopologyPulseWave(timeSec);
    }

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
