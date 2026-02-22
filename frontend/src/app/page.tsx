"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import CreatableSelect from "react-select/creatable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ConjugationTable } from "@/components/ConjugationTable";
import { Navbar } from "@/components/Navbar";
import { fetchConjugation, fetchVerbs } from "@/lib/api";
import type { Conjugation } from "@/types/conjugation";
import { PLACEHOLDER_CONJUGATION } from "@/data/placeholderConjugation";

import "@/components/VerbSelect.css";

type VerbOption = { value: string; label: string };

/** Fallback strings for SSR — must match en/common.json so server/client render identically */
const FALLBACK = {
  pageTitle: "Conjugate Polish Verbs",
  verbLabel: "Verb (infinitive)",
  searchHint: "Search by Polish or English translation",
  englishOptional: "English (optional)",
  searchPlaceholder: "Search by Polish or English",
  createLabel: (value: string) => `Create "${value}"`,
  noOptionsMessage: "No matching verb. Type to create one.",
  englishPlaceholder: "e.g. to stroke",
  loading: "Loading…",
  searching: "Searching…",
  conjugate: "Conjugate",
} as const;

export default function Home() {
  const { t } = useTranslation("common");
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [verbOptions, setVerbOptions] = useState<VerbOption[]>([]);
  const [selectedVerb, setSelectedVerb] = useState<VerbOption | null>(null);
  const [english, setEnglish] = useState("");
  const [data, setData] = useState<Conjugation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDarkMode = resolvedTheme === "dark";

  const selectStyles = useMemo(
    () => ({
      control: (
        baseStyles: Record<string, unknown>,
        state: { isFocused?: boolean }
      ) => ({
        ...baseStyles,
        borderColor: state.isFocused
          ? isDarkMode
            ? "#6366f1"
            : "#818cf8"
          : isDarkMode
            ? "#4338ca"
            : "#c7d2fe",
        backgroundColor: isDarkMode
          ? "rgba(67, 56, 202, 0.2)"
          : "#eef2ff",
        width: "100%",
        color: isDarkMode ? "#e0e7ff" : "#4338ca",
        fontSize: "1rem",
        borderRadius: "0.5rem",
        fontWeight: "400",
        minWidth: "100%",
        borderWidth: "1px",
        minHeight: 42,
        boxShadow: state.isFocused
          ? isDarkMode
            ? "0 0 0 1px #6366f1"
            : "0 0 0 1px #818cf8"
          : "none",
      }),
      placeholder: (defaultStyles: Record<string, unknown>) => ({
        ...defaultStyles,
        color: isDarkMode ? "#a5b4fc" : "#6366f1",
        fontSize: "1rem",
      }),
      singleValue: (provided: Record<string, unknown>) => ({
        ...provided,
        color: isDarkMode ? "#e0e7ff" : "#4338ca",
        fontSize: "1rem",
      }),
      input: (provided: Record<string, unknown>) => ({
        ...provided,
        color: isDarkMode ? "#e0e7ff" : "#4338ca",
        minWidth: "100%",
        flex: "1 1 auto",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap" as const,
      }),
      indicatorSeparator: (provided: Record<string, unknown>) => ({
        ...provided,
        backgroundColor: isDarkMode ? "#6366f1" : "#a5b4fc",
      }),
      dropdownIndicator: (
        provided: Record<string, unknown>,
        state: { selectProps?: { menuIsOpen?: boolean } }
      ) => ({
        ...provided,
        color: isDarkMode ? "#a5b4fc" : "#6366f1",
        transform: state.selectProps?.menuIsOpen
          ? "rotate(180deg)"
          : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }),
      clearIndicator: (provided: Record<string, unknown>) => ({
        ...provided,
        color: isDarkMode ? "#a5b4fc" : "#6366f1",
      }),
      menu: (provided: Record<string, unknown>) => ({
        ...provided,
        backgroundColor: isDarkMode ? "#1e1b4b" : "#ffffff",
        borderRadius: "0.5rem",
        border: isDarkMode ? "1px solid #4338ca" : "1px solid #c7d2fe",
        boxShadow: isDarkMode
          ? "0 4px 6px -1px rgba(67, 56, 202, 0.3)"
          : "0 4px 6px -1px rgba(99, 102, 241, 0.1)",
        zIndex: 9999,
      }),
      menuList: (provided: Record<string, unknown>) => ({
        ...provided,
        padding: "4px",
      }),
      option: (
        provided: Record<string, unknown>,
        state: { isFocused?: boolean; isSelected?: boolean }
      ) => ({
        ...provided,
        height: 36,
        backgroundColor: state.isSelected
          ? isDarkMode
            ? "#4338ca"
            : "#818cf8"
          : state.isFocused
            ? isDarkMode
              ? "rgba(67, 56, 202, 0.5)"
              : "#eef2ff"
            : "transparent",
        color: state.isSelected || (state.isFocused && isDarkMode)
          ? "#ffffff"
          : isDarkMode
            ? "#e0e7ff"
            : "#4338ca",
      }),
      noOptionsMessage: (provided: Record<string, unknown>) => ({
        ...provided,
        color: isDarkMode ? "#a5b4fc" : "#6366f1",
      }),
    }),
    [isDarkMode]
  );

  useEffect(() => {
    if (mounted) {
      fetchVerbs().then((verbs) => {
        setVerbOptions(
          Object.entries(verbs).map(([pl, en]) => ({ value: pl, label: `${pl} — ${en}` }))
        );
      });
    }
  }, [mounted]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const verb = selectedVerb?.value?.trim() ?? "";
    if (!verb) return;
    setError(null);
    setLoading(true);
    // Use English from optional field, or extract from dropdown label (e.g. "znać — to know")
    const englishFromLabel =
      selectedVerb?.label?.includes(" — ") ? selectedVerb.label.split(" — ")[1]?.trim() : undefined;
    const englishToSend = english.trim() || englishFromLabel || undefined;
    try {
      const result = await fetchConjugation({
        verb,
        english: englishToSend,
      });
      setData(result as Conjugation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="hero-grid pointer-events-none absolute inset-0 z-0" />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-[62rem] px-4 py-10 pb-16 sm:px-6 lg:px-8">
        {/* Hero / Search section */}
        <section className="mb-12">
          <div className="mb-8 text-center">
            <h1 className="bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
              {mounted ? t("pageTitle") : FALLBACK.pageTitle}
            </h1>
            <p className="mt-2 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-sm text-transparent">
              {mounted ? t("searchHint") : FALLBACK.searchHint}
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/80 p-6 shadow-lg backdrop-blur-sm sm:p-8"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-6">
              <div className="flex-1 min-w-0">
                <Label htmlFor="verb" className="mb-2 block text-sm font-medium">
                  {mounted ? t("verbLabel") : FALLBACK.verbLabel}
                </Label>
                {mounted ? (
                  <div className="verb-select-wrap" data-testid="verb-select">
                    <CreatableSelect
                  inputId="verb"
                  isClearable
                  options={verbOptions}
                  value={selectedVerb}
                  onChange={(opt: VerbOption | null) => {
                    setSelectedVerb(opt);
                    if (opt?.label?.includes(" — ")) {
                      setEnglish(opt.label.split(" — ")[1]?.trim() ?? "");
                    } else {
                      setEnglish("");
                    }
                  }}
                  onCreateOption={(inputValue: string) =>
                    setSelectedVerb({
                      value: inputValue.trim(),
                      label: inputValue.trim(),
                    })
                  }
                  filterOption={(option: { value: string; label: string }, inputValue: string) => {
                    const q = inputValue.toLowerCase();
                    return (
                      option.value.toLowerCase().includes(q) ||
                      option.label.toLowerCase().includes(q)
                    );
                  }}
                  formatCreateLabel={(inputValue: string) =>
                    mounted
                      ? t("createLabel", { value: inputValue })
                      : FALLBACK.createLabel(inputValue)
                  }
                  placeholder={mounted ? t("searchPlaceholder") : FALLBACK.searchPlaceholder}
                  classNamePrefix="verb-select"
                  noOptionsMessage={() =>
                    mounted ? t("noOptionsMessage") : FALLBACK.noOptionsMessage
                  }
                  styles={selectStyles}
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : undefined
                  }
                  menuPlacement="auto"
                  menuPosition="fixed"
                  classNames={{ menu: () => "!z-[9999]" }}
                    />
                  </div>
                ) : (
                  <div className="min-h-[42px] rounded-lg border border-input bg-background px-4 py-2.5">
                    <span className="text-muted-foreground">
                      {mounted ? t("loading") : FALLBACK.loading}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 sm:max-w-[220px]">
                <Label htmlFor="english" className="mb-2 block text-sm font-medium">
                  {mounted ? t("englishOptional") : FALLBACK.englishOptional}
                </Label>
                <input
                  id="english"
                  type="text"
                  value={english}
                  onChange={(e) => setEnglish(e.target.value)}
                  placeholder={mounted ? t("englishPlaceholder") : FALLBACK.englishPlaceholder}
                  className="h-11 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !selectedVerb?.value?.trim()}
                size="default"
                className="shrink-0"
              >
                {loading
                  ? (mounted ? t("searching") : FALLBACK.searching)
                  : (mounted ? t("conjugate") : FALLBACK.conjugate)}
              </Button>
            </div>
          </form>
        </section>

        {error && (
          <div className="mx-auto max-w-3xl rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Conjugation section */}
        <section className="flex flex-col items-center">
          {data && (
            <div className="mb-6 w-full max-w-3xl rounded-xl border border-border bg-card/60 px-5 py-4 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {data.polish_word}
                </h2>
                <span className="text-muted-foreground">—</span>
                <p className="text-muted-foreground">{data.english_word}</p>
                <span className="rounded-full border border-red-500/30 bg-gradient-to-r from-red-500/10 to-blue-500/10 px-3 py-1 text-xs font-medium text-foreground">
                  {data.gram_case_aspect}
                </span>
              </div>
            </div>
          )}

          <div className="w-full max-w-3xl">
            <ConjugationTable data={data ?? PLACEHOLDER_CONJUGATION} />
          </div>
        </section>
      </main>
    </div>
  );
}
