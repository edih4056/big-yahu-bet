import { describe, it, expect } from "vitest";
import {
  drawKeno,
  kenoMultiplier,
  settleKeno,
  KENO_DRAWS,
  KENO_TOTAL,
  MAX_PICKS,
} from "./engine";

describe("drawKeno", () => {
  it("draws exactly KENO_DRAWS distinct numbers from 1..TOTAL", () => {
    const d = drawKeno(() => 0);
    expect(d.length).toBe(KENO_DRAWS);
    expect(new Set(d).size).toBe(KENO_DRAWS);
    for (const n of d) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(KENO_TOTAL);
    }
  });
  it("output is sorted ascending", () => {
    const d = drawKeno(() => 0.5);
    for (let i = 1; i < d.length; i++) {
      expect(d[i]).toBeGreaterThan(d[i - 1]);
    }
  });
});

describe("kenoMultiplier", () => {
  it("non-negative for every entry", () => {
    for (const risk of ["low", "medium", "high"] as const) {
      for (let p = 1; p <= MAX_PICKS; p++) {
        for (let h = 0; h <= p; h++) {
          expect(kenoMultiplier(risk, p, h)).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
  it("returns 0 for hits > picks (out of bounds)", () => {
    expect(kenoMultiplier("low", 3, 4)).toBe(0);
  });
});

describe("settleKeno", () => {
  it("hits + multiplier line up", () => {
    // rng=0 picks indices 0,0,0... from the pool which yields [1,2,3,...,10]
    const r = settleKeno(100, [1, 2, 3, 5], "medium", () => 0);
    expect(r.drawn).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(r.hits).toEqual([1, 2, 3, 5]); // all 4 picks land in the draw
    expect(r.multiplier).toBe(kenoMultiplier("medium", 4, 4));
    expect(r.payout).toBe(100 * r.multiplier);
  });

  it("0 hits → 0 payout", () => {
    // Pick numbers that will never be drawn (rng=0 always picks idx 0).
    // Draw is [1..10], so pick 30..33 — guaranteed misses.
    const r = settleKeno(100, [30, 31, 32, 33], "low", () => 0);
    expect(r.hits.length).toBe(0);
    expect(r.payout).toBe(0);
  });

  it("rejects invalid pick counts", () => {
    expect(() => settleKeno(100, [], "low")).toThrow();
    expect(() =>
      settleKeno(100, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], "low")
    ).toThrow();
  });
});
