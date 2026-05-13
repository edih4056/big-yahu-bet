import { describe, it, expect } from "vitest";
import { MinesEngine, minesMultiplier, buildMultiplierTable } from "./engine";

describe("minesMultiplier", () => {
  it("multiplier 1.0 at 0 reveals", () => {
    expect(minesMultiplier(25, 5, 0)).toBe(1);
  });
  it("strictly increasing in revealed for fixed bombs", () => {
    const t = buildMultiplierTable(25, 3);
    for (let i = 1; i < t.length; i++) {
      expect(t[i]).toBeGreaterThan(t[i - 1]);
    }
  });
  it("more bombs gives higher multiplier at same level", () => {
    expect(minesMultiplier(25, 10, 3)).toBeGreaterThan(
      minesMultiplier(25, 3, 3)
    );
  });
});

describe("MinesEngine", () => {
  it("rejects invalid bomb counts", () => {
    expect(() => new MinesEngine(25, 0, 100)).toThrow();
    expect(() => new MinesEngine(25, 25, 100)).toThrow();
  });

  it("reveals safe tiles and advances multiplier", () => {
    const eng = new MinesEngine(25, 5, 100, () => 0);
    // With rng=0 bombs picked sequentially from index 0 → first safe = index 5
    const r = eng.pick(20);
    expect(r.hit).toBe("safe");
    expect(eng.revealedSafe).toBe(1);
    expect(eng.currentMultiplier()).toBeGreaterThan(1);
  });

  it("bomb hit ends the game and reveals the board", () => {
    const eng = new MinesEngine(25, 5, 100, () => 0);
    const bomb = [...eng.bombSet][0];
    const r = eng.pick(bomb);
    expect(r.hit).toBe("bomb");
    expect(eng.status).toBe("lost");
    expect(eng.tiles.every((t) => t !== "hidden")).toBe(true);
  });

  it("cashOut after safe pick pays bet × multiplier", () => {
    const eng = new MinesEngine(25, 5, 200, () => 0);
    const bombs = new Set(eng.bombSet);
    let firstSafe = -1;
    for (let i = 0; i < 25; i++) if (!bombs.has(i)) { firstSafe = i; break; }
    eng.pick(firstSafe);
    const expected = 200 * minesMultiplier(25, 5, 1);
    expect(eng.cashOut()).toBeCloseTo(expected, 2);
    expect(eng.status).toBe("cashed");
  });

  it("cashOut at 0 reveals pays 0", () => {
    const eng = new MinesEngine(25, 3, 100);
    expect(eng.cashOut()).toBe(0);
  });

  it("clearing the board auto-cashes", () => {
    const eng = new MinesEngine(9, 1, 100, () => 0);
    let safeCount = 0;
    for (let i = 0; i < 9 && eng.status === "playing"; i++) {
      if (!eng.bombSet.has(i)) {
        eng.pick(i);
        safeCount++;
      }
    }
    expect(eng.status).toBe("cashed");
    expect(safeCount).toBe(8);
  });
});
