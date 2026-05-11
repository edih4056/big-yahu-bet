import { SlotMachine, type SlotTheme } from "@/games/slots/SlotMachine";
import {
  sizzlingFruitsConfig,
  FRUIT_SYMBOL_INFO,
} from "@/games/slots/sizzlingFruits";

const theme: SlotTheme = {
  name: "Sizzling Fruits",
  // Iconic painted-red cabinet with subtle deeper shading like the original Sizzling Hot Deluxe.
  cabinet:
    "linear-gradient(180deg, #E11D48 0%, #B91C1C 60%, #7F1D1D 100%)",
  trim: "#FFC842",
  // Deep violet inner panel behind the reels (matches Novomatic style).
  panel:
    "linear-gradient(180deg, #2E1A6B 0%, #3B1F88 60%, #1F124D 100%)",
  // White reel cells with a faint warm tint.
  cell:
    "bg-gradient-to-b from-white to-amber-50 border border-rose-200/40",
  banner:
    "linear-gradient(180deg, #DC2626 0%, #991B1B 100%)",
  glow: "rgba(255, 138, 0, 0.45)",
};

const BET_PER_LINE = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000] as const;
// 5 lines × 1000 = 5000 max stake — meets the 5k requirement.

export default function SizzlingFruits() {
  return (
    <div>
      <SlotMachine
        gameKey="sizzling-fruits"
        title="Sizzling Fruits"
        subtitle="DELUXE · 5×3 · 5 LINES"
        config={sizzlingFruitsConfig}
        symbolInfo={FRUIT_SYMBOL_INFO}
        betPerLine={BET_PER_LINE}
        numLines={5}
        theme={theme}
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
    { sym: "7", pays: [{ count: 5, mult: 1000 }, { count: 4, mult: 200 }, { count: 3, mult: 50 }] },
    { sym: "W", pays: [{ count: 5, mult: 200 }, { count: 4, mult: 50 }, { count: 3, mult: 20 }] },
    { sym: "G", pays: [{ count: 5, mult: 200 }, { count: 4, mult: 50 }, { count: 3, mult: 20 }] },
    { sym: "O", pays: [{ count: 5, mult: 100 }, { count: 4, mult: 30 }, { count: 3, mult: 10 }] },
    { sym: "P", pays: [{ count: 5, mult: 100 }, { count: 4, mult: 30 }, { count: 3, mult: 10 }] },
    { sym: "L", pays: [{ count: 5, mult: 100 }, { count: 4, mult: 30 }, { count: 3, mult: 10 }] },
    { sym: "C", pays: [{ count: 5, mult: 100 }, { count: 4, mult: 30 }, { count: 3, mult: 10 }, { count: 2, mult: 5 }] },
    { sym: "S", pays: [{ count: 5, mult: 100 }, { count: 4, mult: 20 }, { count: 3, mult: 10 }] },
  ];

  return (
    <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
      <h2 className="heading text-lg mb-3">Paytable</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {items.map(({ sym, pays }) => {
          const info = FRUIT_SYMBOL_INFO[sym];
          return (
            <div key={sym} className="card-base p-3 flex items-center gap-3">
              <div className="text-3xl">{info.emoji}</div>
              <div>
                <div className="font-semibold text-sm">{info.label}</div>
                <div className="text-xs text-text-secondary">
                  {pays.map((p, i) => (
                    <span key={i}>
                      {i > 0 && " · "}
                      {p.count}×: {p.mult}
                    </span>
                  ))}
                </div>
                {info.isScatter && (
                  <div className="text-[10px] text-gold uppercase tracking-wider">
                    Scatter (× total bet)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-text-secondary mt-3">
        Multipliers shown apply to the per-line bet. Scatter pays on total bet.
        Max stake: 1,000 × 5 lines = 5,000 per spin.
      </p>
    </div>
  );
}
