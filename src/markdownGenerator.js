// ─────────────────────────────────────────────
// MARKDOWN GENERATION ENGINE
// ─────────────────────────────────────────────

import { toTitleCase } from "./utils/textExtractors.js";

export const MODE_META = {
  student: {
    licenseType: "MIT",
    contributingNote: "This is a student project. Contributions, suggestions, and feedback are welcome!",
    badge: "![Student Project](https://img.shields.io/badge/type-student_project-blue)",
    futureCount: 4,
  },
  opensource: {
    licenseType: "MIT",
    contributingNote: "Contributions are what make the open-source community thrive. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.",
    badge: "![Open Source](https://img.shields.io/badge/open_source-❤-red) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)",
    futureCount: 5,
  },
  saas: {
    licenseType: "Proprietary",
    contributingNote: "We're currently not accepting external contributions to the core product. For bug reports and feature requests, please open an issue.",
    badge: "![Status](https://img.shields.io/badge/status-active-success) ![License](https://img.shields.io/badge/license-Proprietary-red)",
    futureCount: 6,
  },
};

function generateInstallBlock(tech) {
  const hasNode = tech.some(t => ["Node.js", "Express.js", "React", "Next.js"].includes(t.label));
  const hasPython = tech.some(t => ["Python", "Django", "Flask", "FastAPI"].includes(t.label));
  const hasJava = tech.some(t => ["Java", "Spring Boot"].includes(t.label));
  const hasDocker = tech.some(t => t.label === "Docker");

  const lines = ["```bash", "# Clone the repository", "git clone https://github.com/yourusername/your-repo.git", "cd your-repo", ""];

  if (hasDocker) {
    lines.push("# Run with Docker", "docker-compose up --build", "```");
    return lines.join("\n");
  }

  if (hasNode) {
    lines.push("# Install dependencies", "npm install", "", "# Set up environment variables", "cp .env.example .env", "", "# Start the development server", "npm run dev");
  }
  if (hasPython) {
    lines.push("# Create virtual environment", "python -m venv venv", "source venv/bin/activate  # On Windows: venv\\Scripts\\activate", "", "# Install dependencies", "pip install -r requirements.txt", "", "# Run the application", "python main.py");
  }
  if (hasJava) {
    lines.push("# Build with Maven", "./mvnw clean install", "", "# Run the application", "./mvnw spring-boot:run");
  }
  if (!hasNode && !hasPython && !hasJava) {
    lines.push("# Install dependencies", "npm install", "", "# Start development server", "npm run dev");
  }

  lines.push("```");
  return lines.join("\n");
}

export function generateMarkdown(parsed) {
  const { rawTitle, tech, techMissing, features, isProposed, overview, problem, solution, socialProof, mode } = parsed;
  const meta = MODE_META[mode] || MODE_META.student;

  // ── Tech stack table: TBD rows if stack unknown ──────────────────────────
  let techTableRows;
  if (techMissing) {
    techTableRows =
      "| **Frontend** | TBD |\n| **Backend** | TBD |\n| **Database** | TBD |\n| **Deployment** | TBD |";
  } else {
    const techByCategory = {};
    for (const t of tech) {
      if (!techByCategory[t.category]) techByCategory[t.category] = [];
      techByCategory[t.category].push(t.label);
    }
    techTableRows = Object.entries(techByCategory)
      .map(([cat, items]) => `| **${cat}** | ${items.join(", ")} |`)
      .join("\n");
  }

  // ── Feature list ──────────────────────────────────────────────────────────
  // When isProposed is true (input < 10 words), the section heading becomes
  // "Proposed Features" and each expanded item is suffixed _(inferred)_ so
  // readers know which features were inferred rather than stated.
  const featureSectionTitle = isProposed ? "✨ Proposed Features" : "✨ Features";
  const featureInferredTag  = isProposed ? " _(inferred)_" : "";

  const featureList = features.length > 0
    ? features.map(f => `- ✅ **${toTitleCase(f.replace(/[.!?]$/, ""))}**${featureInferredTag}`).join("\n")
    : `- ✅ **Core Functionality** — Primary workflow for end users${featureInferredTag}\n- ✅ **Secure Access** — Authentication and authorization layer${featureInferredTag}\n- ✅ **Data Management** — Structured storage and retrieval${featureInferredTag}`;

  // ── Problem statement ─────────────────────────────────────────────────────
  const problemText = problem
    ? problem.charAt(0).toUpperCase() + problem.slice(1)
    : "Many users face significant inefficiencies when attempting to accomplish key tasks in this domain. Existing solutions are either too complex, too costly, or fail to adequately address the core need.";

  const overviewText = overview
    ? overview.charAt(0).toUpperCase() + overview.slice(1)
    : `**${rawTitle}** is a ${mode === "saas" ? "SaaS product" : mode === "opensource" ? "open-source tool" : "project"} built to address a clear, focused problem for its target users. The project prioritises reliability, ease of use, and a clean developer experience.${techMissing ? " *(Tech stack to be confirmed — contributions and suggestions welcome.)*" : ""}`;

  const solutionText = solution
    ? solution.charAt(0).toUpperCase() + solution.slice(1)
    : `**${rawTitle}** addresses this by providing a well-structured interface backed by a considered architecture. The goal is to reduce friction, shorten time-to-value, and deliver a polished experience without unnecessary complexity.`;

  // ── Tagline ───────────────────────────────────────────────────────────────
  const verb = rawTitle.toLowerCase().match(/\b(finder|tracker|manager|monitor|generator|builder|analyser|analyzer)\b/) ? "streamlining" : "powering";
  const tagline = `A focused, developer-friendly ${mode === "saas" ? "SaaS platform" : mode === "opensource" ? "open-source tool" : "project"} for ${verb} ${rawTitle.toLowerCase().replace(/\s*app\s*/i, "").trim()}.`;

  // ── Social proof block (if any figures detected) ──────────────────────────
  const socialProofSection = socialProof.length > 0
    ? `\n---\n\n## 📊 By the Numbers\n\n${socialProof.map(sp =>
        `> **${sp.figure} ${toTitleCase(sp.label)}** — and growing.`
      ).join("\n")}\n`
    : "";

  // ── Install block depends on known tech; generic if TBD ───────────────────
  const installBlock = techMissing
    ? "```bash\n# Clone the repository\ngit clone https://github.com/yourusername/your-repo.git\ncd your-repo\n\n# Follow the setup instructions in SETUP.md\n# (Tech stack TBD — instructions will be added once the stack is confirmed)\n```"
    : generateInstallBlock(tech);

  // ── Prerequisites ─────────────────────────────────────────────────────────
  const prereqs = techMissing
    ? "- Git\n- Refer to [SETUP.md](SETUP.md) once the tech stack is finalised"
    : [
        tech.some(t => ["Node.js", "React", "Next.js", "Express.js"].includes(t.label)) ? "- [Node.js](https://nodejs.org/) v18+" : "",
        tech.some(t => ["Python", "Django", "Flask", "FastAPI"].includes(t.label)) ? "- [Python](https://python.org/) 3.10+" : "",
        tech.some(t => ["Java", "Spring Boot"].includes(t.label)) ? "- [Java](https://java.com/) 17+ & Maven" : "",
        tech.some(t => t.label === "Docker") ? "- [Docker](https://docker.com/) & Docker Compose" : "",
        "- Git",
      ].filter(Boolean).join("\n");

  return `# ${rawTitle}

${meta.badge}

> ${tagline}

---

## 📖 Overview

${overviewText}
${socialProofSection}
---

## 🚩 Problem Statement

${problemText}

---

## 💡 Solution

${solutionText}

---

## ${featureSectionTitle}

${isProposed ? "> ⚠️ **Note:** The input provided was too brief to extract concrete features. The items below are conservatively inferred from the project domain and are labelled _(inferred)_. Please review and replace with your actual feature list.\n" : ""}${featureList}

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
${techTableRows}

${techMissing ? "> **Note:** The tech stack has not been specified and will be updated once confirmed. All layers are marked **TBD** to avoid assumptions.\n" : ""}
---

## 🚀 Getting Started

### Prerequisites

${prereqs}

### Installation

${installBlock}

---

## 📋 Usage

Once running, open your browser and navigate to \`http://localhost:3000\`.

\`\`\`bash
# Run tests
npm test

# Build for production
npm run build
\`\`\`

---

## 🔭 Future Improvements

${mode === "saas"
  ? "- [ ] Role-based access control (RBAC)\n- [ ] OAuth 2.0 / SSO integration\n- [ ] API rate limiting and usage analytics\n- [ ] Admin dashboard with real-time metrics\n- [ ] Webhook support for third-party integrations\n- [ ] Multi-tenant architecture"
  : mode === "opensource"
  ? "- [ ] Plugin and extension system\n- [ ] CLI tool for power users\n- [ ] Internationalisation (i18n) support\n- [ ] Comprehensive test coverage (unit + integration)\n- [ ] CI/CD pipeline with GitHub Actions"
  : "- [ ] User authentication and authorisation\n- [ ] Cloud deployment (Vercel / Render)\n- [ ] Mobile-responsive design refinements\n- [ ] Unit and integration test suite"}

---

## 🤝 Contributing

${meta.contributingNote}

1. **Fork** the repository
2. **Create** your feature branch: \`git checkout -b feature/your-feature\`
3. **Commit** your changes: \`git commit -m 'Add your feature'\`
4. **Push** to the branch: \`git push origin feature/your-feature\`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **${meta.licenseType} License**.${meta.licenseType === "MIT" ? " See the [LICENSE](LICENSE) file for details." : ""}

---

<p align="center">Made with ❤️ by the ${rawTitle} team</p>
`;
}
