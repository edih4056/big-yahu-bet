export type GameDef = {
  slug: string;
  title: string;
  provider: string;
  category: "slots" | "table" | "live" | "games" | "originals";
  badge?: "HOT" | "NEW" | "POPULAR" | "ORIGINAL";
  available: boolean;
  /** Approx live-player count for the lobby card chip */
  livePlayers?: number;
  cover: {
    gradient: string;
    accent: string;
    icon: string;
  };
};

/** ------------------------------------------------------------------------
 *  Playable games
 *  -----------------------------------------------------------------------*/

const PLAYABLE: GameDef[] = [
  {
    slug: "sizzling-fruits",
    title: "Sizzling Fruits",
    provider: "YahuPlay",
    category: "slots",
    badge: "HOT",
    available: true,
    livePlayers: 1247,
    cover: {
      gradient:
        "linear-gradient(140deg, #FF3B6B 0%, #FF8A00 60%, #FFD600 100%)",
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
    livePlayers: 982,
    cover: {
      gradient:
        "linear-gradient(140deg, #5B2D14 0%, #C58F2A 60%, #FFD978 100%)",
      accent: "#FFD978",
      icon: "📖",
    },
  },
  {
    slug: "blackjack",
    title: "Blackjack",
    provider: "VioletGames",
    category: "table",
    badge: "POPULAR",
    available: true,
    livePlayers: 1769,
    cover: {
      gradient: "linear-gradient(140deg, #B22340 0%, #7F1D1D 100%)",
      accent: "#FF5C82",
      icon: "🂡",
    },
  },
  {
    slug: "roulette",
    title: "Roulette",
    provider: "GoldChip",
    category: "table",
    badge: "POPULAR",
    available: true,
    livePlayers: 645,
    cover: {
      gradient: "linear-gradient(140deg, #0E5A36 0%, #064E3B 100%)",
      accent: "#10B981",
      icon: "🎯",
    },
  },
  {
    slug: "mines",
    title: "Mines",
    provider: "Yahu Originals",
    category: "originals",
    badge: "ORIGINAL",
    available: true,
    livePlayers: 3632,
    cover: {
      gradient: "linear-gradient(140deg, #0EA5E9 0%, #1E40AF 100%)",
      accent: "#67E8F9",
      icon: "💣",
    },
  },
  {
    slug: "limbo",
    title: "Limbo",
    provider: "Yahu Originals",
    category: "originals",
    badge: "ORIGINAL",
    available: true,
    livePlayers: 2709,
    cover: {
      gradient: "linear-gradient(140deg, #F59E0B 0%, #EAB308 60%, #FFD600 100%)",
      accent: "#FDE68A",
      icon: "🚀",
    },
  },
  {
    slug: "dice",
    title: "Dice",
    provider: "Yahu Originals",
    category: "originals",
    badge: "ORIGINAL",
    available: true,
    livePlayers: 3029,
    cover: {
      gradient: "linear-gradient(140deg, #7C3AED 0%, #4C1D95 100%)",
      accent: "#C4B5FD",
      icon: "🎲",
    },
  },
  {
    slug: "towers",
    title: "Dragon Tower",
    provider: "Yahu Originals",
    category: "originals",
    badge: "ORIGINAL",
    available: true,
    livePlayers: 788,
    cover: {
      gradient: "linear-gradient(140deg, #DC2626 0%, #7C1D1D 100%)",
      accent: "#FCA5A5",
      icon: "🗼",
    },
  },
];

/** ------------------------------------------------------------------------
 *  Coming-soon mocks — purely visual, for a busy-looking lobby.
 *  Names are generic placeholders, not trademarked titles.
 *  -----------------------------------------------------------------------*/

type CSDef = readonly [
  title: string,
  provider: string,
  category: GameDef["category"],
  gradient: string,
  icon: string,
  livePlayers?: number,
];

const COMING_SOON: CSDef[] = [
  // Originals
  ["Plinko",        "Yahu Originals",   "originals", "linear-gradient(140deg, #EC4899 0%, #BE185D 100%)", "🟣", 2084],
  ["Crash",         "Yahu Originals",   "originals", "linear-gradient(140deg, #38BDF8 0%, #1E40AF 100%)", "🚀", 1667],
  ["Keno",          "Yahu Originals",   "originals", "linear-gradient(140deg, #06B6D4 0%, #155E75 100%)", "🎱", 2054],
  ["Chicken",       "Yahu Originals",   "originals", "linear-gradient(140deg, #38BDF8 0%, #0369A1 100%)", "🐔", 706],
  ["Hilo",          "Yahu Originals",   "originals", "linear-gradient(140deg, #22C55E 0%, #14532D 100%)", "🃏", 652],
  ["Wheel",         "Yahu Originals",   "originals", "linear-gradient(140deg, #F97316 0%, #B45309 100%)", "🎡", 320],
  ["Pump",          "Yahu Originals",   "originals", "linear-gradient(140deg, #EF4444 0%, #7F1D1D 100%)", "🎈", 273],
  ["Flip",          "Yahu Originals",   "originals", "linear-gradient(140deg, #84CC16 0%, #365314 100%)", "🪙", 381],
  ["Snakes",        "Yahu Originals",   "originals", "linear-gradient(140deg, #FACC15 0%, #854D0E 100%)", "🐍", 345],
  ["Diamonds",      "Yahu Originals",   "originals", "linear-gradient(140deg, #C084FC 0%, #6B21A8 100%)", "💎", 130],
  ["Zoo",           "Yahu Originals",   "originals", "linear-gradient(140deg, #FB923C 0%, #9A3412 100%)", "🦁", 378],
  ["Moles",         "Yahu Originals",   "originals", "linear-gradient(140deg, #38BDF8 0%, #0369A1 100%)", "🦫", 603],
  ["Tome of Life",  "Yahu Originals",   "originals", "linear-gradient(140deg, #A855F7 0%, #581C87 100%)", "📜", 249],
  ["Rock Paper Scissors","Yahu Originals", "originals","linear-gradient(140deg, #F87171 0%, #7F1D1D 100%)", "✂️", 134],

  // Slots
  ["Gates of Olympus 1000", "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #1E3A8A 0%, #312E81 100%)", "⚡", 1072],
  ["Sugar Rush 1000",       "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #F472B6 0%, #BE185D 100%)", "🍭", 945],
  ["Sweet Bonanza 1000",    "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #FB7185 0%, #9F1239 100%)", "🍓", 559],
  ["Wanted Dead or A Wild", "Hacksaw Yahu",   "slots",  "linear-gradient(140deg, #B91C1C 0%, #450A0A 100%)", "🤠", 458],
  ["Duck Hunters",          "Nolimit Yahu",   "slots",  "linear-gradient(140deg, #22C55E 0%, #14532D 100%)", "🦆", 332],
  ["San Quentin Manhunt",   "Nolimit Yahu",   "slots",  "linear-gradient(140deg, #4B5563 0%, #1F2937 100%)", "🏚️", 37],
  ["Super Scatter",         "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #F59E0B 0%, #B45309 100%)", "✨", 768],
  ["Mystic Reels",          "Midnight Yahu",  "slots",  "linear-gradient(140deg, #6366F1 0%, #312E81 100%)", "🔮", 412],
  ["Lucky Lions",           "YahuPlay",       "slots",  "linear-gradient(140deg, #F97316 0%, #7C2D12 100%)", "🦁", 281],
  ["Crystal Cascade",       "OracleSlots",    "slots",  "linear-gradient(140deg, #06B6D4 0%, #155E75 100%)", "🔷", 198],
  ["Dragon Riches",         "VioletGames",    "slots",  "linear-gradient(140deg, #DC2626 0%, #450A0A 100%)", "🐉", 522],
  ["Aztec Treasure",        "Midnight Yahu",  "slots",  "linear-gradient(140deg, #EAB308 0%, #713F12 100%)", "🗿", 167],
  ["Pirate's Bounty",       "OracleSlots",    "slots",  "linear-gradient(140deg, #1D4ED8 0%, #1E3A8A 100%)", "🏴‍☠️", 89],
  ["Wolf Howl",             "Hacksaw Yahu",   "slots",  "linear-gradient(140deg, #475569 0%, #0F172A 100%)", "🐺", 309],
  ["Pharaoh's Gold",        "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #F59E0B 0%, #78350F 100%)", "👑", 678],
  ["Frozen Fortune",        "Midnight Yahu",  "slots",  "linear-gradient(140deg, #67E8F9 0%, #155E75 100%)", "❄️", 152],
  ["Cosmic Spins",          "VioletGames",    "slots",  "linear-gradient(140deg, #7C3AED 0%, #1E1B4B 100%)", "🪐", 244],
  ["Hot Chili Reels",       "YahuPlay",       "slots",  "linear-gradient(140deg, #EF4444 0%, #7F1D1D 100%)", "🌶️", 91],

  // Table
  ["Baccarat Royale",  "GoldChip",       "table",   "linear-gradient(140deg, #16A34A 0%, #14532D 100%)", "🃏", 138],
  ["Poker Pro",        "VioletGames",    "table",   "linear-gradient(140deg, #1D4ED8 0%, #1E3A8A 100%)", "♠", 222],
  ["Caribbean Stud",   "GoldChip",       "table",   "linear-gradient(140deg, #BE123C 0%, #4C0519 100%)", "♣", 77],
  ["Sic Bo",           "OracleSlots",    "table",   "linear-gradient(140deg, #F59E0B 0%, #92400E 100%)", "🎴", 51],

  // Live
  ["Live Roulette HD",     "Yahu Live", "live", "linear-gradient(140deg, #DC2626 0%, #450A0A 100%)", "🎯", 0],
  ["Live Blackjack",       "Yahu Live", "live", "linear-gradient(140deg, #0E5A36 0%, #064E3B 100%)", "♠", 0],
  ["Live Game Show",       "Yahu Live", "live", "linear-gradient(140deg, #7B61FF 0%, #2E1A6B 100%)", "🎤", 0],
  ["Live Crazy Time",      "Yahu Live", "live", "linear-gradient(140deg, #EC4899 0%, #831843 100%)", "🎡", 0],
  ["Live Baccarat",        "Yahu Live", "live", "linear-gradient(140deg, #F59E0B 0%, #78350F 100%)", "🃏", 0],
];

export const GAMES: GameDef[] = [
  ...PLAYABLE,
  ...COMING_SOON.map((c, i): GameDef => {
    const [title, provider, category, gradient, icon, livePlayers] = c;
    return {
      slug: `cs-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i}`,
      title,
      provider,
      category,
      available: false,
      livePlayers,
      cover: { gradient, accent: "#9B7CFF", icon },
    };
  }),
];

export function gameBySlug(slug: string) {
  return GAMES.find((g) => g.slug === slug);
}

export const PLAYABLE_SLUGS = PLAYABLE.map((g) => g.slug);
