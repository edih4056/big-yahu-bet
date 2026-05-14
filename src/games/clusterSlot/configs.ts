import type { ClusterSlotConfig } from "./engine";

/* ----------------------- Sweet Bonanza 1000 (themed) ----------------------- */

export const SWEET_BONANZA_SYMBOLS = [
  "🍓", "🍇", "🍉", "🍌", "🍎", "🍑", "🍭", "🍬",
] as const;

export const SWEET_BONANZA_INFO: Record<
  string,
  { label: string; color: string; isHigh?: boolean }
> = {
  "🍓": { label: "Strawberry", color: "#F472B6", isHigh: true },
  "🍇": { label: "Grapes", color: "#A855F7", isHigh: true },
  "🍉": { label: "Watermelon", color: "#22C55E", isHigh: true },
  "🍌": { label: "Banana", color: "#FACC15" },
  "🍎": { label: "Apple", color: "#EF4444" },
  "🍑": { label: "Plum", color: "#EC4899" },
  "🍭": { label: "Lollipop", color: "#F97316" },
  "🍬": { label: "Candy", color: "#F472B6" },
};

export const sweetBonanzaConfig: ClusterSlotConfig = {
  symbols: [...SWEET_BONANZA_SYMBOLS],
  // High-value (Strawberry/Grapes/Watermelon) are rarer
  weights: [3, 4, 5, 7, 7, 7, 8, 8],
  paytable: {
    "🍓": { 8: 10, 10: 25, 12: 50 },
    "🍇": { 8: 5, 10: 15, 12: 25 },
    "🍉": { 8: 4, 10: 10, 12: 20 },
    "🍌": { 8: 1.5, 10: 4, 12: 10 },
    "🍎": { 8: 1, 10: 2.5, 12: 8 },
    "🍑": { 8: 0.6, 10: 1.5, 12: 5 },
    "🍭": { 8: 0.4, 10: 1, 12: 3 },
    "🍬": { 8: 0.4, 10: 1, 12: 3 },
  },
};

/* ----------------------- Gates of Olympus 1000 ----------------------- */

export const OLYMPUS_SYMBOLS = [
  "👑", "💍", "🍷", "🏺", "🔴", "🟢", "🟣", "🟡",
] as const;

export const OLYMPUS_INFO: Record<
  string,
  { label: string; color: string; isHigh?: boolean }
> = {
  "👑": { label: "Crown", color: "#FBBF24", isHigh: true },
  "💍": { label: "Ring", color: "#F472B6", isHigh: true },
  "🍷": { label: "Chalice", color: "#A855F7", isHigh: true },
  "🏺": { label: "Urn", color: "#0EA5E9", isHigh: true },
  "🔴": { label: "Ruby", color: "#EF4444" },
  "🟢": { label: "Emerald", color: "#22C55E" },
  "🟣": { label: "Amethyst", color: "#A855F7" },
  "🟡": { label: "Topaz", color: "#FACC15" },
};

export const olympusConfig: ClusterSlotConfig = {
  symbols: [...OLYMPUS_SYMBOLS],
  weights: [2, 3, 4, 5, 6, 6, 6, 6],
  paytable: {
    "👑": { 8: 25, 10: 50, 12: 100 },
    "💍": { 8: 10, 10: 25, 12: 50 },
    "🍷": { 8: 8, 10: 18, 12: 40 },
    "🏺": { 8: 5, 10: 12, 12: 25 },
    "🔴": { 8: 1.5, 10: 3.5, 12: 8 },
    "🟢": { 8: 1.2, 10: 3, 12: 7 },
    "🟣": { 8: 1, 10: 2.5, 12: 6 },
    "🟡": { 8: 0.8, 10: 2, 12: 5 },
  },
  multiplierOrb: {
    symbol: "⚡",
    // Common smaller values, very rare huge ones — matches Pragmatic-style distribution
    values: [2, 2, 2, 3, 3, 5, 5, 10, 10, 25, 50, 100, 500],
    perCellChance: 0.04,
  },
};
