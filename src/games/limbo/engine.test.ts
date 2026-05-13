import { describe, it, expect } from "vitest";
import {
  rollLimbo,
  settleLimbo,
  limboWinChance,
  MIN_TARGET,
  MAX_TARGET,
} from "./engine";

describe("rollLimbo", () => {
  it("rng=0.5 produces a deterministic roll of ~1.98", () => {
    const r = rollLimbo(() => 0.5);
    expect(r).toBeCloseTo((1 - 0.01) / 0.5, 5);
  });
  it("never returns < 0.99 (lower-bound at U=1)", () => {
    const r = rollLimbo(() => 0.999999);
    expect(r).toBeGreaterThan(0.98);
  });
  it("caps high rolls below the MAX", () => {
    const r = rollLimbo(() => 1e-12);
    expect(r).toBeLessThanOrEqual(1_000_000);
  });
});

describe("settleLimbo", () => {
  it("pays target × bet on a win, 0 on a loss", () => {
    // rng=0.5 → roll ≈ 1.98, target 1.5 → win
    const w = settleLimbo(100, 1.5, () => 0.5);
    expect(w.win).toBe(true);
    expect(w.payout).toBe(150);
    // target 5 → 1.98 < 5 → lose
    const l = settleLimbo(100, 5, () => 0.5);
    expect(l.win).toBe(false);
    expect(l.payout).toBe(0);
  });
});

describe("limboWinChance", () => {
  it("returns ~99% at 1.01 target", () => {
    expect(limboWinChance(1.01)).toBeCloseTo(0.9802, 4);
  });
  it("returns ~9.9% at 10×", () => {
    expect(limboWinChance(10)).toBeCloseTo(0.099, 4);
  });
});

describe("targets", () => {
  it("MIN_TARGET and MAX_TARGET are sane", () => {
    expect(MIN_TARGET).toBeGreaterThan(1);
    expect(MAX_TARGET).toBeGreaterThan(100);
  });
});
