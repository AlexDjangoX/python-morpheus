"use client";

import "@/i18n/config";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GlobalTranslationsProvider } from "@/providers/GlobalTranslationsProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <GlobalTranslationsProvider>{children}</GlobalTranslationsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
