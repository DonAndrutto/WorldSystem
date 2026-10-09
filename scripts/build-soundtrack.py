"""Render Still Waters, an original seamless ambient score for game mode.

Requires Python + numpy and ffmpeg. No samples, external audio or services.
Run from anywhere: python scripts/build-soundtrack.py
"""
from pathlib import Path
import subprocess
import tempfile
import wave
import numpy as np

RATE = 24000
DURATION = 128
FRAMES = RATE * DURATION
ROOT = Path(__file__).resolve().parent.parent


def frequency(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def compose():
    score = np.zeros((FRAMES, 2), dtype=np.float64)

    def add(at, sound, gain, pan):
        # Circular placement preserves the tails at the loop boundary.
        stereo = sound[:, None] * gain * np.array([
            np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
        ])
        start = round(at * RATE) % FRAMES
        count = min(len(sound), FRAMES - start)
        score[start:start + count] += stereo[:count]
        if count < len(sound):
            score[:len(sound) - count] += stereo[count:]

    def pad(note, seconds):
        t = np.arange(round(seconds * RATE)) / RATE
        envelope = np.minimum(1, t / 4) ** 2
        envelope *= np.minimum(1, (seconds - t) / 5) ** 2
        f = frequency(note)
        tone = np.sin(2 * np.pi * f * t)
        tone += .19 * np.sin(2 * np.pi * f * 2 * t + .2)
        tone += .06 * np.sin(2 * np.pi * f * 3 * t + .4)
        tone += .15 * np.sin(2 * np.pi * f * 1.0007 * t)
        return tone * envelope * (.95 + .05 * np.sin(2 * np.pi * .13 * t))

    def bowl(note):
        t = np.arange(RATE * 12) / RATE
        attack = np.minimum(1, t / .085) ** 2
        release = np.minimum(1, (12 - t) / 2) ** 2
        sound = np.zeros_like(t)
        for partial, gain, decay in [(1, 1, 4.8), (2.002, .23, 3.1),
                                     (2.99, .09, 2.4), (4.07, .025, 1.6)]:
            sound += gain * np.sin(2 * np.pi * frequency(note) * partial * t) * np.exp(-t / decay)
        return sound * attack * release

    def flute(note, seconds):
        t = np.arange(round(seconds * RATE)) / RATE
        # A soft breath envelope, quiet upper partials and restrained vibrato.
        envelope = np.sin(np.pi * t / seconds) ** 1.8
        phase = 2 * np.pi * frequency(note) * t + .18 * np.sin(2 * np.pi * 4.2 * t)
        return (np.sin(phase) + .10 * np.sin(2 * phase) + .035 * np.sin(3 * phase)) * envelope

    # Eight slowly overlapping chords: Dadd9, G6, Bm7, Asus4, then a return.
    chords = [(50, 57, 64, 66), (43, 55, 57, 59), (47, 54, 57, 62),
              (45, 52, 59, 62), (50, 54, 57, 64), (43, 55, 59, 62),
              (40, 55, 59, 62), (45, 52, 57, 59)]
    for bar, chord in enumerate(chords):
        for voice, note in enumerate(chord):
            add(bar * 16 - 4, pad(note, 24), .026 if voice == 0 else .016,
                [-.30, .23, -.46, .40][voice])

    melody = [74, 76, 69, 78, 76, 71, 69, 74, 78, 76, 74, 71, 67, 71, 69, 74]
    for i, note in enumerate(melody):
        add(i * 8 + 4.5, flute(note, 6), .023, np.sin(i * .9) * .30)
    for i, note in enumerate([62, 69, 66, 64, 62, 71, 67, 69]):
        add(i * 16 + 1.2, bowl(note), .040, (-1 if i % 2 else 1) * .35)

    # Quantized periods make the held drone continuous at the seam.
    t = np.arange(FRAMES) / RATE
    for note, gain in [(38, .007), (57, .006)]:
        f = round(frequency(note) * DURATION) / DURATION
        drone = np.sin(2 * np.pi * f * t) * gain
        score[:, 0] += drone
        score[:, 1] += drone

    # A diffuse, circular stereo room: tails also pass through the loop seam.
    dry = score.copy()
    for seconds, gain in [(.19, .12), (.37, .10), (.61, .08), (.89, .06),
                          (1.27, .045), (1.73, .035), (2.31, .025)]:
        score += np.roll(dry[:, ::-1], round(seconds * RATE), axis=0) * gain
    score -= np.mean(score, axis=0)
    score *= .48 / np.max(np.abs(score))
    return score


def main():
    score = compose()
    destination = ROOT / 'assets' / 'audio' / 'still-waters.mp3'
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='worldsystem-score-') as folder:
        wav = Path(folder) / 'still-waters.wav'
        with wave.open(str(wav), 'wb') as output:
            output.setnchannels(2)
            output.setsampwidth(2)
            output.setframerate(RATE)
            output.writeframes((np.clip(score, -1, 1) * 32767).astype('<i2').tobytes())
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
                        '-i', str(wav), '-c:a', 'libmp3lame', '-b:a', '96k',
                        '-metadata', 'title=Still Waters', '-metadata',
                        'comment=Original procedural composition for World System; no samples.',
                        str(destination)], check=True)
    rms = float(np.sqrt(np.mean(score ** 2)))
    print(f'{destination.name}: {DURATION}s, stereo, {destination.stat().st_size:,} bytes; '
          f'RMS {20 * np.log10(rms):.1f} dBFS; seam delta {np.max(np.abs(score[-1] - score[0])):.5f}')


if __name__ == '__main__':
    main()
