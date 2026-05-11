export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank =
  | "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export type Card = {
  id: string;
  rank: Rank;
  suit: Suit;
  hidden?: boolean;
};

export type HandResult =
  | "blackjack"
  | "win"
  | "push"
  | "lose"
  | "bust"
  | "surrender";

export type PlayerHand = {
  cards: Card[];
  bet: number;
  doubled: boolean;
  finished: boolean;
  result?: HandResult;
  fromSplit?: boolean;
  isBlackjack?: boolean;
};

export type DealerHand = { cards: Card[] };

export type GameState =
  | "betting"
  | "dealing"
  | "player"
  | "dealer"
  | "settled";

const RANKS: Rank[] = [
  "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
];
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

let cardSeq = 0;

function makeShoe(decks = 6): Card[] {
  const out: Card[] = [];
  for (let d = 0; d < decks; d++) {
    for (const s of SUITS) {
      for (const r of RANKS) {
        out.push({ id: `c${cardSeq++}`, rank: r, suit: s });
      }
    }
  }
  // Fisher-Yates
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function rankValue(r: Rank): number {
  if (r === "A") return 11;
  if (r === "K" || r === "Q" || r === "J") return 10;
  return parseInt(r, 10);
}

export function handTotal(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.hidden) continue;
    total += rankValue(c.rank);
    if (c.rank === "A") aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  // soft = at least one ace still counted as 11
  let acesAs11 = 0;
  let chk = 0;
  for (const c of cards) {
    if (c.hidden) continue;
    chk += rankValue(c.rank);
    if (c.rank === "A") acesAs11++;
  }
  while (chk > 21 && acesAs11 > 0) {
    chk -= 10;
    acesAs11--;
  }
  return { total, soft: acesAs11 > 0 };
}

export function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  const t = handTotal(cards).total;
  return t === 21;
}

export class BlackjackEngine {
  shoe: Card[] = [];
  decks: number;
  hands: PlayerHand[] = [];
  dealer: DealerHand = { cards: [] };
  state: GameState = "betting";
  activeHandIdx = 0;
  reshuffleAt: number;

  constructor(decks = 6) {
    this.decks = decks;
    this.shoe = makeShoe(decks);
    this.reshuffleAt = Math.floor(this.shoe.length * 0.25);
  }

  private draw(): Card {
    if (this.shoe.length <= this.reshuffleAt) {
      this.shoe = makeShoe(this.decks);
    }
    return this.shoe.pop()!;
  }

  startHand(bet: number) {
    this.hands = [{ cards: [], bet, doubled: false, finished: false }];
    this.dealer = { cards: [] };
    this.state = "dealing";
    this.activeHandIdx = 0;

    this.hands[0].cards.push(this.draw());
    this.dealer.cards.push(this.draw());
    this.hands[0].cards.push(this.draw());
    this.dealer.cards.push({ ...this.draw(), hidden: true });

    this.state = "player";

    if (isBlackjack(this.hands[0].cards)) {
      this.hands[0].isBlackjack = true;
      this.hands[0].finished = true;
      this.startDealer();
    }
  }

  canDouble(handIdx = this.activeHandIdx): boolean {
    const h = this.hands[handIdx];
    if (!h) return false;
    return h.cards.length === 2 && !h.doubled;
  }

  canSplit(handIdx = this.activeHandIdx): boolean {
    const h = this.hands[handIdx];
    if (!h) return false;
    if (this.hands.length >= 4) return false;
    if (h.cards.length !== 2) return false;
    return rankValue(h.cards[0].rank) === rankValue(h.cards[1].rank);
  }

  hit(): Card {
    const h = this.hands[this.activeHandIdx];
    const c = this.draw();
    h.cards.push(c);
    const t = handTotal(h.cards);
    if (t.total > 21) {
      h.finished = true;
      h.result = "bust";
      this.advance();
    } else if (t.total === 21) {
      h.finished = true;
      this.advance();
    }
    return c;
  }

  stand() {
    this.hands[this.activeHandIdx].finished = true;
    this.advance();
  }

  double(): Card {
    const h = this.hands[this.activeHandIdx];
    h.bet *= 2;
    h.doubled = true;
    const c = this.draw();
    h.cards.push(c);
    h.finished = true;
    if (handTotal(h.cards).total > 21) h.result = "bust";
    this.advance();
    return c;
  }

  split() {
    const h = this.hands[this.activeHandIdx];
    if (!this.canSplit()) return;
    const second = h.cards.pop()!;
    const newHand: PlayerHand = {
      cards: [second],
      bet: h.bet,
      doubled: false,
      finished: false,
      fromSplit: true,
    };
    h.fromSplit = true;
    h.cards.push(this.draw());
    newHand.cards.push(this.draw());
    // If splitting Aces: each gets one card and is finished
    if (second.rank === "A") {
      h.finished = true;
      newHand.finished = true;
    }
    this.hands.splice(this.activeHandIdx + 1, 0, newHand);
    if (h.finished) this.advance();
  }

  private advance() {
    while (
      this.activeHandIdx < this.hands.length &&
      this.hands[this.activeHandIdx].finished
    ) {
      this.activeHandIdx++;
    }
    if (this.activeHandIdx >= this.hands.length) {
      this.startDealer();
    }
  }

  private startDealer() {
    // Reveal the hole card
    for (const c of this.dealer.cards) c.hidden = false;
    this.state = "dealer";
    // If everyone busted or has BJ-only, dealer still reveals + may need to play if any non-bust hand exists.
    const hasLive = this.hands.some(
      (h) => h.result !== "bust" && handTotal(h.cards).total <= 21 && !h.isBlackjack
    );
    const anyBJ = this.hands.some((h) => h.isBlackjack);
    if (hasLive || anyBJ) this.dealerPlay();
    this.settle();
  }

  private dealerPlay() {
    while (true) {
      const t = handTotal(this.dealer.cards);
      // S17: dealer stands on all 17s (including soft 17)
      if (t.total >= 17) break;
      this.dealer.cards.push(this.draw());
    }
  }

  private settle() {
    const dealerTotal = handTotal(this.dealer.cards).total;
    const dealerBust = dealerTotal > 21;
    const dealerBJ = isBlackjack(this.dealer.cards);

    for (const h of this.hands) {
      if (h.result === "bust") continue;
      const ph = handTotal(h.cards).total;
      if (h.isBlackjack && !dealerBJ) {
        h.result = "blackjack";
      } else if (h.isBlackjack && dealerBJ) {
        h.result = "push";
      } else if (dealerBJ) {
        h.result = "lose";
      } else if (dealerBust) {
        h.result = "win";
      } else if (ph > dealerTotal) {
        h.result = "win";
      } else if (ph < dealerTotal) {
        h.result = "lose";
      } else {
        h.result = "push";
      }
    }
    this.state = "settled";
  }

  payout(): number {
    let total = 0;
    for (const h of this.hands) {
      if (!h.result) continue;
      if (h.result === "blackjack") total += h.bet * 2.5;
      else if (h.result === "win") total += h.bet * 2;
      else if (h.result === "push") total += h.bet;
      // lose / bust: 0
    }
    return total;
  }

  // Net profit/loss across all hands (winnings minus the original bets that were taken).
  net(originalTotalBet: number): number {
    return this.payout() - originalTotalBet;
  }
}
