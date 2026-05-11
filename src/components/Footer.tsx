import { Shield, AlertTriangle } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-bg-primary/40">
      <div className="px-6 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="text-accent" size={18} />
            <span className="font-bold tracking-wide text-sm">
              BIG YAHU BET — DEMO ONLY
            </span>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            Big Yahu Bet ist eine Demo-Anwendung. Es findet kein echtes
            Glücksspiel statt. Keine Einsätze, Gewinne oder Auszahlungen mit
            echtem Geld. Alle Coins sind reine Demo-/Spielgeld-Punkte ohne
            monetären Wert.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="badge bg-rose-500/15 text-rose-300">18+</span>
            <span className="badge bg-emerald-500/15 text-emerald-300">
              No real money
            </span>
            <span className="badge bg-accent/15 text-accent-light">
              Showcase project
            </span>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-text-secondary mb-3">
            About
          </div>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>About Us</li>
            <li>Careers</li>
            <li>Press</li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-text-secondary mb-3">
            Help
          </div>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>FAQ</li>
            <li>Contact</li>
            <li>Game rules</li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-text-secondary mb-3">
            Legal
          </div>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>Terms</li>
            <li>Privacy</li>
            <li>Responsible Gaming</li>
          </ul>
        </div>
      </div>

      <div className="px-6 py-6 border-t border-white/5 bg-bg-secondary/40">
        <div className="text-xs uppercase tracking-wider text-text-secondary mb-3">
          Game providers (mock)
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-text-secondary/70">
          {["YahuPlay", "VioletGames", "OracleSlots", "MidnightStudios", "GoldChip"].map(
            (p) => (
              <div
                key={p}
                className="px-3 py-1.5 rounded-lg bg-bg-card border border-white/5"
              >
                {p}
              </div>
            )
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-white/5 flex items-center gap-2 text-xs text-text-secondary">
        <AlertTriangle size={14} className="text-gold" />
        This is a demo. No real money is used. If gambling is a problem for you,
        contact BZgA (DE) or GamCare (UK) for help.
      </div>
    </footer>
  );
}
