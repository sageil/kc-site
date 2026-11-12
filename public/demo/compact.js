const esc = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inline = (text) => esc(text)
  .replace(/`([^`]+)`/g, '<code class="rounded bg-subtle px-1 font-mono text-accent-cyan-bright">$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
function markdown(text) {
  const blocks = [];
  for (const block of text.trim().split(/\n\s*\n/)) {
    const lines = block.split("\n");
    if (lines.every((line) => /^\s*[-*] /.test(line))) {
      blocks.push(`<ul class="flex flex-col gap-1 pl-5 list-disc">${lines.map((line) => `<li>${inline(line.replace(/^\s*[-*] /, ""))}</li>`).join("")}</ul>`);
      continue;
    }
    if (lines.every((line) => /^\s*\d+\. /.test(line))) {
      blocks.push(`<ol class="flex flex-col gap-1 pl-5 list-decimal">${lines.map((line) => `<li>${inline(line.replace(/^\s*\d+\. /, ""))}</li>`).join("")}</ol>`);
      continue;
    }
    blocks.push(`<p class="whitespace-pre-wrap">${inline(block)}</p>`);
  }
  return `<div class="flex min-w-0 flex-col gap-2 wrap-anywhere">${blocks.join("")}</div>`;
}

const BAR_ACCENT = '<div class="w-[40ch] max-w-full border-t border-command/70"></div>';
const said = (text, files = [], skills = []) => `<div class="enter group relative flex flex-col gap-2 py-1 pr-9 font-mono text-app-xs">${BAR_ACCENT}<div class="flex items-start gap-2"><span class="shrink-0 font-bold text-command">❯</span><div class="flex min-w-0 flex-col gap-1.5 font-semibold text-ink">${skills.map((name) => `<span class="font-normal text-accent-emerald-bright">✦ ${esc(name)}</span>`).join("")}${text ? markdown(text) : ""}${files.map(([name, size]) => `<span class="font-normal text-muted">+ ${esc(name)} <span class="text-dim tabular-nums">${size}</span></span>`).join("")}</div></div>${BAR_ACCENT}</div>`;
const answer = (text) => `<div class="enter flex flex-col gap-2 py-1 font-mono text-app-xs leading-relaxed text-ink">${BAR_ACCENT}<span class="flex items-center gap-1.5 font-bold text-command">${icon("size-3.5", GLYPH.sparkle)}Koda</span>${markdown(text)}${BAR_ACCENT}</div>`;

const MARKS = {
  read: ["document", "text-accent-indigo-bright", "Read"],
  search: ["search", "text-accent-indigo-bright", "Search"],
  list: ["folder", "text-accent-indigo-bright", "List"],
  graph: ["hub", "text-accent-purple-bright", "Graph"],
  skill: ["puzzle", "text-accent-purple-bright", "Skill"],
  recall: ["history", "text-accent-purple-bright", "Recall"],
  memory: ["bookOpen", "text-accent-purple-bright"],
  shell: ["terminal", "text-accent-cyan-bright", "$"],
  edit: ["pencil", "text-accent-amber-bright"],
  delegate: ["delegate", "text-accent-purple-bright", "Delegate"],
  mcp: ["plug", "text-accent-cyan-bright"],
  web: ["globe", "text-accent-cyan-bright"],
  ask: ["question", "text-accent-amber-bright"],
  plan: ["checklist", "text-accent-indigo-bright"],
  goal: ["target", "text-accent-emerald-bright"],
  diff: ["diff", "text-accent-cyan-bright"],
  research: ["searchFile", "text-accent-indigo-bright"],
  poll: ["activity", "text-accent-cyan-bright"],
  sessions: ["conversations", "text-accent-indigo-bright"],
  tool: ["code", "text-muted"],
};
function call({ kind = "tool", verb, detail = "", took, status, body, open }) {
  const [glyph, tint, fallback] = MARKS[kind];
  const failed = status === "failed" ? "[failed]" : status?.startsWith?.("exit") ? `[${status}]` : status === "interrupted" ? "[interrupted]" : status === "invalid" ? "[invalid]" : null;
  const [g, t] = failed ? ["close", "text-accent-rose"] : status === "approval" ? ["shield", "text-accent-amber-bright"] : [glyph, tint];
  const waiting = status === "approval" ? "awaiting approval" : status === "running" ? "running" : null;
  const shown = body && (open ?? kind === "edit");
  return `<div class="enter scroll-mt-3"><div class="flex w-full min-w-0 items-center gap-2 py-px text-left font-mono text-app-xs leading-relaxed"${body ? ` aria-expanded="${shown}"` : ""}>`
    + `<span class="shrink-0 ${t}${status === "running" ? " animate-pulse" : ""}">${icon("size-3.5", GLYPH[g])}</span>`
    + `<span class="shrink-0 font-semibold ${failed ? "text-accent-rose" : "text-ink"}">${esc(verb ?? fallback ?? kind)}</span>`
    + (detail ? `<span class="min-w-0 truncate text-ink/80" title="${esc(detail)}">${esc(detail)}</span>` : "")
    + (took ? `<span class="shrink-0 pl-1 text-dim tabular-nums">${took}</span>` : "")
    + (failed ? `<span class="shrink-0 text-accent-rose">${failed}</span>` : "")
    + (waiting ? `<span class="shrink-0 pl-1 text-accent-amber-bright">${waiting}</span>` : "")
    + `</div>${shown ? `<div class="my-0.5 ml-[6px] flex flex-col gap-1 border-l border-dim/60 pl-3 font-mono text-app-xs">${body}</div>` : ""}</div>`;
}
const calls = (rows) => `<div class="flex flex-col py-1">${rows.join("")}</div>`;
const TONE = { "+": "text-accent-emerald-bright", "-": "text-accent-rose", "@": "text-dim", " ": "text-muted" };
const output = (lines) => `<div class="flex flex-col gap-1 border-t border-hairline bg-canvas p-3 font-mono text-code text-muted">${lines.map((line) => {
  const tone = TONE[line[0]];
  return `<div class="flex flex-wrap items-baseline gap-x-1"><span class="whitespace-pre-wrap break-all ${tone || "text-muted"}">${esc(line)}</span></div>`;
}).join("")}</div>`;
const editBody = (path, lines) => `<span class="font-semibold text-ink">${esc(path)}</span>${output(lines)}`;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
function footer(took, { calls: n = 0, read = 0, edited = 0, added = 0, removed = 0 } = {}) {
  const parts = [took];
  if (n) parts.push(plural(n, "call", "calls"));
  if (read) parts.push(`read ${plural(read, "file", "files")}`);
  if (edited) parts.push(`edited ${plural(edited, "file", "files")} +${added} −${removed}`);
  return `<p class="enter pt-1 font-mono text-app-2xs text-dim">─ ${parts.join(" · ")}</p>`;
}

// The `memory` tool's compact row (stream/cards.rs memory_title): what the app writes for each command.
function memoryCall({ command, title, query, memory_id, from_id, relationship, to_id, took, body, open }) {
  const q = (t) => (t ? `“${t}”` : "");
  const short = (id) => id.slice(0, 8);
  const target = () => {
    const detail = query || title ? q(query || title) : from_id && relationship && to_id ? `${short(from_id)} ${relationship} ${short(to_id)}` : memory_id ? short(memory_id) : "";
    return detail ? `${command} ${detail}` : command;
  };
  const [verb, detail] = {
    store: ["Remembered", q(title)], update: ["Updated a memory", q(title)], delete: ["Forgot a memory", ""],
    recall: ["Recalled memories", q(query)], search: ["Recalled memories", q(query)],
    link: ["Linked memories", target()], get: ["Read a memory", ""], related: ["Read a memory", ""],
  }[command] || ["Memory:", target()];
  return call({ kind: "memory", verb, detail, took, body, open });
}
const sessionsCall = ({ query, session_id, took, body, open }) =>
  call({ kind: "sessions", verb: session_id ? "Read a session" : query ? "Searched sessions for" : "Listed recent sessions", detail: !session_id && query ? `“${query}”` : "", took, body, open });

// The session strip (stream/view.rs SessionStrip); `saved` adds the Saved figure and its hover card.
const tokFig = (n) => (n < 1000 ? String(n) : `${(n / 1000).toFixed(1)}k`);
const grouped = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
function sessionStrip({ title, turn, session, saved, hit, open = false }) {
  const savedHtml = saved ? `<span class="text-dim">·</span><div class="group relative"><button type="button" id="strip-saved" aria-label="Tokens saved" class="flex cursor-default items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-hover"><strong class="text-ink">${tokFig(saved.shell + saved.older)}</strong> saved</button><div class="absolute top-full right-0 z-50 ${open ? "block" : "hidden"} pt-1.5 group-hover:block group-focus-within:block"><div role="group" aria-label="Tokens saved" class="flex w-72 flex-col gap-1.5 rounded-md border border-hairline bg-panel p-3 shadow-xl shadow-black/40"><div class="flex items-center justify-between"><span class="font-sans">Shell output</span><span class="tabular-nums text-ink/80">${grouped(saved.shell)} tok</span></div><div class="flex items-center justify-between"><span class="font-sans">Older results</span><span class="tabular-nums text-ink/80">${grouped(saved.older)} tok</span></div><div class="flex items-center justify-between border-t border-hairline pt-2 text-ink"><span class="font-sans font-medium">Saved</span><span class="tabular-nums">${grouped(saved.shell + saved.older)} tok (${((saved.shell + saved.older) * 100 / (saved.input + saved.shell + saved.older)).toFixed(1)}%)</span></div><button type="button" class="mt-1 cursor-pointer self-start font-sans text-app-2xs text-accent-cyan-bright hover:underline">Open metrics</button></div></div></div>` : "";
  return `<div id="strip" class="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-hairline bg-panel px-4"><div class="flex min-w-0 items-center gap-2"><span class="truncate font-sans text-app-xs text-muted" title="${esc(title)}">${esc(title)}</span></div><div class="flex shrink-0 items-center gap-3 font-mono text-app-xs text-muted"><div class="group relative"><button type="button" aria-label="Token usage" class="flex cursor-default items-center gap-1.5 rounded px-1.5 py-0.5 transition hover:bg-hover"><span>Turn <strong class="text-accent-cyan-bright">${tokFig(turn)}</strong></span><span class="text-dim">/</span><span>Session <strong class="text-accent-cyan-bright">${tokFig(session)} tok</strong></span></button></div>${savedHtml}${hit ? `<span class="text-dim">·</span><span>Cache hit <strong class="text-ink">${hit}</strong></span>` : ""}</div></div>`;
}

// The prompt box (stream/dock.rs DirectiveDock).
const PLACEHOLDER = "Message the agent · / for commands · @ for agents · $ for skills · ↵ to send";
const RUNS_ON = { host: ["amber", "Host · asks first"], hostApply: ["rose", "Host · applies directly"], docker: ["cyan", "Docker · rust · applies directly"] };
function dock({ text = "", caret = false, working = false, title, activity, elapsed, skills = [], popover = "", runsOn = "host", steering = [], queued = [], files = [], secrets = [] } = {}) {
  const [tone, place] = RUNS_ON[runsOn] || runsOn;
  const kbd = (k) => `<kbd class="rounded border border-hairline bg-canvas px-1 py-0.5 font-mono text-app-2xs text-muted">${k}</kbd>`;
  const hints = working ? [["↵", "Steer"], ["⇧⌘↵", "Queue"], ["Esc", "Cancel"]] : [["↵", "Send"], ["Esc", "Cancel"]];
  const line = title ? `<div class="flex min-w-0 items-center gap-1.5 px-1 pb-1.5 font-mono text-app-2xs whitespace-nowrap text-dim"><span class="shrink-0 text-hairline">──</span>${working && activity ? `<span class="size-2.5 shrink-0 animate-spin rounded-full border-[1.5px] border-hairline border-t-command"></span><span class="min-w-0 truncate text-ink/90" title="${esc(activity)}">${esc(activity)}</span>` : ""}${working && elapsed ? `<span class="shrink-0 tabular-nums">· ${elapsed}</span>` : ""}<span class="min-w-6 flex-1 border-t border-hairline"></span><span class="max-w-64 truncate text-accent-amber-bright" title="${esc(title)}">${esc(title)}</span><span class="shrink-0 text-hairline">─</span></div>` : "";
  const later = steering.length || queued.length ? `<div class="flex flex-col gap-0.5 px-1 pb-1.5 font-mono text-app-2xs text-dim">${steering.map((t) => `<div class="truncate"><span class="text-accent-indigo-bright">After this step: </span>${esc(t)}</div>`).join("")}${queued.map((t) => `<div class="truncate"><span class="text-muted">After this turn: </span>${esc(t)}</div>`).join("")}</div>` : "";
  const chipsRow = files.length || secrets.length ? `<div class="flex flex-wrap items-center gap-1.5 px-1 pb-1.5">${files.map(([name, size]) => `<span class="flex items-center gap-1 rounded border border-hairline bg-subtle py-0.5 pr-1 pl-2 font-mono text-app-2xs text-muted" title="Included in the message">${icon("size-3 shrink-0", GLYPH.document)}<span class="max-w-48 truncate text-ink/90">${esc(name)}</span><span class="text-dim tabular-nums">${size}</span><button type="button" aria-label="Remove ${esc(name)}" class="cursor-pointer rounded px-0.5 text-dim transition hover:bg-hover hover:text-ink">×</button></span>`).join("")}${secrets.map((n, i) => `<span class="flex items-center gap-1 rounded border border-hairline bg-subtle py-0.5 pr-1 pl-2 font-mono text-app-2xs text-muted" title="Sent as a «secret:N» placeholder; Koda fills it in on this machine">${icon("size-3 shrink-0 text-accent-emerald-bright", GLYPH.shield)}<span class="text-ink/90">[secret ${i + 1}]</span><span class="text-dim tabular-nums">${n} chars</span><button type="button" aria-label="Remove [secret ${i + 1}]" class="cursor-pointer rounded px-0.5 text-dim transition hover:bg-hover hover:text-ink">×</button></span>`).join("")}</div>` : "";
  const skillRow = skills.length ? `<div class="flex flex-wrap items-center gap-1.5 px-1 pb-1.5">${skills.map((name) => `<span title="This skill's SKILL.md is attached to the next message" class="inline-flex items-center gap-1 rounded border border-accent-emerald/40 bg-accent-emerald/10 py-0.5 pr-0.5 pl-1.5 font-mono text-app-2xs text-accent-emerald-bright">✦ ${esc(name)}<button type="button" aria-label="Remove the ${esc(name)} skill" class="cursor-pointer rounded px-1 text-accent-emerald-bright/80 transition hover:bg-hover hover:text-ink">×</button></span>`).join("")}<span class="font-mono text-app-3xs text-dim">attached to the next message</span></div>` : "";
  const box = `flex w-full flex-col rounded-lg border border-hairline bg-panel/95 p-2 elevated-shadow backdrop-blur-xl transition focus-within:border-accent-indigo/50${working ? " koda-border border-mode-static" : ""}${skills.length ? " border-accent-emerald/50 ring-1 ring-accent-emerald/20" : ""}`;
  const lead = working ? `<span class="koda-star relative inline-flex shrink-0 items-center justify-center size-4 shrink-0"><svg class="animate-sparkle-pulse block size-full" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="${GLYPH.sparkle[0]}"/><path d="${GLYPH.sparkle[1]}"/></svg></span>` : icon("size-4 shrink-0 text-accent-indigo-bright", GLYPH.sparkle);
  const small = "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded text-dim transition hover:bg-hover";
  return `<div id="dock" class="shrink-0 bg-canvas px-3 pt-2 pb-3" tabindex="-1" aria-label="Directive dock"><div class="mx-auto w-full max-w-3xl"><div id="dock-box" class="${box}">${line}${later}${chipsRow}${skillRow}<div class="relative flex items-start gap-2 px-1">${lead}${popover}<div id="prompt" class="max-h-72 min-w-0 grow overflow-y-auto bg-transparent py-1 text-app-xs leading-relaxed whitespace-pre-wrap break-words ${text ? "text-ink" : "text-dim"}" style="min-height:26px">${text ? esc(text) : PLACEHOLDER}${caret ? '<span class="caret"></span>' : ""}</div><button type="button" id="dock-secret" aria-label="Paste as secret" title="Paste as secret: the model sees a placeholder, never the value" class="${small} hover:text-ink">${icon("size-4", GLYPH.shield)}</button><button type="button" id="dock-skill" aria-label="Use a skill" title="Use a skill: attach its instructions to the next message ($)" class="${small} hover:text-accent-emerald-bright">${icon("size-4", GLYPH.sparkle)}</button><button type="button" id="dock-attach" aria-label="Attach files" title="Attach files: text is included in the message, a large file is saved for the agent to read" class="${small} hover:text-ink">${icon("size-4", GLYPH.paperclip)}</button></div><div class="mt-1.5 flex items-center justify-between gap-3 border-t border-hairline-soft px-1 pt-1.5 text-app-2xs text-dim"><div class="relative"><button type="button" aria-label="Where this project runs" aria-expanded="false" title="Where this project's commands run, and whether its edits wait for you" class="flex max-w-[260px] cursor-pointer items-center gap-1.5 rounded border px-2 py-0.5 font-mono transition ${TONES.chip[tone]}"><span class="size-1.5 shrink-0 rounded-full ${TONES.dot[tone]}"></span><span class="truncate">${place}</span>${icon("size-2.5 shrink-0", GLYPH.chevronDown)}</button></div><div class="flex shrink-0 items-center gap-2 font-mono">${hints.map(([k, a]) => `<span class="flex items-center gap-1">${kbd(k)}${a}</span>`).join("")}<button type="button" id="send" aria-label="Send" class="flex cursor-pointer items-center gap-1 rounded border border-elevated bg-hover px-2.5 py-1 text-app-xs font-medium text-ink transition hover:bg-elevated">Send${icon("size-3 text-dim", GLYPH.arrowUp)}</button></div></div></div></div></div>`;
}

// The `$` picker over the prompt box (dock.rs mention_list with skill rows).
const skillPicker = (rows, pick = 0) => `<div class="absolute bottom-full left-0 z-40 mb-2 flex max-h-72 w-96 flex-col overflow-y-auto rounded-lg border border-hairline bg-elevated p-1 elevated-shadow enter" role="listbox" aria-label="Mentions">${rows.map(([name, description], i) => `<button type="button" role="option" data-skill="${name}" aria-selected="${i === pick}" class="flex w-full cursor-pointer items-baseline gap-2.5 rounded px-2.5 py-1.5 text-left transition${i === pick ? " bg-hover" : ""}"><span class="shrink-0 font-mono text-app-xs text-accent-emerald-bright">✦ ${esc(name)}</span><span class="min-w-0 grow truncate font-mono text-app-2xs text-dim">${esc(description)}</span><span class="shrink-0 font-mono text-app-3xs tracking-wider text-dim uppercase">skill</span></button>`).join("")}</div>`;

// The session column: strip, transcript and prompt box, as centre.rs lays them out.
const sessionColumn = (strip = "") => `<div id="strip-slot">${strip}</div><div id="above-log"></div><div class="flex min-h-0 grow flex-col overflow-hidden"><div id="scroll" class="h-full overflow-y-auto p-4" aria-label="Transcript"><div id="log" class="mx-auto flex w-full flex-col gap-3"></div></div></div><div id="dock-slot">${dock()}</div>`;
