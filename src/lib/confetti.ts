import confetti from "canvas-confetti";

export function fireConfetti(intensity: "small" | "big" = "small") {
  const count = intensity === "big" ? 220 : 90;
  confetti({
    particleCount: count,
    spread: 80,
    origin: { y: 0.7 },
    colors: ["#7B61FF", "#C26BFF", "#FFC842", "#00E676", "#FF8AD4"],
  });
}
