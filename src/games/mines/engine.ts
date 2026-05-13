/**
 * Mines / "Bombs" engine — Stake-style.
 *
 * Player chooses a board (default 5×5 = 25 tiles) and how many bombs are
 * hidden (1 ≤ bombs ≤ TOTAL-1). They reveal tiles one by one; each safe tile
 * boosts the multiplier and they can cash out any time. Hitting a bomb ends
 * the round.
 *
 * Multiplier model (provably-fair / Stake-like, 1% house edge):
 *   mult(k) = (1 - HOUSE_EDGE) * C(N, k) / C(N - B, k)
 * where N = total tiles, B = bombs, k = tiles successfully revealed.
 */

const HOUSE_EDGE = 0.01;

export type Tile = "hidden" | "safe" | "bomb" | "revealed-safe" | "revealed-bomb";

export type GameStatus = "playing" | "lost" | "cashed";

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let v = 1;
  for (let i = 0; i < k; i++) {
    v = (v * (n - i)) / (i + 1);
  }
  return v;
}

export function minesMultiplier(total: number, bombs: number, revealed: number): number {
  if (revealed <= 0) return 1;
  const safe = total - bombs;
  if (revealed > safe) return 0;
  // C(total, revealed) / C(safe, revealed), with 1% edge
  const m = (comb(total, revealed) / comb(safe, revealed)) * (1 - HOUSE_EDGE);
  return Math.round(m * 100) / 100;
}

export function buildMultiplierTable(total: number, bombs: number): number[] {
  const safe = total - bombs;
  const out: number[] = [];
  for (let k = 1; k <= safe; k++) out.push(minesMultiplier(total, bombs, k));
  return out;
}

export class MinesEngine {
  total: number;
  bombs: number;
  bet: number;
  /** Array of tile states, length = total */
  tiles: Tile[];
  /** Bomb positions, hidden from caller view but accessible for testing */
  bombSet: Set<number>;
  status: GameStatus = "playing";
  revealedSafe = 0;
  rng: () => number;

  constructor(
    total: number,
    bombs: number,
    bet: number,
    rng: () => number = Math.random
  ) {
    if (bombs < 1 || bombs >= total) {
      throw new Error("bombs must be in [1, total-1]");
    }
    this.total = total;
    this.bombs = bombs;
    this.bet = bet;
    this.rng = rng;
    this.tiles = Array<Tile>(total).fill("hidden");
    this.bombSet = this.pickBombs();
  }

  private pickBombs(): Set<number> {
    const pool = Array.from({ length: this.total }, (_, i) => i);
    const out = new Set<number>();
    for (let i = 0; i < this.bombs; i++) {
      const j = Math.floor(this.rng() * pool.length);
      out.add(pool.splice(j, 1)[0]);
    }
    return out;
  }

  currentMultiplier(): number {
    return minesMultiplier(this.total, this.bombs, this.revealedSafe);
  }

  potentialPayout(): number {
    return Math.floor(this.bet * this.currentMultiplier() * 100) / 100;
  }

  pick(idx: number): { hit: "safe" | "bomb" } {
    if (this.status !== "playing") {
      throw new Error("game not in progress");
    }
    if (idx < 0 || idx >= this.total) throw new Error("out of range");
    if (this.tiles[idx] !== "hidden") {
      throw new Error("tile already revealed");
    }
    if (this.bombSet.has(idx)) {
      this.tiles[idx] = "revealed-bomb";
      this.revealRemaining();
      this.status = "lost";
      return { hit: "bomb" };
    }
    this.tiles[idx] = "revealed-safe";
    this.revealedSafe++;
    if (this.revealedSafe === this.total - this.bombs) {
      // Cleared the board
      this.status = "cashed";
    }
    return { hit: "safe" };
  }

  cashOut(): number {
    if (this.status !== "playing" || this.revealedSafe === 0) return 0;
    const payout = this.potentialPayout();
    this.status = "cashed";
    return payout;
  }

  revealRemaining() {
    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[i] === "hidden") {
        this.tiles[i] = this.bombSet.has(i) ? "bomb" : "safe";
      }
    }
  }
}
