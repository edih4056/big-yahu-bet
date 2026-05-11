export type GameDef = {
  slug: string;
  title: string;
  provider: string;
  category: "slots" | "table" | "live" | "specials";
  badge?: "HOT" | "NEW" | "POPULAR";
  available: boolean;
  cover: {
    gradient: string;
    accent: string;
    icon: string;
  };
};

export const GAMES: GameDef[] = [
  {
    slug: "sizzling-fruits",
    title: "Sizzling Fruits",
    provider: "YahuPlay",
    category: "slots",
    badge: "HOT",
    available: true,
    cover: {
      gradient: "linear-gradient(140deg, #FF3B6B 0%, #FF8A00 60%, #FFD600 100%)",
      accent: "#FFE15A",
      icon: "🍒",
    },
  },
  {
    slug: "book-of-yahu",
    title: "Book of Yahu",
    provider: "OracleSlots",
    category: "slots",
    badge: "POPULAR",
    available: true,
    cover: {
      gradient: "linear-gradient(140deg, #5B2D14 0%, #C58F2A 60%, #FFD978 100%)",
      accent: "#FFD978",
      icon: "📖",
    },
  },
  {
    slug: "blackjack",
    title: "Blackjack 21",
    provider: "VioletGames",
    category: "table",
    badge: "POPULAR",
    available: true,
    cover: {
      gradient: "linear-gradient(140deg, #073D24 0%, #0E5A36 60%, #14A463 100%)",
      accent: "#14A463",
      icon: "♠",
    },
  },
  {
    slug: "roulette",
    title: "European Roulette",
    provider: "GoldChip",
    category: "table",
    badge: "NEW",
    available: true,
    cover: {
      gradient: "linear-gradient(140deg, #4D0F1B 0%, #B22340 60%, #FF5C82 100%)",
      accent: "#FF5C82",
      icon: "🎯",
    },
  },
  {
    slug: "towers",
    title: "Towers",
    provider: "YahuPlay",
    category: "specials",
    badge: "NEW",
    available: true,
    cover: {
      gradient: "linear-gradient(140deg, #2C0F6B 0%, #7B61FF 50%, #FFC842 100%)",
      accent: "#FFC842",
      icon: "🗼",
    },
  },
  // Coming soon mocks
  ...mockComingSoon(
    [
      ["Mystic Reels", "MidnightStudios", "slots"],
      ["Lucky Lions", "YahuPlay", "slots"],
      ["Crystal Cascade", "OracleSlots", "slots"],
      ["Dragon Riches", "VioletGames", "slots"],
      ["Baccarat Royale", "GoldChip", "table"],
      ["Poker Pro", "VioletGames", "table"],
      ["Live Roulette HD", "Mock Studio", "live"],
      ["Live Blackjack", "Mock Studio", "live"],
      ["Live Game Show", "Mock Studio", "live"],
    ] as const
  ),
];

function mockComingSoon(
  rows: ReadonlyArray<readonly [string, string, "slots" | "table" | "live"]>
): GameDef[] {
  const palettes = [
    "linear-gradient(140deg, #1B1057 0%, #5B2BB8 60%, #B86BFF 100%)",
    "linear-gradient(140deg, #0B2F4D 0%, #1E78C2 60%, #6BB8FF 100%)",
    "linear-gradient(140deg, #2E0F3D 0%, #6B2B8B 60%, #FF6BD9 100%)",
    "linear-gradient(140deg, #3D1B0B 0%, #8B4B2B 60%, #FFB76B 100%)",
  ];
  const icons = ["✦", "★", "♦", "♣", "♥", "🎰", "🎲", "🃏", "🪙"];
  return rows.map(([title, provider, category], i) => ({
    slug: `cs-${title.toLowerCase().replace(/\s+/g, "-")}`,
    title,
    provider,
    category,
    available: false,
    cover: {
      gradient: palettes[i % palettes.length],
      accent: "#9B7CFF",
      icon: icons[i % icons.length],
    },
  }));
}

export function gameBySlug(slug: string) {
  return GAMES.find((g) => g.slug === slug);
}
