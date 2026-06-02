import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerGroupProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  once?: boolean;
  amount?: number;
}

export function StaggerGroup({
  children,
  stagger = 0.1,
  delay = 0,
  once = true,
  amount = 0.2,
  className,
  ...rest
}: StaggerGroupProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  distance?: number;
}

export function StaggerItem({ children, distance = 24, className, ...rest }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
