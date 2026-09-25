import { useEffect, useRef } from 'react';
import {
  SignalKey,
  ConversationalSentence,
  ActiveTarget,
  COMMON_SENTENCES,
  SIGNALS,
  signalDuration,
  SENTENCE_GAP,
} from '../types/signals';

/**
 * Transforms any acoustic spectrogram image into pure shades of blue and white.
 * Strips all yellow, orange, red, pink, and warm frequency maps completely.
 */
function createBlueWhiteSpectrogramCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const offCanvas = document.createElement('canvas');
  const w = img.naturalWidth || 600;
  const h = img.naturalHeight || 300;
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext('2d');
  if (!offCtx) return offCanvas;

  offCtx.drawImage(img, 0, 0);
  try {
    const imgData = offCtx.getImageData(0, 0, w, h);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const a = d[i + 3];
      if (a < 8) {
        d[i + 3] = 0;
        continue;
      }

      // Perceived energy/luminance
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      if (lum < 0.08) {
        // Deep background dark navy floor
        d[i] = 1;
        d[i + 1] = 8;
        d[i + 2] = 26;
        d[i + 3] = Math.floor(a * 0.18);
      } else if (lum < 0.42) {
        // Lower frequencies: deep royal and cobalt blue
        const t = (lum - 0.08) / 0.34;
        d[i] = Math.floor(0 + t * 24);
        d[i + 1] = Math.floor(35 + t * 90);
        d[i + 2] = Math.floor(130 + t * 125);
        d[i + 3] = Math.floor(a * (0.45 + t * 0.45));
      } else if (lum < 0.78) {
        // Resonant harmonic bands: bright cyan to light ice blue
        const t = (lum - 0.42) / 0.36;
        d[i] = Math.floor(24 + t * 160);
        d[i + 1] = Math.floor(125 + t * 110);
        d[i + 2] = 255;
        d[i + 3] = Math.floor(a * (0.85 + t * 0.15));
      } else {
        // Peak formant crests: pure brilliant white
        const t = (lum - 0.78) / 0.22;
        d[i] = Math.floor(184 + t * 71); // -> 255
        d[i + 1] = Math.floor(235 + t * 20); // -> 255
        d[i + 2] = 255;
        d[i + 3] = a;
      }
    }
    offCtx.putImageData(imgData, 0, 0);
  } catch {
    // If CORS prevents reading pixels, offCanvas still provides clean fallback
  }
  return offCanvas;
}

/**
 * Procedural spectrogram renderer for any of the 32 vocabulary words
 * drawn inside an arbitrary horizontal measure slice [barX, barX + barW].
 * Renders EXCLUSIVELY in shades of blue and pure white.
 */
export function drawWordSpectrogram(
  ctx: CanvasRenderingContext2D,
  key: SignalKey,
  barX: number,
  barW: number,
  plotY: number,
  plotH: number,
  currentSweepX: number,
  currentTime: number,
  energyNorm: number,
  isDone: boolean,
  img?: HTMLImageElement | HTMLCanvasElement,
) {
  const midY = plotY + plotH / 2;
  const clampedSweepX = isDone ? barX + barW : Math.min(barX + barW, Math.max(barX, currentSweepX));

  // If a pre-rendered static spectrogram image exists (e.g. for initial words)
  // Rendered exclusively in shades of blue and white (zero warm or other colors)
  if (img) {
    const isReady = img instanceof HTMLCanvasElement || (img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0);
    if (isReady) {
      if (isDone) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.drawImage(img, barX, plotY, barW, plotH);
        ctx.restore();
      } else {
        // Unrevealed silhouette ahead of sweep
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.drawImage(img, barX, plotY, barW, plotH);
        ctx.restore();

        // Active revealed segment behind sweep
        if (clampedSweepX > barX) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(barX, plotY, clampedSweepX - barX, plotH);
          ctx.clip();
          ctx.globalAlpha = 0.95 + energyNorm * 0.05;
          ctx.drawImage(img, barX, plotY, barW, plotH);
          ctx.restore();
        }
      }
    }
  }

  // Active procedural wave graphics for all 32 words
  ctx.save();

  if (key === 'danger') {
    // 3 distinct alert columns with dense horizontal raster bands
    const bursts = [0.2, 0.5, 0.8];
    bursts.forEach((bFrac) => {
      const colX = barX + bFrac * barW;
      if (isDone || clampedSweepX >= colX - 10) {
        for (let k = 0; k < 14; k += 1) {
          const rY = plotY + (k / 14) * (plotH * 0.7);
          ctx.fillStyle = k % 2 === 0 ? 'rgba(0, 216, 255, 0.85)' : 'rgba(29, 131, 255, 0.6)';
          ctx.fillRect(colX - 12, rY, 24, 2);
        }
      }
    });

  } else if (key === 'hello') {
    // Resonant carrier laser + overtone beam + central vocal flare
    const carrierY = plotY + plotH * 0.65;
    const overtoneY = plotY + plotH * 0.44;
    ctx.shadowColor = '#00d8ff';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#00d8ff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let x = barX; x <= clampedSweepX; x += 4) {
      const sine = Math.sin(x * 0.08 + currentTime * 18) * (2.4 * energyNorm);
      if (x === barX) ctx.moveTo(x, carrierY + sine);
      else ctx.lineTo(x, carrierY + sine);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 216, 255, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = barX; x <= clampedSweepX; x += 4) {
      if (x === barX) ctx.moveTo(x, overtoneY);
      else ctx.lineTo(x, overtoneY);
    }
    ctx.stroke();

  } else if (key === 'safe') {
    // Dual ascending crystalline vector flares
    const chime1X = barX + 0.2 * barW;
    const chime2X = barX + 0.62 * barW;
    if (clampedSweepX >= chime1X) {
      const c1Y = plotY + plotH * 0.68;
      ctx.fillStyle = '#00d8ff';
      ctx.fillRect(chime1X - 8, c1Y - 2, 28, 4);
      ctx.strokeStyle = 'rgba(0, 216, 255, 0.45)';
      ctx.strokeRect(chime1X - 14, c1Y - 8, 40, 16);
    }
    if (clampedSweepX >= chime2X) {
      const c2Y = plotY + plotH * 0.38;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(chime2X - 10, c2Y - 3, 34, 5);
      ctx.strokeStyle = '#00d8ff';
      ctx.strokeRect(chime2X - 16, c2Y - 10, 46, 20);
    }

  } else if (key === 'leave') {
    // Descending frequency glissando arc
    ctx.shadowColor = '#00d8ff';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#00d8ff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = barX; x <= clampedSweepX; x += 3) {
      const normX = (x - barX) / (barW || 1);
      const arcY = plotY + plotH * (0.28 + 0.6 * Math.pow(normX, 1.4));
      if (x === barX) ctx.moveTo(x, arcY);
      else ctx.lineTo(x, arcY);
    }
    ctx.stroke();

  } else if (key === 'why') {
    // Rising harmonic glissando arc
    ctx.shadowColor = '#00d8ff';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#00d8ff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = barX; x <= clampedSweepX; x += 3) {
      const normX = (x - barX) / (barW || 1);
      const arcY = plotY + plotH * (0.82 - 0.6 * Math.pow(normX, 0.9));
      if (x === barX) ctx.moveTo(x, arcY);
      else ctx.lineTo(x, arcY);
    }
    ctx.stroke();

  } else if (key === 'how') {
    // Triple undulating wave modulation
    for (let wave = 0; wave < 3; wave += 1) {
      const baseWaveY = plotY + plotH * (0.42 + wave * 0.15);
      ctx.strokeStyle = wave === 0 ? '#00d8ff' : 'rgba(0, 216, 255, 0.6)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let x = barX; x <= clampedSweepX; x += 3) {
        const sine = Math.sin((x - barX) * 0.08 + wave * 1.6 + currentTime * 12) * 9;
        if (x === barX) ctx.moveTo(x, baseWaveY + sine);
        else ctx.lineTo(x, baseWaveY + sine);
      }
      ctx.stroke();
    }

  } else if (key === 'what') {
    // Twin radar ping pulses with concentric elliptical radar rings
    [0.26, 0.72].forEach((pFrac) => {
      const pingX = barX + pFrac * barW;
      if (clampedSweepX >= pingX) {
        const pingY = plotY + plotH * 0.48;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pingX, pingY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 216, 255, 0.7)';
        ctx.lineWidth = 1.5;
        for (let r = 8; r <= 24; r += 8) {
          ctx.beginPath();
          ctx.ellipse(pingX, pingY, r * 1.4, r * 0.7, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    });

  } else if (key === 'when') {
    // Four-step chrono metronomic ticks
    for (let step = 0; step < 4; step += 1) {
      const tickX = barX + (0.16 + step * 0.24) * barW;
      if (clampedSweepX >= tickX) {
        const tickY = plotY + plotH * (0.75 - step * 0.14);
        ctx.fillStyle = '#00d8ff';
        ctx.fillRect(tickX - 2, tickY - 14, 4, 28);
        ctx.strokeStyle = 'rgba(0, 216, 255, 0.4)';
        ctx.strokeRect(tickX - 6, tickY - 18, 12, 36);
      }
    }

  } else if (key === 'are') {
    // Harmonic drone triad (three horizontal resonant beams)
    [0.35, 0.52, 0.72].forEach((hFrac) => {
      const beamY = plotY + plotH * hFrac;
      ctx.strokeStyle = '#00d8ff';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(barX, beamY);
      ctx.lineTo(clampedSweepX, beamY);
      ctx.stroke();
    });

  } else if (key === 'you') {
    // Directional focal beam: converging acoustic focal surge
    const focusX = barX + 0.85 * barW;
    const focusY = plotY + plotH * 0.48;
    ctx.strokeStyle = 'rgba(0, 216, 255, 0.7)';
    ctx.lineWidth = 1.4;
    for (let i = -3; i <= 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(barX, midY + i * 16);
      ctx.lineTo(Math.min(clampedSweepX, focusX), focusY + i * 2);
      ctx.stroke();
    }
    if (clampedSweepX >= focusX) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(focusX, focusY, 5, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (key === 'doing') {
    // Kinetic ribbon weave: dual braided Lissajous ribbons
    for (let b = 0; b < 2; b += 1) {
      ctx.strokeStyle = b === 0 ? '#00d8ff' : '#1d83ff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let x = barX; x <= clampedSweepX; x += 3) {
        const phase = b * Math.PI + (x - barX) * 0.09 + currentTime * 10;
        const ribY = midY + Math.sin(phase) * (plotH * 0.3);
        if (x === barX) ctx.moveTo(x, ribY);
        else ctx.lineTo(x, ribY);
      }
      ctx.stroke();
    }

  } else if (key === 'where') {
    // Sonar spatial echo: expanding beacon ripples radiating rightward
    const sourceX = barX + 0.18 * barW;
    const sourceY = midY;
    if (clampedSweepX >= sourceX) {
      ctx.fillStyle = '#00d8ff';
      ctx.beginPath();
      ctx.arc(sourceX, sourceY, 4, 0, Math.PI * 2);
      ctx.fill();

      for (let ring = 1; ring <= 4; ring += 1) {
        const rRad = ring * 16;
        if (clampedSweepX >= sourceX + rRad * 0.5) {
          ctx.strokeStyle = `rgba(0, 216, 255, ${0.9 - ring * 0.18})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sourceX, sourceY, rRad, -Math.PI * 0.4, Math.PI * 0.4);
          ctx.stroke();
        }
      }
    }

  } else if (key === 'who') {
    // Whistle parabola: ascending & descending bell arch
    ctx.strokeStyle = '#00d8ff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = barX; x <= clampedSweepX; x += 3) {
      const normX = (x - barX) / (barW || 1);
      const bellY = plotY + plotH * (0.8 - 0.55 * Math.sin(normX * Math.PI));
      if (x === barX) ctx.moveTo(x, bellY);
      else ctx.lineTo(x, bellY);
    }
    ctx.stroke();

  } else if (key === 'yes') {
    // Affirmative chime: bright ascending crystalline chirp
    const chime1X = barX + 0.22 * barW;
    const chime2X = barX + 0.65 * barW;
    if (clampedSweepX >= chime1X) {
      ctx.fillStyle = '#00d8ff';
      ctx.fillRect(chime1X - 6, plotY + plotH * 0.6, 22, 4);
    }
    if (clampedSweepX >= chime2X) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(chime2X - 8, plotY + plotH * 0.35, 28, 5);
      ctx.strokeStyle = '#00d8ff';
      ctx.beginPath();
      ctx.moveTo(chime2X + 6, plotY + plotH * 0.35 - 10);
      ctx.lineTo(chime2X + 6, plotY + plotH * 0.35 + 15);
      ctx.moveTo(chime2X - 6, plotY + plotH * 0.35 + 2);
      ctx.lineTo(chime2X + 18, plotY + plotH * 0.35 + 2);
      ctx.stroke();
    }

  } else if (key === 'no') {
    // Dual low-gate drop: twin authoritative low-frequency blocks
    [0.22, 0.65].forEach((nFrac) => {
      const dropX = barX + nFrac * barW;
      if (clampedSweepX >= dropX) {
        ctx.fillStyle = 'rgba(0, 216, 255, 0.85)';
        ctx.fillRect(dropX - 10, plotY + plotH * 0.78, 26, 12);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(dropX - 12, plotY + plotH * 0.76, 30, 16);
      }
    });

  } else if (key === 'going') {
    // Doppler kinetic sweep: velocity vector
    ctx.strokeStyle = '#00d8ff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = barX; x <= clampedSweepX; x += 3) {
      const normX = (x - barX) / (barW || 1);
      const vY = plotY + plotH * (0.45 + 0.35 * Math.sin((normX - 0.25) * Math.PI * 1.5));
      if (x === barX) ctx.moveTo(x, vY);
      else ctx.lineTo(x, vY);
    }
    ctx.stroke();

  } else if (key === 'here') {
    // Grounded beacon tone: steady diamond anchor
    const beaconX = barX + 0.5 * barW;
    const beaconY = plotY + plotH * 0.62;
    ctx.strokeStyle = 'rgba(0, 216, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(barX, beaconY);
    ctx.lineTo(clampedSweepX, beaconY);
    ctx.stroke();

    if (clampedSweepX >= beaconX) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(beaconX, beaconY - 10);
      ctx.lineTo(beaconX + 8, beaconY);
      ctx.lineTo(beaconX, beaconY + 10);
      ctx.lineTo(beaconX - 8, beaconY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#00d8ff';
      ctx.stroke();
    }

  } else if (key === 'can') {
    // Rising potential chime: two ascending energetic stair-steps
    [
      { frac: 0.25, yFrac: 0.62 },
      { frac: 0.68, yFrac: 0.38 },
    ].forEach(({ frac, yFrac }) => {
      const stepX = barX + frac * barW;
      if (clampedSweepX >= stepX) {
        const sY = plotY + plotH * yFrac;
        ctx.fillStyle = '#00d8ff';
        ctx.fillRect(stepX - 8, sY - 3, 26, 6);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(stepX - 10, sY - 5, 30, 10);
      }
    });

  } else if (key === 'hear') {
    // Auditory sonar ping: parabolic dish receiving incoming focal beam vectors
    const dishX = barX + 0.65 * barW;
    const dishY = plotY + plotH * 0.42;
    if (clampedSweepX >= dishX) {
      ctx.strokeStyle = '#00d8ff';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(dishX, dishY, 20, Math.PI * 0.6, Math.PI * 1.4);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dishX - 10, dishY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (key === 'me') {
    // Warm vocal-mid swell: intimate grounded low-mid sine swell
    const bubbleX = barX + 0.5 * barW;
    const bubbleY = plotY + plotH * 0.72;
    if (clampedSweepX >= bubbleX) {
      ctx.fillStyle = 'rgba(0, 216, 255, 0.2)';
      ctx.beginPath();
      ctx.ellipse(bubbleX, bubbleY, 26, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00d8ff';
      ctx.lineWidth = 2.0;
      ctx.stroke();
    }

  } else if (key === 'i') {
    // Pure fundamental tone: solitary crystalline pillar beacon
    const pillarX = barX + 0.5 * barW;
    if (clampedSweepX >= pillarX) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pillarX, plotY + 12);
      ctx.lineTo(pillarX, plotY + plotH - 12);
      ctx.stroke();

      ctx.fillStyle = '#00d8ff';
      ctx.beginPath();
      ctx.arc(pillarX, midY, 6, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (key === 'am') {
    // Foundational fifth chord: dual parallel harmonic beams
    [0.55, 0.75].forEach((hFrac) => {
      const beamY = plotY + plotH * hFrac;
      ctx.strokeStyle = '#00d8ff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(barX, beamY);
      ctx.lineTo(clampedSweepX, beamY);
      ctx.stroke();
    });

  } else if (key === 'now') {
    // Percussive transient impulse: immediate sharp attack
    const spikeX = barX + 0.3 * barW;
    if (clampedSweepX >= spikeX) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(spikeX, plotY + 8);
      ctx.lineTo(spikeX, plotY + plotH * 0.85);
      ctx.stroke();

      for (let k = 0; k < 6; k += 1) {
        ctx.fillStyle = '#00d8ff';
        ctx.fillRect(spikeX - 8, plotY + 16 + k * 14, 16, 2);
      }
    }

  } else if (key === 'come') {
    // Inward beckoning glissando
    ctx.strokeStyle = '#00d8ff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let x = barX; x <= clampedSweepX; x += 3) {
      const normX = (x - barX) / (barW || 1);
      const cY = plotY + plotH * (0.75 - 0.45 * Math.sin(normX * Math.PI * 0.5));
      if (x === barX) ctx.moveTo(x, cY);
      else ctx.lineTo(x, cY);
    }
    ctx.stroke();

  } else if (key === 'is') {
    // Holding bridge drone: steady single laser beam with vibrato
    const bridgeY = plotY + plotH * 0.58;
    ctx.strokeStyle = '#00d8ff';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    for (let x = barX; x <= clampedSweepX; x += 3) {
      const vib = Math.sin(x * 0.12 + currentTime * 16) * 2;
      if (x === barX) ctx.moveTo(x, bridgeY + vib);
      else ctx.lineTo(x, bridgeY + vib);
    }
    ctx.stroke();

  } else if (key === 'there') {
    // Spatial distant echo: two dispersed acoustic reflections
    [
      { frac: 0.32, yFrac: 0.48 },
      { frac: 0.72, yFrac: 0.38 },
    ].forEach(({ frac, yFrac }) => {
      const echoX = barX + frac * barW;
      if (clampedSweepX >= echoX) {
        const eY = plotY + plotH * yFrac;
        ctx.strokeStyle = 'rgba(0, 216, 255, 0.75)';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(echoX - 8, eY - 8, 16, 16);
      }
    });

  } else if (key === 'please') {
    // Microtonal polite shimmer: three delicate ascending tiers
    [0.2, 0.5, 0.8].forEach((tFrac, idx) => {
      const tierX = barX + tFrac * barW;
      if (clampedSweepX >= tierX) {
        const tY = plotY + plotH * (0.7 - idx * 0.16);
        ctx.fillStyle = '#00d8ff';
        ctx.fillRect(tierX - 8, tY - 2, 20, 4);
      }
    });

  } else if (key === 'help') {
    // Alternating distress pulse: urgent minor-third alert chevron
    for (let a = 0; a < 4; a += 1) {
      const aX = barX + (0.15 + a * 0.23) * barW;
      if (clampedSweepX >= aX) {
        const aY = a % 2 === 0 ? plotY + plotH * 0.35 : plotY + plotH * 0.52;
        ctx.fillStyle = 'rgba(29, 131, 255, 0.95)';
        ctx.fillRect(aX - 6, aY - 6, 12, 12);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(aX - 8, aY - 8, 16, 16);
      }
    }

  } else if (key === 'good') {
    // Major third resolution: three harmonious upward resolving arcs
    for (let g = 0; g < 3; g += 1) {
      const gY = plotY + plotH * (0.68 - g * 0.15);
      ctx.strokeStyle = '#00d8ff';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(barX, gY);
      ctx.lineTo(clampedSweepX, gY);
      ctx.stroke();
    }

  } else if (key === 'not') {
    // Gated lowpass drop: horizontal laser that sharply drops into low base
    const dropPointX = barX + 0.5 * barW;
    ctx.strokeStyle = '#00d8ff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(barX, plotY + plotH * 0.45);
    ctx.lineTo(Math.min(clampedSweepX, dropPointX), plotY + plotH * 0.45);
    if (clampedSweepX >= dropPointX) {
      ctx.lineTo(dropPointX, plotY + plotH * 0.85);
      ctx.lineTo(clampedSweepX, plotY + plotH * 0.85);
    }
    ctx.stroke();

  } else if (key === 'do') {
    // Grounded impulse beat: resonant percussive tap & tone
    const beatX = barX + 0.35 * barW;
    if (clampedSweepX >= beatX) {
      const bY = plotY + plotH * 0.82;
      ctx.fillStyle = '#00d8ff';
      ctx.beginPath();
      ctx.arc(beatX, bY, 8, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (key === 'today') {
    // Diurnal arch chime: sunrise trajectory chord
    ctx.strokeStyle = '#00d8ff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let x = barX; x <= clampedSweepX; x += 3) {
      const normX = (x - barX) / (barW || 1);
      const aY = plotY + plotH * (0.8 - 0.55 * Math.sin(normX * Math.PI));
      if (x === barX) ctx.moveTo(x, aY);
      else ctx.lineTo(x, aY);
    }
    ctx.stroke();
  }

  // Active sweep contact point spark if actively sweeping this bar
  if (!isDone && clampedSweepX >= barX && clampedSweepX < barX + barW) {
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00d8ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(clampedSweepX, midY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * SpectrogramVideo: Video format component rendering simultaneous audio/video
 * motion spectrogram for single words or multi-measure conversational song phrases.
 */
export function SpectrogramVideo({
  target,
  isPlaying,
  isPaused,
  currentTime,
  duration,
  analyserNode,
}: {
  target: ActiveTarget;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  analyserNode: AnalyserNode | null;
  onReplay?: () => void;
  onClose?: () => void;
  onExport?: () => void;
  isExporting?: boolean;
  onSelectWord?: (key: SignalKey) => void;
  onSelectSentence?: (sentence: ConversationalSentence) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imagesCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const blueWhiteCacheRef = useRef<Record<string, HTMLCanvasElement>>({});
  const animFrameRef = useRef<number | null>(null);

  // Preload all spectrogram images and convert to pure blue/white shades
  useEffect(() => {
    SIGNALS.forEach((s) => {
      if (!imagesCacheRef.current[s.key]) {
        const img = new Image();
        img.src = `/spectrograms/${s.key}.png`;
        img.onload = () => {
          blueWhiteCacheRef.current[s.key] = createBlueWhiteSpectrogramCanvas(img);
        };
        imagesCacheRef.current[s.key] = img;
      }
    });
  }, []);

  const words: SignalKey[] = target.kind === 'sentence' ? target.sentence.words : [target.key];

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    let destroyed = false;
    const freqDomainBuffer = new Uint8Array(128);

    const render = () => {
      if (destroyed) return;

      const rect = stage.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(10, rect.width);
      const height = Math.max(10, rect.height);

      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.scale(dpr, dpr);

        // 1. Deep cosmic black canvas
        ctx.fillStyle = '#01040a';
        ctx.fillRect(0, 0, width, height);

        // Layout bounds
        const gutterLeft = 52;
        const gutterBottom = 22;
        const plotX = gutterLeft;
        const plotY = 12;
        const plotW = Math.max(10, width - plotX - 14);
        const plotH = Math.max(10, height - plotY - gutterBottom);
        const midY = plotY + plotH / 2;

        // 2. Frequency Grid & Labels
        const freqLabels = ['22.1 kHz', '17.6 kHz', '13.2 kHz', '8.8 kHz', '4.4 kHz', '0 Hz'];
        ctx.font = '9px "DM Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < freqLabels.length; i += 1) {
          const y = plotY + (i / (freqLabels.length - 1)) * plotH;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(plotX, y);
          ctx.lineTo(plotX + plotW, y);
          ctx.stroke();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
          ctx.fillText(freqLabels[i], plotX - 6, y);
        }

        // Time axis ticks
        const timeTicks = [0, 0.25, 0.5, 0.75, 1];
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (const tFraction of timeTicks) {
          const x = plotX + tFraction * plotW;
          const tSec = (tFraction * duration).toFixed(1) + 's';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.beginPath();
          ctx.moveTo(x, plotY + plotH);
          ctx.lineTo(x, plotY + plotH + 4);
          ctx.stroke();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
          ctx.fillText(tSec, x, plotY + plotH + 6);
        }

        // Watermark
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(0, 216, 255, 0.3)';
        ctx.fillText('ec·ak·ou / song-spectrogram', plotX + plotW, plotY + plotH + 6);

        // Measure layout math: divide width proportionally by word duration
        const totalDurSum = words.reduce((acc, w) => acc + signalDuration(w), 0) + (words.length - 1) * SENTENCE_GAP;
        let cumulative = 0;
        const measureBars = words.map((w, idx) => {
          const wDur = signalDuration(w);
          const startFrac = cumulative / (totalDurSum || 1);
          const endFrac = (cumulative + wDur) / (totalDurSum || 1);
          cumulative += wDur + SENTENCE_GAP;
          const barX = plotX + startFrac * plotW;
          const barW = (endFrac - startFrac) * plotW;
          return { word: w, index: idx, duration: wDur, startFrac, endFrac, barX, barW };
        });

        const progress = Math.min(1, Math.max(0, duration > 0 ? currentTime / duration : 0));
        const sweepX = plotX + progress * plotW;

        if (analyserNode) {
          analyserNode.getByteFrequencyData(freqDomainBuffer);
        }

        let sumFreq = 0;
        for (let i = 0; i < freqDomainBuffer.length; i += 1) sumFreq += freqDomainBuffer[i];
        const avgFreq = sumFreq / (freqDomainBuffer.length || 1);
        const energyNorm = Math.min(1, avgFreq / 110);

        // Draw Measure dividers and Measure Pills (Song format)
        if (target.kind === 'sentence') {
          measureBars.forEach((bar) => {
            const isCurrent = sweepX >= bar.barX && sweepX < bar.barX + bar.barW;
            // Divider line
            if (bar.index > 0) {
              ctx.strokeStyle = 'rgba(0, 216, 255, 0.22)';
              ctx.lineWidth = 1;
              ctx.setLineDash([3, 3]);
              ctx.beginPath();
              ctx.moveTo(bar.barX, plotY);
              ctx.lineTo(bar.barX, plotY + plotH);
              ctx.stroke();
              ctx.setLineDash([]);
            }

            // Top Measure Index (no spoken words displayed)
            ctx.save();
            ctx.font = '9px "DM Mono", monospace';
            ctx.textAlign = 'left';
            const pillText = `0${bar.index + 1}`;
            if (isCurrent && isPlaying) {
              ctx.fillStyle = '#00d8ff';
              ctx.shadowColor = '#00d8ff';
              ctx.shadowBlur = 8;
            } else {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
              ctx.shadowBlur = 0;
            }
            ctx.fillText(pillText, bar.barX + 6, plotY + 12);
            ctx.restore();
          });
        }

        // Draw each word's spectrogram signature inside its measure bar
        const isContentDone = isPaused;
        measureBars.forEach((bar) => {
          const img = blueWhiteCacheRef.current[bar.word] || imagesCacheRef.current[bar.word];
          const topOffset = target.kind === 'sentence' ? 16 : 0;
          drawWordSpectrogram(
            ctx,
            bar.word,
            bar.barX,
            bar.barW,
            plotY + topOffset,
            plotH - topOffset,
            sweepX,
            currentTime,
            energyNorm,
            isContentDone,
            img,
          );
        });

        if (isPaused) {
          // ==========================================================
          // AUDIO IS DONE PLAYING: STAGNANT STRAIGHT LINE APPEARS
          // Runs continuously across ALL measures from plotX to plotX + plotW
          // ==========================================================
          ctx.save();
          // Outer cyan neon glow
          ctx.shadowColor = '#00d8ff';
          ctx.shadowBlur = 18;
          ctx.strokeStyle = '#00d8ff';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(plotX, midY);
          ctx.lineTo(plotX + plotW, midY);
          ctx.stroke();

          // Bright white laser core
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(plotX, midY);
          ctx.lineTo(plotX + plotW, midY);
          ctx.stroke();

          // Technical calibration reticles
          ctx.strokeStyle = '#00d8ff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(plotX, midY - 8);
          ctx.lineTo(plotX, midY + 8);
          ctx.moveTo(plotX + plotW, midY - 8);
          ctx.lineTo(plotX + plotW, midY + 8);
          // Stagnant flatline center reticle
          const midX = plotX + plotW / 2;
          ctx.moveTo(midX, midY - 6);
          ctx.lineTo(midX, midY + 6);
          ctx.stroke();
          ctx.restore();

        } else if (isPlaying) {
          // ==========================================================
          // AUDIO IS ACTIVELY PLAYING: SPECTROGRAM IN MOTION
          // Active sweep laser + dynamic FFT reactivity
          // ==========================================================

          // Active spectral FFT column at sweepX
          const binCount = 32;
          const binH = plotH / binCount;
          for (let b = 0; b < binCount; b += 1) {
            const bufIdx = Math.floor((b / binCount) * freqDomainBuffer.length);
            const val = freqDomainBuffer[bufIdx] / 255;
            if (val > 0.06) {
              const binY = plotY + plotH - (b + 1) * binH;
              const barLen = Math.max(4, val * 48);
              const grad = ctx.createLinearGradient(sweepX - barLen, binY, sweepX + 6, binY);
              grad.addColorStop(0, 'rgba(0, 31, 92, 0)');
              grad.addColorStop(0.4, 'rgba(29, 131, 255, 0.7)');
              grad.addColorStop(0.9, 'rgba(0, 216, 255, 0.95)');
              grad.addColorStop(1, '#ffffff');

              ctx.fillStyle = grad;
              ctx.fillRect(sweepX - barLen, binY + 0.5, barLen + 6, Math.max(1, binH - 1));
            }
          }

          // Dynamic Vertical Sweep Laser Line
          ctx.save();
          ctx.shadowColor = '#00d8ff';
          ctx.shadowBlur = 18;
          ctx.strokeStyle = '#00d8ff';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(sweepX, plotY);
          ctx.lineTo(sweepX, plotY + plotH);
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.0;
          ctx.stroke();

          // Emitter beacons
          ctx.fillStyle = '#00d8ff';
          ctx.beginPath();
          ctx.arc(sweepX, plotY, 3, 0, Math.PI * 2);
          ctx.arc(sweepX, plotY + plotH, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else {
          // Standby prompt
          const midX = plotX + plotW / 2;
          ctx.save();
          ctx.fillStyle = 'rgba(0, 216, 255, 0.7)';
          ctx.font = '10px "DM Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('STANDBY // 44.1 kHz ACOUSTIC SPECTROGRAM', midX, midY - 6);
          ctx.fillText('SPEAK TO TRIGGER SPECTROGRAM STREAM', midX, midY + 12);
          ctx.restore();
        }

        // CRT scanline raster
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        for (let y = 0; y < height; y += 3) {
          ctx.fillRect(0, y, width, 1);
        }

        // Tactile phosphor analog grain
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        for (let i = 0; i < 450; i += 1) {
          const gx = Math.random() * width;
          const gy = Math.random() * height;
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      destroyed = true;
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [target, words, isPlaying, isPaused, currentTime, duration, analyserNode]);

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : isPaused ? 100 : 0;
  const timeFormatted = `${currentTime.toFixed(2)}s / ${duration.toFixed(2)}s`;

  return (
    <div className="nc-video-panel" aria-label="Spectrogram video monitor">
      <div className="nc-video-topbar">
        <div className={`nc-video-status-tag ${isPlaying ? 'is-playing' : 'is-paused'}`}>
          <span className={`nc-video-beacon ${isPlaying ? 'pulse' : 'stagnant'}`} />
          <span>{isPlaying ? 'Live video · Spectrogram in motion' : 'Spectrogram paused'}</span>
        </div>
        <div className="nc-video-timecode">{timeFormatted}</div>
      </div>

      <div className="nc-video-stage" ref={stageRef}>
        <canvas ref={canvasRef} className="nc-video-canvas" />
      </div>

      <div className="nc-video-controls">
        <div className="nc-video-progress-bar" role="progressbar" aria-valuenow={Math.round(progressPercent)} aria-valuemin={0} aria-valuemax={100}>
          <div className="nc-video-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </div>
  );
}
