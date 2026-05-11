import { SlotMachine, type SlotTheme } from "@/games/slots/SlotMachine";
import {
  bookOfYahuConfig,
  YAHU_SYMBOL_INFO,
  YAHU_FREE_REELS,
  pickExpandingSymbol,
} from "@/games/slots/bookOfYahu";

const theme: SlotTheme = {
  name: "Book of Yahu",
  cabinet:
    "linear-gradient(180deg, #92400E 0%, #78350F 60%, #451A03 100%)",
  trim: "#FFD978",
  panel:
    "linear-gradient(180deg, #1B0F03 0%, #2C1A06 60%, #0F0A04 100%)",
  cell:
    "bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-300/40",
  banner:
    "linear-gradient(180deg, #B45309 0%, #78350F 100%)",
  glow: "rgba(255, 217, 120, 0.5)",
};

const BET_PER_LINE = [1, 2, 5, 10, 25, 50, 100, 250, 500] as const;
// 10 lines × 500 = 5000 max stake — meets the 5k requirement.

export default function BookOfYahu() {
  return (
    <div>
      <SlotMachine
        gameKey="book-of-yahu"
        title="Book of Yahu"
        subtitle="ADVENTURE · 5×3 · 10 LINES · FREE SPINS"
        config={bookOfYahuConfig}
        symbolInfo={YAHU_SYMBOL_INFO}
        betPerLine={BET_PER_LINE}
        numLines={10}
        theme={theme}
        freeSpinReels={YAHU_FREE_REELS}
        pickExpandingSymbol={pickExpandingSymbol}
      />
      <Paytable />
    </div>
  );
}

function Paytable() {
  const items: Array<{
    sym: string;
    pays: { count: number; mult: number }[];
  }> = [
    { sym: "Ph", pays: [{ count: 5, mult: 5000 }, { count: 4, mult: 500 }, { count: 3, mult: 150 }, { count: 2, mult: 10 }] },
    { sym: "An", pays: [{ count: 5, mult: 2000 }, { count: 4, mult: 200 }, { count: 3, mult: 40 }] },
    { sym: "Sk", pays: [{ count: 5, mult: 750 }, { count: 4, mult: 75 }, { count: 3, mult: 25 }] },
    { sym: "A", pays: [{ count: 5, mult: 150 }, { count: 4, mult: 50 }, { count: 3, mult: 15 }] },
    { sym: "K", pays: [{ count: 5, mult: 150 }, { count: 4, mult: 50 }, { count: 3, mult: 15 }] },
    { sym: "Q", pays: [{ count: 5, mult: 125 }, { count: 4, mult: 40 }, { count: 3, mult: 10 }] },
    { sym: "J", pays: [{ count: 5, mult: 125 }, { count: 4, mult: 40 }, { count: 3, mult: 10 }] },
    { sym: "T", pays: [{ count: 5, mult: 100 }, { count: 4, mult: 25 }, { count: 3, mult: 5 }] },
    { sym: "B", pays: [{ count: 5, mult: 200 }, { count: 4, mult: 20 }, { count: 3, mult: 2 }] },
  ];

  return (
    <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
      <h2 className="heading text-lg mb-3">Paytable & Features</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map(({ sym, pays }) => {
          const info = YAHU_SYMBOL_INFO[sym];
          return (
            <div key={sym} className="card-base p-3 flex items-center gap-3">
              <div className="text-3xl">{info.emoji}</div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  {info.label}
                  {info.isWild && (
                    <span className="badge bg-gold/20 text-gold border border-gold/40">
                      WILD + SCATTER
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-secondary">
                  {pays.map((p, i) => (
                    <span key={i}>
                      {i > 0 && " · "}
                      {p.count}×: {p.mult}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-sm text-text-secondary leading-relaxed">
        <p>
          <strong className="text-white">Free Spins:</strong> 3+ Books trigger 10
          Free Spins. A random premium symbol becomes the Expanding Symbol —
          when it lands during free spins it fills the entire reel and pays on
          every line.
        </p>
        <p className="mt-2">
          <strong className="text-white">Retrigger:</strong> 3+ Books during Free
          Spins award an additional 10 Free Spins. Max stake: 500 × 10 lines =
          5,000 per spin.
        </p>
      </div>
    </div>
  );
}
