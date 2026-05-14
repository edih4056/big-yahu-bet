import { describe, it, expect } from "vitest";
import {
  diamondsMultiplier,
  drawDiamonds,
  settleDiamonds,
  GEMS,
  DIAMONDS_REVEAL,
} from "./engine";

describe("drawDiamonds", () => {
  it("draws exactly REVEAL_COUNT gems from the known palette", () => {
    const r = drawDiamonds(() => 0);
    expect(r.length).toBe(DIAMONDS_REVEAL);
    for (const g of r) expect(GEMS).toContain(g);
  });
});

describe("diamondsMultiplier", () => {
  it("returns 0 for < 3 of a kind", () => {
    expect(diamondsMultiplier("gold", 2)).toBe(0);
  });
  it("higher rank pays more at the same tier", () => {
    expect(diamondsMultiplier("gold", 3)).toBeGreaterThan(
      diamondsMultiplier("white", 3)
    );
  });
  it("5-of-a-kind pays more than 4 pays more than 3", () => {
    expect(diamondsMultiplier("red", 5)).toBeGreaterThan(
      diamondsMultiplier("red", 4)
    );
    expect(diamondsMultiplier("red", 4)).toBeGreaterThan(
      diamondsMultiplier("red", 3)
    );
  });
});

describe("settleDiamonds", () => {
  it("rng=0 → all-white reveal → 5×white win", () => {
    const r = settleDiamonds(100, () => 0);
    expect(r.reveal).toEqual(Array(DIAMONDS_REVEAL).fill("white"));
    expect(r.winningGem).toBe("white");
    expect(r.matchCount).toBe(5);
    expect(r.multiplier).toBeGreaterThan(0);
    expect(r.payout).toBe(100 * r.multiplier);
  });

  it("uniform-random reveal with no match returns 0", () => {
    // Force a reveal of all 5 different gems
    const seq = [0, 1 / 7, 2 / 7, 3 / 7, 4 / 7];
    let i = 0;
    const r = settleDiamonds(100, () => seq[i++]);
    expect(new Set(r.reveal).size).toBe(5);
    expect(r.winningGem).toBeNull();
    expect(r.payout).toBe(0);
  });
});
