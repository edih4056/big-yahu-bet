/**
 * Chicken (a.k.a. "Chicken Cross") — a chicken crosses a multi-lane road.
 * Each crossing has a fixed difficulty-dependent chance of being safe. Safe
 * crossings compound the multiplier; getting hit ends the round and the bet
 * is lost. The player can cash out any time.
 *
 *   Multiplier per safe step = (1 - HOUSE_EDGE) / safeChance
 *
 * Difficulty levels match the standard online "Chicken Cross" preset:
 *   easy      = 96% safe per step
 *   medium    = 85%
 *   hard      = 70%
 *   daredevil = 50%
 *
 * Up to 24 crossings are available before the chicken reaches the far side
 * (=auto cash-out at the maximum multiplier).
 */

const HOUSE_EDGE = 0.01;

export type Difficulty = "easy" | "medium" | "hard" | "daredevil";

export const DIFFICULTIES: Record<Difficulty, { safeChance: number; label: string }> = {
  easy: { safeChance: 0.96, label: "Easy" },
  medium: { safeChance: 0.85, label: "Medium" },
  hard: { safeChance: 0.7, label: "Hard" },
  daredevil: { safeChance: 0.5, label: "Daredevil" },
};

export const MAX_LANES = 24;

export type LaneState = "hidden" | "safe" | "car";

export type GameStatus = "playing" | "lost" | "cashed";

export function chickenMultiplier(d: Difficulty, level: number): number {
  if (level <= 0) return 1;
  const p = DIFFICULTIES[d].safeChance;
  return round2(Math.pow((1 - HOUSE_EDGE) / p, level));
}

export function chickenLadder(d: Difficulty): number[] {
  const out: number[] = [];
  for (let i = 1; i <= MAX_LANES; i++) out.push(chickenMultiplier(d, i));
  return out;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export class ChickenEngine {
  difficulty: Difficulty;
  bet: number;
  lanes: LaneState[];
  level = 0;
  status: GameStatus = "playing";
  rng: () => number;

  constructor(difficulty: Difficulty, bet: number, rng: () => number = Math.random) {
    this.difficulty = difficulty;
    this.bet = bet;
    this.rng = rng;
    this.lanes = Array<LaneState>(MAX_LANES).fill("hidden");
  }

  currentMultiplier(): number {
    return chickenMultiplier(this.difficulty, this.level);
  }

  nextMultiplier(): number {
    return chickenMultiplier(this.difficulty, this.level + 1);
  }

  potentialPayout(): number {
    return Math.floor(this.bet * this.currentMultiplier() * 100) / 100;
  }

  /** Attempt the next crossing. Returns 'safe' or 'car'. */
  cross(): { hit: "safe" | "car" } {
    if (this.status !== "playing") {
      throw new Error("not playing");
    }
    if (this.level >= MAX_LANES) {
      throw new Error("already at the far side");
    }
    const p = DIFFICULTIES[this.difficulty].safeChance;
    const isSafe = this.rng() < p;
    if (!isSafe) {
      this.lanes[this.level] = "car";
      this.status = "lost";
      return { hit: "car" };
    }
    this.lanes[this.level] = "safe";
    this.level++;
    if (this.level >= MAX_LANES) {
      this.status = "cashed";
    }
    return { hit: "safe" };
  }

  cashOut(): number {
    if (this.status !== "playing" || this.level === 0) return 0;
    const payout = this.potentialPayout();
    this.status = "cashed";
    return payout;
  }
}
