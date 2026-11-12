// Preferences, pickers and setting chips for the agents, models and crew demos (crates/koda-ui/src/ui/menu.rs, ui/layer.rs, ui/controls.rs, workspace/settings/mod.rs).
const PF_PANEL = "absolute z-40 flex max-h-80 flex-col overflow-hidden rounded-lg border border-hairline bg-elevated elevated-shadow";
const PF_PICKER = "flex cursor-pointer items-center gap-2 rounded-md border border-hairline bg-subtle px-2.5 py-1.5 font-mono text-app-xs text-ink transition hover:bg-hover";
const PF_DROP = "flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded border border-hairline bg-subtle px-2.5 py-1 text-left font-mono text-app-2xs outline-none transition hover:bg-hover focus:border-accent-cyan/60 disabled:cursor-not-allowed disabled:opacity-50";
const PF_CONFIG = "~/.config/kc/config.toml";
const PF_KEYS = `<span class="flex items-center gap-1">${["↑↓", "↵", "esc"].map((k) => `<kbd class="rounded border border-b-2 border-hairline bg-subtle px-1 font-mono text-app-3xs text-dim">${k}</kbd>`).join("")}</span>`;

// One row of a Menu (menu.rs MenuRow). `item`: { key, label, badge, trailing, description, chosen, disabled }.
function pfRow(item, active, attr) {
  const row = item.disabled ? "flex w-full cursor-default items-start gap-2 rounded-md px-2.5 py-1.5 text-left opacity-50"
    : active ? "flex w-full cursor-pointer items-start gap-2 rounded-md bg-command/15 px-2.5 py-1.5 text-left"
    : "flex w-full cursor-pointer items-start gap-2 rounded-md px-2.5 py-1.5 text-left";
  const text = item.chosen ? "min-w-0 truncate font-mono text-app-xs font-semibold text-ink" : active ? "min-w-0 truncate font-mono text-app-xs text-ink" : "min-w-0 truncate font-mono text-app-xs text-muted";
  return `<button type="button" role="option" tabindex="-1" ${attr}="${esc(item.key)}"${item.disabled ? " disabled" : ""} aria-selected="${!!item.chosen}" class="${row}"><span class="${item.chosen ? "mt-px w-3.5 shrink-0 text-command" : "invisible mt-px w-3.5 shrink-0"}">${icon("size-3.5", GLYPH.check)}</span><span class="flex min-w-0 grow flex-col gap-0.5"><span class="flex min-w-0 items-center gap-2"><span class="${text}">${esc(item.label)}</span>${item.badge ? `<span class="shrink-0 font-mono text-app-3xs tracking-wider text-dim uppercase">${esc(item.badge)}</span>` : ""}${item.trailing ? `<span class="ml-auto flex shrink-0 items-center gap-1"><span class="font-mono text-app-3xs text-dim">${esc(item.trailing)}</span></span>` : ""}</span>${item.description ? `<span class="line-clamp-1 text-app-2xs text-dim">${esc(item.description)}</span>` : ""}</span></button>`;
}

// The open panel of a Menu: optional search, grouped rows, optional footer and key hints.
function pfPanel({ items, groups = [], search, footer, keys = false, end = false, width = "w-max min-w-full max-w-[28rem]", active, attr = "data-opt" }) {
  let last = null, rows = "";
  for (const item of items) {
    if (item.group && item.group !== last) {
      const g = groups.find(([name]) => name === item.group);
      rows += `<div class="flex flex-col px-2.5 pt-2 pb-1"><span class="flex justify-between font-mono text-app-3xs tracking-wider text-dim uppercase"><span>${esc(item.group)}</span></span>${g && g[1] ? `<span class="text-app-3xs text-dim">${esc(g[1])}</span>` : ""}</div>`;
    }
    last = item.group;
    rows += pfRow(item, item.key === active, attr);
  }
  const head = search ? `<label class="flex shrink-0 items-center gap-2 border-b border-hairline px-3 py-2">${icon("size-3.5 shrink-0 text-dim", GLYPH.search)}<span class="min-w-0 grow bg-transparent font-mono text-app-xs text-dim">${esc(search)}</span></label>` : "";
  const foot = footer || keys ? `<div class="flex shrink-0 items-center justify-between gap-3 border-t border-hairline px-3 py-1.5">${footer ? `<button type="button" class="flex cursor-pointer items-center gap-2 font-mono text-app-xs text-command transition hover:text-ink">${icon("size-3", GLYPH.plus)}${esc(footer)}</button>` : "<span></span>"}${keys ? PF_KEYS : ""}</div>` : "";
  return `<div class="${PF_PANEL} ${end ? "right-0" : "left-0"} top-full mt-1.5 ${width} enter">${head}<div class="flex min-h-0 grow flex-col overflow-y-auto p-1" role="listbox">${rows}</div>${foot}</div>`;
}

// TitlePicker (layer.rs): the trigger and, when open, its menu.
const pfTitle = (id, current, panel = "") => `<div class="relative min-w-0 "><button type="button" id="${id}" aria-haspopup="listbox" aria-expanded="${!!panel}" class="${PF_PICKER}"><span class="max-w-64 truncate">${esc(current)}</span>${icon("size-3 shrink-0 text-muted", GLYPH.chevronDown)}</button>${panel}</div>`;

// Dropdown (controls.rs): `options` are [value, label]; the first option labels an empty value.
function pfDrop(id, value, options, { cls = "", open = false, filter = false, active, placeholder = "Choose…" } = {}) {
  const shown = options.find(([v]) => v === value)?.[1];
  const panel = open ? pfPanel({ items: options.map(([v, l]) => ({ key: v || "-", label: l, chosen: v === value })), search: filter ? "Filter" : null, keys: filter, active }) : "";
  return `<div class="relative min-w-0 ${cls}"><button type="button" id="${id}" aria-haspopup="listbox" aria-expanded="${open}" class="${PF_DROP}"><span class="${shown != null ? "grow truncate font-semibold text-ink" : "grow truncate text-dim"}">${esc(shown ?? placeholder)}</span>${icon("size-2.5 shrink-0 text-muted", GLYPH.chevronDown)}</button>${panel}</div>`;
}

// SettingChip inside a ChipRow (layer.rs).
const pfChip = (id, label, value, caption, open, body = "") => `<button type="button" id="chip-${id}" aria-expanded="${open}" aria-label="${esc(label)}: ${esc(value)}" class="${open ? "flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-accent-purple/50 bg-accent-purple/10 px-2.5 py-0.5 font-mono text-app-2xs" : "flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-hairline bg-subtle px-2.5 py-0.5 font-mono text-app-2xs transition hover:border-accent-purple/40"}"><span class="shrink-0 text-dim">${esc(label)}</span><span class="max-w-72 truncate text-ink/90">${esc(value)}</span></button><div class="${open ? "absolute top-full right-0 left-0 z-50 mt-1.5 flex max-w-[32rem] flex-col gap-2 rounded-lg border border-hairline bg-elevated p-3 elevated-shadow enter" : "hidden"}"><span class="text-app-sm font-medium text-ink">${esc(label)}</span><span class="text-app-2xs text-dim">${esc(caption)}</span>${open ? body : ""}</div>`;
const pfChipRow = (id, label, open, chips) => `<div id="${id}" role="${open ? "dialog" : "group"}" aria-label="${label}" class="relative flex flex-wrap items-center gap-1.5">${chips}</div>`;

// Segmented (layer.rs).
const pfSeg = (options, chosen) => `<div class="flex gap-0.5 rounded-lg border border-hairline bg-canvas p-0.5" role="radiogroup">${options.map((o) => `<button type="button" role="radio" aria-checked="${o === chosen}" class="${o === chosen ? "flex-1 rounded bg-command/15 ring-1 ring-inset ring-command/40 px-2.5 py-1 text-app-2xs text-ink" : "flex-1 rounded px-2.5 py-1 text-app-2xs text-dim transition hover:text-muted"}">${o}</button>`).join("")}</div>`;

// SettingsScreen (settings/mod.rs): the Preferences header and page picker; `body` fills the rest.
function pfPrefs(current, body, { open = "", fill = true } = {}) {
  return `<div class="${fill ? "flex min-h-0 grow flex-col overflow-hidden bg-canvas" : "flex shrink-0 flex-col bg-canvas"}" aria-label="Preferences">${screenHeader({ glyph: GLYPH.settings, tone: "cyan", title: "Preferences", caption: PF_CONFIG })}<div class="flex shrink-0 flex-wrap items-center gap-2 border-b border-hairline px-5 py-2.5">${pfTitle("pf-page", current, open)}<label class="ml-auto flex w-72 max-w-full items-center gap-2 rounded border border-hairline bg-canvas px-2 py-1.5">${icon("size-3.5 shrink-0 text-dim", GLYPH.search)}<span class="min-w-0 grow bg-transparent font-mono text-app-xs text-dim">Search all settings</span></label></div>${fill ? body : ""}</div>${fill ? "" : body}`;
}

// Appends to #log, keeping consecutive tool rows in one group as the app does.
const PF_GROUP = '<div class="flex flex-col py-1">';
function pfAdd(html) {
  const last = $("log").lastElementChild;
  if (html.startsWith(PF_GROUP) && last?.dataset.calls) last.insertAdjacentHTML("beforeend", html.slice(PF_GROUP.length, -6));
  else $("log").insertAdjacentHTML("beforeend", html.startsWith(PF_GROUP) ? html.replace(PF_GROUP, '<div data-calls="1" class="flex flex-col py-1">') : html);
  $("scroll").scrollTop = $("scroll").scrollHeight;
}

// The Agents screen (workspace/agents/screen.rs) for acme-api: three project agents, one global, the built-ins and the review parts.
const PF_GP = "General-purpose agent for researching complex questions, searching for files and content, and executing multi-step tasks. When you are searching for a keyword or file and are not confident that you will find the right match in the first few tries use this agent to perform the search for you. This agent has access to all tools as the main agent.";
const PF_AGENTS = () => [
  { group: "This project", name: "explorer", description: "Maps the code before anyone edits it: callers, tests, where a change lands. Use before a change that touches more than one file.", tools: ["read_file", "query_code_graph", "shell"], role: "subagent", prompt: "You map the code before anyone edits it.\n\nFind the callers, the tests and the places a change would land with query_code_graph and read_file. Change nothing.\n\nReport them as a short list, with file:line for each." },
  { group: "This project", name: "test-writer", description: "Writes the tests a change needs and runs them. Use after an edit that changes behaviour.", tools: ["read_file", "query_code_graph", "shell", "edit_file", "write_file"], role: "subagent", prompt: "You write the tests a change needs.\n\nRead the change and the code it touches. Find the behaviour that no test pins yet. Write the smallest tests that pin it, and run them.\n\nReport each test you added, what it pins, and the result of the run." },
  { group: "This project", name: "reviewer", description: "Reviews a branch and reports findings, most severe first. Use when a change is ready.", tools: ["read_file", "query_code_graph", "shell"], role: "subagent", prompt: "You review a branch against main.\n\nRead the diff, then the code around each change. Report findings most severe first, each with its file and line, what breaks and how to fix it.\n\nSay plainly when there is nothing to report." },
  { group: "Global", name: "docs-writer", description: "Updates the README and docs for a change. Use after a change that alters behaviour users see.", tools: ["read_file", "edit_file", "write_file"], role: "subagent" },
  { group: "Built-in", name: "build", description: "The default agent: does the work the user asks for.", badge: "built-in", role: "session agent" },
  { group: "Built-in", name: "plan", description: "Plan mode: read-only questions, investigation and reviews, and plans for changes.", badge: "built-in", role: "session agent" },
  { group: "Built-in", name: "general-purpose", description: PF_GP, badge: "built-in", role: "subagent" },
  { group: "Built-in", name: "researcher", description: "Answers defined research questions from the web and the repository with cited evidence, starting from nothing but its prompt. Use one per independent sub-question, several in parallel, and state each question and what to return.", badge: "built-in", role: "subagent" },
  { group: "Review", name: "review-context", description: "Reads the project once and writes the brief every review part shares: untrusted input, security patterns and conventions.", badge: "built-in" },
  { group: "Review", name: "review-security", description: "Finds vulnerabilities the change introduces, one class at a time, and sorts the dependency and secret scanners' hits.", badge: "built-in" },
  { group: "Review", name: "review-quality", description: "Finds correctness and maintainability problems the change introduces.", badge: "built-in" },
  { group: "Review", name: "review-practices", description: "Finds departures from the language's and framework's best practices.", badge: "built-in" },
  { group: "Review", name: "review-custom", description: "Checks the change against the rules in .koda/review-rules.md, AGENTS.md and CLAUDE.md, and only those.", badge: "built-in" },
  { group: "Review", name: "review-challenge", description: "Tries to prove each finding wrong; findings scored under the threshold are dropped.", badge: "built-in" },
];
const PF_AGENT_GROUPS = [["This project"], ["Global"], ["Built-in"], ["Review", "/review runs these; /review-security, -quality, -practices and -rules run one reviewer between context and challenge"]];
const PF_PROVIDERS = [["", "Same as the session"], ["anthropic", "Anthropic"], ["chatgpt", "ChatGPT"], ["ollama", "Ollama Local"]];
const PF_LISTED = { chatgpt: [["gpt-5", "gpt-5"], ["gpt-5-codex", "gpt-5-codex"], ["gpt-5-mini", "gpt-5-mini"]], anthropic: [["claude-sonnet-5-5", "claude-sonnet-5-5"], ["claude-opus-5-5", "claude-opus-5-5"], ["claude-haiku-5-5", "claude-haiku-5-5"]] };
const PF_INPUT = "w-full rounded-md border border-hairline bg-subtle px-2.5 py-1.5 text-app-sm text-ink outline-none placeholder:text-dim focus:border-accent-purple/60";
const pfModelLabel = (a) => (a.model ? a.model[1] : "same as the session");

// `v`: { agents, picked, list, chip, drop, active }. Each agent may carry `model: [provider, model]`.
function pfAgentsScreen(v) {
  const agents = v.agents;
  const picker = (current, end) => pfTitle("agent-picker", current, v.list ? pfPanel({ items: agents.map((a) => ({ group: a.group, key: a.name, label: `@${a.name}`, badge: a.badge, trailing: pfModelLabel(a), description: a.description, chosen: a.name === v.picked })), groups: PF_AGENT_GROUPS, search: "Search agents", footer: "New agent", keys: true, end, width: "w-96 max-w-[80vw]", active: v.active, attr: "data-agent" }) : "");
  const counts = `${agents.filter((a) => a.group === "This project").length} in this project · ${agents.filter((a) => a.group === "Global").length} global`;
  const head = `<div class="flex shrink-0 items-start justify-between gap-3 border-b border-hairline px-5 py-4"><div class="flex flex-col gap-1"><h1 class="text-app font-semibold text-ink">Agents</h1><p class="text-app-sm leading-relaxed text-muted">Specialists the main agent can hand work to</p></div><span class="inline-flex h-[22px] shrink-0 items-center gap-1 rounded border px-1.5 font-mono text-app-2xs tracking-[0.06em] uppercase border-hairline bg-subtle text-muted"><span class="truncate">${counts}</span></span></div>`;
  const a = agents.find((x) => x.name === v.picked);
  let body, info = "", actions = "";
  if (!a) {
    body = `<div class="flex shrink-0 items-center gap-2 border-b border-hairline px-5 py-3">${picker("Choose an agent", false)}</div><div class="min-h-0 grow overflow-y-auto"><div class="flex max-w-xl flex-col gap-2 px-5 py-6 text-app-sm text-muted"><p class="font-medium text-ink">Pick an agent, or make a new one.</p><p>The main agent reads each agent's “use when” line and delegates to it on its own. Agents in this project live in .koda/agents and are shared with everyone who works on it; global ones live in /Users/you/.config/kc/agents and are available in all projects. Customise a built-in agent to change its instructions; delete the file to go back to the built-in.</p><p>The review agents run only when you start a review. Override one to change its model, add instructions or give it more read-only tools.</p></div></div>`;
  } else {
    const providerOf = a.model ? a.model[0] : "";
    const modelBody = `<div class="flex flex-wrap items-center gap-2">${pfDrop("agent-provider", providerOf, PF_PROVIDERS, { cls: "w-52", open: v.drop === "provider", active: v.active })}${providerOf ? pfDrop("agent-model", a.model[1], PF_LISTED[providerOf], { cls: "w-72", open: v.drop === "model", active: v.active, placeholder: "Choose a model" }) : ""}</div>`;
    const chips = pfChip("role", "used as", a.role, "A session agent is one you pick to run a session as; a subagent is one the main agent hands work to.", v.chip === "role", pfSeg(["Session agent", "Subagent", "Both"], "Subagent"))
      + pfChip("context", "context", "isolated", "What it starts with when the main agent does not say: isolated sees only the task, forked continues the main conversation.", v.chip === "context", pfSeg(["Isolated", "Forked"], "Isolated"))
      + pfChip("model", "model", a.model && a.model[1] ? a.model[1] : "same as the session", "What it runs on. Same as the session follows whatever the session uses.", v.chip === "model", modelBody)
      + pfChip("tools", "tools", a.tools ? a.tools.join(" · ") : "all of the main agent's", "What it may use. Delegating again is never offered to a sub-agent.", v.chip === "tools", "");
    body = `<div class="flex shrink-0 flex-col gap-2 border-b border-hairline px-5 pt-3 pb-3"><div class="flex items-center gap-2"><span id="agent-name" aria-label="Name" title="How you and the main agent call it: one word, like security-reviewer." class="min-w-0 grow bg-transparent font-mono text-app font-semibold text-ink outline-none">${esc(a.name)}</span>${picker(`@${a.name}`, true)}</div><div id="agent-description" aria-label="Use when" title="The main agent reads this to decide when to delegate." class="w-full resize-none rounded border border-transparent bg-transparent px-1 py-0.5 text-app-sm text-muted outline-none" style="min-height:44px">${esc(a.description)}</div>${pfChipRow("koda-agent-chips", "Agent settings", !!v.chip, chips)}</div><div class="flex min-h-0 grow flex-col gap-1.5 overflow-y-auto px-5 py-3"><div class="flex items-baseline justify-between gap-2"><span class="font-mono text-app-3xs tracking-wider text-dim uppercase">Instructions</span><span class="font-mono text-app-3xs text-dim tabular-nums">${a.prompt.length} characters</span></div><div id="agent-instructions" aria-label="Instructions" class="${PF_INPUT} min-h-40 grow resize-none font-mono text-app-xs leading-relaxed whitespace-pre-wrap">${esc(a.prompt)}</div></div>`;
    info = `<span>/Users/you/dev/acme-api/.koda/agents/${a.name}.md</span>`;
    actions = actionButton("Delete", "danger") + actionButton("Save", "primary", GLYPH.check);
  }
  return `<div class="flex min-h-0 grow flex-col overflow-hidden bg-canvas">${head}${body}${screenFooter(info, actions + actionButton("Close", "secondary", GLYPH.close))}</div>`;
}
const pfAgentsPaint = (v) => openScreen("settings", pfPrefs("Agents", pfAgentsScreen(v), { fill: false }));
