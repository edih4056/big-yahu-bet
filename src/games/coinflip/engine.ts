/**
 * Coin Flip — pick heads or tails. 50/50 outcome with 1% house edge.
 * Win pays bet × 1.98 (≈ 2.0 × (1 - HOUSE_EDGE)).
 */
const HOUSE_EDGE = 0.01;

export type CoinSide = "heads" | "tails";

export type FlipResult = {
  pick: CoinSide;
  landed: CoinSide;
  win: boolean;
  payout: number;
};

export const COIN_FLIP_MULTIPLIER = 2 * (1 - HOUSE_EDGE);

export function flipCoin(rng: () => number = Math.random): CoinSide {
  return rng() < 0.5 ? "heads" : "tails";
}

export function settleCoin(
  bet: number,
  pick: CoinSide,
  rng: () => number = Math.random
): FlipResult {
  const landed = flipCoin(rng);
  const win = landed === pick;
  return {
    pick,
    landed,
    win,
    payout: win ? bet * COIN_FLIP_MULTIPLIER : 0,
  };
}
