# Pixel art from 2D sprites or from pixelated 3D models?

Type: prototype
Mode: HITL
Status: claimed
Blocked by: 01, 03

## Question

Build two tiny, throwaway Three.js scenes, one per approach, each with a stand-in warrior walking around a few tiles and walls. Deploy both and let the user compare them on the Redmi.

Decide which approach the PoC uses, judged on look, readability at phone size, animation feel, and FPS. This choice decides which assets are needed and how the camera can behave.

Use the same KayKit characters in both scenes (live 3D models in one, our own 8-direction sprite renders in the other), so the comparison is about the rendering, not the art. See the asset-candidates answer.

## Comments

### Prototype ready for the phone (2026-09-25)

One scene, three variants, switched with the white bar at the bottom (or `?variant=`). Switching reloads the page, and `?tune` is kept.

- **A · 2D sprites** (`?variant=sprites`): an 8-direction sprite sheet of the KayKit Knight, rendered from the game camera at load time (392 frames: idle, walk, run, attack), one texel per art pixel, 12 fps, instant turns. Drawn as an upright card on the Warrior's feet, so the depth buffer sorts it against walls and props per pixel (fix (c) from the rendering research).
- **B · 3D smooth** (`?variant=3d`): the live skinned Knight, smooth animation, 0.15 s blends between clips, smooth turning.
- **C · 3D stepped** (`?variant=3d-stepped`): the live Knight, but with the animation sampled at 12 fps, hard cuts and instant turns, like the sprites.

All three share everything else: the Area (KayKit Dungeon floor, back walls, a half-height wall to walk behind, a pillar, barrels, crates), the camera (30° / 45°, orthographic, pixel-snapped, follows the Warrior), 600×270 art pixels ×4 on the Redmi, a depth-edge outline, a blob shadow, Lambert lighting, and the stand-in controls.

**How to use it:** an autopilot walks a fixed loop and attacks at three stops, so the variants can be compared, and their fps read (top left), hands-free. Touch anywhere to take over with a floating stick; ⚔ attacks; **Auto** restarts the loop. With `?tune`: pixel scale (screen pixels per art pixel), outline strength, walk/run and speeds, animation speed, camera follow.

**Built-in choices the verdict should know about:**
- The rendering is hand-built, not `RenderPixelatedPass`: 8-bit sRGB targets, the outline from depth only (no second normals render), then one nearest-neighbour upscale pass.
- The sprite sheet is baked in the browser (about 0.2 s in headless Chromium), so no offline Blender step is needed to compare. A real 2D pipeline would bake the sheet offline in the same way.
- The Area is 3D geometry in all variants. In a full 2D approach the tiles would be pre-rendered too, and at one texel per art pixel from the same camera they would look the same, so only the Warrior's rendering differs.

**Code:** `src/prototype-rendering/`; assets in `public/prototype-rendering/kaykit/` (CC0, `knight.glb` stripped to the 4 clips used, 500 KB).
