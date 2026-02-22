"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { i18n } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";

export function GlobalTranslationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage();

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
