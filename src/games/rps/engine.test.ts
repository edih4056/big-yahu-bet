import { describe, it, expect } from "vitest";
import {
  pickSignRandom,
  RPS_WIN_MULT,
  rpsOutcome,
  settleRps,
  SIGNS,
} from "./engine";

describe("rpsOutcome", () => {
  it("ties when signs match", () => {
    for (const s of SIGNS) expect(rpsOutcome(s, s)).toBe("tie");
  });
  it("classic results", () => {
    expect(rpsOutcome("rock", "scissors")).toBe("win");
    expect(rpsOutcome("scissors", "paper")).toBe("win");
    expect(rpsOutcome("paper", "rock")).toBe("win");
    expect(rpsOutcome("rock", "paper")).toBe("lose");
    expect(rpsOutcome("scissors", "rock")).toBe("lose");
    expect(rpsOutcome("paper", "scissors")).toBe("lose");
  });
});

describe("pickSignRandom", () => {
  it("rng=0 → rock, rng~0.5 → paper, rng~1 → scissors", () => {
    expect(pickSignRandom(() => 0)).toBe("rock");
    expect(pickSignRandom(() => 0.5)).toBe("paper");
    expect(pickSignRandom(() => 0.99)).toBe("scissors");
  });
});

describe("RPS_WIN_MULT", () => {
  it("yields ~99% RTP", () => {
    const ev = RPS_WIN_MULT / 3 + 1 / 3; // P(win)=1/3 with stake-back tie
    expect(ev).toBeCloseTo(0.99, 4);
  });
});

describe("settleRps", () => {
  it("win pays bet × WIN_MULT", () => {
    const r = settleRps(100, "rock", () => 0.99); // server = scissors → win
    expect(r.outcome).toBe("win");
    expect(r.payout).toBeCloseTo(100 * RPS_WIN_MULT, 4);
  });
  it("tie returns bet", () => {
    const r = settleRps(100, "rock", () => 0); // server = rock → tie
    expect(r.outcome).toBe("tie");
    expect(r.payout).toBe(100);
  });
  it("loss pays 0", () => {
    const r = settleRps(100, "rock", () => 0.5); // server = paper → lose
    expect(r.outcome).toBe("lose");
    expect(r.payout).toBe(0);
  });
});
