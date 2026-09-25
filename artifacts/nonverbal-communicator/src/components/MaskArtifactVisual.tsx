import React, { useState } from 'react';
import { Camera, Layers, Eye, Sparkles, ZoomIn, Info, Activity, Maximize2, ShieldCheck, X } from 'lucide-react';
import maskPhoto from '../assets/mask-photo.png';
import maskTransparent from '../assets/mask-transparent.png';

interface MaskArtifactVisualProps {
  onSelectNode?: (nodeId: string) => void;
  activeNodeId?: string | null;
}

export function MaskArtifactVisual({ onSelectNode, activeNodeId }: MaskArtifactVisualProps) {
  const [viewMode, setViewMode] = useState<'photo' | 'transparent' | 'cad'>('photo');
  const [cadAngle, setCadAngle] = useState<'front' | 'perspective'>('front');
  const [pulseActive, setPulseActive] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  const nodes = [
    { id: 'screen', name: 'OLED Spectrogram', tag: 'Visual Transmitter' },
    { id: 'nose', name: 'Nose Aperture', tag: 'Acoustic Bridge' },
    { id: 'chip', name: 'Dialect Chipher', tag: 'Modular Key' },
    { id: 'sonic', name: 'Piezo Nozzle', tag: 'Harmonic Output' },
    { id: 'wire', name: 'Loop Conduit', tag: 'Near-Field Sync' },
  ];

  // Hotspots directly positioned over the authentic ChatGPT artifact image (1002x737 coordinate mapping)
  const photoHotspots = [
    { id: 'nose', name: 'Nose Aperture', tag: 'Acoustic Bridge', top: '39%', left: '50%' },
    { id: 'screen', name: 'OLED Spectrogram', tag: 'Visual Transmitter', top: '50.2%', left: '50%' },
    { id: 'chip', name: 'Left Dialect Chipher', tag: 'Community Key #01', top: '36%', left: '31%' },
    { id: 'chip', name: 'Right Dialect Chipher', tag: 'Community Key #02', top: '36%', left: '69%' },
    { id: 'sonic', name: 'Piezo Resonator', tag: 'Harmonic Nozzle', top: '61.5%', left: '50%' },
    { id: 'wire', name: 'Conduit Loop', tag: 'Near-Field Sync Cable', top: '79.5%', left: '50%' },
  ];

  return (
    <div className="nc-product-demo-container">
      {/* Top Demo Toolbar: Mode Switcher & Live Indicators */}
      <div className="nc-demo-toolbar">
        <div className="nc-demo-angle-group">
          <button
            type="button"
            className={`nc-demo-angle-pill ${viewMode === 'photo' ? 'is-active' : ''}`}
            onClick={() => setViewMode('photo')}
            aria-label="View Specimen Photograph"
            data-testid="mode-artifact-photo"
          >
            <Camera size={13} aria-hidden="true" />
            <span>Artifact Photo</span>
            <span className="nc-angle-tag">Specimen</span>
          </button>

          <button
            type="button"
            className={`nc-demo-angle-pill ${viewMode === 'transparent' ? 'is-active' : ''}`}
            onClick={() => setViewMode('transparent')}
            aria-label="View Isolated Cutout"
            data-testid="mode-isolated-cutout"
          >
            <Sparkles size={13} aria-hidden="true" />
            <span>Isolated Cutout</span>
          </button>

          <button
            type="button"
            className={`nc-demo-angle-pill ${viewMode === 'cad' ? 'is-active' : ''}`}
            onClick={() => setViewMode('cad')}
            aria-label="View Vector Schematic Blueprint"
            data-testid="mode-vector-cad"
          >
            <Layers size={13} aria-hidden="true" />
            <span>Vector CAD</span>
          </button>
        </div>

        <div className="nc-demo-meta-strip">
          <button
            type="button"
            className={`nc-demo-pulse-toggle ${pulseActive ? 'is-active' : ''}`}
            style={{ borderRadius: 9999 }}
            onClick={() => setPulseActive(!pulseActive)}
            title="Toggle Live Spectrogram Pulse"
          >
            <Activity size={12} aria-hidden="true" />
            <span>{pulseActive ? 'OLED TRANSMITTING' : 'OLED STANDBY'}</span>
          </button>
          <span className="nc-demo-spec-id">SPECIMEN · EC(AK)OU-v1</span>
        </div>
      </div>

      {/* Main Product Demo Stage (Realistic Studio Lighting) */}
      <div className="nc-demo-stage-canvas">
        {/* Optical Backdrop Caustic Glows */}
        <div className="nc-demo-radial-glow" aria-hidden="true" />
        <div className="nc-demo-pedestal-shadow" aria-hidden="true" />

        {/* 01. ACTUAL PHOTOGRAPH OF THE MASK (Default & Primary Display) */}
        {(viewMode === 'photo' || viewMode === 'transparent') && (
          <div className="nc-mask-photo-wrapper">
            <div className={`nc-photo-frame ${viewMode === 'transparent' ? 'transparent-mode' : ''}`}>
              {/* Badge Over Photo */}
              <div className="nc-photo-caption-tag">
                <span className="dot" />
                <span>{viewMode === 'photo' ? 'Authentic Specimen Photograph' : 'Studio Isolated Cutout'}</span>
              </div>

              {/* The Actual ChatGPT Mask Image */}
              <img
                src={viewMode === 'photo' ? maskPhoto : maskTransparent}
                alt="Ec(ak)ou Physical Specimen Mask - Wearable acoustic camouflage device with central OLED spectrogram and dialect chip cartridges"
                className={`nc-mask-actual-photo ${viewMode === 'transparent' ? 'transparent-mode' : ''}`}
                data-testid="actual-mask-specimen-photo"
              />

              {/* Live Signal Pulse Overlay */}
              {pulseActive && <div className="nc-photo-pulse-halo" aria-hidden="true" />}

              {/* Interactive Hotspot Beacons Overlaid Directly On The Photograph */}
              {photoHotspots.map((h, idx) => {
                const isSelected = activeNodeId === h.id;
                return (
                  <button
                    key={`${h.id}-${idx}`}
                    type="button"
                    className={`nc-photo-hotspot-pin ${isSelected ? 'is-active' : ''}`}
                    style={{ top: h.top, left: h.left }}
                    onClick={() => onSelectNode?.(h.id)}
                    aria-label={`Inspect ${h.name}`}
                    title={`Click to inspect ${h.name} (${h.tag})`}
                  >
                    <span className="nc-pin-beacon">
                      <span className="nc-pin-ring" />
                      <span className="nc-pin-core" />
                    </span>
                    <span className="nc-pin-tooltip">
                      <strong>{h.name}</strong> · {h.tag}
                    </span>
                  </button>
                );
              })}

              {/* Controls Bar: Zoom & Inspection */}
              <div className="nc-photo-controls-bar">
                <button
                  type="button"
                  className="nc-photo-zoom-btn"
                  onClick={() => setIsZoomed(true)}
                  title="Expand photograph to high-resolution inspection modal"
                >
                  <Maximize2 size={12} aria-hidden="true" />
                  <span>Inspect High-Res</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 02. VECTOR CAD BLUEPRINT (When CAD mode is toggled) */}
        {viewMode === 'cad' && (
          cadAngle === 'front' ? (
            <svg
              viewBox="0 0 540 640"
              className="nc-demo-svg-object"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Ec(ak)ou Ghost Speech Mask - Front Elevation CAD Blueprint"
            >
            <defs>
              {/* Studio Drop Shadow for Mask Body */}
              <filter id="studioDropShadow" x="-20%" y="-15%" width="140%" height="145%">
                <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#000000" floodOpacity="0.8" />
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0033aa" floodOpacity="0.35" />
              </filter>

              {/* Wire Loop Soft Shadow */}
              <filter id="wireShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.65" />
              </filter>

              {/* Screen Glow */}
              <filter id="oledDisplayGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Cobalt Plastic Body Material Gradients */}
              <linearGradient id="cobaltBaseGrad" x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stopColor="#2575fc" />
                <stop offset="25%" stopColor="#0a52d4" />
                <stop offset="60%" stopColor="#0035a0" />
                <stop offset="100%" stopColor="#001852" />
              </linearGradient>

              <linearGradient id="cobaltLightSheen" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#64b5f6" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#1e88e5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0d47a1" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="darkCreviceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0a192f" />
                <stop offset="100%" stopColor="#020610" />
              </linearGradient>

              <radialGradient id="lensRingGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0d3b66" />
                <stop offset="65%" stopColor="#001733" />
                <stop offset="100%" stopColor="#0044aa" />
              </radialGradient>

              <linearGradient id="metalClipGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a99a8" />
                <stop offset="50%" stopColor="#f0f4f8" />
                <stop offset="100%" stopColor="#718096" />
              </linearGradient>
            </defs>

            {/* =============================================================
                01. CABLES & WIRE LOOPS (Back Layer with Shadows)
                ============================================================= */}
            <g id="wire-conduits-front" filter="url(#wireShadow)">
              {/* PRIMARY MASSIVE HANGING WIRE LOOP (Matches photo loop!) */}
              {/* Originates from left of screen, plunges into a deep graceful oval loop, climbs back to right of screen */}
              <path
                d="M 172 260 C 40 320, 45 490, 180 570 C 315 650, 500 500, 435 340 C 410 280, 375 285, 368 260"
                stroke="#0066ff"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 172 260 C 40 320, 45 490, 180 570 C 315 650, 500 500, 435 340 C 410 280, 375 285, 368 260"
                stroke="#00d4ff"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
              />
              <path
                d="M 172 260 C 40 320, 45 490, 180 570 C 315 650, 500 500, 435 340 C 410 280, 375 285, 368 260"
                stroke="#ffffff"
                strokeWidth="0.8"
                strokeDasharray="4 12"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />

              {/* Upper Left Earloop Arc */}
              <path
                d="M 215 220 C 170 210, 150 250, 185 275"
                stroke="#0080ff"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 215 220 C 170 210, 150 250, 185 275"
                stroke="#40c4ff"
                strokeWidth="1.2"
                fill="none"
              />

              {/* Upper Right Earloop Arc */}
              <path
                d="M 325 220 C 370 210, 390 250, 355 275"
                stroke="#0080ff"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 325 220 C 370 210, 390 250, 355 275"
                stroke="#40c4ff"
                strokeWidth="1.2"
                fill="none"
              />

              {/* Lower Free-Hanging Wire Leads with Stripped Copper Ends */}
              <path d="M 230 330 C 205 380, 175 420, 160 445" stroke="#0077ff" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 230 330 C 205 380, 175 420, 160 445" stroke="#00e5ff" strokeWidth="1" fill="none" />
              {/* Exposed copper tip */}
              <line x1="160" y1="445" x2="157" y2="449" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

              <path d="M 236 335 C 220 380, 195 425, 182 455" stroke="#0066ee" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 236 335 C 220 380, 195 425, 182 455" stroke="#00e5ff" strokeWidth="1" fill="none" />
              <line x1="182" y1="455" x2="180" y2="459" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

              <path d="M 304 335 C 315 380, 340 435, 355 470" stroke="#0066ee" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 304 335 C 315 380, 340 435, 355 470" stroke="#00e5ff" strokeWidth="1" fill="none" />
              <line x1="355" y1="470" x2="357" y2="474" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

              <path d="M 310 330 C 330 380, 360 425, 375 450" stroke="#0077ff" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 310 330 C 330 380, 360 425, 375 450" stroke="#00e5ff" strokeWidth="1" fill="none" />
              <line x1="375" y1="450" x2="378" y2="454" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* =============================================================
                02. MAIN MASK CHASSIS (Solid Cobalt 3D-Printed Plastic)
                ============================================================= */}
            <g id="mask-body-front" filter="url(#studioDropShadow)">
              {/* TOP CROWN HEAD PODS (3 sculpted vertical curved segments) */}
              {/* Left pod */}
              <path
                d="M 220 50 C 205 38, 230 32, 246 88 L 242 165 C 220 160, 204 125, 220 50 Z"
                fill="url(#cobaltBaseGrad)"
                stroke="#1565c0"
                strokeWidth="1.5"
              />
              <path d="M 222 55 Q 235 44 242 95" stroke="#90caf9" strokeWidth="1.8" opacity="0.8" fill="none" />

              {/* Right pod */}
              <path
                d="M 320 50 C 335 38, 310 32, 294 88 L 298 165 C 320 160, 336 125, 320 50 Z"
                fill="url(#cobaltBaseGrad)"
                stroke="#1565c0"
                strokeWidth="1.5"
              />
              <path d="M 318 55 Q 305 44 298 95" stroke="#90caf9" strokeWidth="1.8" opacity="0.8" fill="none" />

              {/* Center Main Forehead Dome */}
              <path
                d="M 244 80 C 255 58, 285 58, 296 80 L 298 170 C 275 180, 265 180, 242 170 Z"
                fill="url(#cobaltBaseGrad)"
                stroke="#0d47a1"
                strokeWidth="1.5"
              />

              {/* Center Crown Circular Recessed Aperture (Nose Bridge in Photo) */}
              <circle cx="270" cy="116" r="24" fill="#001845" stroke="#1e88e5" strokeWidth="2.5" />
              <circle cx="270" cy="116" r="17" fill="url(#lensRingGrad)" stroke="#42a5f5" strokeWidth="1.6" />
              <circle cx="270" cy="116" r="10" fill="#000d26" stroke="#90caf9" strokeWidth="1" />
              <circle cx="266" cy="112" r="3" fill="#ffffff" opacity="0.8" />

              {/* Upper Pod Feature Indentations (As seen in photo) */}
              <ellipse cx="230" cy="74" rx="4" ry="7" fill="#00163b" stroke="#1976d2" strokeWidth="1" />
              <ellipse cx="310" cy="74" rx="4" ry="7" fill="#00163b" stroke="#1976d2" strokeWidth="1" />

              {/* ===========================================================
                  03. DUAL ANGLED DATA CHIPS ("CHIPHERS")
                  =========================================================== */}
              {/* Left Angled Chipher Plug (Protrudes at ~35 deg left) */}
              <g
                id="chipher-module-left"
                className="nc-demo-interactive-node"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectNode?.('chip')}
              >
                <rect
                  x="142"
                  y="126"
                  width="46"
                  height="26"
                  rx="4"
                  transform="rotate(-38 142 126)"
                  fill="url(#cobaltBaseGrad)"
                  stroke="#64b5f6"
                  strokeWidth="1.8"
                />
                <rect
                  x="146"
                  y="130"
                  width="38"
                  height="18"
                  rx="2"
                  transform="rotate(-38 142 126)"
                  fill="#00173d"
                />
                {/* Chip internal contacts */}
                <line x1="150" y1="135" x2="175" y2="115" stroke="#f59e0b" strokeWidth="2" />
                <line x1="154" y1="140" x2="179" y2="120" stroke="#00e5ff" strokeWidth="1.5" />
              </g>

              {/* Right Angled Chipher Plug (Protrudes at ~35 deg right) */}
              <g
                id="chipher-module-right"
                className="nc-demo-interactive-node"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectNode?.('chip')}
              >
                <rect
                  x="398"
                  y="98"
                  width="46"
                  height="26"
                  rx="4"
                  transform="rotate(38 398 98)"
                  fill="url(#cobaltBaseGrad)"
                  stroke="#64b5f6"
                  strokeWidth="1.8"
                />
                <rect
                  x="402"
                  y="102"
                  width="38"
                  height="18"
                  rx="2"
                  transform="rotate(38 398 98)"
                  fill="#00173d"
                />
                {/* Chip internal contacts */}
                <line x1="406" y1="108" x2="431" y2="128" stroke="#f59e0b" strokeWidth="2" />
                <line x1="410" y1="113" x2="435" y2="133" stroke="#00e5ff" strokeWidth="1.5" />
              </g>

              {/* ===========================================================
                  04. MID CHASSIS & DUAL ACOUSTIC NOZZLES
                  =========================================================== */}
              {/* Mid Horizontal Bracket Plate */}
              <rect
                x="200"
                y="172"
                width="140"
                height="44"
                rx="6"
                fill="url(#cobaltBaseGrad)"
                stroke="#1e88e5"
                strokeWidth="1.6"
              />

              {/* Dual Cylindrical Audio Intake / Piezo Ports (Flanking the bridge) */}
              <g id="acoustic-intake-ports">
                {/* Left circular port */}
                <circle cx="218" cy="192" r="14" fill="#001333" stroke="#2196f3" strokeWidth="2" />
                <circle cx="218" cy="192" r="8" fill="#000714" stroke="#00e5ff" strokeWidth="1.2" />
                <circle cx="218" cy="192" r="4" fill="#001f4d" />

                {/* Right circular port */}
                <circle cx="322" cy="192" r="14" fill="#001333" stroke="#2196f3" strokeWidth="2" />
                <circle cx="322" cy="192" r="8" fill="#000714" stroke="#00e5ff" strokeWidth="1.2" />
                <circle cx="322" cy="192" r="4" fill="#001f4d" />
              </g>

              {/* Mechanical Hinge Bar above screen */}
              <rect x="238" y="206" width="64" height="12" rx="3" fill="#001d4a" stroke="#1565c0" strokeWidth="1" />
              <circle cx="246" cy="212" r="2.5" fill="#90caf9" />
              <circle cx="294" cy="212" r="2.5" fill="#90caf9" />

              {/* ===========================================================
                  05. CENTRAL OLED DISPLAY TRANSMITTER
                  =========================================================== */}
              {/* Screen Outer Bezel & Plastic Mount */}
              <rect
                x="195"
                y="218"
                width="150"
                height="100"
                rx="8"
                fill="url(#darkCreviceGrad)"
                stroke="#1e88e5"
                strokeWidth="2.4"
                className="nc-demo-interactive-node"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectNode?.('screen')}
              />

              {/* Chrome Retaining Corner Clips (As seen in the real photo!) */}
              <rect x="193" y="222" width="6" height="12" rx="1.5" fill="url(#metalClipGrad)" stroke="#2d3748" strokeWidth="0.5" />
              <rect x="341" y="222" width="6" height="12" rx="1.5" fill="url(#metalClipGrad)" stroke="#2d3748" strokeWidth="0.5" />
              <rect x="193" y="302" width="6" height="12" rx="1.5" fill="url(#metalClipGrad)" stroke="#2d3748" strokeWidth="0.5" />
              <rect x="341" y="302" width="6" height="12" rx="1.5" fill="url(#metalClipGrad)" stroke="#2d3748" strokeWidth="0.5" />

              {/* Glossy Obsidian Glass Display Panel */}
              <rect
                x="201"
                y="224"
                width="138"
                height="88"
                rx="4"
                fill="#030814"
                stroke="#0d47a1"
                strokeWidth="1"
              />

              {/* Glass Diagonal Reflection Glint */}
              <path
                d="M 202 225 L 260 225 L 215 311 L 202 311 Z"
                fill="#ffffff"
                opacity="0.04"
              />

              {/* LIVE ACTIVE SPECTROGRAM VISUALIZER ON SCREEN */}
              {pulseActive && (
                <g filter="url(#oledDisplayGlow)" className="nc-oled-pulse-group">
                  {/* Subtle Grid Lines */}
                  <line x1="202" y1="250" x2="338" y2="250" stroke="#00e5ff" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 3" />
                  <line x1="202" y1="285" x2="338" y2="285" stroke="#00e5ff" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 3" />
                  <line x1="248" y1="225" x2="248" y2="311" stroke="#00e5ff" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 3" />
                  <line x1="292" y1="225" x2="292" y2="311" stroke="#00e5ff" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 3" />

                  {/* Primary Harmonic Frequency Ribbon (Cyan) */}
                  <path
                    d="M 205 272 Q 220 238 238 274 T 272 255 T 308 280 T 335 264"
                    stroke="#00f0ff"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    className="nc-pulse-wave-1"
                  />

                  {/* Secondary Overtone (Pure White) */}
                  <path
                    d="M 205 284 Q 224 256 245 288 T 285 268 T 320 286 T 335 276"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    fill="none"
                    opacity="0.9"
                    strokeLinecap="round"
                    className="nc-pulse-wave-2"
                  />

                  {/* Sub-harmonic Accent (Electric Blue) */}
                  <path
                    d="M 205 262 Q 222 284 240 258 T 278 282 T 315 250 T 335 270"
                    stroke="#1d83ff"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.85"
                    strokeLinecap="round"
                    className="nc-pulse-wave-3"
                  />

                  {/* Dynamic Playback Scan Needle (Bright Ice Cyan) */}
                  <line x1="268" y1="225" x2="268" y2="311" stroke="#00e5ff" strokeWidth="2" opacity="0.95" className="nc-scan-line" />

                  {/* Measure Tags on Screen */}
                  <text x="206" y="236" fill="#00e5ff" fontSize="6.5" fontFamily="var(--app-font-mono)" letterSpacing="0.08em">
                    01·EC(AK)OU
                  </text>
                  <text x="300" y="236" fill="#ffffff" fontSize="6.5" fontFamily="var(--app-font-mono)">
                    44.1k
                  </text>
                </g>
              )}

              {/* ===========================================================
                  06. LOWER RIBBED EXHAUST STEM (Breathing Stem)
                  =========================================================== */}
              {/* Symmetrical segmented tube extending down (Matches photo!) */}
              <g
                id="breathing-stem"
                className="nc-demo-interactive-node"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectNode?.('sonic')}
              >
                {/* Main vertical stem core */}
                <path
                  d="M 252 318 L 252 388 C 252 396, 288 396, 288 388 L 288 318 Z"
                  fill="url(#cobaltBaseGrad)"
                  stroke="#1565c0"
                  strokeWidth="1.8"
                />

                {/* Prominent Rounded Accordion Ribs */}
                <rect x="248" y="328" width="44" height="6.5" rx="3" fill="#1e88e5" stroke="#90caf9" strokeWidth="1" />
                <rect x="248" y="342" width="44" height="6.5" rx="3" fill="#1e88e5" stroke="#90caf9" strokeWidth="1" />
                <rect x="248" y="356" width="44" height="6.5" rx="3" fill="#1e88e5" stroke="#90caf9" strokeWidth="1" />
                <rect x="248" y="370" width="44" height="6.5" rx="3" fill="#1e88e5" stroke="#90caf9" strokeWidth="1" />

                {/* Bottom Exhaust Collar & Nozzle */}
                <path
                  d="M 256 388 L 256 404 C 256 408, 284 408, 284 404 L 284 388 Z"
                  fill="#001845"
                  stroke="#00d4ff"
                  strokeWidth="1.4"
                />
                <ellipse cx="270" cy="404" rx="10" ry="3.5" fill="#000714" stroke="#00e5ff" strokeWidth="1.2" />
              </g>
            </g>
          </svg>
        ) : (
          /* =================================================================
             3/4 DYNAMIC PERSPECTIVE VIEW (Extracted from photo left specimen)
             ================================================================= */
          <svg
            viewBox="0 0 540 640"
            className="nc-demo-svg-object"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Ec(ak)ou Ghost Speech Mask - 3/4 Dynamic Angle Product Demo"
          >
            <defs>
              <filter id="pDropShadow" x="-20%" y="-15%" width="140%" height="145%">
                <feDropShadow dx="8" dy="18" stdDeviation="20" floodColor="#000000" floodOpacity="0.8" />
                <feDropShadow dx="4" dy="6" stdDeviation="10" floodColor="#0033aa" floodOpacity="0.3" />
              </filter>
              <linearGradient id="pCobaltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2575fc" />
                <stop offset="40%" stopColor="#0a52d4" />
                <stop offset="85%" stopColor="#001852" />
              </linearGradient>
            </defs>

            {/* Wire Loop swinging out to the left (As in photo left mask) */}
            <path
              d="M 170 240 C 20 300, 10 500, 190 570 C 330 620, 480 500, 420 330"
              stroke="#0066ff"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 170 240 C 20 300, 10 500, 190 570 C 330 620, 480 500, 420 330"
              stroke="#00d4ff"
              strokeWidth="2"
              fill="none"
              opacity="0.9"
            />

            {/* Trailing wires */}
            <path d="M 230 400 Q 170 460 140 500" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" fill="none" />
            <path d="M 260 410 Q 300 480 340 520" stroke="#0077ff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" fill="none" />

            {/* Angled Mask Body Group */}
            <g id="perspective-mask-body" filter="url(#pDropShadow)">
              {/* Tilted Top Pods */}
              <path
                d="M 220 50 C 190 30, 240 25, 290 100 L 265 180 C 225 170, 185 130, 220 50 Z"
                fill="url(#pCobaltGrad)"
                stroke="#1565c0"
                strokeWidth="1.6"
              />
              <path
                d="M 320 80 C 340 50, 300 40, 280 110 L 285 170 C 315 170, 345 140, 320 80 Z"
                fill="url(#pCobaltGrad)"
                stroke="#1565c0"
                strokeWidth="1.6"
              />

              {/* Nose Bridge Lens Disc (Tilted Ellipse) */}
              <ellipse cx="270" cy="148" rx="22" ry="18" fill="#001845" stroke="#1e88e5" strokeWidth="2.4" />
              <ellipse cx="270" cy="148" rx="14" ry="11" fill="#0035a0" stroke="#64b5f6" strokeWidth="1.4" />
              <ellipse cx="267" cy="145" rx="4" ry="3" fill="#ffffff" opacity="0.75" />

              {/* Left Protruding Chipher Cartridge */}
              <g
                id="p-chipher-left"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectNode?.('chip')}
              >
                <rect
                  x="140"
                  y="152"
                  width="48"
                  height="26"
                  rx="4"
                  transform="rotate(-48 140 152)"
                  fill="url(#pCobaltGrad)"
                  stroke="#64b5f6"
                  strokeWidth="1.8"
                />
                <line x1="148" y1="160" x2="175" y2="135" stroke="#00d8ff" strokeWidth="2" />
              </g>

              {/* Right Protruding Chipher Cartridge */}
              <g
                id="p-chipher-right"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectNode?.('chip')}
              >
                <rect
                  x="380"
                  y="125"
                  width="48"
                  height="26"
                  rx="4"
                  transform="rotate(26 380 125)"
                  fill="url(#pCobaltGrad)"
                  stroke="#64b5f6"
                  strokeWidth="1.8"
                />
                <line x1="388" y1="133" x2="415" y2="148" stroke="#00d8ff" strokeWidth="2" />
              </g>

              {/* Tilted Mid Section & Orifices */}
              <ellipse cx="235" cy="215" rx="12" ry="14" fill="#001333" stroke="#2196f3" strokeWidth="2" />
              <ellipse cx="325" cy="225" rx="12" ry="14" fill="#001333" stroke="#2196f3" strokeWidth="2" />

              {/* Tilted Perspective OLED Screen */}
              <polygon
                points="195,245 345,265 325,365 175,335"
                fill="#030814"
                stroke="#1e88e5"
                strokeWidth="2.6"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectNode?.('screen')}
              />
              <polygon
                points="202,252 338,270 320,358 184,332"
                fill="#01050e"
                stroke="#0d47a1"
                strokeWidth="1"
              />

              {/* Tilted Screen Waveforms */}
              {pulseActive && (
                <g opacity="0.95">
                  <path
                    d="M 195 295 Q 230 260 260 320 T 325 305"
                    stroke="#00f0ff"
                    strokeWidth="2.4"
                    fill="none"
                    strokeLinecap="round"
                    className="nc-pulse-wave-1"
                  />
                  <path
                    d="M 195 310 Q 240 280 270 330 T 325 320"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    fill="none"
                    opacity="0.9"
                    strokeLinecap="round"
                    className="nc-pulse-wave-3"
                  />
                  <line x1="260" y1="258" x2="245" y2="350" stroke="#00e5ff" strokeWidth="2" />
                </g>
              )}

              {/* Tilted Downward Stem with Ribs */}
              <path
                d="M 235 345 L 225 430 L 265 435 L 275 352 Z"
                fill="url(#pCobaltGrad)"
                stroke="#1565c0"
                strokeWidth="1.8"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectNode?.('sonic')}
              />
              <line x1="230" y1="365" x2="272" y2="372" stroke="#90caf9" strokeWidth="3" strokeLinecap="round" />
              <line x1="228" y1="385" x2="270" y2="392" stroke="#90caf9" strokeWidth="3" strokeLinecap="round" />
              <line x1="226" y1="405" x2="268" y2="412" stroke="#90caf9" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
          )
        )}
      </div>

      {/* Interactive Quick Hotspot Ribbon (Under the product demo) */}
      <div className="nc-demo-hotspots-ribbon">
        <span className="nc-hotspots-caption">EXPLORE HARDWARE NODES:</span>
        <div className="nc-hotspot-buttons">
          {nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              className={`nc-demo-hotspot-btn ${activeNodeId === node.id ? 'is-active' : ''}`}
              onClick={() => onSelectNode?.(node.id)}
            >
              <span className="nc-hotspot-dot" />
              <span className="nc-hotspot-title">{node.name}</span>
              <span className="nc-hotspot-role">{node.tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* High-Resolution Inspection Modal */}
      {isZoomed && (
        <div
          className="nc-photo-modal-overlay"
          onClick={() => setIsZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label="High-Resolution Specimen Inspection"
        >
          <div className="nc-photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="nc-photo-modal-header">
              <span className="nc-photo-modal-title">
                EC(AK)OU ARTIFACT · AUTHENTIC PHYSICAL SPECIMEN (HIGH RESOLUTION)
              </span>
              <button
                type="button"
                className="nc-photo-modal-close"
                onClick={() => setIsZoomed(false)}
                aria-label="Close high-res inspection"
              >
                ✕ Close
              </button>
            </div>
            <img
              src={viewMode === 'transparent' ? maskTransparent : maskPhoto}
              alt="Ec(ak)ou Mask High-Resolution Specimen"
              className="nc-photo-modal-img"
            />
          </div>
        </div>
      )}
    </div>
  );
}
