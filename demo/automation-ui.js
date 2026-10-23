const AU = (() => {
  const INPUT = "w-full min-w-0 rounded border border-hairline bg-canvas px-2 py-1 font-mono text-app-xs text-ink outline-none placeholder:text-dim focus:border-accent-cyan/60";
  const LABEL = "font-mono text-app-3xs tracking-wider text-dim uppercase";
  const WORD = "font-mono text-app-2xs text-dim";
  const SMALL = "flex cursor-pointer items-center gap-1 rounded border border-dashed border-hairline px-2 py-0.5 font-mono text-app-2xs text-muted transition hover:border-accent-cyan/50 hover:text-ink";
  const REMOVE = "shrink-0 cursor-pointer rounded px-1 font-mono text-app-xs text-dim transition hover:bg-hover hover:text-accent-rose";
  const TRIGGER = "flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded border border-hairline bg-subtle px-2.5 py-1 text-left font-mono text-app-2xs outline-none transition hover:bg-hover focus:border-accent-cyan/60";
  const SMALL_BOX = "w-14 rounded border border-hairline bg-canvas px-1.5 py-1 font-mono text-app-xs text-ink outline-none";
  const CHEVRON = ["m6 9 6 6 6-6"];
  const KIND = {
    primary: "border-accent-cyan/45 bg-accent-cyan/10 font-medium text-accent-cyan-bright hover:border-accent-cyan hover:bg-accent-cyan/18",
    secondary: "border-hairline bg-subtle text-ink/80 hover:bg-hover hover:text-ink",
    danger: "border-accent-rose/40 bg-accent-rose/10 text-accent-rose hover:bg-accent-rose/20",
  };
  const ARROW = ["M5 12h14", "m12 5 7 7-7 7"];

  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const attr = (id) => (id ? `id="${id}"` : "");
  const button = (label, kind, glyph, id, disabled) => `<button type="button" ${attr(id)} ${disabled ? "disabled" : ""} class="flex cursor-pointer items-center gap-1.5 rounded border px-3 py-1 text-app-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${KIND[kind]}">${glyph ? icon("size-3.5 shrink-0", glyph) : ""}${label}</button>`;
  const box = (value, placeholder, cls = INPUT, id) => `<div ${attr(id)} class="${cls}${value ? "" : " text-dim"}" style="min-height:26px">${value ? esc(value) : esc(placeholder)}</div>`;
  const menu = (options, chosen) => `<div class="absolute top-full left-0 z-40 mt-1.5 flex max-h-80 w-max min-w-full max-w-[28rem] flex-col overflow-hidden rounded-lg border border-hairline bg-elevated elevated-shadow"><ul class="flex flex-col overflow-y-auto p-1" role="listbox">${options.map((o) => `<li><button type="button" data-option="${esc(o)}" class="flex h-[30px] w-full cursor-pointer items-center gap-2 rounded-md px-2.5 text-left"><span class="${o === chosen ? "w-3.5 shrink-0 text-accent-cyan-bright" : "invisible w-3.5 shrink-0"}">${icon("size-3.5", GLYPH.check)}</span><span class="min-w-0 truncate font-mono text-app-xs ${o === chosen ? "text-accent-cyan-bright" : "text-muted"}">${esc(o)}</span></button></li>`).join("")}</ul></div>`;
  const drop = (value, cls = "", placeholder = "Choose…", id, options) => `<div class="relative min-w-0 ${cls}"><button type="button" ${attr(id)} class="${TRIGGER}"><span class="${value ? "grow truncate font-semibold text-ink" : "grow truncate text-dim"}">${esc(value || placeholder)}</span>${icon("size-2.5 shrink-0 text-muted", CHEVRON)}</button>${options ? menu(options, value) : ""}</div>`;
  const segmented = (options, chosen, cls = "") => `<div role="radiogroup" class="flex gap-0.5 rounded-lg border border-hairline bg-canvas p-0.5 ${cls}">${options.map((o) => `<button type="button" role="radio" data-seg="${o}" class="${o === chosen ? "flex-1 rounded bg-elevated px-2.5 py-1 text-app-2xs text-ink" : "flex-1 rounded px-2.5 py-1 text-app-2xs text-dim transition hover:text-muted"}">${o}</button>`).join("")}</div>`;
  const field = (label, body) => `<div class="flex min-w-0 flex-col gap-1"><span class="${LABEL}">${label}</span>${body}</div>`;
  const step = (n, title, caption, body, id) => `<section ${attr(id)} class="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3"><div class="flex flex-col items-center gap-1"><span class="grid size-6 place-items-center rounded-full border border-hairline font-mono text-app-2xs text-muted">${n}</span><span class="w-px grow bg-hairline"></span></div><div class="flex min-w-0 flex-col gap-3 pb-1"><div class="flex flex-wrap items-baseline gap-x-3 pt-0.5"><h3 class="text-app-sm font-semibold text-ink">${title}</h3><span class="text-app-2xs text-dim">${caption}</span></div>${body}</div></section>`;
  const verdict = (acts, id = "") => (acts ? `<span ${attr(id)} class="enter shrink-0 rounded border border-accent-emerald/40 px-1.5 py-0.5 font-mono text-app-3xs text-accent-emerald-bright">would act</span>` : `<span ${attr(id)} class="enter shrink-0 rounded border border-hairline px-1.5 py-0.5 font-mono text-app-3xs text-dim">would not act</span>`);
  const sched = (s) => (s.every ? `every ${s.every}` : "manual");
  const decides = (s) => (s.model ? `${s.model} on Ollama Local` : "choose a model");

  function header() {
    return `<header class="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-hairline bg-panel px-4"><div class="flex min-w-0 items-center gap-2">${icon("size-4 shrink-0 text-accent-cyan-bright", GLYPH.bolt)}<h1 class="shrink-0 font-mono text-app-xs font-bold text-ink">Automations</h1><span class="truncate text-app-xs text-muted">Watch for something and act on it</span></div></header>`;
  }

  function chip(id, label, value, open, caption, body) {
    const cls = open
      ? "flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-accent-purple/50 bg-accent-purple/10 px-2.5 py-0.5 font-mono text-app-2xs"
      : "flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-hairline bg-subtle px-2.5 py-0.5 font-mono text-app-2xs transition hover:border-accent-purple/40";
    return `<button type="button" id="chip-${id}" class="${cls}"><span class="shrink-0 text-dim">${label}</span><span class="max-w-72 truncate text-ink/90">${esc(value)}</span></button>${open ? `<div class="absolute top-full right-0 left-0 z-50 mt-1.5 flex max-w-[32rem] flex-col gap-2 rounded-lg border border-hairline bg-elevated p-3 elevated-shadow"><span class="text-app-sm font-medium text-ink">${label}</span><span class="text-app-2xs text-dim">${caption}</span>${body}</div>` : ""}`;
  }

  function picker(s) {
    const items = s.list || [];
    const list = items.length && s.picker ? `<div class="absolute top-full right-0 z-50 mt-1.5 flex max-h-[60vh] w-96 max-w-[80vw] flex-col overflow-hidden rounded-lg border border-hairline bg-elevated elevated-shadow"><div class="flex shrink-0 items-center gap-2 border-b border-hairline px-3 py-2">${icon("size-3 shrink-0 text-dim", GLYPH.search)}<span class="min-w-0 grow font-mono text-app-xs text-dim">Search automations</span></div><div class="flex min-h-0 grow flex-col overflow-y-auto py-1">${["This project", "Built-in"].map((g) => `<div class="flex flex-col px-3 pt-2 pb-0.5"><span class="font-mono text-app-3xs tracking-wider text-dim uppercase">${g}</span></div>${items.filter((i) => i.group === g).map((i) => `<button type="button" class="${i.name === s.name ? "flex w-full cursor-pointer flex-col gap-0.5 border-l-2 border-accent-purple bg-accent-purple/10 px-3 py-1.5 text-left" : "flex w-full cursor-pointer flex-col gap-0.5 border-l-2 border-transparent px-3 py-1.5 text-left transition hover:bg-hover"}"><span class="flex items-center gap-1.5 font-mono text-app-xs text-ink"><span class="truncate">${i.name}</span><span class="ml-auto shrink-0 text-app-3xs text-dim">${i.trailing}</span></span><span class="line-clamp-1 text-app-2xs text-dim">${i.detail}</span></button>`).join("")}`).join("")}</div><button type="button" class="flex shrink-0 cursor-pointer items-center gap-2 border-t border-hairline px-3 py-2 text-left font-mono text-app-xs text-accent-purple-bright transition hover:bg-hover">${icon("size-3", GLYPH.plus)}New automation</button></div>` : "";
    return `<div class="relative"><button type="button" id="picker" class="flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 font-mono text-app-xs text-muted transition hover:bg-hover hover:text-ink"><span class="max-w-64 truncate">${esc(s.name || "New automation")}</span>${icon("size-3 shrink-0", CHEVRON)}</button>${list}</div>`;
  }

  function titleBlock(s) {
    const schedBody = `${segmented(["Manual", "Every", "Daily at", "Weekdays at"], s.every ? "Every" : "Manual")}${s.every ? `<div class="w-28">${box(s.every, "30m or 2h")}</div>` : ""}`;
    const decidesBody = `<div class="flex min-w-0 flex-wrap items-center gap-2">${drop("Ollama Local", "w-44 shrink-0")}${drop(s.model, "min-w-48 grow", "Choose a model", "model-drop", s.modelOpen ? ["jev-2:4b", "nimble-v3:3b", "nimble-v3:9b"] : null)}</div>`;
    return `<div class="flex shrink-0 flex-col gap-2 border-b border-hairline px-5 pt-3 pb-3">
      <div class="flex items-center gap-2">
        <span id="f-name" class="min-w-0 grow truncate font-mono text-app font-semibold ${s.name ? "text-ink" : "text-dim"}">${esc(s.name || "auth-change-review")}</span>
        ${s.file ? `<div class="w-40 shrink-0">${segmented(["Pipeline", "Runs"], s.runsTab ? "Runs" : "Pipeline")}</div>` : ""}
        ${picker(s)}
      </div>
      <div id="f-desc" class="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-app-sm ${s.desc ? "text-muted" : "text-dim"}">${esc(s.desc || "What it watches for, in a sentence")}</div>
      <div class="relative flex flex-wrap items-center gap-1.5">
        ${chip("keep", "keep in", "this project", s.chip === "keep", "", "")}
        ${chip("schedule", "schedule", sched(s), s.chip === "schedule", "Schedules run while Koda is open. A run missed while it was closed happens once when it opens.", schedBody)}
        ${chip("decides", "decides with", decides(s), s.chip === "decides", "The model that reads the inputs and answers the questions.", decidesBody)}
      </div>
    </div>`;
  }

  function pipeline(s) {
    const tried = s.tried;
    const inputs = s.inputs.length ? `<div class="grid grid-cols-[8.5rem_8rem_minmax(0,1fr)_7rem_1.25rem] items-center gap-x-2 gap-y-1.5"><span class="${LABEL}">Type</span><span class="${LABEL}">Name</span><span class="${LABEL}">Source</span><span class="${LABEL}">To</span><span></span>
      ${s.inputs.map((i) => `<div class="contents">${drop(i.kind)}${box(i.id, "name")}${box(i.value, i.kind === "command" ? "rg -n TODO src" : "from, like HEAD~1")}${i.kind === "git diff" ? box("", "now") : "<span></span>"}<button type="button" class="${REMOVE}">×</button></div>`).join("")}</div>` : "";
    const q = s.q;
    const question = `<div class="flex flex-col gap-2.5 rounded-md border border-hairline bg-panel p-3"><div class="flex items-center gap-2">${drop("Yes / no", "w-32 shrink-0")}<div class="w-48 shrink-0">${box(q.id, "name")}</div><span class="grow"></span>${tried ? `<span id="tried-said" class="enter font-mono text-app-2xs tabular-nums border-accent-emerald/40 text-accent-emerald-bright">${tried.said}</span>` : ""}<button type="button" class="${REMOVE}">×</button></div>
      ${field("Question", box(q.text, "As you would ask a reviewer"))}
      <div class="grid grid-cols-2 gap-2">${field("Yes means", box(q.yes, "optional"))}${field("No means", box(q.no, "optional"))}</div></div>`;
    const r = s.rule;
    const rule = `<div class="flex flex-col gap-2 rounded-md border ${tried && tried.rule === 0 ? "border-accent-emerald/50" : "border-hairline"} bg-panel p-3"><div class="flex items-start gap-2"><div class="flex min-w-0 grow flex-wrap items-center gap-1.5"><span class="${WORD}">If</span><span class="inline-flex flex-wrap items-center gap-1.5">${drop(q.id, "w-40")}${drop(r.op, "w-32")}<span class="${SMALL_BOX}">${r.value}</span><button type="button" class="${REMOVE}">×</button></span><button type="button" class="${SMALL}">${icon("size-3", GLYPH.plus)}and</button></div>${tried ? verdict(tried.rule === 0) : ""}<button type="button" class="${REMOVE}">×</button></div>
      <div class="flex items-start gap-2 pl-4"><span class="${WORD} pt-1">then</span><div class="min-w-0 grow"><div class="flex flex-col gap-2"><div class="flex flex-wrap items-center gap-2">${drop("start an agent session", "w-48")}${drop("default agent", "w-48")}<label class="flex items-center gap-1.5 font-mono text-app-2xs text-muted"><input type="checkbox" class="koda-check" tabindex="-1">may build (container only)</label></div>${box(r.text, "What the agent should do", `${INPUT} h-14`)}</div></div></div></div>`;
    const o = s.otherwise;
    const otherwise = `<div class="flex items-start gap-2 rounded-md border border-dashed ${tried && tried.rule === null ? "border-accent-emerald/50" : "border-hairline"} p-3"><span class="${WORD} pt-1">Otherwise</span><div class="min-w-0 grow"><div class="flex flex-col gap-2"><div class="flex flex-wrap items-center gap-2">${drop(o.kind, "w-48", "", "otherwise-drop", s.otherwiseOpen ? ["do nothing", "record a note", "start an agent session"] : null)}</div>${o.kind !== "do nothing" ? box(o.text, "The note to record", `${INPUT} h-14`) : ""}</div></div>${tried ? verdict(tried.rule === null, "tried-otherwise") : ""}</div>`;
    return `<div class="flex w-full max-w-3xl flex-col gap-6 px-5 py-4">
      ${step(1, "Read", "What the decision model looks at. Commands are limited to plan mode's read-only ones.", `<div class="flex flex-col gap-2">${inputs}<button type="button" id="add-input" class="${SMALL} self-start">${icon("size-3", GLYPH.plus)}Add input</button></div>`, "s-read")}
      ${step(2, "State", "Write what the model should know, and insert inputs where their text belongs.", `${box(s.state, "", `${INPUT} h-32 whitespace-pre-wrap leading-relaxed`)}<div class="flex flex-wrap items-center gap-1.5">${s.inputs.length ? `<span class="${WORD}">Insert</span>` : ""}${s.inputs.map((i) => `<button type="button" class="cursor-pointer rounded bg-accent-cyan/10 px-1.5 py-0.5 font-mono text-app-2xs text-accent-cyan-bright transition hover:bg-accent-cyan/20">{${esc(i.id)}}</button>`).join("")}${tried ? `<span id="tried-bytes" class="${WORD} ml-auto">${tried.bytes} bytes when last tried</span>` : ""}</div>`, "s-state")}
      ${step(3, "Ask", "Typed questions about the state. Each answer comes back with a probability.", `<div class="flex flex-col gap-2">${question}<button type="button" class="${SMALL} self-start">${icon("size-3", GLYPH.plus)}Add question</button></div>`, "s-ask")}
      ${step(4, "Decide", "Rules are checked in order; the first whose every condition holds acts.", `<div class="flex flex-col gap-2">${rule}${otherwise}<button type="button" class="${SMALL} self-start">${icon("size-3", GLYPH.plus)}Add rule</button></div>`, "s-decide")}
    </div>`;
  }

  function runRow(r) {
    const tone = { emerald: "text-accent-emerald-bright", amber: "text-accent-amber-bright", neutral: "text-muted" }[r.tone];
    return `<div class="${r.fresh ? "enter " : ""}flex flex-col gap-2 rounded-lg border border-hairline bg-panel p-3">
      <div class="flex items-center justify-between gap-3 font-mono text-app-2xs"><span class="text-dim tabular-nums">${r.when}${r.scheduled ? " · scheduled" : ""}</span><span class="${tone}">${r.outcome}</span></div>
      ${r.answer ? `<div class="flex flex-col gap-1 font-mono text-app-2xs"><div class="flex items-baseline justify-between gap-3"><span class="text-muted">healthy</span><span class="text-ink tabular-nums">${r.answer}</span></div></div>` : ""}
      ${r.agent ? `<div class="flex items-center justify-between gap-3"><span class="min-w-0 truncate text-app-sm text-ink">${icon("mr-1 inline size-3.5 text-accent-purple-bright", GLYPH.sparkle)}${esc(r.agent)}</span><button type="button" id="open-session" class="shrink-0 cursor-pointer rounded border border-hairline px-2 py-0.5 font-mono text-app-2xs text-muted transition hover:bg-hover hover:text-ink">Open session</button></div>` : ""}
    </div>`;
  }

  function empty() {
    return `<div class="flex w-full max-w-xl flex-col items-start gap-3 px-5 py-12"><h2 class="text-app font-semibold text-ink">No automations yet</h2><p class="text-app-sm text-muted">An automation reads part of a project, asks a decision model typed questions about it, and acts on the answers: it records a note or starts an agent session. It can run manually or on a schedule.</p>${button("Create an automation", "primary", GLYPH.plus, "create")}</div>`;
  }

  function footer(s) {
    const info = s.pane === "doc" && s.file ? `<span class="truncate">${s.file}</span>` : "<span>Agent actions start in plan mode unless the project runs in a container. Schedules run while Koda is open.</span>";
    const run = s.file ? button(s.running ? "Running…" : "Run now", "secondary", ARROW, "run-now", s.running || s.unsaved) : "";
    const edit = s.pane === "doc" ? `<div class="flex shrink-0 items-center gap-2">${s.unsaved ? '<span class="font-mono text-app-2xs text-accent-amber-bright">Unsaved changes</span>' : ""}${s.file ? button("Delete", "danger") : ""}${button(s.trying ? "Trying…" : "Try it", "secondary", GLYPH.sparkle, "try", s.trying)}${button("Save", "primary", GLYPH.check, "save")}</div>` : "";
    return `<footer class="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-3 border-t border-hairline bg-panel px-4 py-2"><div class="flex min-w-0 items-center gap-2 font-mono text-app-2xs text-muted">${info}</div><div class="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">${run}${edit}${button("Close", "secondary", GLYPH.close)}</div></footer>`;
  }

  function screen(s) {
    const body = s.pane === "empty" ? empty() : s.runsTab ? `<div class="flex w-full max-w-3xl flex-col gap-3 px-5 py-4">${s.runs.map(runRow).join("")}</div>` : pipeline(s);
    return `<div class="flex min-h-0 grow flex-col overflow-hidden bg-canvas">${header()}${s.pane === "doc" ? titleBlock(s) : ""}<div id="body" class="min-h-0 grow overflow-y-auto" style="scroll-behavior:smooth">${body}</div>${footer(s)}</div>`;
  }

  const PROMPT = "The pharma cluster is unhealthy. Find which nodes and pods are failing and why, from their events and logs, and report the cause and how to fix it.";
  const STATE = "The pharma Kubernetes cluster.\n\nNodes:\n{nodes}\n\nPods that are not running:\n{pods}";
  const pharma = () => ({
    name: "pharma-cluster-health",
    desc: "Checks the pharma cluster and starts an agent to investigate when it is unhealthy",
    every: "15m",
    model: "nimble-v3:9b",
    inputs: [
      { kind: "command", id: "nodes", value: "kubectl --context pharma get nodes" },
      { kind: "command", id: "pods", value: "kubectl --context pharma get pods -A --field-selector=status.phase!=Running" },
    ],
    state: STATE,
    q: { id: "healthy", text: "Is the pharma cluster healthy?", yes: "Every node is Ready and no pod is failing or pending.", no: "A node is NotReady, or pods are crashing or stuck." },
    rule: { op: "is below", value: "0.5", text: PROMPT },
    otherwise: { kind: "do nothing", text: "" },
  });

  return { screen, esc, PROMPT, STATE, pharma };
})();
