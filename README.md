# Big Yahu Bet — Demo Casino Showcase

> ⚠️ **DEMO MODE — PLAY MONEY ONLY — NOT REAL GAMBLING**
>
> Big Yahu Bet is a fictional, client-side **demo** casino built as a
> learning / showcase project. **No real money is used.** No deposits, no
> withdrawals, no crypto integration, no gambling licenses. All "coins" are
> play-money tokens that reset locally in your browser. The site does not
> accept any wager and does not award any prize of monetary value.
>
> Please play responsibly. If real-money gambling is a problem for you or
> someone you know, contact organizations like **BZgA** (Germany) or
> **GamCare** (UK) for help.

---

## What's inside

A single-page React app with four playable casino games:

1. **Sizzling Fruits** — classic 5×3 fruit slot, 5 fixed paylines, scatter, neon win-line highlights.
2. **Book of Yahu** — 5×3 adventure-themed slot, 10 lines, Wild + Scatter "Book", Free Spins (10) with a randomly chosen Expanding Symbol.
3. **Blackjack 21** — 6-deck shoe, dealer stands on soft 17 (S17), Blackjack pays 3:2, splits, double, configurable in the engine.
4. **European Roulette** — single-zero wheel, full inside/outside bet table, history, hot/cold tracker, animated SVG wheel.

Plus a Rainbet-inspired lobby (hero carousel, recent-wins ticker, horizontal game rows, promotions, profile, wallet modal).

## Tech stack

- React 18 + TypeScript + Vite
- TailwindCSS (custom theme)
- Zustand (with `persist` to `localStorage`) for the wallet/user state
- React Router v6
- Framer Motion for animations
- Howler.js for sound (synth tones generated at runtime → no audio assets needed)
- canvas-confetti for big-win celebrations
- lucide-react for icons
- Vitest for engine unit tests

## Project layout

```
src/
├── App.tsx                     // routes
├── main.tsx
├── index.css                   // tailwind layers + casino theme
├── components/                 // navbar, sidebar, footer, lobby pieces, modals
├── pages/                      // home, casino, slots, table-games, profile, etc.
├── store/walletStore.ts        // zustand store, persisted in localStorage
├── lib/
│   ├── games.ts                // game catalog (mocks + real)
│   ├── format.ts               // number formatting
│   ├── sound.ts                // Howler-based SFX manager (synth tones)
│   ├── confetti.ts
│   └── tickerData.ts
└── games/
    ├── slots/
    │   ├── types.ts
    │   ├── engine.ts           // pure TS — fully unit tested
    │   ├── sizzlingFruits.ts   // reel strips + paytable
    │   ├── bookOfYahu.ts       // base + free-spin reels, expanding-symbol picker
    │   ├── SlotMachine.tsx     // shared slot UI
    │   └── engine.test.ts
    ├── blackjack/
    │   ├── engine.ts           // pure TS — totals, soft hands, splits, dealer logic
    │   ├── Card.tsx            // SVG-style card with 3D-flip animation
    │   └── engine.test.ts
    └── roulette/
        ├── engine.ts           // pure TS — 16 bet kinds, payouts, RNG-injectable
        ├── Wheel.tsx           // animated SVG wheel
        └── engine.test.ts
```

The three game engines are framework-free TypeScript classes. The UI sits on top
of them and is fully decoupled, which is why they can be unit tested in
isolation.

## Getting started

```bash
npm install
npm run dev          # local dev server
npm run build        # production build
npm run test         # vitest engine tests
```

## Demo wallet

Every visitor starts with **10,000 YAHU** demo coins. The balance, transaction
history, game history, username, and sound preference all live in
`localStorage` (key: `byb-wallet`). When the balance runs low, the wallet
modal exposes a "Reload to 10,000" button.

## Architecture notes

- **Wallet flow.** Every game routes its bets and wins through `useWalletStore` (`bet()`, `win()`, `pushHistory()`). The store enforces "can't bet more than you have" at the boundary; UIs only need to react to `false`.
- **Slot engines.** Both slots share `SlotEngine` (`src/games/slots/engine.ts`). It picks fixed reel stops via injectable RNG, builds the 5×3 visible matrix, evaluates lines (with optional Wild substitution), evaluates Scatters, triggers Free Spins, and handles Expanding Symbol logic in the free-spin variant.
- **Blackjack.** Standard rules: Ace-soft handling, splits (Aces get one card each), Double, S17, Blackjack pays 3:2. Insurance not currently exposed in the UI.
- **Roulette.** All standard inside + outside bets covered. The wheel is an SVG with the canonical European wheel order; the spin animation lands precisely on the result pocket.

## Sound design

To keep the project repo-only (no binary assets), `lib/sound.ts` synthesizes
short PCM tones at runtime and feeds them to Howler as data URIs. Replace the
`SFX` map with real .mp3/.ogg sources for production-quality audio.

## What this is not

- Not a real-money platform. There is no payment integration, no provider
  account, no licensing.
- Not endorsed by, or affiliated with, Rainbet, Novomatic, Greentube, or any
  other real casino brand. The visual language is *inspired by* the modern
  online-casino lobby aesthetic, but all game names, symbols, and provider
  names in this app are original or generic placeholders.
- Not optimized for production deployment. It is a learning / portfolio
  showcase. Use as a starting point at your own discretion.

## Responsible-gaming reminder

Even though no real money changes hands here, gambling-themed simulations can
reinforce real-world habits. If you, a friend, or a family member feel that
gambling has become a problem, please reach out to one of these resources:

- 🇩🇪 BZgA — bzga.de
- 🇬🇧 GamCare — gamcare.org.uk
- 🇺🇸 NCPG — ncpgambling.org

## License

Treat this codebase as MIT-licensed example code. Do not deploy it under a
real-money jurisdiction without legal counsel; doing so is your own
responsibility.
