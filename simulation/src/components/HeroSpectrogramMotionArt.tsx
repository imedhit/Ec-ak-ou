import { useEffect, useRef, useState } from 'react';
import { Activity, Radio, Sparkles } from 'lucide-react';

interface WaveNode {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  maxRadius: number;
  speed: number;
}

export function HeroSpectrogramMotionArt() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [activeSignalLabel, setActiveSignalLabel] = useState<string>('GLISSANDO HARMONICS');
  const [frequencyReadout, setFrequencyReadout] = useState<number>(432);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = container.clientWidth || 460;
    let height = container.clientHeight || 240;
    let time = 0;
    let scanX = 0;

    // Pulse nodes for "what" and "safe" signals
    const pingRings: WaveNode[] = [
      { x: 0.28, y: 0.38, radius: 0, opacity: 1, maxRadius: 36, speed: 0.4 },
      { x: 0.65, y: 0.52, radius: 10, opacity: 0.8, maxRadius: 44, speed: 0.35 },
      { x: 0.84, y: 0.32, radius: 20, opacity: 0.5, maxRadius: 32, speed: 0.5 },
    ];

    const handleResize = () => {
      if (!container || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mousePosRef.current.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Dynamic signal label cycling
    const signalLabels = [
      'GLISSANDO HARMONICS [HELLO]',
      'UNDULATING MODULATION [HOW]',
      'RESONANT BEACON [SAFE]',
      'ACOUSTIC RADAR PING [WHAT]',
      'DOPPLER FREQUENCY GLIDE [LEAVE]',
      'KINETIC CARRIER RIBBON [DOING]',
    ];
    let labelIndex = 0;
    const labelInterval = setInterval(() => {
      labelIndex = (labelIndex + 1) % signalLabels.length;
      setActiveSignalLabel(signalLabels[labelIndex]);
    }, 3800);

    const render = () => {
      time += 0.024;
      scanX = (scanX + 1.6) % (width || 460);

      // Jitter frequency slightly for authentic telemetry
      if (Math.random() < 0.15) {
        setFrequencyReadout(Math.floor(420 + Math.sin(time * 2) * 80 + Math.random() * 15));
      }

      ctx.clearRect(0, 0, width, height);

      // 01. Background atmospheric glow with soft edge feathering
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        20,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.68
      );
      bgGrad.addColorStop(0, 'rgba(0, 216, 255, 0.09)');
      bgGrad.addColorStop(0.5, 'rgba(2, 12, 34, 0.35)');
      bgGrad.addColorStop(1, 'rgba(2, 8, 20, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 02. Architectural Frequency Grid Lines
      ctx.strokeStyle = 'rgba(0, 216, 255, 0.08)';
      ctx.lineWidth = 1;
      const horizontalBands = [0.2, 0.4, 0.6, 0.8];
      horizontalBands.forEach((ratio) => {
        const y = height * ratio;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      });

      const verticalBands = [0.15, 0.35, 0.55, 0.75, 0.95];
      verticalBands.forEach((ratio) => {
        const x = width * ratio;
        ctx.beginPath();
        ctx.setLineDash([3, 5]);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 03. FFT Equalizer spectrum bars at bottom
      const barCount = 38;
      const barWidth = width / barCount;
      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth;
        const norm = i / barCount;
        // Harmonic bell curve centered around formants
        const formant1 = Math.exp(-Math.pow((norm - 0.28) / 0.12, 2));
        const formant2 = Math.exp(-Math.pow((norm - 0.68) / 0.15, 2));
        const waveOsc = Math.sin(time * 3 + i * 0.35) * 0.3 + 0.7;
        const barH = (formant1 * 48 + formant2 * 36 + 8) * waveOsc;

        const barGrad = ctx.createLinearGradient(x, height, x, height - barH);
        barGrad.addColorStop(0, 'rgba(0, 216, 255, 0.1)');
        barGrad.addColorStop(1, 'rgba(0, 240, 255, 0.75)');
        ctx.fillStyle = barGrad;
        ctx.fillRect(x + 1.5, height - barH - 6, barWidth - 3, barH);
      }

      // 04. Multi-Track Waveform Spectrograms (from Ec(ak)ou signals)
      const mouse = mousePosRef.current;

      // --- Waveform A: Harmonic Glissando Arc (hello / why) ---
      ctx.beginPath();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.6;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.85)';
      ctx.shadowBlur = 14;

      for (let x = 0; x <= width; x += 4) {
        const nx = x / width;
        // S-curve glissando with harmonic oscillation
        const baseGliss = height * (0.62 - 0.32 * Math.sin(nx * Math.PI + time * 0.4));
        const overtone = Math.sin(nx * 14 - time * 4) * 10 * Math.sin(nx * Math.PI);
        const mouseLift = mouse.active ? Math.exp(-Math.pow((x - mouse.x) / 60, 2)) * -28 : 0;
        const y = baseGliss + overtone + mouseLift;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // --- Waveform B: Triple Undulating Modulation Ribbon (how signal) ---
      for (let waveIdx = 0; waveIdx < 3; waveIdx++) {
        ctx.beginPath();
        const alpha = waveIdx === 0 ? 0.8 : 0.4;
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = waveIdx === 0 ? 2 : 1.2;
        ctx.shadowBlur = waveIdx === 0 ? 10 : 0;

        const phaseOffset = waveIdx * 1.8;
        const baseY = height * (0.36 + waveIdx * 0.14);

        for (let x = 0; x <= width; x += 4) {
          const nx = x / width;
          const sineMod = Math.sin(nx * 10 + time * 3.2 + phaseOffset) * (16 - waveIdx * 3);
          const y = baseY + sineMod;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // --- Waveform C: Cyan High-Frequency Resonance Glide (NO pink line) ---
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
      ctx.shadowBlur = 8;
      for (let x = 0; x <= width; x += 4) {
        const nx = x / width;
        const glideY = height * (0.24 + 0.42 * Math.pow(nx, 1.6)) + Math.sin(nx * 20 + time * 4.5) * 5;
        if (x === 0) ctx.moveTo(x, glideY);
        else ctx.lineTo(x, glideY);
      }
      ctx.stroke();

      // --- Feature D: Concentric Sonar Radar Rings (what / safe signals) ---
      ctx.shadowBlur = 0;
      pingRings.forEach((ring) => {
        ring.radius += ring.speed;
        if (ring.radius > ring.maxRadius) {
          ring.radius = 0;
        }
        const currentOpacity = (1 - ring.radius / ring.maxRadius) * 0.85;
        const px = ring.x * width;
        const py = ring.y * height;

        // Core beacon dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();

        // Outer expanding ripple ring
        ctx.strokeStyle = `rgba(0, 240, 255, ${currentOpacity})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, ring.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Dual bracket target markers (safe signal aesthetic)
        ctx.strokeStyle = `rgba(0, 216, 255, ${currentOpacity * 0.6})`;
        ctx.strokeRect(px - 9, py - 9, 18, 18);
      });

      // 05. Sweeping Phosphor Laser Scan Line
      const scanGrad = ctx.createLinearGradient(scanX - 30, 0, scanX, 0);
      scanGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      scanGrad.addColorStop(0.85, 'rgba(0, 240, 255, 0.12)');
      scanGrad.addColorStop(1, 'rgba(0, 240, 255, 0.95)');

      ctx.fillStyle = scanGrad;
      ctx.fillRect(scanX - 30, 0, 30, height);

      // Bright leading needle line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(labelInterval);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="nc-hero-motion-art-card" role="img" aria-label="Acoustic spectrogram waveform motion art visualizer">
      {/* Top HUD bar with telemetry indicators */}
      <div className="nc-motion-art-hud-top">
        <div className="nc-motion-art-telemetry">
          <Radio size={12} className="nc-motion-pulse-icon" aria-hidden="true" />
          <span className="nc-motion-hud-label">SPECTROGRAM MATRIX</span>
          <span className="nc-motion-hud-dot" aria-hidden="true" />
          <span className="nc-motion-hud-freq">{frequencyReadout} Hz</span>
        </div>
        <div className="nc-motion-art-status">
          <Activity size={12} aria-hidden="true" />
          <span>REAL-TIME CIPHER</span>
        </div>
      </div>

      {/* Main Canvas rendering authentic waveform waveforms */}
      <canvas ref={canvasRef} className="nc-motion-art-canvas" />

      {/* Bottom HUD bar with active signal descriptor */}
      <div className="nc-motion-art-hud-bottom">
        <div className="nc-motion-active-signal">
          <Sparkles size={11} className="nc-motion-sparkle" aria-hidden="true" />
          <span className="nc-motion-signal-title">{activeSignalLabel}</span>
        </div>
        <div className="nc-motion-bands-tag">
          <span>0.1 - 4.8 kHz · OLED MASK DISPLAY TRACE</span>
        </div>
      </div>
    </div>
  );
}
