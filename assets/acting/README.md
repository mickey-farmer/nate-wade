# Nate Wade — Acting assets

Place the following files in this folder so the site displays correctly.

## Required

| File | Description |
|------|-------------|
| `hero.jpg` | Full-bleed background for the hero section (landing). High-res, landscape or portrait. |
| `about.jpg` | Portrait/three-quarter shot for the About section (3:4 aspect ratio works well). |
| `headshot-1.jpg` … `headshot-6.jpg` | Headshots and stills for the gallery (use 2:3 aspect for best fit). You can use fewer than 6; remove or hide extra gallery items in `index.html` if needed. |
| `reel.mp4` | Demo reel video. If the file is over 100 MB, add it to `.gitignore` and host on Vimeo/YouTube; then point the `<video src="...">` in `index.html` to the hosted URL. |
| `poster.jpg` | (Optional) Poster/thumbnail image shown before the reel plays. If omitted, the reel area may show black until play. |
| `nate-wade-logo.svg` | Already included — text logo “Nate Wade”. Replace with a custom logo if desired. |

## Optional

| File | Description |
|------|-------------|
| `resume.pdf` | PDF resume. Add a “Download PDF” link in `resume.html` or the Contact section pointing to `assets/acting/resume.pdf`. |
| `agency-logo.webp` | Agency/rep logo for the Contact section. Reference it in `index.html` (see commented block in Contact). |

## Quick checklist

1. Add `hero.jpg`, `about.jpg`, and at least one headshot (`headshot-1.jpg`, etc.).
2. Add `reel.mp4` (or swap in a hosted reel URL in `index.html`).
3. Update all `[placeholder]` content in `index.html` and `resume.html` (bio, contact, credits, Instagram, IMDb).
4. Optionally add `resume.pdf` and an agency logo.
