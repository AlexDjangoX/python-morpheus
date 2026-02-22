export const fallbackLng = "en";
export const languages = ["en", "pl"] as const;
export const defaultNS = "common";
export const namespaces = ["common", "navbar"] as const;

export type Language = (typeof languages)[number];
export type Namespace = (typeof namespaces)[number];

export function getI18nOptions(
  lng = fallbackLng,
  ns: string | string[] = defaultNS
) {
  const resolvedNs = Array.isArray(ns) ? ns : [ns];
  const primaryNs = resolvedNs[0];
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: primaryNs,
    defaultNS: primaryNs,
    ns: resolvedNs,
  };
}
