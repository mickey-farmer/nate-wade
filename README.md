# Nate Wade — Actor Website

A custom, cinematic single-page actor site built with HTML, CSS, and JavaScript. Same structure and feel as the Mickey On Stage site — hero, about, reel, credits, photos, contact — with no framework and no monthly fees.

## What’s included

- **Hero** — Full-viewport hero with name and “Watch Reel” CTA
- **About** — Bio and a second headshot
- **Reel** — Video player with play overlay (add your demo reel)
- **Credits** — Links to full resume and PDF download
- **Photos** — Headshot gallery (Headshots & stills) and optional Instagram Feed tab
- **Contact** — Email and representation info
- **Resume page** — Full credits table, training, special skills, print/PDF

**Features:** Scroll-triggered reveal animations, sticky header with blur on scroll, mobile menu, smooth scrolling, film-grain texture. Theme is **slate** (cool blue-grey accent); you can switch to `gold`, `blush`, or `dusk` by changing `data-theme` on `<body>` in `index.html` and `resume.html`.

## Quick start

1. **Add assets**  
   Put images and reel in `assets/acting/`. See `assets/acting/README.md` for filenames: `hero.jpg`, `about.jpg`, `reel.mp4`, `headshot-1.jpg` … `headshot-6.jpg`, and optional `poster.jpg`, `resume.pdf`.

2. **Edit content**  
   - **index.html** — Replace all `[placeholder]` and bracketed text: About bio, city, training; production note; Contact email, Instagram handle, IMDb URL, representation line; optional agency logo.
   - **resume.html** — Name, contact, phone, email (and update the copy-email script with the same address), stats (hair/eyes/height), Film/Theatre/Training credits, Special Skills, “Resume updated” date. Update Open Graph `og:url` when you have a live URL.

3. **Preview**  
   Open `index.html` in a browser, or run a local server (e.g. `npx serve .` or `python3 -m http.server 8000`) to avoid CORS issues with video.

## Deployment (e.g. GitHub Pages)

- Use the **root of the repo** as the site root (`index.html` at top level).
- On GitHub: **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, folder **/ (root)**.
- Optional: add a custom domain in Pages settings and DNS.

If `reel.mp4` is over 100 MB, add it to `.gitignore` and host the video elsewhere; set the `<video src="...">` in `index.html` to the hosted URL.

## Admin portal

An **admin portal** at `/admin` (e.g. `https://yoursite.com/admin/` or open `admin/index.html` locally) lets you edit all site content and the resume without touching code. There is no link to it from the public site.

- **Login:** Open `/admin`, enter the admin password.
- **Edit:** Use the sidebar (Hero, About, Reel, Credits, Gallery, Contact, Resume) to change text and image paths. The **live preview** iframe updates as you type.
- **Save to GitHub:** In Settings (⚙), set your GitHub **personal access token** (with `repo` scope), **repo owner**, and **repo name**. Click **Save to GitHub** to commit `data/content.json` to the repo. The public site reads from this file, so changes appear after deploy.

Content is stored in `data/content.json`. The main site loads it via `js/content.js` so the live site stays in sync with the admin.

## File structure

```
nate-wade/
├── index.html
├── resume.html
├── data/
│   └── content.json      # Editable content (admin writes here via GitHub)
├── admin/                 # Admin portal (no link from public site)
│   ├── index.html
│   ├── admin.css
│   └── admin.js
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── content.js        # Loads data/content.json and applies to pages
├── assets/
│   └── acting/
│       ├── README.md
│       ├── nate-wade-logo.svg
│       ├── hero.jpg, about.jpg, reel.mp4
│       ├── headshot-1.jpg … headshot-6.jpg
│       └── (optional) poster.jpg, resume.pdf, agency-logo.webp
└── README.md
```

You own the code and the design. Tweak content and theme until it fits.
