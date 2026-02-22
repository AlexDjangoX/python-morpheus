"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function DarkToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [rotationCount, setRotationCount] = useState(0);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const darkMode = resolvedTheme === "dark";

  const toggleDarkMode = () => {
    setTheme(darkMode ? "light" : "dark");
    setRotationCount((c) => c + 1);
  };

  return (
    <motion.div
      className="relative flex h-[32px] min-w-[82px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-200 shadow-inner shadow-slate-500/65 transition-all duration-300 dark:bg-gray-900 dark:shadow-slate-600"
      onClick={toggleDarkMode}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-testid="dark-mode-toggle"
      role="button"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && toggleDarkMode()}
    >
      <div className="absolute left-[5px] z-10">
        <Sun size={20} className="text-yellow-600 dark:text-yellow-400" />
      </div>

      <div className="absolute right-[4px] z-10">
        <Moon size={20} className="text-gray-400 dark:text-gray-400" />
      </div>

      <motion.div
        className="absolute top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 shadow-md transition-colors duration-300 dark:from-gray-500 dark:to-gray-800"
        animate={{
          x: darkMode ? 54 : 2,
          rotate: rotationCount * 360,
        }}
        style={{ left: "1px" }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      >
        {darkMode ? (
          <Moon size={16} className="text-white" strokeWidth={1.4} />
        ) : (
          <Sun size={16} className="text-white" strokeWidth={1.4} />
        )}
      </motion.div>
    </motion.div>
  );
}
