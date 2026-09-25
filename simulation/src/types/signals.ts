export type SignalKey =
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

export type Cue = {
  key: SignalKey;
  sound: string;
  time: string;
};

export type ConversationalSentence = {
  id: string;
  text: string;
  words: SignalKey[];
  description: string;
  category: 'Greeting' | 'Inquiry' | 'Safety' | 'Assistance';
};

export type ActiveTarget =
  | { kind: 'word'; key: SignalKey }
  | { kind: 'sentence'; sentence: ConversationalSentence };

export type LogEntry = Cue & { id: number };

export type RecognitionResultEvent = Event & {
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

export type RecognitionErrorEvent = Event & { error?: string };

export type Recognition = {
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

export type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
  webkitAudioContext?: typeof AudioContext;
};

export const COMMON_SENTENCES: ConversationalSentence[] = [
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

export const SIGNALS: Array<{
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

export const MASTER_OUTPUT_GAIN = 1.45;
export const NORMALIZED_PEAK = 0.42;
export const SENTENCE_GAP = 0.08;

export const signalByKey = (key: SignalKey) => SIGNALS.find((signal) => signal.key === key) ?? SIGNALS[0];
export const sentenceById = (id: string) => COMMON_SENTENCES.find((s) => s.id === id) ?? COMMON_SENTENCES[0];

export const signalDuration = (key: SignalKey): number => {
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

export const calculateSentenceDuration = (words: SignalKey[]): number => {
  if (words.length === 0) return 0;
  const wordSum = words.reduce((acc, w) => acc + signalDuration(w), 0);
  return wordSum + (words.length - 1) * SENTENCE_GAP;
};

export const signalFromPath = (): ActiveTarget | null => {
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
