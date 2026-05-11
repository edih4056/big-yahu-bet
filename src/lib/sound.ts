import { Howl } from "howler";
import { useWalletStore } from "@/store/walletStore";

// Demo synth: tiny beeps generated as data URIs so the app works without
// shipping any audio assets. Each entry is a base64-encoded 8-bit PCM WAV.
function tone(freq: number, durMs: number, volume = 0.4): string {
  const sampleRate = 11025;
  const samples = Math.floor((sampleRate * durMs) / 1000);
  const data = new Uint8Array(44 + samples);
  // RIFF header
  const writeStr = (off: number, str: string) => {
    for (let i = 0; i < str.length; i++) data[off + i] = str.charCodeAt(i);
  };
  const writeU32 = (off: number, v: number) => {
    data[off] = v & 0xff;
    data[off + 1] = (v >> 8) & 0xff;
    data[off + 2] = (v >> 16) & 0xff;
    data[off + 3] = (v >> 24) & 0xff;
  };
  const writeU16 = (off: number, v: number) => {
    data[off] = v & 0xff;
    data[off + 1] = (v >> 8) & 0xff;
  };
  writeStr(0, "RIFF");
  writeU32(4, 36 + samples);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  writeU32(16, 16);
  writeU16(20, 1); // PCM
  writeU16(22, 1); // mono
  writeU32(24, sampleRate);
  writeU32(28, sampleRate);
  writeU16(32, 1);
  writeU16(34, 8);
  writeStr(36, "data");
  writeU32(40, samples);
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    // simple decay envelope
    const env = Math.max(0, 1 - t / (durMs / 1000));
    const v = Math.sin(2 * Math.PI * freq * t) * env * volume;
    data[44 + i] = Math.round(128 + v * 127);
  }
  let bin = "";
  for (let i = 0; i < data.length; i++) bin += String.fromCharCode(data[i]);
  return "data:audio/wav;base64," + btoa(bin);
}

const cache: Record<string, Howl> = {};

function snd(key: string, src: string, vol = 0.5): Howl {
  if (!cache[key]) cache[key] = new Howl({ src: [src], volume: vol });
  return cache[key];
}

export const SFX = {
  spin: () => snd("spin", tone(420, 320, 0.45), 0.3),
  reelStop: () => snd("reelStop", tone(280, 70, 0.5), 0.3),
  win: () => snd("win", tone(880, 320, 0.45), 0.4),
  bigWin: () => snd("bigWin", tone(1200, 600, 0.5), 0.4),
  cardDeal: () => snd("cardDeal", tone(520, 70, 0.4), 0.25),
  cardFlip: () => snd("cardFlip", tone(720, 80, 0.4), 0.25),
  chip: () => snd("chip", tone(1100, 60, 0.35), 0.2),
  lose: () => snd("lose", tone(180, 240, 0.35), 0.25),
  wheel: () => snd("wheel", tone(360, 1500, 0.3), 0.25),
  click: () => snd("click", tone(880, 40, 0.25), 0.2),
};

export function playSfx(key: keyof typeof SFX) {
  const enabled = useWalletStore.getState().soundEnabled;
  if (!enabled) return;
  try {
    SFX[key]().play();
  } catch {
    // ignore
  }
}
