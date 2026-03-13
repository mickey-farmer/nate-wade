/**
 * Nate Wade admin portal
 * Password-protected; live preview via postMessage; save to GitHub.
 */
(function () {
  "use strict";

  var PASSWORD_HASH = "7528ec112329b6e220f6da3fcd7ab23b27380929aa8fb11725e83704f7ace57a";
  var CONTENT_URL = "../data/content.json";
  var PREVIEW_DEBOUNCE_MS = 400;

  var loginScreen = document.getElementById("login-screen");
  var adminScreen = document.getElementById("admin-screen");
  var loginForm = document.getElementById("login-form");
  var loginPassword = document.getElementById("login-password");
  var loginError = document.getElementById("login-error");
  var previewFrame = document.getElementById("preview-frame");
  var saveGitHubBtn = document.getElementById("save-github");
  var refreshPreviewBtn = document.getElementById("refresh-preview");
  var settingsBtn = document.getElementById("settings-btn");
  var settingsModal = document.getElementById("settings-modal");
  var settingsSave = document.getElementById("settings-save");
  var settingsClose = document.getElementById("settings-close");
  var toastEl = document.getElementById("toast");

  var previewDebounceTimer = null;
  var currentContent = null;

  // ----- Auth -----
  function isAuthenticated() {
    return sessionStorage.getItem("nate_admin") === "1";
  }

  function setAuthenticated(value) {
    if (value) sessionStorage.setItem("nate_admin", "1");
    else sessionStorage.removeItem("nate_admin");
  }

  function hashPassword(str) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) {
        return b.toString(16).padStart(2, "0");
      }).join("");
    });
  }

  function checkPassword(input) {
    return hashPassword(input).then(function (hash) {
      return hash === PASSWORD_HASH;
    });
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    loginError.textContent = "";
    var pwd = loginPassword.value;
    if (!pwd) return;
    checkPassword(pwd).then(function (ok) {
      if (ok) {
        setAuthenticated(true);
        loginScreen.classList.add("hidden");
        adminScreen.classList.remove("hidden");
        loadContent();
        initPreview();
      } else {
        loginError.textContent = "Incorrect password.";
      }
    });
  });

  if (isAuthenticated()) {
    loginScreen.classList.add("hidden");
    adminScreen.classList.remove("hidden");
    loadContent();
    initPreview();
  }

  // Ensure settings modal is closed on load (inline style so it always applies)
  settingsModal.style.display = "none";

  // ----- Load content -----
  function loadContent() {
    fetch(CONTENT_URL)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (data) {
          currentContent = data;
          bindContentToForm(data);
        }
      })
      .catch(function () {
        showToast("Could not load content.json", "error");
      });
  }

  function bindContentToForm(data) {
    if (data.hero) {
      setVal("hero-tagline", data.hero.tagline);
      setVal("hero-image", data.hero.heroImageUrl);
    }
    if (data.about) {
      setVal("about-headline", data.about.headline);
      setVal("about-bio1", data.about.bioParagraphs && data.about.bioParagraphs[0]);
      setVal("about-bio2", data.about.bioParagraphs && data.about.bioParagraphs[1]);
      setVal("about-production-note", data.about.productionNote);
      setVal("about-image", data.about.aboutImageUrl);
    }
    if (data.reel) {
      setVal("reel-headline", data.reel.headline);
      setVal("reel-youtube", data.reel.youtubeUrl || "");
      setVal("reel-video", data.reel.videoUrl);
      setVal("reel-poster", data.reel.posterUrl);
      setVal("reel-placeholder", data.reel.placeholderLabel);
    }
    if (data.credits) {
      setVal("credits-headline", data.credits.headline);
      setVal("credits-intro", data.credits.intro);
    }
    if (data.gallery) {
      setVal("gallery-headline", data.gallery.headline);
      setVal("gallery-instagram", data.gallery.instagramHandle ? data.gallery.instagramHandle.replace(/^@/, "") : "");
      setVal("gallery-images", data.gallery.imageUrls && data.gallery.imageUrls.join("\n"));
    }
    if (data.contact) {
      setVal("contact-headline", data.contact.headline);
      setVal("contact-intro", data.contact.intro);
      setVal("contact-email", data.contact.email);
      setVal("contact-instagram", data.contact.instagramHandle ? data.contact.instagramHandle.replace(/^@/, "") : "");
      setVal("contact-imdb", data.contact.imdbUrl);
      setVal("contact-rep-name", data.contact.repName);
      setVal("contact-rep-agency", data.contact.repAgency);
      setVal("contact-rep-email", data.contact.repEmail);
    }
    if (data.resume) {
      setVal("resume-name", data.resume.name);
      setVal("resume-union", data.resume.unionStatus);
      setVal("resume-representation", data.resume.representation);
      setVal("resume-phone", data.resume.phone);
      setVal("resume-email", data.resume.email);
      setVal("resume-stats", data.resume.stats);
      setVal("resume-instagram", data.resume.instagramHandle ? data.resume.instagramHandle.replace(/^@/, "") : "");
      setVal("resume-imdb", data.resume.imdbUrl);
      setVal("resume-updated", data.resume.updatedDate);
      setVal("resume-film", data.resume.film && data.resume.film.map(function (r) {
        return [r.project, r.role, r.director].join("\t");
      }).join("\n"));
      setVal("resume-film-synopses", data.resume.film && data.resume.film.map(function (r) { return r.synopsis || ""; }).join("\n"));
      setVal("resume-film-genres", data.resume.film && data.resume.film.map(function (r) { return r.genre || ""; }).join("\n"));
      setVal("resume-theatre", data.resume.theatre && data.resume.theatre.map(function (r) {
        return [r.project, r.role, r.director].join("\t");
      }).join("\n"));
      setVal("resume-theatre-synopses", data.resume.theatre && data.resume.theatre.map(function (r) { return r.synopsis || ""; }).join("\n"));
      setVal("resume-theatre-genres", data.resume.theatre && data.resume.theatre.map(function (r) { return r.genre || ""; }).join("\n"));
      setVal("resume-training", data.resume.training && data.resume.training.map(function (r) {
        return [r.project, r.role, r.director].join("\t");
      }).join("\n"));
      setVal("resume-skills", data.resume.skills && data.resume.skills.map(function (s) {
        return [s.category, s.items].join("\t");
      }).join("\n"));
    }
  }

  function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val == null ? "" : val;
  }

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  // ----- Build content from form -----
  function parseTableTextarea(text, cols) {
    if (!text) return [];
    return text.split("\n").filter(function (line) { return line.trim(); }).map(function (line) {
      var parts = line.split(/\t|\|/).map(function (p) { return p.trim(); });
      return {
        project: parts[0] || "",
        role: parts[1] || "",
        director: parts[2] || ""
      };
    });
  }

  function parseSkillsTextarea(text) {
    if (!text) return [];
    return text.split("\n").filter(function (line) { return line.trim(); }).map(function (line) {
      var idx = line.indexOf("\t");
      if (idx === -1) idx = line.indexOf("|");
      if (idx === -1) return { category: line.trim(), items: "" };
      return {
        category: line.slice(0, idx).trim(),
        items: line.slice(idx + 1).trim()
      };
    });
  }

  function mergeSynopsisGenre(rows, synopsisText, genreText) {
    var synopsisLines = (synopsisText || "").split("\n").map(function (s) { return s.trim(); });
    var genreLines = (genreText || "").split("\n").map(function (s) { return s.trim(); });
    return rows.map(function (row, i) {
      return {
        project: row.project,
        role: row.role,
        director: row.director,
        synopsis: synopsisLines[i] || "",
        genre: genreLines[i] || ""
      };
    });
  }

  function getContentFromForm() {
    var galleryUrls = getVal("gallery-images").split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    while (galleryUrls.length < 6) galleryUrls.push("");
    var filmRows = parseTableTextarea(getVal("resume-film"));
    var theatreRows = parseTableTextarea(getVal("resume-theatre"));
    var film = filmRows.length ? mergeSynopsisGenre(filmRows, getVal("resume-film-synopses"), getVal("resume-film-genres")) : [{ project: "", role: "", director: "", synopsis: "", genre: "" }];
    var theatre = theatreRows.length ? mergeSynopsisGenre(theatreRows, getVal("resume-theatre-synopses"), getVal("resume-theatre-genres")) : [{ project: "", role: "", director: "", synopsis: "", genre: "" }];
    return {
      hero: {
        tagline: getVal("hero-tagline") || "Actor",
        heroImageUrl: getVal("hero-image") || "assets/acting/hero.jpg"
      },
      about: {
        headline: getVal("about-headline") || "Story first.",
        bioParagraphs: [getVal("about-bio1"), getVal("about-bio2")].filter(Boolean),
        productionNote: getVal("about-production-note"),
        aboutImageUrl: getVal("about-image") || "assets/acting/about.jpg"
      },
      reel: {
        headline: getVal("reel-headline") || "Demo reel",
        youtubeUrl: (getVal("reel-youtube") || "").trim(),
        videoUrl: getVal("reel-video") || "assets/acting/reel.mp4",
        posterUrl: getVal("reel-poster") || "assets/acting/poster.jpg",
        placeholderLabel: getVal("reel-placeholder") || "Nate Wade — Demo Reel"
      },
      credits: {
        headline: getVal("credits-headline") || "Credits & experience",
        intro: getVal("credits-intro") || "Film, television, and theatre. View online or download PDF."
      },
      gallery: {
        headline: getVal("gallery-headline") || "Headshots & stills",
        instagramHandle: getVal("gallery-instagram") || "natewade",
        imageUrls: galleryUrls.slice(0, 6)
      },
      contact: {
        headline: getVal("contact-headline") || "Let's work together.",
        intro: getVal("contact-intro") || "Bookings, representation, or press — reach out below.",
        email: getVal("contact-email"),
        instagramHandle: getVal("contact-instagram") || "natewade",
        imdbUrl: getVal("contact-imdb"),
        repName: getVal("contact-rep-name"),
        repAgency: getVal("contact-rep-agency"),
        repEmail: getVal("contact-rep-email"),
        agencyLogoUrl: "",
        agencyWebsiteUrl: ""
      },
      resume: {
        name: getVal("resume-name") || "Nate Wade",
        unionStatus: getVal("resume-union"),
        representation: getVal("resume-representation"),
        phone: getVal("resume-phone"),
        email: getVal("resume-email"),
        stats: getVal("resume-stats"),
        instagramHandle: getVal("resume-instagram") || "natewade",
        imdbUrl: getVal("resume-imdb"),
        updatedDate: getVal("resume-updated") || "March 2026",
        film: film,
        theatre: theatre,
        training: parseTableTextarea(getVal("resume-training")).length ? parseTableTextarea(getVal("resume-training")) : [{ project: "", role: "", director: "" }],
        skills: parseSkillsTextarea(getVal("resume-skills")).length ? parseSkillsTextarea(getVal("resume-skills")) : [{ category: "Skills", items: "" }]
      }
    };
  }

  // ----- Preview -----
  function sendPreview(content) {
    if (!previewFrame || !previewFrame.contentWindow) return;
    try {
      previewFrame.contentWindow.postMessage({
        type: "nate-admin-content",
        content: content
      }, "*");
    } catch (e) {}
  }

  function updatePreview() {
    var content = getContentFromForm();
    sendPreview(content);
  }

  function initPreview() {
    var inputs = document.querySelectorAll(".admin-main input, .admin-main textarea");
    inputs.forEach(function (el) {
      el.addEventListener("input", function () {
        clearTimeout(previewDebounceTimer);
        previewDebounceTimer = setTimeout(updatePreview, PREVIEW_DEBOUNCE_MS);
      });
      el.addEventListener("change", updatePreview);
    });
    updatePreview();
  }

  refreshPreviewBtn.addEventListener("click", function () {
    previewFrame.src = previewFrame.src;
    setTimeout(updatePreview, 800);
  });

  document.querySelectorAll(".preview-link").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".preview-link").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var page = btn.getAttribute("data-preview");
      previewFrame.src = page === "resume" ? "../resume.html" : "../index.html";
      setTimeout(updatePreview, 500);
    });
  });

  // ----- Nav -----
  var ASSETS_FOLDER = "assets/acting";

  document.querySelectorAll(".nav-item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".nav-item").forEach(function (b) { b.classList.remove("is-active"); });
      document.querySelectorAll(".form-panel").forEach(function (p) { p.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var section = btn.getAttribute("data-section");
      var panel = document.getElementById("panel-" + section);
      if (panel) panel.classList.add("is-active");
      if (section === "assets") loadAssetsList();
    });
  });

  // ----- Assets: list, upload, copy path -----
  var assetsList = document.getElementById("assets-list");
  var assetsMessage = document.getElementById("assets-message");
  var assetsRefreshBtn = document.getElementById("assets-refresh");
  var assetsFileInput = document.getElementById("assets-file-input");

  function loadAssetsList() {
    var s = getSettings();
    if (!s.token || !s.owner || !s.repo) {
      assetsMessage.textContent = "Set GitHub token, owner, and repo in Settings to view and upload assets.";
      assetsMessage.style.display = "block";
      if (assetsList) assetsList.innerHTML = "";
      return;
    }
    assetsMessage.textContent = "Loading…";
    assetsMessage.style.display = "block";
    if (assetsList) assetsList.innerHTML = "";
    fetch("https://api.github.com/repos/" + s.owner + "/" + s.repo + "/contents/" + ASSETS_FOLDER + "?ref=" + encodeURIComponent(s.branch), {
      headers: { "Accept": "application/vnd.github.v3+json", "Authorization": "Bearer " + s.token }
    })
      .then(function (res) {
        if (res.status === 404) {
          assetsMessage.textContent = "Folder is empty or doesn't exist yet. Upload a file to create it.";
          return [];
        }
        if (!res.ok) return res.json().then(function (body) { throw new Error(body.message || res.statusText); });
        return res.json();
      })
      .then(function (items) {
        if (!Array.isArray(items)) return;
        assetsMessage.style.display = "none";
        items.forEach(function (item) {
          if (item.type !== "file") return;
          var li = document.createElement("li");
          li.className = "assets-item";
          var path = item.path || (ASSETS_FOLDER + "/" + item.name);
          var isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(item.name);
          var thumbHtml = "";
          if (isImage && item.download_url) {
            thumbHtml = "<span class=\"assets-thumb-wrap\"><img class=\"assets-thumb\" src=\"" + escapeAttr(item.download_url) + "\" alt=\"\" loading=\"lazy\"></span>";
          } else {
            thumbHtml = "<span class=\"assets-thumb-wrap assets-thumb-placeholder\" title=\"" + escapeAttr(item.name) + "\">" + (item.name.split(".").pop() || "?") + "</span>";
          }
          li.innerHTML = thumbHtml + "<span class=\"assets-item-name\" title=\"" + escapeAttr(path) + "\">" + escapeHtml(item.name) + "</span><button type=\"button\" class=\"assets-copy-btn\" data-path=\"" + escapeAttr(path) + "\">Copy path</button>";
          if (assetsList) assetsList.appendChild(li);
        });
        if (assetsList && assetsList.children.length === 0) {
          assetsMessage.textContent = "No files in this folder. Upload to add.";
          assetsMessage.style.display = "block";
        }
      })
      .catch(function (err) {
        assetsMessage.textContent = err.message || "Could not load assets.";
        assetsMessage.style.display = "block";
      });
  }

  function escapeHtml(s) {
    if (!s) return "";
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML.replace(/"/g, "&quot;");
  }

  if (assetsList) {
    assetsList.addEventListener("click", function (e) {
      var btn = e.target.closest(".assets-copy-btn");
      if (!btn) return;
      var path = btn.getAttribute("data-path");
      if (!path) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(path).then(function () {
          showToast("Copied: " + path, "success");
          btn.textContent = "Copied!";
          btn.classList.add("copied");
          setTimeout(function () { btn.textContent = "Copy path"; btn.classList.remove("copied"); }, 2000);
        });
      } else {
        var ta = document.createElement("textarea");
        ta.value = path;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast("Copied: " + path, "success");
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(function () { btn.textContent = "Copy path"; btn.classList.remove("copied"); }, 2000);
      }
    });
  }

  if (assetsRefreshBtn) assetsRefreshBtn.addEventListener("click", loadAssetsList);

  if (assetsFileInput) {
    assetsFileInput.addEventListener("change", function () {
      var files = this.files;
      if (!files || !files.length) return;
      var s = getSettings();
      if (!s.token || !s.owner || !s.repo) {
        showToast("Set GitHub settings first.", "error");
        openSettingsModal();
        this.value = "";
        return;
      }
      var file = files[0];
      var path = ASSETS_FOLDER + "/" + file.name;
      var reader = new FileReader();
      reader.onload = function () {
        var base64 = reader.result.split(",")[1];
        if (!base64) { showToast("Could not read file.", "error"); return; }
        fetch("https://api.github.com/repos/" + s.owner + "/" + s.repo + "/contents/" + path + "?ref=" + encodeURIComponent(s.branch), {
          method: "GET",
          headers: { "Accept": "application/vnd.github.v3+json", "Authorization": "Bearer " + s.token }
        })
          .then(function (res) { return res.json(); })
          .then(function (existing) {
            var opts = {
              message: "Upload " + file.name + " from admin",
              content: base64,
              branch: s.branch
            };
            if (existing.sha) opts.sha = existing.sha;
            return fetch("https://api.github.com/repos/" + s.owner + "/" + s.repo + "/contents/" + path, {
              method: "PUT",
              headers: {
                "Accept": "application/vnd.github.v3+json",
                "Authorization": "Bearer " + s.token,
                "Content-Type": "application/json"
              },
              body: JSON.stringify(opts)
            });
          })
          .then(function (res) {
            if (!res.ok) return res.json().then(function (body) { throw new Error(body.message || res.statusText); });
            showToast("Uploaded: " + file.name, "success");
            loadAssetsList();
          })
          .catch(function (err) {
            showToast(err.message || "Upload failed.", "error");
          })
          .finally(function () { assetsFileInput.value = ""; });
      };
      reader.readAsDataURL(file);
    });
  }

  // ----- GitHub save -----
  function getSettings() {
    return {
      token: localStorage.getItem("nate_gh_token") || "",
      owner: localStorage.getItem("nate_gh_owner") || "",
      repo: localStorage.getItem("nate_gh_repo") || "",
      branch: localStorage.getItem("nate_gh_branch") || "main"
    };
  }

  function setSettings(s) {
    if (s.token) localStorage.setItem("nate_gh_token", s.token);
    if (s.owner) localStorage.setItem("nate_gh_owner", s.owner);
    if (s.repo) localStorage.setItem("nate_gh_repo", s.repo);
    if (s.branch) localStorage.setItem("nate_gh_branch", s.branch || "main");
  }

  function openSettingsModal() {
    settingsModal.classList.remove("hidden");
    settingsModal.style.display = "flex";
  }

  function closeSettingsModal() {
    settingsModal.classList.add("hidden");
    settingsModal.style.display = "none";
  }

  settingsBtn.addEventListener("click", function () {
    var s = getSettings();
    document.getElementById("settings-token").value = s.token;
    document.getElementById("settings-owner").value = s.owner;
    document.getElementById("settings-repo").value = s.repo;
    document.getElementById("settings-branch").value = s.branch;
    openSettingsModal();
  });

  settingsClose.addEventListener("click", closeSettingsModal);
  settingsModal.querySelector(".modal-backdrop").addEventListener("click", closeSettingsModal);

  settingsSave.addEventListener("click", function () {
    setSettings({
      token: document.getElementById("settings-token").value.trim(),
      owner: document.getElementById("settings-owner").value.trim(),
      repo: document.getElementById("settings-repo").value.trim(),
      branch: document.getElementById("settings-branch").value.trim() || "main"
    });
    closeSettingsModal();
    showToast("Settings saved. You can now use Save to GitHub.", "success");
  });

  function saveToGitHub() {
    var s = getSettings();
    if (!s.token || !s.owner || !s.repo) {
      showToast("Set GitHub token, owner, and repo in Settings first.", "error");
      openSettingsModal();
      return;
    }
    var content = getContentFromForm();
    var json = JSON.stringify(content, null, 2);
    var path = "data/content.json";

    saveGitHubBtn.disabled = true;
    showToast("Saving…", "success");

    fetch("https://api.github.com/repos/" + s.owner + "/" + s.repo + "/contents/" + path + "?ref=" + encodeURIComponent(s.branch), {
      method: "GET",
      headers: { "Accept": "application/vnd.github.v3+json", "Authorization": "Bearer " + s.token }
    })
      .then(function (res) { return res.json(); })
      .then(function (file) {
        var opts = {
          message: "Update content from admin",
          content: btoa(unescape(encodeURIComponent(json))),
          branch: s.branch
        };
        if (file.sha) opts.sha = file.sha;
        return fetch("https://api.github.com/repos/" + s.owner + "/" + s.repo + "/contents/" + path, {
          method: "PUT",
          headers: {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": "Bearer " + s.token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(opts)
        });
      })
      .then(function (res) {
        if (!res.ok) return res.json().then(function (body) { throw new Error(body.message || res.statusText); });
        showToast("Saved to GitHub.", "success");
        currentContent = getContentFromForm();
      })
      .catch(function (err) {
        showToast(err.message || "Save failed.", "error");
      })
      .finally(function () {
        saveGitHubBtn.disabled = false;
      });
  }

  saveGitHubBtn.addEventListener("click", saveToGitHub);

  // ----- Toast -----
  function showToast(message, type) {
    toastEl.textContent = message;
    toastEl.className = "toast " + (type || "success");
    toastEl.classList.remove("hidden");
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(function () {
      toastEl.classList.add("hidden");
    }, 3500);
  }
})();
