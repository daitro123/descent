# Scaffold the TypeScript + Three.js project and deploy it to GitHub Pages

Type: task
Mode: AFK + HITL checklist
Status: claimed

## Question

Every prototype has to be felt on the phone, so first there has to be a URL to open. Set up TypeScript + Three.js (with Vite as the bundler unless there's a reason not to), a GitHub Actions workflow that deploys to GitHub Pages, a landscape-only fullscreen canvas that handles resizing and `devicePixelRatio`, an FPS counter, and an empty **Tuning panel** behind `?tune`.

HITL part: the user enables GitHub Pages for the repo (source: GitHub Actions) and confirms the URL opens on the Redmi in landscape.

Resolution records the URL, how deploys are triggered, and the baseline FPS of an empty scene on the Redmi.

Inputs from the Three.js pixel-rendering research: size the canvas in device pixels rather than using `setPixelRatio`, drive updates with delta time (the Redmi has a 120 Hz screen), and use the `lil-gui` bundled with three for the Tuning panel. The user should also check whether their Redmi is the 4G (Mali-G57) or 5G (Adreno 619) model, under Settings → About phone.
