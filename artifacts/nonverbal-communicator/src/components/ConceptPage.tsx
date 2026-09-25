import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { HeroSpectrogramMotionArt } from './HeroSpectrogramMotionArt';

interface ConceptPageProps {
  onTryArtefact: () => void;
}

export function ConceptPage({ onTryArtefact }: ConceptPageProps) {
  return (
    <div className="nc-flux-root">
      {/* 01. Minimal Top Sub-Navigation Ribbon without page numbers or redundant name repetition */}
      <div className="nc-flux-subnav">
        <div className="nc-flux-subnav-left">
          <span className="nc-flux-brand">✦ GHOST SPEECH MASK · SPECULATIVE ARTEFACT</span>
        </div>

        <div className="nc-flux-subnav-right">
          <span className="nc-flux-specimen-badge">
            <span className="nc-live-dot" aria-hidden="true" />
            <span>AUTHENTIC HARDWARE SPECIMEN</span>
          </span>
        </div>
      </div>

      {/* 02. Refined Editorial Header: Justified Text on Left + Large Frameless Spectrogram Motion Art & Centered Bottom Button on Right */}
      <header className="nc-flux-hero-header">
        <div className="nc-flux-hero-eyebrow">
          <span className="nc-hero-mini-pill cyan">PHYSICAL PROTOTYPE</span>
          <span className="nc-hero-mini-pill">LIP-READING DEFEAT</span>
          <span className="nc-hero-mini-pill">ACOUSTIC CIPHER</span>
        </div>

        <div className="nc-flux-hero-row">
          {/* Left Column: Composed Speak Human kicker, title and lead */}
          <div className="nc-flux-hero-title-col">
            <div className="nc-page1-signal-badge">
              <span className="nc-page1-speak-title">
                SPEAK HUMAN<span className="nc-page1-dot">.</span>
              </span>
              <span className="nc-page1-flow-text">
                SPEAK <b>→</b> LISTEN <b>→</b> SIGNAL
              </span>
            </div>

            <h1 className="nc-flux-display-title">
              A language for the world that <span className="nc-title-gradient">listens too much</span>.
            </h1>
            {/* Lead copy */}
            <p className="nc-flux-hero-lead">
              A wearable acoustic mask that conceals mouth articulation, translating spoken phrases into 
              melodic glissandos and real-time OLED spectrogram ribbons readable only by companions.
            </p>
          </div>

          {/* Right Column: Motion graphics hero visual occupying the right half (bigger, frameless, no pink line) + centered bottom-aligned Try Artefact button */}
          <div className="nc-flux-hero-right-col">
            <div className="nc-hero-motion-art-wrapper">
              <HeroSpectrogramMotionArt />
            </div>

            <div className="nc-flux-hero-action-col">
              <button
                type="button"
                className="nc-flux-pill-btn highlighted-hero"
                onClick={onTryArtefact}
                data-testid="hero-try-artefact"
              >
                <span className="nc-hero-btn-glow" aria-hidden="true" />
                <span>TRY ARTEFACT</span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
              <span className="nc-flux-cta-hint">Launch Interactive Receiver Console →</span>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
