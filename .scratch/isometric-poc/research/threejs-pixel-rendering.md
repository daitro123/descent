# Research: isometric pixel art with Three.js on a mid-range Android phone

Ticket: [01-threejs-pixel-rendering](../issues/01-threejs-pixel-rendering.md). Researched 2026-09-25 against three.js `dev` (package `0.186.0`; npm latest `three@0.186.1`) [S16].

**How to read the citations.** `[Sx]` points to the Sources list at the end. Three.js facts come from reading the source files directly. MDN facts come from the `mdn/content` and `mdn/browser-compat-data` repos, which hold the source for the MDN pages. The network proxy blocked direct fetches of mi.com, mediatek.com, qualcomm.com, arm.com and threejs.org, so every fact taken from those vendor pages comes from a **search-engine summary of the page** and is marked *(search summary)*. The page itself was not read. Claims marked **unverified** have no primary source behind them. Claims marked **derived** are my own arithmetic or reasoning from cited facts.

---

## 1. Summary

Both approaches run on Three.js's standard `WebGLRenderer`. Both come down to the same core rule: **draw the game at a low "virtual" resolution, then scale it up by a whole number with nearest-neighbour sampling, and snap anything that moves to that virtual pixel grid.** The difference is where the art comes from (hand-drawn sprite sheets vs. 3D models) and how depth ordering gets solved.

| | A. 2D sprites in a 3D scene | B. Pixelated 3D |
|---|---|---|
| Art input | Sprite sheets, with one set of frames for each of the 8 directions | Low-poly 3D models plus skeletal animation; the 8 directions come free from rotation |
| Three.js building blocks | `OrthographicCamera`, `Sprite`/quads, `NearestFilter`, `alphaTest`, `renderOrder` [S5–S9] | `OrthographicCamera`, `RenderPixelatedPass` (or a hand-made low-res render target), `EffectComposer` [S1–S3] |
| Depth sorting | The hard part. Upright quads in a 3D world clip into walls, and transparent sprites are sorted by the object's centre only [S4] | Solved by the depth buffer. Geometry sorts itself |
| Pixel stability while moving | Snap camera and sprites to the texel grid. The art itself never shimmers | Snap the camera frustum, object positions and rotations. The shipped example implements all of these [S2] |
| Outlines | Drawn into the art | The pass's built-in depth and normal edge lines [S1], or `OutlineEffect`/`OutlinePass` [S13] |
| Readability of animation | Whatever the artist drew, frame by frame | Needs stepped animation playback and rotation snapping, otherwise motion reads as smooth 3D (derived) |
| GPU cost profile | One scene render. Cost is fill rate: overdraw from blended sprites at display resolution | Scene rendered **twice** (beauty + normals) at low res, plus full-resolution composite passes on half-float targets [S1, S3] |
| Main mobile risk | Overdraw from transparent sprites; draw calls if nothing is batched | Full-screen composite passes at native resolution, plus doubled draw calls |
| Asset effort for 8 directions | 8 × every animation in the sheet | One model, rotated |
| Built-in three.js support | Generic primitives only; no isometric sprite example | A ready-made pass plus an official example with snapping and a lil-gui panel [S1, S2] |

**Test device:** "Redmi Note 11 Pro" is more than one phone. The global **4G** model uses the MediaTek Helio G96 with an **Arm Mali-G57 MC2** GPU. The global **5G** model uses the Qualcomm Snapdragon 695 with an **Adreno 619** GPU. Both have a 6.67" 2400×1080 AMOLED screen at 120 Hz [D1–D4] *(search summary)*. The Chinese "Redmi Note 11 Pro" and the global "Pro+ 5G" use the Dimensity 920 with a Mali-G68 MC4 [D5] *(search summary)*. Find out which one the test phone is (§4.1).

**Input and tuning:** Pointer Events plus `touch-action: none` are enough for a hand-rolled joystick [M5, M6]. `nipplejs@1.0.4` is the ready-made option (MIT, ships its own TypeScript types, no dependencies) [L1]. For the Tuning panel, the official three.js examples already bundle `lil-gui` [S2], and it has touch-sized styles and `save()`/`load()` [L2]. Tweakpane 4 adds FPS graphs and JSON state import/export [L3, L4].

---

## 2. Approach A: 2D sprites in a 3D scene

### 2.1 Technique

**Camera.** Use `OrthographicCamera`, rotated 45° around the vertical axis and tilted down.
- A *true* isometric view uses a 35.264° elevation (arctan(sin 45°)). Most pixel-art "isometric" games actually use **2:1 dimetric** projection, where tile edges run at arctan(1/2) ≈ 26.565° on screen [W1] *(search summary)*.
- To get a 2:1 ground diamond from a 3D orthographic camera turned 45°, tilt the camera **30°** below horizontal. A ground square's screen height is its width × sin(elevation), and sin 30° = 0.5 (derived).
- If sprites and tiles are drawn at 2:1, use 30°. If you use 35.264°, 2:1 art will not line up with the 3D ground (derived).

**Textures.** Three.js defaults are `magFilter = LinearFilter`, `minFilter = LinearMipmapLinearFilter` and `generateMipmaps = true` [S7]. For pixel art, set:
- both filters to `NearestFilter`
- `generateMipmaps = false`
- `colorSpace = SRGBColorSpace`

The official pixel example does exactly this in its `pixelTexture()` helper [S2]. The texture `colorSpace` default is `NoColorSpace`, and the docs say colour textures "should be annotated" [S7].

**Sprite sheets.** A `Texture`'s `source` "can be shared across textures. This is often useful in context of spritesheets where multiple textures render the same data but with different texture transformations" [S7]. `Texture.copy()` shares `source`, so cloning a texture per character to set its own `offset`/`repeat` does not upload the image again [S7].

**Billboards.** `THREE.Sprite` is "a plane that always faces towards the camera". Its anchor point is `center` (default `(0.5, 0.5)`); set it to `(0.5, 0)` to anchor at the feet. `SpriteMaterial` defaults to `transparent = true` and `sizeAttenuation = true` [S8]. Sprites cannot cast shadows [S8]. An alternative is plain `PlaneGeometry` meshes: they give you control over orientation and batching.

**Transparency.** Pixel art alpha is binary, so use `alphaTest` (for example 0.5) with `transparent = false`. With `alphaTest`, "the material will not be rendered if the opacity is lower than this value" [S9]. Sprites then go into the opaque list and the depth buffer handles ordering. They skip the sort described in §2.2 (derived from [S4]).

**Pixel-perfect scale.** Pick an integer number of screen pixels per art pixel (N), then size the orthographic frustum from it: `frustumHeightWorld = canvasHeightDevicePx / (N × artPxPerWorldUnit)` (derived).
- The simplest robust variant is to render at the virtual resolution itself: canvas `width/height` = device size / N. Then upscale with CSS `image-rendering: pixelated` (§2.4) or with a single nearest-filtered blit.
- At 1 texel = 1 fragment the grid is exact by construction, and a sprite cannot land between pixels (derived).

**Camera snapping.** When the camera follows the Warrior, round the camera's position along its own right and up axes to a whole virtual pixel. Then either shift the frustum edges by the leftover fraction, which is what the official example's `pixelAlignFrustum()` does [S2], or snap the position outright.
- Snap sprite world positions the same way (`pixelAlignObject()` in [S2]).
- Keep the true, unsnapped positions for gameplay and snap only a render copy. The example stores the true transform and restores it after rendering for the same reason [S2].

### 2.2 Pitfalls

- **Sorting of transparent objects is per object, not per pixel.** Three.js sorts opaque objects by `groupOrder → renderOrder → material.id → z → id`. It sorts transparent objects back-to-front by `groupOrder → renderOrder → z`, where `z` is the object's **origin** projected into clip space [S4, S5]. Large or intersecting quads therefore sort wrongly. The renderer's own docs warn that sorting "may not work in all cases… it may be necessary to turn off sorting… e.g. manually determining each object's rendering order" [S5].
- **`renderOrder` does not merge the two lists.** "Opaque and transparent objects remain sorted independently". On a `Group`, all descendants are sorted together [S6]. A classic isometric painter's sort (for example `renderOrder = -(isoX + isoY)`) only works if walls and props are in the same list as the sprites (derived).
- **Upright billboards clip into walls.** A camera-facing quad leans back with the camera. Its top half therefore sits behind the character's feet and can go through a wall that the feet are in front of (derived). Fixes:
  - (a) Turn off depth test for sprites and painter-sort *everything* by iso depth.
  - (b) In the vertex shader, give all four vertices the clip-space depth of the foot point, so the quad tests as one flat depth.
  - (c) Stand the quads vertically on the ground and stretch their height by 1/cos(elevation) to undo the foreshortening.

  None of these comes from a three.js doc. They are general techniques and **unverified** for this project; a prototype should settle it.
- **Avoid depth written from the fragment shader.** On Mali, a fragment shader that can `discard` (which `alphaTest` compiles to) or that writes depth cannot use Early-Z; Arm recommends minimising both. Forward Pixel Kill exists as a fallback [D7] *(search summary)*. So option (b) above belongs in the vertex shader, not a `gl_FragDepth` write (derived).
- **Texture atlas bleeding:** with nearest sampling, UVs that sit exactly on texel borders can pick up the neighbouring frame. Pad frames by 1–2 px or inset UVs by half a texel (**unverified**, common practice).
- **Non-integer scaling** gives uneven pixel widths. `devicePixelRatio` is often non-integer on phones [M1], and MDN warns `canvas.width = width * devicePixelRatio` "will cause moire artifacts with non-integer values" [M2]. Choose N from the real device-pixel canvas size (§3.3), not from CSS pixels.
- **One `Sprite` = one draw call.** Draw calls are the main scene-graph cost. The manual's example with thousands of separate meshes ran at under 20 fps on the author's machine until the meshes were merged [S12]. Batch with `InstancedMesh`: same geometry and material, per-instance transform [S10]. Or batch with `BatchedMesh`, which sorts its own members back-to-front when transparent (`sortObjects = true`) and accepts a `setCustomSort()` [S10].

### 2.3 Mobile cost

- **Fill rate dominates.** If rendered at display resolution, each blended sprite layer costs its full screen area. Arm: "high levels of overdraw can reduce performance, even if the cost per fragment is low… minimize the number of layers of transparent fragments" [D7] *(search summary)*.
- **Rendering at virtual resolution removes most of this.** Example (derived): 480×216 at N = 5 is 0.10 Mpx, about 4% of the native 2.59 Mpx.
- **Draw calls:** MDN recommends batching and texture atlases ("If you have 1000 sprites to paint, try to do it as a single drawArrays()") [M2]. At the PoC's scale (one Warrior, a handful of Enemies, one Area), draw calls are low even without instancing (derived). Tiles and walls are where instancing or merging matters.
- **Memory:** use RGBA8 PNG atlases. MDN notes RGB formats may be emulated and slower, and that GPU-compressed formats save bandwidth [M2]. Compressed formats (ETC2/ASTC) blur pixel art and are **not recommended** for sprites (derived from "worse quality than JPG" [M2]).

### 2.4 The upscale step (applies to both approaches)

- **Option 1: CSS upscale.** Set a small `canvas.width/height` and a full-size `style.width/height`. MDN lists "rendering to a smaller back buffer, and upscaling" as the standard quality-for-speed trade [M2].
  - `image-rendering: pixelated` scales "with nearest neighbor… to the nearest integer multiple… then uses smooth interpolation to bring the image to the final desired size" [M4]. A non-integer remainder is therefore blurred slightly, not jagged.
  - `pixelated` is supported in Chrome 41+, Safari 10+ and Firefox 93+ [M11].
- **Option 2: WebGL upscale.** Render into a low-res `WebGLRenderTarget` with `NearestFilter`, then draw one full-screen textured quad. This is what `RenderPixelatedPass` does internally [S1]. It gives control over letterboxing and UI crispness, at the cost of one native-resolution pass.

---

## 3. Approach B: pixelated 3D

### 3.1 Technique (as shipped in three.js)

`RenderPixelatedPass(pixelSize, scene, camera, {normalEdgeStrength=0.3, depthEdgeStrength=0.4})` [S1]:
1. **`setSize(w, h)`** sets the internal resolution to `(w / pixelSize) | 0` × `(h / pixelSize) | 0` [S1].
2. **Beauty pass.** Renders the scene into `_beautyRenderTarget`: `NearestFilter`, **`HalfFloatType`**, with a `DepthTexture` [S1].
3. **Normals pass.** Renders the scene **again** with `scene.overrideMaterial = MeshNormalMaterial` into `_normalRenderTarget`, also half-float [S1].
4. **Full-screen shader.** Samples the 4 neighbours in depth and normals. It darkens depth edges (outer silhouette) and brightens normal edges (inner creases), giving one-pixel outlines [S1]. Setting either strength to 0 skips that branch [S1].
5. **Output.** Writes to the composer's `writeBuffer`, or to the screen if `renderToScreen` [S1].

The official example `webgl_postprocessing_pixel.html` [S2]:
- `OrthographicCamera`, `pixelSize = 6`, followed by `OutputPass` for colour space and tone mapping [S2, S3].
- `renderer.setPixelRatio(devicePixelRatio)` is **commented out** [S2].
- Snapping is exposed as lil-gui toggles: `pixelAlignedPanning` (frustum-edge shift), `pixelAlignedObjects` (snap positions on the camera's right/up axes, depth left alone), `rotationSnap` (15°, in camera space), `cameraRotationSnap` (9°) and `cameraZoomSnap` (0.1) [S2].
- The glowing object's brightness is quantised to a few levels "to match the pixelated aesthetic" [S2].
- Textures use nearest filtering with no mipmaps [S2].

WebGPU renderer equivalents also exist: `PixelationPassNode` / `PixelationNode` (TSL) [S15]. For outlines under WebGPU, `ToonOutlinePassNode` replaces `OutlineEffect` [S13].

### 3.2 Pitfalls

- **Shimmer ("pixel crawl")**: any sub-pixel camera or object motion changes which texels fall into each low-res pixel. The fix is the example's three snaps: frustum, positions, rotations [S2]. Camera rotation and zoom must also snap, or the grid changes scale [S2]. For a fixed isometric camera, rotation and zoom never change, so position snapping is what matters (derived).
- **`pixelSize` is in device pixels, not CSS pixels.** `EffectComposer` calls `pass.setSize(width × pixelRatio, height × pixelRatio)` [S3]. If you later call `setPixelRatio(2.75)`, the same `pixelSize` gives art pixels 2.75× smaller on screen (derived).
- **Truncation.** `(w / pixelSize) | 0` truncates [S1]. Unless the canvas size divides evenly, the low-res target is stretched by a non-integer factor, and some screen pixel columns become one device pixel wider (derived). Size the canvas to a multiple of `pixelSize` and letterbox the remainder.
- **Readability.**
  - Smooth skeletal animation at 60 fps looks like "3D in a mosaic", not pixel art. Sample the `AnimationMixer` at a stepped rate (for example, advance it only every 1/12 s) and snap facing to the 8 directions. **Unverified** as a three.js-documented technique; it follows from the example's `rotationSnap` idea [S2].
  - Very small models lose detail at low resolution. Pick the camera zoom so the Warrior is at least ~32 virtual pixels tall (**unverified** rule of thumb).
- **Outlines:**
  - Built-in edges come free with the pass [S1].
  - `OutlineEffect` draws toon inverted-hull outlines: a second scene render with `BackSide` outline materials [S13].
  - `OutlinePass` (selection glow) runs several extra scene and full-screen passes, including separable blurs [S13]. Too heavy for this phone (derived).
- **Lighting/shadows:** `renderer.shadowMap.enabled = true` in the example [S2] adds a shadow-map render per light (standard three.js behaviour, **unverified** count). Flat or toon lighting and baked shadows keep costs down.
- **Float targets.** Both targets are `HalfFloatType` [S1], and so are `EffectComposer`'s own targets [S3]. MDN: "Don't assume you can render into float textures". On WebGL2, rendering to float16 needs `EXT_color_buffer_float` or `EXT_color_buffer_half_float` [M2]. For flat pixel art, 8-bit targets would do and halve the memory traffic. That requires copying and patching the pass (derived).

### 3.3 Mobile cost

- **Low-res passes are cheap per fragment:** the scene is rasterised twice, but at 1/pixelSize² of the pixel count [S1].
- **Draw calls and vertices double:** the normals pass re-renders every object [S1].
- **Full-resolution passes are the real cost.** With the default chain (`RenderPixelatedPass` → `OutputPass`), the pixelated pass writes a **native-resolution** half-float `writeBuffer` [S1, S3], then `OutputPass` reads that and writes the canvas. That is two native-resolution full-screen passes and one native-resolution RGBA16F buffer (derived).
  - At 2400×1080 that is ~2.6 Mpx per pass, ~155 Mpx/s at 60 fps (derived).
  - Tile-based mobile GPUs pay for every external framebuffer write (next bullet).
  - Cheaper routes: set `renderToScreen` on the pixelated pass with a custom output-colour step, or render the low-res target yourself and use the CSS upscale from §2.4 (derived).
- **Tile-based GPUs.** Adreno uses binned, tile-based rendering in on-chip GMEM ("FlexRender" switches between binned and direct) [D8] *(search summary)*. Mali is also tile-based (widely documented by Arm, but **unverified** here: the Arm pages could not be fetched). MDN advises `invalidateFramebuffer` for depth/stencil you won't reuse, "particularly on tiled-rendering GPUs common on mobile" [M2]. Every render-target switch in the pass chain costs a tile store and reload (derived).

### 3.4 devicePixelRatio (both approaches)

- `devicePixelRatio` is physical pixels per CSS pixel. Browser zoom changes it; pinch-zoom does not. Watch it with `matchMedia`. Phones "often yield… greater than 2" [M1].
- The three.js manual:
  - calls `renderer.setPixelRatio(devicePixelRatio)` "strongly NOT RECOMMENDED". Size the canvas yourself (`clientWidth * devicePixelRatio`, floored) instead, so "we always know the size being used" [S11]
  - warns high DPR means rendering "9x the pixels" on a 3× phone [S11]
  - suggests capping the drawing-buffer pixel count [S11]
- Exact device-pixel size: `ResizeObserver` with `'device-pixel-content-box'` gives it [M2, M3]. Supported in Chrome 84+ (Android mirrors desktop) and Firefox 108+, **not Safari** [M11]. MDN also shows "pre-snapping" the canvas position to whole device pixels [M2].
- **For pixel art (derived):** DPR only matters when you pick N (screen pixels per art pixel). Compute `devicePx = floor(cssSize × DPR)` (or read `devicePixelContentBoxSize`), then `virtualSize = floor(devicePx / N)`, and set `canvas.width = virtualSize` with CSS size = `virtualSize × N / DPR`. Never pass DPR to `setPixelRatio`. Rendering at native DPR and then pixelating wastes the fill rate the pixelation saves.
- **Redmi DPR is unverified.** Android density buckets suggest ~2.75, i.e. ~873×393 CSS px in landscape. Log `devicePixelRatio`, `innerWidth` and `innerHeight` on the phone.
- **Useful integers (derived):** 2400 and 1080 are both divisible by 3, 4, 5, 6, 8, 10 and 12. In fullscreen the virtual resolution can be 800×360 (N=3), 600×270 (N=4), 480×216 (N=5) or 400×180 (N=6) with no remainder. With browser bars showing, the height shrinks and you letterbox.

---

## 4. Test device

### 4.1 Variants

| Model | SoC | GPU | Display | Source |
|---|---|---|---|---|
| Redmi Note 11 Pro (global, 4G) | MediaTek Helio G96: 2× Cortex-A76 @2.05 GHz + 6× A55 | **Arm Mali-G57 MC2** | 6.67" AMOLED, 2400×1080, 120 Hz, 395 ppi | [D1, D3] *(search summary)* |
| Redmi Note 11 Pro 5G (global) | Qualcomm Snapdragon 695 (6 nm): 2× A78 @2.2 GHz + 6× A55 | **Adreno 619** | 6.67" AMOLED, 2400×1080, 120 Hz, 395 ppi | [D2, D4] *(search summary)* |
| Redmi Note 11 Pro (China) / 11 Pro+ 5G | MediaTek Dimensity 920 | Mali-G68 MC4 | 6.67" AMOLED, 2400×1080 | [D5] *(search summary)* |

- **Which one is the test phone?** Check Settings → About phone, or read `WEBGL_debug_renderer_info` → `UNMASKED_RENDERER_WEBGL` in Chrome. The extension is supported since Chrome 33; privacy settings may hide it [M12].
- **Mali-G57** is Arm's "first generation Valhall-based GPU for the mainstream market" [D6] *(search summary)*. "MC2" = 2 shader cores (Arm naming convention, **unverified** on Arm's page).
- **Helio G96** supports displays up to FHD+ at 120 Hz [D3] *(search summary)*.
- **Snapdragon 695** is marketed for gaming up to FHD+ [D4] *(search summary)*.
- **Benchmarks:** UL has 3DMark pages for both variants [D10], but I could not read the scores. The relative GPU strength of G57 MC2 vs. Adreno 619 is **unverified** here.

### 4.2 Browser platform notes

- **Refresh rate.** `requestAnimationFrame` "will generally match the display refresh rate" [M8]. On a 120 Hz panel the loop may run at 120 Hz, which leaves 8.3 ms per frame. Drive the game with delta time, and decide whether to cap simulation or rendering at 60 (derived). Whether MIUI/HyperOS runs Chrome at 60 or 120 Hz by default is **unverified**; log the rAF interval on the phone.
- **WebGPU** has been on by default since Chrome 121 on Android 12+ with Qualcomm or Arm GPUs [D9] *(search summary)*. The Redmi shipped with Android 11 [D2] *(search summary)*; its current Android version is **unverified**. WebGL2 is the safe baseline.
- **Context attributes.** `WebGLRenderer` defaults to `antialias = false` and `powerPreference = 'default'` [S5]. MSAA does nothing for pixel art, so keep antialias off. MDN warns that `alpha:false` "can be expensive" on some platforms [M2].
- **Fullscreen and orientation.** `requestFullscreen()` requires transient user activation [M9]. `screen.orientation.lock('landscape')` is "typically… only enabled on mobile devices, and when the browser context is full screen". Supported: Chrome Android 38+. Not supported: Safari/iOS [M10, M11]. On iPhone, `requestFullscreen` is unavailable except for iPad-only partial support [M11]. Plan a "rotate your phone" overlay as a fallback (derived).

### 4.3 What can it render at 60 fps?

No primary source gives a three.js budget for these GPUs. **All figures below are engineering estimates (unverified) to confirm with a day-one measurement**, using `renderer.info.render.calls` / `.triangles` [S14] and the FPS graph from §5.2.

- **Budget (derived):** 60 fps = 16.7 ms per frame, and 8.3 ms if the loop runs at 120 Hz [M8].
- **Approach A at virtual resolution** (≤ 0.2 Mpx, a few dozen sprites, a tile layer that is instanced or merged, well under 100 draw calls) should be far below the limits of either GPU (estimate).
- **Approach B at virtual resolution** (a few low-poly characters of a few thousand triangles each, a merged Area, ×2 for the normals pass, flat or toon lighting, at most one shadow-casting light):
  - also likely fine (estimate)
  - the full-resolution composite passes (§3.3) and shadows are the first things to cut if frame time runs over
- **Either approach at native DPR** (2.6 Mpx, several full-screen passes) is where a Mali-G57 MC2 is most likely to fall below 60 fps (estimate, based on the cost model in [S11] and the tile-GPU guidance in [D7, D8]).
- **Measure on the phone:** frame time with (a) empty scene + composite chain, (b) full Area, (c) Area + 3 Enemies, at N = 4/5/6. Record `renderer.info` and the rAF rate.

---

## 5. Input and Tuning panel libraries

### 5.1 Touch input

- **Pointer Events (built in):**
  - One event model for mouse, pen and touch; `pointerType` identifies the device [M5]
  - Each finger has its own `pointerId`, and `isPrimary` marks the main pointer. Track the left-thumb joystick and right-thumb attack by `pointerId` [M5]
  - Touchscreens capture the pointer implicitly on `pointerdown`; `setPointerCapture` makes it explicit [M5]
  - Browsers fire `pointercancel` when they take over a gesture for pan or zoom [M5]
- **`touch-action: none`** on the game canvas and its overlay stops the browser from handling pan and zoom there. Changes to `touch-action` after a gesture starts have no effect, so set it in CSS up front [M6].
- **`getCoalescedEvents()`** returns the individual moves merged into one `pointermove`. It needs a secure context (fine on GitHub Pages HTTPS) [M7]. A joystick only needs the latest position each frame, so this is optional (derived).
- **nipplejs** `1.0.4` (MIT; released 2026-03; ships `index.d.ts` and ESM; no dependencies) [L1]:
  - "A vanilla virtual joystick for touch capable interfaces" [L1]
  - Three modes [L1]:
    - `dynamic`: a new joystick at each touch, can be multitouch
    - `semi`: a joystick stays reusable within `catchDistance`
    - `static`: fixed at `position`
  - `multitouch` is off in `static` and `semi` modes [L1]
  - The `move` event carries `vector` (unit vector), `force`, `distance`, `angle.radian/degree` and a `raw` position [L1]
  - `threshold` sets the dead zone for direction events. `dataOnly` produces no DOM. `restJoystick`/`restOpacity` control recentring. `lockX`/`lockY` restrict to one axis. `follow` lets the base follow the thumb [L1]
  - For 8-way facing, quantise `angle` into 45° sectors yourself (derived)
- **Hand-rolled alternative:** about 60 lines of Pointer Events code (derived). It gives full control over the dead-zone curve and the 8-way snap, which are values the Tuning panel should expose anyway.

### 5.2 Tuning panels

- **lil-gui** `0.21.0` (MIT; ESM + `.d.ts`) [L1-npm, L2]:
  - Drop-in replacement for dat.gui [L2]
  - The three.js examples import it as `three/addons/libs/lil-gui.module.min.js`, so it is already in the `three` package [S2]
  - `touchStyles` (default `true`) "Makes controllers larger on touch devices" [L2]
  - Number controllers switch to a numeric keyboard on `(pointer: coarse)` and support touch-drag [L2]
  - `gui.save()` returns name → value objects and `gui.load(obj)` restores them. Save them to `localStorage` so tuned Feel values survive reloads (derived) [L2]
- **Tweakpane** `4.0.5` (MIT; ESM only since v4; types via `@tweakpane/core`) [L3]:
  - "Compact pane library for fine-tuning parameters and monitoring value changes", dependency-free [L3]
  - Lists "Mobile support" and "JSON import / export" [L3]
  - Has read-only *monitor* bindings, and folders/tabs [L3]
  - `@tweakpane/plugin-essentials` adds an **FPS graph** (`view: 'fpsgraph'`, call `begin()`/`end()` around the frame), intervals, radio/button grids and a cubic-bezier editor [L4]. The bezier editor is handy for tuning easing curves on hit reactions (derived)
- **Either one:** create it only when `?tune` is present, and dynamic-`import()` it so the normal build does not ship it (derived).

---

## 6. Sources

**three.js** (all read directly from `mrdoob/three.js` `dev`, commit `023bd79`, 2026-09-25)
- [S1] RenderPixelatedPass: https://github.com/mrdoob/three.js/blob/dev/examples/jsm/postprocessing/RenderPixelatedPass.js
- [S2] Pixel example: https://github.com/mrdoob/three.js/blob/dev/examples/webgl_postprocessing_pixel.html (live: https://threejs.org/examples/webgl_postprocessing_pixel.html)
- [S3] EffectComposer / OutputPass: https://github.com/mrdoob/three.js/blob/dev/examples/jsm/postprocessing/EffectComposer.js, https://github.com/mrdoob/three.js/blob/dev/examples/jsm/postprocessing/OutputPass.js
- [S4] Render list sorting: https://github.com/mrdoob/three.js/blob/dev/src/renderers/webgl/WebGLRenderLists.js
- [S5] WebGLRenderer (`sortObjects`, `projectObject`, defaults, `setPixelRatio`): https://github.com/mrdoob/three.js/blob/dev/src/renderers/WebGLRenderer.js
- [S6] Object3D `renderOrder`: https://github.com/mrdoob/three.js/blob/dev/src/core/Object3D.js
- [S7] Texture (filters, mipmaps, colorSpace, shared `source`): https://github.com/mrdoob/three.js/blob/dev/src/textures/Texture.js
- [S8] Sprite / SpriteMaterial: https://github.com/mrdoob/three.js/blob/dev/src/objects/Sprite.js, https://github.com/mrdoob/three.js/blob/dev/src/materials/SpriteMaterial.js
- [S9] Material `alphaTest`: https://github.com/mrdoob/three.js/blob/dev/src/materials/Material.js
- [S10] InstancedMesh / BatchedMesh: https://github.com/mrdoob/three.js/blob/dev/src/objects/InstancedMesh.js, https://github.com/mrdoob/three.js/blob/dev/src/objects/BatchedMesh.js
- [S11] Manual, Responsive Design (HD-DPI): https://threejs.org/manual/#en/responsive (source: https://github.com/mrdoob/three.js/blob/dev/manual/pages/responsive.html)
- [S12] Manual, Optimize lots of objects: https://threejs.org/manual/#en/optimize-lots-of-objects (source: https://github.com/mrdoob/three.js/blob/dev/manual/pages/optimize-lots-of-objects.html)
- [S13] OutlinePass / OutlineEffect: https://github.com/mrdoob/three.js/blob/dev/examples/jsm/postprocessing/OutlinePass.js, https://github.com/mrdoob/three.js/blob/dev/examples/jsm/effects/OutlineEffect.js
- [S14] WebGLInfo (`renderer.info`): https://github.com/mrdoob/three.js/blob/dev/src/renderers/webgl/WebGLInfo.js
- [S15] PixelationPassNode (WebGPU/TSL): https://github.com/mrdoob/three.js/blob/dev/examples/jsm/tsl/display/PixelationPassNode.js
- [S16] npm `three`: https://www.npmjs.com/package/three

**MDN** (read from https://github.com/mdn/content and https://github.com/mdn/browser-compat-data)
- [M1] devicePixelRatio: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
- [M2] WebGL best practices: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- [M3] devicePixelContentBoxSize: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry/devicePixelContentBoxSize
- [M4] image-rendering: https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering
- [M5] Pointer events: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
- [M6] touch-action: https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
- [M7] getCoalescedEvents: https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/getCoalescedEvents
- [M8] requestAnimationFrame: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- [M9] requestFullscreen: https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
- [M10] ScreenOrientation.lock: https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock
- [M11] Browser compat data (ResizeObserverEntry, ScreenOrientation, Element, css image-rendering): https://github.com/mdn/browser-compat-data
- [M12] WEBGL_debug_renderer_info: https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info

**Device / GPU vendors** (*search summary* only: direct fetch blocked by the network proxy)
- [D1] Xiaomi, Redmi Note 11 Pro specs: https://www.mi.com/global/product/redmi-note-11-pro/specs/
- [D2] Xiaomi, Redmi Note 11 Pro 5G specs: https://www.mi.com/global/product/redmi-note-11-pro-5g/specs/
- [D3] MediaTek, Helio G96: https://www.mediatek.com/products/smartphones/mediatek-helio-g96
- [D4] Qualcomm, Snapdragon 695 5G: https://www.qualcomm.com/smartphones/products/6-series/snapdragon-695-5g-mobile-platform (brief: https://www.qualcomm.com/content/dam/qcomm-martech/dm-assets/documents/product_brief_-_snapdragon_695_5g_mobile_platform.pdf)
- [D5] MediaTek, Redmi Note 11 Pro+ 5G / Dimensity 920: https://www.mediatek.com/tek-talk-blogs/redmi-note-11-pro-5g-powered-by-mediatek-dimensity-920; China variant listing: https://www.gsmarena.com/xiaomi_redmi_note_11_pro_(china)-11159.php
- [D6] Arm, Mali-G57: https://developer.arm.com/Processors/Mali-G57
- [D7] Arm GPU Best Practices Developer Guide: https://developer.arm.com/documentation/101897/latest/ ; Early-Z: https://developer.arm.com/documentation/102224/0200/Early-Z
- [D8] Qualcomm, Adreno GPU on Mobile: Best Practices: https://docs.qualcomm.com/bundle/publicresource/topics/80-78185-2/mobile_best_practices.html
- [D9] Chrome, What's New in WebGPU (Chrome 121): https://developer.chrome.com/blog/new-in-webgpu-121
- [D10] UL Benchmarks (not read): https://benchmarks.ul.com/hardware/phone/Xiaomi+Redmi+Note+11+Pro+(Helio+G96)+review, https://benchmarks.ul.com/hardware/phone/Xiaomi+Redmi+Note+11+Pro+5G+review

**Libraries** (READMEs and source read directly from GitHub; versions from registry.npmjs.org)
- [L1] nipplejs README: https://github.com/yoannmoinet/nipplejs (npm: https://www.npmjs.com/package/nipplejs)
- [L1-npm] lil-gui on npm: https://www.npmjs.com/package/lil-gui
- [L2] lil-gui README + `src/GUI.js` + `src/NumberController.js`: https://github.com/georgealways/lil-gui (docs: https://lil-gui.georgealways.com/)
- [L3] Tweakpane README: https://github.com/cocopon/tweakpane (docs: https://tweakpane.github.io/docs/)
- [L4] Tweakpane essentials plugin: https://github.com/tweakpane/plugin-essentials

**Other**
- [W1] Wikipedia, Isometric video game graphics (2:1 dimetric, 26.565°) *(search summary)*: https://en.wikipedia.org/wiki/Isometric_video_game_graphics
