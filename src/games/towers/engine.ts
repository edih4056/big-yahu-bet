export type Difficulty = "easy" | "medium" | "hard" | "extreme";

export type DifficultyConfig = {
  tilesPerRow: number;
  bombsPerRow: number;
  rows: number;
  // theoretical fair multiplier per level = tilesPerRow / safePerRow
  // applied multiplier per level = fair * (1 - houseEdge)
};

// Settings tuned to mirror the public mycasino.ch / Stake-style "Towers"
// (a.k.a. "Dragon Tower") algorithm. RTP ≈ 99% (1% house edge).
const HOUSE_EDGE = 0.01;

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy:    { tilesPerRow: 4, bombsPerRow: 1, rows: 9 }, // 3 safe / 1 bomb
  medium:  { tilesPerRow: 3, bombsPerRow: 1, rows: 9 }, // 2 safe / 1 bomb
  hard:    { tilesPerRow: 2, bombsPerRow: 1, rows: 9 }, // 1 safe / 1 bomb
  extreme: { tilesPerRow: 3, bombsPerRow: 2, rows: 9 }, // 1 safe / 2 bombs
};

export function levelMultiplier(d: Difficulty, level: number): number {
  if (level <= 0) return 1;
  const cfg = DIFFICULTIES[d];
  const safe = cfg.tilesPerRow - cfg.bombsPerRow;
  const fairPerStep = cfg.tilesPerRow / safe;
  const stepMult = fairPerStep * (1 - HOUSE_EDGE);
  return round2(Math.pow(stepMult, level));
}

export function buildMultipliers(d: Difficulty): number[] {
  const cfg = DIFFICULTIES[d];
  const out: number[] = [];
  for (let i = 1; i <= cfg.rows; i++) out.push(levelMultiplier(d, i));
  return out;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type TileState = "hidden" | "safe" | "bomb" | "revealed-safe" | "revealed-bomb";

export type RowState = {
  tiles: TileState[];     // length = tilesPerRow
  bombs: number[];        // indexes of bombs in this row (hidden until reveal)
  picked?: number;        // index the player picked (if any)
};

export type GameStatus = "idle" | "playing" | "lost" | "cashed";

export class TowersEngine {
  difficulty: Difficulty;
  bet: number;
  rows: RowState[];
  level = 0;          // number of cleared rows
  status: GameStatus = "idle";
  rng: () => number;

  constructor(difficulty: Difficulty, bet: number, rng: () => number = Math.random) {
    this.difficulty = difficulty;
    this.bet = bet;
    this.rng = rng;
    this.rows = this.generateBoard();
    this.status = "playing";
  }

  private generateBoard(): RowState[] {
    const cfg = DIFFICULTIES[this.difficulty];
    const out: RowState[] = [];
    for (let r = 0; r < cfg.rows; r++) {
      const idx = this.pickBombs(cfg.tilesPerRow, cfg.bombsPerRow);
      out.push({
        tiles: Array<TileState>(cfg.tilesPerRow).fill("hidden"),
        bombs: idx,
      });
    }
    return out;
  }

  private pickBombs(total: number, k: number): number[] {
    const pool = Array.from({ length: total }, (_, i) => i);
    const out: number[] = [];
    for (let i = 0; i < k; i++) {
      const j = Math.floor(this.rng() * pool.length);
      out.push(pool.splice(j, 1)[0]);
    }
    return out.sort((a, b) => a - b);
  }

  currentMultiplier(): number {
    return levelMultiplier(this.difficulty, this.level);
  }

  nextMultiplier(): number {
    return levelMultiplier(this.difficulty, this.level + 1);
  }

  potentialPayout(): number {
    return Math.floor(this.bet * this.currentMultiplier() * 100) / 100;
  }

  pick(tileIndex: number): { hit: "safe" | "bomb"; row: number } {
    if (this.status !== "playing") {
      throw new Error("Cannot pick: game not in progress");
    }
    const row = this.rows[this.level];
    if (tileIndex < 0 || tileIndex >= row.tiles.length) {
      throw new Error("Invalid tile index");
    }
    if (row.picked !== undefined) {
      throw new Error("Row already played");
    }
    row.picked = tileIndex;

    const isBomb = row.bombs.includes(tileIndex);
    if (isBomb) {
      row.tiles[tileIndex] = "revealed-bomb";
      // Reveal all bombs in this row, mark remaining as safe (visual)
      for (let i = 0; i < row.tiles.length; i++) {
        if (row.tiles[i] === "hidden") {
          row.tiles[i] = row.bombs.includes(i) ? "bomb" : "safe";
        }
      }
      this.status = "lost";
      return { hit: "bomb", row: this.level };
    }

    row.tiles[tileIndex] = "revealed-safe";
    this.level++;
    if (this.level >= this.rows.length) {
      // top of tower → auto cash-out
      this.status = "cashed";
    }
    return { hit: "safe", row: this.level - 1 };
  }

  cashOut(): number {
    if (this.status !== "playing" || this.level === 0) return 0;
    this.status = "cashed";
    return this.potentialPayout();
  }

  // For game-over reveal: expose the full board
  revealAll() {
    for (let r = 0; r < this.rows.length; r++) {
      const row = this.rows[r];
      for (let i = 0; i < row.tiles.length; i++) {
        if (row.tiles[i] === "hidden") {
          row.tiles[i] = row.bombs.includes(i) ? "bomb" : "safe";
        }
      }
    }
  }
}
