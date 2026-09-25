# Ec(ak)ou — Acoustic Communication Simulation

A self-contained browser simulation and research prototype that translates spoken natural language into dynamic motion spectrogram video displays, harmonic acoustic frequency bursts, and interactive receptor hardware visuals.

---

## ⚡ Quick Start

### 1. Requirements
- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher (or pnpm / yarn)
- A modern browser with Web Audio API support (Chrome, Edge, Safari, Firefox). Chrome/Edge are recommended for native Speech Recognition API support.

### 2. Installation
Open a terminal in this folder and install dependencies:
```bash
npm install
```

### 3. Run Development Server
Start the local development server:
```bash
npm run dev
```
Open your browser at the URL shown (usually `http://localhost:3000` or `http://localhost:5173`).

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 📂 Package Contents & Architecture

```
simulation/
├── index.html                 # Entry point with meta tags and font loading
├── package.json               # Standalone npm project dependencies and scripts
├── tsconfig.json              # TypeScript compiler configuration
├── vite.config.ts             # Vite bundler configuration with Tailwind CSS v4
├── public/                    # Static assets
│   ├── favicon.svg            # Signal icon
│   └── spectrograms/          # Pre-rendered spectrogram asset images
└── src/
    ├── main.tsx               # Application bootstrap
    ├── App.tsx                # Main simulation console, audio context, speech engine
    ├── index.css              # Custom styling, dark cybernetic aesthetic, animations
    ├── components/
    │   ├── SpectrogramVideo.tsx           # Procedural Blue & White motion spectrogram player
    │   ├── MaskArtifactVisual.tsx         # Interactive Specimen mask & OLED wave display
    │   ├── ConceptPage.tsx                # Design & concept documentation dossier
    │   ├── HeroSpectrogramMotionArt.tsx   # Procedural canvas motion artwork
    │   ├── FullVocabDrawer.tsx            # Complete 32-word vocabulary matrix
    │   ├── SignalGraph.tsx                # Real-time frequency waveform oscilloscope
    │   └── ui/                            # Reusable UI primitives (dialogs, tooltips, etc.)
    ├── types/
    │   └── signals.ts         # Acoustic frequency ciphers & vocabulary definitions
    └── utils/
        └── audio.ts           # Web Audio API synthesizers, export to WAV & JSON
```

---

## 🌟 Key Features

1. **Pure Blue & White Spectrogram Waves**:
   - High-fidelity acoustic spectrogram motion video rendering.
   - Frequency sweeps and resonant formants rendered exclusively in shades of electric blue, cyan, deep navy, and brilliant white (zero warm or distracting colors).

2. **Rounded Pill Navigation & Controls**:
   - Modern rounded pill aesthetic for all status switches (Standby / Live indicator, Start/Stop Listening, Concept navigation tabs).

3. **Speech-to-Acoustic Translation**:
   - Listens via microphone with Web Speech Recognition.
   - Built-in simulation and manual word picker for browsers without SpeechRecognition.
   - Synthesizes multi-tone FM acoustic chirps with harmonics in real-time using the Web Audio API.

4. **Interactive Hardware Specimen**:
   - 3D/OLED mask visualizer showcasing real-time transmitting states and acoustic chamber conduits.

5. **Acoustic Export**:
   - Export generated signals to uncompressed `.wav` audio files and structured metadata `.json`.

---

## 🔒 Permissions Notice
- **Microphone**: When clicking **Start Listening**, grant microphone permission so the browser can capture audio and transcribe voice cues into acoustic signals.
