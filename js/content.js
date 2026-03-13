/**
 * Content loader: applies data/content.json to the page.
 * When loaded in an iframe (admin preview), listens for postMessage with content instead.
 */
(function () {
  "use strict";

  function getYoutubeVideoId(url) {
    if (!url || typeof url !== "string") return null;
    var trimmed = url.trim();
    var m = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  function applyContent(data) {
    if (!data) return;

    // ----- Hero -----
    var heroTagline = document.querySelector(".hero-tagline");
    if (heroTagline && data.hero && data.hero.tagline) heroTagline.textContent = data.hero.tagline;

    var heroImage = document.querySelector(".hero-image[data-headshot], .hero-image");
    if (heroImage && data.hero && data.hero.heroImageUrl) {
      heroImage.style.backgroundImage = "url(" + data.hero.heroImageUrl + ")";
    }

    // ----- About -----
    var aboutHeadline = document.querySelector(".about-headline");
    if (aboutHeadline && data.about && data.about.headline) aboutHeadline.textContent = data.about.headline;

    var aboutBio = document.querySelector(".about-bio");
    if (aboutBio && data.about && data.about.bioParagraphs && Array.isArray(data.about.bioParagraphs)) {
      aboutBio.innerHTML = data.about.bioParagraphs.map(function (p) {
        return "<p>" + escapeHtml(p) + "</p>";
      }).join("");
    }

    var aboutNote = document.querySelector(".about-production-note");
    if (aboutNote && data.about) {
      if (data.about.productionNote && data.about.productionNote.trim()) {
        aboutNote.innerHTML = "<strong>Production note:</strong> " + escapeHtml(data.about.productionNote);
        aboutNote.style.display = "";
      } else {
        aboutNote.style.display = "none";
      }
    }

    var aboutImage = document.querySelector(".about-image[data-headshot-alt], .about-image");
    if (aboutImage && data.about && data.about.aboutImageUrl) {
      aboutImage.style.backgroundImage = "url(" + data.about.aboutImageUrl + ")";
    }

    // ----- Reel -----
    var reelHeadline = document.querySelector(".reel-headline");
    if (reelHeadline && data.reel && data.reel.headline) reelHeadline.textContent = data.reel.headline;

    var reelNative = document.querySelector(".reel-native");
    var reelYoutubeWrap = document.getElementById("reel-youtube-wrap") || document.querySelector(".reel-youtube");
    var reelVideo = document.querySelector(".reel-video");
    var youtubeUrl = data.reel && data.reel.youtubeUrl && data.reel.youtubeUrl.trim();
    var youtubeId = youtubeUrl ? getYoutubeVideoId(youtubeUrl) : null;

    if (youtubeId && reelYoutubeWrap) {
      if (reelNative) reelNative.style.display = "none";
      reelYoutubeWrap.style.display = "";
      reelYoutubeWrap.setAttribute("aria-hidden", "false");
      var iframe = reelYoutubeWrap.querySelector("iframe");
      var embedUrl = "https://www.youtube.com/embed/" + youtubeId + "?rel=0";
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.setAttribute("title", "Reel video");
        iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
        iframe.setAttribute("allowfullscreen", "");
        reelYoutubeWrap.appendChild(iframe);
      }
      if (iframe.src !== embedUrl) iframe.src = embedUrl;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
    } else {
      if (reelYoutubeWrap) {
        reelYoutubeWrap.style.display = "none";
        reelYoutubeWrap.setAttribute("aria-hidden", "true");
        var oldIframe = reelYoutubeWrap.querySelector("iframe");
        if (oldIframe) oldIframe.removeAttribute("src");
      }
      if (reelNative) reelNative.style.display = "";
      if (reelVideo && data.reel) {
        if (data.reel.videoUrl) reelVideo.src = data.reel.videoUrl;
        if (data.reel.posterUrl) reelVideo.poster = data.reel.posterUrl;
      }
    }

    var reelPlaceholderLabel = document.querySelector(".reel-placeholder p");
    if (reelPlaceholderLabel && data.reel && data.reel.placeholderLabel) {
      reelPlaceholderLabel.textContent = data.reel.placeholderLabel;
    }

    // ----- Credits -----
    var creditsHeadline = document.querySelector(".credits-headline");
    if (creditsHeadline && data.credits && data.credits.headline) creditsHeadline.textContent = data.credits.headline;

    var creditsIntro = document.querySelector(".credits-intro");
    if (creditsIntro && data.credits && data.credits.intro) creditsIntro.textContent = data.credits.intro;

    // ----- Gallery -----
    var photosHeadline = document.querySelector(".photos-headline");
    if (photosHeadline && data.gallery && data.gallery.headline) photosHeadline.textContent = data.gallery.headline;

    var galleryItems = document.querySelectorAll(".gallery-item[data-gallery-img]");
    if (data.gallery && data.gallery.imageUrls && Array.isArray(data.gallery.imageUrls)) {
      data.gallery.imageUrls.forEach(function (url, i) {
        var item = document.querySelector(".gallery-item[data-gallery-img=\"" + (i + 1) + "\"]");
        if (item) {
          var img = item.querySelector(".gallery-img");
          if (img) img.style.backgroundImage = "url(" + url + ")";
        }
      });
    }

    var instagramLink = document.querySelector(".photos-footer a[href*='instagram']");
    if (instagramLink && data.gallery && data.gallery.instagramHandle) {
      instagramLink.href = "https://instagram.com/" + data.gallery.instagramHandle.replace(/^@/, "");
      var span = instagramLink.querySelector("span");
      if (span) span.textContent = "@" + data.gallery.instagramHandle.replace(/^@/, "");
    }

    // ----- Contact -----
    var contactHeadline = document.querySelector(".contact-headline");
    if (contactHeadline && data.contact && data.contact.headline) contactHeadline.textContent = data.contact.headline;

    var contactIntro = document.querySelector(".contact-content > p");
    if (contactIntro && data.contact && data.contact.intro) contactIntro.textContent = data.contact.intro;

    var contactEmailBtn = document.querySelector(".contact-primary .btn-primary[href^='mailto']");
    if (contactEmailBtn && data.contact && data.contact.email) {
      contactEmailBtn.href = "mailto:" + data.contact.email;
    }

    var contactInsta = document.querySelector(".contact-links a[href*='instagram']");
    if (contactInsta && data.contact && data.contact.instagramHandle) {
      contactInsta.href = "https://instagram.com/" + data.contact.instagramHandle.replace(/^@/, "");
      var instaSpan = contactInsta.querySelector("span");
      if (instaSpan) instaSpan.textContent = "@" + data.contact.instagramHandle.replace(/^@/, "");
    }

    var contactImdb = document.querySelector(".contact-links a[href*='imdb']");
    if (contactImdb && data.contact && data.contact.imdbUrl) contactImdb.href = data.contact.imdbUrl;

    var contactRepBlock = document.querySelector(".contact-rep-block p");
    if (contactRepBlock && data.contact) {
      contactRepBlock.innerHTML = "<strong>Representation</strong><br>" +
        escapeHtml(data.contact.repName || "") + ", " + escapeHtml(data.contact.repAgency || "") + "<br>" +
        "<a href=\"mailto:" + escapeHtml(data.contact.repEmail || "") + "\">" + escapeHtml(data.contact.repEmail || "") + "</a>";
    }

    // ----- Resume page -----
    var resumeName = document.querySelector(".resume-name");
    if (resumeName && data.resume && data.resume.name) resumeName.textContent = data.resume.name;

    var resumeContact = document.querySelector(".resume-contact");
    if (resumeContact && data.resume) {
      var line1 = (data.resume.unionStatus || "") + " · " + (data.resume.representation || "");
      var line2 = "<a href=\"tel:" + (data.resume.phone || "") + "\">" + escapeHtml(data.resume.phone || "") + "</a> · " +
        "<a href=\"mailto:" + escapeHtml(data.resume.email || "") + "\">" + escapeHtml(data.resume.email || "") + "</a>";
      resumeContact.innerHTML = line1 + "<br>" + line2 + " <span class=\"resume-copy-wrap no-print\"><button type=\"button\" class=\"resume-copy-btn\" id=\"copy-email\" aria-label=\"Copy email\">Copy email</button></span>";
    }

    var resumeStats = document.querySelector(".resume-stats");
    if (resumeStats && data.resume && data.resume.stats) resumeStats.textContent = data.resume.stats;

    var resumeSocialInsta = document.querySelector(".resume-social a[href*='instagram']");
    if (resumeSocialInsta && data.resume && data.resume.instagramHandle) {
      resumeSocialInsta.href = "https://instagram.com/" + data.resume.instagramHandle.replace(/^@/, "");
    }
    var resumeSocialImdb = document.querySelector(".resume-social a[href*='imdb']");
    if (resumeSocialImdb && data.resume && data.resume.imdbUrl) resumeSocialImdb.href = data.resume.imdbUrl;

    var resumeUpdated = document.querySelector(".resume-updated");
    if (resumeUpdated && data.resume && data.resume.updatedDate) {
      resumeUpdated.textContent = "Resume updated " + data.resume.updatedDate;
    }

    // Resume tables: Film, Theatre, Training, Skills
    if (data.resume && data.resume.film && Array.isArray(data.resume.film)) {
      fillResumeTable("#film-heading", data.resume.film);
    }
    if (data.resume && data.resume.theatre && Array.isArray(data.resume.theatre)) {
      fillResumeTable("#theatre-heading", data.resume.theatre);
    }
    if (data.resume && data.resume.training && Array.isArray(data.resume.training)) {
      fillResumeTable("#training-heading", data.resume.training);
    }
    if (data.resume && data.resume.skills && Array.isArray(data.resume.skills)) {
      fillSkillsSection(data.resume.skills);
    }
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    if (!s) return "";
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML.replace(/"/g, "&quot;");
  }

  function fillResumeTable(sectionId, rows) {
    var section = document.querySelector("[aria-labelledby=\"" + sectionId.replace("#", "") + "\"]");
    if (!section) return;
    var tbody = section.querySelector("tbody");
    if (!tbody) return;
    var infoIconSvg = "<svg class=\"resume-info-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/></svg>";
    tbody.innerHTML = rows.map(function (row) {
      var synopsis = (row.synopsis || "").trim();
      var genre = (row.genre || "").trim();
      var hasTooltip = synopsis || genre;
      var projectCell = "";
      if (hasTooltip) {
        var title = escapeAttr(row.project || "");
        var synopsisAttr = escapeAttr(synopsis);
        var genreAttr = escapeAttr(genre);
        projectCell = "<span class=\"resume-project-trigger\" data-title=\"" + title + "\" data-synopsis=\"" + synopsisAttr + "\" data-genre=\"" + genreAttr + "\" aria-label=\"More info about " + title + "\">" + infoIconSvg + "</span>";
      }
      projectCell += escapeHtml(row.project || "");
      return "<tr>" +
        "<td class=\"col-project\">" + projectCell + "</td>" +
        "<td class=\"col-role\">" + escapeHtml(row.role || "") + "</td>" +
        "<td class=\"col-director\">" + escapeHtml(row.director || "") + "</td>" +
        "</tr>";
    }).join("");
  }

  function fillSkillsSection(skills) {
    var section = document.querySelector("[aria-labelledby=\"skills-heading\"]");
    if (!section) return;
    var grid = section.querySelector(".resume-skills-grid");
    if (!grid) return;
    grid.innerHTML = skills.map(function (s) {
      return "<div class=\"resume-skills-cat\"><strong>" + escapeHtml(s.category || "") + "</strong><span>" + escapeHtml(s.items || "") + "</span></div>";
    }).join("");
  }

  var isInIframe = window.self !== window.top;

  if (isInIframe) {
    window.addEventListener("message", function (event) {
      if (event.data && event.data.type === "nate-admin-content" && event.data.content) {
        applyContent(event.data.content);
      }
    });
    return;
  }

  fetch("data/content.json")
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      if (data) applyContent(data);
    })
    .catch(function () {});
})();
