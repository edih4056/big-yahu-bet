/**
 * Crash — rocket-style climbing multiplier.
 *
 * Mechanics:
 *  - Round starts at 1.00×, climbs over time.
 *  - At some point the multiplier "crashes" (round ends).
 *  - Player wins if they cash out before the crash, otherwise loses bet.
 *
 * Provably-fair / Stake-style crash point distribution (1% house edge):
 *   crash = max(1, (1 - HOUSE_EDGE) / U), U ~ Uniform(0, 1)
 *   P(crash <  m) = HOUSE_EDGE + (1 - HOUSE_EDGE) × (1 - 1/m)
 *   P(crash >= m) = (1 - HOUSE_EDGE) / m
 */

const HOUSE_EDGE = 0.01;

export type CrashOutcome = {
  /** Multiplier at which the round crashed */
  crashAt: number;
  /** Where the player actually cashed out (if any) */
  cashedAt: number | null;
  /** Did the player win? */
  win: boolean;
  /** Coins returned to the wallet */
  payout: number;
};

export function rollCrashPoint(rng: () => number = Math.random): number {
  // Apply the same house-edge bucket as Stake-style crash: there's a small chance
  // the round busts immediately at 1.00 (loss for everyone).
  const r = rng();
  if (r < HOUSE_EDGE) return 1; // instant bust
  const u = Math.max(rng(), 1e-9);
  return (1 - HOUSE_EDGE) / u;
}

export function crashWinChance(target: number): number {
  if (target <= 1) return 1 - HOUSE_EDGE;
  return (1 - HOUSE_EDGE) / target;
}

export function settleCrash(
  bet: number,
  cashOutAt: number | null,
  crashAt: number
): CrashOutcome {
  const win = cashOutAt !== null && cashOutAt <= crashAt && cashOutAt >= 1;
  return {
    crashAt,
    cashedAt: cashOutAt,
    win,
    payout: win ? bet * (cashOutAt as number) : 0,
  };
}
