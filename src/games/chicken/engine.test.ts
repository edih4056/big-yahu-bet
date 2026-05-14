import { describe, it, expect } from "vitest";
import {
  chickenMultiplier,
  chickenLadder,
  ChickenEngine,
  MAX_LANES,
} from "./engine";

describe("chickenMultiplier", () => {
  it("level 0 = 1.0", () => {
    expect(chickenMultiplier("easy", 0)).toBe(1);
  });

  it("strictly increasing with level", () => {
    const ladder = chickenLadder("medium");
    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i]).toBeGreaterThan(ladder[i - 1]);
    }
  });

  it("higher difficulty pays more at the same level", () => {
    for (let lvl = 1; lvl <= 10; lvl++) {
      expect(chickenMultiplier("daredevil", lvl)).toBeGreaterThan(
        chickenMultiplier("hard", lvl)
      );
      expect(chickenMultiplier("hard", lvl)).toBeGreaterThan(
        chickenMultiplier("medium", lvl)
      );
      expect(chickenMultiplier("medium", lvl)).toBeGreaterThan(
        chickenMultiplier("easy", lvl)
      );
    }
  });
});

describe("ChickenEngine", () => {
  it("starts at level 0 in 'playing' state", () => {
    const e = new ChickenEngine("medium", 100);
    expect(e.level).toBe(0);
    expect(e.status).toBe("playing");
  });

  it("safe roll advances level and bumps multiplier", () => {
    // rng < safeChance → safe. With rng=0 → always safe.
    const e = new ChickenEngine("medium", 100, () => 0);
    const r = e.cross();
    expect(r.hit).toBe("safe");
    expect(e.level).toBe(1);
    expect(e.currentMultiplier()).toBeGreaterThan(1);
  });

  it("car kills the round", () => {
    // rng=0.99 → > safeChance for medium (0.85) → car
    const e = new ChickenEngine("medium", 100, () => 0.99);
    const r = e.cross();
    expect(r.hit).toBe("car");
    expect(e.status).toBe("lost");
  });

  it("cashOut requires at least 1 successful crossing", () => {
    const e = new ChickenEngine("hard", 100);
    expect(e.cashOut()).toBe(0);
  });

  it("cashOut after safe step pays bet × multiplier", () => {
    const e = new ChickenEngine("hard", 100, () => 0);
    e.cross();
    const expected = 100 * chickenMultiplier("hard", 1);
    expect(e.cashOut()).toBeCloseTo(expected, 2);
    expect(e.status).toBe("cashed");
  });

  it("reaching the far side auto-cashes", () => {
    const e = new ChickenEngine("easy", 100, () => 0);
    for (let i = 0; i < MAX_LANES; i++) e.cross();
    expect(e.status).toBe("cashed");
    expect(e.level).toBe(MAX_LANES);
  });
});
