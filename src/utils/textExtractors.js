// ── Text extraction helpers ────────────────────────────────────────────────

export function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
}

export function extractFeatures(text) {
  const features = [];
  const hasMatch = text.match(/(?:has|includes?|features?|with|supports?)[:\s]+([^.!?\n]+)/gi);
  if (hasMatch) {
    for (const m of hasMatch) {
      const items = m.replace(/^[^:,]+[:\s]+/i, "").split(/,|and\b/).map(s => s.trim()).filter(s => s.length > 2);
      features.push(...items);
    }
  }
  const bullets = text.match(/[-•*]\s+([^\n]+)/g);
  if (bullets) features.push(...bullets.map(b => b.replace(/^[-•*]\s+/, "").trim()));

  const seen = new Set();
  return features
    .filter(f => f.length > 3 && f.length < 120)
    .filter(f => { const k = f.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, 10);
}

export function extractTitle(text) {
  const first = text.split(/[.\n]/)[0].trim();
  if (first.length < 80) return toTitleCase(first.replace(/^(a |an |the )/i, ""));
  return toTitleCase(text.split(/\s+/).slice(0, 5).join(" "));
}

export function extractProblem(text) {
  const patterns = [
    /(?:solves?|addresses?|fixes?|tackles?|problem\s*(?:of|is|:)?)[:\s]+([^.!?\n]+[.!?]?)/i,
    /(?:students?|users?|people|developers?)\s+(?:miss|struggle|can'?t|don'?t|fail)[^.!?\n]+[.!?]?/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0].trim();
  }
  return null;
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => s.length > 8);
}

function startsWithCue(sentence, cues) {
  const lower = sentence.toLowerCase();
  return cues.some(c => lower.includes(c));
}

function normaliseSentence(sentence) {
  return sentence
    .replace(/^[-•*]\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractOverview(text, rawTitle) {
  const sentences = splitSentences(text).map(normaliseSentence);
  const ignoreCues = [
    "solves",
    "problem",
    "pain point",
    "struggle",
    "cannot",
    "can't",
    "fixes",
    "addresses",
    "visit ",
    "check it out",
  ];

  const overviewCandidates = sentences.filter(s => !startsWithCue(s, ignoreCues));
  const chosen = overviewCandidates[0] || sentences[0] || "";
  if (!chosen) return null;

  const clean = chosen.replace(/^\s*(this|it)\s+(is|does)\s+/i, "").trim();
  if (!clean) return null;

  if (rawTitle && clean.toLowerCase().startsWith(rawTitle.toLowerCase())) {
    return clean.endsWith(".") ? clean : `${clean}.`;
  }
  return clean.endsWith(".") ? clean : `${clean}.`;
}

export function extractProblemStatement(text) {
  const sentences = splitSentences(text).map(normaliseSentence);

  const strongProblem = sentences.find(s =>
    startsWithCue(s.toLowerCase(), [
      "problem",
      "pain point",
      "users struggle",
      "users miss",
      "users can't",
      "users cannot",
      "students miss",
      "developers struggle",
      "lack of",
    ])
  );
  if (strongProblem) return strongProblem.endsWith(".") ? strongProblem : `${strongProblem}.`;

  const solveStyle = sentences.find(s =>
    startsWithCue(s.toLowerCase(), ["solves", "addresses", "fixes", "tackles"])
  );
  if (solveStyle) return solveStyle.endsWith(".") ? solveStyle : `${solveStyle}.`;

  return extractProblem(text);
}

export function extractSolution(text, rawTitle, features = []) {
  const sentences = splitSentences(text).map(normaliseSentence);
  const solutionCues = [
    "has ",
    "includes",
    "features",
    "supports",
    "built with",
    "uses ",
    "provides",
    "allows",
  ];

  const solutionSentence = sentences.find(s => startsWithCue(s.toLowerCase(), solutionCues));
  if (solutionSentence) {
    return solutionSentence.endsWith(".") ? solutionSentence : `${solutionSentence}.`;
  }

  if (features.length > 0) {
    const top = features.slice(0, 3).map(f => toTitleCase(f.replace(/[.!?]$/, "")));
    return `${rawTitle} delivers core functionality through ${top.join(", ")}${features.length > 3 ? ", and more" : ""}.`;
  }

  return `${rawTitle} provides a structured workflow that helps users complete key tasks with less friction.`;
}
