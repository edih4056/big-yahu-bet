import { describe, it, expect } from "vitest";
import { rollCrashPoint, crashWinChance, settleCrash } from "./engine";

describe("rollCrashPoint", () => {
  it("instant-busts when the first roll is in the house-edge bucket", () => {
    // first rng < 0.01 → bust
    expect(rollCrashPoint(() => 0.005)).toBe(1);
  });
  it("yields a sane positive number otherwise", () => {
    let calls = 0;
    const seq = [0.5, 0.5]; // first > 0.01, second drives the formula
    const r = rollCrashPoint(() => seq[calls++]);
    expect(r).toBeCloseTo((1 - 0.01) / 0.5, 4);
  });
});

describe("crashWinChance", () => {
  it("1× target gives ~99% win chance", () => {
    expect(crashWinChance(1)).toBeCloseTo(0.99, 4);
  });
  it("2× target gives ~49.5%", () => {
    expect(crashWinChance(2)).toBeCloseTo(0.495, 4);
  });
});

describe("settleCrash", () => {
  it("pays bet × cashout when cashout <= crash", () => {
    const o = settleCrash(100, 2, 3.5);
    expect(o.win).toBe(true);
    expect(o.payout).toBe(200);
  });
  it("loses when no cashout was set", () => {
    const o = settleCrash(100, null, 3.5);
    expect(o.win).toBe(false);
    expect(o.payout).toBe(0);
  });
  it("loses when cashout target is above the crash", () => {
    const o = settleCrash(100, 5, 3.5);
    expect(o.win).toBe(false);
    expect(o.payout).toBe(0);
  });
});
