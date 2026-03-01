// ─────────────────────────────────────────────
// LIVE MARKDOWN RENDERER (no external dep)
// ─────────────────────────────────────────────

export function renderMarkdown(md) {
  let html = md
    // Escape HTML
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="md-pre"><code class="md-code">${code.trim()}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
    // HR
    .replace(/^---$/gm, '<hr class="md-hr" />')
    // H1
    .replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>')
    // Tables
    .replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/g, (_, header, rows) => {
      const ths = header.split("|").filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join("");
      const trs = rows.trim().split("\n").map(row => {
        const tds = row.split("|").filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join("");
        return `<tr>${tds}</tr>`;
      }).join("");
      return `<table class="md-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    })
    // Checkboxes
    .replace(/^- \[ \] (.+)$/gm, '<li class="md-todo">☐ $1</li>')
    .replace(/^- \[x\] (.+)$/gm, '<li class="md-todo done">☑ $1</li>')
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li class="md-li">$1</li>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="md-link" href="$2" target="_blank">$1</a>')
    // Images (badges)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img class="md-badge" src="$2" alt="$1" />')
    // Paragraphs (blank line separated)
    .replace(/\n\n([^<\n][^\n]+)/g, '\n\n<p class="md-p">$1</p>')
    // Center alignment
    .replace(/<p class="md-p"><p align="center">(.+?)<\/p><\/p>/g, '<p class="md-center">$1</p>');

  return html;
}
