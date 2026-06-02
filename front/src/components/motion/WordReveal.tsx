import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

interface WordRevealProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  stagger?: number;
  highlightWords?: string[];
  highlightStyle?: CSSProperties;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  separator?: ReactNode;
}

export default function WordReveal({
  text,
  className,
  style,
  delay = 0,
  stagger = 0.06,
  highlightWords = [],
  highlightStyle,
  as = "h1",
}: WordRevealProps) {
  const Tag = motion[as];
  const words = text.split(" ");
  return (
    <Tag
      className={className}
      style={style}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      aria-label={text}
    >
      {words.map((w, i) => {
        const isHighlight = highlightWords.includes(w);
        return (
          <span
            key={i}
            className="inline-block align-baseline"
            style={{ marginRight: "0.28em" }}
            aria-hidden
          >
            <motion.span
              className="inline-block"
              style={isHighlight ? highlightStyle : undefined}
              variants={{
                hidden: { y: 28, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              {w}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}
