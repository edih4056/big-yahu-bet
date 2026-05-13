/**
 * Wheel — spin a wheel of segments with multipliers.
 *
 * Three risk levels. Each segment carries a multiplier; the wheel picks a
 * segment uniformly at random. Expected RTP per layout ≈ 0.96 (~4% edge,
 * comparable to most online "Wheel" originals).
 */

export type Risk = "low" | "medium" | "high";

/** Each layout is a list of segment multipliers; the wheel renders one
 *  slice per array entry (all 30-segment wheels). */
const LAYOUTS: Record<Risk, number[]> = {
  // 19 × 1.5 + 11 × 0  →  RTP = 28.5/30 = 0.95
  low: [
    1.5, 0, 1.5, 1.5, 0,
    1.5, 1.5, 0, 1.5, 1.5,
    0, 1.5, 1.5, 0, 1.5,
    1.5, 0, 1.5, 1.5, 0,
    1.5, 1.5, 0, 1.5, 1.5,
    0, 1.5, 1.5, 0, 0,
  ],
  // 8 × 3 + 1 × 5 + 21 × 0  →  RTP = 29/30 ≈ 0.967
  medium: [
    3, 0, 0, 3, 0,
    0, 3, 0, 0, 3,
    0, 0, 5, 0, 0,
    3, 0, 0, 3, 0,
    0, 3, 0, 0, 3,
    0, 0, 0, 0, 0,
  ],
  // 1 × 25 + 1 × 4 + 28 × 0  →  RTP = 29/30 ≈ 0.967
  high: [
    25, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    4, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
  ],
};

export function wheelLayout(risk: Risk): number[] {
  return LAYOUTS[risk];
}

export type WheelResult = {
  segmentIndex: number;
  multiplier: number;
  payout: number;
  win: boolean;
};

export function spinWheel(
  bet: number,
  risk: Risk,
  rng: () => number = Math.random
): WheelResult {
  const layout = wheelLayout(risk);
  const segmentIndex = Math.floor(rng() * layout.length);
  const multiplier = layout[segmentIndex];
  return {
    segmentIndex,
    multiplier,
    payout: bet * multiplier,
    win: multiplier > 0,
  };
}

/** Expected return for the layout — average multiplier across segments. */
export function wheelRtp(risk: Risk): number {
  const l = wheelLayout(risk);
  return l.reduce((s, m) => s + m, 0) / l.length;
}
