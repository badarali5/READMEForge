// ── Constraint 4 & New: Vague / too-short idea detector + feature expander ─
// "Too short" = raw input is < 10 words (spec-exact threshold).
// "Vague"     = >= 10 words but < 2 concrete features extracted.
// Both trigger conservative expansion. Too-short inputs also set
// isProposed = true which labels the section "Proposed Features" and
// marks each inferred item as _(inferred)_ in the README.

export const WORD_COUNT_THRESHOLD = 10; // spec: < 10 words → too short

export const VAGUE_KEYWORDS = [
  /\bapp\b/i, /\btool\b/i, /\bplatform\b/i, /\bwebsite\b/i, /\bsystem\b/i,
];

export const VAGUE_FEATURE_SEEDS = {
  default: [
    "User authentication and secure session management",
    "Responsive, mobile-first user interface",
    "RESTful API with structured JSON responses",
    "Search and filtering capabilities",
  ],
  ai: [
    "AI-powered recommendation or classification engine",
    "Natural language input processing",
    "Model inference with confidence scoring",
    "Feedback loop for continuous model improvement",
  ],
  ecommerce: [
    "Product catalogue with category filtering",
    "Shopping cart and checkout flow",
    "Order history and status tracking",
    "Payment gateway integration",
  ],
  social: [
    "User profiles and follow / friend system",
    "Post creation with rich-text support",
    "Notification feed and activity log",
    "Privacy controls and content moderation",
  ],
};

// Returns { needsExpansion, isProposed }
// isProposed = true when input is below the 10-word threshold —
// expanded features are labelled "Proposed" to signal they are inferred.
export function classifyInput(text, features) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const tooShort = wordCount < WORD_COUNT_THRESHOLD;
  const vague = features.length < 2 && (tooShort || VAGUE_KEYWORDS.every(k => k.test(text)));
  return {
    needsExpansion: tooShort || vague,
    isProposed: tooShort, // only label as proposed when truly too short
    wordCount,
  };
}

// Preserved for backward compat with diagnostic call in component
export function isVague(text, features) {
  return classifyInput(text, features).needsExpansion;
}

export function expandFeaturesConservatively(text, existing) {
  const lower = text.toLowerCase();
  let seed = VAGUE_FEATURE_SEEDS.default;
  if (/\b(ai|ml|gpt|model|predict|classif|detect|recommend)\b/i.test(lower)) seed = VAGUE_FEATURE_SEEDS.ai;
  else if (/\b(shop|store|cart|product|checkout|payment|ecomm)\b/i.test(lower)) seed = VAGUE_FEATURE_SEEDS.ecommerce;
  else if (/\b(social|post|feed|follow|friend|community|comment)\b/i.test(lower)) seed = VAGUE_FEATURE_SEEDS.social;

  const combined = [...existing];
  for (const s of seed) {
    if (combined.length >= 6) break;
    if (!existing.some(e => e.toLowerCase().includes(s.split(" ")[0].toLowerCase()))) {
      combined.push(s);
    }
  }
  return combined;
}
