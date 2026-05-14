/**
 * "Pay-anywhere / tumble" slot engine.
 *
 * Used by both Sweet Bonanza 1000 and Gates of Olympus 1000:
 *   - 6 columns × 5 rows = 30 cells
 *   - Wins are by COUNT of a symbol anywhere on the grid (≥ 8 pays)
 *   - Tumble: winning symbols are removed, the rest drop down, the empty
 *     cells are refilled with fresh randoms, then evaluated again
 *   - Optional multiplier orbs (Gates of Olympus): a random symbol drops
 *     onto the grid alongside the regular symbols and carries a multiplier
 *     value (2×, 3×, 5×, 10×, …). When ANY paying win occurs in a tumble,
 *     all multiplier values currently on the grid are SUMMED and applied
 *     to that tumble's win. Multipliers are then cleared.
 */

export const COLS = 6;
export const ROWS = 5;

/** Multiplier tiers per symbol indexed by 'minimum count'. */
export type PaytableTier = { 8?: number; 10?: number; 12?: number };

export type ClusterSlotConfig = {
  symbols: string[];
  /** Pick weight per symbol (must align with `symbols`). */
  weights: number[];
  /** Multiplier-of-bet per (symbol, count tier). */
  paytable: Record<string, PaytableTier>;
  /** Optional multiplier orb (Gates of Olympus style). */
  multiplierOrb?: {
    /** Symbol marker for the orb cell. */
    symbol: string;
    /** Possible multiplier values per orb. */
    values: number[];
    /** Probability of an orb falling per cell, per spin. */
    perCellChance: number;
  };
};

export type GridCell =
  | { kind: "symbol"; symbol: string }
  | { kind: "orb"; value: number };

export type Grid = GridCell[][]; // grid[col][row], row=0 is the top.

export type TumbleWin = {
  symbol: string;
  count: number;
  /** Raw multiplier from the paytable (× bet). */
  baseMultiplier: number;
  payout: number;
};

export type TumbleStep = {
  /** Grid state at the START of this tumble (pre-evaluation). */
  grid: Grid;
  wins: TumbleWin[];
  /** Multiplier accumulated from orbs this tumble (0 if none). */
  orbMultiplier: number;
  /** Total win awarded this tumble (after orb mult applied). */
  totalWin: number;
};

export type SpinResult = {
  tumbles: TumbleStep[];
  totalWin: number;
};

export class ClusterSlot {
  cfg: ClusterSlotConfig;
  rng: () => number;
  constructor(cfg: ClusterSlotConfig, rng: () => number = Math.random) {
    this.cfg = cfg;
    this.rng = rng;
  }

  /** Pick a regular symbol from the weighted pool. */
  pickSymbol(): string {
    const total = this.cfg.weights.reduce((a, b) => a + b, 0);
    let r = this.rng() * total;
    for (let i = 0; i < this.cfg.symbols.length; i++) {
      r -= this.cfg.weights[i];
      if (r <= 0) return this.cfg.symbols[i];
    }
    return this.cfg.symbols[this.cfg.symbols.length - 1];
  }

  /** Maybe return an orb cell, else a regular symbol cell. */
  pickCell(): GridCell {
    const orb = this.cfg.multiplierOrb;
    if (orb && this.rng() < orb.perCellChance) {
      const v = orb.values[Math.floor(this.rng() * orb.values.length)];
      return { kind: "orb", value: v };
    }
    return { kind: "symbol", symbol: this.pickSymbol() };
  }

  makeGrid(): Grid {
    const grid: Grid = [];
    for (let c = 0; c < COLS; c++) {
      const col: GridCell[] = [];
      for (let r = 0; r < ROWS; r++) col.push(this.pickCell());
      grid.push(col);
    }
    return grid;
  }

  /** Apply paytable to current grid; returns wins (no payouts applied). */
  evaluate(grid: Grid, bet: number): { wins: TumbleWin[]; orbValueSum: number } {
    const counts = new Map<string, number>();
    let orbSum = 0;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const cell = grid[c][r];
        if (cell.kind === "symbol") {
          counts.set(cell.symbol, (counts.get(cell.symbol) ?? 0) + 1);
        } else {
          orbSum += cell.value;
        }
      }
    }
    const wins: TumbleWin[] = [];
    for (const [sym, count] of counts) {
      const tier = this.cfg.paytable[sym];
      if (!tier) continue;
      let mult = 0;
      if (count >= 12 && tier[12]) mult = tier[12]!;
      else if (count >= 10 && tier[10]) mult = tier[10]!;
      else if (count >= 8 && tier[8]) mult = tier[8]!;
      if (mult > 0) {
        wins.push({
          symbol: sym,
          count,
          baseMultiplier: mult,
          payout: bet * mult,
        });
      }
    }
    return { wins, orbValueSum: orbSum };
  }

  /** Remove winning symbols and orbs, drop the rest, refill the top. */
  tumble(grid: Grid, wins: TumbleWin[]): Grid {
    const winningSet = new Set(wins.map((w) => w.symbol));
    const out: Grid = [];
    for (let c = 0; c < COLS; c++) {
      const remaining: GridCell[] = [];
      for (let r = 0; r < ROWS; r++) {
        const cell = grid[c][r];
        // Orbs are also cleared after a paying win (Gates-of-Olympus rule);
        // but only on tumbles that scored.
        if (cell.kind === "orb") continue;
        if (winningSet.has(cell.symbol)) continue;
        remaining.push(cell);
      }
      // Refill top with new cells
      while (remaining.length < ROWS) remaining.unshift(this.pickCell());
      out.push(remaining);
    }
    return out;
  }

  spin(bet: number): SpinResult {
    let grid = this.makeGrid();
    const tumbles: TumbleStep[] = [];
    let total = 0;
    while (true) {
      const { wins, orbValueSum } = this.evaluate(grid, bet);
      let stepWin = wins.reduce((s, w) => s + w.payout, 0);
      // Orbs apply only when there's a paying win
      let orbMult = 0;
      if (wins.length > 0 && orbValueSum > 0) {
        orbMult = orbValueSum;
        stepWin *= orbMult;
      }
      tumbles.push({
        grid,
        wins,
        orbMultiplier: orbMult,
        totalWin: stepWin,
      });
      total += stepWin;
      if (wins.length === 0) break;
      // Limit max tumbles defensively (in pathological rng loops)
      if (tumbles.length >= 20) break;
      grid = this.tumble(grid, wins);
    }
    return { tumbles, totalWin: total };
  }
}
