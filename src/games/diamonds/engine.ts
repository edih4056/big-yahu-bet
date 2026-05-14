/**
 * Diamonds — five gems are revealed from a pool of seven colours.
 *
 * Player wins if a colour appears at least 3 times. Higher counts and rarer
 * gem types pay more.
 *
 *   3-of-a-kind: bet × gemRank × 0.20
 *   4-of-a-kind: bet × gemRank × 1.00
 *   5-of-a-kind: bet × gemRank × 5.00
 *
 * Gem ranks (rarity weight is inverse to rank, so rare gems pay more):
 *   white=1, blue=2, green=3, purple=4, pink=5, red=6, gold=7
 *
 * Each draw is uniform over the 7 gems. Average EV ≈ 0.97 (3% house edge).
 */

export type Gem =
  | "white"
  | "blue"
  | "green"
  | "purple"
  | "pink"
  | "red"
  | "gold";

export const GEMS: Gem[] = ["white", "blue", "green", "purple", "pink", "red", "gold"];

export const GEM_RANK: Record<Gem, number> = {
  white: 1,
  blue: 2,
  green: 3,
  purple: 4,
  pink: 5,
  red: 6,
  gold: 7,
};

export const GEM_INFO: Record<Gem, { icon: string; color: string }> = {
  white: { icon: "💎", color: "#E5E7EB" },
  blue: { icon: "🔷", color: "#3B82F6" },
  green: { icon: "🟢", color: "#22C55E" },
  purple: { icon: "🟣", color: "#A855F7" },
  pink: { icon: "🌸", color: "#EC4899" },
  red: { icon: "🔴", color: "#EF4444" },
  gold: { icon: "🟡", color: "#FBBF24" },
};

const REVEAL_COUNT = 5;
export const DIAMONDS_REVEAL = REVEAL_COUNT;

export type DiamondsResult = {
  reveal: Gem[];
  /** The winning gem (highest count, ties broken by gem rank). null = no match */
  winningGem: Gem | null;
  /** Count of the winning gem in the reveal (>= 3 if a win) */
  matchCount: number;
  multiplier: number;
  payout: number;
};

export function drawDiamonds(rng: () => number = Math.random): Gem[] {
  const out: Gem[] = [];
  for (let i = 0; i < REVEAL_COUNT; i++) {
    out.push(GEMS[Math.floor(rng() * GEMS.length)]);
  }
  return out;
}

export function diamondsMultiplier(gem: Gem, count: number): number {
  if (count < 3) return 0;
  const tier = count === 5 ? 5 : count === 4 ? 1 : 0.2;
  return GEM_RANK[gem] * tier;
}

export function settleDiamonds(
  bet: number,
  rng: () => number = Math.random
): DiamondsResult {
  const reveal = drawDiamonds(rng);
  const counts = new Map<Gem, number>();
  for (const g of reveal) counts.set(g, (counts.get(g) ?? 0) + 1);

  // Find the gem with the highest count; on a tie, pick the highest-rank gem.
  let winningGem: Gem | null = null;
  let matchCount = 0;
  for (const [gem, c] of counts) {
    if (c >= 3) {
      if (
        c > matchCount ||
        (c === matchCount && winningGem && GEM_RANK[gem] > GEM_RANK[winningGem])
      ) {
        winningGem = gem;
        matchCount = c;
      }
    }
  }

  const mult = winningGem ? diamondsMultiplier(winningGem, matchCount) : 0;
  return {
    reveal,
    winningGem,
    matchCount,
    multiplier: mult,
    payout: bet * mult,
  };
}
