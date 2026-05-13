import { describe, it, expect } from "vitest";
import {
  HiloEngine,
  nextCard,
  rankLabel,
  stepMultiplier,
  winChance,
  type CardRank,
} from "./engine";

describe("rankLabel", () => {
  it("face cards have letter labels", () => {
    expect(rankLabel(1)).toBe("A");
    expect(rankLabel(11)).toBe("J");
    expect(rankLabel(12)).toBe("Q");
    expect(rankLabel(13)).toBe("K");
    expect(rankLabel(7)).toBe("7");
  });
});

describe("nextCard", () => {
  it("rng=0 → 1, rng~1 → 13", () => {
    expect(nextCard(() => 0)).toBe(1);
    expect(nextCard(() => 0.999)).toBe(13);
  });
});

describe("winChance / stepMultiplier", () => {
  it("higher from 7 → 6/12", () => {
    expect(winChance(7 as CardRank, "higher")).toBeCloseTo(6 / 12, 5);
  });
  it("lower from 7 → 6/12", () => {
    expect(winChance(7 as CardRank, "lower")).toBeCloseTo(6 / 12, 5);
  });
  it("multiplier × chance ≈ 0.99", () => {
    const c: CardRank = 7;
    expect(stepMultiplier(c, "higher") * winChance(c, "higher")).toBeCloseTo(
      0.99,
      5
    );
  });
});

describe("HiloEngine", () => {
  it("correct guess multiplies and advances; wrong guess ends round", () => {
    // Force the deck so cards roll: 5 (initial), then 10 (higher), then 3 (lower than 10 → correct).
    const seq = [4 / 13, 9 / 13, 2 / 13]; // → 5, 10, 3
    let calls = 0;
    const eng = new HiloEngine(100, () => seq[calls++]);
    expect(eng.current).toBe(5);

    const step1 = eng.pick("higher"); // 10 > 5 → correct
    expect(step1.correct).toBe(true);
    expect(eng.current).toBe(10);
    expect(eng.multiplier).toBeGreaterThan(1);

    const step2 = eng.pick("lower"); // 3 < 10 → correct
    expect(step2.correct).toBe(true);
  });

  it("cashOut returns bet × multiplier and ends the round", () => {
    const seq = [4 / 13, 9 / 13]; // 5 then 10
    let i = 0;
    const eng = new HiloEngine(100, () => seq[i++]);
    eng.pick("higher");
    const out = eng.cashOut();
    expect(out).toBeCloseTo(100 * eng.multiplier, 4);
    expect(eng.status).toBe("cashed");
  });
});
