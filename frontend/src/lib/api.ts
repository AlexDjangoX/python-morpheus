const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchVerbs(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_BASE}/api/verbs`);
    if (res.ok) {
      const data = await res.json();
      if (typeof data === "object" && data !== null && !("detail" in data) && Object.keys(data).length > 0) {
        return data;
      }
    }
  } catch {
    /* fall through to static fallback */
  }
  try {
    const res = await fetch("/verbs.json");
    if (res.ok) {
      const data = await res.json();
      return typeof data === "object" && data !== null ? data : {};
    }
  } catch {
    /* ignore */
  }
  return {};
}

export interface ConjugateParams {
  verb: string;
  english?: string;
  aspect?: "niedokonany" | "dokonany";
}

export async function fetchConjugation(params: ConjugateParams): Promise<unknown> {
  const url = new URL(`${API_BASE}/api/conjugate`);
  url.searchParams.set("verb", params.verb.trim());
  if (params.english) url.searchParams.set("english", params.english);
  if (params.aspect) url.searchParams.set("aspect", params.aspect);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail || "Failed to conjugate verb");
  }
  return res.json();
}
