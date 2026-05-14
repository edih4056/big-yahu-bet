import { ClusterSlotUI } from "@/games/clusterSlot/ClusterSlotUI";
import {
  olympusConfig,
  OLYMPUS_INFO,
} from "@/games/clusterSlot/configs";

export default function GatesOfOlympus() {
  return (
    <div>
      <ClusterSlotUI
        gameKey="gates-of-olympus"
        title="Gates of Olympus 1000"
        subtitle="PAY-ANYWHERE · TUMBLE · ZEUS MULTIPLIERS"
        config={olympusConfig}
        cabinet="linear-gradient(180deg, #1E3A8A 0%, #312E81 60%, #0F0E1A 100%)"
        trim="#FBBF24"
        symbolInfo={OLYMPUS_INFO}
        orbInfo={{ symbol: "⚡", label: "Zeus multiplier orb" }}
      />
      <Paytable />
    </div>
  );
}

function Paytable() {
  return (
    <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
      <h2 className="heading text-lg mb-3">Paytable & rules</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(OLYMPUS_INFO).map(([sym, info]) => {
          const t = olympusConfig.paytable[sym] ?? {};
          return (
            <div key={sym} className="card-base p-3 flex items-center gap-3">
              <div className="text-3xl">{sym}</div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-1">
                  {info.label}
                  {info.isHigh && (
                    <span className="badge bg-gold/20 text-gold border border-gold/40">
                      HIGH
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-secondary">
                  8: {t[8] ?? 0}× · 10: {t[10] ?? 0}× · 12+: {t[12] ?? 0}×
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-sm text-text-secondary leading-relaxed max-w-2xl">
        <p>
          <strong className="text-white">Zeus Multiplier ⚡:</strong> Random
          multiplier orbs (2× – 500×) drop onto the grid. When a paying cluster
          lands in the same tumble, all orb values are summed and applied to
          that tumble's total win.
        </p>
        <p className="mt-2">
          <strong className="text-white">Tumble:</strong> Winning symbols and
          all orbs disappear after a paying spin; remaining symbols drop and
          fresh ones fill the top. Tumbles continue as long as wins keep
          landing.
        </p>
      </div>
    </div>
  );
}
