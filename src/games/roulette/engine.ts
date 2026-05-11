export type Color = "red" | "black" | "green";

export type BetKind =
  | "straight"   // single number
  | "split"      // 2 numbers
  | "street"     // 3 numbers (a row)
  | "corner"     // 4 numbers
  | "line"       // 6 numbers (two rows)
  | "red"
  | "black"
  | "even"
  | "odd"
  | "low"        // 1-18
  | "high"       // 19-36
  | "dozen1"     // 1-12
  | "dozen2"     // 13-24
  | "dozen3"     // 25-36
  | "col1"
  | "col2"
  | "col3";

export type Bet = {
  id: string;
  kind: BetKind;
  numbers: number[];
  amount: number;
};

export const PAYOUT: Record<BetKind, number> = {
  straight: 35,
  split: 17,
  street: 11,
  corner: 8,
  line: 5,
  red: 1,
  black: 1,
  even: 1,
  odd: 1,
  low: 1,
  high: 1,
  dozen1: 2,
  dozen2: 2,
  dozen3: 2,
  col1: 2,
  col2: 2,
  col3: 2,
};

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export function colorOf(n: number): Color {
  if (n === 0) return "green";
  return RED_NUMBERS.has(n) ? "red" : "black";
}

// European wheel order (standard single-zero)
export const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

export function indexOf(n: number) {
  return WHEEL_ORDER.indexOf(n);
}

export function betWins(bet: Bet, n: number): boolean {
  switch (bet.kind) {
    case "straight":
    case "split":
    case "street":
    case "corner":
    case "line":
      return bet.numbers.includes(n);
    case "red":
      return colorOf(n) === "red";
    case "black":
      return colorOf(n) === "black";
    case "even":
      return n !== 0 && n % 2 === 0;
    case "odd":
      return n !== 0 && n % 2 === 1;
    case "low":
      return n >= 1 && n <= 18;
    case "high":
      return n >= 19 && n <= 36;
    case "dozen1":
      return n >= 1 && n <= 12;
    case "dozen2":
      return n >= 13 && n <= 24;
    case "dozen3":
      return n >= 25 && n <= 36;
    case "col1":
      return n !== 0 && n % 3 === 1;
    case "col2":
      return n !== 0 && n % 3 === 2;
    case "col3":
      return n !== 0 && n % 3 === 0;
  }
}

export function betPayout(bet: Bet, n: number): number {
  if (!betWins(bet, n)) return 0;
  return bet.amount * (PAYOUT[bet.kind] + 1); // includes original stake back
}

export type SpinResult = {
  number: number;
  color: Color;
  totalWin: number; // total returned to player (stake on winners back + winnings)
  perBet: { id: string; payout: number }[];
};

export class RouletteEngine {
  bets: Bet[] = [];
  rng: () => number;

  constructor(rng: () => number = Math.random) {
    this.rng = rng;
  }

  totalStaked(): number {
    return this.bets.reduce((s, b) => s + b.amount, 0);
  }

  placeBet(bet: Omit<Bet, "id">): Bet {
    const id = Math.random().toString(36).slice(2, 9);
    const merged: Bet = { ...bet, id };
    this.bets.push(merged);
    return merged;
  }

  removeBet(id: string) {
    this.bets = this.bets.filter((b) => b.id !== id);
  }

  popLastBet(): Bet | null {
    return this.bets.pop() ?? null;
  }

  clearBets() {
    this.bets = [];
  }

  spin(forced?: number): SpinResult {
    const n = forced ?? Math.floor(this.rng() * 37);
    const color = colorOf(n);
    let totalWin = 0;
    const perBet = this.bets.map((b) => {
      const p = betPayout(b, n);
      totalWin += p;
      return { id: b.id, payout: p };
    });
    return { number: n, color, totalWin, perBet };
  }
}
