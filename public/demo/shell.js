// The app window around a demo, drawn from the markup in crates/koda-ui/src/workspace (topbar.rs, file_rail.rs, sessions/dock.rs, inspector.rs, changes.rs, subagents.rs, memory_panel.rs, statusbar.rs).
const TONES = {
  chip: { indigo: "border-accent-indigo/35 bg-accent-indigo/12 text-accent-indigo-bright", cyan: "border-accent-cyan/35 bg-accent-cyan/12 text-accent-cyan-bright", purple: "border-accent-purple/35 bg-accent-purple/12 text-accent-purple-bright", emerald: "border-accent-emerald/35 bg-accent-emerald/12 text-accent-emerald-bright", amber: "border-accent-amber/35 bg-accent-amber/12 text-accent-amber-bright", rose: "border-accent-rose/35 bg-accent-rose/12 text-accent-rose", neutral: "border-hairline bg-subtle text-muted" },
  text: { indigo: "text-accent-indigo-bright", cyan: "text-accent-cyan-bright", purple: "text-accent-purple-bright", emerald: "text-accent-emerald-bright", amber: "text-accent-amber-bright", rose: "text-accent-rose", neutral: "text-muted" },
  dot: { indigo: "bg-accent-indigo", cyan: "bg-accent-cyan", purple: "bg-accent-purple", emerald: "bg-accent-emerald", amber: "bg-accent-amber", rose: "bg-accent-rose", neutral: "bg-dim" },
  hover: { indigo: "hover:border-accent-indigo/40", cyan: "hover:border-accent-cyan/40", purple: "hover:border-accent-purple/40", emerald: "hover:border-accent-emerald/40", amber: "hover:border-accent-amber/40", rose: "hover:border-accent-rose/40", neutral: "hover:border-dim/50" },
};
const PHASE = { Working: "cyan", "Needs approval": "amber", "Needs input": "amber", Finished: "emerald", Failed: "rose", Stopped: "neutral" };
const CHANGE = {
  M: { tone: "text-accent-amber-bright", dot: "bg-accent-amber", name: "modified", graph: ["amber", "modified"] },
  A: { tone: "text-accent-emerald-bright", dot: "bg-accent-emerald", name: "added", graph: ["emerald", "added"] },
  U: { tone: "text-accent-emerald-bright", dot: "bg-accent-emerald", name: "new", graph: ["cyan", "new"] },
  D: { tone: "text-accent-rose", dot: "bg-accent-rose", name: "deleted", graph: ["rose", "deleted"] },
  R: { tone: "text-accent-indigo-bright", dot: "bg-accent-indigo", name: "renamed", graph: ["purple", "renamed"] },
};
const MEMORY_VERB = { Saved: "emerald", Updated: "cyan", Read: "neutral", Forgot: "rose" };
const MEMORY_TONE = (kind) => ({ problem: "rose", error: "rose", solution: "emerald", fix: "emerald", task: "cyan", workflow: "cyan", command: "cyan", code_pattern: "cyan", project: "amber", technology: "amber", file_context: "amber" }[kind] || "neutral");
const RAIL_W = 268, SIDE_W = 357;

const SH_DEFAULT = () => ({
  project: "acme-api", runsOn: "host", branch: "main", path: "~/dev/acme-api", host: "/Users/you/dev/acme-api",
  model: "claude-sonnet-5-5", modelProject: true, provider: "Anthropic", agent: "Default agent", plan: false,
  toolCalls: 0, phase: null, autonomous: null,
  rail: true, inspector: true, collapsed: [],
  tree: [
    { name: "Cargo.toml", path: "Cargo.toml" }, { name: "README.md", path: "README.md" },
    { name: "deploy", path: "deploy", folder: true, closed: true },
    { name: "migrations", path: "migrations", folder: true, closed: true },
    { name: "src", path: "src", folder: true },
    { name: "main.rs", path: "src/main.rs", depth: 1 }, { name: "router.rs", path: "src/router.rs", depth: 1 },
    { name: "webhooks", path: "src/webhooks", folder: true, depth: 1, closed: true },
    { name: "tests", path: "tests", folder: true },
    { name: "webhooks.rs", path: "tests/webhooks.rs", depth: 1 },
  ],
  activeFile: null,
  sessions: [
    { title: "Rotate the webhook secret", ago: "4d ago", turns: 3 },
    { title: "Add webhook retries", ago: "6d ago", turns: 8 },
  ],
  more: 41,
  changes: [], changeActions: true,
  fleet: [], mainPhase: null,
  memory: { total: 8, session: [], recent: [
    { title: "Dead endpoints are retried forever", kind: "problem", updated: "2026-10-09" },
    { title: "Stop retrying on 410 Gone", kind: "fix", updated: "2026-10-09" },
    { title: "Webhooks time out in staging", kind: "problem", updated: "2026-10-03" },
    { title: "Raise the delivery timeout to 10 s", kind: "solution", updated: "2026-10-03" },
    { title: "Rotate a webhook secret", kind: "workflow", updated: "2026-10-01" },
  ] },
  context: { used: null, window: 200000, ceiling: 80 },
  graph: [],
  doing: "No session",
  terminal: false, status: [],
});
let SH = SH_DEFAULT();
const shSeen = new Set();
const fresh = (key) => { if (shSeen.has(key)) return ""; shSeen.add(key); return " enter"; };
const compactTok = (n) => n < 1000 ? String(n) : n < 1e6 ? `${(n / 1000).toFixed(1)}k` : `${(n / 1e6).toFixed(1)}M`;

function shTop() {
  const s = SH, changed = s.changes.length;
  const working = s.phase === "Working";
  const tone = s.phase ? PHASE[s.phase] : "neutral";
  const beacon = s.phase === "Working" && s.waiting ? `Waiting on ${s.waiting}` : s.phase || "No task";
  const status = working
    ? `<div class="flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-app-2xs font-medium koda-pulse-glow border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan-bright ${TONES.text[tone]}" role="status" aria-label="Run status: ${beacon}">${star("size-3.5")}<span>${beacon}</span></div>`
    : `<div class="flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-app-2xs font-medium border-hairline bg-subtle ${TONES.text[tone]}" role="status" aria-label="Run status: ${beacon}"><span class="inline-block size-1.5 shrink-0 rounded-full ${TONES.dot[tone]} "></span><span>${beacon}</span></div>`;
  const cancel = s.phase && s.phase !== "Finished" && s.phase !== "Failed" && s.phase !== "Stopped";
  const stop = `<button type="button" aria-label="Stop session" title="Stop session"${cancel ? "" : " disabled"} class="${cancel ? "flex cursor-pointer items-center gap-1 rounded border border-hairline bg-subtle px-2.5 py-1 text-app-xs text-ink/80 transition hover:bg-hover hover:text-ink" : "flex cursor-not-allowed items-center gap-1 rounded border border-hairline bg-subtle/50 px-2.5 py-1 text-app-xs text-dim opacity-60"}">${icon("size-3 text-muted", GLYPH.close)}<span>Stop</span></button>`;
  const chip = "flex cursor-pointer items-center gap-1.5 rounded border border-hairline bg-subtle px-2.5 py-1 font-mono text-app-2xs transition hover:bg-hover";
  const drop = "flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded border border-hairline bg-subtle px-2.5 py-1 text-left font-mono text-app-2xs outline-none transition hover:bg-hover focus:border-accent-cyan/60 disabled:cursor-not-allowed disabled:opacity-60";
  const autonomous = s.autonomous ? `<div class="relative"><button type="button" aria-label="Autonomous tasks: ${s.autonomous.map(([n, g]) => `${n} ${g.toLowerCase()}`).join(", ")}" aria-expanded="false" title="Autonomous tasks: ${s.autonomous.map(([n, g]) => `${n} ${g.toLowerCase()}`).join(", ")}" class="flex cursor-pointer items-center gap-2 rounded border border-hairline bg-subtle px-2.5 py-1 font-mono text-app-2xs text-ink/80 transition hover:bg-hover"><span class="text-muted">Autonomous</span><span class="h-3 w-px bg-hairline"></span>${s.autonomous.map(([n, g, t, pulse]) => `<span class="flex items-center gap-1 font-bold ${TONES.text[t]}" title="${g}"><span class="inline-block size-1.5 shrink-0 rounded-full ${TONES.dot[t]} ${pulse ? "animate-pulse" : ""}"></span>${n}</span>`).join("")}</button></div>` : "";
  const radio = (label, on, plan) => `<button type="button" role="radio" aria-checked="${on}"${working ? " disabled" : ""} class="${on ? (plan ? "cursor-pointer rounded bg-accent-indigo/15 ring-1 ring-inset ring-accent-indigo/40 px-2.5 py-0.5 text-accent-indigo-bright disabled:cursor-not-allowed" : "cursor-pointer rounded bg-command/15 ring-1 ring-inset ring-command/40 px-2.5 py-0.5 text-ink disabled:cursor-not-allowed") : "cursor-pointer rounded px-2.5 py-0.5 text-dim transition hover:text-muted disabled:cursor-not-allowed disabled:opacity-60"}">${label}</button>`;
  return `<header class="relative z-30 flex h-11 shrink-0 items-center justify-between gap-3 border-b border-hairline bg-panel px-3">
    <div class="flex min-w-[280px] shrink-0 items-center gap-2.5">
      <div class="flex items-center gap-1.5"><img src="../assets/icon.svg" alt="" class="size-5 shrink-0 rounded"><span class="font-mono text-app-xs font-semibold tracking-widest text-ink uppercase">Koda</span><span class="font-mono text-app-3xs text-muted">v0.1.0</span></div>
      <span class="text-dim/60">|</span>
      <div class="relative"><button type="button" id="sh-project" aria-label="Switch project" aria-haspopup="menu" aria-expanded="false" title="${s.project}" class="flex cursor-pointer items-center gap-1.5 rounded border border-hairline bg-subtle px-2 py-0.5 font-mono text-app-2xs font-medium text-ink transition hover:bg-hover">${icon("size-3 shrink-0 text-accent-amber-bright", GLYPH.bolt)}<span class="max-w-[160px] truncate">${s.project}</span><span class="rounded border border-accent-cyan/40 bg-accent-cyan/10 px-1 text-app-3xs font-semibold tracking-wide text-accent-cyan-bright uppercase">${s.runsOn}</span>${icon("ml-0.5 size-2.5 shrink-0 text-muted", GLYPH.chevronDown)}</button></div>
      <div class="hidden items-center gap-1 font-mono text-app-2xs text-muted xl:flex">${changed ? `<span class="size-1.5 rounded-full bg-accent-amber" title="${changed} uncommitted changes"></span>` : ""}<span class="font-medium text-ink/80">git:(<span class="text-accent-purple-bright">${s.branch}</span>)</span><span>${s.project}</span></div>
    </div>
    <div class="flex min-w-0 flex-1 items-center justify-center gap-2">
      <button type="button" id="sh-model" aria-label="Model for the next message" aria-haspopup="dialog" aria-expanded="false" title="${s.provider}: ${s.model}${s.modelProject ? ", chosen for this project" : ""}" class="${chip}"><span class="text-dim">model</span><span class="max-w-56 truncate font-semibold text-ink">${s.model}</span>${s.modelProject ? '<span class="text-accent-cyan-bright">project</span>' : ""}${icon("size-2.5 shrink-0 text-muted", GLYPH.chevronDown)}</button>
      <div class="relative min-w-0 "><button type="button" id="sh-agent"${working ? " disabled" : ""} aria-label="${working ? "The agent can change when this turn ends" : "Agent this session runs as"}" aria-haspopup="listbox" aria-expanded="false" class="${drop}"><span class="shrink-0 text-dim">agent</span><span class="grow truncate font-semibold text-ink">${s.plan ? "@plan" : s.agent}</span>${icon("size-2.5 shrink-0 text-muted", GLYPH.chevronDown)}</button></div>
      <div class="grid shrink-0 grid-cols-2 gap-0.5 rounded-md border border-hairline bg-canvas p-0.5 font-mono text-app-2xs" role="radiogroup" aria-label="Plan first" title="${working ? "The mode can change when this turn ends" : "Build makes changes; Plan designs them first, read-only"}">${radio("Build", !s.plan, false)}${radio("Plan", s.plan, true)}</div>
    </div>
    <div class="flex min-w-[280px] shrink-0 items-center justify-end gap-2">
      <button type="button" aria-label="Tool calls in this session" title="Tool calls this session has made" class="flex cursor-pointer items-center gap-1 rounded border border-hairline bg-subtle px-2.5 py-1 font-mono text-app-2xs text-ink/80 transition hover:bg-hover"><span class="text-muted">Tool calls</span><span class="font-bold text-accent-cyan-bright">(${s.toolCalls})</span></button>
      ${autonomous}${status}${stop}
      <button type="button" id="sh-new" aria-label="New session" title="New session (⌘N)" class="flex cursor-pointer items-center gap-1 rounded border border-accent-cyan/45 bg-accent-cyan/10 px-2.5 py-1 font-mono text-app-2xs font-medium text-accent-cyan-bright transition hover:border-accent-cyan hover:bg-accent-cyan/18">${icon("size-3", GLYPH.plus)}New session</button>
      ${panelToggle(s.rail, true)}${panelToggle(s.inspector, false)}
      <button type="button" id="sh-settings" aria-label="Settings" title="Settings" class="flex shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition hover:bg-hover hover:text-ink size-7 rounded">${icon("size-4", GLYPH.settings)}</button>
    </div>
  </header>`;
}

function star(cls) {
  return `<span class="koda-star relative inline-flex shrink-0 items-center justify-center ${cls}"><svg class="animate-sparkle-pulse block size-full" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="${GLYPH.sparkle[0]}"/><path d="${GLYPH.sparkle[1]}" class=""/></svg></span>`;
}

function panelToggle(on, left) {
  const what = left ? "file panel" : "inspector", keys = left ? "⌘B" : "⌥⌘B", verb = on ? "Hide" : "Show";
  return `<button type="button" aria-label="${verb} the ${what}" aria-pressed="${on}" title="${verb} the ${what} (${keys})" class="${on ? "flex size-7 cursor-pointer items-center justify-center rounded text-ink transition hover:bg-hover" : "flex size-7 cursor-pointer items-center justify-center rounded text-dim transition hover:bg-hover hover:text-muted"}">${icon("size-4", left ? GLYPH.panelLeft : GLYPH.panelRight)}</button>`;
}

function shRail() {
  const s = SH;
  const changed = Object.fromEntries(s.changes.map((c) => [c.path, c.state]));
  const folders = new Set(s.changes.flatMap((c) => c.path.split("/").slice(0, -1).map((_, i, a) => a.slice(0, i + 1).join("/"))));
  const hidden = new Set();
  const rows = [];
  for (const r of s.tree) {
    if ([...hidden].some((h) => r.path.startsWith(`${h}/`))) continue;
    const pad = 12 + (r.depth || 0) * 16;
    if (r.folder) {
      if (r.closed) hidden.add(r.path);
      rows.push(`<button type="button" aria-label="${r.closed ? "Expand" : "Collapse"} ${r.path}" aria-expanded="${!r.closed}" class="flex w-full items-center gap-1.5 py-(--koda-row-pad) pr-3 text-left transition cursor-pointer text-muted hover:text-ink" style="padding-left: ${pad}px">${icon(r.closed ? "size-3 shrink-0 text-muted transition-transform" : "size-3 shrink-0 rotate-90 text-muted transition-transform", GLYPH.chevronRight)}<svg class="size-3.5 shrink-0 text-accent-amber/80" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/></svg><span class="truncate">${r.name}</span>${folders.has(r.path) ? '<span class="ml-auto size-1.5 shrink-0 rounded-full bg-accent-amber" title="Holds uncommitted changes"></span>' : ""}</button>`);
      continue;
    }
    const active = s.activeFile === r.path, ch = changed[r.path];
    rows.push(`<button type="button" data-file="${r.path}" aria-label="Open ${r.path}" title="${r.path}" aria-current="${active}" class="${active ? "flex w-full cursor-pointer items-center gap-2 border-l-2 border-accent-cyan bg-accent-cyan/10 py-(--koda-row-pad) pr-3 text-left font-medium text-accent-cyan-bright" : "flex w-full cursor-pointer items-center gap-2 py-(--koda-row-pad) pr-3 text-left text-ink/80 transition hover:bg-hover hover:text-ink"}" style="padding-left: ${active ? pad - 2 : pad}px"><span class="${active ? "shrink-0 text-app-2xs text-accent-cyan-bright" : "shrink-0 text-app-2xs text-muted"}">&lt;&gt;</span><span class="${ch && !active ? `truncate ${CHANGE[ch].tone}` : "truncate"}">${r.name}</span>${ch ? `<span class="ml-auto shrink-0 text-app-2xs font-semibold ${CHANGE[ch].tone}" title="${CHANGE[ch].name === "new" ? "untracked" : CHANGE[ch].name}">${ch}</span>` : ""}</button>`);
  }
  const running = s.sessions.filter((r) => r.phase === "Working").length;
  const attention = s.sessions.filter((r) => r.phase === "Needs approval" || r.phase === "Needs input").length;
  const session = (r) => {
    const label = r.phase === "Needs approval" || r.phase === "Needs input" ? "Attention" : r.goal && r.phase === "Working" ? "Goal" : r.phase || "";
    const tone = r.goal && r.phase === "Working" ? "purple" : r.phase ? PHASE[r.phase] : "neutral";
    const frame = r.selected ? "border-accent-cyan/60 bg-hover" : label === "Attention" ? "border-accent-amber/40 bg-subtle hover:border-accent-amber/60" : "border-hairline bg-subtle hover:border-dim/50";
    const pulse = ["Working", "Needs approval", "Needs input"].includes(r.phase);
    return `<div data-session="${r.title}" class="group relative flex min-w-0 cursor-pointer flex-col gap-0.5 rounded border py-1.5 pr-1 pl-2 transition ${frame}${fresh(`s:${r.title}`)}" role="button" tabindex="0" aria-label="${r.selected ? `${r.title}, on screen` : `Open ${r.title}`}" title="${r.title}"><div class="flex min-w-0 items-center gap-1.5"><span class="inline-block size-2 shrink-0 rounded-full ${TONES.dot[tone]}${pulse ? " animate-pulse" : ""}"></span><span class="min-w-0 grow truncate font-medium text-ink">${r.title}</span>${label ? `<span class="shrink-0 rounded border px-1 text-app-3xs uppercase ${TONES.chip[tone]}">${label}</span>` : ""}</div><div class="flex min-w-0 gap-2 pl-3.5 text-app-3xs text-dim tabular-nums"><span class="shrink-0">${r.ago}</span>${r.spend ? `<span class="shrink-0">${r.spend}</span>` : r.turns ? `<span class="shrink-0">${r.turns === 1 ? "1 turn" : `${r.turns} turns`}</span>` : ""}</div></div>`;
  };
  return `<aside class="flex h-full w-full min-w-0 flex-col border-r border-hairline bg-panel">
    <div class="flex h-9 shrink-0 items-center justify-between gap-2 border-b border-hairline px-3 font-mono text-app-2xs tracking-wider text-muted"><span class="font-bold text-ink/80 uppercase">Project Tree</span><span class="min-w-0 truncate" title="${s.project}">${s.project}</span></div>
    <div class="border-b border-hairline p-2"><div class="relative flex items-center">${icon("pointer-events-none absolute left-2 size-3.5 text-muted", GLYPH.search)}<input type="text" aria-label="Filter files" placeholder="Filter files (⌘P)..." class="w-full rounded border border-hairline bg-subtle py-1 pr-8 pl-7 font-mono text-app-xs text-ink outline-none placeholder:text-muted focus:border-accent-cyan" tabindex="-1"><button type="button" aria-label="Show hidden files" aria-pressed="false" title="Show files and folders whose names start with a dot, like .koda and .env" class="absolute right-1 flex size-5 cursor-pointer items-center justify-center rounded text-dim transition hover:bg-hover hover:text-muted">${icon("size-3.5", GLYPH.eye)}</button></div></div>
    <div class="flex min-h-0 grow flex-col gap-(--koda-row-gap) overflow-y-auto py-2 font-mono text-app-xs">${rows.join("")}</div>
    <div class="shrink-0 border-t border-hairline bg-well p-2.5">
      <div class="mb-2 flex items-center justify-between gap-2 font-mono text-app-3xs font-semibold tracking-wider whitespace-nowrap text-muted uppercase"><div class="flex min-w-0 items-center gap-1.5 overflow-hidden"><span class="shrink-0">Sessions</span>${running ? `<span class="truncate text-accent-cyan-bright">· ${running} running</span>` : ""}${attention ? `<span class="truncate text-accent-amber-bright">· ${attention} attention</span>` : ""}</div><button type="button" aria-label="New session" title="New session" class="flex size-5 cursor-pointer items-center justify-center rounded border border-hairline text-muted transition hover:bg-hover hover:text-ink">${icon("size-3", GLYPH.plus)}</button></div>
      <div class="mb-2 font-mono whitespace-nowrap"><div role="radiogroup" class="flex gap-0.5 rounded-lg border border-hairline bg-canvas p-0.5"><button type="button" role="radio" aria-checked="true" class="flex-1 rounded bg-command/15 ring-1 ring-inset ring-command/40 px-2.5 py-1 text-app-2xs text-ink">This project</button><button type="button" role="radio" aria-checked="false" class="flex-1 rounded px-2.5 py-1 text-app-2xs text-dim transition hover:text-muted">All</button></div></div>
      <div class="flex max-h-52 flex-col gap-1.5 overflow-y-auto font-mono text-app-2xs">${s.sessions.length ? s.sessions.slice(0, 5).map(session).join("") : '<span class="px-1.5 py-1 text-dim">No sessions yet</span>'}</div>
      <button type="button" id="sh-all-sessions" class="mt-1.5 w-full cursor-pointer rounded px-1.5 py-1 text-center font-mono text-app-3xs text-muted transition hover:bg-hover hover:text-ink">All sessions${s.more ? `<span class="text-dim"> · ${s.more} more</span>` : ""}<span class="pl-2 text-dim">⌘O</span></button>
    </div>
  </aside>`;
}

function sectionHead(slug, cls, title, meta) {
  const closed = SH.collapsed.includes(slug);
  return `<div class="${closed ? "" : "mb-2 "}flex items-center justify-between gap-2 ${cls}"><button type="button" data-section="${slug}" class="flex min-w-0 cursor-pointer items-center gap-1 rounded text-left outline-none focus-visible:ring-1 focus-visible:ring-accent-purple-bright" aria-expanded="${!closed}" title="Collapse or expand; ⌥-click shows only this section">${icon(closed ? "size-3 shrink-0 -rotate-90 text-dim transition" : "size-3 shrink-0 text-dim transition", GLYPH.chevronDown)}${title}</button>${meta}</div>`;
}

function shChanges() {
  const s = SH, closed = s.collapsed.includes("changes");
  const added = s.changes.reduce((a, c) => a + c.added, 0), removed = s.changes.reduce((a, c) => a + c.removed, 0);
  const unkept = s.changes.filter((c) => !c.kept).length;
  const bulk = s.changeActions && s.changes.length ? `<span class="ml-1 flex items-center gap-2 border-l border-hairline pl-2 font-normal"><button type="button" title="Keep every changed file: stage them all"${unkept ? "" : " disabled"} class="cursor-pointer text-accent-cyan-bright transition hover:text-accent-cyan disabled:cursor-default disabled:opacity-40">Keep all</button><button type="button" title="Discard every change: restore each file from HEAD" class="cursor-pointer text-muted transition hover:text-accent-rose">Discard all</button></span>` : "";
  const head = sectionHead("changes", "font-mono text-app-xs", `<span class="flex min-w-0 items-center gap-1.5 font-bold text-ink">${icon("size-4 shrink-0 text-accent-cyan-bright", GLYPH.document)}<span class="shrink-0">Changed Files</span></span>`, `<div class="flex items-center gap-1.5 text-app-2xs font-semibold tabular-nums"><span class="rounded border border-accent-cyan/50 bg-accent-cyan/10 px-1.5 font-bold text-accent-cyan-bright">${s.changes.length}</span><span class="text-accent-emerald-bright">+${added}</span><span class="text-accent-rose">-${removed}</span>${bulk}</div>`);
  const row = (c) => `<div data-change="${c.path}" class="${c.selected ? "flex items-center justify-between gap-2 rounded bg-accent-cyan/10 p-1" : "flex items-center justify-between gap-2 rounded p-1 transition hover:bg-hover"}${fresh(`c:${c.path}`)}"><button type="button" class="flex min-w-0 grow cursor-pointer items-center gap-1.5 text-left" title="${c.path} · ${CHANGE[c.state].name === "new" ? "untracked" : CHANGE[c.state].name} · click to see the diff"><span class="size-1.5 shrink-0 rounded-full ${CHANGE[c.state].dot}"></span><span class="truncate text-ink/80">${c.path}</span></button><div class="flex shrink-0 items-center gap-2 tabular-nums"><span class="text-accent-emerald-bright">+${c.added}</span><span class="${c.removed ? "text-accent-rose" : "text-muted"}">-${c.removed}</span>${s.changeActions ? (c.kept ? `<span class="text-accent-emerald-bright" title="Staged">Kept</span><button type="button" aria-label="Unstage ${c.path}" title="Unstage" class="cursor-pointer text-muted transition hover:text-ink">Undo</button>` : `<button type="button" aria-label="Keep ${c.path}" title="Keep the changes: stage them" class="cursor-pointer text-accent-cyan-bright transition hover:text-accent-cyan">Keep</button>`) + `<button type="button" aria-label="Discard ${c.path}" title="Discard the changes: restore the file from HEAD" class="cursor-pointer text-muted transition hover:text-accent-rose">Discard</button>` : ""}</div></div>`;
  return `<section class="shrink-0 border-b border-hairline p-3">${head}${closed ? "" : `<div class="flex max-h-48 flex-col gap-1 overflow-y-auto font-mono text-app-2xs">${s.changes.length ? s.changes.map(row).join("") : '<p class="px-1 text-dim">No changes in this project.</p>'}</div>`}</section>`;
}

function shDelegation() {
  const s = SH, closed = s.collapsed.includes("delegation");
  const head = sectionHead("delegation", "font-mono text-app-2xs text-ink", `<span class="flex items-center gap-1 font-semibold">${icon("size-3.5 text-accent-purple-bright", GLYPH.delegate)}<span>Sub-Agent Delegation Tree</span></span>`, `<div class="flex items-center gap-2 text-app-3xs"><span class="text-accent-purple-bright">${s.fleet.length} delegated</span><button type="button" class="cursor-pointer text-muted transition hover:text-ink" aria-label="Manage agents">Manage</button></div>`);
  const agent = (a) => `<button type="button" class="flex w-full cursor-pointer items-center justify-between gap-2 text-left transition hover:opacity-80 ${TONES.text[a.tone]}${fresh(`d:${a.name}`)}" title="${a.description || ""}"><span class="flex min-w-0 items-center gap-1.5"><span class="text-dim">↳</span><span class="inline-block size-1.5 shrink-0 rounded-full ${TONES.dot[a.tone]} ${a.running ? "animate-pulse" : ""}"></span><span class="truncate">${a.name}</span></span><span class="shrink-0 text-app-3xs ${TONES.text[a.statusTone || "neutral"]}">${a.activity}</span></button>`;
  return `<section class="shrink-0 border-b border-hairline p-3">${head}${closed ? "" : `<div class="flex flex-col gap-2 rounded-md border border-hairline bg-subtle p-2.5 font-mono text-app-2xs"><button type="button" class="flex w-full cursor-pointer items-center gap-1.5 text-left text-ink" aria-label="Show the main agent"><span class="size-2 shrink-0 rounded-full bg-agent-main"></span><span class="font-bold text-agent-main">Main agent</span><span class="ml-auto text-app-3xs text-muted">${s.phase || "No session"}</span></button><div class="ml-1 flex flex-col gap-1.5 border-l border-agent-main/40 pl-3">${s.fleet.length ? s.fleet.map(agent).join("") : '<span class="text-app-3xs text-dim">No delegations yet</span>'}</div></div>`}</section>`;
}

function shMemory() {
  const m = SH.memory, closed = SH.collapsed.includes("memory");
  const heading = "mb-1.5 mt-2 flex justify-between text-app-3xs font-bold tracking-wider text-muted uppercase";
  const head = sectionHead("memory", "font-mono text-app-2xs text-ink", `<span class="flex items-center gap-1 font-semibold">${icon("size-3.5 text-accent-purple-bright", GLYPH.bookOpen)}<span>Memory</span></span>`, `<div class="flex items-center gap-2 text-app-3xs"><span class="text-accent-purple-bright">${m.total} saved</span><button type="button" id="sh-memory-manage" class="cursor-pointer text-muted transition hover:text-ink" aria-label="Manage memories">Manage</button></div>`);
  if (closed) return `<section class="shrink-0 border-b border-hairline p-3">${head}</section>`;
  const touched = m.session.slice(0, 5);
  const recent = m.recent.filter((r) => !touched.some((t) => t.title === r.title)).slice(0, touched.length ? 3 : 5);
  const listed = touched.filter((t) => !t.deleted).length;
  const rest = Math.max(0, m.total - recent.length - listed);
  let body = "";
  if (!m.total && !touched.length) body = '<p class="text-app-2xs text-dim">No memories yet.</p>';
  if (touched.length) body += `<div class="${heading}"><span>This session</span><span class="font-normal text-dim">${touched.length}</span></div>` + touched.map((t) => `<button type="button" data-memory="${t.title}"${t.deleted ? " disabled" : ""} title="${t.deleted ? "This memory was deleted" : "Open in Memory"}" class="mb-1 flex w-full flex-col gap-0.5 rounded border border-hairline bg-subtle px-2 py-1.5 text-left transition enabled:cursor-pointer hover:border-accent-purple/40${fresh(`m:${t.verb}:${t.title}`)}"><div class="flex min-w-0 items-center gap-1.5"><span class="shrink-0 rounded border px-1 text-app-3xs font-bold uppercase ${TONES.chip[MEMORY_VERB[t.verb]]}">${t.verb}</span><span class="${t.deleted ? "truncate text-app-2xs text-dim line-through" : "truncate text-app-2xs text-ink"}">${t.title}</span></div>${t.kind ? `<span class="truncate text-app-3xs text-dim">${t.kind}</span>` : ""}</button>`).join("");
  if (recent.length) body += `<div class="${heading}"><span>Recent in project</span><span class="font-normal text-dim">${m.total}</span></div>` + recent.map((r) => `<button type="button" data-memory="${r.title}" title="Open in Memory" class="mb-1 flex w-full cursor-pointer flex-col gap-0.5 rounded border border-hairline bg-subtle px-2 py-1.5 text-left transition hover:border-accent-purple/40"><div class="flex min-w-0 items-center gap-1.5"><span class="size-1.5 shrink-0 rounded-full ${TONES.dot[MEMORY_TONE(r.kind)]}"></span><span class="truncate text-app-2xs text-ink">${r.title}</span></div><span class="truncate text-app-3xs text-dim">${r.kind} · updated ${r.updated}</span></button>`).join("");
  if (rest) body += `<button type="button" class="cursor-pointer text-app-3xs text-dim transition hover:text-ink">${rest} more in Memory →</button>`;
  return `<section class="shrink-0 border-b border-hairline p-3">${head}${body}</section>`;
}

function shContext() {
  const c = SH.context, closed = SH.collapsed.includes("context");
  const used = c.used == null ? "—" : compactTok(c.used), win = compactTok(c.window);
  const pct = c.used == null ? 0 : Math.min(100, Math.floor((c.used * 100) / c.window));
  const ceiling = Math.floor((c.window * c.ceiling) / 100);
  let fill = "from-accent-cyan to-accent-indigo", left = "after the first reply", leftCls = "";
  if (c.used != null && c.used >= ceiling) { fill = "from-accent-amber-bright to-accent-rose"; left = "compacts before the next step"; leftCls = "text-accent-rose"; }
  else if (c.used != null && c.used * 10 >= ceiling * 9) { fill = "from-accent-amber to-accent-amber-bright"; left = `${compactTok(ceiling - c.used)} left`; leftCls = "text-accent-amber-bright"; }
  else if (c.used != null) left = `${compactTok(ceiling - c.used)} left`;
  const label = `${used} / ${win} (<span class="text-accent-cyan-bright">${pct}%</span>)`;
  const head = sectionHead("context", "font-mono text-app-xs", `<span class="flex items-center gap-1.5 font-bold text-ink">${icon("size-3.5 text-accent-purple-bright", GLYPH.bolt)}<span>Context Graph</span></span>`, closed ? `<span class="font-mono text-app-2xs text-muted tabular-nums">${label}</span>` : "");
  return `<section class="relative shrink-0 border-b border-hairline p-3">${head}${closed ? "" : `<div class="mb-1 flex items-center justify-between font-mono text-app-2xs text-muted"><span class="uppercase">Context Window Capacity</span><span class="font-semibold text-ink tabular-nums">${label}</span></div><div class="relative h-2 w-full rounded-full bg-hover" title="Compacts at ${compactTok(ceiling)} (${c.ceiling}% of the window)"><div class="h-full rounded-full bg-linear-to-r ${fill}" style="width: ${pct}%; transition: width .6s ease"></div><div class="absolute -top-0.5 -bottom-0.5 -ml-px w-0.5 rounded-sm bg-ink/75" style="left: ${c.ceiling}%"></div></div><div class="mt-1.5 flex justify-between font-mono text-app-3xs text-dim"><span>compacts at ${compactTok(ceiling)}</span><span class="${leftCls}">${left}</span></div>`}</section>`;
}

function shGraph() {
  const rows = SH.graph.slice().sort((a, b) => a.path.localeCompare(b.path)), closed = SH.collapsed.includes("active_graph");
  const head = sectionHead("active_graph", "", '<span class="text-app-3xs font-bold tracking-wider text-muted uppercase">Active semantic graph</span>', `<span class="text-app-3xs text-dim">${rows.length} changed</span>`);
  const row = (g) => { const [t, label] = CHANGE[g.state].graph; return `<button type="button" title="Show ${g.path} in the graph" class="flex w-full cursor-pointer flex-col gap-1 rounded border border-hairline bg-subtle p-2 text-left transition ${TONES.hover[t]}${fresh(`g:${g.path}`)}"><div class="flex items-center justify-between gap-2"><div class="flex min-w-0 items-center gap-1.5 font-medium text-ink"><span class="size-1.5 shrink-0 rounded-full ${TONES.dot[t]}"></span><span class="truncate">${g.path.split("/").pop()}</span></div><span class="shrink-0 rounded border px-1 text-app-3xs font-bold uppercase ${TONES.chip[t]}">${label}</span></div><p class="truncate text-app-3xs text-muted">${g.definitions} definitions · uses ${g.uses} files · used by ${g.usedBy} files</p></button>`; };
  return `<div class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 font-mono text-app-xs"><div class="mb-2 flex flex-col">${head}${closed ? "" : `<div class="flex flex-col gap-2">${rows.length ? rows.map(row).join("") : '<p class="text-app-2xs text-dim">No changed files in the code graph. Changes to its files appear here.</p>'}</div>`}</div></div>`;
}

const shInspector = () => `<aside class="flex h-full w-full min-w-0 flex-col overflow-hidden border-l border-hairline bg-panel">${shChanges()}${shDelegation()}${shMemory()}${shContext()}${shGraph()}</aside>`;

function shFoot() {
  const s = SH;
  const added = s.changes.reduce((a, c) => a + c.added, 0), removed = s.changes.reduce((a, c) => a + c.removed, 0);
  const extra = s.status.map((html) => `${html}<span class="text-dim">|</span>`).join("");
  return `<footer class="z-30 flex h-6 shrink-0 items-center justify-between gap-3 border-t border-hairline bg-well px-3 font-mono text-app-2xs text-muted">
    <div class="flex min-w-0 items-center gap-3"><div class="flex shrink-0 items-center gap-1.5"><span class="size-2 rounded-full bg-accent-emerald"></span><span class="text-ink/80">${s.changes.length} Dirty Files</span></div><div class="flex shrink-0 items-center gap-1 font-semibold tabular-nums"><span class="text-accent-emerald-bright">+${added}</span><span class="text-accent-rose">-${removed}</span></div><span class="text-dim">|</span><div class="flex min-w-0 items-center gap-1 text-ink/80">${icon("size-3 shrink-0 text-accent-cyan-bright", GLYPH.bolt)}<span class="truncate">${s.project}: ${s.doing}</span></div></div>
    <div class="flex shrink-0 items-center gap-3"><button type="button" id="sh-terminal" aria-pressed="${s.terminal}" title="Terminal (⌃\`)" class="${s.terminal ? "flex cursor-pointer items-center gap-1 rounded px-1.5 text-accent-cyan-bright transition hover:bg-hover" : "flex cursor-pointer items-center gap-1 rounded px-1.5 transition hover:bg-hover hover:text-ink"}">${icon("size-3 shrink-0", GLYPH.terminal)}Terminal</button><span class="text-dim">|</span>${extra}<div class="flex items-center gap-1.5"><span class="size-1.5 rounded-full bg-accent-emerald"></span><span class="max-w-[320px] truncate" title="${s.host}">${s.path}</span><span class="font-semibold text-ink/80">local</span></div><span class="text-dim">|</span><span>UTF-8</span></div>
  </footer>`;
}

function shPaint() {
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.outerHTML = html.replace(/^(\s*<\w+)/, `$1 id="${id}"`); };
  set("sh-top", shTop());
  set("sh-rail", SH.rail ? shRail() : "<div></div>");
  set("sh-insp", SH.inspector ? shInspector() : "<div></div>");
  set("sh-foot", shFoot());
  const grid = document.getElementById("sh-grid");
  if (grid) grid.style.gridTemplateColumns = [SH.rail ? `${RAIL_W}px` : "", "minmax(360px,1fr)", SH.inspector ? `${SIDE_W}px` : ""].filter(Boolean).join(" ");
  const over = document.getElementById("sh-over");
  if (over) { over.style.left = SH.rail ? `${RAIL_W}px` : "0px"; over.style.right = SH.inspector ? `${SIDE_W}px` : "0px"; }
}

// Merges into the shell's state and redraws it; rows whose key is new this run fade in.
function shell(patch = {}) {
  for (const [k, v] of Object.entries(patch)) SH[k] = v && typeof v === "object" && !Array.isArray(v) && SH[k] && typeof SH[k] === "object" && !Array.isArray(SH[k]) ? { ...SH[k], ...v } : v;
  shPaint();
}

function mountShell(centre, opts = {}) {
  SH = SH_DEFAULT();
  shSeen.clear();
  for (const [k, v] of Object.entries(opts)) SH[k] = v && typeof v === "object" && !Array.isArray(v) && typeof SH[k] === "object" && !Array.isArray(SH[k]) ? { ...SH[k], ...v } : v;
  for (const key of ["sessions", "changes", "fleet", "graph"]) for (const r of SH[key]) shSeen.add(`${key[0]}:${r.title || r.path || r.name}`);
  for (const t of SH.memory.session) shSeen.add(`m:${t.verb}:${t.title}`);
  document.getElementById("app").innerHTML = `<main class="relative grid h-full w-full grid-rows-[44px_minmax(0,1fr)_24px] overflow-hidden bg-canvas"><header id="sh-top"></header><div id="sh-grid" class="grid min-h-0 grid-rows-[minmax(0,1fr)] overflow-x-auto"><aside id="sh-rail"></aside><main id="centre" class="relative flex min-w-0 flex-col overflow-hidden bg-canvas">${centre}</main><aside id="sh-insp"></aside></div><footer id="sh-foot"></footer><div id="sh-layer" class="hidden"></div></main>`;
  shPaint();
}

// A screen in ScreenModal over the session (ui/chrome.rs): the window dims and the frame sits over the centre column, or fills the window when maximized.
function screenModal(kind, inner, { wide = false, maximized = false } = {}) {
  const frame = maximized ? "relative flex h-full w-full flex-col overflow-hidden bg-canvas"
    : wide ? "relative flex h-[min(860px,100%)] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-hairline bg-canvas elevated-shadow"
    : "relative flex h-[min(760px,100%)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-hairline bg-canvas elevated-shadow";
  const pos = maximized ? "position:absolute;inset:0" : `position:absolute;top:44px;bottom:24px;left:${SH.rail ? RAIL_W : 0}px;right:${SH.inspector ? SIDE_W : 0}px`;
  return `<div class="${maximized ? "absolute inset-0 z-40 flex" : "absolute inset-0 z-40 bg-black/35"}"><div id="sh-over" class="${maximized ? "flex h-full w-full" : "flex items-center justify-center p-6"}" style="${pos}"><section id="koda-screen-${kind}" aria-label="${kind}" class="${frame}">${inner}</section></div></div>`;
}
function openScreen(kind, inner, opts) {
  const layer = document.getElementById("sh-layer");
  layer.className = "contents";
  layer.innerHTML = screenModal(kind, inner, opts);
}
function closeScreen() {
  const layer = document.getElementById("sh-layer");
  layer.className = "hidden";
  layer.innerHTML = "";
}
const screenHeader = ({ glyph, tone = "cyan", title, caption, trailing = "", maximized = false }) => `<header class="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-hairline bg-panel px-4"><div class="flex min-w-0 items-center gap-2">${icon(`size-4 shrink-0 ${TONES.text[tone]}`, glyph)}<h1 class="shrink-0 font-mono text-app-xs font-bold text-ink">${title}</h1>${caption ? `<span class="truncate text-app-xs text-muted">${caption}</span>` : ""}</div><div class="flex shrink-0 items-center gap-1.5">${trailing}<button type="button" aria-label="${maximized ? "Restore the screen" : "Maximize the screen"}" title="${maximized ? "Restore (or double-click the title bar)" : "Maximize (or double-click the title bar)"}" class="flex size-6 cursor-pointer items-center justify-center rounded text-muted transition hover:bg-hover hover:text-ink">${icon("size-3.5", maximized ? GLYPH.restore : GLYPH.maximize)}</button></div></header>`;
const screenFooter = (info, actions) => `<footer class="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-3 border-t border-hairline bg-panel px-4 py-2"><div class="flex min-w-0 items-center gap-2 font-mono text-app-2xs text-muted">${info || ""}</div><div class="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">${actions}</div></footer>`;
const ACTION_KIND = { primary: "border-accent-cyan/45 bg-accent-cyan/10 font-medium text-accent-cyan-bright hover:border-accent-cyan hover:bg-accent-cyan/18", secondary: "border-hairline bg-subtle text-ink/80 hover:bg-hover hover:text-ink", danger: "border-accent-rose/40 bg-accent-rose/10 text-accent-rose hover:bg-accent-rose/20" };
const actionButton = (label, kind = "secondary", glyph, act) => `<button type="button" data-act="${act || label}" class="flex cursor-pointer items-center gap-1.5 rounded border px-3 py-1 text-app-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${ACTION_KIND[kind]}">${glyph ? icon("size-3.5 shrink-0", glyph) : ""}${label}</button>`;
