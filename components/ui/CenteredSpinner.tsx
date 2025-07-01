import React, { useMemo } from "react";
import FullscreenLoader from "../FullscreenLoader";
import { motion, AnimatePresence } from "framer-motion";

const SUSTAINABILITY_TIPS = [
  "Did you know? Recycling one laptop saves enough energy to power a home for 10 days.",
  "Tip: Unplug chargers when not in use to save energy.",
  "Fact: Extending asset life reduces e-waste and carbon footprint.",
  "Sustainability: Digital documents save trees and reduce emissions.",
  "Fun fact: LED bulbs use 75% less energy than incandescent lighting.",
  // Add more tips as you like!
];

function getRandomTip() {
  return SUSTAINABILITY_TIPS[Math.floor(Math.random() * SUSTAINABILITY_TIPS.length)];
}

const CenteredSpinner: React.FC<{ label?: string; showTip?: boolean; isLoading?: boolean }> = ({
  label,
  showTip = true,
  isLoading = true,
}) => {
  const tip = useMemo(getRandomTip, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="centered-spinner"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="fixed inset-0 flex flex-col items-center justify-center w-full h-full bg-white z-50"
        >
          <FullscreenLoader />
          {showTip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.85, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 text-center text-emerald-700 text-base font-medium max-w-md"
            >
              {tip}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CenteredSpinner; 