# Map: Isometric PoC

Label: wayfinder:map

## Destination

A proof of concept you can play in a mobile browser at a public URL (GitHub Pages): the **Warrior**, 3 **enemy types**, and one small hand-built **Area**, rendered as isometric pixel art in TypeScript + Three.js, with the Warrior's movement and combat **feel** signed off by the user after playing it on their phone.

## Notes

- **Execution is in scope for this map.** Feel can only be judged by playing, so prototype and task tickets may produce real, kept code. The map closes when the user signs off the feel on-device, not when a spec exists. Throwaway prototypes are still captured per the `prototype` skill.
- **Stack:** TypeScript + Three.js (user's choice), built with Vite. Run and phone-access notes are in `README.md`.
- **Repo and hosting:** the repo is public (for now) and deploys to GitHub Pages through GitHub Actions on every push to `main`, the default branch. Branch work reaches the phone by merging into `main`, or over Wi-Fi with `npm run dev`.
- **Target:** a mobile browser in landscape, not tied to any one browser. Test device: Xiaomi Redmi Note 11 Pro (Android), believed to be the 4G model (Mali-G57 MC2 GPU), usually in Brave; target a steady 60 fps on it. Desktop mouse/keyboard should work, but only as a dev convenience.
- **Tempo:** slower and more deliberate than Diablo: few enemies at a time, telegraphed attacks, every swing matters. Story and pacing design belong to a separate, later wayfinder run.
- **Tuning:** feel values are tuned live on the phone through an in-game **Tuning panel** behind `?tune`.
- **8 directions** for movement and facing.
- **Art:** existing CC0 or licensed assets, good enough to judge readability and animation timing. Not final art.
- **Tone:** gritty and grounded, not cute or chunky. KayKit is only a stand-in until the asset pick.
- **Tracker:** local markdown, per `docs/agents/issue-tracker.md`. Research findings are committed under `.scratch/isometric-poc/research/` on the working branch.
- **Skills:** grilling tickets call `grilling` + `domain-modeling`; prototype tickets call `prototype`; research tickets call `research`. Use the vocabulary in `CONTEXT.md`.

## Decisions so far

<!-- one line per resolved ticket: [title](issues/NN-slug.md): gist -->
- [How do you render isometric pixel art with Three.js on a mid-range Android phone?](issues/01-threejs-pixel-rendering.md): both approaches = low-res render, whole-number nearest-neighbour upscale, pixel-snapped camera; 2D is hard on depth ordering, 3D costs a second render and float targets; 120 Hz screen means delta-time updates.
- [Which CC0 or licensed asset packs could the PoC use?](issues/02-asset-candidates.md): KayKit (CC0, 3D) leads both approaches (as models, or rendered by us into 8-direction sprites); paid pixel-art packs can't be committed to the public repo.
- [Scaffold the TypeScript + Three.js project and deploy it to GitHub Pages](issues/03-scaffold-and-deploy.md): live at https://daitro123.github.io/descent/, deployed on every push to `main`; the empty scene holds 60 fps at the full 2400×1080 on the Redmi (Brave, rAF at 60 Hz; GPU name hidden by Brave, phone believed to be the 4G / Mali-G57 model).
- [Pixel art from 2D sprites or from pixelated 3D models?](issues/04-rendering-approach.md): pixelated 3D: live skinned models with smooth, blended animation (won on feel on the Redmi; fps looked steady for all three variants). Assets must be rigged 3D; the camera may rotate or zoom. Folded into `src/render/` and `src/scene/`.
- [Where can the PoC be hosted from the private repo, for free?](issues/11-hosting.md): GitHub Pages, with the repo made public for now; deploys from `main`. Cloudflare Pages is the fallback if the repo goes private again.
- [Which gritty, rigged 3D characters and dungeon kit could replace KayKit?](issues/12-gritty-3d-assets.md): no free set is gritty, animated and from one artist. Animations are solved with CC0 Quaternius UAL1+2 on one rig. Characters: Mixamo or Synty (build-time fetch), 0 A.D. (CC-BY-SA, committable), or PSX packs. Area: retexture KayKit Dungeon dark, or Synty. Judge by eye on the Redmi.

## Not yet specified

- **Area layout:** size, walls and props, and what happens when the Warrior walks behind a wall (cutaway, silhouette, fade). Depends on the chosen assets and camera.
- **Collision and pathfinding:** how much is needed depends on the control scheme (tap-to-move implies pathfinding; a joystick may not).
- **HUD and readability:** Warrior health, cooldowns, how enemy telegraphs read on a small screen.
- **Death and restart loop,** plus a minimal start screen.
- **Encounter placement:** where the enemies stand in the Area and how many at a time, to fit the slower tempo.
- **Building the PoC:** splitting the real implementation into build tickets once rendering, controls, combat and enemies are decided.
- **Feel sign-off:** what "feel approved" concretely means (a checklist? a play session with notes?).
- **Performance check** on the Redmi once the full scene exists.

## Out of scope

- Audio of any kind.
- Loot, inventory, levelling, stat progression, saving.
- Classes other than the Warrior; multiplayer.
- Story, dialogue, quests, and overall pacing design (a separate wayfinder run).
- Final art direction and custom art.
- Procedural generation.
- Menus beyond start/restart.
