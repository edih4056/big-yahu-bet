import { describe, it, expect } from "vitest";
import { spinWheel, wheelLayout, wheelRtp } from "./engine";

describe("layouts", () => {
  it("each layout has 30 segments", () => {
    expect(wheelLayout("low").length).toBe(30);
    expect(wheelLayout("medium").length).toBe(30);
    expect(wheelLayout("high").length).toBe(30);
  });

  it("RTPs are reasonable (0.9 – 0.99)", () => {
    expect(wheelRtp("low")).toBeGreaterThan(0.9);
    expect(wheelRtp("low")).toBeLessThan(1);
    expect(wheelRtp("medium")).toBeGreaterThan(0.9);
    expect(wheelRtp("medium")).toBeLessThan(1);
    expect(wheelRtp("high")).toBeGreaterThan(0.9);
    expect(wheelRtp("high")).toBeLessThan(1);
  });
});

describe("spinWheel", () => {
  it("rng=0 picks segment 0 of each layout", () => {
    const r = spinWheel(100, "low", () => 0);
    expect(r.segmentIndex).toBe(0);
    expect(r.multiplier).toBe(wheelLayout("low")[0]);
  });
  it("computes payout = bet × multiplier", () => {
    const r = spinWheel(100, "medium", () => 0);
    expect(r.payout).toBe(100 * r.multiplier);
  });
  it("rng near 1 picks the last segment", () => {
    const r = spinWheel(100, "high", () => 0.9999);
    expect(r.segmentIndex).toBe(29);
  });
});
