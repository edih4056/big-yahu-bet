import { describe, it, expect } from "vitest";
import {
  diceMultiplier,
  diceWinChance,
  rollDice,
  settleDice,
} from "./engine";

describe("diceWinChance", () => {
  it("over 50 → 50% win", () => {
    expect(diceWinChance(50, "over")).toBe(0.5);
  });
  it("under 25 → 25% win", () => {
    expect(diceWinChance(25, "under")).toBe(0.25);
  });
});

describe("diceMultiplier", () => {
  it("RTP ≈ 99% (i.e. m × p ≈ 0.99)", () => {
    const t = 50;
    expect(diceMultiplier(t, "over") * diceWinChance(t, "over")).toBeCloseTo(
      0.99,
      4
    );
  });
});

describe("rollDice", () => {
  it("rng=0 yields 0; rng=0.5 yields 50; rng~1 yields ~100", () => {
    expect(rollDice(() => 0)).toBe(0);
    expect(rollDice(() => 0.5)).toBe(50);
    expect(rollDice(() => 0.9999)).toBeCloseTo(99.99, 1);
  });
});

describe("settleDice", () => {
  it("over threshold pays bet × multiplier on win", () => {
    // rng=0.7 → roll = 70.00. Over 50 → win.
    const r = settleDice(100, 50, "over", () => 0.7);
    expect(r.win).toBe(true);
    expect(r.payout).toBeCloseTo(100 * diceMultiplier(50, "over"), 2);
  });
  it("under threshold loses if roll above", () => {
    // rng=0.7 → roll 70 > 50 → "under 50" loses.
    const r = settleDice(100, 50, "under", () => 0.7);
    expect(r.win).toBe(false);
    expect(r.payout).toBe(0);
  });
});
