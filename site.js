/* The Promised Childhood Foundation — site behavior
   SETUP: paste your Formspree form URL below (see SETUP-GUIDE.md, Step 5).
   Every form on the site sends to this one address; each submission
   includes a "form" field (volunteer, partner, contact, newsletter, notify)
   so you can tell them apart in the email. */
const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

(function () {
  // Mobile menu
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Contact form: show the child-support fields only for kit requests
  const reason = document.getElementById("c-reason");
  const kitFields = document.getElementById("kit-fields");
  if (reason && kitFields) {
    const sync = function () {
      const isKit = reason.value === "Request a Firefly Kit or nominate a child";
      kitFields.hidden = !isKit;
      kitFields.querySelectorAll("[data-kit-required]").forEach(function (f) { f.required = isKit; });
    };
    if (location.hash === "#request") reason.value = "Request a Firefly Kit or nominate a child";
    if (location.hash === "#partner") reason.value = "Partnering with TPCF";
    reason.addEventListener("change", sync);
    sync();
  }

  // Copy link button
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const text = btn.getAttribute("data-copy");
      const done = function () {
        const old = btn.textContent;
        btn.textContent = "Link copied";
        setTimeout(function () { btn.textContent = old; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { window.prompt && window.prompt("Copy this link:", text); });
      }
    });
  });

  // Forms → Formspree
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    const status = form.querySelector(".form-status");
    const submit = form.querySelector('button[type="submit"]');
    const show = function (msg, ok) {
      if (!status) return;
      status.textContent = msg;
      status.className = "form-status " + (ok ? "ok" : "err");
      status.hidden = false;
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (FORM_ENDPOINT.indexOf("YOUR_FORM_ID") !== -1) {
        show("This form isn't connected yet. Please email admin@thepromisedchildhood.org in the meantime.", false);
        return;
      }
      const original = submit ? submit.textContent : "";
      if (submit) { submit.disabled = true; submit.textContent = "Sending…"; }
      fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("bad status");
          form.reset();
          if (reason) reason.dispatchEvent(new Event("change"));
          show(form.getAttribute("data-success") || "Thank you! We received your message.", true);
        })
        .catch(function () {
          show("Something went wrong and your message wasn't sent. Please try again, or email admin@thepromisedchildhood.org.", false);
        })
        .finally(function () {
          if (submit) { submit.disabled = false; submit.textContent = original; }
        });
    });
  });
})();
