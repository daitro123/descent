# Which gritty candidates read best through the pixel pipeline on the Redmi?

Type: prototype
Mode: HITL
Status: open
Blocked by: 12

## Question

The research ([Which gritty, rigged 3D characters and dungeon kit could replace KayKit?](12-gritty-3d-assets.md)) couldn't judge how the gritty candidates *look* after the pixel pipeline (600×270 art pixels, flat Lambert, depth outline, ~48 px tall). Realistic textures (Mixamo) might turn to mush; low-poly or PSX art might read cleanly. Settle it by eye on the phone.

Put the candidates side by side in the existing scene, switchable, each animated with the CC0 Quaternius Universal Animation Library clips (idle, walk or run, a sword attack, block, hit):
- the current KayKit Knight (baseline),
- a decimated Mixamo Paladin and Warrok (gritty and realistic),
- a 0 A.D. swordsman and wolf (committable, grounded),
- the CC0 scoppio plate knight (PSX style),
- optionally the KayKit Dungeon floor and walls retextured dark, as an Area-kit option.

Decide which style(s) survive the pipeline well enough to be worth picking from, and whether they need a contrast or palette pass.

**Needs from the user:** the Mixamo files can't be committed or pushed anywhere public. Download them with your Adobe ID and load them only through `npm run dev` from a git-ignored folder, or drop Mixamo from the bake-off if the build-time fetch is ruled out first.
