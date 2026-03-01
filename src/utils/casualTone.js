// ── Constraint 1: Casual phrase sanitiser ──────────────────────────────────
// Strip or replace informal/filler language before any further processing.

export const CASUAL_REPLACEMENTS = [
  [/\bidk\b/gi, ""],
  [/\bkinda\b/gi, "somewhat"],
  [/\bkinda\s+like\b/gi, "similar to"],
  [/\bpretty\s+much\b/gi, "essentially"],
  [/\bstuff\b/gi, "functionality"],
  [/\bthings?\b/gi, "features"],
  [/\bbasically\b/gi, ""],
  [/\bjust\s+like\b/gi, "similar to"],
  [/\blol\b/gi, ""],
  [/\btbh\b/gi, ""],
  [/\bngl\b/gi, ""],
  [/\bomg\b/gi, ""],
  [/\bwtf\b/gi, ""],
  [/\bidk\s+if\b/gi, "it is uncertain whether"],
  [/\bobviously\b/gi, "notably"],
  [/\blike,?\s+/gi, ""],
  [/\byeah[,.]?\s*/gi, ""],
  [/\bso\s+basically\b/gi, ""],
  [/\b(it'?s?\s+)?kinda\b/gi, ""],
  [/\bwanna\b/gi, "want to"],
  [/\bgonna\b/gi, "going to"],
  [/\bgotta\b/gi, "need to"],
  [/\bdunno\b/gi, "unclear"],
  [/\bsuper\s+easy\b/gi, "straightforward"],
  [/\bsuper\b/gi, "highly"],
  [/\bcool\b/gi, "effective"],
  [/\bawesome\b/gi, "robust"],
  [/\bamazing\b/gi, "powerful"],
  [/\bcrazy\b/gi, "significant"],
  [/\bstuff\s+like\b/gi, "features such as"],
  // Clean up multiple spaces / leading spaces after removals
  [/[ \t]{2,}/g, " "],
  [/\s+([.,!?])/g, "$1"],
];

export function sanitiseCasualTone(text) {
  let out = text;
  for (const [pattern, replacement] of CASUAL_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out.trim();
}
