import { useState, useCallback, useRef } from "react";
import { parseProjectIdea } from "./parser.js";
import { generateMarkdown } from "./markdownGenerator.js";
import { renderMarkdown } from "./markdownRenderer.js";
import { sanitiseCasualTone, CASUAL_REPLACEMENTS } from "./utils/casualTone.js";
import { extractFeatures } from "./utils/textExtractors.js";

// ─────────────────────────────────────────────
// EXAMPLE INPUTS
// ─────────────────────────────────────────────

const EXAMPLE_INPUT = `AI-powered job finder for students. Uses React frontend, Spring Boot backend with PostgreSQL database. Solves problem of students missing internships because they don't know where to look. Has search, filters, resume upload, saved jobs, and email alerts. Built with TypeScript. Planning to add AI resume scoring and company match percentage. Already have 1800+ users and 340+ active weekly sessions. Check it out at studentjobhub.io or github.com/user/studentjobhub. idk if we should add dark mode lol, kinda thinking yeah.`;

// Vague but >= 10 words — triggers expansion but NOT "Proposed" label
const EXAMPLE_INPUT_VAGUE = `Social media platform for pets. Users can post pics of their animals and follow other pet owners.`;

// < 10 words — triggers "Proposed Features" label (spec rule)
const EXAMPLE_INPUT_SHORT = `Recipe sharing app for home cooks.`;

const EXAMPLE_INPUT_NO_TECH = `A tool that helps freelancers track their invoices and client payments. Solves the problem of losing track of who owes you money. Has dashboard, reminders, PDF export. Visit freelanceinvoicer.vercel.app for a live demo. No tech stack decided yet.`;

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────

export default function READMEForge() {
  const [input, setInput] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [mode, setMode] = useState("student");
  const [dark, setDark] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("preview"); // preview | raw
  const previewRef = useRef(null);

  const [diagnostics, setDiagnostics] = useState(null);

  const generate = useCallback(async () => {
    if (!input.trim()) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 600));
    const parsed = parseProjectIdea(input, mode);
    const md = generateMarkdown(parsed);
    setMarkdown(md);
    // Compute diagnostics for UI pills
    const cleanedForDiag = sanitiseCasualTone(input);
    const rawFeats = extractFeatures(cleanedForDiag);
    setDiagnostics({
      techMissing: parsed.techMissing,
      socialProof: parsed.socialProof,
      featureCount: parsed.features.length,
      wasExpanded: parsed.features.length > rawFeats.length,
      isProposed: parsed.isProposed,
      wordCount: parsed.wordCount,
      toneFixed: CASUAL_REPLACEMENTS.some(([p]) => new RegExp(p.source, p.flags).test(input)),
    });
    setGenerating(false);
  }, [input, mode]);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReadme = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadExample = (which) => {
    if (which === "vague")  setInput(EXAMPLE_INPUT_VAGUE);
    else if (which === "short")  setInput(EXAMPLE_INPUT_SHORT);
    else if (which === "notech") setInput(EXAMPLE_INPUT_NO_TECH);
    else setInput(EXAMPLE_INPUT);
  };

  const d = dark;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body { font-family: 'Syne', sans-serif; }

    .app {
      min-height: 100vh;
      background: ${d ? "#0c0c10" : "#f5f5f2"};
      color: ${d ? "#e8e6e3" : "#1a1a1a"};
      transition: background 0.3s, color 0.3s;
      display: flex;
      flex-direction: column;
    }

    /* ── Header ── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 32px;
      border-bottom: 1px solid ${d ? "#1e1e28" : "#e0e0d8"};
      background: ${d ? "#0c0c10" : "#f5f5f2"};
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-mark {
      width: 36px; height: 36px;
      background: #e8b84b;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Space Mono', monospace;
      font-weight: 700;
      font-size: 14px;
      color: #0c0c10;
      letter-spacing: -1px;
    }
    .logo-text {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: -0.5px;
    }
    .logo-text span { color: #e8b84b; }
    .header-right { display: flex; align-items: center; gap: 12px; }

    /* ── Buttons ── */
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-family: 'Space Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      transition: all 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-ghost {
      background: transparent;
      color: ${d ? "#888" : "#666"};
      border: 1px solid ${d ? "#2a2a36" : "#ccc"};
    }
    .btn-ghost:hover {
      background: ${d ? "#1a1a24" : "#ebebeb"};
      color: ${d ? "#e8e6e3" : "#1a1a1a"};
    }
    .btn-primary {
      background: #e8b84b;
      color: #0c0c10;
    }
    .btn-primary:hover { background: #f0c858; transform: translateY(-1px); }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn-success {
      background: #2a9d5c;
      color: white;
    }
    .btn-sm { padding: 6px 12px; font-size: 11px; }
    .btn-icon {
      padding: 8px;
      aspect-ratio: 1;
      border-radius: 8px;
      background: transparent;
      border: 1px solid ${d ? "#2a2a36" : "#ccc"};
      cursor: pointer;
      color: ${d ? "#888" : "#666"};
      transition: all 0.15s;
      font-size: 16px;
    }
    .btn-icon:hover { background: ${d ? "#1a1a24" : "#ebebeb"}; color: ${d ? "#e8e6e3" : "#1a1a1a"}; }

    /* ── Main layout ── */
    .main {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      flex: 1;
      min-height: 0;
    }

    /* ── Panels ── */
    .panel {
      display: flex;
      flex-direction: column;
      min-height: 0;
      height: calc(100vh - 69px);
      position: sticky;
      top: 69px;
    }
    .panel-left {
      border-right: 1px solid ${d ? "#1e1e28" : "#e0e0d8"};
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 1px solid ${d ? "#1e1e28" : "#e0e0d8"};
      background: ${d ? "#0e0e14" : "#f0f0ec"};
      flex-shrink: 0;
    }
    .panel-title {
      font-size: 11px;
      font-family: 'Space Mono', monospace;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: ${d ? "#666" : "#888"};
    }

    /* ── Textarea ── */
    .textarea-wrap {
      flex: 1;
      min-height: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    textarea {
      flex: 1;
      background: ${d ? "#0e0e14" : "#fafaf8"};
      color: ${d ? "#e8e6e3" : "#1a1a1a"};
      border: 1.5px solid ${d ? "#1e1e28" : "#e0e0d8"};
      border-radius: 10px;
      padding: 16px;
      font-family: 'Space Mono', monospace;
      font-size: 13px;
      line-height: 1.7;
      resize: none;
      outline: none;
      transition: border-color 0.2s;
      min-height: 200px;
    }
    textarea:focus { border-color: #e8b84b; }
    textarea::placeholder { color: ${d ? "#444" : "#bbb"}; }

    /* ── Mode selector ── */
    .mode-selector {
      display: flex;
      gap: 6px;
    }
    .mode-btn {
      padding: 6px 12px;
      border-radius: 20px;
      border: 1.5px solid ${d ? "#2a2a36" : "#ddd"};
      background: transparent;
      color: ${d ? "#888" : "#888"};
      cursor: pointer;
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.3px;
      transition: all 0.15s;
    }
    .mode-btn:hover {
      border-color: #e8b84b;
      color: #e8b84b;
    }
    .mode-btn.active {
      background: #e8b84b;
      border-color: #e8b84b;
      color: #0c0c10;
    }

    /* ── Generate area ── */
    .generate-area {
      padding: 16px 20px;
      border-top: 1px solid ${d ? "#1e1e28" : "#e0e0d8"};
      display: flex;
      align-items: center;
      gap: 10px;
      background: ${d ? "#0e0e14" : "#f0f0ec"};
      flex-shrink: 0;
    }
    .char-count {
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      color: ${d ? "#555" : "#aaa"};
      margin-left: auto;
    }

    /* ── Preview panel ── */
    .preview-tabs {
      display: flex;
      gap: 0;
    }
    .preview-tab {
      padding: 7px 14px;
      border-radius: 6px;
      border: 1px solid ${d ? "#2a2a36" : "#ddd"};
      background: transparent;
      color: ${d ? "#666" : "#888"};
      cursor: pointer;
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      transition: all 0.15s;
    }
    .preview-tab.active {
      background: ${d ? "#1a1a24" : "#e8e8e4"};
      color: ${d ? "#e8e6e3" : "#1a1a1a"};
      border-color: ${d ? "#333" : "#ccc"};
    }
    .preview-tab:first-child { border-radius: 6px 0 0 6px; }
    .preview-tab:last-child { border-radius: 0 6px 6px 0; border-left: none; }

    .preview-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px 28px;
      background: ${d ? "#0c0c10" : "#ffffff"};
      scrollbar-width: thin;
      scrollbar-color: ${d ? "#2a2a36 transparent" : "#ccc transparent"};
    }

    .raw-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background: ${d ? "#0e0e14" : "#fafaf8"};
    }
    .raw-code {
      font-family: 'Space Mono', monospace;
      font-size: 12px;
      line-height: 1.8;
      color: ${d ? "#c8c6c0" : "#333"};
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* ── Empty state ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
      color: ${d ? "#444" : "#bbb"};
    }
    .empty-icon {
      font-size: 48px;
      opacity: 0.4;
    }
    .empty-title {
      font-weight: 700;
      font-size: 16px;
      color: ${d ? "#555" : "#aaa"};
    }
    .empty-sub {
      font-family: 'Space Mono', monospace;
      font-size: 12px;
      color: ${d ? "#444" : "#ccc"};
      text-align: center;
      max-width: 280px;
      line-height: 1.6;
    }

    /* ── Spinner ── */
    .spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid #0c0c10;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Markdown Styles ── */
    .md-h1 {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 2em;
      margin: 0 0 16px;
      color: ${d ? "#f0ede8" : "#111"};
      letter-spacing: -0.5px;
      border-bottom: 2px solid #e8b84b;
      padding-bottom: 10px;
    }
    .md-h2 {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 1.25em;
      margin: 28px 0 12px;
      color: ${d ? "#e8e6e3" : "#1a1a1a"};
    }
    .md-h3 {
      font-weight: 600;
      font-size: 1.1em;
      margin: 20px 0 8px;
      color: ${d ? "#ccc" : "#333"};
    }
    .md-p {
      font-size: 14px;
      line-height: 1.75;
      color: ${d ? "#b8b6b0" : "#444"};
      margin: 10px 0;
    }
    .md-hr {
      border: none;
      border-top: 1px solid ${d ? "#1e1e28" : "#e8e8e4"};
      margin: 24px 0;
    }
    .md-blockquote {
      border-left: 3px solid #e8b84b;
      padding: 6px 16px;
      margin: 14px 0;
      color: ${d ? "#999" : "#666"};
      font-style: italic;
      font-size: 14px;
      background: ${d ? "#0e0e14" : "#f8f8f4"};
      border-radius: 0 6px 6px 0;
    }
    .md-pre {
      background: ${d ? "#0a0a10" : "#f4f4f0"};
      border: 1px solid ${d ? "#1e1e28" : "#e0e0d8"};
      border-radius: 8px;
      padding: 16px;
      margin: 14px 0;
      overflow-x: auto;
    }
    .md-code {
      font-family: 'Space Mono', monospace;
      font-size: 12px;
      color: ${d ? "#88cc88" : "#2a6a2a"};
      line-height: 1.7;
    }
    .md-inline-code {
      font-family: 'Space Mono', monospace;
      font-size: 12px;
      background: ${d ? "#1a1a24" : "#f0f0e8"};
      color: ${d ? "#e8b84b" : "#c44"};
      padding: 2px 6px;
      border-radius: 4px;
    }
    .md-li {
      margin: 6px 0;
      padding-left: 20px;
      position: relative;
      font-size: 14px;
      color: ${d ? "#b8b6b0" : "#444"};
      list-style: none;
      line-height: 1.6;
    }
    .md-li::before {
      content: "▸";
      position: absolute;
      left: 4px;
      color: #e8b84b;
      font-size: 11px;
      top: 2px;
    }
    .md-todo {
      margin: 6px 0;
      padding-left: 24px;
      position: relative;
      font-size: 13px;
      color: ${d ? "#b8b6b0" : "#555"};
      list-style: none;
      font-family: 'Space Mono', monospace;
    }
    .md-todo.done { color: ${d ? "#555" : "#aaa"}; text-decoration: line-through; }
    .md-table {
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 13px;
      width: 100%;
    }
    .md-table th {
      background: ${d ? "#0e0e14" : "#f0f0ec"};
      padding: 8px 14px;
      text-align: left;
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.5px;
      border: 1px solid ${d ? "#1e1e28" : "#e0e0d8"};
      color: ${d ? "#888" : "#777"};
      text-transform: uppercase;
    }
    .md-table td {
      padding: 8px 14px;
      border: 1px solid ${d ? "#1e1e28" : "#e0e0d8"};
      color: ${d ? "#b8b6b0" : "#444"};
    }
    .md-link {
      color: #e8b84b;
      text-decoration: none;
    }
    .md-link:hover { text-decoration: underline; }
    .md-badge { vertical-align: middle; margin-right: 4px; }
    .md-center { text-align: center; color: ${d ? "#666" : "#aaa"}; font-size: 13px; margin-top: 20px; }

    /* ── Output actions ── */
    .output-actions {
      padding: 12px 20px;
      border-top: 1px solid ${d ? "#1e1e28" : "#e0e0d8"};
      display: flex;
      gap: 8px;
      background: ${d ? "#0e0e14" : "#f0f0ec"};
      flex-shrink: 0;
    }

    /* ── Generating overlay ── */
    .generating-overlay {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      flex-direction: column;
      gap: 16px;
    }
    .gen-spinner {
      width: 40px; height: 40px;
      border: 3px solid ${d ? "#1e1e28" : "#e0e0d8"};
      border-top-color: #e8b84b;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .gen-text {
      font-family: 'Space Mono', monospace;
      font-size: 12px;
      color: ${d ? "#666" : "#aaa"};
      letter-spacing: 1px;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .main { grid-template-columns: 1fr; }
      .panel { height: auto; position: relative; top: 0; }
      .panel-left { border-right: none; border-bottom: 1px solid ${d ? "#1e1e28" : "#e0e0d8"}; }
    }
  `;

  const pillStyle = (bg, color, dark) => ({
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontFamily: "'Space Mono', monospace",
    fontWeight: 700,
    letterSpacing: "0.3px",
    background: dark ? bg + "55" : bg + "22",
    color: dark ? color : bg,
    border: `1px solid ${dark ? color + "44" : bg + "66"}`,
    whiteSpace: "nowrap",
  });

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="logo">
            <div className="logo-mark">RF</div>
            <div className="logo-text">README<span>Forge</span></div>
          </div>
          <div className="header-right">
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: d ? "#555" : "#aaa", letterSpacing: "0.5px" }}>
              {d ? "◐ DARK" : "◑ LIGHT"}
            </span>
            <button className="btn-icon" onClick={() => setDark(!d)} title="Toggle theme">
              {d ? "☀" : "☾"}
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="main">
          {/* LEFT: Input */}
          <div className="panel panel-left">
            <div className="panel-header">
              <span className="panel-title">Project Input</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => loadExample("main")}>📋 Full Example</button>
                <button className="btn btn-ghost btn-sm" onClick={() => loadExample("vague")}>🌫 Vague Idea</button>
                <button className="btn btn-ghost btn-sm" onClick={() => loadExample("short")}>📏 Too Short</button>
                <button className="btn btn-ghost btn-sm" onClick={() => loadExample("notech")}>🔧 No Tech</button>
              </div>
            </div>

            <div className="textarea-wrap">
              {/* Mode selector */}
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: d ? "#555" : "#aaa", marginBottom: 8 }}>
                  Output Mode
                </div>
                <div className="mode-selector">
                  {[["student", "🎓 Student"], ["opensource", "🔓 Open Source"], ["saas", "🚀 SaaS"]].map(([val, label]) => (
                    <button
                      key={val}
                      className={`mode-btn ${mode === val ? "active" : ""}`}
                      onClick={() => setMode(val)}
                    >{label}</button>
                  ))}
                </div>
              </div>

              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Paste your raw project idea here...\n\nExample: "AI-powered job finder for students. Uses React + Spring Boot. Solves problem of missing internships. Has search, filters, resume upload."`}
                spellCheck={false}
              />
            </div>

            <div className="generate-area">
              <button
                className="btn btn-primary"
                onClick={generate}
                disabled={!input.trim() || generating}
              >
                {generating ? <><span className="spinner" /> Generating…</> : "⚡ Generate README"}
              </button>
              {input && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setInput(""); setMarkdown(""); setDiagnostics(null); }}>
                  Clear
                </button>
              )}
              <span className="char-count">{input.length} chars</span>
            </div>

            {/* Constraint diagnostics */}
            {diagnostics && (
              <div style={{
                padding: "10px 20px",
                borderTop: `1px solid ${d ? "#1e1e28" : "#e0e0d8"}`,
                background: d ? "#080810" : "#eeeee8",
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}>
                {diagnostics.toneFixed && (
                  <span style={pillStyle("#2a6a3a", "#88e0a0", d)}>✦ Tone rewritten</span>
                )}
                {diagnostics.techMissing && (
                  <span style={pillStyle("#6a3a1a", "#e0a860", d)}>⚠ Tech stack → TBD</span>
                )}
                {diagnostics.socialProof.length > 0 && (
                  <span style={pillStyle("#1a3a6a", "#60a8e0", d)}>📊 {diagnostics.socialProof.length} stat{diagnostics.socialProof.length > 1 ? "s" : ""} elevated</span>
                )}
                {diagnostics.isProposed && (
                  <span style={pillStyle("#6a1a1a", "#e06060", d)}>⚠ Short input → Proposed Features</span>
                )}
                {!diagnostics.isProposed && diagnostics.wasExpanded && (
                  <span style={pillStyle("#3a1a6a", "#b060e0", d)}>✦ Features expanded</span>
                )}
                <span style={pillStyle("#1a4a2a", "#60c080", d)}>✓ {diagnostics.featureCount} features · {diagnostics.wordCount}w input</span>
              </div>
            )}
          </div>

          {/* RIGHT: Preview */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">README Output</span>
              {markdown && (
                <div className="preview-tabs">
                  <button className={`preview-tab ${activeTab === "preview" ? "active" : ""}`} onClick={() => setActiveTab("preview")}>Preview</button>
                  <button className={`preview-tab ${activeTab === "raw" ? "active" : ""}`} onClick={() => setActiveTab("raw")}>Raw MD</button>
                </div>
              )}
            </div>

            {generating ? (
              <div className="generating-overlay" style={{ flex: 1, background: d ? "#0c0c10" : "#fff" }}>
                <div className="gen-spinner" />
                <div className="gen-text">FORGING README…</div>
              </div>
            ) : !markdown ? (
              <div className="preview-content">
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <div className="empty-title">No README yet</div>
                  <div className="empty-sub">Paste your project idea on the left and hit Generate README to forge a professional README in seconds.</div>
                </div>
              </div>
            ) : activeTab === "preview" ? (
              <div className="preview-content" ref={previewRef} dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }} />
            ) : (
              <div className="raw-content">
                <pre className="raw-code">{markdown}</pre>
              </div>
            )}

            {markdown && !generating && (
              <div className="output-actions">
                <button className={`btn btn-sm ${copied ? "btn-success" : "btn-ghost"}`} onClick={copyMarkdown}>
                  {copied ? "✓ Copied!" : "⎘ Copy Markdown"}
                </button>
                <button className="btn btn-primary btn-sm" onClick={downloadReadme}>
                  ↓ Download README.md
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
