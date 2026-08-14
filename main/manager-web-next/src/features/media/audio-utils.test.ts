import { describe, expect, it } from "vitest";

import { audioBufferToWav, waveformSamples } from "@/features/media/audio-utils";

function fakeBuffer(samples: number[]): AudioBuffer {
  const data = Float32Array.from(samples);
  return {
    duration: data.length / 8_000,
    getChannelData: () => data,
    length: data.length,
    numberOfChannels: 1,
    sampleRate: 8_000,
  } as unknown as AudioBuffer;
}

describe("audio utilities", () => {
  it("encodes interleaved PCM with a valid WAV header", () => {
    const wav = audioBufferToWav(fakeBuffer([-1, -0.5, 0, 0.5, 1]));
    const bytes = new Uint8Array(wav);
    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("RIFF");
    expect(new TextDecoder().decode(bytes.slice(8, 12))).toBe("WAVE");
    expect(new DataView(wav).getUint32(40, true)).toBe(10);
    expect(wav.byteLength).toBe(54);
  });

  it("normalizes waveform peaks for a compact preview", () => {
    const samples = waveformSamples(fakeBuffer([0, 0.25, -0.5, 1]), 4);
    expect(samples).toEqual([0, 0.25, 0.5, 1]);
  });
});
