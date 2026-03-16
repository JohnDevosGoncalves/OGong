"use client";

import { motion } from "framer-motion";

const dots = [
  { color: "#FF8C42", angle: 0 },
  { color: "#FFB347", angle: 60 },
  { color: "#4A3AFF", angle: 120 },
  { color: "#7B6FFF", angle: 180 },
  { color: "#FF6B6B", angle: 240 },
  { color: "#FF8C42", angle: 300 },
];

/* ViewBox agrandi (48) pour laisser de l'espace à l'overshoot de l'animation */
const VIEWBOX = 48;
const CENTER = VIEWBOX / 2;
const RADIUS = 14;
const DOT_RADIUS = 2.8;

const EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DURATION = 1.2;
const STAGGER = 0.06;
const INITIAL_DELAY = 0.1;

interface LogoProps {
  size?: number;
  animate?: boolean;
}

function dotPosition(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    cx: CENTER + RADIUS * Math.cos(rad),
    cy: CENTER + RADIUS * Math.sin(rad),
  };
}

export default function Logo({ size = 40, animate = false }: LogoProps) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const shouldAnimate = animate && !prefersReducedMotion;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Logo OGong"
      style={{ overflow: "visible" }}
    >
      {dots.map((dot, i) => {
        const { cx, cy } = dotPosition(dot.angle);

        if (!shouldAnimate) {
          return (
            <circle key={i} cx={cx} cy={cy} r={DOT_RADIUS} fill={dot.color} />
          );
        }

        return (
          <motion.circle
            key={i}
            cx={CENTER}
            cy={CENTER}
            r={DOT_RADIUS}
            fill={dot.color}
            animate={{
              cx: [
                CENTER,
                cx + (cx - CENTER) * 0.5,
                cx - (cx - CENTER) * 0.1,
                cx,
              ],
              cy: [
                CENTER,
                cy + (cy - CENTER) * 0.5,
                cy - (cy - CENTER) * 0.1,
                cy,
              ],
              r: [0, DOT_RADIUS * 1.5, DOT_RADIUS * 0.8, DOT_RADIUS],
            }}
            transition={{
              duration: DURATION,
              delay: INITIAL_DELAY + i * STAGGER,
              ease: EASING,
              times: [0, 0.4, 0.7, 1],
            }}
          />
        );
      })}
    </svg>
  );
}
