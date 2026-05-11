import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WHEEL_ORDER, colorOf } from "./engine";

const SIZE = 280;
const POCKET_COUNT = WHEEL_ORDER.length; // 37
const DEG_PER = 360 / POCKET_COUNT;

export function Wheel({
  spinning,
  result,
  spinId,
}: {
  spinning: boolean;
  result: number | null;
  spinId: number;
}) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!spinning && result !== null) {
      const idx = WHEEL_ORDER.indexOf(result);
      // pocket idx 0 (the "0") should land at top when rotation is 0.
      // We rotate the wheel by additional 4 full turns + offset.
      const target = -(idx * DEG_PER) - DEG_PER / 2;
      const final = 360 * 5 + target;
      setRotation(final);
    }
  }, [spinning, result, spinId]);

  return (
    <div
      className="relative mx-auto"
      style={{ width: SIZE, height: SIZE }}
      aria-label="Roulette wheel"
    >
      {/* Pointer */}
      <div
        className="absolute left-1/2 -top-1 -translate-x-1/2 z-20"
        style={{
          width: 0,
          height: 0,
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: "16px solid #FFC842",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
        }}
      />

      <motion.div
        animate={{ rotate: rotation }}
        transition={{
          duration: spinning ? 1 : 4,
          ease: spinning ? "linear" : [0.2, 0.6, 0.4, 1],
        }}
        className="relative w-full h-full rounded-full border-4 border-gold/40"
        style={{
          background:
            "radial-gradient(circle, #2a1d12 0%, #0E0A06 80%)",
          boxShadow:
            "0 0 40px rgba(255, 200, 66, 0.25), inset 0 0 30px rgba(0,0,0,0.6)",
        }}
      >
        <svg
          viewBox="-150 -150 300 300"
          className="absolute inset-0 w-full h-full"
        >
          {WHEEL_ORDER.map((n, i) => {
            const a0 = i * DEG_PER - 90 - DEG_PER / 2;
            const a1 = a0 + DEG_PER;
            const r = 140;
            const rIn = 60;
            const rad = (deg: number) => (deg * Math.PI) / 180;
            const p0 = [Math.cos(rad(a0)) * r, Math.sin(rad(a0)) * r];
            const p1 = [Math.cos(rad(a1)) * r, Math.sin(rad(a1)) * r];
            const p2 = [Math.cos(rad(a1)) * rIn, Math.sin(rad(a1)) * rIn];
            const p3 = [Math.cos(rad(a0)) * rIn, Math.sin(rad(a0)) * rIn];
            const color = colorOf(n);
            const fill =
              color === "red"
                ? "#B22340"
                : color === "black"
                  ? "#161618"
                  : "#0E5A36";
            const labelA = (a0 + a1) / 2;
            const lr = 100;
            const lx = Math.cos(rad(labelA)) * lr;
            const ly = Math.sin(rad(labelA)) * lr;
            return (
              <g key={i}>
                <path
                  d={`M ${p0[0]} ${p0[1]} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} Z`}
                  fill={fill}
                  stroke="#FFC84233"
                  strokeWidth={0.5}
                />
                <text
                  x={lx}
                  y={ly}
                  fill="white"
                  fontSize="9"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${labelA + 90}, ${lx}, ${ly})`}
                  fontWeight="700"
                >
                  {n}
                </text>
              </g>
            );
          })}
          <circle r="55" fill="#1a1208" stroke="#FFC842" strokeWidth="2" />
          <circle r="20" fill="#FFC842" />
          <text
            y="4"
            textAnchor="middle"
            fontSize="9"
            fontWeight="800"
            fill="#0F0E1A"
          >
            YAHU
          </text>
        </svg>
      </motion.div>
    </div>
  );
}
