"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { Conjugation } from "@/types/conjugation";
import { TENSE_BLOCKS } from "@/types/conjugation";

const ROTATE_INTERVAL_MS = 3000;
const FADE_DURATION_MS = 2000;

/** Person | Polish | English — matches lexical-verb HeroConjugationCarousel grid */
const TABLE_GRID_CLASS =
  "grid grid-cols-[4.25rem_1fr_minmax(7rem,1.15fr)] sm:grid-cols-[4.5rem_1fr_minmax(7.5rem,1.15fr)]";

interface ConjugationTableProps {
  data: Conjugation;
}

function TenseTable({
  data,
  block,
  isActive,
  getTenseLabel,
}: {
  data: Conjugation;
  block: (typeof TENSE_BLOCKS)[number];
  isActive: boolean;
  getTenseLabel: (key: string) => string;
}) {
  const { t } = useTranslation("common");
  const tenseData = data[block.key] as Record<string, string>;
  if (!tenseData) return null;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20",
        isActive && "animate-hero-conjugation-glow"
      )}
      style={
        !isActive
          ? {
              boxShadow:
                "0 0 0 1px rgba(239,68,68,0.08), 0 0 32px -4px rgba(239,68,68,0.2), 0 0 32px -4px rgba(59,130,246,0.15), 0 25px 50px -12px rgba(0,0,0,0.25)",
            }
          : undefined
      }
    >
      {/* Table header — matches lexical HeroConjugationCarousel */}
      <div className="flex items-start justify-between gap-3 border-b border-border bg-secondary/50 px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t("conjugation")}
          </p>
          <p className="truncate text-lg font-bold text-foreground">
            {data.polish_word}
          </p>
          <p className="text-xs text-muted-foreground">{data.english_word}</p>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded-full border border-red-500/50 bg-gradient-to-r from-red-500 to-blue-500 px-2.5 py-1 text-xs font-semibold text-white">
          {getTenseLabel(block.labelKey)}
        </span>
      </div>

      {/* Column headers */}
      <div
        className={cn(
          "border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-widest text-muted-foreground",
          TABLE_GRID_CLASS
        )}
      >
        <div className="truncate px-2 py-3 text-center sm:px-3">{t("person")}</div>
        <div className="truncate border-l border-border px-2 py-3 text-center sm:px-3">
          {t("polish")}
        </div>
        <div className="truncate border-l border-border px-2 py-3 text-center sm:px-3">
          {t("english")}
        </div>
      </div>

      {/* Rows */}
      {block.rows.map((row, i) => (
        <div
          key={`${row.polishKey}-${i}`}
          className={cn(
            "border-b border-border text-sm last:border-b-0",
            i % 2 === 0 ? "bg-card" : "bg-secondary/20",
            TABLE_GRID_CLASS
          )}
        >
          <div className="truncate px-2 py-3 text-center font-semibold text-muted-foreground sm:px-3">
            {row.person}
          </div>
          <div
            className={cn(
              "truncate border-l border-border px-2 py-3 text-center font-medium sm:px-3",
              (tenseData[row.polishKey] || "—") === "—"
                ? "text-muted-foreground"
                : "text-foreground"
            )}
          >
            {tenseData[row.polishKey] || "—"}
          </div>
          <div className="truncate border-l border-border px-2 py-3 text-center font-bold sm:px-3">
            <span className="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
              {tenseData[row.transKey] || "—"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

const TENSE_LABEL_FALLBACK: Record<string, string> = {
  tensePresent: "Present",
  tensePastMasc: "Past masculine",
  tensePastFem: "Past feminine",
  tenseFutureMasc: "Future masculine",
  tenseFutureFem: "Future feminine",
  tenseFutureInfinitive: "Future infinitive",
  tenseImperative: "Imperative",
  tenseConditionalMasc: "Conditional masculine",
  tenseConditionalFem: "Conditional feminine",
};

export function ConjugationTable({ data }: ConjugationTableProps) {
  const { t } = useTranslation("common");
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => setMounted(true), []);

  const blocksWithData = TENSE_BLOCKS.filter(
    (block) => data[block.key] as Record<string, string> | undefined
  );
  const blockCount = blocksWithData.length;

  const goToIndex = useCallback(
    (index: number) => {
      setCurrentIndex(index % blockCount);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(
          () => setCurrentIndex((prev) => (prev + 1) % blockCount),
          ROTATE_INTERVAL_MS
        );
      }
    },
    [blockCount]
  );

  useEffect(() => {
    if (blockCount === 0) return;
    intervalRef.current = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % blockCount),
      ROTATE_INTERVAL_MS
    );
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [blockCount]);

  const getTenseLabel = (labelKey: string) =>
    mounted ? t(labelKey) : (TENSE_LABEL_FALLBACK[labelKey] ?? labelKey);

  return (
    <div className="relative w-full" data-testid="conjugation-table">
      {/* Tense pills — clickable + reflect current */}
      <div className="mb-3 flex h-auto w-full flex-wrap justify-center gap-1.5">
        {blocksWithData.map((block, index) => (
          <button
            key={block.key}
            type="button"
            onClick={() => goToIndex(index)}
            aria-label={getTenseLabel(block.labelKey)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
              index === currentIndex
                ? "border border-red-500/50 bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-sm"
                : "border border-border bg-muted/60 text-muted-foreground hover:border-purple-300 hover:bg-muted hover:text-foreground dark:hover:border-purple-600"
            )}
          >
            {getTenseLabel(block.labelKey)}
          </button>
        ))}
      </div>

      {/* Carousel — fade in/out */}
      <div className="relative min-h-80">
        {blocksWithData.map((block, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={block.key}
              className="conjugation-carousel-card"
              style={{
                position: isActive ? "relative" : "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: isActive ? 10 : 0,
                opacity: isActive ? 1 : 0,
                transform: isActive ? "scale(1)" : "scale(0.98)",
                pointerEvents: isActive ? "auto" : "none",
                transition: `opacity ${FADE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${FADE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              }}
            >
              <TenseTable
                data={data}
                block={block}
                isActive={isActive}
                getTenseLabel={getTenseLabel}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
