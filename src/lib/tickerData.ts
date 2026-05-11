const NAMES = [
  "VioletKing", "LunaCash", "ZeroDay", "PixelKnight", "Yahuza",
  "DiceMaster", "GoldRush", "NeonOwl", "MidnightFox", "ChipKing",
  "SunsetDuke", "Cosmo", "RainbowFist", "QuasarPlay", "JokerBee",
];

const GAMES = [
  "Sizzling Fruits",
  "Book of Yahu",
  "Blackjack 21",
  "European Roulette",
  "Mystic Reels",
  "Lucky Lions",
];

export type TickerEntry = {
  id: string;
  user: string;
  game: string;
  amount: number;
  ts: number;
};

export function makeTickerEntry(): TickerEntry {
  const user = NAMES[Math.floor(Math.random() * NAMES.length)];
  const game = GAMES[Math.floor(Math.random() * GAMES.length)];
  const amount = Math.floor(50 + Math.random() * Math.random() * 8000);
  return {
    id: Math.random().toString(36).slice(2, 10),
    user,
    game,
    amount,
    ts: Date.now(),
  };
}

export function makeInitialTicker(n: number): TickerEntry[] {
  return Array.from({ length: n }, makeTickerEntry);
}
