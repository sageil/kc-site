// The acme-api memories both memory demos tell one story with, and the Memory screen (crates/koda-ui/src/workspace/memory_screen.rs).
const SESSION_FIX = "7c1e4b2a-9d3f-4e61-b8a0-52c4d1e9f0a7";
const MEMORY_DB = "/Users/you/dev/acme-api/.koda/memory/memory.db";
const MEMORIES = () => [
  { id: "a81c04de-5b27-4f0e-9c13-6d2e8a41b7f9", kind: "solution", title: "Raise the delivery timeout to 10 s", summary: "WEBHOOK_TIMEOUT=10s, with the staging proxy limit raised to match.", content: "Deliveries now wait WEBHOOK_TIMEOUT=10s.\nRaised proxy_read_timeout to 12s in deploy/staging/nginx.conf, so the proxy no longer cuts the request at 5 s.", tags: ["webhooks", "config"], importance: 0.9, created: "2026-10-03T16:53:41.208Z", updated: "2026-10-03T16:53:41.208Z", version: 1, session: SESSION_FIX },
  { id: "3f9a2c71-0e4d-4b8a-a6f2-91c5d3e07b28", kind: "problem", title: "Webhooks time out in staging", summary: "Deliveries to slow endpoints fail after about five seconds, only in staging.", content: "Deliveries to endpoints that answer in more than 5 s fail with a 502.\nOnly staging: its nginx proxy cuts the request at proxy_read_timeout 5s.", tags: ["webhooks", "staging"], importance: 0.8, created: "2026-10-03T16:52:58.517Z", updated: "2026-10-03T16:52:58.517Z", version: 1, session: SESSION_FIX },
  { id: "77ad31f8-2c6e-4d19-8b04-e3a9f51d6c20", kind: "problem", title: "Dead endpoints are retried forever", summary: "A 410 Gone reply was treated like a 503 and retried.", content: "A 410 Gone reply was treated like a 503 and retried until the limit.", tags: ["webhooks", "retries"], importance: 0.7, created: "2026-09-27T14:31:09.884Z", updated: "2026-09-27T14:31:09.884Z", version: 1 },
  { id: "e4f61a2b-9d03-4c7e-b158-0a6f2c84d3e1", kind: "fix", title: "Stop retrying on 410 Gone", summary: "should_retry() returns false for 410.", content: "should_retry() returns false for 400, 401 and 410.", tags: ["webhooks", "retries"], importance: 0.8, created: "2026-09-27T15:02:44.130Z", updated: "2026-09-27T15:02:44.130Z", version: 1 },
  { id: "b6e2f9c4-71a8-4e3d-9f20-c5d8b14a6e07", kind: "workflow", title: "Rotate a webhook secret", summary: "Sign with both secrets for a day, then drop the old one.", content: "1. Create the new secret.\n2. Sign with both for a day.\n3. Drop the old one.", tags: ["webhooks", "security"], importance: 0.6, created: "2026-09-29T10:40:17.562Z", updated: "2026-09-30T08:55:02.913Z", version: 2 },
  { id: "c2b77e10-4f8a-4d61-a3e9-7b05c2d18f46", kind: "error", title: "502 from the staging proxy after 5 s", summary: "upstream timed out while reading response header", content: "upstream timed out (110: Connection timed out) while reading response header from upstream", tags: ["proxy", "staging"], importance: 0.6, created: "2026-09-26T09:20:33.071Z", updated: "2026-09-26T09:20:33.071Z", version: 1 },
  { id: "5d0e9b43-8a1c-4f72-b6d5-2e9f40c3a718", kind: "technology", title: "Staging runs behind an nginx proxy", summary: "Its read timeout lives in deploy/staging/nginx.conf.", content: "Staging sits behind nginx. Its read timeout lives in deploy/staging/nginx.conf.", tags: ["staging", "deploy"], importance: 0.5, created: "2026-09-26T11:02:48.395Z", updated: "2026-09-26T11:02:48.395Z", version: 1 },
  { id: "19bc5d07-3e6a-4b28-8c91-f4a07d2e5b63", kind: "command", title: "Replay a delivery", summary: "just replay <delivery-id>", content: "just replay <delivery-id>", tags: ["webhooks", "ops"], importance: 0.4, created: "2026-09-29T10:12:26.748Z", updated: "2026-09-29T10:12:26.748Z", version: 1 },
];
const LINKS = () => [
  ["e4f61a2b-9d03-4c7e-b158-0a6f2c84d3e1", "77ad31f8-2c6e-4d19-8b04-e3a9f51d6c20", "SOLVES"],
  ["5d0e9b43-8a1c-4f72-b6d5-2e9f40c3a718", "c2b77e10-4f8a-4d61-a3e9-7b05c2d18f46", "RELATED_TO"],
  ["a81c04de-5b27-4f0e-9c13-6d2e8a41b7f9", "3f9a2c71-0e4d-4b8a-a6f2-91c5d3e07b28", "SOLVES"],
];
const EDITED_TITLE = "Raise the webhook timeout to 10 s";
const RELATIONSHIPS = ["CAUSES", "TRIGGERS", "LEADS_TO", "PREVENTS", "BREAKS", "SOLVES", "ADDRESSES", "ALTERNATIVE_TO", "IMPROVES", "REPLACES", "OCCURS_IN", "APPLIES_TO", "WORKS_WITH", "REQUIRES", "USED_IN", "BUILDS_ON", "CONTRADICTS", "CONFIRMS", "GENERALIZES", "SPECIALIZES", "SIMILAR_TO", "VARIANT_OF", "RELATED_TO", "ANALOGY_TO", "OPPOSITE_OF", "FOLLOWS", "DEPENDS_ON", "ENABLES", "BLOCKS", "PARALLEL_TO", "EFFECTIVE_FOR", "INEFFECTIVE_FOR", "PREFERRED_OVER", "DEPRECATED_BY", "VALIDATED_BY", "INVOLVES", "PART_OF", "EXECUTED_IN", "EXHIBITS", "ATTEMPTED_SOLUTION", "IN_SESSION", "MODIFIES", "CREATES", "FOUND_IN"];

const memTone = (kind) => ({ problem: "rose", error: "rose", solution: "emerald", fix: "emerald", task: "cyan", workflow: "cyan", command: "cyan", code_pattern: "cyan", project: "amber", technology: "amber", file_context: "amber" }[kind] || "neutral");
const MEM_STROKE = { rose: "var(--koda-accent-rose)", emerald: "var(--koda-accent-emerald)", cyan: "var(--koda-accent-cyan)", amber: "var(--koda-accent-amber)", neutral: "var(--koda-dim)" };
const dayOf = (s) => s.slice(0, 10), timeOf = (s) => s.slice(11, 16), shortId = (id) => id.slice(0, 8);
const memChip = (label, t) => `<span class="inline-flex h-[22px] shrink-0 items-center gap-1 rounded border px-1.5 font-mono text-app-2xs tracking-[0.06em] uppercase ${TONES.chip[t]}"><span class="truncate">${esc(label)}</span></span>`;
// Briefs for the inspector's Memory section: newest first, as Request::Briefs sorts them.
const briefsOf = (mems) => mems.slice().sort((a, b) => b.updated.localeCompare(a.updated)).map((m) => ({ title: m.title, kind: m.kind, updated: dayOf(m.updated) }));

const MEM = { mems: [], links: [], view: "list", query: "", kind: null, opened: null, panel: "detail", draft: null, versions: [], chip: false, link: null, drop: null, needle: "", confirm: false, maximized: false };
function memReset(mems = MEMORIES(), links = LINKS()) {
  Object.assign(MEM, { mems, links, view: "list", query: "", kind: null, opened: null, panel: "detail", draft: null, versions: [], chip: false, link: null, drop: null, needle: "", confirm: false, maximized: false });
}
const memById = (id) => MEM.mems.find((m) => m.id === id);
const memByTitle = (title) => MEM.mems.find((m) => m.title === title);

function memMenu(name, value, options, filter) {
  const open = MEM.drop === name, needle = MEM.needle;
  const listed = options.filter(([v, l]) => !needle || l.toLowerCase().includes(needle.toLowerCase()));
  const shown = options.find(([v]) => v === value)?.[1] ?? "Choose…";
  const row = ([v, l], i) => {
    const chosen = v === value, active = i === 0 && needle;
    const at = needle ? l.toLowerCase().indexOf(needle.toLowerCase()) : -1;
    const text = at < 0 ? esc(l) : `${esc(l.slice(0, at))}<mark class="bg-transparent font-bold text-command">${esc(l.slice(at, at + needle.length))}</mark>${esc(l.slice(at + needle.length))}`;
    return `<button type="button" role="option" tabindex="-1" data-opt="${v}" aria-selected="${chosen}" class="${active ? "flex w-full cursor-pointer items-start gap-2 rounded-md bg-command/15 px-2.5 py-1.5 text-left" : "flex w-full cursor-pointer items-start gap-2 rounded-md px-2.5 py-1.5 text-left"}"><span class="${chosen ? "mt-px w-3.5 shrink-0 text-command" : "invisible mt-px w-3.5 shrink-0"}">${icon("size-3.5", GLYPH.check)}</span><span class="flex min-w-0 grow flex-col gap-0.5"><span class="flex min-w-0 items-center gap-2"><span class="${chosen ? "min-w-0 truncate font-mono text-app-xs font-semibold text-ink" : active ? "min-w-0 truncate font-mono text-app-xs text-ink" : "min-w-0 truncate font-mono text-app-xs text-muted"}">${text}</span></span></span></button>`;
  };
  const panel = open ? `<div class="absolute z-40 flex max-h-80 flex-col overflow-hidden rounded-lg border border-hairline bg-elevated elevated-shadow left-0 top-full mt-1.5 w-max min-w-full max-w-[28rem] enter">${filter ? `<label class="flex shrink-0 items-center gap-2 border-b border-hairline px-3 py-2">${icon("size-3.5 shrink-0 text-dim", GLYPH.search)}<span class="min-w-0 grow font-mono text-app-xs ${needle ? "text-ink" : "text-dim"}">${needle ? esc(needle) : "Filter"}${needle ? '<span class="caret"></span>' : ""}</span></label>` : ""}<div class="flex min-h-0 grow flex-col overflow-y-auto p-1" role="listbox">${listed.map(row).join("")}</div>${filter ? `<div class="flex shrink-0 items-center justify-between gap-3 border-t border-hairline px-3 py-1.5"><span></span><span class="flex items-center gap-1">${["↑↓", "↵", "esc"].map((k) => `<kbd class="rounded border border-b-2 border-hairline bg-subtle px-1 font-mono text-app-3xs text-dim">${k}</kbd>`).join("")}</span></div>` : ""}</div>` : "";
  return `<div class="relative min-w-0"><button type="button" data-drop="${name}" aria-haspopup="listbox" aria-expanded="${open}" class="flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded border border-hairline bg-subtle px-2.5 py-1 text-left font-mono text-app-2xs outline-none transition hover:bg-hover focus:border-accent-cyan/60 disabled:cursor-not-allowed disabled:opacity-60"><span class="grow truncate font-semibold text-ink">${esc(shown)}</span>${icon("size-2.5 shrink-0 text-muted", GLYPH.chevronDown)}</button>${panel}</div>`;
}

function memBrowse() {
  const kinds = [];
  for (const m of MEM.mems) if (!kinds.includes(m.kind)) kinds.push(m.kind);
  const typeChip = (label, count, on, key) => `<button type="button" data-kind="${key}" aria-pressed="${on}" class="${on ? "cursor-pointer rounded border border-accent-cyan/50 bg-accent-cyan/10 px-1.5 py-0.5 font-mono text-app-2xs text-accent-cyan-bright" : "cursor-pointer rounded border border-hairline bg-subtle px-1.5 py-0.5 font-mono text-app-2xs text-muted transition hover:text-ink"}" title="${count} ${label} memories"><span class="flex items-center gap-1.5">${label}<span class="rounded bg-canvas px-1 tabular-nums text-dim">${count}</span></span></button>`;
  const search = `<span id="mem-search" role="searchbox" aria-label="Search memories" class="w-64 max-w-full rounded border bg-canvas px-2 py-1 font-mono text-app-xs ${MEM.query ? "border-accent-cyan/50 text-ink" : "border-hairline text-dim"}">${MEM.query ? `${esc(MEM.query)}<span class="caret"></span>` : "Search memories"}</span>`;
  const bar = `<div class="flex shrink-0 flex-wrap items-center gap-2 border-b border-hairline px-4 py-2">${search}${typeChip("all", MEM.mems.length, !MEM.kind, "")}${kinds.map((k) => typeChip(k.replace("_", " "), MEM.mems.filter((m) => m.kind === k).length, MEM.kind === k, k)).join("")}</div>`;
  const q = MEM.query.trim().toLowerCase();
  const list = MEM.mems.filter((m) => (!MEM.kind || m.kind === MEM.kind) && (!q || [m.title, m.summary, m.content, m.tags.join(" ")].some((t) => t.toLowerCase().includes(q))));
  let main;
  if (!MEM.mems.length) main = '<p class="p-4 text-app-sm text-muted">No memories yet. The agent stores them as it works, or when you ask it to remember something.</p>';
  else if (!list.length) main = '<p class="p-4 text-app-sm text-muted">No memory matches this search.</p>';
  else if (MEM.view === "list") {
    main = `<div class="flex flex-col">${list.slice().sort((a, b) => b.importance - a.importance).map((m) => `<button type="button" data-id="${m.id}" aria-pressed="false" class="flex w-full cursor-pointer flex-col gap-1 border-b border-l-2 border-b-hairline border-l-transparent px-4 py-2.5 text-left transition hover:bg-hover"><span class="flex min-w-0 items-center gap-2"><span class="size-2 shrink-0 rounded-full ${TONES.dot[memTone(m.kind)]}"></span><span class="truncate text-app-sm font-medium text-ink">${esc(m.title)}</span></span><span class="line-clamp-2 text-app-xs text-muted">${esc(m.summary)}</span><span class="flex gap-3 font-mono text-app-2xs text-dim tabular-nums"><span>${m.kind}</span><span>importance ${m.importance.toFixed(1)}</span><span>${dayOf(m.updated)}</span></span></button>`).join("")}</div>`;
  } else if (MEM.view === "graph") {
    const W = 720, H = 520, cx = W / 2, cy = H / 2, ring = Math.max(Math.min(cx, cy) - 90, 60);
    const placed = list.map((m, i) => { const a = (Math.PI * 2 * i) / list.length - Math.PI / 2; return list.length === 1 ? [m, cx, cy] : [m, cx + ring * Math.cos(a), cy + ring * Math.sin(a)]; });
    const at = (id) => placed.find(([m]) => m.id === id);
    let edges = "";
    for (const [a, b, kind] of MEM.links) {
      const A = at(a), B = at(b);
      if (A && B) edges += `<g><line x1="${A[1]}" y1="${A[2]}" x2="${B[1]}" y2="${B[2]}" style="stroke: var(--koda-hairline); stroke-width: 1.5"/><text x="${(A[1] + B[1]) / 2}" y="${(A[2] + B[2]) / 2 - 4}" text-anchor="middle" style="font-family: var(--font-mono); font-size: 10px; fill: var(--koda-dim)">${kind}</text></g>`;
    }
    const nodes = placed.map(([m, x, y]) => { const r = 14 + m.importance * 16, c = MEM_STROKE[memTone(m.kind)]; return `<g data-id="${m.id}" style="cursor: pointer"><circle cx="${x}" cy="${y}" r="${r}" style="fill: var(--koda-panel); stroke: ${c}; stroke-width: 2"/><text x="${x}" y="${y + 4}" text-anchor="middle" style="font-family: var(--font-mono); font-size: 11px; fill: ${c}">${m.importance.toFixed(1)}</text><text x="${x}" y="${y + r + 16}" text-anchor="middle" style="font-size: 12px; fill: var(--koda-ink)">${esc(m.title.slice(0, 28))}</text></g>`; }).join("");
    main = `<div class="p-3">${edges ? "" : '<p class="pb-2 font-mono text-app-2xs text-dim">No links yet. Link memories from the detail pane, or let the agent link a problem to its solution.</p>'}<svg viewBox="0 0 ${W} ${H}" class="h-auto w-full rounded border border-hairline bg-canvas" role="img" aria-label="Memory graph">${edges}${nodes}</svg></div>`;
  } else {
    const days = [];
    for (const m of list.slice().sort((a, b) => b.updated.localeCompare(a.updated))) { const d = dayOf(m.updated); if (days.length && days[days.length - 1][0] === d) days[days.length - 1][1].push(m); else days.push([d, [m]]); }
    main = `<div class="flex flex-col gap-1 px-4 py-3">${days.map(([d, ms]) => `<div class="flex flex-col"><span class="py-2 font-mono text-app-2xs tracking-wider text-dim uppercase">${d}</span>${ms.map((m) => `<button type="button" data-id="${m.id}" class="grid w-full cursor-pointer grid-cols-[48px_12px_minmax(0,1fr)] items-start gap-2 rounded px-1 py-1.5 text-left transition hover:bg-hover"><span class="pt-0.5 font-mono text-app-2xs text-dim tabular-nums">${timeOf(m.updated)}</span><span class="mt-1.5 size-2 rounded-full ${TONES.dot[memTone(m.kind)]}"></span><span class="flex min-w-0 flex-col gap-0.5"><span class="font-mono text-app-2xs text-accent-emerald-bright">${m.version > 1 ? "updated" : "stored"} · ${m.kind}</span><span class="truncate text-app-sm font-medium text-ink">${esc(m.title)}</span><span class="line-clamp-2 text-app-xs text-muted">${esc(m.summary)}</span></span></button>`).join("")}</div>`).join("")}</div>`;
  }
  return `${bar}<div class="min-h-0 grow overflow-y-auto">${main}</div>`;
}

function memDocument() {
  const m = memById(MEM.opened);
  const others = MEM.mems.filter((o) => o.id !== m.id);
  const link = MEM.link || { to: others[0].id, kind: "RELATED_TO" };
  const tags = m.tags.length ? m.tags.join(", ") : "none";
  const field = "block normal-case w-full rounded border border-hairline bg-canvas px-2 py-1 font-mono text-app-xs text-ink outline-none focus:border-accent-cyan/50";
  const labelCls = "flex flex-col gap-1 font-mono text-app-3xs font-bold tracking-wider text-muted uppercase";
  const chipRow = `<div id="koda-memory-actions" role="${MEM.chip ? "dialog" : "group"}" aria-label="Memory actions" class="relative flex flex-wrap items-center gap-1.5"><button type="button" id="mem-link-chip" aria-expanded="${MEM.chip}" aria-label="+ link: to another memory" class="${MEM.chip ? "flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-accent-purple/50 bg-accent-purple/10 px-2.5 py-0.5 font-mono text-app-2xs" : "flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-hairline bg-subtle px-2.5 py-0.5 font-mono text-app-2xs transition hover:border-accent-purple/40"}"><span class="shrink-0 text-dim">+ link</span><span class="max-w-72 truncate text-ink/90">to another memory</span></button><div class="${MEM.chip ? "absolute top-full right-0 left-0 z-50 mt-1.5 flex max-w-[32rem] flex-col gap-2 rounded-lg border border-hairline bg-elevated p-3 elevated-shadow enter" : "hidden"}"><span class="text-app-sm font-medium text-ink">+ link</span><span class="text-app-2xs text-dim">Connect this memory to another one; the agent follows links when it recalls.</span>${memMenu("to", link.to, others.map((o) => [o.id, o.title]), others.length > 8)}${memMenu("kind", link.kind, RELATIONSHIPS.map((k) => [k, k]), true)}<div class="flex gap-1.5">${actionButton("Link", "primary")}</div></div></div>`;
  const head = `<div class="flex shrink-0 flex-col gap-2 border-b border-hairline px-5 pt-3 pb-3"><h2 class="text-app font-semibold text-ink">${esc(m.title)}</h2><span class="text-app-sm text-muted">${esc(m.summary)}</span><div class="flex flex-wrap items-center gap-1.5">${memChip(m.kind, memTone(m.kind))}${memChip(shortId(m.id), "neutral")}${memChip(`v${m.version}`, "neutral")}${memChip(`importance ${m.importance.toFixed(1)}`, "neutral")}${memChip(`tags ${tags}`, "neutral")}</div><span class="font-mono text-app-2xs text-dim">stored ${dayOf(m.created)} ${timeOf(m.created)} · updated ${dayOf(m.updated)} ${timeOf(m.updated)}</span>${chipRow}</div>`;
  let body;
  if (MEM.panel === "edit") {
    const d = MEM.draft;
    body = `<div class="flex flex-col gap-2"><label class="${labelCls}">Title<span id="mem-edit-title" class="${field}">${esc(d.title)}${d.typing === "title" ? '<span class="caret"></span>' : ""}</span></label><label class="${labelCls}">Content<span class="${field} min-h-40 leading-relaxed whitespace-pre-wrap">${esc(d.content)}</span></label><label class="${labelCls}">Tags, comma separated<span class="${field}">${esc(d.tags)}</span></label><label class="${labelCls}">Importance, 0 to 1<span class="${field}">${esc(d.importance)}</span></label></div>`;
  } else if (MEM.panel === "history") {
    body = `<div class="flex flex-col gap-2"><span class="font-mono text-app-3xs font-bold tracking-wider text-muted uppercase">History · ${MEM.versions.length} versions</span>${MEM.versions.map((v) => `<div class="flex flex-col gap-1 rounded border border-hairline bg-canvas p-2"><span class="font-mono text-app-2xs text-dim">v${v.version} · ${dayOf(v.updated)} ${timeOf(v.updated)}</span><span class="text-app-xs font-medium text-ink">${esc(v.title)}</span><pre class="font-mono text-app-2xs whitespace-pre-wrap break-words text-muted">${esc(v.content)}</pre></div>`).join("")}</div>`;
  } else {
    const related = MEM.links.flatMap(([a, b, k]) => (a === m.id ? [[b, k]] : b === m.id ? [[a, `← ${k}`]] : []));
    body = `<pre class="rounded border border-hairline bg-canvas p-3 font-mono text-app-xs leading-relaxed whitespace-pre-wrap break-words text-ink">${esc(m.content)}</pre><div class="flex flex-col gap-1"><span class="font-mono text-app-3xs font-bold tracking-wider text-muted uppercase">Linked memories</span>${related.length ? related.map(([id, k]) => `<button type="button" data-rel="${id}" class="flex min-w-0 cursor-pointer items-center gap-2 text-left font-mono text-app-2xs text-ink/80 hover:text-ink"><span class="shrink-0 text-dim">${k}</span><span class="truncate">${esc(memById(id).title)}</span></button>`).join("") : '<span class="font-mono text-app-2xs text-dim">none yet</span>'}</div>`;
  }
  return `${head}<div class="flex min-h-0 grow flex-col gap-3 overflow-y-auto px-5 py-3">${body}</div>`;
}

function memScreen() {
  const avg = MEM.mems.length ? MEM.mems.reduce((a, m) => a + m.importance, 0) / MEM.mems.length : 0;
  const views = `<div class="flex overflow-hidden rounded border border-hairline bg-subtle font-mono text-app-2xs" role="group" aria-label="View">${[["list", "List"], ["graph", "Graph"], ["timeline", "Timeline"]].map(([v, l]) => { const on = MEM.view === v && !MEM.opened; return `<button type="button" data-view="${v}" aria-pressed="${on}" class="${on ? "cursor-pointer border-r border-hairline bg-accent-cyan/10 px-2.5 py-1 text-accent-cyan-bright last:border-r-0" : "cursor-pointer border-r border-hairline px-2.5 py-1 text-muted transition hover:bg-hover hover:text-ink last:border-r-0"}">${l}</button>`; }).join("")}</div>`;
  const header = screenHeader({ glyph: GLYPH.hub, tone: "cyan", title: "Memory", caption: `${MEM.mems.length} memories · ${MEM.links.length} links · avg importance ${avg.toFixed(2)}`, trailing: views, maximized: MEM.maximized });
  let actions;
  if (!MEM.opened) actions = actionButton("Reload", "secondary", GLYPH.reload);
  else if (MEM.panel === "edit") actions = actionButton("Cancel", "secondary") + actionButton("Save", "primary", GLYPH.check);
  else if (MEM.panel === "history") actions = actionButton("Back to the memory", "secondary", GLYPH.chevronLeft);
  else actions = actionButton("All memories", "secondary", GLYPH.chevronLeft) + actionButton(MEM.confirm ? "Press again to delete it and its history" : "Delete", "danger", null, "Delete") + actionButton("History") + actionButton("Edit", "primary");
  const footer = screenFooter(`<span class="truncate" title="${MEMORY_DB}">${MEMORY_DB}</span>`, actions + actionButton("Close", "secondary", GLYPH.close));
  return `<main id="mem-screen" class="flex min-h-0 grow flex-col overflow-hidden bg-canvas">${header}${MEM.opened ? memDocument() : memBrowse()}${footer}</main>`;
}
const memPaint = () => openScreen("memory", memScreen(), { maximized: MEM.maximized });
function memOpen(id) { Object.assign(MEM, { opened: id, panel: "detail", chip: false, link: null, drop: null, needle: "", confirm: false }); }
function memSave(at) {
  const m = memById(MEM.opened), d = MEM.draft;
  const before = { ...m };
  Object.assign(m, { title: d.title, content: d.content, tags: d.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean), importance: Number(d.importance), updated: at, version: m.version + 1 });
  m.history = [before, ...(m.history || [])];
  MEM.panel = "detail";
  MEM.draft = null;
}
const memVersions = (m) => [m, ...(m.history || [])];
// The memories as memory-flow.html leaves them: the solution's title edited once in the Memory screen.
function MEMORIES_EDITED() {
  const mems = MEMORIES(), m = mems[0];
  m.history = [{ ...m }];
  Object.assign(m, { title: EDITED_TITLE, updated: "2026-10-21T15:12:07.604Z", version: 2 });
  return mems;
}
