export function trimAudioBuffer(
  context: BaseAudioContext,
  buffer: AudioBuffer,
  startSeconds: number,
  endSeconds: number,
): AudioBuffer {
  const startFrame = Math.max(0, Math.floor(startSeconds * buffer.sampleRate));
  const endFrame = Math.min(buffer.length, Math.ceil(endSeconds * buffer.sampleRate));
  const length = Math.max(1, endFrame - startFrame);
  const output = context.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    output.getChannelData(channel).set(buffer.getChannelData(channel).subarray(startFrame, endFrame));
  }
  return output;
}

export function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const bytesPerSample = 2;
  const dataLength = buffer.length * buffer.numberOfChannels * bytesPerSample;
  const output = new ArrayBuffer(44 + dataLength);
  const view = new DataView(output);
  let position = 0;

  function text(value: string) {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(position, value.charCodeAt(index));
      position += 1;
    }
  }
  function uint16(value: number) {
    view.setUint16(position, value, true);
    position += 2;
  }
  function uint32(value: number) {
    view.setUint32(position, value, true);
    position += 4;
  }

  text("RIFF");
  uint32(36 + dataLength);
  text("WAVE");
  text("fmt ");
  uint32(16);
  uint16(1);
  uint16(buffer.numberOfChannels);
  uint32(buffer.sampleRate);
  uint32(buffer.sampleRate * buffer.numberOfChannels * bytesPerSample);
  uint16(buffer.numberOfChannels * bytesPerSample);
  uint16(16);
  text("data");
  uint32(dataLength);

  for (let frame = 0; frame < buffer.length; frame += 1) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[frame] || 0));
      view.setInt16(position, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      position += 2;
    }
  }
  return output;
}

export function waveformSamples(buffer: AudioBuffer, count = 80): number[] {
  const channel = buffer.getChannelData(0);
  if (!channel.length) return [];
  const step = Math.max(1, Math.floor(channel.length / count));
  const values: number[] = [];
  for (let index = 0; index < count; index += 1) {
    let peak = 0;
    const start = index * step;
    for (let offset = 0; offset < step && start + offset < channel.length; offset += 1) {
      peak = Math.max(peak, Math.abs(channel[start + offset] || 0));
    }
    values.push(peak);
  }
  const max = Math.max(...values, 0.001);
  return values.map((value) => value / max);
}
