# Descent

An isometric pixel-art action game for the mobile browser, built with TypeScript and Three.js. See `CONTEXT.md` for the vocabulary and `.scratch/isometric-poc/map.md` for where the proof of concept stands.

## Run it

```sh
npm install
npm run dev        # dev server, also reachable from other devices on your network
npm run build      # typecheck + production build into dist/
```

### On your phone

Pushes to `main` deploy to https://daitro123.github.io/descent/ (add `?tune` for the Tuning panel). To try a branch before merging it, use the dev server:

1. Put the phone and the computer on the same Wi-Fi.
2. Run `npm run dev`. Vite prints a `Network:` URL, such as `http://192.168.1.20:5173/`.
3. Open that URL in the phone's browser and turn the phone sideways. Tap ⛶ for fullscreen.

If the phone can't reach the URL, the computer's firewall is probably blocking port 5173.

### Tuning panel

Add `?tune` to the URL (`http://192.168.1.20:5173/?tune`) to open the Tuning panel (or `https://daitro123.github.io/descent/?tune`). Tuned values are kept across reloads. **Copy values** puts them on the clipboard as JSON.

### On-screen stats

Top left: frames per second, average and worst frame time, drawing-buffer size in device pixels, `devicePixelRatio`, draw calls and triangles, and the GPU name.
