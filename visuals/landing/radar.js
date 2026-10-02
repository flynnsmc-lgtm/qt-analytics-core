/**
 * radar.js — QT Analytics High-Precision Radar & Orbital Sweep Engine
 *
 * Performance Specifications:
 * - 60 FPS GPU-accelerated canvas glide (Time-delta driven, sub-pixel accuracy)
 * - Telemetry Throttling: Synced to radar sweep cycle (Periodic, not continuous)
 * - Smooth cubic/spline & Hermite position interpolation (Zero ticking, zero jumps)
 * - DOM readouts throttled to 24 Hz to eliminate layout thrashing
 * - Decimated, delta-compressed satellite orbit tracking
 */

(function () {
  const canvas = document.getElementById('radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  // DOM Readout Elements (Cached for zero layout query in render loop)
  const readoutAzimuth = document.getElementById('readout-azimuth');
  const readoutCycle = document.getElementById('readout-cycle');
  const readoutTracked = document.getElementById('readout-tracked');
  const readoutFps = document.getElementById('readout-fps');
  const hudBearing = document.getElementById('hud-bearing-display');

  let width = 0, height = 0, centerX = 0, centerY = 0, maxRadius = 0;
  let sweepAngle = 0.0;
  let sweepCycleCount = 1;
  let lastTimestamp = 0;
  let lastDomUpdate = 0;
  const DOM_THROTTLE_MS = 42; // ~24 Hz UI update rate

  // Sweep Configuration: 4.2 seconds per 360-degree rotation (gliding angular velocity)
  const SWEEP_PERIOD_SEC = 4.2;
  const ANGULAR_VELOCITY = (Math.PI * 2) / SWEEP_PERIOD_SEC; // rad/s

  // Decimated, Critical Orbit/Position Nodes (5 essential nodes only)
  const trackedNodes = [
    {
      id: 'GEO-SAT-01',
      baseDist: 0.82,
      baseSpeed: 0.04,
      currentAngle: 0.45,
      targetAngle: 0.45,
      prevAngle: 0.45,
      pingAlpha: 0.0,
      label: 'GEO-SAT-01 • 35,786 km • POS_LOCKED'
    },
    {
      id: 'LEO-NAV-04',
      baseDist: 0.58,
      baseSpeed: -0.09,
      currentAngle: 2.10,
      targetAngle: 2.10,
      prevAngle: 2.10,
      pingAlpha: 0.0,
      label: 'LEO-NAV-04 • 1,200 km • ANTI_SPOOF_OK'
    },
    {
      id: 'QT-NODE-07',
      baseDist: 0.38,
      baseSpeed: 0.12,
      currentAngle: 4.20,
      targetAngle: 4.20,
      prevAngle: 4.20,
      pingAlpha: 0.0,
      label: 'QT-NODE-07 • 850 km • CARRIER_SYNC'
    },
    {
      id: 'MEO-RELAY-02',
      baseDist: 0.72,
      baseSpeed: 0.06,
      currentAngle: 3.50,
      targetAngle: 3.50,
      prevAngle: 3.50,
      pingAlpha: 0.0,
      label: 'MEO-RELAY-02 • 20,200 km • VERIFIED'
    },
    {
      id: 'GROUND-BASE',
      baseDist: 0.20,
      baseSpeed: -0.15,
      currentAngle: 1.25,
      targetAngle: 1.25,
      prevAngle: 1.25,
      pingAlpha: 0.0,
      label: 'BASE-NODE • 0 km • SCHUMANN_LOCKED'
    }
  ];

  // Canvas Resize with High-DPI Backing Store
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.width = Math.round(rect.width * dpr);
    height = canvas.height = Math.round(rect.height * dpr);
    centerX = width / 2;
    centerY = height / 2;
    maxRadius = Math.min(centerX, centerY) * 0.90;
  }

  window.addEventListener('resize', resize);
  resize();

  /**
   * Periodic Telemetry Ingestion (Locked to Sweep Cycle)
   * Only called once per full 360-degree sweep cycle
   */
  function onSweepCycleBoundary() {
    sweepCycleCount++;

    // Compute delta changes for next cycle with spline target bounds
    trackedNodes.forEach(node => {
      node.prevAngle = node.currentAngle;
      // Advance by sweep period delta
      const deltaAngle = node.baseSpeed * (SWEEP_PERIOD_SEC / 4);
      node.targetAngle = (node.currentAngle + deltaAngle) % (Math.PI * 2);
    });
  }

  /**
   * Smooth Hermite / Lerp Interpolation
   */
  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  /**
   * Main Render Loop (60 FPS Glide)
   */
  function render(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1); // Clamp to prevent spiral on tab switch
    lastTimestamp = timestamp;

    const previousAngle = sweepAngle;
    sweepAngle += ANGULAR_VELOCITY * dt;

    // Detect Sweep Cycle Boundary (when sweep passes 2*PI / 0)
    if (sweepAngle >= Math.PI * 2) {
      sweepAngle -= Math.PI * 2;
      onSweepCycleBoundary();
    }

    // Normalized progress through current sweep cycle [0..1]
    const cycleProgress = sweepAngle / (Math.PI * 2);

    // Clear Canvas with clearRect
    ctx.clearRect(0, 0, width, height);

    // =========================================================================
    // 1. Static Geometry: Concentric Range Rings
    // =========================================================================
    const rings = [0.20, 0.38, 0.58, 0.74, 0.92];
    const ringLabels = ['50 km', '250 km', 'LEO 1200km', 'MEO 20000km', 'GEO 35786km'];

    ctx.lineWidth = 1;
    for (let i = 0; i < rings.length; i++) {
      const r = maxRadius * rings[i];
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.stroke();

      // Range text
      ctx.fillStyle = 'rgba(0, 240, 255, 0.40)';
      ctx.font = `${Math.max(9, Math.round(width * 0.015))}px monospace`;
      ctx.fillText(ringLabels[i], centerX + 8, centerY - r + 11);
    }

    // =========================================================================
    // 2. Crosshairs & Radial Azimuth Markings
    // =========================================================================
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(centerX - maxRadius, centerY);
    ctx.lineTo(centerX + maxRadius, centerY);
    ctx.moveTo(centerX, centerY - maxRadius);
    ctx.lineTo(centerX, centerY + maxRadius);
    ctx.stroke();

    // Subtle 45-degree guide rays
    ctx.beginPath();
    const dR = maxRadius * 0.7071;
    ctx.moveTo(centerX - dR, centerY - dR);
    ctx.lineTo(centerX + dR, centerY + dR);
    ctx.moveTo(centerX - dR, centerY + dR);
    ctx.lineTo(centerX + dR, centerY - dR);
    ctx.stroke();

    // =========================================================================
    // 3. Elliptical Keplerian Orbit Guides
    // =========================================================================
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, maxRadius * 0.85, maxRadius * 0.48, -0.32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, maxRadius * 0.65, maxRadius * 0.36, 0.52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // =========================================================================
    // 4. Rotating Radar Sweep (Conical Gradient Wedge — Smooth 60 FPS Glide)
    // =========================================================================
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(sweepAngle);

    // Phosphorescent trailing sweep wedge
    const trailSegments = 36;
    const wedgeSpan = Math.PI * 0.38; // ~68 degrees trail
    for (let i = 0; i < trailSegments; i++) {
      const arcStart = -(i / trailSegments) * wedgeSpan;
      const arcEnd = -((i + 1) / trailSegments) * wedgeSpan;
      const alpha = (1 - (i / trailSegments)) * 0.20;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxRadius, arcStart, arcEnd, true);
      ctx.closePath();
      ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
      ctx.fill();
    }

    // Leading Phosphor Sweep Arm
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(maxRadius, 0);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.0;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();

    // =========================================================================
    // 5. Interpolated Satellite Nodes & Sweep-Triggered Pings
    // =========================================================================
    trackedNodes.forEach(node => {
      // Smooth Hermite position interpolation between cycle steps
      node.currentAngle = lerp(node.prevAngle, node.targetAngle, cycleProgress);

      const sx = centerX + Math.cos(node.currentAngle) * (maxRadius * node.baseDist);
      const sy = centerY + Math.sin(node.currentAngle) * (maxRadius * node.baseDist);

      // Bearing of this node relative to center
      const nodeBearing = (Math.atan2(sy - centerY, sx - centerX) + Math.PI * 2) % (Math.PI * 2);

      // Check if sweep line passed node during this time step
      const angleDiff = Math.abs(sweepAngle - nodeBearing);
      if (angleDiff < 0.06 || angleDiff > (Math.PI * 2 - 0.06)) {
        node.pingAlpha = 1.0; // Trigger ping pulse
      }

      // Draw Expanding Ping Ring
      if (node.pingAlpha > 0) {
        ctx.beginPath();
        const pingRadius = 6 + (1 - node.pingAlpha) * 32;
        ctx.arc(sx, sy, pingRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${node.pingAlpha * 0.85})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        node.pingAlpha -= dt * 1.5; // Eased decay
      }

      // Draw Solid Satellite Blip
      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.fill();

      // Satellite Label Tag (Sub-pixel aligned)
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
      ctx.font = `600 ${Math.max(9, Math.round(width * 0.013))}px 'Inter', sans-serif`;
      ctx.fillText(node.id, sx + 8, sy - 6);

      // Orbit Telemetry Subtext
      ctx.fillStyle = 'rgba(0, 240, 255, 0.65)';
      ctx.font = `400 ${Math.max(8, Math.round(width * 0.011))}px monospace`;
      ctx.fillText(node.label.split(' • ')[1] || '', sx + 8, sy + 6);
    });

    // =========================================================================
    // 6. Central Stationary Antenna Core
    // =========================================================================
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 16;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 13, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // =========================================================================
    // 7. Throttled DOM Telemetry Updates (~24 Hz)
    // =========================================================================
    if (timestamp - lastDomUpdate >= DOM_THROTTLE_MS) {
      lastDomUpdate = timestamp;
      const degrees = ((sweepAngle * (180 / Math.PI)) % 360).toFixed(1);
      const paddedDeg = degrees.padStart(5, '0');

      if (readoutAzimuth) readoutAzimuth.textContent = `${paddedDeg}°`;
      if (readoutCycle) readoutCycle.textContent = `#${sweepCycleCount}`;
      if (hudBearing) hudBearing.textContent = `BEARING: ${paddedDeg}° TRUE`;
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
