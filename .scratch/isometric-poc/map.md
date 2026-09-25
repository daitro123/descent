# Map: Isometric PoC

Label: wayfinder:map

## Destination

A proof of concept you can play in a mobile browser at a public URL (GitHub Pages): the **Warrior**, 3 **enemy types**, and one small hand-built **Area**, rendered as isometric pixel art in TypeScript + Three.js, with the Warrior's movement and combat **feel** signed off by the user after playing it on their phone.

## Notes

- **Execution is in scope for this map.** Feel can only be judged by playing, so prototype and task tickets may produce real, kept code. The map closes when the user signs off the feel on-device, not when a spec exists. Throwaway prototypes are still captured per the `prototype` skill.
- **Stack:** TypeScript + Three.js (user's choice). Hosting: GitHub Pages, deployed by GitHub Actions.
- **Target:** a mobile browser in landscape, not tied to any one browser. Test device: Xiaomi Redmi Note 11 Pro (Android); target a steady 60 fps on it. Desktop mouse/keyboard should work, but only as a dev convenience.
- **Tempo:** slower and more deliberate than Diablo: few enemies at a time, telegraphed attacks, every swing matters. Story and pacing design belong to a separate, later wayfinder run.
- **Tuning:** feel values are tuned live on the phone through an in-game **Tuning panel** behind `?tune`.
- **8 directions** for movement and facing.
- **Art:** existing CC0 or licensed assets, good enough to judge readability and animation timing. Not final art.
- **Tracker:** local markdown, per `docs/agents/issue-tracker.md`. Research findings are committed under `.scratch/isometric-poc/research/` on the working branch.
- **Skills:** grilling tickets call `grilling` + `domain-modeling`; prototype tickets call `prototype`; research tickets call `research`. Use the vocabulary in `CONTEXT.md`.

## Decisions so far

<!-- one line per resolved ticket: [title](issues/NN-slug.md): gist -->

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
