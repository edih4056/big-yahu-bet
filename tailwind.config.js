/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0F0E1A",
          secondary: "#16142B",
          card: "#1C1A36",
          elevated: "#252247",
        },
        accent: {
          DEFAULT: "#7B61FF",
          light: "#9B7CFF",
        },
        win: "#00E676",
        gold: "#FFC842",
        text: {
          primary: "#FFFFFF",
          secondary: "#A4A1C7",
        },
        felt: "#0E2A1B",
      },
      fontFamily: {
        sans: ["Inter", "Sora", "Manrope", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px 0 rgba(123, 97, 255, 0.45)",
        "glow-sm": "0 0 12px 0 rgba(123, 97, 255, 0.35)",
        "glow-gold": "0 0 24px 0 rgba(255, 200, 66, 0.5)",
        "glow-win": "0 0 24px 0 rgba(0, 230, 118, 0.5)",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #7B61FF 0%, #C26BFF 100%)",
        "gold-gradient": "linear-gradient(135deg, #FFC842 0%, #FF8A00 100%)",
      },
      animation: {
        "ticker-scroll": "ticker 40s linear infinite",
        "spin-slow": "spin 3s linear infinite",
        "pulse-glow": "pulse-glow 1.5s ease-in-out infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 12px 0 rgba(123, 97, 255, 0.45)" },
          "50%": { boxShadow: "0 0 32px 0 rgba(123, 97, 255, 0.85)" },
        },
      },
    },
  },
  plugins: [],
};
