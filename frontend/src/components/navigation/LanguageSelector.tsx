"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [rotationCount, setRotationCount] = useState(0);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "pl" : "en");
    setRotationCount((c) => c + 1);
  };

  return (
    <motion.div
      className="relative flex h-[32px] min-w-[82px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-200 shadow-inner shadow-slate-500/65 transition-all duration-300 dark:bg-gray-900 dark:shadow-slate-600"
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-testid="language-selector"
      data-language={language}
      role="button"
      aria-label={`Switch to ${language === "en" ? "Polish" : "English"}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && toggleLanguage()}
    >
      <div className="absolute left-[5px] z-10 flex h-5 w-5 items-center justify-center overflow-hidden rounded-sm">
        <Image
          src="/images/uk.png"
          alt="English"
          width={20}
          height={15}
          className="object-cover"
        />
      </div>

      <div className="absolute right-[4px] z-10 flex h-5 w-5 items-center justify-center overflow-hidden rounded-sm">
        <Image
          src="/images/pl.png"
          alt="Polish"
          width={20}
          height={15}
          className="object-cover"
        />
      </div>

      <motion.div
        className="absolute top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-red-300 to-red-600 shadow-md transition-colors duration-300 dark:from-gray-500 dark:to-gray-800"
        animate={{
          x: language === "pl" ? 2 : 54,
          rotate: rotationCount * 360,
        }}
        style={{ left: "1px" }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      >
        <Languages
          strokeWidth={1.4}
          size={16}
          className="text-white dark:text-white"
        />
      </motion.div>
    </motion.div>
  );
}
