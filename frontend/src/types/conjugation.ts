/**
 * Conjugation object returned by the REST API.
 * Matches the JSON structure from the Python conjugator.
 */
export interface Conjugation {
  id: string;
  notes: string;
  polish_word: string;
  english_word: string;
  gram_case_aspect: string;
  image_url: string;
  word_image: { image_url: string };
  present: TenseBlock<"present">;
  past_masc: TenseBlock<"past_masc">;
  past_fem: TenseBlock<"past_fem">;
  future_masc: TenseBlock<"future_masc">;
  future_fem: TenseBlock<"future_fem">;
  imp_future: TenseBlock<"imp_future">;
  imperative: TenseBlock<"imperative">;
  conditional_masculine: TenseBlock<"conditional_masculine">;
  conditional_feminine: TenseBlock<"conditional_feminine">;
}

type TenseBlock<T extends string> = Record<string, string>;

export const TENSE_BLOCKS: { key: keyof Conjugation; label: string; rows: { person: string; polishKey: string; transKey: string }[] }[] = [
  {
    key: "present",
    label: "Present",
    rows: [
      { person: "ja (I)", polishKey: "present_ja", transKey: "present_ja_trans" },
      { person: "ty (you)", polishKey: "present_ty", transKey: "present_ty_trans" },
      { person: "on/ona/ono (he/she/it)", polishKey: "present_on_ona_ono", transKey: "present_on_ona_ono_trans" },
      { person: "my (we)", polishKey: "present_my", transKey: "present_my_trans" },
      { person: "wy (you all)", polishKey: "present_wy", transKey: "present_wy_trans" },
      { person: "oni/one (they)", polishKey: "present_oni_one", transKey: "present_oni_one_trans" },
    ],
  },
  {
    key: "past_masc",
    label: "Past (masculine)",
    rows: [
      { person: "ja", polishKey: "past_ja_masc", transKey: "past_ja_masc_trans" },
      { person: "ty", polishKey: "past_ty_masc", transKey: "past_ty_masc_trans" },
      { person: "on", polishKey: "past_on_masc", transKey: "past_on_masc_trans" },
      { person: "my", polishKey: "past_my_masc", transKey: "past_my_masc_trans" },
      { person: "wy", polishKey: "past_wy_masc", transKey: "past_wy_masc_trans" },
      { person: "oni", polishKey: "past_oni_masc", transKey: "past_oni_masc_trans" },
    ],
  },
  {
    key: "past_fem",
    label: "Past (feminine)",
    rows: [
      { person: "ja", polishKey: "past_ja_fem", transKey: "past_ja_fem_trans" },
      { person: "ty", polishKey: "past_ty_fem", transKey: "past_ty_fem_trans" },
      { person: "ona", polishKey: "past_ona_fem", transKey: "past_ona_fem_trans" },
      { person: "my", polishKey: "past_my_fem", transKey: "past_my_fem_trans" },
      { person: "wy", polishKey: "past_wy_fem", transKey: "past_wy_fem_trans" },
      { person: "one", polishKey: "past_one_fem", transKey: "past_one_fem_trans" },
    ],
  },
  {
    key: "future_masc",
    label: "Future (masculine)",
    rows: [
      { person: "ja", polishKey: "future_masc_ja", transKey: "future_masc_ja_trans" },
      { person: "ty", polishKey: "future_masc_ty", transKey: "future_masc_ty_trans" },
      { person: "on", polishKey: "future_masc_on", transKey: "future_masc_on_trans" },
      { person: "my", polishKey: "future_masc_my", transKey: "future_masc_my_trans" },
      { person: "wy", polishKey: "future_masc_wy", transKey: "future_masc_wy_trans" },
      { person: "oni", polishKey: "future_masc_oni", transKey: "future_masc_oni_trans" },
    ],
  },
  {
    key: "future_fem",
    label: "Future (feminine)",
    rows: [
      { person: "ja", polishKey: "future_fem_ja", transKey: "future_fem_ja_trans" },
      { person: "ty", polishKey: "future_fem_ty", transKey: "future_fem_ty_trans" },
      { person: "ona", polishKey: "future_fem_ona", transKey: "future_fem_ona_trans" },
      { person: "my", polishKey: "future_fem_my", transKey: "future_fem_my_trans" },
      { person: "wy", polishKey: "future_fem_wy", transKey: "future_fem_wy_trans" },
      { person: "one", polishKey: "future_fem_one", transKey: "future_fem_one_trans" },
    ],
  },
  {
    key: "imp_future",
    label: "Future (infinitive)",
    rows: [
      { person: "ja", polishKey: "imp_future_ja", transKey: "imp_future_ja_trans" },
      { person: "ty", polishKey: "imp_future_ty", transKey: "imp_future_ty_trans" },
      { person: "on/ona/ono", polishKey: "imp_future_on_ona_ono", transKey: "imp_future_on_ona_ono_trans" },
      { person: "my", polishKey: "imp_future_my", transKey: "imp_future_my_trans" },
      { person: "wy", polishKey: "imp_future_wy", transKey: "imp_future_wy_trans" },
      { person: "oni/one", polishKey: "imp_future_oni_one", transKey: "imp_future_oni_one_trans" },
    ],
  },
  {
    key: "imperative",
    label: "Imperative",
    rows: [
      { person: "ja", polishKey: "imperative_ja", transKey: "imperative_ja_trans" },
      { person: "ty", polishKey: "imperative_ty", transKey: "imperative_ty_trans" },
      { person: "on/ona/oni", polishKey: "imperative_on_ona_oni", transKey: "imperative_on_ona_oni_trans" },
      { person: "my", polishKey: "imperative_my", transKey: "imperative_my_trans" },
      { person: "wy", polishKey: "imperative_wy", transKey: "imperative_wy_trans" },
      { person: "oni", polishKey: "imperative_oni", transKey: "imperative_oni_trans" },
    ],
  },
  {
    key: "conditional_masculine",
    label: "Conditional (masculine)",
    rows: [
      { person: "ja", polishKey: "conditional_masculine_ja", transKey: "conditional_masculine_ja_trans" },
      { person: "ty", polishKey: "conditional_masculine_ty", transKey: "conditional_masculine_ty_trans" },
      { person: "on", polishKey: "conditional_masculine_on", transKey: "conditional_masculine_on_trans" },
      { person: "my", polishKey: "conditional_masculine_my", transKey: "conditional_masculine_my_trans" },
      { person: "wy", polishKey: "conditional_masculine_wy", transKey: "conditional_masculine_wy_trans" },
      { person: "oni", polishKey: "conditional_masculine_oni", transKey: "conditional_masculine_oni_trans" },
    ],
  },
  {
    key: "conditional_feminine",
    label: "Conditional (feminine)",
    rows: [
      { person: "ja", polishKey: "conditional_feminine_ja", transKey: "conditional_feminine_ja_trans" },
      { person: "ty", polishKey: "conditional_feminine_ty", transKey: "conditional_feminine_ty_trans" },
      { person: "ona", polishKey: "conditional_feminine_ona", transKey: "conditional_feminine_ona_trans" },
      { person: "my", polishKey: "conditional_feminine_my", transKey: "conditional_feminine_my_trans" },
      { person: "wy", polishKey: "conditional_feminine_wy", transKey: "conditional_feminine_wy_trans" },
      { person: "one", polishKey: "conditional_feminine_one", transKey: "conditional_feminine_one_trans" },
    ],
  },
];
