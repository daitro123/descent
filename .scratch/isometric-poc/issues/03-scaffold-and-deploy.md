# Scaffold the TypeScript + Three.js project and deploy it to GitHub Pages

Type: task
Mode: AFK + HITL checklist
Status: claimed

## Question

Every prototype has to be felt on the phone, so first there has to be a URL to open. Set up TypeScript + Three.js (with Vite as the bundler unless there's a reason not to), a GitHub Actions workflow that deploys to GitHub Pages, a landscape-only fullscreen canvas that handles resizing and `devicePixelRatio`, an FPS counter, and an empty **Tuning panel** behind `?tune`.

HITL part: the user enables GitHub Pages for the repo (source: GitHub Actions) and confirms the URL opens on the Redmi in landscape.

Resolution records the URL, how deploys are triggered, and the baseline FPS of an empty scene on the Redmi.

Inputs from the Three.js pixel-rendering research: size the canvas in device pixels rather than using `setPixelRatio`, drive updates with delta time (the Redmi has a 120 Hz screen), and use the `lil-gui` bundled with three for the Tuning panel. The user should also check whether their Redmi is the 4G (Mali-G57) or 5G (Adreno 619) model, under Settings → About phone.

## Comments

**2026-09-25: scope narrowed, deploy split out.** The repo is private, and GitHub Pages on a private repo needs a paid plan. The user wants to keep the repo private and look at Cloudflare later if it's free, so deploying moved to the hosting research ticket, [Where can the PoC be hosted from the private repo, for free?](11-hosting.md). This ticket now covers the scaffold plus a way to open it on the phone before there's a host.

Decided with the user:
- The repo stays private.
- A new `main` branch becomes the default branch, and whichever host is chosen deploys from it. `main` was pushed from the map's working branch at the end of this session; the user switches the default branch in GitHub (Settings → General → Default branch).
- Until there's a host, the phone opens the Vite dev server over Wi-Fi (`npm run dev`, see `README.md`).

**Built (AFK):**
- Vite 8 + TypeScript 7 + three 0.186.1. `npm run build` typechecks and builds. `.github/workflows/build.yml` runs the same build on every push and PR (replaced by the deploy workflow, next comment).
- Fullscreen canvas with its drawing buffer sized in exact device pixels (`ResizeObserver` with `device-pixel-content-box`, fallback CSS size × DPR); `setPixelRatio` isn't used.
- Landscape: a ⛶ button requests fullscreen and locks landscape (Android); a "Turn your phone sideways" overlay covers portrait.
- Delta-time loop (steps capped at 0.1 s), so a 120 Hz screen doesn't double the speed.
- Stats overlay: fps, average/worst frame time, buffer size, DPR, draw calls, triangles, GPU name (tells the Redmi variant apart).
- Tuning panel behind `?tune`: the `lil-gui` bundled with three, loaded on demand, values kept in localStorage, with "Copy values" and "Reset to defaults" buttons. It has no Feel values yet.
- Placeholder scene: iso orthographic camera (45° yaw, 30° tilt), a floor grid, and one spinning box.

Checked in headless Chromium at 873×393 CSS px: renders, `?tune` opens the panel, the portrait overlay shows, no console errors. At a real 2.75 scale factor the buffer is 2401×1081.

**HITL checklist** (superseded by the next comment):
1. On a computer on the same Wi-Fi as the Redmi: `git checkout main && npm install && npm run dev`.
2. Open the printed `Network:` URL on the Redmi in landscape. Tap ⛶.
3. Report back: the first stats line after ~10 s (fps, ms, worst), the buffer size and dpr on line 2, and the GPU name on line 4 (Mali-G57 = 4G model, Adreno 619 = 5G model).
4. Open the URL with `?tune` and check the Tuning panel opens and is usable by thumb.
5. In GitHub, set `main` as the default branch.

**2026-09-25, later: back to GitHub Pages.** For ease of development the user is making the repo public and turning Pages on, so deploying is back in this ticket, and that decision resolves [Where can the PoC be hosted from the private repo, for free?](11-hosting.md).

- `.github/workflows/build-and-deploy.yml` replaces `build.yml`. Every push and PR is typechecked and built. Pushes to `main` (and manual runs on `main`) also deploy `dist/` to GitHub Pages.
- Expected URL: https://daitro123.github.io/descent/ (the build uses relative asset paths, so the `/descent/` sub-path works).
- **Deploys are triggered by** pushing to `main`. Work on other branches reaches the phone by merging it into `main`, or over Wi-Fi with `npm run dev`.

**HITL checklist (open until done):**
1. GitHub → Settings → General: make the repo public, and set `main` as the default branch. The Pages environment only accepts deploys from the default branch, so this comes first.
2. GitHub → Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. GitHub → Actions → "Build and deploy" → Run workflow on `main` (the push that created `main` ran before Pages was on).
4. Open https://daitro123.github.io/descent/ on the Redmi in landscape and tap ⛶.
5. Report back: the first stats line after ~10 s (fps, ms, worst), the buffer size and dpr on line 2, and the GPU name on line 4 (Mali-G57 = 4G model, Adreno 619 = 5G model).
6. Open https://daitro123.github.io/descent/?tune and check the Tuning panel opens and is usable by thumb.
