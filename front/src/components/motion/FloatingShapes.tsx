import { motion } from "framer-motion";

interface Shape {
  cx: string;
  cy: string;
  r: number;
  fill: string;
  delay?: number;
  amp?: number;
  duration?: number;
}

const defaultShapes: Shape[] = [
  { cx: "8%",  cy: "20%", r: 6,  fill: "#ffd766", delay: 0,   amp: 14, duration: 6 },
  { cx: "16%", cy: "75%", r: 10, fill: "#ffffff", delay: 0.4, amp: 22, duration: 8 },
  { cx: "78%", cy: "18%", r: 14, fill: "#ffb800", delay: 0.8, amp: 18, duration: 7 },
  { cx: "88%", cy: "60%", r: 8,  fill: "#ffffff", delay: 1.2, amp: 26, duration: 9 },
  { cx: "62%", cy: "82%", r: 5,  fill: "#ffd766", delay: 1.6, amp: 16, duration: 6.5 },
  { cx: "38%", cy: "12%", r: 4,  fill: "#ffffff", delay: 0.2, amp: 12, duration: 5.5 },
];

const sparkleAngles = [12, 28, 70, 84];

export default function FloatingShapes({
  className,
  shapes = defaultShapes,
}: {
  className?: string;
  shapes?: Shape[];
}) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {shapes.map((s, i) => (
        <motion.circle
          key={`c-${i}`}
          cx={s.cx}
          cy={s.cy}
          r={s.r * 0.18}
          fill={s.fill}
          fillOpacity={0.55}
          initial={{ y: 0, scale: 0.9, opacity: 0 }}
          animate={{
            y: [0, -(s.amp ?? 18) * 0.18, 0],
            scale: [0.9, 1.1, 0.9],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{
            duration: s.duration ?? 7,
            delay: s.delay ?? 0,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {sparkleAngles.map((angle, i) => {
        const cx = 50 + Math.cos((angle * Math.PI) / 180) * 38;
        const cy = 50 + Math.sin((angle * Math.PI) / 180) * 28;
        return (
          <motion.g
            key={`s-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1, 0], opacity: [0, 0.85, 0] }}
            transition={{
              duration: 3.5,
              delay: i * 0.9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: `${cx}% ${cy}%`, transformBox: "fill-box" }}
          >
            <line
              x1={cx - 1.2} y1={cy} x2={cx + 1.2} y2={cy}
              stroke="#ffd766" strokeWidth="0.4" strokeLinecap="round"
            />
            <line
              x1={cx} y1={cy - 1.2} x2={cx} y2={cy + 1.2}
              stroke="#ffd766" strokeWidth="0.4" strokeLinecap="round"
            />
          </motion.g>
        );
      })}
    </svg>
  );
}
