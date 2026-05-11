export type Symbol = string;

export type Paytable = Record<Symbol, Partial<Record<2 | 3 | 4 | 5, number>>>;

export type WinLine = {
  lineIndex: number;
  symbol: Symbol;
  count: number;
  payout: number;
  positions: Array<[number, number]>; // [reel, row]
};

export type ScatterWin = {
  symbol: Symbol;
  count: number;
  payout: number; // multiplier vs total bet
  positions: Array<[number, number]>;
};

export type SpinResult = {
  matrix: Symbol[][]; // [reel][row], 5x3
  wins: WinLine[];
  scatter?: ScatterWin;
  totalWin: number; // includes scatter multiplied by total bet
  freeSpinsTriggered?: number;
  expandingSymbol?: Symbol;
  expandingReels?: number[]; // reels expanded this spin
};

export type SlotConfig = {
  reels: Symbol[][];        // strips per reel
  paylines: number[][];     // lines as row indices for each reel column
  paytable: Paytable;
  scatterSymbol?: Symbol;
  wildSymbol?: Symbol;
  scatterPaytable?: Partial<Record<3 | 4 | 5, number>>; // x total bet
  freeSpinsOn?: { symbol: Symbol; count: number; freeSpins: number };
};
