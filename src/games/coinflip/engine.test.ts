import { describe, it, expect } from "vitest";
import { flipCoin, settleCoin, COIN_FLIP_MULTIPLIER } from "./engine";

describe("flipCoin", () => {
  it("rng < 0.5 → heads", () => expect(flipCoin(() => 0.3)).toBe("heads"));
  it("rng >= 0.5 → tails", () => expect(flipCoin(() => 0.7)).toBe("tails"));
});

describe("COIN_FLIP_MULTIPLIER", () => {
  it("equals ~1.98 (2 × 0.99)", () => {
    expect(COIN_FLIP_MULTIPLIER).toBeCloseTo(1.98, 4);
  });
});

describe("settleCoin", () => {
  it("pays 1.98 × bet on win", () => {
    const r = settleCoin(100, "heads", () => 0.3);
    expect(r.win).toBe(true);
    expect(r.payout).toBeCloseTo(198, 4);
  });
  it("0 payout on loss", () => {
    const r = settleCoin(100, "heads", () => 0.7);
    expect(r.win).toBe(false);
    expect(r.payout).toBe(0);
  });
});
