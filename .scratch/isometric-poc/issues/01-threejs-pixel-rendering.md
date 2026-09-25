# How do you render isometric pixel art with Three.js on a mid-range Android phone?

Type: research
Mode: AFK
Status: resolved

## Question

There are two candidate approaches. What does each one take in Three.js, and how does each run on the test device?

1. **2D sprites in a 3D scene:** pixel-art sprite sheets on quads, an orthographic camera at an isometric angle, nearest-neighbour filtering, depth sorting between sprites and walls, keeping pixels on the grid while the camera moves.
2. **Pixelated 3D:** low-poly 3D models rendered into a low-resolution render target and scaled up with nearest-neighbour (e.g. three.js `RenderPixelatedPass` and similar), outlines, camera snapping to avoid shimmer, keeping the animation readable.

For both approaches: known pitfalls, the cost on mobile GPUs, and how to handle `devicePixelRatio`. Name the GPU of the Xiaomi Redmi Note 11 Pro (the 4G and 5G variants use different chips) and what a Three.js scene can realistically render on it at 60 fps.

Also note lightweight options for touch input (Pointer Events, virtual joystick libraries) and for tuning panels (lil-gui, Tweakpane) that work with Three.js.

Findings go to `.scratch/isometric-poc/research/threejs-pixel-rendering.md`.

## Answer

Full findings: [research/threejs-pixel-rendering.md](../research/threejs-pixel-rendering.md). The research sandbox couldn't open vendor sites, so the phone's chip and GPU facts come from search summaries (marked in the file). Three.js and MDN facts are taken from their source repos.

- **Both approaches rest on the same rule:** render at a low virtual resolution, scale it up by a whole number with nearest-neighbour sampling, and snap the camera and moving objects to that pixel grid. The official `webgl_postprocessing_pixel.html` example already does this snapping.
- **2D sprites:** the hard part is depth ordering. Three.js sorts transparent objects by their centre point, so camera-facing quads can clip into walls. An alpha cutoff (`alphaTest`) lets the depth buffer do the sorting. There are three possible fixes for wall clipping; the prototype has to pick one.
- **Pixelated 3D:** `RenderPixelatedPass` renders the scene twice (colour, then normals for outlines) into 16-bit float targets. The default composer chain adds full-screen passes at the phone's native 2400×1080. Its `pixelSize` is counted in device pixels.
- **Pixel density:** don't use `setPixelRatio`. Work out the scale factor from the actual device-pixel canvas size. 2400×1080 divides evenly by 3–6, 8, 10 and 12 (e.g. 480×216 virtual).
- **Test device:** the 4G Redmi Note 11 Pro has a Mali-G57 MC2 GPU, the 5G model an Adreno 619. Both have 120 Hz screens, so updates must use delta time. No published three.js budget exists for either GPU; measure on day one.
- **Libraries:** Pointer Events with `touch-action: none` are enough for a hand-built joystick; `nipplejs` (MIT, has TypeScript types) is an option. `lil-gui` already ships inside `three`, which makes it the default for the Tuning panel. Tweakpane 4 adds an FPS graph and JSON export.
