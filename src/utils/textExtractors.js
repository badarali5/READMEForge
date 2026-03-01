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
    .map(normaliseSentence)
    .filter(s => s.length >= 12 && s.length <= 260);
}

function containsCue(sentence, cues) {
  const lower = sentence.toLowerCase();
  return cues.some(c => lower.includes(c));
}

function normaliseSentence(sentence) {
  return sentence
    .replace(/^[-•*]\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureSentence(s) {
  if (!s) return null;
  const out = s.trim();
  if (!out) return null;
  return /[.!?]$/.test(out) ? out : `${out}.`;
}

function isNoisySentence(sentence) {
  const lower = sentence.toLowerCase();
  return (
    /https?:\/\//i.test(sentence) ||
    /\b\w+\.\w{2,}(?:\/\S*)?\b/.test(sentence) ||
    /\b\d[\d,]*\+?\s*(users?|downloads?|stars?|sessions?|views?|visits?)\b/i.test(sentence) ||
    lower.startsWith("visit ") ||
    lower.startsWith("check it out")
  );
}

function scoreOverviewSentence(sentence) {
  const lower = sentence.toLowerCase();
  let score = 0;

  if (isNoisySentence(sentence)) score -= 4;
  if (containsCue(lower, ["problem", "pain point", "struggle", "cannot", "can't", "solves", "fixes", "addresses"])) score -= 3;
  if (containsCue(lower, ["has ", "includes", "features", "supports", "provides", "allows", "built with", "uses "])) score -= 1;
  if (containsCue(lower, ["app", "tool", "platform", "project", "for "])) score += 3;
  if (sentence.length >= 30 && sentence.length <= 170) score += 2;

  return score;
}

function scoreProblemSentence(sentence) {
  const lower = sentence.toLowerCase();
  let score = 0;

  if (containsCue(lower, ["problem", "pain point", "struggle", "cannot", "can't", "unable", "difficulty", "lack of", "missing", "miss "])) score += 5;
  if (containsCue(lower, ["solves", "addresses", "fixes", "tackles"])) score += 4;
  if (isNoisySentence(sentence)) score -= 2;
  if (containsCue(lower, ["has ", "includes", "features", "built with", "uses "])) score -= 1;

  return score;
}

function scoreSolutionSentence(sentence) {
  const lower = sentence.toLowerCase();
  let score = 0;

  if (containsCue(lower, ["has ", "includes", "features", "supports", "provides", "allows", "enables"])) score += 6;
  if (containsCue(lower, ["built with", "uses "])) score += 3;
  if (containsCue(lower, ["solves", "addresses", "fixes", "tackles"])) score += 1;
  if (containsCue(lower, ["frontend", "backend", "database", "api", "architecture"])) score -= 1;
  if (isNoisySentence(sentence)) score -= 3;
  if (containsCue(lower, ["problem", "pain point", "struggle", "cannot", "can't"])) score -= 2;

  return score;
}

function pickBestSentence(sentences, scorer, minScore = 1) {
  let best = null;
  let bestScore = -Infinity;

  for (const s of sentences) {
    const score = scorer(s);
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }

  if (bestScore < minScore) return null;
  return best;
}

export function extractOverview(text, rawTitle) {
  const sentences = splitSentences(text);
  const picked = pickBestSentence(sentences, scoreOverviewSentence, 1);

  if (picked) {
    const clean = picked.replace(/^\s*(this|it)\s+(is|does)\s+/i, "").trim();
    return ensureSentence(clean);
  }

  if (rawTitle) return `${rawTitle} is designed to solve a focused real-world problem for its target users.`;
  return null;
}

export function extractProblemStatement(text) {
  const sentences = splitSentences(text);
  const picked = pickBestSentence(sentences, scoreProblemSentence, 2);

  if (picked) {
    const m = picked.match(/(?:solves?|addresses?|fixes?|tackles?)\s+(?:the\s+)?(?:problem\s*(?:of|that)?\s*)?(.+)/i);
    if (m && m[1]) {
      const tail = m[1].replace(/^\s*(where|of|that)\s+/i, "").trim();
      if (tail.length > 8) return ensureSentence(tail.charAt(0).toUpperCase() + tail.slice(1));
    }
    return ensureSentence(picked);
  }

  return extractProblem(text);
}

export function extractSolution(text, rawTitle, features = []) {
  const sentences = splitSentences(text);
  const picked = pickBestSentence(sentences, scoreSolutionSentence, 2);

  if (picked) {
    const cleaned = picked
      .replace(/^(this|it)\s+/i, "")
      .replace(/^(we|our\s+project)\s+/i, "")
      .trim();
    return ensureSentence(cleaned);
  }

  if (features.length > 0) {
    const top = features
      .filter(f => !isNoisySentence(f))
      .slice(0, 4)
      .map(f => toTitleCase(f.replace(/[.!?]$/, "")));

    if (top.length > 0) {
      return `${rawTitle} solves this through ${top.join(", ")}${features.length > 4 ? ", and additional capabilities" : ""}.`;
    }
  }

  return `${rawTitle} provides a focused workflow that reduces friction and helps users complete key tasks efficiently.`;
}
