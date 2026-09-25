# How do you render isometric pixel art with Three.js on a mid-range Android phone?

Type: research
Mode: AFK
Status: claimed

## Question

There are two candidate approaches. What does each one take in Three.js, and how does each run on the test device?

1. **2D sprites in a 3D scene:** pixel-art sprite sheets on quads, an orthographic camera at an isometric angle, nearest-neighbour filtering, depth sorting between sprites and walls, keeping pixels on the grid while the camera moves.
2. **Pixelated 3D:** low-poly 3D models rendered into a low-resolution render target and scaled up with nearest-neighbour (e.g. three.js `RenderPixelatedPass` and similar), outlines, camera snapping to avoid shimmer, keeping the animation readable.

For both approaches: known pitfalls, the cost on mobile GPUs, and how to handle `devicePixelRatio`. Name the GPU of the Xiaomi Redmi Note 11 Pro (the 4G and 5G variants use different chips) and what a Three.js scene can realistically render on it at 60 fps.

Also note lightweight options for touch input (Pointer Events, virtual joystick libraries) and for tuning panels (lil-gui, Tweakpane) that work with Three.js.

Findings go to `.scratch/isometric-poc/research/threejs-pixel-rendering.md`.
