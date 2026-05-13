/**
 * Dice — classic Stake-style dice.
 *
 * Player picks a number 0-100 ("threshold") and a direction ("over" or "under").
 * The server rolls a uniform 0-100 number (2-decimal precision).
 * Win if direction === "over" and roll > threshold, or "under" and roll < threshold.
 *
 * Win chance:
 *   over:  (100 - threshold) / 100
 *   under: threshold / 100
 * Payout multiplier on win:
 *   mult = (1 - HOUSE_EDGE) / winChance
 */

const HOUSE_EDGE = 0.01;

export type Direction = "over" | "under";

export type DiceResult = {
  roll: number;
  win: boolean;
  payout: number;
  multiplier: number;
};

export function diceWinChance(threshold: number, dir: Direction): number {
  if (dir === "over") return Math.max(0, (100 - threshold) / 100);
  return Math.max(0, threshold / 100);
}

export function diceMultiplier(threshold: number, dir: Direction): number {
  const wc = diceWinChance(threshold, dir);
  if (wc <= 0) return 0;
  return (1 - HOUSE_EDGE) / wc;
}

export function rollDice(rng: () => number = Math.random): number {
  return Math.round(rng() * 10000) / 100; // 0.00 - 100.00
}

export function settleDice(
  bet: number,
  threshold: number,
  dir: Direction,
  rng: () => number = Math.random
): DiceResult {
  const roll = rollDice(rng);
  const win =
    dir === "over" ? roll > threshold : roll < threshold;
  const mult = diceMultiplier(threshold, dir);
  return {
    roll,
    win,
    multiplier: mult,
    payout: win ? bet * mult : 0,
  };
}
