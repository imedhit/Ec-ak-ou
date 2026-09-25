# Ec(ak)ou: Decisions & Thought Experiments Dossier
**Project:** Ec(ak)ou (Ghost Speech Mask & Non-Verbal Acoustic Communication System)  
**Classification:** Speculative Artefact, Physical Computing Simulation & Acoustic Cipher Prototype  
**Date:** September 2026  

---

## 1. Executive Summary

**Ec(ak)ou** is a speculative design investigation, interactive prototype, and functional simulation of a non-verbal speech-transmutation system. Developed around the core prompt—*“A language for the world that listens too much”*—the artefact imagines a near-future response to ubiquitous acoustic surveillance, automated speech recognition wiretaps, and visual lip-reading artificial intelligence.

This document compiles the complete conceptual evolution, philosophical thought experiments, visual design decisions, acoustic cipher architectures, interaction mechanics, and engineering choices developed across the lifecycle of the project.

---

## 2. Core Thought Experiments & Worldbuilding

### 2.1 The Surveillance Premise: "The World That Listens Too Much"
* **The Panacoustic Reality:** Contemporary environments are saturated with passive recording devices, beamforming smart speakers, commercial ambient listening nodes, and state-level voice biometrics.
* **The Lip-Reading Threat Vector:** Computer vision models can accurately transcribe speech from silent video feeds at high resolution, rendering traditional whisper-level privacy obsolete even in soundproofed or high-noise public environments.
* **The Thought Experiment:** *If spoken human phonemes can no longer safely enter the open air, and human lips can no longer safely move in line of sight of optical sensors, how can two co-present humans communicate nuance, urgency, identity, and intent?*

### 2.2 The Speculative Artefact: Ghost Speech Mask (Specimen Ec(ak)ou-v1)
* **Concealment of Articulation:** A physical face-worn mask enclosing the mouth and lower mandible. The interior acoustic chamber captures the wearer's whispered vocalizations, preventing phonemic sound leakage and obscuring facial muscle movement.
* **Dual-Channel Transmutation:**
  1. **Acoustic Channel (Piezo Resonator):** Whispered speech is analyzed inside the mask's local DSP core and immediately transmuted into non-phonetic acoustic signals: synthetic sweeps, harmonic chords, frequency-modulated chimes, and microtonal clicks. To an ambient microphone or eavesdropper, these sound like ambient mechanical artifacts, electronic static, or biological bird/insect clicks.
  2. **Optical Channel (OLED Spectrogram Ribbon):** Simultaneously, the transmuted signal is rendered across an exterior ribbon OLED display as a real-time motion spectrogram. A companion standing in visual proximity can "read" the frequency contour even in high-decibel environments or complete silence.
* **Modular Community Cipher Keys (The "Dialect Chips"):** Physical swappable cartridges mounted on the cheekbones of the mask. In lore, each affinity group or geographic collective possesses a unique cipher key that remaps the frequency tables. Without the corresponding key, a third party cannot decode which harmonic contour maps to which conversational meaning.

---

## 3. Visual & Aesthetic Design Decisions

### 3.1 Strict Color Discipline: Electric Blue, Navy & Brilliant White
* **The Decision:** Banished all warm tones (red, orange, yellow, pink, warm green, purple) across the entire interface, procedural canvas renderers, and photographic overlays.
* **Color Hierarchy:**
  * **Electric Cobalt / Cyan (`#00d8ff`, `#1d83ff`):** Represents energized signal activity, laser sweep needles, active transmission beacons, and primary interactive focal points.
  * **Brilliant White (`#ffffff`):** Reserved exclusively for peak formant crests in spectrograms and high-contrast editorial typography.
  * **Deep Obsidian & Void Navy (`#01050e`, `#030814`, `#081024`):** Provides extreme depth, evoking dark acoustic isolation chambers and military-grade instrumentation.
* **Rationale:** A tight monochromatic palette prevents the UI from degrading into generic "cyberpunk neon rainbow" tropes and reinforces the sober, functional authenticity of an experimental research apparatus.

### 3.2 Anti-Dashboard Editorial Language
* **The Problem:** Early iterations felt like a generic SaaS dashboard with rounded cards, metric numbers, and standard layout blocks.
* **The Architectural Shift:**
  * Adopted an **editorial specimen dossier** aesthetic inspired by experimental typography, aerospace avionics manuals, and speculative design catalogs.
  * Prominent asymmetric typographic compositions with oversized titles:  
    `SPEAK HUMAN.` broken by wide negative space and minimal geometric rules.
  * Replaced explanatory bullet points with concise, self-explanatory flow cues:  
    `SPEAK → LISTEN → SIGNAL`.

### 3.3 Rounded Pill Control Discipline
* **The Decision:** All operational state switches (Standby / Live indicator, Start/Stop Listening triggers, Concept / Artefact navigation tabs, and OLED pulse toggles) were unified into an ultra-precise rounded pill geometry (`border-radius: 9999px !important; outline: none !important; appearance: none;`).
* **Rationale:** Contrasts the razor-sharp rectilinear grid lines of the spectrogram frequency axes with smooth, tactile, human-scale touch controls, reinforcing the handheld field-unit metaphor.

### 3.4 Procedural CRT Raster & Phosphor Grain
* The spectrogram viewport features a multi-layer composite rendering pipeline:
  1. Base frequency energy grid (0–44.1 kHz scale).
  2. Dynamic harmonic measure bars and frequency sweeps.
  3. Real-time laser sweep needle with trailing phosphor glow.
  4. 3px CRT horizontal scanline raster (`rgba(0, 0, 0, 0.12)`).
  5. 450-point procedural analog noise particle field to emulate hardware OLED phosphor persistence.

---

## 4. Acoustic Vocabulary & Sound Synthesis Architecture

### 4.1 The Evolution of the Core Four Signals
In the initial build, four primitive signals existed. Iterative testing revealed auditory ambiguities that were resolved through targeted design changes:

| Signal Key | Initial Sound Concept | Problem Encountered | Final Implemented Architecture |
| :--- | :--- | :--- | :--- |
| **`HELLO`** | Vocal swell | Effective, but low drone conflicted with SAFE | Sustained, warm sine swell (205 Hz ramping to 218 Hz) with 410 Hz overtone and exponential attack/decay. Duration: 1.60s. |
| **`DANGER`** | Triple click | Needed sharp transient alert without sounding musical | Three high-pass filtered (1700 Hz) white noise burst pulses (70ms duration each, spaced by 140ms). Aggressive and unignorable. |
| **`SAFE`** | Low holding tone | **Sounded too similar to `HELLO`**; caused listener confusion in tests | **Ascending crystalline two-note chime:** 660 Hz sine (0.42s) followed by 990 Hz harmonic triangle (0.62s). Distinct, uplifting, crystalline resolution. |
| **`LEAVE`** | Falling whistle | Needed unambiguous directional evacuation vector | Smooth descending exponential frequency sweep from 980 Hz down to 280 Hz over 1.30s. |

### 4.2 Expansion to the 32-Token Lexicon & Matrix Architecture
To elevate the prototype from a simple 4-state toy into a viable speculative communication protocol, the vocabulary was expanded to 32 foundational linguistic primitives:

1. **Interrogatives:** `why` (rising harmonic glissando), `how` (undulating wave vibrato), `what` (dual radar ping), `when` (metronomic chrono cadence), `where` (sonar spatial echo), `who` (whistle parabola).
2. **Relational & State Identifiers:** `are` (harmonic drone triad), `you` (converging directional focal beam), `doing` (kinetic ribbon weave), `going` (Doppler sweep), `here` (grounded Pythagorean beacon), `can` (ascending potential chime), `hear` (high-register sonar return), `me` (intimate mid sine swell).
3. **Core Self & Existence:** `i` (solitary 528 Hz transformation tone), `am` (deep foundational C-G fifth dyad chord), `now` (sharp percussive transient impulse), `come` (inward welcoming glissando), `is` (holding bridge drone), `there` (dual dispersed acoustic reflections).
4. **Pragmatics & Emotion:** `please` (microtonal 3-part shimmer), `help` (urgent minor-third dual alert beacon), `good` (warm major third C-E-G chord), `not` (gated lowpass plummet), `do` (grounded 150 Hz impulse beat), `today` (three-tier diurnal arch chord).

### 4.3 Conversational Phrases & Song Sequences
Individual words can be chained into full grammatical sequences (e.g., *"Hello, how are you?"*, *"Danger, leave now!"*, *"Can you hear me?"*, *"I am safe here"*).
* **The Synchronization Decision:** The procedural spectrogram canvas divides the screen width into discrete proportional measure bars matching each word's duration. The audio player steps through each word's oscillator graph sequentially, matching the sweep needle's movement.
* **The "Flatline on Completion" Decision:** Once the final word completes, both audio synthesis and canvas animation halt into a still, frozen spectrogram flatline. The system deliberately does not loop automatically, preventing audio fatigue and speaker re-triggering.

---

## 5. Web Audio Engineering & Signal Export

### 5.1 Pure Client-Side Audio Synthesis
* **No Pre-Recorded Audio Samples:** Every sound is computed at runtime via the Web Audio API using `OscillatorNode`, `BiquadFilterNode`, `GainNode`, and custom mathematical envelopes.
* **Zero Latency:** Immediate generation upon speech recognition match.

### 5.2 Microphone Feedback Loop Prevention
* **The Challenge:** When the browser recognizes a word (e.g. "Danger") and plays the corresponding audio tone through the laptop speakers, the laptop microphone picks up the speaker output and attempts to re-transcribe it, creating an infinite feedback loop.
* **The Engineering Solution:**
  1. `isPlayingRef` state lock: Web Speech Recognition results are completely ignored while audio is active.
  2. 2.2-second debounce timer (`lastSpeechTriggerRef`) enforcing a quiet listening refractory period after playback.
  3. Automatic microphone stream cleanup and re-initialization guards.

### 5.3 Offline WAV Audio Export Engine
* Added native offline audio rendering via `OfflineAudioContext` (44.1 kHz, 16-bit PCM RIFF WAV format).
* Written directly to a typed `ArrayBuffer` and `DataView` with exact RIFF headers, channel counts, byte rates, and block alignments.
* Exports audible, mathematically identical `.wav` files named according to strict protocol:
  * `Ec-ak-ou_hello.wav`
  * `Ec-ak-ou_danger.wav`
  * `Ec-ak-ou_safe.wav`
  * `Ec-ak-ou_leave.wav`
  * `Ec-ak-ou_[phrase_id].wav`
* Accompanied by manual "Audition & Export" controls in the vocabulary drawer so researchers can inspect and harvest all 32 audio files without speaking into the microphone.

---

## 6. Standalone Repository & Distribution Architecture

### 6.1 The "Clean Repository" Decision
When requested to prepare a standalone, functional folder for shared repositories (such as GitHub or GitLab):
* **Isolated Project Root (`/simulation`):**
  * Created an independent Vite + React + TypeScript package free of monorepo dependencies or private workspace links.
  * Pre-configured clean `.gitignore` to prevent committing `node_modules/`, `dist/`, or operating system artifacts.
  * Verified build correctness with zero TypeScript compilation or linting errors.
* **Compressed Archive (`simulation-repository.zip`):**
  * Automated generation of a portable ZIP archive containing the exact repository tree for seamless single-click sharing.

---

## 7. Hardware Specimen Taxonomy & Hotspot Map

The physical mask specimen is documented via three coordinated visualization modes in the interactive visualizer:
1. **Specimen Photograph:** Authentic physical prototype photography showing textured matte cobalt polymers, optical disc lenses, and cable conduits.
2. **Isolated Cutout:** High-contrast floating asset with caustic radial blue backlighting.
3. **Vector CAD Blueprint:** Interactive vector schematic with multi-angle projection (Front Elevation vs. 3/4 Dynamic Perspective).

### Core Hardware Subsystems
* **Acoustic Bridge (Nose Aperture):** Internal pressure equalization conduit preventing sound resonance from leaking through nasal exhalation.
* **OLED Spectrogram (Visual Transmitter):** Flexible curved organic LED ribbon displaying high-refresh 60 FPS blue/white frequency formants.
* **Dialect Ciphers (Community Keys #01 & #02):** Dual cheek-mounted cryptographic hardware chips enabling affinity-group-specific frequency hopping.
* **Harmonic Nozzle (Piezo Resonator):** Wide-band directional transducer translating whisper audio into focused directional ultrasound and audible acoustic chirps.
* **Conduit Loop (Near-Field Sync Cable):** Braided shielded cable providing low-voltage telemetry between the mask's processing collar and sensory nodes.

---

## 8. Summary Table of Project Milestones & Choices

| Phase | Core Objective | Key Decision / Outcome |
| :--- | :--- | :--- |
| **Phase 1** | Conceptual Foundation | Established speculative worldbuilding: mask concealing lip articulation, transmuting voice to non-verbal acoustic signals. |
| **Phase 2** | Sound Vocabulary Definition | Built initial 4 signals; resolved `SAFE` acoustic conflict by designing ascending crystalline chime. |
| **Phase 3** | Visual Identity Overhaul | Transformed generic SaaS dashboard into an editorial speculative artefact interface (`SPEAK HUMAN.`, electric blue + white palette, CRT scanlines). |
| **Phase 4** | Offline WAV Export | Engineered browser-native 16-bit PCM WAV encoder for all generated audio signals with zero dependencies. |
| **Phase 5** | 32-Token Lexicon Expansion | Expanded vocabulary to full 32-token matrix and complex multi-word conversational sentences with synchronized measure bars. |
| **Phase 6** | UI Refinement & Control System | Implemented rounded pill geometry across all interactive toggles, buttons, and navigation elements. |
| **Phase 7** | Standalone Portability | Bundled complete standalone runnable project into `/simulation` and `simulation-repository.zip` for shared Git repositories. |

---

*End of Dossier.*
