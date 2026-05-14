/**
 * Keno — pick up to 10 numbers from 1..40, the server draws 10. Payout is
 * based on (count of picks, count of hits) using one of three risk paytables.
 *
 * The grid (40 numbers, 10 drawn) is the same as Stake-style Keno. RTPs of
 * the three layouts are tuned to roughly 96 – 98 %.
 */

const TOTAL = 40;
const DRAWS = 10;
export const KENO_TOTAL = TOTAL;
export const KENO_DRAWS = DRAWS;
export const MAX_PICKS = 10;
export const MIN_PICKS = 1;

export type Risk = "low" | "medium" | "high";

/**
 * Paytables: keyed by picks (1..10), each entry is a multiplier table
 * indexed by hit count (0..picks). 0× entries mean a loss.
 */
const PAYTABLES: Record<Risk, number[][]> = {
  low: [
    /*0 picks*/ [],
    /*1*/ [0.7, 1.85],
    /*2*/ [0, 2, 3.8],
    /*3*/ [0, 1.1, 1.38, 26],
    /*4*/ [0, 0, 2.2, 7.9, 90],
    /*5*/ [0, 0, 1.5, 4.2, 13, 300],
    /*6*/ [0, 0, 1.1, 2, 6.2, 100, 700],
    /*7*/ [0, 0, 1.1, 1.6, 3.5, 15, 225, 700],
    /*8*/ [0, 0, 1.1, 1.5, 2, 5.5, 39, 100, 800],
    /*9*/ [0, 0, 1.1, 1.3, 1.7, 2.5, 7.5, 50, 250, 1000],
    /*10*/[0, 0, 1.1, 1.2, 1.3, 1.8, 3.5, 13, 50, 250, 1000],
  ],
  medium: [
    [],
    [0, 2.75],
    [0, 1.8, 5.1],
    [0, 0, 2.8, 50],
    [0, 0, 1.7, 10, 100],
    [0, 0, 1.4, 4, 14, 390],
    [0, 0, 0, 3, 9, 180, 710],
    [0, 0, 0, 2, 7, 30, 400, 800],
    [0, 0, 0, 2, 4, 11, 67, 400, 900],
    [0, 0, 0, 2, 2.5, 5, 15, 100, 500, 1000],
    [0, 0, 0, 1.6, 2, 4, 7, 26, 100, 500, 1000],
  ],
  high: [
    [],
    [0, 3.96],
    [0, 0, 17.1],
    [0, 0, 0, 81.5],
    [0, 0, 0, 10, 259],
    [0, 0, 0, 4.5, 48, 450],
    [0, 0, 0, 0, 11, 350, 710],
    [0, 0, 0, 0, 7, 90, 400, 800],
    [0, 0, 0, 0, 5, 20, 270, 600, 900],
    [0, 0, 0, 0, 4, 11, 56, 500, 800, 1000],
    [0, 0, 0, 0, 3.5, 8, 13, 63, 500, 800, 1000],
  ],
};

export function kenoMultiplier(risk: Risk, picks: number, hits: number): number {
  const t = PAYTABLES[risk][picks] ?? [];
  return t[hits] ?? 0;
}

export type KenoResult = {
  drawn: number[];
  hits: number[];
  multiplier: number;
  payout: number;
};

/** Draw DRAWS distinct numbers from 1..TOTAL. */
export function drawKeno(rng: () => number = Math.random): number[] {
  const pool: number[] = [];
  for (let i = 1; i <= TOTAL; i++) pool.push(i);
  const out: number[] = [];
  for (let i = 0; i < DRAWS; i++) {
    const j = Math.floor(rng() * pool.length);
    out.push(pool.splice(j, 1)[0]);
  }
  return out.sort((a, b) => a - b);
}

export function settleKeno(
  bet: number,
  picks: number[],
  risk: Risk,
  rng: () => number = Math.random
): KenoResult {
  if (picks.length < MIN_PICKS || picks.length > MAX_PICKS) {
    throw new Error(`Picks must be between ${MIN_PICKS} and ${MAX_PICKS}.`);
  }
  const drawn = drawKeno(rng);
  const drawnSet = new Set(drawn);
  const hits = picks.filter((p) => drawnSet.has(p)).sort((a, b) => a - b);
  const mult = kenoMultiplier(risk, picks.length, hits.length);
  return {
    drawn,
    hits,
    multiplier: mult,
    payout: bet * mult,
  };
}
