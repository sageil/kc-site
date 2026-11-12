const $ = (id) => document.getElementById(id);
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
  paperclip: ["M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"],
  terminal: ["m4 17 6-6-6-6","M12 19h8"],
  brain: ["M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z","M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z","M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4","M17.599 6.5a3 3 0 0 0 .399-1.375","M6.003 5.125A3 3 0 0 0 6.401 6.5","M3.477 10.896a4 4 0 0 1 .585-.396","M19.938 10.5a4 4 0 0 1 .585.396","M6 18a4 4 0 0 1-1.967-.516","M19.967 17.484A4 4 0 0 1 18 18"],
  bookOpen: ["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z","M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
  globe: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20","M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20","M2 12h20"],
  question: ["M7.9 20A9 9 0 1 0 4 16.1L2 22Z","M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3","M12 17h.01"],
  checklist: ["m3 17 2 2 4-4","m3 7 2 2 4-4","M13 6h8","M13 12h8","M13 18h8"],
  target: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20","M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12","M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4"],
  activity: ["M22 12h-4l-3 9L9 3l-3 9H2"],
  searchFile: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h5","M14 2v6h6","M20 8v3","m21 21-1.9-1.9","M16.5 19.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  conversations: ["M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z","M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"],
  plug: ["M12 22v-5","M9 8V2","M15 8V2","M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"],
  puzzle: ["M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"],
  maximize: ["M15 3h6v6","M9 21H3v-6","M21 3l-7 7","M3 21l7-7"],
  restore: ["M4 14h6v6","M20 10h-6V4","M14 10l7-7","M3 21l7-7"],
  pencil: ["M12 20h9","M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"],
  panelLeft: ["M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z","M9 3v18"],
  panelRight: ["M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z","M15 3v18"],
  sparkle: ["M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z","M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"],
  folder: ["M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"],
  chevronDown: ["m6 9 6 6 6-6"],
  check: ["M20 6 9 17l-5-5"],
  agent: ["M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z","M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"],
  code: ["m16 18 6-6-6-6","m8 6-6 6 6 6"],
  search: ["m21 21-4.3-4.3","M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"],
  package: ["m7.5 4.27 9 5.15","M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z","m3.3 7 8.7 5 8.7-5","M12 22V12"],
  plus: ["M5 12h14","M12 5v14"],
  settings: ["M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z","M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  close: ["M18 6 6 18","m6 6 12 12"],
  arrowRight: ["M5 12h14","m12 5 7 7-7 7"],
  star: ["m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"],
  user: ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  eye: ["M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0","M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  external: ["M15 3h6v6","M10 14 21 3","M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"],
  shield: ["M12 3l7.5 3v5.4c0 4.5-3 8.6-7.5 9.8-4.5-1.2-7.5-5.3-7.5-9.8V6z","m9.2 12 2 2 3.6-3.8"],
  hub: ["M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4","M4.8 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4","M19.2 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4","M12 9v3.5","m10.4 13.2-4 3","m13.6 13.2 4 3"],
  diff: ["M6 3.5v17","M18 3.5v17","M9.6 8.5h4.8","M9.6 12h4.8","M9.6 15.5h4.8"],
  history: ["M3.4 12a8.6 8.6 0 1 0 2.6-6.1L3 8.6","M3 4.2v4.4h4.4","M12 7.8v4.4l3.2 1.9"],
  arrowUp: ["M12 20V5.2","m5.6 11.6 6.4-6.4 6.4 6.4"],
  copy: ["M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z","M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"],
  reload: ["M21 12a9 9 0 1 1-2.64-6.36","M21 3v6h-6"],
  bolt: ["M13 10V3L4 14h7v7l9-11h-7z"],
  chevronRight: ["m9 5 7 7-7 7"],
  chevronLeft: ["m15 19-7-7 7-7"],
  document: ["M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"],
  delegate: ["M7 11.5V14m0-2.5v-6a1.5 1.5 0 1 1 3 0m-3 6a1.5 1.5 0 0 0-3 0v2a7.5 7.5 0 0 0 15 0v-5a1.5 1.5 0 0 0-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 0 1 3 0v1m0 0V11m0-5.5a1.5 1.5 0 0 1 3 0v3m0 0V11"],
};
const POINTER = '<svg class="pointer" id="pointer" viewBox="0 0 24 24" style="left:640px;top:820px"><path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.4-6.6L4 20z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';

// Every wait goes through this clock, so a demo can be paused, scrubbed and replayed: seeking replays the script instantly up to the target.
const clock = { t: 0, target: -1, pending: [], playing: false, ended: false, duration: 0, chapters: [], dry: false, speed: 1, seed: 1 };
const now = () => clock.t;
const sleep = (ms) => {
  const at = clock.t + Math.max(0, ms);
  if (at <= clock.target) {
    clock.t = at;
    return Promise.resolve();
  }
  if (clock.target >= 0) settle();
  return new Promise((resolve) => clock.pending.push({ at, resolve }));
};
function chapter(label) {
  if (clock.dry) clock.chapters.push({ t: clock.t, label });
}
Math.random = () => {
  let t = (clock.seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

let run = 0;
const alive = (id) => { if (id !== run) throw new Error("restarted"); };
let script = null;
function loop(play) {
  script = play;
  return () => player.boot();
}
function settle() {
  const root = document.documentElement;
  clock.t = Math.max(clock.t, clock.target);
  clock.target = -1;
  if (!root.classList.contains("seeking")) return;
  void document.body.offsetWidth;
  document.querySelectorAll(".enter").forEach((el) => el.classList.remove("enter"));
  root.classList.remove("seeking");
}
function begin(target) {
  const id = ++run;
  clock.pending = [];
  clock.t = 0;
  clock.seed = 1;
  clock.target = target;
  clock.ended = false;
  document.documentElement.classList.add("seeking");
  return script(id).then(() => {
    if (id !== run) return;
    if (clock.dry) clock.target = -1;
    else clock.t = clock.duration;
    settle();
    clock.ended = true;
    clock.playing = false;
    player.paint();
  }, (e) => { if (e.message !== "restarted") throw e; });
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

const BAR = 44;
let stageHeight = 780;
function fitStage(height = 780) {
  stageHeight = height;
  const fit = () => {
    const scale = Math.min((innerWidth - 24) / 1280, (innerHeight - 24 - BAR) / height, 1);
    $("stage").style.transform = `scale(${scale})`;
  };
  addEventListener("resize", fit);
  fit();
  document.documentElement.dataset.theme = "dark";
}

const fmt = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
const player = {
  user: false,
  seen: false,
  scrubbing: false,
  async boot() {
    this.mount();
    clock.dry = true;
    clock.chapters = [];
    await begin(Infinity);
    clock.duration = clock.t;
    clock.dry = false;
    this.marks();
    await this.seek((Number(new URLSearchParams(location.search).get("t")) || 0) * 1000);
    this.watch();
    const t = performance.now();
    setTimeout(() => this.tick(performance.now(), t), 16);
  },
  seek(t) {
    const target = Math.max(0, Math.min(t, clock.duration));
    const done = begin(target);
    return target >= clock.duration ? done : Promise.resolve();
  },
  tick(at, last) {
    if (clock.playing && !this.scrubbing && !document.hidden) {
      let left = (at - last) * clock.speed;
      while (left > 0 && clock.playing) {
        const next = clock.pending.reduce((a, b) => (a && a.at <= b.at ? a : b), null);
        if (!next) { clock.t += left; break; }
        const step = Math.min(left, next.at - clock.t);
        clock.t += step;
        left -= step;
        if (clock.t < next.at) break;
        clock.pending.splice(clock.pending.indexOf(next), 1);
        next.resolve();
        break;
      }
      clock.t = Math.min(clock.t, clock.duration);
    }
    this.paint();
    setTimeout(() => this.tick(performance.now(), at), 16);
  },
  play() {
    if (clock.ended) {
      this.seek(0);
    }
    clock.playing = true;
    this.paint();
  },
  pause() {
    clock.playing = false;
    this.paint();
  },
  toggle() {
    this.user = true;
    clock.playing && !clock.ended ? this.pause() : this.play();
  },
  replay() {
    this.user = true;
    this.seek(0);
    clock.playing = true;
    this.paint();
  },
  watch() {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !this.seen) {
        this.seen = true;
        this.play();
      }
      if (this.user) return;
      if (!entry.isIntersecting && clock.playing) this.pause();
      if (entry.isIntersecting && !clock.playing && !clock.ended && this.seen) this.play();
    }, { threshold: 0.3 }).observe($("stage"));
  },
  mount() {
    document.body.style.paddingBottom = `${BAR}px`;
    const bar = document.createElement("div");
    bar.className = "player";
    bar.innerHTML = `<button type="button" class="p-btn" data-act="toggle" aria-label="Play">${icon("p-ico", ["M7 4.5v15l12.5-7.5z"])}</button>
      <button type="button" class="p-btn" data-act="replay" aria-label="Replay from the start" title="Replay">${icon("p-ico", GLYPH.history)}</button>
      <span class="p-time"><b data-time>0:00</b> / <span data-total>0:00</span></span>
      <div class="p-track" data-track role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0"><div class="p-rail"><i data-fill></i></div><div class="p-marks" data-marks></div><span class="p-knob" data-knob></span><span class="p-tip" data-tip></span></div>
      <span class="p-chapter" data-chapter></span>
      <button type="button" class="p-btn p-speed" data-act="speed" aria-label="Playback speed" title="Playback speed">1×</button>`;
    document.body.append(bar);
    const overlay = document.createElement("button");
    overlay.type = "button";
    overlay.className = "p-overlay";
    overlay.setAttribute("aria-label", "Play");
    overlay.innerHTML = `<span>${icon("p-big", ["M7 4.5v15l12.5-7.5z"])}</span>`;
    $("stage").append(overlay);
    this.bar = bar;
    this.overlay = overlay;
    const q = (sel) => bar.querySelector(sel);
    this.el = { toggle: q('[data-act="toggle"]'), time: q("[data-time]"), total: q("[data-total]"), track: q("[data-track]"), fill: q("[data-fill]"), knob: q("[data-knob]"), tip: q("[data-tip]"), marks: q("[data-marks]"), chapter: q("[data-chapter]"), speed: q('[data-act="speed"]') };
    bar.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]")?.dataset.act;
      if (act === "toggle") this.toggle();
      if (act === "replay") this.replay();
      if (act === "speed") {
        clock.speed = { 1: 1.5, 1.5: 2, 2: 1 }[clock.speed];
        this.el.speed.textContent = `${clock.speed}×`;
      }
    });
    overlay.addEventListener("click", () => this.toggle());
    const track = this.el.track;
    const at = (e) => {
      const box = track.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e.clientX - box.left) / box.width)) * clock.duration;
    };
    let resume = false;
    track.addEventListener("pointerdown", (e) => {
      track.setPointerCapture(e.pointerId);
      this.scrubbing = true;
      this.user = true;
      resume = clock.playing || clock.ended;
      clock.playing = false;
      this.seek(at(e));
    });
    track.addEventListener("pointermove", (e) => {
      const t = at(e), box = track.getBoundingClientRect();
      this.el.tip.textContent = [fmt(t), this.chapterAt(t)?.label].filter(Boolean).join(" · ");
      this.el.tip.style.left = `${((t / clock.duration) * box.width) || 0}px`;
      if (this.scrubbing) this.seek(t);
    });
    const release = () => {
      if (!this.scrubbing) return;
      this.scrubbing = false;
      if (resume && clock.t < clock.duration) clock.playing = true;
      this.paint();
    };
    track.addEventListener("pointerup", release);
    track.addEventListener("pointercancel", release);
    addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "k") { e.preventDefault(); this.toggle(); }
      if (e.key === "ArrowRight") { this.user = true; this.seek(clock.t + 5000); }
      if (e.key === "ArrowLeft") { this.user = true; this.seek(clock.t - 5000); }
      if (e.key === "Home") { this.user = true; this.seek(0); }
      if (e.key === "End") { this.user = true; this.seek(clock.duration); }
    });
  },
  chapterAt(t) {
    let found = null;
    for (const c of clock.chapters) if (c.t <= t + 1) found = c;
    return found;
  },
  marks() {
    this.el.total.textContent = fmt(clock.duration);
    this.el.track.setAttribute("aria-valuemax", String(Math.round(clock.duration / 1000)));
    this.el.marks.innerHTML = clock.chapters.filter((c) => c.t > 0).map((c) =>
      `<button type="button" title="${c.label}" aria-label="Jump to ${c.label}" data-t="${c.t}" style="left:${(c.t / clock.duration) * 100}%"></button>`).join("");
    this.el.marks.addEventListener("pointerdown", (e) => {
      const t = e.target.closest("[data-t]")?.dataset.t;
      if (t == null) return;
      e.stopPropagation();
      this.user = true;
      const was = clock.playing || clock.ended;
      this.seek(Number(t) + 1);
      clock.playing = was;
      this.paint();
    });
  },
  paint() {
    if (!this.el) return;
    const p = clock.duration ? Math.min(1, clock.t / clock.duration) : 0;
    this.el.fill.style.width = `${p * 100}%`;
    this.el.knob.style.left = `${p * 100}%`;
    this.el.time.textContent = fmt(clock.t);
    this.el.track.setAttribute("aria-valuenow", String(Math.round(clock.t / 1000)));
    this.el.chapter.textContent = this.chapterAt(clock.t)?.label || "";
    const playing = clock.playing && !clock.ended;
    const label = clock.ended ? "Replay" : playing ? "Pause" : "Play";
    const shown = !playing && !this.scrubbing;
    if (label === this.label && shown === this.shown) return;
    this.label = label;
    this.shown = shown;
    const glyph = clock.ended ? GLYPH.history : playing ? ["M8 5v14", "M16 5v14"] : ["M7 4.5v15l12.5-7.5z"];
    this.el.toggle.innerHTML = icon("p-ico", glyph);
    this.el.toggle.setAttribute("aria-label", label);
    this.el.toggle.title = label;
    this.overlay.innerHTML = `<span>${icon("p-big", clock.ended ? GLYPH.history : ["M7 4.5v15l12.5-7.5z"])}</span>`;
    this.overlay.setAttribute("aria-label", label);
    this.overlay.classList.toggle("shown", shown);
    document.documentElement.classList.toggle("paused", !playing);
    document.querySelectorAll("svg").forEach((svg) => (playing ? svg.unpauseAnimations?.() : svg.pauseAnimations?.()));
  },
};
