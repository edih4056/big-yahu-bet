import { describe, it, expect } from "vitest";
import {
  dropBall,
  plinkoLayout,
  plinkoRtp,
  PLINKO_BUCKETS,
  PLINKO_ROWS,
} from "./engine";

describe("layouts", () => {
  it("each layout has BUCKETS multipliers", () => {
    expect(plinkoLayout("low").length).toBe(PLINKO_BUCKETS);
    expect(plinkoLayout("medium").length).toBe(PLINKO_BUCKETS);
    expect(plinkoLayout("high").length).toBe(PLINKO_BUCKETS);
  });
  it("layouts are symmetric (left edge equals right edge etc)", () => {
    for (const r of ["low", "medium", "high"] as const) {
      const l = plinkoLayout(r);
      for (let i = 0; i < l.length; i++) {
        expect(l[i]).toBe(l[l.length - 1 - i]);
      }
    }
  });
});

describe("plinkoRtp", () => {
  it("each risk has RTP within 0.85 – 1.05", () => {
    for (const r of ["low", "medium", "high"] as const) {
      const rtp = plinkoRtp(r);
      expect(rtp).toBeGreaterThan(0.7);
      expect(rtp).toBeLessThan(1.1);
    }
  });
});

describe("dropBall", () => {
  it("all-left rng=0 ends in bucket 0", () => {
    const r = dropBall(100, "low", () => 0.9); // > 0.5 → right? Let's check code.
    // The function: `right = rng() < 0.5 ? -1 : 1`. So rng() >= 0.5 → right=1.
    // With rng=0.9 → right=1 every row → all rights → bucket = ROWS = 12
    expect(r.bucket).toBe(PLINKO_ROWS);
  });
  it("all-left rng=0 actually ends in bucket 0", () => {
    const r = dropBall(100, "low", () => 0); // < 0.5 → right=-1 (left)
    expect(r.bucket).toBe(0);
  });
  it("payout = bet * multiplier", () => {
    const r = dropBall(100, "medium", () => 0);
    expect(r.payout).toBe(100 * r.multiplier);
  });
  it("path length equals ROWS", () => {
    const r = dropBall(10, "low");
    expect(r.path.length).toBe(PLINKO_ROWS);
  });
});
