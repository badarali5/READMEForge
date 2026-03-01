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
