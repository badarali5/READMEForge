// ── Tech stack detection (no invention — TBD if missing) ──────────────────

export const TECH_PATTERNS = [
  // Frontend
  { regex: /\breact\b/i, label: "React", category: "Frontend" },
  { regex: /\bnext\.?js\b/i, label: "Next.js", category: "Frontend" },
  { regex: /\bvue\b/i, label: "Vue.js", category: "Frontend" },
  { regex: /\bangular\b/i, label: "Angular", category: "Frontend" },
  { regex: /\bsvelte\b/i, label: "Svelte", category: "Frontend" },
  { regex: /\btailwind\b/i, label: "Tailwind CSS", category: "Frontend" },
  { regex: /\bbootstrap\b/i, label: "Bootstrap", category: "Frontend" },
  { regex: /\btypescript\b/i, label: "TypeScript", category: "Language" },
  { regex: /\bjavascript\b/i, label: "JavaScript", category: "Language" },
  // Backend
  { regex: /\bnode\.?js?\b/i, label: "Node.js", category: "Backend" },
  { regex: /\bexpress\b/i, label: "Express.js", category: "Backend" },
  { regex: /\bspring\s?boot\b/i, label: "Spring Boot", category: "Backend" },
  { regex: /\bdjango\b/i, label: "Django", category: "Backend" },
  { regex: /\bflask\b/i, label: "Flask", category: "Backend" },
  { regex: /\bfastapi\b/i, label: "FastAPI", category: "Backend" },
  { regex: /\brails\b/i, label: "Ruby on Rails", category: "Backend" },
  { regex: /\blaravel\b/i, label: "Laravel", category: "Backend" },
  // DB
  { regex: /\bpostgres\b/i, label: "PostgreSQL", category: "Database" },
  { regex: /\bmysql\b/i, label: "MySQL", category: "Database" },
  { regex: /\bmongodb\b/i, label: "MongoDB", category: "Database" },
  { regex: /\bredis\b/i, label: "Redis", category: "Database" },
  { regex: /\bsqlite\b/i, label: "SQLite", category: "Database" },
  { regex: /\bsupabase\b/i, label: "Supabase", category: "Database" },
  { regex: /\bfirebase\b/i, label: "Firebase", category: "Backend / Database" },
  // Cloud / DevOps
  { regex: /\baws\b/i, label: "AWS", category: "Cloud" },
  { regex: /\bvercel\b/i, label: "Vercel", category: "Deployment" },
  { regex: /\bnetlify\b/i, label: "Netlify", category: "Deployment" },
  { regex: /\bdocker\b/i, label: "Docker", category: "DevOps" },
  { regex: /\bkubernetes\b/i, label: "Kubernetes", category: "DevOps" },
  // AI / ML
  { regex: /\bopenai\b/i, label: "OpenAI API", category: "AI" },
  { regex: /\bgpt[-\s]?[34o]?\b/i, label: "GPT", category: "AI" },
  { regex: /\bclaude\b/i, label: "Claude API", category: "AI" },
  { regex: /\btensorflow\b/i, label: "TensorFlow", category: "AI/ML" },
  { regex: /\bpytorch\b/i, label: "PyTorch", category: "AI/ML" },
  // Languages
  { regex: /\bpython\b/i, label: "Python", category: "Language" },
  { regex: /\bjava\b/i, label: "Java", category: "Language" },
  { regex: /\bgo\b|\bgolang\b/i, label: "Go", category: "Language" },
  { regex: /\brust\b/i, label: "Rust", category: "Language" },
];

// Constraint 2b — do NOT invent defaults. Return empty array if nothing found.
export function detectTechStack(text) {
  const found = new Map();
  for (const pattern of TECH_PATTERNS) {
    if (pattern.regex.test(text)) {
      if (!found.has(pattern.label)) found.set(pattern.label, pattern.category);
    }
  }
  return Array.from(found.entries()).map(([label, category]) => ({ label, category }));
}
