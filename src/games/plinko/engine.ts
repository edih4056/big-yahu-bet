/**
 * Plinko — ball drops through pegs, each row deflecting left or right with
 * 50/50 probability. The final bucket index (0..rows) determines the win
 * multiplier. Bucket layouts are U-shaped: rare edge buckets pay big, the
 * frequent middle buckets pay little or zero.
 */

export type Risk = "low" | "medium" | "high";

/** 12-row Plinko produces 13 buckets. Multipliers tuned to feel Stake-ish. */
const ROWS = 12;
const BUCKETS = ROWS + 1;

const LAYOUTS: Record<Risk, number[]> = {
  low: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
  medium: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
  high: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
};

export function plinkoLayout(risk: Risk): number[] {
  return LAYOUTS[risk];
}

export const PLINKO_ROWS = ROWS;
export const PLINKO_BUCKETS = BUCKETS;

export type PlinkoResult = {
  /** Per-row choice: -1 = left, +1 = right */
  path: (-1 | 1)[];
  /** Final bucket (0 = leftmost, BUCKETS-1 = rightmost) */
  bucket: number;
  multiplier: number;
  payout: number;
};

/** Pick the bucket via independent 50/50 row deflections (binomial). */
export function dropBall(
  bet: number,
  risk: Risk,
  rng: () => number = Math.random
): PlinkoResult {
  const path: (-1 | 1)[] = [];
  let rights = 0;
  for (let r = 0; r < ROWS; r++) {
    const right = rng() < 0.5 ? -1 : 1;
    path.push(right === 1 ? 1 : -1);
    if (right === 1) rights++;
  }
  const layout = plinkoLayout(risk);
  const m = layout[rights];
  return { path, bucket: rights, multiplier: m, payout: bet * m };
}

/** Sum of (probability × multiplier) for each bucket — used by tests / UI. */
export function plinkoRtp(risk: Risk): number {
  const layout = plinkoLayout(risk);
  // P(bucket=k) = C(ROWS,k) / 2^ROWS
  let total = 0;
  for (let k = 0; k < BUCKETS; k++) {
    const p = binomial(ROWS, k) / Math.pow(2, ROWS);
    total += p * layout[k];
  }
  return total;
}

function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let v = 1;
  for (let i = 0; i < k; i++) v = (v * (n - i)) / (i + 1);
  return v;
}
