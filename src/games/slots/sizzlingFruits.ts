import type { SlotConfig } from "./types";

// Symbols
//  C = Cherry, L = Lemon, O = Orange, P = Plum, W = Watermelon, G = Grapes
//  S = Star (scatter), 7 = Seven (top)
export const FRUIT_SYMBOLS = ["C", "L", "O", "P", "W", "G", "S", "7"] as const;

export const FRUIT_SYMBOL_INFO: Record<
  string,
  { label: string; emoji: string; color: string; isScatter?: boolean }
> = {
  C: { label: "Cherry", emoji: "🍒", color: "#FF3B6B" },
  L: { label: "Lemon", emoji: "🍋", color: "#FFE15A" },
  O: { label: "Orange", emoji: "🍊", color: "#FF9B3D" },
  P: { label: "Plum", emoji: "🍑", color: "#C26BFF" },
  W: { label: "Watermelon", emoji: "🍉", color: "#00E676" },
  G: { label: "Grapes", emoji: "🍇", color: "#9B7CFF" },
  S: { label: "Star", emoji: "⭐", color: "#FFC842", isScatter: true },
  "7": { label: "Lucky 7", emoji: "7️⃣", color: "#FFC842" },
};

// Weighted reel strips, 30+ positions each. Tuned roughly for ~95% RTP.
function buildStrip(weights: Record<string, number>): string[] {
  const strip: string[] = [];
  for (const [sym, count] of Object.entries(weights)) {
    for (let i = 0; i < count; i++) strip.push(sym);
  }
  // simple shuffle
  for (let i = strip.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [strip[i], strip[j]] = [strip[j], strip[i]];
  }
  return strip;
}

export const FRUIT_REELS: string[][] = [
  buildStrip({ C: 5, L: 6, O: 5, P: 5, W: 4, G: 4, "7": 1, S: 2 }),
  buildStrip({ C: 5, L: 5, O: 5, P: 5, W: 4, G: 4, "7": 1, S: 2 }),
  buildStrip({ C: 5, L: 5, O: 5, P: 5, W: 4, G: 4, "7": 1, S: 2 }),
  buildStrip({ C: 5, L: 5, O: 5, P: 5, W: 4, G: 4, "7": 1, S: 2 }),
  buildStrip({ C: 5, L: 5, O: 6, P: 6, W: 4, G: 4, "7": 1, S: 2 }),
];

// 5 fixed paylines (rows are 0=top, 1=middle, 2=bottom)
export const FRUIT_PAYLINES = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
];

export const FRUIT_PAYTABLE = {
  "7": { 3: 50, 4: 200, 5: 1000 },
  W: { 3: 20, 4: 50, 5: 200 },
  G: { 3: 20, 4: 50, 5: 200 },
  O: { 3: 10, 4: 30, 5: 100 },
  P: { 3: 10, 4: 30, 5: 100 },
  L: { 3: 10, 4: 30, 5: 100 },
  C: { 2: 5, 3: 10, 4: 30, 5: 100 },
} as const;

export const sizzlingFruitsConfig: SlotConfig = {
  reels: FRUIT_REELS,
  paylines: FRUIT_PAYLINES,
  paytable: FRUIT_PAYTABLE as unknown as SlotConfig["paytable"],
  scatterSymbol: "S",
  scatterPaytable: { 3: 10, 4: 20, 5: 100 },
};
