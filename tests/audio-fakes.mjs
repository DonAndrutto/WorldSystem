/* A recording stand-in for the Web Audio API, enough for the synth and what is built on it. */
export function createFakeAudio() {
  const log = { oscillators: [], sources: [], gains: [], filters: [], resumes: 0 };
  class Param {
    constructor(value = 0) { this.value = value; this.calls = []; }
    setValueAtTime(v, t) { this.calls.push(['set', v, t]); this.value = v; }
    exponentialRampToValueAtTime(v, t) { this.calls.push(['ramp', v, t]); }
    setTargetAtTime(v, t, c) { this.calls.push(['target', v, t, c]); this.value = v; }
  }
  class Node { connect(next) { return next; } }
  class FakeContext {
    constructor() { FakeContext.opened += 1; this.currentTime = 0; this.state = 'suspended'; this.sampleRate = 8000; this.destination = new Node(); }
    resume() { log.resumes += 1; this.state = 'running'; return Promise.resolve(); }
    createGain() { const n = new Node(); n.gain = new Param(1); n.kind = 'gain'; log.gains.push(n); return n; }
    createOscillator() {
      const n = new Node(); n.frequency = new Param(440); n.detune = new Param(0); n.type = 'sine';
      n.start = (t) => { n.started = t; }; n.stop = (t) => { n.stopped = t; }; log.oscillators.push(n); return n;
    }
    createBufferSource() {
      const n = new Node(); n.start = (t, offset) => { n.started = t; n.offset = offset; }; n.stop = (t) => { n.stopped = t; };
      log.sources.push(n); return n;
    }
    createBiquadFilter() { const n = new Node(); n.frequency = new Param(350); n.Q = new Param(1); n.type = 'lowpass'; log.filters.push(n); return n; }
    createBuffer(channels, length) { return { length, getChannelData: () => new Float32Array(length) }; }
  }
  FakeContext.opened = 0;
  return { FakeContext, log };
}
