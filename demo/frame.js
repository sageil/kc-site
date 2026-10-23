const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}, text) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
};
const icon = (cls, paths) =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths.map((d) => `<path d="${d}"/>`).join("")}</svg>`;
const GLYPH = {
  hub: ["M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4", "M4.8 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4", "M19.2 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4", "M12 9v3.5", "m10.4 13.2-4 3", "m13.6 13.2 4 3"],
  search: ["m21 21-4.3-4.3", "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"],
  close: ["M18 6 6 18", "m6 6 12 12"],
  external: ["M15 3h6v6", "M10 14 21 3", "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"],
  chevronLeft: ["m15 19-7-7 7-7"],
  chevronRight: ["m9 5 7 7-7 7"],
  check: ["M20 6 9 17l-5-5"],
  bolt: ["M13 10V3L4 14h7v7l9-11h-7z"],
  sparkle: ["M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z", "M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"],
  plus: ["M5 12h14", "M12 5v14"],
  shield: ["M12 3l7.5 3v5.4c0 4.5-3 8.6-7.5 9.8-4.5-1.2-7.5-5.3-7.5-9.8V6z", "m9.2 12 2 2 3.6-3.8"],
};
const POINTER = '<svg class="pointer" id="pointer" viewBox="0 0 24 24" style="left:640px;top:820px"><path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.4-6.6L4 20z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';

let run = 0;
const alive = (id) => { if (id !== run) throw new Error("restarted"); };
function loop(play) {
  const start = () => {
    const id = ++run;
    play(id).then(() => start()).catch((e) => { if (e.message !== "restarted") throw e; });
  };
  return start;
}
async function pointTo(el, id, dx = 0.5, dy = 0.5) {
  const p = $("pointer"), stage = $("stage").getBoundingClientRect(), box = el.getBoundingClientRect();
  const scale = stage.width / 1280;
  p.style.left = `${(box.left - stage.left + box.width * dx) / scale}px`;
  p.style.top = `${(box.top - stage.top + box.height * dy) / scale}px`;
  await sleep(650);
  alive(id);
}
async function click(el, id) {
  await pointTo(el, id);
  el.classList.add("press");
  await sleep(160);
  el.classList.remove("press");
  alive(id);
}
function fitStage(height = 780) {
  const fit = () => {
    const scale = Math.min((innerWidth - 24) / 1280, (innerHeight - 24) / height, 1);
    $("stage").style.transform = `scale(${scale})`;
  };
  addEventListener("resize", fit);
  fit();
  followTheme(new URLSearchParams(location.search).get("theme"));
}
function followTheme(theme) {
  const root = document.documentElement;
  if (theme !== "follow") {
    if (theme) root.dataset.theme = theme;
    return;
  }
  try {
    root.dataset.theme = parent.document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  } catch {}
  addEventListener("message", (e) => {
    if (e.origin === location.origin && (e.data?.theme === "dark" || e.data?.theme === "light")) root.dataset.theme = e.data.theme;
  });
}
