# Where can the PoC be hosted from the private repo, for free?

Type: research
Mode: AFK
Status: open

## Question

The repo stays private, so GitHub Pages is out unless the user pays for GitHub Pro. Which host can build and serve the PoC from the private `daitro123/descent` repo on a free plan? Cloudflare Pages is the user's first candidate.

For Cloudflare Pages, and briefly for one or two alternatives (such as Netlify or Vercel), find out:
- whether the free plan can build from a private GitHub repo, and the build limits (builds per month, build minutes, file count and size);
- how deploys are triggered: production from `main`, and whether other branches get preview URLs, so each prototype can be opened on the phone before it's merged;
- whether the deployed site can be kept off the open internet for free (e.g. Cloudflare Access), and what that costs in friction when opening it on the phone;
- whether serving licensed assets from the deployed site conflicts with typical asset licences (the build serves files publicly even when the repo is private);
- for comparison, what GitHub Pages from a private repo costs.

The project is a static Vite build (`npm run build` → `dist/`, relative asset paths).
