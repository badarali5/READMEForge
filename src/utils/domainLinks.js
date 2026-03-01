// ── Constraint 2: Domain-text → Markdown links ────────────────────────────
// Spec requirement: convert "something.vercel.app" and "something.com" (and
// similar bare domains) to [text](https://text). Two-pass approach:
//   Pass 1 — protect existing markdown links and full https:// URLs
//   Pass 2 — convert bare domains; vercel.app gets explicit priority match

// Explicitly listed TLDs — .vercel.app subdomain handled as a special case
const VERCEL_APP_RE = /(?<![(\[])(?:https?:\/\/)?([a-zA-Z0-9-]+\.vercel\.app(?:\/[^\s.,!?)'"]*)?)/g;
const NETLIFY_APP_RE = /(?<![(\[])(?:https?:\/\/)?([a-zA-Z0-9-]+\.netlify\.app(?:\/[^\s.,!?)'"]*)?)/g;
const BARE_DOMAIN_RE = /(?<![(\[/])([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:com|io|org|net|dev|app|co|ai|sh|xyz|me|info|tech|ly|gg|edu|gov|mil|int|uk|us|ca|au|de|fr|jp|in|br|nl|se|no|dk|fi|pt|es|be|at|ch|pl|ru|cn|sg|nz|za|mx|ar|il|kr|id|my|ph|th|vn|ng|ke|eg|ae|sa|pk|bd|lk|np)(?:\/[^\s.,!?)'"]*)?)/g;

export function convertDomainsToLinks(text) {
  const slots = [];

  // Step 1 — protect already-formed markdown links [text](url)
  let out = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, m => {
    const id = `\x00SLOT${slots.length}\x00`;
    slots.push(m);
    return id;
  });

  // Step 2 — protect raw https?:// URLs, wrapping them as markdown links
  out = out.replace(/https?:\/\/[^\s.,!?)"']+/g, m => {
    const id = `\x00SLOT${slots.length}\x00`;
    slots.push(`[${m}](${m})`);
    return id;
  });

  // Step 3a — convert *.vercel.app domains (spec priority)
  out = out.replace(VERCEL_APP_RE, m => {
    const clean = m.replace(/^https?:\/\//, "");
    const id = `\x00SLOT${slots.length}\x00`;
    slots.push(`[${clean}](https://${clean})`);
    return id;
  });

  // Step 3b — convert *.netlify.app domains
  out = out.replace(NETLIFY_APP_RE, m => {
    const clean = m.replace(/^https?:\/\//, "");
    const id = `\x00SLOT${slots.length}\x00`;
    slots.push(`[${clean}](https://${clean})`);
    return id;
  });

  // Step 3c — convert remaining bare domains (including .com as spec states)
  out = out.replace(BARE_DOMAIN_RE, m => {
    const id = `\x00SLOT${slots.length}\x00`;
    slots.push(`[${m}](https://${m})`);
    return id;
  });

  // Step 4 — restore all slots
  slots.forEach((val, i) => { out = out.replace(`\x00SLOT${i}\x00`, val); });
  return out;
}
