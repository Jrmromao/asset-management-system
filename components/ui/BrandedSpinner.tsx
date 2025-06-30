import { motion } from "framer-motion";
import React from "react";

interface BrandedSpinnerProps {
  size?: number;
  overlay?: boolean;
  className?: string;
  label?: string;
}

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1.4,
      ease: "linear",
    },
  },
};

const leafVariants = {
  animate: {
    scale: [1, 1.15, 1],
    rotate: [0, -10, 10, 0],
    y: [0, -3, 0],
    transition: {
      repeat: Infinity,
      duration: 1.4,
      ease: "easeInOut",
    },
  },
};

const sunVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.08, 1],
    transition: {
      repeat: Infinity,
      duration: 2.2,
      ease: "easeInOut",
    },
  },
};

const BrandedSpinner: React.FC<BrandedSpinnerProps> = ({
  size = 48,
  overlay = false,
  className = "",
  label = "Loading...",
}) => {
  const spinner = (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: "inline-block",
        position: "relative",
      }}
      aria-label={label}
      role="status"
    >
      {/* Sun Glow */}
      <motion.circle
        cx="25"
        cy="25"
        r="22"
        fill="url(#sun-glow)"
        style={{ position: "absolute", zIndex: 0 }}
        variants={sunVariants}
        animate="animate"
        initial={false}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "relative", zIndex: 1 }}
      >
        <defs>
          <linearGradient id="sustain-gradient" x1="10" y1="10" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22c55e" />
            <stop offset="1" stopColor="#16a34a" />
          </linearGradient>
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="#bbf7d0"
          strokeWidth="5"
          opacity="0.18"
        />
        {/* Animated green gradient arc */}
        <motion.circle
          cx="25"
          cy="25"
          r="20"
          stroke="url(#sustain-gradient)"
          strokeWidth="5"
          strokeDasharray="31.4 31.4"
          strokeLinecap="round"
          initial={{ pathLength: 0.2, opacity: 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
        />
        {/* Animated leaf */}
        <motion.g
          variants={leafVariants}
          animate="animate"
          style={{ transformOrigin: "25px 7px" }}
        >
          <path
            d="M25 7 C27 10, 31 13, 25 18 C19 13, 23 10, 25 7 Z"
            fill="#22c55e"
            opacity="0.85"
          />
          <path
            d="M25 7 C26 9, 28 11, 25 15 C22 11, 24 9, 25 7 Z"
            fill="#bbf7d0"
            opacity="0.7"
          />
        </motion.g>
      </svg>
    </div>
  );

  if (!overlay) return spinner;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      {spinner}
    </div>
  );
};

export default BrandedSpinner;

// Tailwind CSS (add to your global styles if not present):
// .animate-spin-slow { animation: spin 1.2s cubic-bezier(0.4,0,0.2,1) infinite; }
// .animate-fade-in { animation: fadeIn 0.5s ease-in; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } 