(function () {
  "use strict";

  const header = document.getElementById("header");
  const navLinks = document.querySelector(".nav-links");
  const navToggle = document.querySelector(".nav-toggle");
  const video = document.querySelector(".reel-video");
  const reelPlaceholder = document.querySelector("[data-reel-placeholder]");
  const reelPlayBtn = document.querySelector(".reel-play");
  const yearEl = document.getElementById("year");

  // ----- Header scroll state -----
  function updateHeader() {
    if (window.scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  // ----- Sticky CTA pills: show after scrolling past hero -----
  const ctaPills = document.querySelector(".cta-pills");
  const heroHeight = function () { return window.innerHeight * 0.7; };
  function updateCtaPills() {
    if (ctaPills) {
      ctaPills.classList.toggle("visible", window.scrollY > heroHeight());
    }
  }
  window.addEventListener("scroll", updateCtaPills, { passive: true });
  updateCtaPills();

  // ----- Mobile nav toggle -----
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", !open);
      navLinks.classList.toggle("is-open", !open);
      document.body.style.overflow = open ? "" : "hidden";
    });
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        navLinks.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  // ----- Smooth scroll for anchor links -----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const id = this.getAttribute("href");
      if (id === "#") return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ----- Reveal on scroll -----
  const revealEls = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    },
    { rootMargin: "0px 0px -60px 0px", threshold: 0.1 }
  );
  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  // ----- Reel: play button and placeholder -----
  if (video && reelPlaceholder && reelPlayBtn) {
    reelPlayBtn.addEventListener("click", function () {
      video.classList.add("playing");
      video.play();
    });
    video.addEventListener("play", function () {
      video.classList.add("playing");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime <= 0) video.classList.remove("playing");
    });
  }

  // ----- Footer year -----
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

})();
