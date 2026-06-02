import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: Direction;
  once?: boolean;
  amount?: number;
}

const offsetFor = (dir: Direction, d: number) => {
  switch (dir) {
    case "up": return { y: d };
    case "down": return { y: -d };
    case "left": return { x: d };
    case "right": return { x: -d };
    default: return {};
  }
};

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.55,
  distance = 24,
  direction = "up",
  once = true,
  amount = 0.2,
  className,
  ...rest
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...offsetFor(direction, distance) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
