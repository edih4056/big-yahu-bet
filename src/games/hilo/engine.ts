/**
 * Hilo — guess if the next card is higher or lower than the current.
 *
 * Each card has a rank value 1..13 (Ace=1, J=11, Q=12, K=13). On each round
 * the player picks "higher" (next > current; tie loses) or "lower" (next <
 * current; tie loses). After a correct guess, the new card becomes the
 * current card and the multiplier compounds. The player can cash out any
 * time. A wrong guess loses everything.
 *
 * Multiplier per step (fair odds with 1% house edge):
 *   m = (1 - HOUSE_EDGE) / P(correct | current, direction)
 *
 * Probabilities (deck-agnostic, treating 13 ranks uniformly):
 *   P(next > current) = (13 - current) / 12
 *   P(next < current) = (current - 1) / 12
 * Ties never count as a win.
 */

const HOUSE_EDGE = 0.01;

export type CardRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type Direction = "higher" | "lower";

export function rankLabel(r: CardRank): string {
  if (r === 1) return "A";
  if (r === 11) return "J";
  if (r === 12) return "Q";
  if (r === 13) return "K";
  return String(r);
}

export function nextCard(rng: () => number = Math.random): CardRank {
  return (Math.floor(rng() * 13) + 1) as CardRank;
}

export function winChance(current: CardRank, dir: Direction): number {
  if (dir === "higher") return (13 - current) / 12;
  return (current - 1) / 12;
}

/** Multiplier for a single guess (fair-odds with house edge). */
export function stepMultiplier(current: CardRank, dir: Direction): number {
  const p = winChance(current, dir);
  if (p <= 0) return 0;
  return (1 - HOUSE_EDGE) / p;
}

export type HiloStep = {
  before: CardRank;
  after: CardRank;
  dir: Direction;
  correct: boolean;
  /** Cumulative multiplier after this step (1.0 if first correct guess made) */
  multiplier: number;
};

export class HiloEngine {
  bet: number;
  current: CardRank;
  multiplier = 1;
  steps: HiloStep[] = [];
  status: "playing" | "lost" | "cashed" = "playing";
  rng: () => number;

  constructor(bet: number, rng: () => number = Math.random) {
    this.bet = bet;
    this.rng = rng;
    this.current = nextCard(rng);
  }

  /** Probability of the player's choice being correct from the current card */
  guessChance(dir: Direction): number {
    return winChance(this.current, dir);
  }

  pick(dir: Direction): HiloStep {
    if (this.status !== "playing") throw new Error("not playing");
    const before = this.current;
    const after = nextCard(this.rng);
    const correct =
      dir === "higher" ? after > before : after < before; // ties = lose
    if (correct) {
      this.multiplier *= stepMultiplier(before, dir);
      this.current = after;
    } else {
      this.status = "lost";
    }
    const step: HiloStep = { before, after, dir, correct, multiplier: this.multiplier };
    this.steps.push(step);
    return step;
  }

  cashOut(): number {
    if (this.status !== "playing" || this.steps.length === 0) return 0;
    this.status = "cashed";
    return this.bet * this.multiplier;
  }
}
