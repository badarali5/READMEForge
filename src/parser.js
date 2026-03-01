// ── Master parser ─────────────────────────────────────────────────────────

import { sanitiseCasualTone } from "./utils/casualTone.js";
import { detectTechStack } from "./utils/techStack.js";
import { extractFeatures, extractTitle, extractProblem } from "./utils/textExtractors.js";
import { classifyInput, expandFeaturesConservatively } from "./utils/featureExpander.js";
import { extractSocialProof } from "./utils/socialProof.js";
import { convertDomainsToLinks } from "./utils/domainLinks.js";

export function parseProjectIdea(text, mode) {
  // Step 1 — sanitise casual/informal tone
  const clean = sanitiseCasualTone(text);

  // Step 2 — detect tech (never invent)
  const tech = detectTechStack(clean);
  const techMissing = tech.length === 0;

  // Step 3 — classify input length/vagueness, then extract + optionally expand
  let features = extractFeatures(clean);
  const { needsExpansion, isProposed, wordCount } = classifyInput(clean, features);
  if (needsExpansion) {
    features = expandFeaturesConservatively(clean, features);
  }

  // Step 4 — title, problem
  const rawTitle = extractTitle(clean);
  const problem = extractProblem(clean);

  // Step 5 — social proof (spec-exact + extended)
  const socialProof = extractSocialProof(clean);

  // Step 6 — convert bare domains / vercel.app / .com to markdown links
  const processedText = convertDomainsToLinks(clean);

  return {
    rawTitle,
    processedText,
    tech,
    techMissing,
    features,
    isProposed,   // true when input < 10 words → label section "Proposed Features"
    wordCount,
    problem,
    socialProof,
    mode,
  };
}
