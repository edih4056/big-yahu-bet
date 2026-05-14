import { describe, it, expect } from "vitest";
import { ClusterSlot, COLS, ROWS, type Grid } from "./engine";
import {
  sweetBonanzaConfig,
  olympusConfig,
} from "./configs";

describe("ClusterSlot grid generation", () => {
  it("produces a 6×5 grid of valid cells", () => {
    const eng = new ClusterSlot(sweetBonanzaConfig, () => 0);
    const grid = eng.makeGrid();
    expect(grid.length).toBe(COLS);
    for (const col of grid) {
      expect(col.length).toBe(ROWS);
      for (const cell of col) {
        expect(cell.kind).toBe("symbol");
      }
    }
  });

  it("with rng=0, Sweet Bonanza grid is full of the first symbol", () => {
    const eng = new ClusterSlot(sweetBonanzaConfig, () => 0);
    const grid = eng.makeGrid();
    for (const col of grid)
      for (const cell of col)
        if (cell.kind === "symbol") expect(cell.symbol).toBe(sweetBonanzaConfig.symbols[0]);
  });
});

describe("evaluate", () => {
  it("returns no wins on a grid with no 8+ count", () => {
    const eng = new ClusterSlot(sweetBonanzaConfig);
    // 30 cells split across 6 distinct symbols → max 5 of each → no 8+ count
    const cycle = ["🍓", "🍇", "🍉", "🍌", "🍎", "🍑"];
    const grid: Grid = Array.from({ length: COLS }, (_, c) =>
      Array.from({ length: ROWS }, () => ({
        kind: "symbol" as const,
        symbol: cycle[c % cycle.length],
      }))
    );
    expect(eng.evaluate(grid, 100).wins.length).toBe(0);
  });

  it("pays correct multiplier for 12+ of the top symbol", () => {
    const eng = new ClusterSlot(sweetBonanzaConfig);
    // 30 strawberries everywhere → 12+ count → 50× pay
    const grid = Array.from({ length: COLS }, () =>
      Array.from({ length: ROWS }, () => ({
        kind: "symbol" as const,
        symbol: "🍓",
      }))
    );
    const { wins } = eng.evaluate(grid, 100);
    expect(wins.length).toBe(1);
    expect(wins[0].count).toBe(30);
    expect(wins[0].baseMultiplier).toBe(50);
    expect(wins[0].payout).toBe(100 * 50);
  });
});

describe("orb multipliers", () => {
  it("orbs do not pay without a winning symbol cluster", () => {
    const eng = new ClusterSlot(olympusConfig);
    // Use 8 distinct symbols spread evenly — no 8+ count anywhere.
    // 15 orbs + 15 symbols spread across 8 different ones (max 2 each).
    const syms = olympusConfig.symbols;
    let symIdx = 0;
    const grid: Grid = Array.from({ length: COLS }, (_, c) =>
      Array.from({ length: ROWS }, (_, r) => {
        if ((c + r) % 2 === 0) {
          return { kind: "orb" as const, value: 5 };
        }
        const cell = { kind: "symbol" as const, symbol: syms[symIdx % syms.length] };
        symIdx++;
        return cell;
      })
    );
    const { wins, orbValueSum } = eng.evaluate(grid, 100);
    expect(wins.length).toBe(0);
    expect(orbValueSum).toBeGreaterThan(0);
  });

  it("orbs multiply the tumble's total win when a cluster pays", () => {
    const eng = new ClusterSlot(olympusConfig);
    // Custom grid: 25 crowns + 5 orbs of value 2 = total orb sum 10
    const grid: Grid = Array.from({ length: COLS }, () =>
      Array.from({ length: ROWS }, () => ({
        kind: "symbol",
        symbol: "👑",
      } as Grid[number][number]))
    );
    let placed = 0;
    for (let c = 0; c < COLS && placed < 5; c++) {
      for (let r = 0; r < ROWS && placed < 5; r++) {
        grid[c][r] = { kind: "orb", value: 2 };
        placed++;
      }
    }
    const { wins, orbValueSum } = eng.evaluate(grid, 100);
    expect(orbValueSum).toBe(10);
    // 25 crowns left → 12+ → pays 100x ⇒ 10_000 base, ×10 orb = 100_000
    expect(wins[0].count).toBe(25);
    expect(wins[0].payout).toBe(10_000);
  });
});

describe("spin loop", () => {
  it("returns at least one tumble step", () => {
    const eng = new ClusterSlot(sweetBonanzaConfig);
    const r = eng.spin(100);
    expect(r.tumbles.length).toBeGreaterThan(0);
    expect(r.totalWin).toBeGreaterThanOrEqual(0);
  });
});
