"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  y = 32,
  scale,
  blur = false,
  duration = 0.7,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Starting scale (e.g. 0.92) for a "grow into place" reveal. Omit for the plain fade/rise. */
  scale?: number;
  /** Adds a soft focus-pull: starts blurred, sharpens as it settles into place. */
  blur?: boolean;
  duration?: number;
  id?: string;
}) {
  return (
    <motion.div
      id={id}
      initial={{
        opacity: 0,
        y,
        ...(scale !== undefined ? { scale } : {}),
        ...(blur ? { filter: "blur(14px)" } : {}),
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        ...(scale !== undefined ? { scale: 1 } : {}),
        ...(blur ? { filter: "blur(0px)" } : {}),
      }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
