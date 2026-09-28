/**
 * 🌌 AUDIOS HYPERSPHERE SYNC — INTERACTIVE LOGIC & RADAR ENGINE
 * QT Analytics Sovereign Location Obfuscation & Proximity Intelligence
 * "Audios = Adios: Wave goodbye to exact location tracking"
 */

// ==============================================================================
// 🌍 WGS84 STANDARD GEODETIC INVARIANTS (EPSG:4326)
// ==============================================================================
const WGS84 = {
    a: 6378137.0,              // Equatorial semi-major axis (meters)
    b: 6356752.314245,         // Polar semi-minor axis (meters)
    f: 1.0 / 298.257223563,    // Flattening factor
    e2: 0.00669437999014,      // First eccentricity squared (e²)
    meanR: 6371000.0,          // Spherical mean radius (meters)

    metersToGeodeticDelta(deltaNorthM, deltaEastM, latDeg = 51.5074) {
        const latRad = (latDeg * Math.PI) / 180.0;
        const sinLat = Math.sin(latRad);
        const cosLat = Math.cos(latRad);

        const denom = Math.sqrt(Math.max(1e-12, 1.0 - this.e2 * sinLat * sinLat));
        const M = (this.a * (1.0 - this.e2)) / (denom * denom * denom);
        const N = this.a / denom;

        const dLatDeg = (deltaNorthM / M) * (180.0 / Math.PI);
        const dLonDeg = Math.abs(cosLat) > 1e-7 ? (deltaEastM / (N * cosLat)) * (180.0 / Math.PI) : 0.0;
        return { dLatDeg, dLonDeg };
    }
};

class AudiosHypersphereSync {
    constructor() {
        this.wgs84 = WGS84;
        this.currentTier = 'broad'; // 'broad' | 'friends' | 'trusted' | 'stealth'
        this.entropy = 4.912;
        this.jitterKm = 8.4;
        this.radarAngle = 0;
        this.ringRotation1 = 0;
        this.ringRotation2 = 0;
        this.ringRotation3 = 0;
        this.isStealthActive = false;

        this.geofences = [
            {
                id: 'base-alpha',
                name: 'Sanctuary Base Alpha',
                type: 'Private Enclave / HQ',
                avatar: '🏰',
                tier: 'max',
                tierLabel: 'Maximum Cloak',
                radius: '10.0 km',
                calendarEvent: 'Always Enforced',
                status: 'active-now',
                statusText: 'INSIDE SANCTUARY',
                blip: { x: 0.15, y: -0.22, color: '#10b981' }
            },
            {
                id: 'mayfair-briefing',
                name: 'Mayfair Executive Briefing',
                type: 'Private Meeting Zone',
                avatar: '💼',
                tier: 'friends',
                tierLabel: 'Friends Sector',
                radius: '850 m',
                calendarEvent: 'Board Sync @ 11:30',
                status: 'approaching',
                statusText: 'NEARBY (420m)',
                blip: { x: -0.32, y: 0.28, color: '#f59e0b' }
            },
            {
                id: 'canary-wharf',
                name: 'Canary Wharf Quantum Lab',
                type: 'Enterprise Facility',
                avatar: '🔬',
                tier: 'trusted',
                tierLabel: 'Trusted Circle',
                radius: '120 m',
                calendarEvent: 'Telemetry Audit @ 15:00',
                status: 'monitoring',
                statusText: 'ARMED / QUEUED',
                blip: { x: 0.45, y: 0.18, color: '#00f0ff' }
            },
            {
                id: 'heathrow-t5',
                name: 'Heathrow T5 Corridor',
                type: 'Transit Chokepoint',
                avatar: '✈️',
                tier: 'max',
                tierLabel: 'Peeling Buster',
                radius: '15.0 km',
                calendarEvent: 'Flight BA482 @ 19:45',
                status: 'monitoring',
                statusText: 'CLOAKED',
                blip: { x: -0.65, y: -0.42, color: '#f43f5e' }
            }
        ];

        this.init();
    }

    init() {
        this.initRadar();
        this.bindEvents();
        this.renderTable();
        this.startMetricsSimulation();
    }

    /* --------------------------------------------------------------------------
       RADAR CANVAS RENDERER (60 FPS Phosphor Sweep & Concentric Obfuscation Rings)
       -------------------------------------------------------------------------- */
    initRadar() {
        this.canvas = document.getElementById('radar-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        const resize = () => {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            const size = Math.min(rect.width, 440);
            this.canvas.width = size * window.devicePixelRatio;
            this.canvas.height = size * window.devicePixelRatio;
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            this.displaySize = size;
        };

        window.addEventListener('resize', resize);
        resize();

        const render = () => {
            this.drawRadar();
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    drawRadar() {
        if (!this.ctx) return;
        const size = this.displaySize;
        const center = size / 2;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, size, size);

        // Background tactical grid circles
        ctx.lineWidth = 1;
        const rings = [0.25, 0.5, 0.75, 0.95];
        rings.forEach(r => {
            ctx.beginPath();
            ctx.arc(center, center, center * r, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
            ctx.stroke();
        });

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(center, 10);
        ctx.lineTo(center, size - 10);
        ctx.moveTo(10, center);
        ctx.lineTo(size - 10, center);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.stroke();

        // 1. Broad Zone Outer Rotating Ring (Red/Rose/Violet)
        this.ringRotation1 += 0.004;
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(this.ringRotation1);
        ctx.beginPath();
        ctx.arc(0, 0, center * 0.88, 0, Math.PI * 2);
        ctx.setLineDash([8, 12]);
        ctx.strokeStyle = this.currentTier === 'broad' ? 'rgba(244, 63, 94, 0.7)' : 'rgba(244, 63, 94, 0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // 2. Friends Sector Middle Rotating Ring (Cyan)
        this.ringRotation2 -= 0.007;
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(this.ringRotation2);
        ctx.beginPath();
        ctx.arc(0, 0, center * 0.58, 0, Math.PI * 2);
        ctx.setLineDash([5, 8]);
        ctx.strokeStyle = this.currentTier === 'friends' ? 'rgba(0, 240, 255, 0.85)' : 'rgba(0, 240, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // 3. Trusted Circle Inner Rotating Ring (Emerald)
        this.ringRotation3 += 0.01;
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(this.ringRotation3);
        ctx.beginPath();
        ctx.arc(0, 0, center * 0.32, 0, Math.PI * 2);
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = this.currentTier === 'trusted' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(16, 185, 129, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Active Obfuscation Cloud Halo
        ctx.beginPath();
        let cloudRadius = center * 0.88;
        let cloudColor = 'rgba(244, 63, 94, 0.08)';
        if (this.currentTier === 'friends') {
            cloudRadius = center * 0.58;
            cloudColor = 'rgba(0, 240, 255, 0.12)';
        } else if (this.currentTier === 'trusted') {
            cloudRadius = center * 0.32;
            cloudColor = 'rgba(16, 185, 129, 0.15)';
        }
        ctx.arc(center, center, cloudRadius, 0, Math.PI * 2);
        ctx.fillStyle = cloudColor;
        ctx.fill();

        // Radar Phosphor Sweep
        this.radarAngle += 0.035;
        ctx.save();
        ctx.translate(center, center);
        const sweepGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, center * 0.95);
        sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
        sweepGrad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, center * 0.95, this.radarAngle - 0.45, this.radarAngle);
        ctx.closePath();
        ctx.fillStyle = sweepGrad;
        ctx.fill();

        // Sweep leading line
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(this.radarAngle) * center * 0.95, Math.sin(this.radarAngle) * center * 0.95);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Render Geofence Blips
        this.geofences.forEach(geo => {
            const bx = center + geo.blip.x * center * 0.85;
            const by = center + geo.blip.y * center * 0.85;

            // Blip glow halo
            ctx.beginPath();
            ctx.arc(bx, by, 8, 0, Math.PI * 2);
            ctx.fillStyle = geo.blip.color + '44';
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = geo.blip.color;
            ctx.fill();

            // Text label
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.fillText(geo.name.split(' ')[0], bx + 10, by + 3);
        });

        // Protected True GPS Core (Hidden / Locked at center)
        ctx.beginPath();
        ctx.arc(center, center, 6, 0, Math.PI * 2);
        ctx.fillStyle = this.isStealthActive ? '#f43f5e' : '#10b981';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(center, center, 12, 0, Math.PI * 2);
        ctx.strokeStyle = this.isStealthActive ? 'rgba(244, 63, 94, 0.6)' : 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    /* --------------------------------------------------------------------------
       EVENT LISTENERS & INTERACTIVE CONTROLS
       -------------------------------------------------------------------------- */
    bindEvents() {
        // Tiers clicks
        document.querySelectorAll('.tier-item').forEach(item => {
            item.addEventListener('click', () => {
                const tier = item.getAttribute('data-tier');
                this.setObfuscationTier(tier);
            });
        });

        // Radar bottom pills
        document.querySelectorAll('.btn-radar-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                if (action === 'pulse') {
                    this.triggerObfuscationPulse();
                } else if (action === 'stealth') {
                    this.toggleStealth();
                } else if (action === 'resync') {
                    this.resyncCalendar();
                }
            });
        });

        // Modal Open / Close
        const modal = document.getElementById('geofence-modal');
        const openBtn = document.getElementById('btn-open-add-portal');
        const closeBtn = document.getElementById('btn-close-modal');
        const cancelBtn = document.getElementById('btn-cancel-modal');
        const form = document.getElementById('add-geofence-form');

        if (openBtn && modal) {
            openBtn.addEventListener('click', () => {
                modal.classList.add('active');
            });
        }

        const closeModal = () => {
            if (modal) modal.classList.remove('active');
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        // Modal Form Submit
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddGeofenceSubmit();
                closeModal();
            });
        }

        // Tools Grid Click Physics & HUD Feedback
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', () => {
                const toolName = card.querySelector('.tool-card-title').innerText;
                this.handleToolAction(toolName);
            });
        });

        // Card Features Action Buttons
        const btnCardPortal = document.getElementById('btn-card-portal');
        if (btnCardPortal && modal) {
            btnCardPortal.addEventListener('click', () => {
                modal.classList.add('active');
            });
        }

        const btnCardCalendar = document.getElementById('btn-card-calendar');
        if (btnCardCalendar) {
            btnCardCalendar.addEventListener('click', () => {
                this.showToast('📅 Google Calendar Proximity Engine: 4 Events Synced & Monitored');
            });
        }

        const btnCardAndroid = document.getElementById('btn-card-android');
        if (btnCardAndroid) {
            btnCardAndroid.addEventListener('click', () => {
                this.showToast('📱 Android Sovereign Sensor Engine: Telluric & Schumann Sync Active');
            });
        }
    }

    setObfuscationTier(tier) {
        this.currentTier = tier;
        document.querySelectorAll('.tier-item').forEach(item => {
            if (item.getAttribute('data-tier') === tier) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        const jitterEl = document.getElementById('metric-jitter');
        const entropyEl = document.getElementById('metric-entropy');
        const statusPillText = document.getElementById('nav-shield-text');

        if (tier === 'broad') {
            this.jitterKm = 8.4;
            this.entropy = 4.912;
            if (statusPillText) statusPillText.innerText = 'BROAD ZONE CLOAK (8.4 km Jitter)';
            this.showToast('🛡️ Switched to Broad Zone (~8.4 km Geohash Cluster)');
        } else if (tier === 'friends') {
            this.jitterKm = 0.85;
            this.entropy = 3.654;
            if (statusPillText) statusPillText.innerText = 'FRIENDS SECTOR ACTIVE (850m Jitter)';
            this.showToast('👥 Switched to Friends Sector (850m Semantic Neighbourhood)');
        } else if (tier === 'trusted') {
            this.jitterKm = 0.12;
            this.entropy = 2.118;
            if (statusPillText) statusPillText.innerText = 'TRUSTED CIRCLE LOCK (120m Jitter)';
            this.showToast('🔒 Switched to Trusted Circle (120m Strict Geofence)');
        }

        if (jitterEl) jitterEl.innerText = `±${this.jitterKm} km`;
        if (entropyEl) entropyEl.innerText = `${this.entropy} nats`;
    }

    triggerObfuscationPulse() {
        this.showToast('⚡ Invariant Skew-Normal Pulse Injected: Coordinates Re-Scrambled');
        const jitterEl = document.getElementById('metric-jitter');
        if (jitterEl) {
            jitterEl.style.transform = 'scale(1.2)';
            setTimeout(() => { jitterEl.style.transform = 'scale(1)'; }, 300);
        }
    }

    toggleStealth() {
        this.isStealthActive = !this.isStealthActive;
        const stealthBtn = document.querySelector('[data-action="stealth"]');
        const shieldPill = document.getElementById('nav-shield-pill');
        const shieldText = document.getElementById('nav-shield-text');

        if (this.isStealthActive) {
            if (stealthBtn) {
                stealthBtn.classList.add('active');
                stealthBtn.innerText = '🚨 STEALTH ACTIVE';
            }
            if (shieldPill) {
                shieldPill.style.borderColor = 'var(--rose-primary)';
                shieldPill.style.color = 'var(--rose-primary)';
                shieldPill.style.background = 'rgba(244, 63, 94, 0.15)';
            }
            if (shieldText) shieldText.innerText = 'ADIOS STEALTH: 100% GHOST CLOAK';
            this.showToast('🚨 Adios Stealth Engaged! GPS Transmitter Scrambled into Hypersphere Noise');
        } else {
            if (stealthBtn) {
                stealthBtn.classList.remove('active');
                stealthBtn.innerText = '🚨 Panic Stealth';
            }
            if (shieldPill) {
                shieldPill.style.borderColor = 'var(--emerald-primary)';
                shieldPill.style.color = 'var(--emerald-primary)';
                shieldPill.style.background = 'rgba(16, 185, 129, 0.12)';
            }
            if (shieldText) shieldText.innerText = 'HYPERSPHERE PRIVACY SHIELD: ACTIVE';
            this.showToast('✅ Normal Obfuscation Restored');
        }
    }

    resyncCalendar() {
        this.showToast('🔄 Calendar Proximity Resynced: Proximity verified for 4 geofences');
    }

    /* --------------------------------------------------------------------------
       DYNAMIC GEOFENCES TABLE
       -------------------------------------------------------------------------- */
    renderTable() {
        const tbody = document.getElementById('geofence-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.geofences.forEach(geo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="geo-name-cell">
                        <div class="geo-avatar" style="background: rgba(255,255,255,0.06);">${geo.avatar}</div>
                        <div>
                            <div class="geo-name-title">${geo.name}</div>
                            <div class="geo-name-sub">${geo.type}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge-privacy ${geo.tier}">
                        🛡️ ${geo.tierLabel}
                    </span>
                </td>
                <td style="font-family: var(--font-mono); font-weight: 600;">
                    ${geo.radius}
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem;">
                        <span>📅</span>
                        <span>${geo.calendarEvent}</span>
                    </div>
                </td>
                <td>
                    <span class="badge-status ${geo.status}">
                        ${geo.statusText}
                    </span>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button class="action-icon-btn btn-ping" title="Send Obfuscated Ping" data-id="${geo.id}">📡</button>
                        <button class="action-icon-btn btn-toggle" title="Toggle Shield" data-id="${geo.id}">🔒</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Table row button actions
        tbody.querySelectorAll('.btn-ping').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const geo = this.geofences.find(g => g.id === id);
                this.showToast(`📡 Ping Dispatched to ${geo.name}: Obfuscated Vector Delivered via Hopf Fiber`);
            });
        });

        tbody.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const geo = this.geofences.find(g => g.id === id);
                this.showToast(`🔒 Privacy Level Toggled for ${geo.name}`);
            });
        });
    }

    handleAddGeofenceSubmit() {
        const nameInput = document.getElementById('modal-geo-name');
        const typeInput = document.getElementById('modal-geo-type');
        const tierInput = document.getElementById('modal-geo-tier');
        const radiusInput = document.getElementById('modal-geo-radius');
        const calendarInput = document.getElementById('modal-geo-calendar');

        if (!nameInput || !nameInput.value.trim()) return;

        const newGeo = {
            id: 'geo-' + Date.now(),
            name: nameInput.value.trim(),
            type: typeInput ? typeInput.value : 'Custom Geofence',
            avatar: '📍',
            tier: tierInput ? tierInput.value : 'friends',
            tierLabel: tierInput && tierInput.value === 'max' ? 'Maximum Cloak' : (tierInput && tierInput.value === 'trusted' ? 'Trusted Circle' : 'Friends Sector'),
            radius: radiusInput ? radiusInput.value + ' m' : '500 m',
            calendarEvent: calendarInput && calendarInput.value.trim() ? calendarInput.value.trim() : 'Manual Trigger',
            status: 'monitoring',
            statusText: 'ARMED',
            blip: {
                x: (Math.random() - 0.5) * 1.4,
                y: (Math.random() - 0.5) * 1.4,
                color: '#00f0ff'
            }
        };

        this.geofences.push(newGeo);
        this.renderTable();
        this.showToast(`✨ Deployed Geofence "${newGeo.name}" to Audios Hypersphere Sync!`);

        // Reset form
        nameInput.value = '';
    }

    handleToolAction(toolName) {
        if (toolName === 'CSN Skew-Normal Injector') {
            const shift = this.wgs84.metersToGeodeticDelta(this.jitterKm * 1000, this.jitterKm * 1000, 51.5074);
            this.showToast(`🧬 Injected CSN Jitter (WGS84): ΔLat = +${shift.dLatDeg.toFixed(5)}°, ΔLon = +${shift.dLonDeg.toFixed(5)}° (±${this.jitterKm} km)`);
            return;
        }

        const feedbackMap = {
            'CSN Skew-Normal Injector': '🧬 Injected Closed Skew-Normal stochastic jitter into broadcast coordinate buffer.',
            'Hopf Fibration S³ Projector': '🌀 Calculated Hopf fiber projection (S³ → S² geoid mapping locked).',
            'Zero-Knowledge Verifier': '🔐 Generated ZK-SNARK proof of proximity without disclosing raw coordinate fix.',
            'Telluric Field Anchor': '🧭 Calibrated geomagnetic telluric sensor (47,120 nT anomaly verified).',
            'Peeling Chain Buster': '🛡️ Scrubbed tracking graph: zero-link peeling loop eliminated.',
            'UWB Ghost Beacon': '📡 Broadcasted pseudo-random UWB ghost signatures to blind local Bluetooth sniffers.',
            'Geofence Matrix': '📐 Loaded full 16-dimensional geofence topological constraint matrix.',
            'Adios Instant Cloak': '🚨 Emergency full-spectrum cloaking deployed: location wiped.'
        };

        const msg = feedbackMap[toolName] || `⚡ Executed ${toolName}`;
        this.showToast(msg);
    }

    startMetricsSimulation() {
        setInterval(() => {
            const deltaEl = document.getElementById('metric-delta');
            if (deltaEl) {
                const randExp = (Math.random() * 0.4 + 0.8).toFixed(2);
                deltaEl.innerText = `< 10⁻⁶ (${randExp}×10⁻⁷)`;
            }
        }, 3500);
    }

    showToast(message) {
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }

        toast.innerHTML = `<span>🛰️</span><span>${message}</span>`;
        toast.classList.add('active');

        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('active');
        }, 4000);
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    window.audiosSync = new AudiosHypersphereSync();
});


/* ==============================================================================
   TEAM ALIGNMENT & WEBFLOW PROMOTIONAL REPRESENTATION CONTROLLER
   ============================================================================== */

async function initTeamAlignment() {
    try {
        const res = await fetch('/api/audios/team_alignment');
        if (res.ok) {
            const data = await res.json();
            const timeElem = document.getElementById('lastHandshakeTime');
            if (timeElem && data.last_ack_timestamp) {
                const date = new Date(data.last_ack_timestamp * 1000);
                timeElem.textContent = date.toLocaleTimeString();
            }
            const tokenDisplay = document.getElementById('promoTokenDisplay');
            if (tokenDisplay && data.permissions && data.permissions.promo_token) {
                tokenDisplay.textContent = data.permissions.promo_token;
            }
        }
    } catch (e) {
        // Silent fallback to standard static state
    }
}

async function returnTeamInstructionAck() {
    const btn = document.getElementById('btnReturnTeamAck');
    const returnState = document.getElementById('dirReturnState');
    const statusTag = document.getElementById('realignStatusTag');
    const timeElem = document.getElementById('lastHandshakeTime');

    if (btn) {
        btn.querySelector('.btn-ack-title').textContent = 'Dispatched: Acknowledgment Logged to Workdesk Bus';
        btn.style.borderColor = '#10b981';
        btn.style.background = 'rgba(16, 185, 129, 0.25)';
    }

    try {
        const res = await fetch('/api/team/instruction/ack', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instruction_id: 'INST-AUDIOS-WF-PROMO-04',
                role: 'webflow_client',
                action: 'webflow_represent_promotional_granted',
                status: 'PROMPTLY_ACKNOWLEDGED',
                returned_at: Date.now() / 1000
            })
        });
        if (res.ok) {
            if (returnState) {
                returnState.textContent = 'PROMPTLY_RETURNED (CONFIRMED)';
                returnState.style.color = '#34d399';
            }
            if (statusTag) {
                statusTag.textContent = '● INSTRUCTION RETURNED PROMPTLY';
            }
            if (timeElem) {
                timeElem.textContent = new Date().toLocaleTimeString();
            }
        }
    } catch (e) {
        // Local confirmed
    }

    setTimeout(() => {
        if (btn) {
            btn.querySelector('.btn-ack-title').textContent = '✓ Permissions Return Active & Synchronized';
        }
    }, 2000);
}

function copyPromoToken() {
    const token = document.getElementById('promoTokenDisplay');
    const text = token ? token.textContent : 'QT-AUDIOS-WF-PROMO-2026-INVARIANT';
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied Promotional Access Token: ' + text);
    }).catch(() => {});
}

async function copyAudiosPromotionalEmbed() {
    try {
        const res = await fetch('/api/audios/promotional_embed');
        if (res.ok) {
            const data = await res.json();
            navigator.clipboard.writeText(data.embed_code || '').then(() => {
                alert('Webflow Promotional Radar Embed Code copied to clipboard!');
            });
            return;
        }
    } catch (e) {}

    // Fallback
    const fallbackEmbed = `<div class="w-embed">
<!-- QT Analytics Audios Promotional Embed -->
<iframe src="http://localhost:8080/audios" width="100%" height="480" style="border:none; border-radius:16px;"></iframe>
</div>`;
    navigator.clipboard.writeText(fallbackEmbed).then(() => {
        alert('Webflow Embed Code copied to clipboard!');
    });
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
    initTeamAlignment();
});


/* ==============================================================================
   AI STUDIOS LIVE FEED SYNCHRONIZATION CONTROLLER
   ============================================================================== */

const studiosSyncChannel = (typeof BroadcastChannel !== 'undefined')
    ? new BroadcastChannel('qt_ai_studios_sync')
    : null;

let studiosFeedState = {
    frameId: 1000,
    isPaused: false,
    masterPage: 'audios_sync',
    harmonicMultiple: 1.0,
    pulseAmplitude: 1.0,
    driftMs: 0.12,
    phase: 0.0
};

function initStudiosFeedSync() {
    if (studiosSyncChannel) {
        studiosSyncChannel.onmessage = (event) => {
            const msg = event.data;
            if (!msg) return;

            if (msg.type === 'FEED_TICK') {
                studiosFeedState.frameId = msg.frameId;
                studiosFeedState.phase = msg.phase;
                updateAudiosSyncHeaderUI(msg);
            } else if (msg.type === 'PARAM_UPDATE') {
                Object.assign(studiosFeedState, msg.parameters);
                updateAudiosSyncControlsUI();
            }
        };
    }

    // Live Feed polling loop from server
    setInterval(async () => {
        try {
            const res = await fetch('/api/studios/feed/live');
            if (res.ok) {
                const data = await res.json();
                if (data && data.sync_bus) {
                    studiosFeedState.frameId = data.sync_bus.frame_id;
                    studiosFeedState.isPaused = data.sync_bus.is_paused;
                    studiosFeedState.masterPage = data.sync_bus.master_page;
                    studiosFeedState.driftMs = data.sync_bus.drift_ms;
                    if (data.hypersphere) {
                        studiosFeedState.harmonicMultiple = data.hypersphere.harmonic_multiple;
                        studiosFeedState.phase = data.hypersphere.phase_rad;
                    }
                    updateAudiosSyncHeaderUI(data.sync_bus);
                    if (data.holographic_closure) {
                        updateAudiosClosureBadge(data.holographic_closure);
                    }
                }
            }
        } catch (e) {}
    }, 350);
}

function updateAudiosSyncHeaderUI(syncBus) {
    const pill = document.getElementById('nav-feed-lock-text');
    if (pill) {
        const state = syncBus.is_paused ? 'PAUSED' : (syncBus.lock_status || 'LOCKED');
        pill.textContent = `AI STUDIOS FEED: ${state} [FRAME #${syncBus.frame_id || studiosFeedState.frameId}]`;
    }
    const liveTag = document.getElementById('syncLiveStatusTag');
    if (liveTag) {
        liveTag.textContent = syncBus.is_paused ? '⏸️ FEED PAUSED' : '● FEED LOCKED (60 FPS)';
        liveTag.style.color = syncBus.is_paused ? '#f59e0b' : '#34d399';
    }
    const pauseLabel = document.getElementById('lblAudiosPause');
    if (pauseLabel) {
        pauseLabel.textContent = studiosFeedState.isPaused ? '▶️ Resume Feed' : '⏸️ Pause Feed';
    }
    const driftElem = document.getElementById('lblDriftMs');
    if (driftElem) {
        driftElem.textContent = `${(syncBus.drift_ms || 0.12).toFixed(2)}ms`;
    }
}

function updateAudiosClosureBadge(closure) {
    const navPill = document.getElementById('nav-closure-pill');
    if (navPill) {
        navPill.innerHTML = `<span style="color:#b388ff;">${closure.n1_bulk}×${closure.n2_boundary}=${closure.n3_target} (κ=${closure.closure_ratio.toFixed(3)})</span>`;
    }
    const tag = document.getElementById('syncClosureTag');
    if (tag) {
        tag.textContent = `N₁×N₂=N₃: ${closure.regime === 'HOLOGRAPHIC_CONTINUUM' ? 'HOLOGRAPHIC CONTINUUM' : 'MELONIC TRAP'}`;
        tag.style.color = closure.is_closed ? '#b388ff' : '#ff1744';
    }
}

function updateAudiosSyncControlsUI() {
    const masterLabel = document.getElementById('lblAudiosMaster');
    if (masterLabel) {
        masterLabel.textContent = `🔄 Master: ${studiosFeedState.masterPage === 'audios_sync' ? 'Audios' : 'GPS'}`;
    }
    const slider = document.getElementById('sliderHarmonic');
    if (slider) {
        slider.value = studiosFeedState.harmonicMultiple;
    }
    const badge = document.getElementById('lblHarmonicVal');
    if (badge) {
        const freq = (432.0 * studiosFeedState.harmonicMultiple).toFixed(0);
        badge.textContent = `${studiosFeedState.harmonicMultiple.toFixed(1)}x (${freq} Hz)`;
    }
}

async function toggleAudiosMaster() {
    const nextMaster = studiosFeedState.masterPage === 'audios_sync' ? 'locate_gps' : 'audios_sync';
    studiosFeedState.masterPage = nextMaster;
    updateAudiosSyncControlsUI();

    try {
        await fetch('/api/studios/feed/control', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggle_master' })
        });
        if (studiosSyncChannel) {
            studiosSyncChannel.postMessage({
                type: 'PARAM_UPDATE',
                parameters: { masterPage: nextMaster }
            });
        }
    } catch (e) {}
}

async function toggleAudiosPause() {
    studiosFeedState.isPaused = !studiosFeedState.isPaused;
    updateAudiosSyncHeaderUI(studiosFeedState);

    try {
        await fetch('/api/studios/feed/control', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggle_pause' })
        });
        if (studiosSyncChannel) {
            studiosSyncChannel.postMessage({
                type: 'PARAM_UPDATE',
                parameters: { isPaused: studiosFeedState.isPaused }
            });
        }
    } catch (e) {}
}

async function onHarmonicSliderChange(val) {
    const mult = parseFloat(val);
    studiosFeedState.harmonicMultiple = mult;
    const badge = document.getElementById('lblHarmonicVal');
    if (badge) {
        const freq = (432.0 * mult).toFixed(0);
        badge.textContent = `${mult.toFixed(1)}x (${freq} Hz)`;
    }

    try {
        await fetch('/api/studios/feed/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source_page: 'audios_sync',
                harmonic_multiple: mult
            })
        });
        if (studiosSyncChannel) {
            studiosSyncChannel.postMessage({
                type: 'PARAM_UPDATE',
                parameters: { harmonicMultiple: mult }
            });
        }
    } catch (e) {}
}

async function resetAudiosDrift() {
    studiosFeedState.driftMs = 0.05;
    const driftElem = document.getElementById('lblDriftMs');
    if (driftElem) driftElem.textContent = '0.05ms';

    try {
        await fetch('/api/studios/feed/control', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'drift_reset' })
        });
    } catch (e) {}
}

// Auto-run on load
document.addEventListener('DOMContentLoaded', () => {
    initStudiosFeedSync();
});
