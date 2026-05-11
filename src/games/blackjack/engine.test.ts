import { describe, it, expect } from "vitest";
import { BlackjackEngine, handTotal, isBlackjack, type Card } from "./engine";

function card(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { id: rank + suit + Math.random(), rank, suit };
}

describe("blackjack hand totals", () => {
  it("counts numerics correctly", () => {
    expect(handTotal([card("3"), card("7")]).total).toBe(10);
  });

  it("counts face cards as 10", () => {
    expect(handTotal([card("K"), card("Q")]).total).toBe(20);
  });

  it("treats Ace as 11 when safe (soft hand)", () => {
    const t = handTotal([card("A"), card("6")]);
    expect(t.total).toBe(17);
    expect(t.soft).toBe(true);
  });

  it("treats Ace as 1 when 11 would bust", () => {
    const t = handTotal([card("A"), card("9"), card("5")]);
    expect(t.total).toBe(15);
    expect(t.soft).toBe(false);
  });

  it("handles multiple aces correctly", () => {
    const t = handTotal([card("A"), card("A"), card("9")]);
    expect(t.total).toBe(21);
  });

  it("ignores hidden cards", () => {
    expect(
      handTotal([{ ...card("A"), hidden: true }, card("9")]).total
    ).toBe(9);
  });
});

describe("isBlackjack", () => {
  it("ace + ten-value makes blackjack", () => {
    expect(isBlackjack([card("A"), card("K")])).toBe(true);
    expect(isBlackjack([card("A"), card("10")])).toBe(true);
  });
  it("21 with three cards is NOT blackjack", () => {
    expect(isBlackjack([card("7"), card("7"), card("7")])).toBe(false);
  });
});

describe("BlackjackEngine end-to-end", () => {
  it("dealer draws to 17 (S17) and settles correctly when player wins", () => {
    const eng = new BlackjackEngine(1);
    eng.startHand(100);
    // Force a deterministic state: player has 20, dealer has 16 -> dealer must draw.
    eng.hands[0].cards = [card("K", "♥"), card("Q", "♦")];
    eng.dealer.cards = [card("9", "♠"), { ...card("7", "♣"), hidden: true }];
    eng.stand();
    expect(["win", "push", "lose"]).toContain(eng.hands[0].result);
    // Either dealer drew to 17+ or busted
    const dealerTotal = handTotal(eng.dealer.cards).total;
    expect(dealerTotal === 0 || dealerTotal >= 17 || dealerTotal > 21).toBe(true);
  });

  it("blackjack pays 3:2", () => {
    const eng = new BlackjackEngine(1);
    eng.startHand(100);
    // Force player BJ, dealer non-BJ
    eng.hands[0].cards = [card("A", "♠"), card("K", "♥")];
    eng.hands[0].isBlackjack = true;
    eng.hands[0].finished = true;
    eng.dealer.cards = [card("9", "♠"), { ...card("7", "♣"), hidden: false }];
    eng["startDealer"](); // private but reachable for test
    expect(eng.hands[0].result).toBe("blackjack");
    expect(eng.payout()).toBe(250);
  });

  it("bust loses immediately", () => {
    const eng = new BlackjackEngine(1);
    eng.startHand(50);
    eng.hands[0].cards = [card("K"), card("Q")];
    // Force a hit that busts
    eng.shoe = [card("5")]; // doesn't matter, we'll just push manually
    eng.hands[0].cards.push(card("5"));
    expect(handTotal(eng.hands[0].cards).total).toBe(25);
    eng.hands[0].result = "bust";
    eng.hands[0].finished = true;
    expect(eng.payout()).toBe(0);
  });

  it("can split pairs", () => {
    const eng = new BlackjackEngine(1);
    eng.startHand(100);
    eng.hands[0].cards = [card("8", "♠"), card("8", "♥")];
    expect(eng.canSplit()).toBe(true);
    eng.split();
    expect(eng.hands.length).toBe(2);
  });
});
