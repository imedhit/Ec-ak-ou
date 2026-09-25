import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, CircleHelp, Download, Mic, RotateCcw, Square, Music, Volume2 } from 'lucide-react';
import { SpectrogramVideo } from './components/SpectrogramVideo';
import { ConceptPage } from './components/ConceptPage';

type SignalKey =
  | 'hello'
  | 'danger'
  | 'safe'
  | 'leave'
  | 'why'
  | 'how'
  | 'what'
  | 'when'
  | 'are'
  | 'you'
  | 'doing'
  | 'where'
  | 'who'
  | 'yes'
  | 'no'
  | 'going'
  | 'here'
  | 'can'
  | 'hear'
  | 'me'
  | 'i'
  | 'am'
  | 'now'
  | 'come'
  | 'is'
  | 'there'
  | 'please'
  | 'help'
  | 'good'
  | 'not'
  | 'do'
  | 'today';

type Cue = {
  key: SignalKey;
  sound: string;
  time: string;
};

type ConversationalSentence = {
  id: string;
  text: string;
  words: SignalKey[];
  description: string;
  category: 'Greeting' | 'Inquiry' | 'Safety' | 'Assistance';
};

type ActiveTarget =
  | { kind: 'word'; key: SignalKey }
  | { kind: 'sentence'; sentence: ConversationalSentence };

type LogEntry = Cue & { id: number };

type RecognitionResultEvent = Event & {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: { transcript: string };
    };
  };
};

type RecognitionErrorEvent = Event & { error?: string };

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
  webkitAudioContext?: typeof AudioContext;
};

const COMMON_SENTENCES: ConversationalSentence[] = [
  {
    id: 'hello_how_are_you',
    text: 'Hello, how are you?',
    words: ['hello', 'how', 'are', 'you'],
    description: 'Four-part greeting glissando & harmonic swell phrase',
    category: 'Greeting',
  },
  {
    id: 'what_are_you_doing',
    text: 'What are you doing?',
    words: ['what', 'are', 'you', 'doing'],
    description: 'Dual radar ping transitioning into kinetic ribbon weave',
    category: 'Inquiry',
  },
  {
    id: 'where_are_you_going',
    text: 'Where are you going?',
    words: ['where', 'are', 'you', 'going'],
    description: 'Sonar spatial echo linked to dynamic Doppler propulsion',
    category: 'Inquiry',
  },
  {
    id: 'why_are_you_here',
    text: 'Why are you here?',
    words: ['why', 'are', 'you', 'here'],
    description: 'Rising interrogative glissando with grounded beacon tone',
    category: 'Inquiry',
  },
  {
    id: 'can_you_hear_me',
    text: 'Can you hear me?',
    words: ['can', 'you', 'hear', 'me'],
    description: 'Acoustic interrogation burst with auditory sonar return',
    category: 'Inquiry',
  },
  {
    id: 'i_am_safe_here',
    text: 'I am safe here',
    words: ['i', 'am', 'safe', 'here'],
    description: 'Harmonic foundational fifth into peace chime & beacon',
    category: 'Safety',
  },
  {
    id: 'danger_leave_now',
    text: 'Danger, leave now!',
    words: ['danger', 'leave', 'now'],
    description: 'Triple click urgency pulse into evacuation whistle & transient',
    category: 'Safety',
  },
  {
    id: 'when_can_you_come',
    text: 'When can you come?',
    words: ['when', 'can', 'you', 'come'],
    description: 'Chrono metronome ticks into inward beckoning glissando',
    category: 'Inquiry',
  },
  {
    id: 'who_is_there',
    text: 'Who is there?',
    words: ['who', 'is', 'there'],
    description: 'Whistle parabola through holding drone to spatial echo',
    category: 'Inquiry',
  },
  {
    id: 'please_help_me',
    text: 'Please help me',
    words: ['please', 'help', 'me'],
    description: 'Microtonal polite shimmer into alternating distress pulses',
    category: 'Assistance',
  },
  {
    id: 'yes_i_am_good',
    text: 'Yes, I am good',
    words: ['yes', 'i', 'am', 'good'],
    description: 'Affirmative crystalline chime with warm major chord resolution',
    category: 'Greeting',
  },
  {
    id: 'no_do_not_leave',
    text: 'No, do not leave',
    words: ['no', 'do', 'not', 'leave'],
    description: 'Low-gate cutoff gate with grounded beat and descending whistle',
    category: 'Safety',
  },
  {
    id: 'how_are_you_today',
    text: 'How are you today?',
    words: ['how', 'are', 'you', 'today'],
    description: 'Undulating swell into triad drone and diurnal arch chime',
    category: 'Greeting',
  },
];

const SIGNALS: Array<{
  key: SignalKey;
  sound: string;
  description: string;
  tone: string;
}> = [
  { key: 'hello', sound: 'Vocal swell', description: 'sustained, soft open tone', tone: 'tone-amber' },
  { key: 'danger', sound: 'Triple click', description: 'three sharp alert pulses', tone: 'tone-coral' },
  { key: 'safe', sound: 'Ascending chime', description: 'two-note crystalline tone', tone: 'tone-mist' },
  { key: 'leave', sound: 'Falling whistle', description: 'descending directional tone', tone: 'tone-teal' },
  { key: 'why', sound: 'Interrogative glissando', description: 'rising harmonic glissando', tone: 'tone-teal' },
  { key: 'how', sound: 'Undulating swell', description: 'triple harmonic wave modulation', tone: 'tone-amber' },
  { key: 'what', sound: 'Dual radar ping', description: 'twin percussive impulse burst', tone: 'tone-coral' },
  { key: 'when', sound: 'Chrono cadence', description: 'four-step metronomic ticks', tone: 'tone-mist' },
  { key: 'are', sound: 'Harmonic drone triad', description: 'sustained resonant triad chord', tone: 'tone-teal' },
  { key: 'you', sound: 'Directional focal beam', description: 'converging acoustic focal surge', tone: 'tone-amber' },
  { key: 'doing', sound: 'Kinetic ribbon weave', description: 'cyclical undulating modulation', tone: 'tone-coral' },
  { key: 'where', sound: 'Sonar spatial echo', description: 'expanding beacon dispersion', tone: 'tone-mist' },
  { key: 'who', sound: 'Whistle parabola', description: 'ascending & descending bell arch', tone: 'tone-teal' },
  { key: 'yes', sound: 'Affirmative chime', description: 'bright ascending crystalline chirp', tone: 'tone-mist' },
  { key: 'no', sound: 'Dual low-gate drop', description: 'authoritative twin low pulses', tone: 'tone-coral' },
  { key: 'going', sound: 'Doppler kinetic sweep', description: 'descending-ascending velocity vector', tone: 'tone-amber' },
  { key: 'here', sound: 'Grounded beacon tone', description: 'solid fundamental Pythagorean anchor', tone: 'tone-teal' },
  { key: 'can', sound: 'Rising potential chime', description: 'two-step energetic ascending chime', tone: 'tone-mist' },
  { key: 'hear', sound: 'Auditory sonar ping', description: 'crystalline high-register reception ping', tone: 'tone-teal' },
  { key: 'me', sound: 'Warm vocal-mid swell', description: 'intimate grounded low-mid sine swell', tone: 'tone-amber' },
  { key: 'i', sound: 'Pure fundamental tone', description: 'solitary crystalline transformative tone', tone: 'tone-mist' },
  { key: 'am', sound: 'Foundational fifth chord', description: 'deep harmonic C-G dyad breathing swell', tone: 'tone-teal' },
  { key: 'now', sound: 'Percussive transient impulse', description: 'immediate sharp attack with fast decay', tone: 'tone-coral' },
  { key: 'come', sound: 'Inward beckoning glissando', description: 'warm ascending welcoming glissando', tone: 'tone-amber' },
  { key: 'is', sound: 'Holding bridge drone', description: 'calming steady tonal copula with vibrato', tone: 'tone-teal' },
  { key: 'there', sound: 'Spatial distant echo', description: 'two dispersed acoustic reflections', tone: 'tone-mist' },
  { key: 'please', sound: 'Microtonal polite shimmer', description: 'delicate three-part shimmering triad', tone: 'tone-mist' },
  { key: 'help', sound: 'Alternating distress pulse', description: 'urgent minor-third dual alert beacon', tone: 'tone-coral' },
  { key: 'good', sound: 'Major third resolution', description: 'warm three-tone affirmative chord', tone: 'tone-amber' },
  { key: 'not', sound: 'Gated lowpass drop', description: 'authoritative negative gate cutoff', tone: 'tone-coral' },
  { key: 'do', sound: 'Grounded impulse beat', description: 'resonant percussive tap & tone', tone: 'tone-teal' },
  { key: 'today', sound: 'Diurnal arch chime', description: 'three-tier sunrise trajectory chord', tone: 'tone-amber' },
];

const MASTER_OUTPUT_GAIN = 1.45;
const NORMALIZED_PEAK = 0.42;
const SENTENCE_GAP = 0.08;

const signalByKey = (key: SignalKey) => SIGNALS.find((signal) => signal.key === key) ?? SIGNALS[0];

const sentenceById = (id: string) => COMMON_SENTENCES.find((s) => s.id === id) ?? COMMON_SENTENCES[0];

const signalDuration = (key: SignalKey): number => {
  switch (key) {
    case 'danger': return 0.46;
    case 'safe': return 0.92;
    case 'leave': return 1.3;
    case 'hello': return 1.6;
    case 'why': return 1.1;
    case 'how': return 1.25;
    case 'what': return 0.65;
    case 'when': return 0.85;
    case 'are': return 1.35;
    case 'you': return 1.2;
    case 'doing': return 1.05;
    case 'where': return 1.15;
    case 'who': return 1.2;
    case 'yes': return 0.7;
    case 'no': return 0.75;
    case 'going': return 1.1;
    case 'here': return 0.95;
    case 'can': return 0.75;
    case 'hear': return 1.05;
    case 'me': return 0.9;
    case 'i': return 0.8;
    case 'am': return 1.15;
    case 'now': return 0.5;
    case 'come': return 0.95;
    case 'is': return 0.7;
    case 'there': return 1.0;
    case 'please': return 1.1;
    case 'help': return 0.85;
    case 'good': return 1.0;
    case 'not': return 0.6;
    case 'do': return 0.65;
    case 'today': return 1.05;
    default: return 1.0;
  }
};

const calculateSentenceDuration = (words: SignalKey[]): number => {
  if (words.length === 0) return 0;
  const wordSum = words.reduce((acc, w) => acc + signalDuration(w), 0);
  return wordSum + (words.length - 1) * SENTENCE_GAP;
};

const signalFromPath = (): ActiveTarget | null => {
  if (typeof window === 'undefined') return null;
  const sentenceMatch = window.location.pathname.match(/^\/sentence\/([a-z0-9_]+)$/)?.[1];
  if (sentenceMatch) {
    const foundSentence = COMMON_SENTENCES.find((s) => s.id === sentenceMatch);
    if (foundSentence) return { kind: 'sentence', sentence: foundSentence };
  }
  const match = window.location.pathname.match(/^\/signal\/([a-z]+)$/)?.[1];
  const found = SIGNALS.find((s) => s.key === match);
  return found ? { kind: 'word', key: found.key } : null;
};


function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getAudioContextConstructor() {
  const audioWindow = window as SpeechWindow;
  return window.AudioContext || audioWindow.webkitAudioContext;
}

function createSignalGraph(
  context: BaseAudioContext,
  key: SignalKey,
  destination: AudioNode,
  now: number,
) {
  const masterOutput = context.createGain();
  masterOutput.gain.setValueAtTime(MASTER_OUTPUT_GAIN, now);
  masterOutput.connect(destination);

  if (key === 'hello') {
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK, now + 0.18);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);
    output.connect(masterOutput);
    const body = context.createOscillator();
    body.type = 'sine';
    body.frequency.setValueAtTime(205, now);
    body.frequency.linearRampToValueAtTime(218, now + 1.2);
    body.connect(output);
    body.start(now);
    body.stop(now + 1.6);
    const overtone = context.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(410, now);
    const overtoneGain = context.createGain();
    overtoneGain.gain.value = 0.18;
    overtone.connect(overtoneGain);
    overtoneGain.connect(output);
    overtone.start(now);
    overtone.stop(now + 1.6);
    return;
  }

  if (key === 'safe') {
    const output = context.createGain();
    output.gain.value = 1;
    output.connect(masterOutput);
    [
      { frequency: 660, start: 0, duration: 0.42, level: 0.36, type: 'sine' as OscillatorType },
      { frequency: 990, start: 0.19, duration: 0.62, level: 0.3, type: 'triangle' as OscillatorType },
    ].forEach(({ frequency, start, duration, level, type }) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(level, now + start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      oscillator.connect(gain);
      gain.connect(output);
      oscillator.start(now + start);
      oscillator.stop(now + start + duration + 0.02);
    });
    return;
  }

  if (key === 'danger') {
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.07), context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * (1 - index / channel.length);
    }
    [0, 0.14, 0.28].forEach((offset) => {
      const source = context.createBufferSource();
      source.buffer = buffer;
      const filter = context.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1700;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK, now + offset + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.07);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(masterOutput);
      source.start(now + offset);
    });
    return;
  }

  if (key === 'leave') {
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK, now + 0.08);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 1.28);
    output.connect(masterOutput);
    const whistle = context.createOscillator();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(980, now);
    whistle.frequency.exponentialRampToValueAtTime(280, now + 1.22);
    whistle.connect(output);
    whistle.start(now);
    whistle.stop(now + 1.3);
    return;
  }

  if (key === 'why') {
    // Upward rising interrogative glissando with harmonic overtone
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.9, now + 0.12);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 1.08);
    output.connect(masterOutput);

    const fundamental = context.createOscillator();
    fundamental.type = 'sine';
    fundamental.frequency.setValueAtTime(320, now);
    fundamental.frequency.exponentialRampToValueAtTime(680, now + 0.9);
    fundamental.connect(output);
    fundamental.start(now);
    fundamental.stop(now + 1.1);

    const overtone = context.createOscillator();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(640, now);
    overtone.frequency.exponentialRampToValueAtTime(1360, now + 0.9);
    const overtoneGain = context.createGain();
    overtoneGain.gain.value = 0.22;
    overtone.connect(overtoneGain);
    overtoneGain.connect(output);
    overtone.start(now);
    overtone.stop(now + 1.1);
    return;
  }

  if (key === 'how') {
    // Warm breathy swell with undulating triple harmonic wave
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.92, now + 0.2);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 1.22);
    output.connect(masterOutput);

    // FM LFO for undulating wave vibrato
    const lfo = context.createOscillator();
    lfo.frequency.value = 7.5;
    const lfoGain = context.createGain();
    lfoGain.gain.value = 24;
    lfo.connect(lfoGain);

    const carrier = context.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(240, now);
    lfoGain.connect(carrier.frequency);
    carrier.connect(output);

    const secondHarmonic = context.createOscillator();
    secondHarmonic.type = 'sine';
    secondHarmonic.frequency.setValueAtTime(480, now);
    const secondGain = context.createGain();
    secondGain.gain.value = 0.25;
    secondHarmonic.connect(secondGain);
    secondGain.connect(output);

    lfo.start(now);
    lfo.stop(now + 1.25);
    carrier.start(now);
    carrier.stop(now + 1.25);
    secondHarmonic.start(now);
    secondHarmonic.stop(now + 1.25);
    return;
  }

  if (key === 'what') {
    // Sharp dual radar ping: twin percussive impulse burst
    [
      { freq: 440, offset: 0, dur: 0.18, type: 'sine' as OscillatorType, level: NORMALIZED_PEAK * 0.9 },
      { freq: 1320, offset: 0.22, dur: 0.38, type: 'triangle' as OscillatorType, level: NORMALIZED_PEAK * 0.75 },
    ].forEach(({ freq, offset, dur, type, level }) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + offset);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + offset + dur);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(level, now + offset + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + dur);
      osc.connect(gain);
      gain.connect(masterOutput);
      osc.start(now + offset);
      osc.stop(now + offset + dur + 0.02);
    });
    return;
  }

  if (key === 'when') {
    // 4-step metronomic chrono cadence ticks
    [440, 554, 659, 880].forEach((freq, idx) => {
      const offset = idx * 0.19;
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + offset);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.85, now + offset + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.14);
      osc.connect(gain);
      gain.connect(masterOutput);
      osc.start(now + offset);
      osc.stop(now + offset + 0.16);
    });
    return;
  }

  if (key === 'are') {
    // Sustained harmonic drone triad (C4, G4, C5)
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.78, now + 0.15);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 1.32);
    output.connect(masterOutput);

    [261.6, 392.0, 523.2].forEach((freq, idx) => {
      const osc = context.createOscillator();
      osc.type = idx === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq + (idx - 1) * 1.5, now + 1.3);
      const subGain = context.createGain();
      subGain.gain.value = idx === 0 ? 0.45 : idx === 1 ? 0.32 : 0.23;
      osc.connect(subGain);
      subGain.connect(output);
      osc.start(now);
      osc.stop(now + 1.35);
    });
    return;
  }

  if (key === 'you') {
    // Converging directional acoustic beam focused to high-frequency apex
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.88, now + 0.22);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 1.18);

    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 4.2;
    filter.frequency.setValueAtTime(360, now);
    filter.frequency.exponentialRampToValueAtTime(1480, now + 1.1);

    const osc = context.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.linearRampToValueAtTime(740, now + 1.1);

    osc.connect(filter);
    filter.connect(output);
    output.connect(masterOutput);
    osc.start(now);
    osc.stop(now + 1.2);
    return;
  }

  if (key === 'doing') {
    // Kinetic ribbon weave: cyclical undulating two-phase frequency modulation
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.86, now + 0.1);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 1.02);
    output.connect(masterOutput);

    const osc = context.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);

    // Dynamic wave modulation
    for (let cycle = 0; cycle < 5; cycle += 1) {
      const t = now + (cycle * 0.2);
      osc.frequency.linearRampToValueAtTime(480, t + 0.1);
      osc.frequency.linearRampToValueAtTime(320, t + 0.2);
    }

    const sub = context.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(170, now);
    const subGain = context.createGain();
    subGain.gain.value = 0.35;
    sub.connect(subGain);
    subGain.connect(output);

    osc.connect(output);
    osc.start(now);
    osc.stop(now + 1.05);
    sub.start(now);
    sub.stop(now + 1.05);
    return;
  }

  if (key === 'where') {
    // Sonar spatial echo: two spatial pulses
    [
      { freq: 760, start: 0, dur: 0.45, level: NORMALIZED_PEAK * 0.8 },
      { freq: 1140, start: 0.32, dur: 0.78, level: NORMALIZED_PEAK * 0.55 },
    ].forEach(({ freq, start, dur, level }) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(level, now + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain);
      gain.connect(masterOutput);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
    return;
  }

  if (key === 'who') {
    // Whistle parabola: ascending bell arch and smooth resolution
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.88, now + 0.15);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 1.18);
    output.connect(masterOutput);

    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(390, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.55);
    osc.frequency.exponentialRampToValueAtTime(510, now + 1.18);

    const bell = context.createOscillator();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(780, now);
    bell.frequency.exponentialRampToValueAtTime(1480, now + 0.55);
    bell.frequency.exponentialRampToValueAtTime(1020, now + 1.18);
    const bellGain = context.createGain();
    bellGain.gain.value = 0.16;
    bell.connect(bellGain);
    bellGain.connect(output);

    osc.connect(output);
    osc.start(now);
    osc.stop(now + 1.2);
    bell.start(now);
    bell.stop(now + 1.2);
    return;
  }

  if (key === 'yes') {
    // Affirmative two-tone chime (523 Hz -> 880 Hz)
    [
      { freq: 523.25, start: 0, dur: 0.26, level: NORMALIZED_PEAK * 0.8 },
      { freq: 880.0, start: 0.18, dur: 0.5, level: NORMALIZED_PEAK * 0.88 },
    ].forEach(({ freq, start, dur, level }) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(level, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain);
      gain.connect(masterOutput);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
    return;
  }

  if (key === 'no') {
    // Dual low-gate drop: two authoritative low pulses
    [
      { freq: 220, start: 0, dur: 0.28, level: NORMALIZED_PEAK * 0.85 },
      { freq: 165, start: 0.3, dur: 0.42, level: NORMALIZED_PEAK * 0.8 },
    ].forEach(({ freq, start, dur, level }) => {
      const osc = context.createOscillator();
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 520;
      const gain = context.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(level, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterOutput);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
    return;
  }

  if (key === 'going') {
    // Doppler kinetic sweep: descending-ascending velocity vector
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.9, now + 0.12);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 1.08);
    output.connect(masterOutput);

    const osc = context.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(280, now + 1.1);

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(2400, now + 0.5);
    filter.frequency.linearRampToValueAtTime(600, now + 1.1);

    osc.connect(filter);
    filter.connect(output);
    osc.start(now);
    osc.stop(now + 1.1);
    return;
  }

  if (key === 'here') {
    // Grounded beacon tone: 432 Hz fundamental Pythagorean anchor + sub-octave
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.85, now + 0.08);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 0.93);
    output.connect(masterOutput);

    const fundamental = context.createOscillator();
    fundamental.type = 'sine';
    fundamental.frequency.setValueAtTime(432, now);
    fundamental.connect(output);

    const sub = context.createOscillator();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(216, now);
    const subGain = context.createGain();
    subGain.gain.value = 0.35;
    sub.connect(subGain);
    subGain.connect(output);

    fundamental.start(now);
    fundamental.stop(now + 0.95);
    sub.start(now);
    sub.stop(now + 0.95);
    return;
  }

  if (key === 'can') {
    // Rising potential chime: two-step energetic ascending chime (440 -> 660 Hz)
    [
      { freq: 440, start: 0, dur: 0.32, level: NORMALIZED_PEAK * 0.75 },
      { freq: 659.25, start: 0.22, dur: 0.52, level: NORMALIZED_PEAK * 0.85 },
    ].forEach(({ freq, start, dur, level }) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(level, now + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain);
      gain.connect(masterOutput);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
    return;
  }

  if (key === 'hear') {
    // Auditory sonar ping: crystalline high-register reception ping (1100 Hz ping with dispersion)
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK, now + 0.03);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 1.02);
    output.connect(masterOutput);

    const ping = context.createOscillator();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(1174, now); // D6
    ping.frequency.exponentialRampToValueAtTime(880, now + 1.0);
    ping.connect(output);

    const harmonic = context.createOscillator();
    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(2349, now);
    const hGain = context.createGain();
    hGain.gain.value = 0.2;
    harmonic.connect(hGain);
    hGain.connect(output);

    ping.start(now);
    ping.stop(now + 1.05);
    harmonic.start(now);
    harmonic.stop(now + 1.05);
    return;
  }

  if (key === 'me') {
    // Warm vocal-mid swell: intimate grounded low-mid sine swell (220 Hz A3)
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.88, now + 0.25);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 0.88);
    output.connect(masterOutput);

    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(225, now + 0.9);
    osc.connect(output);
    osc.start(now);
    osc.stop(now + 0.9);
    return;
  }

  if (key === 'i') {
    // Pure fundamental tone: solitary crystalline transformative tone (528 Hz Solfeggio)
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.92, now + 0.08);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 0.78);
    output.connect(masterOutput);

    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, now);
    osc.connect(output);
    osc.start(now);
    osc.stop(now + 0.8);
    return;
  }

  if (key === 'am') {
    // Foundational fifth chord: deep harmonic C-G dyad breathing swell (130.8 Hz & 196 Hz)
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.85, now + 0.2);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 1.12);
    output.connect(masterOutput);

    const root = context.createOscillator();
    root.type = 'sine';
    root.frequency.setValueAtTime(130.81, now); // C3
    root.connect(output);

    const fifth = context.createOscillator();
    fifth.type = 'sine';
    fifth.frequency.setValueAtTime(196.0, now); // G3
    const fifthGain = context.createGain();
    fifthGain.gain.value = 0.65;
    fifth.connect(fifthGain);
    fifthGain.connect(output);

    root.start(now);
    root.stop(now + 1.15);
    fifth.start(now);
    fifth.stop(now + 1.15);
    return;
  }

  if (key === 'now') {
    // Percussive transient impulse: immediate sharp attack with fast decay (780 Hz click)
    const output = context.createGain();
    output.gain.setValueAtTime(NORMALIZED_PEAK * 1.1, now);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
    output.connect(masterOutput);

    const click = context.createOscillator();
    click.type = 'triangle';
    click.frequency.setValueAtTime(780, now);
    click.frequency.exponentialRampToValueAtTime(180, now + 0.3);
    click.connect(output);
    click.start(now);
    click.stop(now + 0.5);
    return;
  }

  if (key === 'come') {
    // Inward beckoning glissando: warm ascending welcoming glissando (260 Hz -> 440 Hz)
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.85, now + 0.15);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 0.92);
    output.connect(masterOutput);

    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(261.63, now);
    osc.frequency.exponentialRampToValueAtTime(440.0, now + 0.85);
    osc.connect(output);
    osc.start(now);
    osc.stop(now + 0.95);
    return;
  }

  if (key === 'is') {
    // Holding bridge drone: calming steady tonal copula with subtle vibrato (330 Hz E4)
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(NORMALIZED_PEAK * 0.8, now + 0.08);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 0.68);
    output.connect(masterOutput);

    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, now);
    osc.connect(output);
    osc.start(now);
    osc.stop(now + 0.7);
    return;
  }

  if (key === 'there') {
    // Spatial distant echo: two dispersed acoustic reflections (587 Hz D5)
    [
      { start: 0, dur: 0.45, level: NORMALIZED_PEAK * 0.8 },
      { start: 0.38, dur: 0.58, level: NORMALIZED_PEAK * 0.5 },
    ].forEach(({ start, dur, level }) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now + start);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(level, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain);
      gain.connect(masterOutput);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
    return;
  }

  if (key === 'please') {
    // Microtonal polite shimmer: delicate three-part shimmering triad
    [
      { freq: 523.25, start: 0, dur: 0.65, level: NORMALIZED_PEAK * 0.6 },
      { freq: 659.25, start: 0.15, dur: 0.75, level: NORMALIZED_PEAK * 0.7 },
      { freq: 783.99, start: 0.3, dur: 0.78, level: NORMALIZED_PEAK * 0.8 },
    ].forEach(({ freq, start, dur, level }) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(level, now + start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain);
      gain.connect(masterOutput);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
    return;
  }

  if (key === 'help') {
    // Alternating distress pulse: urgent minor-third dual alert beacon (932 Hz / 784 Hz)
    [
      { freq: 932.33, start: 0, dur: 0.22, level: NORMALIZED_PEAK * 0.95 },
      { freq: 783.99, start: 0.18, dur: 0.22, level: NORMALIZED_PEAK * 0.95 },
      { freq: 932.33, start: 0.38, dur: 0.22, level: NORMALIZED_PEAK * 0.95 },
      { freq: 783.99, start: 0.56, dur: 0.26, level: NORMALIZED_PEAK * 0.95 },
    ].forEach(({ freq, start, dur, level }) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + start);
      const filt = context.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 1800;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(level, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(filt);
      filt.connect(gain);
      gain.connect(masterOutput);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
    return;
  }

  if (key === 'good') {
    // Major third resolution: warm three-tone affirmative chord (C4 - E4 - G4)
    [
      { freq: 261.63, start: 0, dur: 0.95, level: NORMALIZED_PEAK * 0.7 },
      { freq: 329.63, start: 0.08, dur: 0.88, level: NORMALIZED_PEAK * 0.75 },
      { freq: 392.0, start: 0.16, dur: 0.82, level: NORMALIZED_PEAK * 0.8 },
    ].forEach(({ freq, start, dur, level }) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(level, now + start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain);
      gain.connect(masterOutput);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
    return;
  }

  if (key === 'not') {
    // Gated lowpass drop: authoritative negative gate cutoff (360 Hz plunging to 110 Hz)
    const output = context.createGain();
    output.gain.setValueAtTime(NORMALIZED_PEAK * 0.9, now);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);
    output.connect(masterOutput);

    const osc = context.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);
    osc.connect(output);
    osc.start(now);
    osc.stop(now + 0.6);
    return;
  }

  if (key === 'do') {
    // Grounded impulse beat: resonant percussive tap & tone (150 Hz impulse)
    const output = context.createGain();
    output.gain.setValueAtTime(NORMALIZED_PEAK, now);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
    output.connect(masterOutput);

    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.55);
    osc.connect(output);
    osc.start(now);
    osc.stop(now + 0.65);
    return;
  }

  if (key === 'today') {
    // Diurnal arch chime: three-tier sunrise trajectory chord (349 Hz F4 -> 523 Hz C5 -> 440 Hz A4)
    [
      { freq: 349.23, start: 0, dur: 0.4, level: NORMALIZED_PEAK * 0.75 },
      { freq: 523.25, start: 0.22, dur: 0.6, level: NORMALIZED_PEAK * 0.85 },
      { freq: 440.0, start: 0.45, dur: 0.58, level: NORMALIZED_PEAK * 0.75 },
    ].forEach(({ freq, start, dur, level }) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(level, now + start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain);
      gain.connect(masterOutput);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
    return;
  }
}

type AppPage = 'concept' | 'artefact';

interface SiteHeaderProps {
  currentPage?: AppPage;
  onNavigate?: (page: AppPage) => void;
}

function SiteHeader({ currentPage = 'concept', onNavigate }: SiteHeaderProps) {
  return (
    <header className="nc-header">
      <button
        type="button"
        className="nc-mark"
        onClick={() => onNavigate?.('concept')}
        style={{ cursor: onNavigate ? 'pointer' : 'default', background: 'transparent', border: 'none', padding: 0, textAlign: 'left' }}
        aria-label="Ec(ak)ou Home"
      >
        <span className="nc-mark-glyph" aria-hidden="true"><span className="nc-live-dot" /></span>
        <span>
          <span className="nc-mark-name nc-mark-name-highlighted">Ec(ak)ou</span>
          <span className="nc-mark-sub">field prototype / 04</span>
        </span>
      </button>

      {onNavigate && (
        <nav className="nc-header-nav-tabs" aria-label="Main Navigation">
          <button
            type="button"
            className={`nc-header-tab-btn ${currentPage === 'concept' ? 'is-active' : ''}`}
            onClick={() => onNavigate('concept')}
            aria-current={currentPage === 'concept' ? 'page' : undefined}
            data-testid="nav-tab-concept"
          >
            Concept Note
          </button>
          <button
            type="button"
            className={`nc-header-tab-btn ${currentPage === 'artefact' ? 'is-active' : ''}`}
            onClick={() => onNavigate('artefact')}
            aria-current={currentPage === 'artefact' ? 'page' : undefined}
            data-testid="nav-tab-artefact"
          >
            Interactive Artefact
          </button>
        </nav>
      )}

      <div className="nc-header-meta">
        <span className="nc-live-dot" aria-hidden="true" />
        <span>local signal processing</span>
        <span>build 0.4.1</span>
      </div>
    </header>
  );
}

function audioBufferToWav(buffer: AudioBuffer): DataView {
  const channelCount = buffer.numberOfChannels;
  const frameCount = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = channelCount * bytesPerSample;
  const dataSize = frameCount * blockAlign;
  const view = new DataView(new ArrayBuffer(44 + dataSize));
  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels = Array.from({ length: channelCount }, (_, index) => buffer.getChannelData(index));
  let offset = 44;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return view;
}

async function renderSignalAudioBuffer(key: SignalKey): Promise<AudioBuffer> {
  const duration = signalDuration(key);
  const sampleRate = 44100;
  const offline = new OfflineAudioContext(1, Math.ceil(duration * sampleRate), sampleRate);
  createSignalGraph(offline, key, offline.destination, 0);
  return offline.startRendering();
}

async function renderSentenceAudioBuffer(words: SignalKey[]): Promise<AudioBuffer> {
  const duration = calculateSentenceDuration(words);
  const sampleRate = 44100;
  const offline = new OfflineAudioContext(1, Math.ceil(duration * sampleRate), sampleRate);
  const master = offline.createGain();
  master.gain.setValueAtTime(MASTER_OUTPUT_GAIN, 0);
  master.connect(offline.destination);

  let t = 0;
  for (let i = 0; i < words.length; i += 1) {
    createSignalGraph(offline, words[i], master, t);
    t += signalDuration(words[i]) + SENTENCE_GAP;
  }
  return offline.startRendering();
}

function Home({ onNavigate }: { onNavigate?: (page: AppPage) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [latestCue, setLatestCue] = useState<Cue | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cueActive, setCueActive] = useState(false);
  const [activeTarget, setActiveTarget] = useState<ActiveTarget | null>(signalFromPath);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');

  // Audio & Video synchronization states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const recognitionRef = useRef<Recognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const listeningRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);
  const cueTimerRef = useRef<number | null>(null);
  const playbackTimerRef = useRef<number | null>(null);
  const timeIntervalRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const lastSpeechTriggerRef = useRef(0);

  const speechConstructor = typeof window !== 'undefined'
    ? ((window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition)
    : undefined;
  const audioSupported = typeof window !== 'undefined' && Boolean(getAudioContextConstructor());
  const microphoneSupported = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
  const browserSupported = Boolean(speechConstructor && audioSupported && microphoneSupported);

  const stopHardware = useCallback(() => {
    listeningRef.current = false;
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      try {
        recognitionRef.current.abort();
      } catch {
        // Recognition object may already be idle
      }
      recognitionRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsListening(false);
    setSpeechTranscript('');
  }, []);

  useEffect(() => () => {
    stopHardware();
    if (cueTimerRef.current !== null) window.clearTimeout(cueTimerRef.current);
    if (playbackTimerRef.current !== null) window.clearTimeout(playbackTimerRef.current);
    if (timeIntervalRef.current !== null) window.clearInterval(timeIntervalRef.current);
  }, [stopHardware]);

  useEffect(() => {
    const handlePopState = () => {
      const target = signalFromPath();
      setActiveTarget(target);
      if (target) {
        setIsPaused(true);
        setIsPlaying(false);
        const dur = target.kind === 'sentence'
          ? calculateSentenceDuration(target.sentence.words)
          : signalDuration(target.key);
        setCurrentTime(dur);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronized audio playback for single words or sequential conversational sentences
  const playTarget = useCallback(async (target: ActiveTarget) => {
    if (isPlayingRef.current) return;

    const AudioContextConstructor = getAudioContextConstructor();
    if (!AudioContextConstructor) return;
    const context = audioContextRef.current ?? new AudioContextConstructor();
    audioContextRef.current = context;
    if (context.state === 'suspended') {
      await context.resume();
    }

    if (playbackTimerRef.current !== null) {
      window.clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    if (timeIntervalRef.current !== null) {
      window.clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }

    if (!analyserRef.current) {
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.45;
      analyserRef.current = analyser;
    }

    const words: SignalKey[] = target.kind === 'sentence' ? target.sentence.words : [target.key];
    const rawDuration = target.kind === 'sentence'
      ? calculateSentenceDuration(words)
      : signalDuration(target.key);
    // Playing speed of spectrogram on 2nd page
    const duration = Math.max(0.75, rawDuration - 2.0);
    const timeScale = duration / rawDuration;
    const now = context.currentTime;

    const masterOutput = context.createGain();
    masterOutput.gain.setValueAtTime(MASTER_OUTPUT_GAIN, now);
    masterOutput.connect(analyserRef.current);
    analyserRef.current.connect(context.destination);

    // Schedule synthesized signal audio graph for each word sequentially
    let tOffset = 0;
    for (let i = 0; i < words.length; i += 1) {
      const wKey = words[i];
      createSignalGraph(context, wKey, masterOutput, now + tOffset);
      tOffset += (signalDuration(wKey) + SENTENCE_GAP) * timeScale;
    }

    // Smoothly close master output at the end of the sound
    masterOutput.gain.setValueAtTime(MASTER_OUTPUT_GAIN, now + duration - 0.02);
    masterOutput.gain.linearRampToValueAtTime(0, now + duration);

    // Audio & Video in simultaneous motion
    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentTime(0);

    const startTime = performance.now();

    timeIntervalRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed < duration) {
        setCurrentTime(elapsed);
      } else {
        setCurrentTime(duration);
      }
    }, 16);

    // When phrase completes, both audio and video pause into stagnant flatline!
    // The audio DOES NOT replay itself.
    playbackTimerRef.current = window.setTimeout(() => {
      if (timeIntervalRef.current !== null) {
        window.clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsPaused(true);
      setCurrentTime(duration);
    }, duration * 1000);
  }, []);

  const registerTarget = useCallback((target: ActiveTarget) => {
    const now = Date.now();
    // Prevent mic pickup of speaker output from looping or replaying audio
    if (isPlayingRef.current || now - lastSpeechTriggerRef.current < 2200) {
      return;
    }
    lastSpeechTriggerRef.current = now;

    const cueKey: SignalKey = target.kind === 'sentence' ? target.sentence.words[0] : target.key;
    const soundLabel = target.kind === 'sentence'
      ? target.sentence.description
      : signalByKey(target.key).sound;
    const cue: Cue = {
      key: cueKey,
      sound: soundLabel,
      time: formatTime(),
    };

    setLatestCue(cue);
    setLog((current) => [{ ...cue, id: Date.now() }, ...current].slice(0, 8));
    setCueActive(true);
    if (cueTimerRef.current !== null) window.clearTimeout(cueTimerRef.current);
    cueTimerRef.current = window.setTimeout(() => setCueActive(false), 2200);

    setActiveTarget(target);
    if (typeof window !== 'undefined') {
      const path = target.kind === 'sentence'
        ? `/sentence/${target.sentence.id}`
        : `/signal/${target.key}`;
      window.history.replaceState({ target }, '', path);
    }

    // Play audio and spectrogram video simultaneously
    void playTarget(target);
  }, [playTarget]);

  const returnToReceiver = useCallback(() => {
    if (playbackTimerRef.current !== null) {
      window.clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    if (timeIntervalRef.current !== null) {
      window.clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
    setActiveTarget(null);
    setLatestCue(null);
    setCueActive(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/artefact');
    }
  }, []);

  const exportTargetAudio = useCallback(async (target: ActiveTarget) => {
    try {
      setIsExporting(true);
      const buffer = target.kind === 'sentence'
        ? await renderSentenceAudioBuffer(target.sentence.words)
        : await renderSignalAudioBuffer(target.key);
      const wav = audioBufferToWav(buffer);
      const blob = new Blob([wav.buffer as ArrayBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      const fileName = target.kind === 'sentence'
        ? `Ec-ak-ou_${target.sentence.id}.wav`
        : `Ec-ak-ou_${target.key}.wav`;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      // Export fallback
    } finally {
      setIsExporting(false);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!browserSupported || !speechConstructor) {
      setError('This browser does not provide the microphone, speech recognition, or audio tools this prototype needs.');
      return;
    }
    setError(null);
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextConstructor = getAudioContextConstructor();
      if (!AudioContextConstructor) throw new Error('audio-unsupported');
      audioContextRef.current = audioContextRef.current ?? new AudioContextConstructor();
      await audioContextRef.current.resume();
      const recognition = new speechConstructor();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        // While audio is actively playing, ignore recognition to prevent speaker feedback loop
        if (isPlayingRef.current) return;

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          if (!result.isFinal) continue;
          const transcript = result[0]?.transcript.trim().toLowerCase() ?? '';
          if (!transcript) continue;

          const cleanedText = transcript.replace(/[^a-z0-9\s]/g, ' ').trim();
          const spokenWords: string[] = cleanedText.match(/[a-z]+/g) ?? [];
          if (spokenWords.length === 0) continue;

          // 1. Prioritize matching Conversational Sentences (Song phrase format)
          const matchedSentence = COMMON_SENTENCES.find((s) => {
            const cleanSentence = s.text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
            if (cleanedText === cleanSentence || cleanedText.endsWith(cleanSentence) || cleanedText.includes(cleanSentence)) return true;

            // Check if words match sequential subset
            let searchIdx = 0;
            for (const sw of spokenWords) {
              if (sw === s.words[searchIdx]) {
                searchIdx += 1;
                if (searchIdx === s.words.length) return true;
              }
            }
            return false;
          });

          if (matchedSentence) {
            registerTarget({ kind: 'sentence', sentence: matchedSentence });
            break;
          }

          // 2. Fallback to matching single vocabulary word
          const matchedSignal = SIGNALS.find((signal) => spokenWords.includes(signal.key));
          if (matchedSignal) {
            registerTarget({ kind: 'word', key: matchedSignal.key });
            break;
          }
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          stopHardware();
          setError('Microphone access was not granted. Allow microphone access in your browser settings, then try again.');
          return;
        }
        setError('The listening channel encountered an interruption. Press stop, then start again.');
      };

      recognition.onend = () => {
        if (!listeningRef.current) return;
        restartTimerRef.current = window.setTimeout(() => {
          try {
            recognition.start();
          } catch {
            // Recover transition
          }
        }, 120);
      };

      recognitionRef.current = recognition;
      listeningRef.current = true;
      setIsListening(true);
      recognition.start();
    } catch (caughtError) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const denied = caughtError instanceof DOMException && (caughtError.name === 'NotAllowedError' || caughtError.name === 'SecurityError');
      setError(denied
        ? 'Microphone access was not granted. Allow microphone access in your browser settings, then try again.'
        : 'The microphone could not be opened. Check that another application is not holding it, then try again.');
      setIsListening(false);
      listeningRef.current = false;
    }
  }, [browserSupported, registerTarget, speechConstructor, stopHardware]);

  const clearState = () => {
    returnToReceiver();
    setLog([]);
    setError(null);
    setSpeechTranscript('');
  };

  const currentDuration = activeTarget
    ? Math.max(
        0.75,
        (activeTarget.kind === 'sentence'
          ? calculateSentenceDuration(activeTarget.sentence.words)
          : signalDuration(activeTarget.key)) - 2.0
      )
    : 0;

  const statusText = isPlaying
    ? 'Spectrogram in motion'
    : isPaused
    ? 'Spectrogram paused'
    : isListening
    ? 'Channel active · Ready to receive audio cipher'
    : error
    ? 'Channel needs attention'
    : 'Microphone idle · Ready to receive audio cipher';

  return (
    <div className="nc-shell nc-shell--artefact">
      <SiteHeader currentPage="artefact" onNavigate={onNavigate} />

      <main className="nc-main nc-main--artefact nc-main--fullpage" id="main-content">
        <div className="nc-artefact-fullpage-wrapper">
          {/* Top navigation bar with back to concept and generator header */}
          <div className="nc-artefact-topbar">
            <button
              type="button"
              className="nc-back-button"
              onClick={() => onNavigate?.('concept')}
              aria-label="Back to concept brief"
              data-testid="button-back-to-concept"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              <span>Concept Note & Brief</span>
            </button>
            <div className="nc-topbar-center-meta">
              <span className="nc-topbar-dot" />
              <span>INTERACTIVE SPECTROGRAM GENERATOR</span>
            </div>
            <div className="nc-topbar-right-meta">
              <span>ZERO SURVEILLANCE · 44.1 kHz ACOUSTIC CIPHER</span>
            </div>
          </div>

          {/* Full-Page Spectrogram Generator Workspace */}
          <div className="nc-artefact-full-workspace">
            <section className="nc-console nc-console--solo nc-console--fullscreen" aria-label="Communication console">
              <div className="nc-listening-panel">
                <div className="nc-panel-top">
                  <span className="nc-kicker">
                    Primary receiver / 01
                  </span>
                  <button
                    type="button"
                    className={`nc-status-pill ${isListening ? 'is-listening' : ''}`}
                    style={{ borderRadius: 9999 }}
                    onClick={isListening ? stopHardware : startListening}
                    title={isListening ? 'Channel active (click to standby)' : 'Standby (click to start listening)'}
                    aria-label={isListening ? 'Channel active · Switch to Standby' : 'Standby · Start listening'}
                    data-testid="status-microphone"
                  >
                    <span className="nc-pulse" aria-hidden="true" />
                    {isListening ? 'Live' : 'Standby'}
                  </button>
                </div>

                {activeTarget ? (
                  /* Full-width video format of the spectrogram */
                  <SpectrogramVideo
                    target={activeTarget}
                    isPlaying={isPlaying}
                    isPaused={isPaused}
                    currentTime={currentTime}
                    duration={currentDuration}
                    analyserNode={analyserRef.current}
                    onReplay={() => void playTarget(activeTarget)}
                    onClose={returnToReceiver}
                    onExport={() => void exportTargetAudio(activeTarget)}
                    isExporting={isExporting}
                    onSelectWord={(key) => registerTarget({ kind: 'word', key })}
                    onSelectSentence={(sentence) => registerTarget({ kind: 'sentence', sentence })}
                  />
                ) : (
                  <>
                    <div className={`nc-orbit ${isListening ? 'is-active' : ''}`}>
                      <div className={`nc-core ${isListening ? 'is-active' : ''} ${cueActive ? 'is-cue' : ''}`}>
                        <div className="nc-core-label" aria-live="polite" data-testid="status-listening">
                          <strong>{isListening ? 'Listening' : latestCue ? 'Signal ready' : 'At rest'}</strong>
                          <span>{isListening ? 'acoustic cipher receptor' : 'channel standby'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="nc-meter" aria-hidden="true"><span className={isListening ? 'is-active' : ''} /></div>
                  </>
                )}

                <div className="nc-panel-bottom" style={{ marginTop: 24 }}>
                  <span><strong>{statusText}</strong></span>
                  <div className={`nc-cta-row ${isListening ? 'is-live' : ''}`}>
                    <button
                      type="button"
                      style={{ borderRadius: 9999 }}
                      className={
                        isListening
                          ? 'nc-button stop'
                          : 'nc-flux-pill-btn highlighted-hero nc-start-listening-btn'
                      }
                      onClick={isListening ? stopHardware : startListening}
                      disabled={!browserSupported && !isListening}
                      aria-label={isListening ? 'Stop listening' : 'Start listening and grant microphone access'}
                      data-testid={isListening ? 'button-stop-listening' : 'button-start-listening'}
                    >
                      {!isListening && <span className="nc-hero-btn-glow" aria-hidden="true" />}
                      {isListening ? (
                        <>
                          <Square size={13} aria-hidden="true" fill="currentColor" />
                          <span>STOP LISTENING</span>
                        </>
                      ) : (
                        <>
                          <Mic size={16} aria-hidden="true" />
                          <span>START LISTENING</span>
                        </>
                      )}
                    </button>
                    <button type="button" className="nc-button" style={{ borderRadius: 9999 }} onClick={clearState} aria-label="Clear latest signal and event log" data-testid="button-clear-state">
                      <RotateCcw size={14} aria-hidden="true" /> Clear
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div className="nc-notice" role="alert" data-testid="status-error">
                <strong>{browserSupported ? 'Microphone channel' : 'Browser compatibility'}</strong>
                {error}
              </div>
            )}

            <section className="nc-footer" aria-label="Prototype notes">
              <span><CircleHelp size={13} aria-hidden="true" style={{ verticalAlign: 'text-bottom', marginRight: 7 }} />Use headphones for a more precise read of quieter harmonic swells and measure transitions.</span>
              <span>Speech recognition is used only while live. <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API" target="_blank" rel="noreferrer">About the browser layer</a></span>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function getInitialPage(): AppPage {
  if (typeof window === 'undefined') return 'concept';
  const path = window.location.pathname;
  if (path.startsWith('/artefact') || path.startsWith('/signal/') || path.startsWith('/sentence/')) {
    return 'artefact';
  }
  return 'concept';
}

function Router() {
  const [page, setPage] = useState<AppPage>(getInitialPage);

  useEffect(() => {
    const handlePop = () => {
      setPage(getInitialPage());
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const handleNavigate = (newPage: AppPage) => {
    setPage(newPage);
    if (typeof window !== 'undefined') {
      if (newPage === 'concept') {
        window.history.pushState({ page: 'concept' }, '', '/');
      } else {
        window.history.pushState({ page: 'artefact' }, '', '/artefact');
      }
    }
  };

  if (page === 'concept') {
    return (
      <div className="nc-shell nc-shell--concept">
        <SiteHeader currentPage="concept" onNavigate={handleNavigate} />
        <main className="nc-main nc-main--concept">
          <ConceptPage onTryArtefact={() => handleNavigate('artefact')} />
        </main>
      </div>
    );
  }

  return <Home onNavigate={handleNavigate} />;
}

function App() {
  return <Router />;
}

export default App;