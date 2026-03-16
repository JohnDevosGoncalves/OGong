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

const VIEWBOX = 32;
const CENTER = VIEWBOX / 2;
const RADIUS = 11;
const DOT_RADIUS = 2.2;

const EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DURATION = 1.2;
const STAGGER = 0.06;
const INITIAL_DELAY = 0.1;

interface LogoProps {
  /** Pixel size of the logo */
  size?: number;
  /** Play gong entrance animation */
  animate?: boolean;
}

/** Calculates the final (x, y) position for a dot on the circle. */
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
                cx + (cx - CENTER) * 0.6,
                cx - (cx - CENTER) * 0.15,
                cx + (cx - CENTER) * 0.05,
                cx,
              ],
              cy: [
                CENTER,
                cy + (cy - CENTER) * 0.6,
                cy - (cy - CENTER) * 0.15,
                cy + (cy - CENTER) * 0.05,
                cy,
              ],
              r: [
                0,
                DOT_RADIUS * 1.8,
                DOT_RADIUS * 0.7,
                DOT_RADIUS * 1.2,
                DOT_RADIUS,
              ],
            }}
            transition={{
              duration: DURATION,
              delay: INITIAL_DELAY + i * STAGGER,
              ease: EASING,
              times: [0, 0.35, 0.55, 0.75, 1],
            }}
          />
        );
      })}

    </svg>
  );
}
