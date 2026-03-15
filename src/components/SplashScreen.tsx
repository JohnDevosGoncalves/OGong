"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "ogong-splash-shown";

const dots = [
  { color: "#FF8C42", angle: 0 },
  { color: "#FFB347", angle: 60 },
  { color: "#4A3AFF", angle: 120 },
  { color: "#7B6FFF", angle: 180 },
  { color: "#FF6B6B", angle: 240 },
  { color: "#FF8C42", angle: 300 },
];

const VIEWBOX = 64;
const CENTER = VIEWBOX / 2;
const LOGO_RADIUS = 22;
const DOT_RADIUS = 4.5;

const EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Phase = "gong" | "text" | "exit";

/**
 * Full-screen splash with gong animation and ripple rings.
 * Shown once per visitor (stored in localStorage).
 */
export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("gong");

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReducedMotion) return;

    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Storage unavailable — skip splash
      return;
    }

    setVisible(true);
  }, [prefersReducedMotion]);

  const handleComplete = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible) return;

    const t1 = setTimeout(() => setPhase("text"), 600);
    const t2 = setTimeout(() => setPhase("exit"), 1800);
    const t3 = setTimeout(handleComplete, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible, handleComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ backgroundColor: "var(--background)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Ripple rings — gong shockwave */}
          <div className="relative">
            {[0, 1, 2].map((ring) => (
              <motion.div
                key={ring}
                className="absolute rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "color-mix(in srgb, var(--primary) 20%, transparent)",
                }}
                initial={{ width: 0, height: 0, opacity: 0.6 }}
                animate={{
                  width: [0, 200 + ring * 80],
                  height: [0, 200 + ring * 80],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 1.4,
                  delay: 0.2 + ring * 0.2,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Logo SVG with gong bounce animation */}
            <svg
              width="80"
              height="80"
              viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
              fill="none"
              overflow="visible"
              className="relative z-10"
              role="img"
              aria-label="Logo OGong"
            >
              {dots.map((dot, i) => {
                const rad = (dot.angle * Math.PI) / 180;
                const cx = CENTER + LOGO_RADIUS * Math.cos(rad);
                const cy = CENTER + LOGO_RADIUS * Math.sin(rad);

                const overshoot = 1.7;
                const bounce = 0.85;
                const settle = 1.08;

                const oxCx = CENTER + LOGO_RADIUS * overshoot * Math.cos(rad);
                const oxCy = CENTER + LOGO_RADIUS * overshoot * Math.sin(rad);
                const bxCx = CENTER + LOGO_RADIUS * bounce * Math.cos(rad);
                const bxCy = CENTER + LOGO_RADIUS * bounce * Math.sin(rad);
                const sxCx = CENTER + LOGO_RADIUS * settle * Math.cos(rad);
                const sxCy = CENTER + LOGO_RADIUS * settle * Math.sin(rad);

                return (
                  <motion.circle
                    key={i}
                    fill={dot.color}
                    initial={{ cx: CENTER, cy: CENTER, r: 0 }}
                    animate={{
                      cx: [CENTER, oxCx, bxCx, sxCx, cx],
                      cy: [CENTER, oxCy, bxCy, sxCy, cy],
                      r: [0, DOT_RADIUS * 2.2, DOT_RADIUS * 0.6, DOT_RADIUS * 1.3, DOT_RADIUS],
                    }}
                    transition={{
                      duration: 1.1,
                      delay: i * 0.05,
                      ease: EASING,
                      times: [0, 0.3, 0.5, 0.7, 1],
                    }}
                  />
                );
              })}
            </svg>
          </div>

          {/* Brand name */}
          <motion.p
            className="mt-6 text-xl font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={
              phase === "text" ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }
            }
            transition={{ duration: 0.4 }}
          >
            ogong
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
