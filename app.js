const pages = ["home","portal","apply","applications","results","support","reimbursement"];
const crumbs = {
  portal: "Student portal • Dashboard",
  apply: "Student portal • New application",
  applications: "Student portal • My applications",
  results: "Student portal • Result reporting",
  support: "Student portal • Help & support",
  reimbursement: "Student portal • Reimbursement",
};
const pathMap = {
  home: "/",
  portal: "/portal",
  apply: "/apply",
  applications: "/applications",
  results: "/results",
  support: "/support",
  reimbursement: "/reimbursement",
};

const useHash =
  location.protocol === "file:" ||
  /\.html?$/i.test(location.pathname) ||
  document.documentElement.dataset.routing === "hash";

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

function closeDrawers() {
  ["drawer","portalDrawer"].forEach((id) => {
    const d = document.getElementById(id);
    if (d) { d.classList.remove("open"); d.setAttribute("aria-hidden","true"); }
  });
  ["overlay","portalOverlay"].forEach((id) => {
    const o = document.getElementById(id);
    if (o) { o.classList.remove("open"); o.hidden = true; }
  });
  document.body.style.overflow = "";
}

function urlFor(page, scrollId) {
  if (useHash) {
    if (page === "home") return scrollId ? "#/" + scrollId : "#/";
    return "#/" + page;
  }
  let nextUrl = pathMap[page] || "/";
  if (page === "home" && scrollId) nextUrl = "/#" + scrollId;
  return nextUrl;
}

function go(page, scrollId, replace) {
  if (!pages.includes(page)) page = "home";
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("is-active"));
  const target = document.getElementById("page-" + page);
  if (target) target.classList.add("is-active");
  const view = page === "home" ? "home" : "portal";
  document.body.dataset.view = view;
  if (view === "portal") {
    document.getElementById("portalBreadcrumb").textContent = crumbs[page] || "Student portal";
    document.querySelectorAll("#portalDrawer nav a").forEach((a) => {
      a.classList.toggle("active", a.getAttribute("data-active") === page);
    });
  }
  closeDrawers();
  const nextUrl = urlFor(page, scrollId);
  if (replace) history.replaceState({ page, scrollId }, "", nextUrl);
  else history.pushState({ page, scrollId }, "", nextUrl);
  if (scrollId && page === "home") {
    const el = document.getElementById(scrollId);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  } else {
    window.scrollTo(0, 0);
  }
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-nav]");
  if (!link) return;
  e.preventDefault();
  go(link.getAttribute("data-nav"), link.getAttribute("data-scroll") || null, false);
});

function bindDrawer(openId, closeId, drawerId, overlayId) {
  const openBtn = document.getElementById(openId);
  const closeBtn = document.getElementById(closeId);
  const drawer = document.getElementById(drawerId);
  const overlay = document.getElementById(overlayId);
  if (!openBtn || !drawer || !overlay) return;
  const open = () => {
    drawer.classList.add("open");
    overlay.classList.add("open");
    overlay.hidden = false;
    drawer.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    overlay.hidden = true;
    drawer.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
  };
  openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);
}
bindDrawer("menuOpen","menuClose","drawer","overlay");
bindDrawer("portalMenuOpen","portalMenuClose","portalDrawer","portalOverlay");
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawers(); });

let step = 0;
const panels = [...document.querySelectorAll("#page-apply [data-step]")];
const titles = ["Your information","Competition & project","Funding & declaration"];
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
function renderStep() {
  panels.forEach((p) => { p.hidden = Number(p.dataset.step) !== step; });
  document.getElementById("stepTitle").textContent = titles[step];
  document.getElementById("pageLabel").textContent = String(step + 1);
  document.getElementById("pageCenter").textContent = String(step + 1);
  backBtn.hidden = step === 0;
  nextBtn.textContent = step === 2 ? "Submit →" : "Continue →";
}
document.querySelectorAll(".choice[data-choice]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const group = btn.dataset.choice;
    document.querySelectorAll(`.choice[data-choice="${group}"]`).forEach((b) => b.classList.remove("is-selected"));
    btn.classList.add("is-selected");
  });
});
backBtn.addEventListener("click", () => { step = Math.max(0, step - 1); renderStep(); });
nextBtn.addEventListener("click", () => {
  if (step < 2) { step += 1; renderStep(); }
  else { toast("Submitted for endorsement (demo)"); go("applications"); }
});
renderStep();

document.getElementById("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  const filter = btn.dataset.filter;
  document.querySelectorAll("#list .list-row").forEach((row) => {
    row.style.display = filter === "all" || row.dataset.status === filter ? "flex" : "none";
  });
});

document.getElementById("submitReport").addEventListener("click", () => {
  if (!document.getElementById("confirmResult").checked) { toast("Please confirm before submitting"); return; }
  toast("Result report submitted (demo)");
});

document.getElementById("search").addEventListener("input", () => {
  const q = document.getElementById("search").value.trim().toLowerCase();
  document.querySelectorAll("#faqList details").forEach((item) => {
    const text = (item.dataset.q || "").toLowerCase();
    item.style.display = !q || text.includes(q) ? "" : "none";
  });
});

document.getElementById("supportForm").addEventListener("submit", (e) => {
  e.preventDefault();
  toast("Support request sent (demo)");
  e.target.reset();
});

function pageFromLocation() {
  if (useHash) {
    const raw = (location.hash || "#/").replace(/^#\/?/, "");
    const [first, ...rest] = raw.split("/").filter(Boolean);
    if (!first || first === "home") {
      const scrollCandidate = rest[0] || first;
      const homeScrolls = ["about","eligibility","how-it-works","faq","covers"];
      if (homeScrolls.includes(first)) return { page: "home", scrollId: first };
      return { page: "home", scrollId: homeScrolls.includes(scrollCandidate) ? scrollCandidate : null };
    }
    if (pages.includes(first)) return { page: first, scrollId: null };
    if (["about","eligibility","how-it-works","faq","covers"].includes(first)) {
      return { page: "home", scrollId: first };
    }
    return { page: "home", scrollId: null };
  }

  const path = (location.pathname || "/").replace(/\/+$/, "") || "/";
  const map = {
    "/": "home",
    "/index.html": "home",
    "/portal": "portal",
    "/apply": "apply",
    "/applications": "applications",
    "/results": "results",
    "/support": "support",
    "/reimbursement": "reimbursement",
  };
  const page = map[path] || "home";
  const scrollId = page === "home" && location.hash ? location.hash.replace(/^#/, "") : null;
  return { page, scrollId };
}

function boot() {
  const { page, scrollId } = pageFromLocation();
  go(page, scrollId, true);
}
window.addEventListener("popstate", boot);
window.addEventListener("hashchange", () => { if (useHash) boot(); });
boot();
