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
  /* ----- Originals ----- */
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
  ["Spaceman",      "Yahu Originals",   "originals", "linear-gradient(140deg, #0EA5E9 0%, #1E3A8A 100%)", "👨‍🚀", 521],
  ["Aviator",       "Yahu Originals",   "originals", "linear-gradient(140deg, #DC2626 0%, #7F1D1D 100%)", "✈️", 1248],
  ["Stairs",        "Yahu Originals",   "originals", "linear-gradient(140deg, #14B8A6 0%, #115E59 100%)", "🪜", 187],
  ["Slide",         "Yahu Originals",   "originals", "linear-gradient(140deg, #F59E0B 0%, #B45309 100%)", "📊", 244],
  ["Cave of Plunder","Yahu Originals",  "originals", "linear-gradient(140deg, #78350F 0%, #1C0E04 100%)", "🪙", 92],
  ["Andar Bahar",   "Yahu Originals",   "originals", "linear-gradient(140deg, #EF4444 0%, #1D4ED8 100%)", "🃏", 64],
  ["Video Poker",   "Yahu Originals",   "originals", "linear-gradient(140deg, #1E40AF 0%, #1E1B4B 100%)", "🂠", 198],
  ["Texas Hold'em", "Yahu Originals",   "originals", "linear-gradient(140deg, #0E5A36 0%, #052e1a 100%)", "♠", 305],
  ["Three Card Poker","Yahu Originals", "originals", "linear-gradient(140deg, #DC2626 0%, #450A0A 100%)", "♥", 117],
  ["Hilo Switch",   "Yahu Originals",   "originals", "linear-gradient(140deg, #06B6D4 0%, #155E75 100%)", "🔀", 88],
  ["Wheel of Fortune","Yahu Originals", "originals", "linear-gradient(140deg, #F59E0B 0%, #DC2626 100%)", "🍀", 271],

  /* ----- Slots ----- */
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
  ["Bonanza Billions",      "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #FBBF24 0%, #92400E 100%)", "💰", 837],
  ["Big Bass Run",          "Hacksaw Yahu",   "slots",  "linear-gradient(140deg, #0EA5E9 0%, #14532D 100%)", "🎣", 654],
  ["Dog House Megaways",    "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #EF4444 0%, #1E40AF 100%)", "🐕", 502],
  ["Wild West Trails",      "Nolimit Yahu",   "slots",  "linear-gradient(140deg, #D97706 0%, #7C2D12 100%)", "🌵", 296],
  ["Razor Shark",           "Push Yahu",      "slots",  "linear-gradient(140deg, #0EA5E9 0%, #0C4A6E 100%)", "🦈", 412],
  ["Money Train Express",   "Relax Yahu",     "slots",  "linear-gradient(140deg, #F97316 0%, #1E40AF 100%)", "🚂", 388],
  ["Fire Joker",            "YahuPlay",       "slots",  "linear-gradient(140deg, #F97316 0%, #7F1D1D 100%)", "🃏", 264],
  ["Eye of Horus",          "Midnight Yahu",  "slots",  "linear-gradient(140deg, #F59E0B 0%, #1E3A8A 100%)", "👁️", 421],
  ["Reactoonz Mega",        "Play Yahu",      "slots",  "linear-gradient(140deg, #14B8A6 0%, #6B21A8 100%)", "👾", 199],
  ["Wolf Gold",             "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #FBBF24 0%, #1E40AF 100%)", "🌕", 547],
  ["Stack 'Em High",        "Hacksaw Yahu",   "slots",  "linear-gradient(140deg, #DC2626 0%, #1F2937 100%)", "📚", 134],
  ["Madame Destiny",        "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #A855F7 0%, #6B21A8 100%)", "🔮", 305],
  ["Chilli Heat 1000",      "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #DC2626 0%, #B45309 100%)", "🌶️", 218],
  ["Power of Thor",         "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #1E40AF 0%, #475569 100%)", "⚡", 366],
  ["Tomb of Anubis",        "Midnight Yahu",  "slots",  "linear-gradient(140deg, #D97706 0%, #1C0E04 100%)", "🏺", 142],
  ["Starlight Burst",       "VioletGames",    "slots",  "linear-gradient(140deg, #C084FC 0%, #6B21A8 100%)", "⭐", 472],
  ["Mega Moose",            "Midnight Yahu",  "slots",  "linear-gradient(140deg, #1E40AF 0%, #0F172A 100%)", "🦌", 76],
  ["Mega Riches",           "YahuPlay",       "slots",  "linear-gradient(140deg, #FBBF24 0%, #7F1D1D 100%)", "💎", 612],
  ["Buffalo Stampede",      "Hacksaw Yahu",   "slots",  "linear-gradient(140deg, #92400E 0%, #1F2937 100%)", "🐃", 287],
  ["Sweet Cherry",          "Hacksaw Yahu",   "slots",  "linear-gradient(140deg, #F472B6 0%, #BE185D 100%)", "🍒", 198],
  ["Book of Dead Heroes",   "OracleSlots",    "slots",  "linear-gradient(140deg, #DC2626 0%, #1F2937 100%)", "📕", 591],
  ["Gem Quest",             "YahuPlay",       "slots",  "linear-gradient(140deg, #06B6D4 0%, #0F172A 100%)", "💠", 121],
  ["Pyramid King",          "Midnight Yahu",  "slots",  "linear-gradient(140deg, #F59E0B 0%, #713F12 100%)", "🏛️", 248],
  ["Ninja Way",             "Push Yahu",      "slots",  "linear-gradient(140deg, #4B5563 0%, #0F172A 100%)", "🥷", 89],
  ["Bunny Hop",             "Hacksaw Yahu",   "slots",  "linear-gradient(140deg, #F472B6 0%, #84CC16 100%)", "🐰", 73],
  ["Vampire Vault",         "Midnight Yahu",  "slots",  "linear-gradient(140deg, #7F1D1D 0%, #0F172A 100%)", "🦇", 156],
  ["Mariachi Madness",      "YahuPlay",       "slots",  "linear-gradient(140deg, #F97316 0%, #7C2D12 100%)", "🎺", 102],
  ["Samurai Spins",         "Nolimit Yahu",   "slots",  "linear-gradient(140deg, #DC2626 0%, #1E1B4B 100%)", "⚔️", 184],
  ["Cleopatra's Pyramid",   "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #FBBF24 0%, #1E3A8A 100%)", "𓁳", 332],
  ["Magic Mushrooms",       "Play Yahu",      "slots",  "linear-gradient(140deg, #DC2626 0%, #14532D 100%)", "🍄", 67],
  ["Candy Crash 1000",      "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #F472B6 0%, #BE185D 100%)", "🍬", 412],
  ["Volcano Riches",        "OracleSlots",    "slots",  "linear-gradient(140deg, #DC2626 0%, #0F172A 100%)", "🌋", 218],
  ["Knight Quest",          "VioletGames",    "slots",  "linear-gradient(140deg, #4B5563 0%, #1E1B4B 100%)", "🛡️", 154],
  ["Mermaid's Pearl",       "Midnight Yahu",  "slots",  "linear-gradient(140deg, #06B6D4 0%, #1E40AF 100%)", "🧜", 122],
  ["Robot Rumble",          "Play Yahu",      "slots",  "linear-gradient(140deg, #475569 0%, #DC2626 100%)", "🤖", 91],
  ["Galaxy Quest",          "OracleSlots",    "slots",  "linear-gradient(140deg, #7C3AED 0%, #0F172A 100%)", "🌌", 234],

  /* ----- Table ----- */
  ["Baccarat Royale",  "GoldChip",       "table",   "linear-gradient(140deg, #16A34A 0%, #14532D 100%)", "🃏", 138],
  ["Poker Pro",        "VioletGames",    "table",   "linear-gradient(140deg, #1D4ED8 0%, #1E3A8A 100%)", "♠", 222],
  ["Caribbean Stud",   "GoldChip",       "table",   "linear-gradient(140deg, #BE123C 0%, #4C0519 100%)", "♣", 77],
  ["Sic Bo",           "OracleSlots",    "table",   "linear-gradient(140deg, #F59E0B 0%, #92400E 100%)", "🎴", 51],
  ["Pai Gow Poker",    "VioletGames",    "table",   "linear-gradient(140deg, #16A34A 0%, #052e1a 100%)", "🃏", 28],
  ["Casino Hold'em",   "GoldChip",       "table",   "linear-gradient(140deg, #0E5A36 0%, #0F172A 100%)", "♠", 88],
  ["Mini Baccarat",    "GoldChip",       "table",   "linear-gradient(140deg, #DC2626 0%, #450A0A 100%)", "🃏", 41],
  ["Red Dog",          "OracleSlots",    "table",   "linear-gradient(140deg, #B91C1C 0%, #1F2937 100%)", "🐕", 18],
  ["Pontoon",          "VioletGames",    "table",   "linear-gradient(140deg, #16A34A 0%, #14532D 100%)", "♥", 25],
  ["Trente et Quarante","GoldChip",      "table",   "linear-gradient(140deg, #DC2626 0%, #1E40AF 100%)", "🃏", 11],

  /* ----- Live ----- */
  ["Live Roulette HD",     "Yahu Live", "live", "linear-gradient(140deg, #DC2626 0%, #450A0A 100%)", "🎯", 0],
  ["Live Blackjack",       "Yahu Live", "live", "linear-gradient(140deg, #0E5A36 0%, #064E3B 100%)", "♠", 0],
  ["Live Game Show",       "Yahu Live", "live", "linear-gradient(140deg, #7B61FF 0%, #2E1A6B 100%)", "🎤", 0],
  ["Live Crazy Time",      "Yahu Live", "live", "linear-gradient(140deg, #EC4899 0%, #831843 100%)", "🎡", 0],
  ["Live Baccarat",        "Yahu Live", "live", "linear-gradient(140deg, #F59E0B 0%, #78350F 100%)", "🃏", 0],
  ["Lightning Roulette",   "Yahu Live", "live", "linear-gradient(140deg, #FBBF24 0%, #B45309 100%)", "⚡", 0],
  ["Mega Wheel",           "Yahu Live", "live", "linear-gradient(140deg, #1E40AF 0%, #DC2626 100%)", "🎡", 0],
  ["Mega Ball",            "Yahu Live", "live", "linear-gradient(140deg, #F97316 0%, #B45309 100%)", "🎱", 0],
  ["Crazy Coin Flip",      "Yahu Live", "live", "linear-gradient(140deg, #38BDF8 0%, #F97316 100%)", "🪙", 0],
  ["Funky Time",           "Yahu Live", "live", "linear-gradient(140deg, #EC4899 0%, #7C3AED 100%)", "🎉", 0],
  ["Stock Market",         "Yahu Live", "live", "linear-gradient(140deg, #16A34A 0%, #DC2626 100%)", "📈", 0],
  ["Cash Pop",             "Yahu Live", "live", "linear-gradient(140deg, #FBBF24 0%, #F97316 100%)", "💸", 0],
  ["Monopoly Live",        "Yahu Live", "live", "linear-gradient(140deg, #DC2626 0%, #1E40AF 100%)", "🎲", 0],
  ["Side Bet City",        "Yahu Live", "live", "linear-gradient(140deg, #0E5A36 0%, #1E3A8A 100%)", "🌆", 0],
  ["Speed Roulette",       "Yahu Live", "live", "linear-gradient(140deg, #B91C1C 0%, #1F2937 100%)", "🎯", 0],
  ["Dream Catcher",        "Yahu Live", "live", "linear-gradient(140deg, #C084FC 0%, #4C1D95 100%)", "🪶", 0],
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
