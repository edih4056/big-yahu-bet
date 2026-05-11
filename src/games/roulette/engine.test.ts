import { describe, it, expect } from "vitest";
import {
  RouletteEngine,
  betWins,
  betPayout,
  colorOf,
  PAYOUT,
  type Bet,
} from "./engine";

const mkBet = (
  kind: Bet["kind"],
  numbers: number[],
  amount = 10
): Bet => ({ id: "x", kind, numbers, amount });

describe("colorOf", () => {
  it("zero is green", () => {
    expect(colorOf(0)).toBe("green");
  });
  it("standard reds are red", () => {
    [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].forEach(
      (n) => expect(colorOf(n)).toBe("red")
    );
  });
  it("standard blacks are black", () => {
    [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].forEach(
      (n) => expect(colorOf(n)).toBe("black")
    );
  });
});

describe("bet wins / payouts", () => {
  it("straight up pays 35:1 plus stake", () => {
    const b = mkBet("straight", [17], 10);
    expect(betWins(b, 17)).toBe(true);
    expect(betPayout(b, 17)).toBe(10 * (PAYOUT.straight + 1));
    expect(betPayout(b, 18)).toBe(0);
  });

  it("red wins on red, loses on black and zero", () => {
    const b = mkBet("red", [], 10);
    expect(betWins(b, 1)).toBe(true);
    expect(betWins(b, 2)).toBe(false);
    expect(betWins(b, 0)).toBe(false);
  });

  it("even loses on zero", () => {
    expect(betWins(mkBet("even", []), 0)).toBe(false);
    expect(betWins(mkBet("even", []), 4)).toBe(true);
  });

  it("dozen 1 covers 1-12 only", () => {
    const b = mkBet("dozen1", []);
    expect(betWins(b, 1)).toBe(true);
    expect(betWins(b, 12)).toBe(true);
    expect(betWins(b, 13)).toBe(false);
    expect(betWins(b, 0)).toBe(false);
  });

  it("column 1 contains 1, 4, 7, ...", () => {
    const b = mkBet("col1", []);
    expect(betWins(b, 1)).toBe(true);
    expect(betWins(b, 4)).toBe(true);
    expect(betWins(b, 34)).toBe(true);
    expect(betWins(b, 2)).toBe(false);
    expect(betWins(b, 0)).toBe(false);
  });
});

describe("RouletteEngine", () => {
  it("forced spin produces deterministic payouts", () => {
    const eng = new RouletteEngine();
    eng.placeBet({ kind: "straight", numbers: [7], amount: 10 });
    eng.placeBet({ kind: "red", numbers: [], amount: 5 });
    const r = eng.spin(7);
    expect(r.number).toBe(7);
    // 7 is red, so both bets win: 10 * 36 + 5 * 2 = 370
    expect(r.totalWin).toBe(10 * 36 + 5 * 2);
  });

  it("clearing bets returns no stake from the engine, and totalStaked drops", () => {
    const eng = new RouletteEngine();
    eng.placeBet({ kind: "black", numbers: [], amount: 50 });
    expect(eng.totalStaked()).toBe(50);
    eng.clearBets();
    expect(eng.totalStaked()).toBe(0);
  });
});
