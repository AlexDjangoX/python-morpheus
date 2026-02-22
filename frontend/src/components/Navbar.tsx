"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

import { DarkToggle } from "@/components/navigation/DarkToggle";
import { LanguageSelector } from "@/components/navigation/LanguageSelector";

export function Navbar() {
  const { t } = useTranslation("navbar");
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <nav
      className={`sticky top-0 z-40 flex h-[3.8rem] w-full justify-center border-b border-border/50 pt-5 pb-3 transition-all duration-300 ease-in-out ${
        scrolled
          ? "bg-background/80 backdrop-blur-md"
          : "bg-background"
      }`}
      data-testid="navbar"
      aria-label="Main navigation"
    >
      <div className="mx-4 flex w-full max-w-[62rem] items-center justify-between sm:mx-16 lg:mx-auto lg:px-4">
        {/* Left: Language selector */}
        <div className="flex items-center gap-3">
          <LanguageSelector />
        </div>

        {/* Center: Brand name */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link
            href="/"
            className="hidden items-center text-xl font-semibold sm:flex sm:text-2xl"
          >
            <span className="bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
              {t("brandName")}
            </span>
          </Link>
        </div>

        {/* Right: Theme toggle */}
        <div className="flex items-center gap-3">
          <DarkToggle />
        </div>
      </div>
    </nav>
  );
}
