import { describe, it, expect } from "vitest";
import {
  TowersEngine,
  buildMultipliers,
  levelMultiplier,
  DIFFICULTIES,
} from "./engine";

describe("levelMultiplier", () => {
  it("returns 1 at level 0", () => {
    expect(levelMultiplier("medium", 0)).toBe(1);
  });

  it("strictly increases with each level (easy)", () => {
    const mults = buildMultipliers("easy");
    for (let i = 1; i < mults.length; i++) {
      expect(mults[i]).toBeGreaterThan(mults[i - 1]);
    }
  });

  it("hard ≥ medium ≥ easy at every level (more risk = higher mult)", () => {
    for (let lvl = 1; lvl <= 9; lvl++) {
      expect(levelMultiplier("hard", lvl)).toBeGreaterThan(
        levelMultiplier("medium", lvl)
      );
      expect(levelMultiplier("medium", lvl)).toBeGreaterThan(
        levelMultiplier("easy", lvl)
      );
    }
  });

  it("extreme is the highest difficulty multiplier", () => {
    expect(levelMultiplier("extreme", 5)).toBeGreaterThan(
      levelMultiplier("hard", 5)
    );
  });
});

describe("TowersEngine", () => {
  it("starts in 'playing' state with the configured number of rows", () => {
    const eng = new TowersEngine("medium", 100);
    expect(eng.status).toBe("playing");
    expect(eng.rows.length).toBe(DIFFICULTIES.medium.rows);
    expect(eng.rows[0].tiles.length).toBe(DIFFICULTIES.medium.tilesPerRow);
  });

  it("placing a known-safe tile advances the level", () => {
    const eng = new TowersEngine("medium", 100, () => 0);
    // With rng=0, bombs always picked at index 0 → safe = 1
    const safeIdx = eng.rows[0].tiles.findIndex(
      (_, i) => !eng.rows[0].bombs.includes(i)
    );
    eng.pick(safeIdx);
    expect(eng.level).toBe(1);
    expect(eng.status).toBe("playing");
  });

  it("hitting a bomb ends the game", () => {
    const eng = new TowersEngine("medium", 100, () => 0);
    const bomb = eng.rows[0].bombs[0];
    const r = eng.pick(bomb);
    expect(r.hit).toBe("bomb");
    expect(eng.status).toBe("lost");
  });

  it("cashOut after one safe step pays bet × current multiplier", () => {
    const eng = new TowersEngine("hard", 100, () => 0);
    const safeIdx = eng.rows[0].tiles.findIndex(
      (_, i) => !eng.rows[0].bombs.includes(i)
    );
    eng.pick(safeIdx);
    const expected = 100 * levelMultiplier("hard", 1);
    expect(eng.potentialPayout()).toBeCloseTo(expected, 2);
    const payout = eng.cashOut();
    expect(eng.status).toBe("cashed");
    expect(payout).toBeCloseTo(expected, 2);
  });

  it("cashOut at level 0 pays nothing", () => {
    const eng = new TowersEngine("easy", 100);
    expect(eng.cashOut()).toBe(0);
  });

  it("clearing the top row auto-cashes", () => {
    const eng = new TowersEngine("hard", 100, () => 0);
    for (let r = 0; r < DIFFICULTIES.hard.rows; r++) {
      const safe = eng.rows[r].tiles.findIndex(
        (_, i) => !eng.rows[r].bombs.includes(i)
      );
      eng.pick(safe);
    }
    expect(eng.status).toBe("cashed");
  });
});
