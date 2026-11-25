(function () {
  "use strict";

  var root = document.documentElement;
  var themeBtn = document.getElementById("theme");

  // Thème clair / sombre, mémorisé si le navigateur le permet
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    themeBtn.setAttribute("aria-label", t === "dark" ? "Passer en thème clair" : "Passer en thème sombre");
  }
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) { saved = null; }
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) { /* stockage indisponible */ }
  });

  // Navigation par pages : une seule section affichée à la fois
  var nav = document.getElementById("nav");
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  var order = links.map(function (a) { return a.getAttribute("href").slice(1); });
  var blocks = Array.prototype.slice.call(document.querySelectorAll(".page"));
  document.body.classList.add("paged");

  function show(id) {
    if (order.indexOf(id) === -1) id = order[0];
    blocks.forEach(function (el) { el.hidden = el.getAttribute("data-page") !== id; });
    links.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("active", on);
      if (on) { a.setAttribute("aria-current", "page"); } else { a.removeAttribute("aria-current"); }
      if (on && nav.scrollWidth > nav.clientWidth) {
        nav.scrollTo({ left: Math.max(0, a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2), behavior: "smooth" });
      }
    });
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", function () { show(location.hash.slice(1)); });
  show(location.hash.slice(1));

  // Visionneuse de documents (PDF et schémas)
  var viewer = document.getElementById("viewer");
  var frame = document.getElementById("viewer-frame");
  var vTitle = document.getElementById("viewer-title");
  var vOpen = document.getElementById("viewer-open");
  var vDl = document.getElementById("viewer-dl");
  var imgBox = document.getElementById("viewer-img");
  var img = imgBox ? imgBox.querySelector("img") : null;

  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest("a.doc") : null;
    if (!link || !viewer || typeof viewer.showModal !== "function") return;
    // Sur petit écran, le document s'ouvre directement dans un onglet
    if (window.innerWidth < 720) { link.target = "_blank"; return; }
    e.preventDefault();
    var href = link.getAttribute("href");
    var holder = link.closest("article, tr");
    var head = holder ? holder.querySelector("h3, th") : null;
    vTitle.textContent = (head ? head.textContent.trim() + " · " : "") + link.firstChild.textContent.trim();
    vOpen.href = href;
    vDl.href = href;
    var isImage = /\.(svg|png|jpe?g)$/i.test(href);
    imgBox.hidden = !isImage;
    frame.hidden = isImage;
    if (isImage) {
      img.src = href;
      img.alt = vTitle.textContent;
    } else {
      // Toujours ouvrir le document à la première page
      frame.src = "about:blank";
      frame.src = href + "#page=1&t=" + Date.now();
    }
    viewer.showModal();
  });

  if (viewer) {
    document.getElementById("viewer-close").addEventListener("click", function () { viewer.close(); });
    viewer.addEventListener("click", function (e) { if (e.target === viewer) viewer.close(); });
    viewer.addEventListener("close", function () { frame.src = "about:blank"; if (img) img.removeAttribute("src"); });
  }
})();
