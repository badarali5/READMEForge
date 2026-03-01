// ── Constraint 3: Social proof extractor ──────────────────────────────────
// Primary regex is spec-exact: \d+\+?\s*(users|downloads|stars)
// Extended regex catches broader figures — both run, deduped.
// Each match yields a { boldLine } ready for direct README injection.

import { toTitleCase } from "./textExtractors.js";

export const SOCIAL_PROOF_PRIMARY_RE = /(\d[\d,]*\+?)\s*(users?|downloads?|stars?)/gi;
export const SOCIAL_PROOF_EXTENDED_RE = /(\$?[\d,]+(?:\.\d+)?[kKmMbB%]?\+?)\s*(installs?|sign[- ]?ups?|customers?|clients?|MRR|ARR|uptime|requests?|transactions?|contributors?|forks?|views?|visits?|sessions?|ratings?|reviews?)/gi;

export function extractSocialProof(text) {
  const matches = [];
  const seen = new Set();

  function collect(re) {
    let m;
    const r = new RegExp(re.source, re.flags);
    while ((m = r.exec(text)) !== null) {
      const key = m[0].toLowerCase().replace(/\s+/g, "");
      if (seen.has(key)) continue;
      seen.add(key);
      const figure = m[1];
      const label = m[2];
      const boldLine = "**" + figure + " " + toTitleCase(label) + "** — and growing.";
      matches.push({ figure, label, full: m[0], boldLine });
    }
  }

  collect(SOCIAL_PROOF_PRIMARY_RE);   // spec-exact first
  collect(SOCIAL_PROOF_EXTENDED_RE);  // extended second (no duplicates)
  return matches;
}
