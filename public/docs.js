(() => {
  const root = document.body.dataset.root || "../";
  const input = document.getElementById("docs-q"), list = document.getElementById("docs-results");
  let index = null, picked = 0, hits = [];
  const load = () => index || (index = fetch(`${root}docs/search.json`).then((r) => r.json()).catch(() => []));
  const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const mark = (text, words) => words.reduce((html, w) => html.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"), "<mark>$1</mark>"), escape(text));
  const snippet = (text, words) => {
    const at = Math.max(0, text.toLowerCase().indexOf(words[0]) - 60);
    return (at ? "…" : "") + text.slice(at, at + 180) + (text.length > at + 180 ? "…" : "");
  };
  const paint = () => {
    list.querySelectorAll("a").forEach((a, i) => a.setAttribute("aria-selected", String(i === picked)));
  };
  async function find() {
    const q = input.value.trim().toLowerCase();
    if (!q) { list.hidden = true; return; }
    const words = q.split(/\s+/).filter(Boolean);
    const all = await load();
    hits = all.map((entry) => {
      const title = `${entry.p} ${entry.h}`.toLowerCase(), body = entry.x.toLowerCase();
      if (!words.every((w) => title.includes(w) || body.includes(w))) return null;
      const score = words.reduce((n, w) => n + (entry.h.toLowerCase().includes(w) ? 4 : 0) + (entry.p.toLowerCase().includes(w) ? 3 : 0) + (body.includes(w) ? 1 : 0), 0);
      return { entry, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 12);
    picked = 0;
    list.innerHTML = hits.length
      ? hits.map(({ entry }) => `<a href="${root}${entry.u}" role="option"><b>${mark(entry.h || entry.p, words)}</b>${entry.h ? `<span>${escape(entry.p)}</span>` : ""}<p>${mark(snippet(entry.x, words), words)}</p></a>`).join("")
      : `<div class="empty">Nothing matches “${escape(input.value)}”.</div>`;
    list.hidden = false;
    paint();
  }
  if (input) {
    input.addEventListener("focus", load);
    input.addEventListener("input", find);
    input.addEventListener("keydown", (e) => {
      const links = list.querySelectorAll("a");
      if (e.key === "ArrowDown" && links.length) { e.preventDefault(); picked = (picked + 1) % links.length; paint(); }
      if (e.key === "ArrowUp" && links.length) { e.preventDefault(); picked = (picked + links.length - 1) % links.length; paint(); }
      if (e.key === "Enter" && links[picked]) location.href = links[picked].href;
      if (e.key === "Escape") { input.value = ""; list.hidden = true; input.blur(); }
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".docs-search")) list.hidden = true; });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== input && !/input|textarea/i.test(document.activeElement?.tagName || "")) { e.preventDefault(); input.focus(); }
    });
  }
  const menu = document.getElementById("docs-menu"), nav = document.getElementById("docs-nav");
  menu?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });
  const toc = [...document.querySelectorAll(".docs-toc a")];
  const heads = toc.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
  if (heads.length) {
    const spy = () => {
      let on = 0;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top < 120) on = i; });
      toc.forEach((a, i) => a.classList.toggle("on", i === on));
    };
    addEventListener("scroll", spy, { passive: true });
    spy();
  }
  const here = document.querySelector('.docs-nav a[aria-current="page"]');
  if (here && nav) nav.scrollTop = here.offsetTop - nav.clientHeight / 2;
})();
