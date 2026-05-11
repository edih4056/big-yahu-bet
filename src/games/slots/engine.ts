import type {
  SlotConfig,
  SpinResult,
  Symbol,
  WinLine,
  ScatterWin,
} from "./types";

export class SlotEngine {
  cfg: SlotConfig;
  rng: () => number;

  constructor(cfg: SlotConfig, rng: () => number = Math.random) {
    this.cfg = cfg;
    this.rng = rng;
  }

  private pickStops(reels: Symbol[][]): number[] {
    return reels.map((r) => Math.floor(this.rng() * r.length));
  }

  private buildMatrix(stops: number[], reels: Symbol[][]): Symbol[][] {
    const m: Symbol[][] = [];
    for (let c = 0; c < reels.length; c++) {
      const strip = reels[c];
      const stop = stops[c];
      m[c] = [
        strip[(stop + strip.length - 1) % strip.length],
        strip[stop],
        strip[(stop + 1) % strip.length],
      ];
    }
    return m;
  }

  private evalLines(matrix: Symbol[][]): WinLine[] {
    const wins: WinLine[] = [];
    const wild = this.cfg.wildSymbol;
    const scatter = this.cfg.scatterSymbol;

    this.cfg.paylines.forEach((line, idx) => {
      const seq: Symbol[] = matrix.map((reel, c) => reel[line[c]]);

      // Determine the matched symbol from the leftmost non-wild position.
      // If everything is wild, use the wild itself (or its paytable).
      let baseSym: Symbol | null = null;
      for (let i = 0; i < seq.length; i++) {
        if (seq[i] !== wild && seq[i] !== scatter) {
          baseSym = seq[i];
          break;
        }
      }
      if (!baseSym) baseSym = wild ?? null;
      if (!baseSym) return;
      if (baseSym === scatter) return; // scatters do not pay on lines

      let count = 0;
      for (let c = 0; c < seq.length; c++) {
        if (seq[c] === baseSym || (wild && seq[c] === wild)) count++;
        else break;
      }
      if (count < 2) return;
      const row = this.cfg.paytable[baseSym];
      if (!row) return;
      const mult =
        count === 5
          ? row[5]
          : count === 4
            ? row[4]
            : count === 3
              ? row[3]
              : row[2];
      if (!mult) return;
      const positions: Array<[number, number]> = [];
      for (let c = 0; c < count; c++) positions.push([c, line[c]]);
      wins.push({ lineIndex: idx, symbol: baseSym, count, payout: mult, positions });
    });
    return wins;
  }

  private evalScatter(matrix: Symbol[][]): ScatterWin | undefined {
    const sc = this.cfg.scatterSymbol;
    if (!sc) return;
    const positions: Array<[number, number]> = [];
    for (let c = 0; c < matrix.length; c++) {
      for (let r = 0; r < matrix[c].length; r++) {
        if (matrix[c][r] === sc) positions.push([c, r]);
      }
    }
    if (positions.length < 3) return;
    const mult = (this.cfg.scatterPaytable?.[positions.length as 3 | 4 | 5]) ?? 0;
    return { symbol: sc, count: positions.length, payout: mult, positions };
  }

  spin(linesBet: number, totalBet: number): SpinResult {
    const stops = this.pickStops(this.cfg.reels);
    const matrix = this.buildMatrix(stops, this.cfg.reels);
    return this.compute(matrix, linesBet, totalBet);
  }

  // Free-spin variant with optional expanding symbol
  spinFree(
    freeReels: Symbol[][],
    linesBet: number,
    totalBet: number,
    expandingSymbol?: Symbol
  ): SpinResult {
    const stops = this.pickStops(freeReels);
    let matrix = this.buildMatrix(stops, freeReels);
    const expandedReels: number[] = [];

    if (expandingSymbol) {
      // any reel containing the expanding symbol fills the entire reel
      for (let c = 0; c < matrix.length; c++) {
        if (matrix[c].includes(expandingSymbol)) {
          matrix[c] = [expandingSymbol, expandingSymbol, expandingSymbol];
          expandedReels.push(c);
        }
      }
    }

    const result = this.compute(matrix, linesBet, totalBet);
    if (expandedReels.length) {
      result.expandingSymbol = expandingSymbol;
      result.expandingReels = expandedReels;
    }
    return result;
  }

  private compute(
    matrix: Symbol[][],
    linesBet: number,
    totalBet: number
  ): SpinResult {
    const lineWins = this.evalLines(matrix);
    const scatterWin = this.evalScatter(matrix);
    let totalWin = 0;
    for (const w of lineWins) totalWin += w.payout * linesBet;
    if (scatterWin) totalWin += scatterWin.payout * totalBet;

    let freeSpinsTriggered = 0;
    if (this.cfg.freeSpinsOn) {
      const { symbol, count, freeSpins } = this.cfg.freeSpinsOn;
      let occ = 0;
      for (let c = 0; c < matrix.length; c++)
        for (let r = 0; r < matrix[c].length; r++)
          if (matrix[c][r] === symbol) occ++;
      if (occ >= count) freeSpinsTriggered = freeSpins;
    }

    return {
      matrix,
      wins: lineWins,
      scatter: scatterWin,
      totalWin,
      freeSpinsTriggered: freeSpinsTriggered || undefined,
    };
  }
}
