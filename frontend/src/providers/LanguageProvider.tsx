"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { i18n, languages, type Language } from "@/i18n";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  isPending: boolean;
}

function isValidLanguage(lang: string): lang is Language {
  return (languages as readonly string[]).includes(lang);
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({
  children,
  initialLang = "en",
}: {
  children: React.ReactNode;
  initialLang?: string;
}) {
  const [language, setLanguageState] = useState<string>(initialLang);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const setLanguage = (lang: string) => {
    if (!isValidLanguage(lang)) return;
    if (language === lang) return;

    i18n.changeLanguage(lang);
    setLanguageState(lang);

    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `NEXT_LOCALE=${lang};expires=${date.toUTCString()};path=/`;
    localStorage.setItem("language", lang);

    startTransition(() => router.refresh());
  };

  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved && isValidLanguage(saved) && saved !== language) {
      i18n.changeLanguage(saved);
      setLanguageState(saved);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isPending }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
