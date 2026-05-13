/**
 * Limbo — pick a target multiplier (>=1.01), the server rolls a multiplier.
 * If the roll ≥ target, you win bet × target.
 *
 * Probability of roll ≥ target (with 1% house edge):
 *   P = (1 - HOUSE_EDGE) / target
 * Implementation:
 *   roll = (1 - HOUSE_EDGE) / U,  U ~ Uniform(0, 1)
 *   roll is capped to MAX_MULT (1,000,000×) for the UI.
 */

const HOUSE_EDGE = 0.01;
const MAX_MULT = 1_000_000;
export const MIN_TARGET = 1.01;
export const MAX_TARGET = 1_000_000;

export type LimboResult = {
  roll: number;
  target: number;
  win: boolean;
  payout: number; // total returned (0 on loss)
};

export function rollLimbo(rng: () => number = Math.random): number {
  // Avoid roll = Infinity by clamping U slightly away from 0.
  const u = Math.max(rng(), 1e-9);
  return Math.min(MAX_MULT, (1 - HOUSE_EDGE) / u);
}

export function settleLimbo(
  bet: number,
  target: number,
  rng: () => number = Math.random
): LimboResult {
  const roll = rollLimbo(rng);
  const win = roll >= target;
  return {
    roll,
    target,
    win,
    payout: win ? bet * target : 0,
  };
}

/** P(win | target) under the 1% house edge */
export function limboWinChance(target: number): number {
  return (1 - HOUSE_EDGE) / target;
}
