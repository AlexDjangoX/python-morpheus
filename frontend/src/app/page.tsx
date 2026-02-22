"use client";

import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import type { Theme } from "react-select";
import { fetchConjugation, fetchVerbs } from "@/lib/api";
import type { Conjugation } from "@/types/conjugation";
import { TENSE_BLOCKS } from "@/types/conjugation";

type VerbOption = { value: string; label: string };

export default function Home() {
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
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 px-6 py-4">
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          Polish Verb Conjugator
        </h1>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <form onSubmit={handleSearch} className="mb-8 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[280px]">
            <label htmlFor="verb" className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Verb (infinitive)
            </label>
            <p className="mb-1.5 text-xs text-stone-500 dark:text-stone-400">
              Search by Polish or English translation
            </p>
            {mounted ? (
              <CreatableSelect
                inputId="verb"
                isClearable
                options={verbOptions}
                value={selectedVerb}
                onChange={(opt: VerbOption | null) => {
                  setSelectedVerb(opt);
                  // Auto-fill English from dropdown when selecting a known verb
                  if (opt?.label?.includes(" — ")) {
                    setEnglish(opt.label.split(" — ")[1]?.trim() ?? "");
                  } else {
                    setEnglish("");
                  }
                }}
                onCreateOption={(inputValue: string) => setSelectedVerb({ value: inputValue.trim(), label: inputValue.trim() })}
                filterOption={(option: { value: string; label: string }, inputValue: string) => {
                  const q = inputValue.toLowerCase();
                  return (
                    option.value.toLowerCase().includes(q) || option.label.toLowerCase().includes(q)
                  );
                }}
                formatCreateLabel={(inputValue: string) => `Create "${inputValue}"`}
                placeholder="Search by Polish or English (e.g. gładzić, to know, kill)"
                classNamePrefix="verb-select"
                noOptionsMessage={() => "No matching verb. Type to create one."}
                theme={(theme: Theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    neutral0: "#ffffff",
                    neutral5: "#f5f5f4",
                    neutral10: "#e7e5e4",
                    neutral20: "#d6d3d1",
                    neutral30: "#a8a29e",
                    neutral40: "#78716c",
                    neutral50: "#57534e",
                    neutral60: "#44403c",
                    neutral70: "#292524",
                    neutral80: "#1c1917",
                    neutral90: "#0c0a09",
                  },
                })}
                styles={{
                  control: (base: React.CSSProperties) => ({ ...base, minHeight: 42 }),
                  option: (
                    base: React.CSSProperties,
                    state: { isFocused: boolean; isSelected: boolean }
                  ) => ({
                    ...base,
                    color: "#1c1917",
                    backgroundColor: state.isFocused ? "#f5f5f4" : state.isSelected ? "#fef3c7" : "#ffffff",
                  }),
                  singleValue: (base: React.CSSProperties) => ({ ...base, color: "#1c1917" }),
                  input: (base: React.CSSProperties) => ({ ...base, color: "#1c1917" }),
                  placeholder: (base: React.CSSProperties) => ({ ...base, color: "#78716c" }),
                  noOptionsMessage: (base: React.CSSProperties) => ({ ...base, color: "#57534e" }),
                }}
                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                menuPosition="fixed"
                classNames={{
                  control: () => "!min-h-[42px] !rounded-lg",
                  menu: () => "!z-50",
                }}
              />
            ) : (
              <div className="min-h-[42px] rounded-lg border border-stone-300 bg-white px-4 py-2.5 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100">
                <span className="text-stone-400 dark:text-stone-500">Loading…</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="english" className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
              English (optional)
            </label>
            <input
              id="english"
              type="text"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              placeholder="e.g. to stroke"
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !selectedVerb?.value?.trim()}
            className="rounded-lg bg-amber-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Searching…" : "Conjugate"}
          </button>
        </form>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                {data.polish_word}
              </h2>
              <p className="text-stone-600 dark:text-stone-400">{data.english_word}</p>
              <span className="mt-1 inline-block rounded bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-600 dark:text-stone-200">
                {data.gram_case_aspect}
              </span>
            </div>

            {TENSE_BLOCKS.map((block) => {
              const tenseData = data[block.key] as Record<string, string>;
              if (!tenseData) return null;
              return (
                <section
                  key={block.key}
                  className="overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
                >
                  <h3 className="border-b border-stone-200 bg-stone-50 px-4 py-3 font-semibold text-stone-800 dark:border-stone-700 dark:bg-stone-800/50 dark:text-stone-200">
                    {block.label}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <thead>
                        <tr className="border-b border-stone-200 dark:border-stone-700">
                          <th className="px-4 py-3 text-left text-sm font-medium text-stone-600 dark:text-stone-400">
                            Person
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-stone-600 dark:text-stone-400">
                            Polish
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-stone-600 dark:text-stone-400">
                            English
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row) => (
                          <tr
                            key={row.polishKey}
                            className="border-b border-stone-100 last:border-0 dark:border-stone-800"
                          >
                            <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-400">
                              {row.person}
                            </td>
                            <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                              {tenseData[row.polishKey] || "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-400">
                              {tenseData[row.transKey] || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
