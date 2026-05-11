import { describe, it, expect } from "vitest";
import { SlotEngine } from "./engine";
import type { SlotConfig } from "./types";

// Build a deterministic, hand-crafted reel set so the spin produces a known matrix
// with the default rng (always returning 0 → stop index 0 on every reel).
function deterministicConfig(): SlotConfig {
  // 5x3: with stop=0, row[1] (middle) = strip[0]. For all-C middle row,
  // place "C" at index 0 of each strip.
  const reel = ["C", "X", "X", "X"]; // matrix => [X, C, X]
  return {
    reels: [reel.slice(), reel.slice(), reel.slice(), reel.slice(), reel.slice()],
    paylines: [[1, 1, 1, 1, 1]], // middle row only
    paytable: {
      C: { 5: 100 },
      X: { 5: 50 },
    },
    scatterSymbol: "S",
    scatterPaytable: { 3: 10, 4: 20, 5: 100 },
  };
}

describe("SlotEngine", () => {
  it("evaluates a single line winner with fixed rng", () => {
    const cfg = deterministicConfig();
    const eng = new SlotEngine(cfg, () => 0); // stop on index 0 for all
    const r = eng.spin(10, 50);
    // matrix middle row = strip[0] = "C" on all reels → 5x C
    const allMiddleC = r.matrix.every((reel) => reel[1] === "C");
    expect(allMiddleC).toBe(true);
    expect(r.wins.length).toBe(1);
    expect(r.wins[0].count).toBe(5);
    expect(r.wins[0].symbol).toBe("C");
    expect(r.totalWin).toBe(100 * 10);
  });

  it("returns no wins when symbols don't line up", () => {
    const cfg: SlotConfig = {
      reels: [
        ["A", "B", "C"],
        ["B", "C", "A"],
        ["C", "A", "B"],
        ["A", "B", "C"],
        ["B", "C", "A"],
      ],
      paylines: [[1, 1, 1, 1, 1]],
      paytable: { A: { 5: 100 }, B: { 5: 50 }, C: { 5: 25 } },
    };
    const eng = new SlotEngine(cfg, () => 0);
    const r = eng.spin(10, 50);
    expect(r.totalWin).toBe(0);
  });

  it("scatter pays on total bet regardless of position", () => {
    const cfg: SlotConfig = {
      // With stop=0: matrix = [strip[len-1], strip[0], strip[1]]. Place S at index 0.
      reels: [
        ["S", "X", "X"],
        ["S", "X", "X"],
        ["S", "X", "X"],
        ["X", "X", "X"],
        ["X", "X", "X"],
      ],
      paylines: [[1, 1, 1, 1, 1]],
      paytable: { X: { 5: 0 } },
      scatterSymbol: "S",
      scatterPaytable: { 3: 10, 4: 20, 5: 100 },
    };
    const eng = new SlotEngine(cfg, () => 0);
    const r = eng.spin(1, 25);
    expect(r.scatter?.count).toBe(3);
    expect(r.totalWin).toBe(10 * 25); // 3 scatters × 25 total bet
  });

  it("wild substitutes for missing symbols", () => {
    const cfg: SlotConfig = {
      // With stop=0, middle = strip[0]. Reels 1+3+4+5 middle=C, reel 2 middle=W.
      reels: [
        ["C", "X", "X"],
        ["W", "X", "X"],
        ["C", "X", "X"],
        ["C", "X", "X"],
        ["C", "X", "X"],
      ],
      paylines: [[1, 1, 1, 1, 1]],
      paytable: { C: { 5: 100 } },
      wildSymbol: "W",
    };
    const eng = new SlotEngine(cfg, () => 0);
    const r = eng.spin(10, 50);
    expect(r.wins.length).toBe(1);
    expect(r.wins[0].count).toBe(5);
    expect(r.wins[0].symbol).toBe("C");
  });

  it("triggers free spins on 3+ scatters", () => {
    const cfg: SlotConfig = {
      reels: [
        ["B", "X", "X"],
        ["B", "X", "X"],
        ["B", "X", "X"],
        ["X", "X", "X"],
        ["X", "X", "X"],
      ],
      paylines: [[1, 1, 1, 1, 1]],
      paytable: { X: { 5: 0 } },
      scatterSymbol: "B",
      wildSymbol: "B",
      scatterPaytable: { 3: 2, 4: 20, 5: 200 },
      freeSpinsOn: { symbol: "B", count: 3, freeSpins: 10 },
    };
    const eng = new SlotEngine(cfg, () => 0);
    const r = eng.spin(1, 10);
    expect(r.freeSpinsTriggered).toBe(10);
  });

  it("expanding symbol fills entire reel during free spins", () => {
    const cfg: SlotConfig = {
      reels: [["X", "X", "X"]],
      paylines: [[1, 1, 1, 1, 1]],
      paytable: {},
    };
    const eng = new SlotEngine(cfg, () => 0);
    const freeReels = [
      ["P", "X", "X"], // matrix col 0 = [X,P,X]; contains P → expand
      ["X", "X", "X"],
      ["X", "X", "X"],
      ["X", "X", "X"],
      ["X", "X", "X"],
    ];
    const r = eng.spinFree(freeReels, 1, 10, "P");
    expect(r.expandingReels).toContain(0);
    expect(r.matrix[0]).toEqual(["P", "P", "P"]);
  });
});
