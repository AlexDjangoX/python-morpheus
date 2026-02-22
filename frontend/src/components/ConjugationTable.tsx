"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Conjugation } from "@/types/conjugation";
import { TENSE_BLOCKS } from "@/types/conjugation";

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
}: {
  data: Conjugation;
  block: (typeof TENSE_BLOCKS)[number];
  isActive: boolean;
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
          {block.label}
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

export function ConjugationTable({ data }: ConjugationTableProps) {
  return (
    <div className="relative w-full" data-testid="conjugation-table">
      <Tabs defaultValue={TENSE_BLOCKS[0].key} className="w-full">
        {/* Tense tabs — lexical pill style */}
        <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-center gap-1.5 rounded-none border-0 bg-transparent p-0">
          {TENSE_BLOCKS.map((block) => {
            const tenseData = data[block.key] as Record<string, string>;
            if (!tenseData) return null;
            return (
              <TabsTrigger
                key={block.key}
                value={block.key}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
                  "data-[state=active]:border data-[state=active]:border-red-500/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm",
                  "data-[state=inactive]:border data-[state=inactive]:border-border data-[state=inactive]:bg-muted/60 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:border-purple-300 data-[state=inactive]:hover:bg-muted data-[state=inactive]:hover:text-foreground dark:data-[state=inactive]:hover:border-purple-600"
                )}
              >
                {block.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab content — one card per tense */}
        <div className="relative min-h-80">
          {TENSE_BLOCKS.map((block) => {
            const tenseData = data[block.key] as Record<string, string>;
            if (!tenseData) return null;
            return (
              <TabsContent key={block.key} value={block.key} className="mt-0">
                <TenseTable
                  data={data}
                  block={block}
                  isActive={true}
                />
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </div>
  );
}
