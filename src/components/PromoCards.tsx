import { Gift, Users, Crown } from "lucide-react";

const PROMOS = [
  {
    icon: Gift,
    title: "Daily Reload",
    text: "Top up your demo coins every 24 hours — keep the streak going.",
    bg: "linear-gradient(135deg, #2C0F6B 0%, #7B61FF 100%)",
  },
  {
    icon: Users,
    title: "Refer a Friend",
    text: "Invite friends and both get 5,000 bonus demo coins.",
    bg: "linear-gradient(135deg, #0B2F4D 0%, #1E78C2 100%)",
  },
  {
    icon: Crown,
    title: "VIP Yahu Club",
    text: "Climb the loyalty tiers. Unlock exclusive demo prizes.",
    bg: "linear-gradient(135deg, #5B2D14 0%, #C58F2A 100%)",
  },
];

export function PromoCards() {
  return (
    <section className="px-4 lg:px-6 mt-10">
      <h2 className="heading text-lg sm:text-xl mb-3">Promotions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PROMOS.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl p-5 relative overflow-hidden border border-white/5"
            style={{ background: p.bg }}
          >
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 backdrop-blur">
                <p.icon size={20} />
              </div>
              <div className="font-bold text-lg">{p.title}</div>
              <div className="text-sm text-white/85 mt-1">{p.text}</div>
              <button className="mt-4 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition">
                Learn more
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
