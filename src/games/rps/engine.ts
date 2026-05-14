/**
 * Rock Paper Scissors — pick a sign, server picks one uniformly at random.
 *
 *   Win:  player beats server  → payout = bet × WIN_MULT
 *   Tie:  same sign            → payout = bet (push, no profit)
 *   Lose: server beats player  → payout = 0
 *
 * With ties returning the bet, expected return = WIN_MULT/3 + 1/3.
 * For 1% house edge: WIN_MULT = 3 × (0.99 - 1/3) ≈ 1.97.
 */

const HOUSE_EDGE = 0.01;
export const RPS_WIN_MULT = 3 * (1 - HOUSE_EDGE - 1 / 3); // ≈ 1.97

export type Sign = "rock" | "paper" | "scissors";
export const SIGNS: Sign[] = ["rock", "paper", "scissors"];

export type RpsOutcome = "win" | "tie" | "lose";

export type RpsResult = {
  pick: Sign;
  server: Sign;
  outcome: RpsOutcome;
  payout: number;
};

const BEATS: Record<Sign, Sign> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

export function rpsOutcome(pick: Sign, server: Sign): RpsOutcome {
  if (pick === server) return "tie";
  return BEATS[pick] === server ? "win" : "lose";
}

export function pickSignRandom(rng: () => number = Math.random): Sign {
  return SIGNS[Math.floor(rng() * 3)];
}

export function settleRps(
  bet: number,
  pick: Sign,
  rng: () => number = Math.random
): RpsResult {
  const server = pickSignRandom(rng);
  const outcome = rpsOutcome(pick, server);
  const payout =
    outcome === "win"
      ? bet * RPS_WIN_MULT
      : outcome === "tie"
        ? bet // push: stake is returned
        : 0;
  return { pick, server, outcome, payout };
}
