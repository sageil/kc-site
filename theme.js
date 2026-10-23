(() => {
  const root = document.documentElement, KEY = "kodacode-theme", PALETTE = "kodacode-palette", BG = "kodacode-bg";
  const palettes = ["pure", "paper", "midnight", "graphite", "forest", "plum"];
  const backgrounds = ["grid", "network", "dots", "aurora", "glow", "still"];
  const system = matchMedia("(prefers-color-scheme: dark)");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.dataset.bg = still ? "still" : "grid";
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") root.dataset.theme = saved;
    const palette = localStorage.getItem(PALETTE);
    if (palettes.includes(palette) && palette !== "pure") root.dataset.palette = palette;
    const bg = localStorage.getItem(BG);
    if (backgrounds.includes(bg)) root.dataset.bg = bg;
  } catch {}
  const current = () => root.dataset.theme || (system.matches ? "dark" : "light");

  const base = document.currentScript.src;
  let splash = !root.hasAttribute("data-nosplash") && !still;
  try {
    splash = splash && !sessionStorage.getItem("kodacode-splash");
    sessionStorage.setItem("kodacode-splash", "1");
  } catch { splash = false; }
  if (splash) root.classList.add("splash-on");

  const runSplash = () => {
    const letters = (word, from) => [...word].map((ch, i) => `<span style="--i:${from + i}">${ch}</span>`).join("");
    const inner = `<div class="inner"><div class="big"><img src="${new URL("assets/icon.svg", base)}" alt=""><span class="letters">${letters("Koda", 0)}<em>${letters("Code", 4)}</em></span></div><div class="rule"></div></div><div class="corner tl">Agent orchestration</div><div class="corner br">Loading <b class="count">000</b></div>`;
    const el = document.createElement("div");
    el.className = "splash";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<div class="half top">${inner}</div><div class="half bot">${inner}</div>`;
    document.body.append(el);
    root.classList.add("splash-run");
    const counts = el.querySelectorAll(".count"), t0 = performance.now();
    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      root.classList.add("splash-open");
      counts.forEach((c) => (c.textContent = "100"));
      el.querySelector(".half.bot").addEventListener("animationend", () => {
        el.remove();
        root.classList.remove("splash-on", "splash-run");
      }, { once: true });
    };
    const tick = () => {
      if (opened) return;
      const p = Math.min(1, (performance.now() - t0) / 1700);
      counts.forEach((c) => (c.textContent = String(Math.round(p * 100)).padStart(3, "0")));
      if (p < 1) return requestAnimationFrame(tick);
      setTimeout(open, 150);
    };
    requestAnimationFrame(tick);
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach((type) => addEventListener(type, open, { once: true, passive: true }));
  };

  const tell = () => {
    const theme = current();
    document.querySelectorAll("iframe[data-follow]").forEach((f) => f.contentWindow?.postMessage({ theme }, location.origin));
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", getComputedStyle(root).getPropertyValue("--paper").trim());
  };
  const save = (key, value) => { try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch {} };

  const rgba = (color, a) => {
    const hex = color.replace("#", "").slice(0, 6);
    return `rgba(${parseInt(hex.slice(0, 2), 16)},${parseInt(hex.slice(2, 4), 16)},${parseInt(hex.slice(4, 6), 16)},${a})`;
  };
  const ink = { line: "#1b1f2a", pulse: "#4f46e5", lead: "#d9a514" };
  const recolor = () => {
    const css = getComputedStyle(root);
    ink.line = css.getPropertyValue("--ink").trim();
    ink.pulse = css.getPropertyValue("--indigo").trim();
    ink.lead = current() === "dark" ? "#f6cf5c" : "#d9a514";
  };

  const painter = (canvas, kind, small) => {
    const ctx = canvas.getContext("2d");
    const mouse = { x: -1e4, y: -1e4 };
    let w = 0, h = 0, nodes = [], pulses = [];
    const size = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = small ? 14 : Math.round(Math.min(90, (w * h) / 18000)), speed = small ? .12 : .25;
      nodes = Array.from({ length: count }, (_, i) => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * speed, vy: (Math.random() - .5) * speed, lead: i < (small ? 1 : 3) }));
      pulses = [];
    };
    const network = () => {
      const reach = small ? 34 : 150, edges = [];
      for (const n of nodes) {
        if (!still) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
          const dx = mouse.x - n.x, dy = mouse.y - n.y;
          if (Math.hypot(dx, dy) < 180) { n.x -= dx * .004; n.y -= dy * .004; }
        }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > reach) continue;
        edges.push([a, b]);
        ctx.strokeStyle = rgba(ink.line, (small ? .25 : .12) * (1 - d / reach));
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      if (!still && edges.length && pulses.length < (small ? 2 : 6) && Math.random() < .04) {
        const [a, b] = edges[Math.floor(Math.random() * edges.length)];
        pulses.push({ a, b, t: 0 });
      }
      pulses = pulses.filter((p) => (p.t += .012) < 1);
      for (const p of pulses) {
        const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.strokeStyle = rgba(ink.pulse, .55 * Math.sin(p.t * Math.PI));
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(p.a.x, p.a.y); ctx.lineTo(x, y); ctx.stroke();
        ctx.lineWidth = 1;
        ctx.fillStyle = rgba(ink.pulse, .9);
        ctx.beginPath(); ctx.arc(x, y, small ? 1.6 : 2.4, 0, 7); ctx.fill();
      }
      for (const n of nodes) {
        ctx.fillStyle = n.lead ? ink.lead : rgba(ink.line, small ? .45 : .28);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.lead ? (small ? 2.4 : 4) : (small ? 1.2 : 2), 0, 7); ctx.fill();
      }
    };
    const dots = (t) => {
      const gap = small ? 8 : 26, cx = w * .5, cy = h * .3;
      for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) {
        const d = Math.hypot(x - cx, y - cy), m = Math.hypot(x - mouse.x, y - mouse.y);
        const wave = (Math.sin(d / (small ? 10 : 46) - t / 700) + 1) / 2;
        const near = small ? 0 : Math.max(0, 1 - m / 160);
        const r = small ? .5 + wave * .9 : .7 + wave * 1.3 + near * 2;
        ctx.fillStyle = near > .05 ? rgba(ink.pulse, .25 + near * .55) : rgba(ink.line, (small ? .15 : .07) + wave * (small ? .3 : .12));
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
    };
    return {
      size, mouse,
      draw(t) {
        if (!w) size();
        ctx.clearRect(0, 0, w, h);
        (kind === "network" ? network : dots)(t);
      },
    };
  };

  const appearance = () => {
    const panel = document.querySelector(".appearance");
    const fx = document.createElement("div");
    fx.className = "fx";
    fx.setAttribute("aria-hidden", "true");
    fx.innerHTML = '<canvas></canvas><div class="aurora"><i></i><i></i><i></i></div><div class="grid"></div><div class="glow"></div>';
    document.body.prepend(fx);
    const canvas = fx.querySelector("canvas");
    const main = { network: painter(canvas, "network", false), dots: painter(canvas, "dots", false) };
    const thumbs = panel ? [...panel.querySelectorAll(".thumb canvas")].map((c) => painter(c, c.dataset.kind, true)) : [];

    const sync = () => {
      panel?.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === (root.dataset.theme || "system"))));
      panel?.querySelectorAll("[data-palette]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.palette === (root.dataset.palette || "pure"))));
      panel?.querySelectorAll("[data-bg]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.bg === root.dataset.bg)));
      recolor();
      tell();
      if (still) paint(0);
    };
    const paint = (t) => {
      const effect = main[root.dataset.bg];
      if (effect) effect.draw(t);
      if (panel?.open) thumbs.forEach((p) => p.draw(t));
    };

    panel?.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.mode) {
        const apply = () => {
          if (b.dataset.mode === "system") delete root.dataset.theme;
          else root.dataset.theme = b.dataset.mode;
          save(KEY, b.dataset.mode === "system" ? null : b.dataset.mode);
          sync();
        };
        const next = b.dataset.mode === "system" ? (system.matches ? "dark" : "light") : b.dataset.mode;
        if (next === current() || still || !document.startViewTransition) return apply();
        const box = b.getBoundingClientRect();
        root.style.setProperty("--tx", `${box.left + box.width / 2}px`);
        root.style.setProperty("--ty", `${box.top + box.height / 2}px`);
        root.classList.add("theming");
        document.startViewTransition(apply).finished.finally(() => root.classList.remove("theming"));
      } else if (b.dataset.palette) {
        if (b.dataset.palette === "pure") delete root.dataset.palette;
        else root.dataset.palette = b.dataset.palette;
        save(PALETTE, b.dataset.palette);
        sync();
      } else if (b.dataset.bg) {
        root.dataset.bg = b.dataset.bg;
        save(BG, b.dataset.bg);
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        sync();
      }
    });
    panel?.addEventListener("toggle", () => { if (still && panel.open) thumbs.forEach((p) => p.draw(0)); });
    system.addEventListener("change", sync);
    addEventListener("pointermove", (e) => {
      fx.style.setProperty("--mx", `${e.clientX}px`);
      fx.style.setProperty("--my", `${e.clientY}px`);
      for (const p of Object.values(main)) { p.mouse.x = e.clientX; p.mouse.y = e.clientY; }
    }, { passive: true });
    addEventListener("resize", () => { Object.values(main).forEach((p) => p.size()); if (still) paint(0); });
    sync();
    const frame = (t) => {
      paint(t);
      requestAnimationFrame(frame);
    };
    if (!still) requestAnimationFrame(frame);
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (splash) runSplash();
    document.querySelectorAll("iframe[data-follow]").forEach((f) => f.addEventListener("load", tell));

    const popups = document.querySelectorAll(".bar details");
    document.addEventListener("click", (e) => popups.forEach((d) => { if (!d.contains(e.target)) d.open = false; }));
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      popups.forEach((d) => {
        if (!d.open) return;
        d.open = false;
        d.querySelector("summary").focus();
      });
    });

    if (document.querySelector(".sheet")) appearance();
    else tell();

    if (HTMLScriptElement.supports?.("speculationrules")) {
      const rules = document.createElement("script");
      rules.type = "speculationrules";
      rules.textContent = JSON.stringify({ prerender: [{ where: { and: [{ href_matches: "/*" }, { not: { href_matches: "/demo/*" } }] }, eagerness: "moderate" }] });
      document.head.append(rules);
    }
  });
})();
