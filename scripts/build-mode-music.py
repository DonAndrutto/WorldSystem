"""Render the scores for the other five modes, each an original seamless loop.

Game keeps Still Waters (build-soundtrack.py). Here every other mode gets a
piece of its own, built from the idea of the mode and not from a sample:

  explore    Far Horizons          F lydian plucks and breath over a wide pad
  mandala    Thirty-Seven Offerings  one bowl stroke for each offering, round the four doors
  wheel      The Turning           a six-beat cycle that turns through six roots
  worlds     Thousandfold          one world, a thousand, a million, a billion
  astrology  Twenty-Eight Mansions twenty-eight glass notes tracing the moon's path

Requires Python + numpy and ffmpeg. No samples, external audio or services.
Run from anywhere: python scripts/build-mode-music.py [name ...]
"""
from pathlib import Path
import subprocess
import sys
import tempfile
import wave
import numpy as np

RATE = 24000
ROOT = Path(__file__).resolve().parent.parent


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


class Score:
    """A stereo loop. Everything placed near the end wraps round to the start,
    so tails and the room carry through the seam instead of being cut."""

    def __init__(self, seconds):
        self.seconds = seconds
        self.frames = round(seconds * RATE)
        self.buf = np.zeros((self.frames, 2))

    def add(self, at, sound, gain=1.0, pan=0.0):
        stereo = sound[:, None] * gain * np.array([
            np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)])
        start = round(at * RATE) % self.frames
        count = min(len(sound), self.frames - start)
        self.buf[start:start + count] += stereo[:count]
        if count < len(sound):
            rest = stereo[count:]
            while len(rest):               # a sound longer than the loop keeps wrapping
                take = min(len(rest), self.frames)
                self.buf[:take] += rest[:take]
                rest = rest[take:]

    def drone(self, midi, gain, partials=((1, 1.0),), pan=0.0):
        """A held tone whose period divides the loop, so it is continuous at the seam."""
        t = np.arange(self.frames) / RATE
        f = round(hz(midi) * self.seconds) / self.seconds
        sound = sum(g * np.sin(2 * np.pi * f * k * t) for k, g in partials)
        self.add(0, sound, gain, pan)

    def room(self, taps=((.19, .12), (.37, .10), (.61, .08), (.89, .06),
                         (1.27, .045), (1.73, .035), (2.31, .025), (3.1, .018))):
        dry = self.buf.copy()
        for seconds, gain in taps:
            self.buf += np.roll(dry[:, ::-1], round(seconds * RATE), axis=0) * gain

    def finish(self, mean_db=-19.5, peak=.55):
        self.buf -= np.mean(self.buf, axis=0)
        rms = np.sqrt(np.mean(self.buf ** 2))
        self.buf *= 10 ** (mean_db / 20) / rms * 1.0
        top = np.max(np.abs(self.buf))
        if top > peak:                     # soft ceiling rather than a hard clip
            self.buf = np.tanh(self.buf / peak * 1.1) * peak / np.tanh(1.1)
        return self.buf


# ── instruments ─────────────────────────────────────────────────────────

def times(seconds):
    return np.arange(round(seconds * RATE)) / RATE


def pad(note, seconds, attack=4, release=5, shimmer=.0007):
    t = times(seconds)
    envelope = np.minimum(1, t / attack) ** 2 * np.minimum(1, (seconds - t) / release) ** 2
    f = hz(note)
    tone = np.sin(2 * np.pi * f * t)
    tone += .19 * np.sin(2 * np.pi * f * 2 * t + .2)
    tone += .06 * np.sin(2 * np.pi * f * 3 * t + .4)
    tone += .15 * np.sin(2 * np.pi * f * (1 + shimmer) * t)
    return tone * envelope * (.95 + .05 * np.sin(2 * np.pi * .13 * t))


def pluck(note, seconds=5, bright=1.0):
    """A plucked string: upper partials die first, as on a harp."""
    t = times(seconds)
    f = hz(note)
    sound = np.zeros_like(t)
    for k in range(1, 9):
        decay = 2.4 / (1 + (k - 1) * .85 * bright)
        sound += (1 / k ** 1.25) * np.sin(2 * np.pi * f * k * 1.0002 ** (k * k) * t) * np.exp(-t / decay)
    attack = np.minimum(1, t / .004)
    release = np.minimum(1, (seconds - t) / .6)
    return sound * attack * release


def bowl(note, seconds=14, decay=5.5):
    """A singing bowl: inharmonic partials with a slow beat inside each."""
    t = times(seconds)
    f = hz(note)
    sound = np.zeros_like(t)
    for ratio, gain, tau, beat in [(1, 1, decay, .6), (2.71, .34, decay * .62, 1.1),
                                   (5.15, .12, decay * .38, 1.7), (8.3, .04, decay * .22, 2.3)]:
        a = np.sin(2 * np.pi * f * ratio * t)
        b = np.sin(2 * np.pi * (f * ratio + beat) * t + 1.3)
        sound += gain * (a + .5 * b) * np.exp(-t / tau)
    return sound * np.minimum(1, t / .012) * np.minimum(1, (seconds - t) / 2) ** 2


def glass(note, seconds=9, decay=3.2):
    """A music-box or celesta note: a clear fundamental over a bright, brief ring."""
    t = times(seconds)
    f = hz(note)
    sound = np.sin(2 * np.pi * f * t) * np.exp(-t / decay)
    sound += .35 * np.sin(2 * np.pi * f * 4.0 * t + .5) * np.exp(-t / (decay * .3))
    sound += .16 * np.sin(2 * np.pi * f * 6.3 * t + 1.1) * np.exp(-t / (decay * .14))
    return sound * np.minimum(1, t / .003) * np.minimum(1, (seconds - t) / 1.5) ** 2


def breath(seconds, centre, width, rng, swell=.5):
    """Filtered noise with a slow rise and fall: air moving over a wide place."""
    n = round(seconds * RATE)
    spectrum = np.fft.rfft(rng.standard_normal(n))
    freqs = np.fft.rfftfreq(n, 1 / RATE)
    spectrum *= np.exp(-.5 * ((freqs - centre) / width) ** 2)
    noise = np.fft.irfft(spectrum, n)
    noise /= np.max(np.abs(noise)) + 1e-9
    t = np.arange(n) / n
    return noise * np.sin(np.pi * t) ** (1 / swell + 1)


def skin(freq, seconds=1.6, rng=None):
    """A soft frame drum: a pitch that drops on the strike, and a little felt."""
    t = times(seconds)
    sweep = freq * (1 + 1.4 * np.exp(-t / .03))
    phase = 2 * np.pi * np.cumsum(sweep) / RATE
    sound = np.sin(phase) * np.exp(-t / .28)
    sound += .18 * np.sin(phase * 2.31) * np.exp(-t / .09)
    if rng is not None:
        click = rng.standard_normal(len(t)) * np.exp(-t / .006)
        sound += .08 * click
    return sound * np.minimum(1, (seconds - t) / .3)


def reed(note, seconds, rng, vibrato=.0035):
    """A low reed or bowed tone: a few odd harmonics, a slow breath of vibrato."""
    t = times(seconds)
    f = hz(note)
    phase = 2 * np.pi * f * t + vibrato * f / 5 * np.sin(2 * np.pi * 4.6 * t) / (2 * np.pi) * 40
    sound = np.sin(phase) + .32 * np.sin(3 * phase + .3) + .12 * np.sin(5 * phase + .9)
    envelope = np.minimum(1, t / 1.2) ** 2 * np.minimum(1, (seconds - t) / 1.8) ** 2
    return sound * envelope


def sparkle(freq, seconds=3.5, decay=1.2):
    t = times(seconds)
    sound = np.sin(2 * np.pi * freq * t) * np.exp(-t / decay)
    sound += .25 * np.sin(2 * np.pi * freq * 2.005 * t) * np.exp(-t / (decay * .5))
    return sound * np.minimum(1, t / .004) * np.minimum(1, (seconds - t) / .8) ** 2


# ── the five scores ─────────────────────────────────────────────────────

def far_horizons():
    """Explorer. Sixty beats a minute; six chords of sixteen seconds. F lydian,
    the mode with the raised fourth that always seems to lean toward distance."""
    score, rng = Score(96), np.random.default_rng(11)
    chords = [(41, 48, 57, 64, 67), (38, 50, 57, 65, 69), (46, 53, 57, 64, 69),
              (36, 48, 55, 62, 67), (45, 52, 60, 64, 67), (46, 53, 60, 64, 69)]
    for bar, chord in enumerate(chords):
        for voice, note in enumerate(chord):
            score.add(bar * 16 - 3, pad(note, 22, 4, 6), .020 if voice == 0 else .013,
                      [-.25, .2, -.4, .38, -.1][voice])
    # a harp, wandering up and down each chord on the half-second
    shape = [0, 2, 3, 4, 3, 2, 4, 3, 2, 1, 3, 4, 2, 3, 1, 0]
    for bar, chord in enumerate(chords):
        notes = [n + 12 for n in chord[1:]] + [chord[2] + 24]
        for step in range(32):
            if rng.random() < .22:
                continue
            index = shape[step % 16] % len(notes)
            note = notes[index] + (12 if step % 16 == 7 else 0)
            score.add(bar * 16 + step * .5 + .75, pluck(note, 5), .021 * (.55 + .45 * rng.random()),
                      np.sin(step * .7 + bar) * .5)
    # sky: slow breaths that cross the stereo field
    for i in range(6):
        score.add(i * 16 + 3, breath(11, 900 + 220 * (i % 3), 420, rng), .022, [-.5, .5][i % 2])
    for note, gain in [(29, .007), (41, .006)]:
        score.drone(note, gain, ((1, 1), (2, .18)))
    score.room()
    return score.finish()


def thirty_seven_offerings():
    """Mandala. A drone, and thirty-seven bowl strokes dealt round the four doors
    of the palace, east, south, west and north, in a five-note scale that turns."""
    score, rng = Score(96), np.random.default_rng(37)
    root = 36                                  # C2
    scale = [0, 3, 5, 7, 10]                   # C Eb F G Bb
    score.drone(root, .020, ((1, 1), (2, .5), (3, .22), (4, .1)))
    score.drone(root + 7, .014, ((1, 1), (2, .3), (3, .1)), pan=.1)
    score.drone(root + 19, .006, ((1, 1), (2, .2)), pan=-.1)
    for i in range(37):
        degree = (i * 3) % 5
        octave = 48 + 12 * ((i // 5) % 3)
        note = octave + scale[degree]
        door = i % 4                           # E, S, W, N
        pan = [-.6, .0, .6, .0][door] if door in (0, 2) else (.28 if door == 1 else -.28)
        stroke = 6 + i * (96 - 12) / 37
        score.add(stroke, bowl(note, 15, 5.2 if i % 5 else 8), .036 if i % 5 else .05, pan)
        if i % 5 == 4:                         # every fifth stroke is answered below
            score.add(stroke + .35, bowl(root + 12 + scale[degree], 18, 9), .03, 0)
    # the long horn, twice, from far off
    for at in (14, 62):
        score.add(at, reed(root + 12, 20, rng, vibrato=.0012), .012, -.15)
        score.add(at + 1, reed(root + 19, 18, rng, vibrato=.0012), .007, .15)
    for i in range(4):
        score.add(i * 24 + 6, breath(14, 480, 190, rng, swell=.8), .020, [-.6, .6][i % 2])
    score.room(taps=((.23, .13), (.47, .11), (.71, .09), (1.09, .07), (1.61, .055),
                     (2.17, .04), (2.93, .03), (3.7, .02)))
    return score.finish()


def the_turning():
    """Wheel. Six beats to the cycle at eighty a minute, and six roots to the
    turn, each four cycles long. The drum falls on the one; the drone is plucked
    on three, as a tanpura is, and does not hurry."""
    beat = .75
    cycle = 6 * beat
    score, rng = Score(24 * cycle), np.random.default_rng(6)
    roots = [50, 48, 46, 45, 43, 45]           # D C Bb A G A: down the wheel and round
    modes = [[0, 2, 3, 7, 9], [0, 2, 3, 7, 8], [0, 2, 4, 7, 9],
             [0, 3, 5, 7, 8], [0, 2, 3, 5, 7], [0, 3, 5, 7, 10]]
    for section, root in enumerate(roots):
        start = section * 4 * cycle
        score.add(start - 1.6, pad(root, 4 * cycle + 4, 3, 3.5), .024, -.2)
        score.add(start - 1.6, pad(root + 7, 4 * cycle + 4, 3, 3.5), .015, .24)
        score.add(start - 1.6, pad(root + 12 + modes[section][2], 4 * cycle + 4, 3.5, 4), .010, -.4)
        for c in range(4):
            origin = start + c * cycle
            # drum: the one is heavy, the four is a breath, the rest a soft tick
            score.add(origin + .03, skin(root - 12, 1.6, rng), .05, 0)
            score.add(origin + 3 * beat + .03, skin(root + 3, 1.2, rng), .026, .2)
            for tick in (1.5, 2, 4.5, 5):
                score.add(origin + tick * beat + .03, skin(root + 19, .5, rng), .008,
                          -.4 if tick < 3 else .4)
            # the drone, plucked on 0, 1, 2 and 3.5
            for k, (at, interval) in enumerate([(0, 7), (1, 12), (2, 12), (3.5, 0)]):
                score.add(origin + at * beat + .02, pluck(root + interval, 6, .6),
                          .020 - .002 * k, [-.15, .15, -.15, .15][k])
            # a reed phrase on the second and fourth turns
            if c % 2 == 1:
                steps = modes[section]
                phrase = [steps[(c + i * 2 + section) % 5] for i in range(3)]
                for i, step in enumerate(phrase):
                    score.add(origin + (.5 + i * 2.0) * beat,
                              reed(root + 12 + step, 1.9 * beat * 1.6, rng), .020, .1 * (i - 1))
    score.room(taps=((.17, .10), (.31, .09), (.53, .075), (.83, .06),
                     (1.21, .045), (1.67, .035), (2.3, .025)))
    return score.finish()


def thousandfold():
    """Worlds. Four orders in 112 seconds: the sparkle of stars is sparse for one
    world, thicker for a thousand, a million, a billion, and then thins again
    through the seam. The pad leans on a lydian stack and never resolves."""
    score, rng = Score(112), np.random.default_rng(1000)
    chords = [(40, 47, 54, 58, 64, 71), (37, 44, 51, 56, 63, 68),
              (45, 52, 56, 61, 68, 71), (35, 47, 54, 59, 63, 66)]
    for bar, chord in enumerate(chords):
        for voice, note in enumerate(chord):
            score.add(bar * 28 - 6, pad(note, 40, 8, 10, shimmer=.0011 * (voice + 1)),
                      .020 if voice < 2 else .012, [-.5, .5, -.2, .25, -.65, .6][voice])
    scale = [64, 66, 68, 70, 71, 73, 75, 76, 78, 80, 82, 83, 85, 87, 88, 90]
    t = 0.0
    while t < 112:
        density = .35 + 4.2 * np.sin(np.pi * t / 112) ** 2   # stars per second
        note = scale[rng.integers(len(scale))] + (12 if rng.random() < .35 else 0)
        score.add(t, sparkle(hz(note), 4, .8 + 1.2 * rng.random()),
                  .011 * (.4 + .6 * rng.random()), rng.uniform(-.9, .9))
        t += rng.exponential(1 / density)
    for i in range(4):
        score.add(i * 28 + 4, breath(24, 190 + 60 * i, 90, rng, swell=.7), .034, [-.5, .5][i % 2])
    score.drone(28, .020, ((1, 1), (2, .4), (3, .12)))
    score.drone(35, .010, ((1, 1), (2, .25)), pan=.15)
    score.drone(47, .005, ((1, 1),), pan=-.15)
    score.room(taps=((.27, .13), (.51, .11), (.83, .095), (1.31, .075), (1.93, .06),
                     (2.71, .045), (3.7, .035), (4.9, .025), (6.2, .018)))
    return score.finish()


def twenty_eight_mansions():
    """Astrology. Twenty-eight glass notes, one every four seconds, one for each
    mansion; their pitches rise and fall like the moon crossing the sky once
    round the loop. The scale is A dorian, and the pad holds only fifths."""
    score, rng = Score(112), np.random.default_rng(28)
    scale = [57, 59, 60, 62, 64, 66, 67, 69, 71, 72, 74, 76, 78, 79]   # A dorian, two octaves
    for i in range(28):
        arc = np.sin(2 * np.pi * (i + .5) / 28 - np.pi / 2) * .5 + .5   # new moon, full, new
        index = int(round(arc * 8)) + 1 + (i % 3 == 2) * 2
        note = scale[min(index, len(scale) - 1)]
        at = i * 4 + .5
        score.add(at, glass(note, 10, 3.4), .042, np.sin(i * 1.3) * .55)
        score.add(at + 1.5, glass(note + 7, 8, 2.1), .016, -np.sin(i * 1.3) * .55)   # the echo, a fifth up
        if i % 7 == 6:
            score.add(at - .2, bowl(45, 20, 8), .036, 0)                            # each quarter, a bell
    for bar, chord in enumerate([(45, 52, 59), (43, 50, 57), (41, 48, 55), (43, 50, 57)]):
        for voice, note in enumerate(chord):
            score.add(bar * 28 - 5, pad(note, 38, 8, 10), .020 if voice == 0 else .013, [-.3, .3, 0][voice])
    for i in range(7):
        score.add(i * 16 + 2, breath(10, 3600, 800, rng, swell=.6), .007, [-.7, .7][i % 2])
    score.drone(33, .014, ((1, 1), (2, .35), (3, .1)))
    t = np.arange(score.frames) / RATE
    tremolo = .75 + .25 * np.sin(2 * np.pi * 7 / 112 * t)
    f = round(hz(57) * 112) / 112
    score.add(0, np.sin(2 * np.pi * f * t) * tremolo, .006)
    score.room(taps=((.21, .12), (.43, .10), (.77, .085), (1.19, .065), (1.7, .05),
                     (2.4, .038), (3.3, .028), (4.4, .02)))
    return score.finish()


TRACKS = {
    'explore': ('far-horizons', 'Far Horizons', far_horizons),
    'mandala': ('thirty-seven-offerings', 'Thirty-Seven Offerings', thirty_seven_offerings),
    'wheel': ('the-turning', 'The Turning', the_turning),
    'worlds': ('thousandfold', 'Thousandfold', thousandfold),
    'astrology': ('twenty-eight-mansions', 'Twenty-Eight Mansions', twenty_eight_mansions),
}


def render(mode):
    slug, title, compose = TRACKS[mode]
    score = compose()
    destination = ROOT / 'assets' / 'audio' / (slug + '.mp3')
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='worldsystem-score-') as folder:
        wav = Path(folder) / (slug + '.wav')
        with wave.open(str(wav), 'wb') as output:
            output.setnchannels(2)
            output.setsampwidth(2)
            output.setframerate(RATE)
            output.writeframes((np.clip(score, -1, 1) * 32767).astype('<i2').tobytes())
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
                        '-i', str(wav), '-c:a', 'libmp3lame', '-b:a', '80k',
                        '-metadata', 'title=' + title, '-metadata',
                        'comment=Original procedural composition for World System; no samples.',
                        str(destination)], check=True)
    rms = float(np.sqrt(np.mean(score ** 2)))
    print(f'{destination.name}: {len(score) / RATE:.0f}s, stereo, {destination.stat().st_size:,} bytes; '
          f'RMS {20 * np.log10(rms):.1f} dBFS; peak {np.max(np.abs(score)):.2f}; '
          f'seam delta {np.max(np.abs(score[-1] - score[0])):.5f}')


def main():
    wanted = sys.argv[1:] or list(TRACKS)
    for mode in wanted:
        render(mode)


if __name__ == '__main__':
    main()
