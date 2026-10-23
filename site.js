const NS = "http://www.w3.org/2000/svg";
const shapes = [
  ["rect", { x: 0, y: 0, width: 1280, height: 780, rx: 12 }],
  ["line", { x1: 0, y1: 28, x2: 1280, y2: 28 }],
  ["line", { x1: 0, y1: 72, x2: 1280, y2: 72 }],
  ["line", { x1: 0, y1: 756, x2: 1280, y2: 756 }],
  ["line", { x1: 230, y1: 72, x2: 230, y2: 756 }],
  ["line", { x1: 980, y1: 72, x2: 980, y2: 756 }],
  ["line", { x1: 230, y1: 112, x2: 980, y2: 112 }],
  ["rect", { x: 260, y: 130, width: 690, height: 52, rx: 8 }],
  ["rect", { x: 260, y: 196, width: 690, height: 120, rx: 8 }],
  ["rect", { x: 260, y: 330, width: 690, height: 90, rx: 8 }],
  ["rect", { x: 290, y: 650, width: 630, height: 92, rx: 8 }],
  ["line", { x1: 980, y1: 230, x2: 1280, y2: 230 }],
  ["line", { x1: 980, y1: 330, x2: 1280, y2: 330 }],
  ["line", { x1: 0, y1: 108, x2: 230, y2: 108 }],
];
const dims = [
  { d: "M-36 28V72M-42 28H-30M-42 72H-30", t: [-60, 55, "44"], a: "end" },
  { d: "M0 -36H230M0 -42V-30M230 -42V-30", t: [115, -48, "230 · tree"] },
  { d: "M980 -36H1280M980 -42V-30M1280 -42V-30", t: [1130, -48, "300 · inspector"] },
  { d: "M1316 756V780M1310 756H1322M1310 780H1322", t: [1330, 773, "24"], a: "start" },
  { d: "M290 812H920M290 806V818M920 806V818", t: [605, 840, "the dock"] },
];
const lines = document.getElementById("lines"), dg = document.getElementById("dims"), bp = document.getElementById("bp");
shapes.forEach(([tag, attrs], i) => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.setAttribute("class", "draw");
  lines.appendChild(el);
  const len = Math.ceil(el.getTotalLength ? el.getTotalLength() : 3000);
  el.style.setProperty("--len", len);
  el.style.setProperty("--d", `${i * 0.09}s`);
});
dims.forEach(({ d, t, a }) => {
  const p = document.createElementNS(NS, "path");
  p.setAttribute("d", d); p.setAttribute("class", "dim");
  dg.appendChild(p);
  const tx = document.createElementNS(NS, "text");
  tx.setAttribute("x", t[0]); tx.setAttribute("y", t[1]); tx.setAttribute("text-anchor", a || "middle");
  tx.textContent = t[2];
  dg.appendChild(tx);
});
let timers = [];
function play() {
  timers.forEach(clearTimeout);
  bp.classList.remove("go", "labels", "live");
  void bp.offsetWidth;
  bp.classList.add("go");
  timers = [setTimeout(() => bp.classList.add("labels"), 1500), setTimeout(() => bp.classList.add("live"), 3000)];
}
const seen = new IntersectionObserver((e) => {
  if (!e[0].isIntersecting) return;
  seen.disconnect();
  play();
}, { threshold: 0.3 });
seen.observe(bp);
document.getElementById("redraw").onclick = play;

const models = ["Anthropic", "ChatGPT", "OpenAI", "Google", "DeepSeek", "Qwen", "OpenRouter", "Ollama", "Your own endpoint"];
const band = models.map((m) => `<span>${m}</span>`).join("");
document.getElementById("model-band").innerHTML = band + band;


const mm = document.getElementById("mm");
const total = 1238;
new IntersectionObserver((entries, observer) => {
  if (!entries[0].isIntersecting) return;
  observer.disconnect();
  mm.classList.add("go");
}, { threshold: 0.35 }).observe(mm);
setInterval(() => {
  let doc;
  try { doc = mm.querySelector("iframe").contentDocument; } catch { return; }
  const read = (id) => [...(doc?.getElementById(id)?.querySelectorAll("span") || [])].map((s) => s.textContent);
  const [calls, readLeft] = read("left-count"), [rightCalls, readRight] = read("right-count");
  if (!calls) return;
  const lines = parseInt((readLeft || "0").replace(/\D/g, ""), 10) || 0;
  mm.querySelector('[data-count="left"]').textContent = `${calls.replace(" tool", "")} · ${lines.toLocaleString()} lines`;
  mm.querySelector('[data-count="right"]').textContent = `${rightCalls.replace(" tool", "")} · ${readRight === "nothing read yet" ? "nothing read" : "no whole files"}`;
  mm.querySelector('[data-bar="left"]').style.width = `${(lines / total) * 100}%`;
  mm.querySelector('[data-lines="left"]').textContent = `${lines.toLocaleString()} lines in context`;
  mm.querySelector('[data-bar="right"]').style.width = rightCalls.startsWith("0") ? "0" : "1.5%";
}, 200);
