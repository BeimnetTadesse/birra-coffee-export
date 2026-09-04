"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Dictionary } from "@/i18n/getDictionary";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AnimatedSection from "@/components/ui/AnimatedSection";

const ADVANCE_MS = 3600;

/**
 * Eight nodes laid out in a 1000xVIEW_H viewBox, alternating high/low to form a
 * wave. x is evenly spaced; y alternates between two rows. A smooth cubic
 * path is drawn through all eight points, and every odd-height node's label
 * sits above it while every even-height node's label sits below — matching
 * how the wave physically reads.
 */
const X = [60, 186, 311, 437, 563, 689, 814, 940];
const Y_HIGH = 65;
const Y_LOW = 145;
const VIEW_H = 210;
const POINTS = X.map((x, i) => ({ x, y: i % 2 === 0 ? Y_HIGH : Y_LOW }));

function wavePath(points: { x: number; y: number }[]) {
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = (p1.x - p0.x) / 2;
    d += ` C ${p0.x + dx},${p0.y} ${p1.x - dx},${p1.y} ${p1.x},${p1.y}`;
  }
  return d;
}

const PATH_D = wavePath(POINTS);

export default function Journey({ dict }: { dict: Dictionary }) {
  const j = dict.journey;
  const total = j.stages.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % total), ADVANCE_MS);
    return () => clearTimeout(id);
  }, [active, paused, total]);

  const stage = j.stages[active];

  return (
    <section id="journey" className="relative border-t border-ink-700/10 bg-cream-50 py-14 sm:py-16">
      <Container>
        <AnimatedSection>
          <Eyebrow>{j.eyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-4xl font-display text-2xl sm:text-3xl lg:text-4xl text-ink-700 text-balance">
            {j.title}
          </h2>
        </AnimatedSection>

        <div
          className="mt-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="relative min-h-[120px]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-gold-600">
                    <span className="h-px w-6 bg-gold-500/70" />
                    {j.stageLabel} {stage.number}
                  </span>
                  <h3 className="mt-1 font-display text-2xl sm:text-3xl text-ink-700">
                    {stage.title}
                  </h3>
                  <p className="mt-1.5 max-w-md text-sm text-ink-500 leading-relaxed">
                    {stage.desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative hidden shrink-0 text-end sm:block">
              <span className="font-mono text-[11px] tracking-[0.2em] text-gold-600">
                {stage.number} / {String(total).padStart(2, "0")} · {j.endLabel}
              </span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="pointer-events-none select-none font-display text-[64px] leading-none text-transparent [-webkit-text-stroke:1.2px_rgba(26,43,32,0.15)]"
                >
                  {stage.number}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Wave track */}
          <div className="texture-lines relative mt-6 overflow-hidden rounded-2xl bg-pine-900 pb-9 pt-9">
            <svg viewBox={`0 0 1000 ${VIEW_H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
              <path d={PATH_D} fill="none" stroke="rgba(247,242,230,0.12)" strokeWidth="2" />
              <motion.path
                d={PATH_D}
                fill="none"
                stroke="#efa924"
                strokeWidth="2"
                strokeDasharray="2 8"
                strokeLinecap="round"
                opacity={0.55}
                animate={{ strokeDashoffset: [0, -40] }}
                transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
              />
              <motion.path
                d={PATH_D}
                fill="none"
                stroke="#efa924"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: total > 1 ? active / (total - 1) : 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
              {POINTS.map((p, i) => (
                <g key={i} className="cursor-pointer" onClick={() => setActive(i)}>
                  <circle cx={p.x} cy={p.y} r="18" fill="transparent" />
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    animate={{ r: i === active ? 7 : 4 }}
                    transition={{ duration: 0.3 }}
                    fill={i <= active ? "#efa924" : "#0b1e14"}
                    stroke={i <= active ? "#efa924" : "rgba(247,242,230,0.3)"}
                    strokeWidth="1.5"
                  />
                </g>
              ))}
            </svg>

            <div className="pointer-events-none absolute inset-0">
              {j.stages.map((s, i) => {
                const p = POINTS[i];
                const isHigh = i % 2 === 0;
                const isActive = i === active;
                return (
                  <button
                    key={s.number}
                    onClick={() => setActive(i)}
                    aria-label={s.title}
                    className={`pointer-events-auto absolute -translate-x-1/2 whitespace-nowrap text-center ${
                      isHigh ? "-translate-y-[125%]" : "translate-y-[32%]"
                    }`}
                    style={{ left: `${(p.x / 1000) * 100}%`, top: `${(p.y / VIEW_H) * 100}%` }}
                  >
                    {/* Below sm, only the active stage's label shows — eight
                        crowded labels on a narrow track were overlapping and
                        clipping against the rounded edges. */}
                    <div
                      className={`font-mono text-[9px] tracking-[0.1em] sm:text-[10px] sm:tracking-[0.15em] ${
                        isActive ? "" : "hidden sm:block"
                      }`}
                    >
                      {isHigh ? (
                        <>
                          <div className={isActive ? "text-gold-400" : "text-cream-100/35"}>
                            {s.number}
                          </div>
                          <div
                            className={`mt-0.5 transition-colors ${
                              isActive ? "text-cream-100" : "text-cream-100/35"
                            }`}
                          >
                            {s.title.toUpperCase()}
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className={`transition-colors ${
                              isActive ? "text-cream-100" : "text-cream-100/35"
                            }`}
                          >
                            {s.title.toUpperCase()}
                          </div>
                          <div className={`mt-0.5 ${isActive ? "text-gold-400" : "text-cream-100/35"}`}>
                            {s.number}
                          </div>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
