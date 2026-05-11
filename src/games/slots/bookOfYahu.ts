import type { SlotConfig } from "./types";

// Symbols
//  Ph = Pharao, An = Anubis, Sk = Scarab, A, K, Q, J, T = 10
//  B = Book (Wild + Scatter)
export const YAHU_SYMBOLS = [
  "Ph",
  "An",
  "Sk",
  "A",
  "K",
  "Q",
  "J",
  "T",
  "B",
] as const;

export const YAHU_SYMBOL_INFO: Record<
  string,
  { label: string; emoji: string; color: string; isWild?: boolean }
> = {
  Ph: { label: "Pharao", emoji: "🦅", color: "#FFD978" },
  An: { label: "Anubis", emoji: "🐺", color: "#9B7CFF" },
  Sk: { label: "Scarab", emoji: "🪲", color: "#00E676" },
  A: { label: "A", emoji: "𝐀", color: "#FFC842" },
  K: { label: "K", emoji: "𝐊", color: "#FF8AD4" },
  Q: { label: "Q", emoji: "𝐐", color: "#7B61FF" },
  J: { label: "J", emoji: "𝐉", color: "#00BFFF" },
  T: { label: "10", emoji: "🔟", color: "#FF8A00" },
  B: { label: "Book", emoji: "📖", color: "#FFE27A", isWild: true },
};

function strip(weights: Record<string, number>): string[] {
  const out: string[] = [];
  for (const [sym, c] of Object.entries(weights)) {
    for (let i = 0; i < c; i++) out.push(sym);
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Base reels (for paid spins) — relatively few books
export const YAHU_REELS: string[][] = [
  strip({ Ph: 2, An: 3, Sk: 4, A: 5, K: 5, Q: 5, J: 5, T: 5, B: 1 }),
  strip({ Ph: 2, An: 3, Sk: 4, A: 5, K: 5, Q: 5, J: 5, T: 5, B: 2 }),
  strip({ Ph: 2, An: 3, Sk: 3, A: 5, K: 5, Q: 5, J: 5, T: 5, B: 2 }),
  strip({ Ph: 2, An: 3, Sk: 3, A: 5, K: 5, Q: 5, J: 5, T: 5, B: 2 }),
  strip({ Ph: 2, An: 3, Sk: 4, A: 5, K: 5, Q: 5, J: 5, T: 5, B: 1 }),
];

// Free-spins reels — slightly higher chance of premium symbols + scatter
export const YAHU_FREE_REELS: string[][] = [
  strip({ Ph: 4, An: 4, Sk: 4, A: 4, K: 4, Q: 4, J: 4, T: 3, B: 2 }),
  strip({ Ph: 4, An: 4, Sk: 4, A: 4, K: 4, Q: 4, J: 4, T: 3, B: 3 }),
  strip({ Ph: 4, An: 4, Sk: 4, A: 4, K: 4, Q: 4, J: 4, T: 3, B: 3 }),
  strip({ Ph: 4, An: 4, Sk: 4, A: 4, K: 4, Q: 4, J: 4, T: 3, B: 3 }),
  strip({ Ph: 4, An: 4, Sk: 4, A: 4, K: 4, Q: 4, J: 4, T: 3, B: 2 }),
];

// 10 standard paylines
export const YAHU_PAYLINES = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 2, 1, 0, 1],
];

export const YAHU_PAYTABLE = {
  Ph: { 2: 10, 3: 150, 4: 500, 5: 5000 },
  An: { 3: 40, 4: 200, 5: 2000 },
  Sk: { 3: 25, 4: 75, 5: 750 },
  A: { 3: 15, 4: 50, 5: 150 },
  K: { 3: 15, 4: 50, 5: 150 },
  Q: { 3: 10, 4: 40, 5: 125 },
  J: { 3: 10, 4: 40, 5: 125 },
  T: { 3: 5, 4: 25, 5: 100 },
  // Wild = Book also pays as a high symbol when 5 land on a line
  B: { 3: 50, 4: 200, 5: 2000 },
} as const;

export const bookOfYahuConfig: SlotConfig = {
  reels: YAHU_REELS,
  paylines: YAHU_PAYLINES,
  paytable: YAHU_PAYTABLE as unknown as SlotConfig["paytable"],
  scatterSymbol: "B",
  wildSymbol: "B",
  scatterPaytable: { 3: 2, 4: 20, 5: 200 },
  freeSpinsOn: { symbol: "B", count: 3, freeSpins: 10 },
};

export const PREMIUM_SYMBOLS = ["Ph", "An", "Sk", "A", "K", "Q", "J", "T"];

export function pickExpandingSymbol(rng: () => number = Math.random): string {
  return PREMIUM_SYMBOLS[Math.floor(rng() * PREMIUM_SYMBOLS.length)];
}
