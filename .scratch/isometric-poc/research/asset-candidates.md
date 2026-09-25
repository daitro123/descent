# Asset candidates for the PoC

Answers [issue 02](../issues/02-asset-candidates.md): which CC0 or licensed packs could supply the **Warrior**, 3 **Enemy types** and one **Area**, for each rendering approach (2D sprites, or pixelated 3D). Researched 2026-09-25.

**How much was verified.** The sandbox blocked itch.io, kenney.nl, quaternius.com, opengameart.org, craftpix.net, poly.pizza and sketchfab. GitHub was reachable. So:

- **[V] Verified**: read from the primary source files themselves: the creator's own GitHub repo, the LICENSE text, and the animation names read out of the shipped `.glb` / sprite-definition files.
- **[S] Search snippet**: taken from the search engine's index of the creator's own store page, which could not be opened. Check these on the page before relying on them, especially price and licence wording.
- **[U] Unverified**: inferred, or no primary source found.

## Summary table

| # | Candidate | Approach | Covers | Licence | Public repo OK? | Price | Directions | Key animations | Style match | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| **3D-1** | **KayKit Adventurers + Skeletons + Dungeon Remastered** (Kay Lousberg) | 3D | Warrior (Knight or Barbarian), 4 skeleton enemies, 200+ dungeon pieces | CC0 1.0 | Yes | Free (optional EXTRA tiers) | Any (3D) | Idle, Walking_A/B/C, Running, 1H/2H attacks, Block, Hit_A/B, Death_A/B, Dodge x4 | One artist, one rig, one atlas style | [V] |
| **3D-2** | **Quaternius RPG Characters + Ultimate Monsters + Modular Dungeon** | 3D | Warrior, 50 monsters, dungeon kit | CC0 | Yes | Free | Any (3D) | ~14 per character (Idle, Walk, Run, Attack, Death, Roll...) | One artist; flatter and cuter than KayKit | [S] |
| 3D-3 | Kenney Mini Dungeon (+ Blocky Characters) | 3D | human + orc characters, ~20-30 dungeon pieces | CC0 | Yes | Free | Any (3D) | "includes animations" (list not seen) | Consistent but toy-like and very small | [S] |
| **2D-1** | **KayKit models pre-rendered to 8-direction sprite sheets** (do it ourselves) | 2D (from 3D) | Same as 3D-1 | CC0 | Yes | Free + tooling time | 8 (or any) | Whatever we render from the clips above | Perfect (same source) | [V] licence / [U] effort |
| **2D-2** | **Flare "fantasycore" art** (Clint Bellanger et al.) | 2D | Layered hero, 19 enemy definitions (skeleton, goblin, zombie, minotaur, antlion, wyvern...), dungeon/cave/grassland isometric tilesets | CC-BY-SA 3.0 (or later) | Yes, with attribution + share-alike on the art | Free | 8 | stance, run, swing, block, hit, die, critdie (+cast/shoot); **no walk** | Coherent single game art set; painterly pre-render, not true pixel art | [V] |
| **2D-3** | **SmallScaleInt** character + enemy + isometric tileset packs | 2D | Warrior-type heroes, Orcs & Goblins (31), Empire enemies (13), Zombies, isometric 2D Fantasy tileset (1800+ tiles) | Custom: commercial use OK, **no redistribution** | **Raw files must stay out of the public repo** | ~$10-25 per pack | 8 | "30+ animations per character" | One artist across chars and tiles; true pixel art | [S] |
| 2D-4 | Hormelz 8-Directional Knight | 2D | Warrior only | CC0 | Yes | Free (paid variants exist) | 8 | 33 incl. Idle, Walk, Run, Attack, Combo, Block, Impact, Die 1/2 | No matching enemies or tiles | [S] |
| 2D-5 | Engvee isometric characters (Halberd Warrior, Orc Warrior, Skeleton, Thief, Juggernaut...) | 2D | Warrior + several enemies, no tiles | Not found (free ones say "prototyping and non-commercial" for at least one) | [U] | Free to ~$4 each | 8 or 16 | e.g. Orc: Attack1-3, Death, Hits, Idle, Run, Walk, Block | One artist; pre-rendered 3D look | [S] licence [U] |
| 2D-6 | MrMGames Goblin Characters Pack | 2D | 5 goblins (enemies only) | Store licence not seen | [U] | $30+ | 8 | 15: Attack 1-4, Block, Combat Run, Death, Dodge, Get Hit, Idle, Idle Combat, Run, Stunned, Walk, Walk 2 | Enemies only | [S] |
| 2D-7 | zaicuch Skeleton isometric pack | 2D | 1 skeleton enemy | Store licence not seen | [U] | $5+ | 8 | not listed in snippet | Enemy only | [S] |
| Tiles | Kenney Isometric Miniature Dungeon | 2D tiles | walls, floors, props + 1 character | CC0 | Yes | Free | 8 (character) | 3 (names not seen) | Kenney miniature look | [S] |
| Tiles | Screaming Brain Studios "Isometric Stone Soup" | 2D tiles | 1895 floor/wall tiles, 64x32 | CC0 | Yes | Free | n/a | n/a | Converted from DCSS tiles; no props or monsters | [S] |
| Reject | Clint Bellanger "Isometric Hero and Creatures" | 2D | hero + ~15 creatures | CC-BY 3.0 | Yes | Free | 8 | move 4 frames; attack, hit, dead are **single frames** | Consistent, but too few frames to judge Feel | [S] |
| Reject | CraftPix isometric packs | 2D | varies | CraftPix file licence: no redistribution of the original files | Raw files out of repo | varies | varies | varies | varies | [S] |

### Top picks

**3D approach**
1. **3D-1 KayKit (Adventurers + Skeletons + Dungeon Remastered).** CC0, free, on GitHub, one artist, one shared rig. Every character carries the same 76-95 named clips (read from the files), including all five the ticket asks for. Enemy variety is the weak point: all 4 free enemies are skeletons. They differ in silhouette and weapon (Minion unarmed and weak, Warrior with sword and shield, Rogue with crossbow, Mage with staff), which is enough for 3 Enemy types that behave differently. The $7.95 EXTRA tier adds a Skeleton Golem on a larger rig, if a heavy enemy with a different silhouette is wanted [S].
2. **3D-2 Quaternius**, as the fallback, or as a source of non-skeleton monsters. It is also CC0 and has far more monster variety, but only ~14 clips per character, and a flatter, cuter style that will not quite match KayKit.
3. 3D-3 Kenney is a distant third: CC0 and tiny, but it reads as toys, not Diablo.

**2D approach**
1. **2D-1: render the KayKit set to 8-direction sprite sheets ourselves.** This is the only 2D option that is free, CC0, fully style-matched across Warrior, enemies and tiles, and has every animation we want. It costs a Blender or Three.js offline render step (8 directions x N clips, orthographic camera at the game's angle, low resolution, nearest-neighbour). It also keeps the 2D and 3D approaches on the same art, which makes comparing them fairer.
2. **2D-2 Flare fantasycore.** Free, open, a proven isometric ARPG art set with 8 directions, a hero, many enemies and matching tilesets, in a public repo that is still maintained (last commit August 2026). Caveats: CC-BY-SA, a hero built from layers (paper-doll) that has to be composited, only a run cycle with no walk, and a painterly pre-rendered HD look (192x96 tiles) that would need downscaling and palette reduction to read as pixel art.
3. **2D-3 SmallScaleInt**, if hand-made pixel art matters more than licence convenience. It is the most complete single-artist commercial set found (8 directions, 30+ clips, enemies and an isometric tileset from the same artist). But the licence forbids redistribution, so the raw sheets cannot be committed to this public repo (see below). Every detail is [S] and needs checking on the store page.

## Licence and the public repo

- **CC0 (KayKit, Quaternius, Kenney, Hormelz, Stone Soup):** no conditions. Raw files may sit in the public repo and ship in the GitHub Pages build. Crediting the creator is still polite; KayKit's LICENSE asks for it but says it is not mandatory [V].
- **CC-BY 3.0 / CC-BY-SA 3.0 (Flare, Clint Bellanger OGA):** raw files may sit in a public repo and ship. We need a credits file naming the authors and the licence. Share-alike applies to the art and to our edits of it, which must stay CC-BY-SA. That the game code is not an "adaptation" is the usual reading of CC-BY-SA for games, but it is [U] here: the CC FAQ was not checked. Flare keeps per-file attribution on its wiki Credits page [V: link in README].
- **"Use in your game, no redistribution" licences (SmallScaleInt, CraftPix, most paid itch.io packs):** shipping the sprites inside the deployed game is the permitted use. **Committing the raw pack files to a public GitHub repo is redistribution**, because anyone can download the pack from the repo. Community guidance matches this: leave non-redistributable assets out of public repos and use placeholders plus a README note [S: itch.io Game Off FAQ]. Workable pattern: gitignore them, and have GitHub Actions fetch them at build time from private storage (a private repo or a secret URL) before deploying the Pages artifact. Note that the Pages site itself still serves the final sheets over HTTP, as any web game does. This is not legal advice; read the exact store licence before buying.
- **Unknown licence (Engvee, MrMGames, zaicuch):** treat as "no redistribution" until the store page says otherwise.

## Details

### 3D-1 KayKit: Adventurers, Skeletons, Dungeon Remastered [V]

- **Links:** GitHub [Adventurers](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0), [Skeletons](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0), [Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0). Store: `kaylousberg.itch.io/kaykit-adventurers`, `/kaykit-skeletons`, `/kaykit-dungeon-remastered`.
- **Licence:** CC0 1.0, from the README and LICENSE.txt: "This content is free to use in personal, educational and commercial projects." Attribution optional.
- **Price:** free on GitHub and itch.io. The EXTRA tier on itch.io adds characters: +2 each for Adventurers and Skeletons. Skeletons EXTRA is $7.95+ and adds Skeleton Golem and Necromancer [S]. A larger KayKit roster (orc, werewolf...) exists only in the paid "Mystery Monthly Series 4+" packs, $19.99+ each, CC0 [S].
- **Contents (read from the repo trees):**
  - Adventurers: `Knight.glb`, `Barbarian.glb`, `Mage.glb`, `Rogue.glb`, `Rogue_Hooded.glb`, plus 25+ separate weapons and shields (1H/2H sword, axe, shields...). Knight or Barbarian is the Warrior.
  - Skeletons: `Skeleton_Minion`, `Skeleton_Warrior`, `Skeleton_Rogue`, `Skeleton_Mage` (.glb), plus weapons.
  - Dungeon Remastered: 203 `.glb` pieces. The main groups are floor (34), wall (32), banner (42), table (14), trunk (9), stairs (8), barrier (5) and pillar/column, plus props: barrels, boxes, crates, chest, torches, candles, shelves, bed, rubble, keg, coins. It is a dungeon (indoor) kit; there is no outdoor ground set in this pack.
- **Rig and animations:** each character `.glb` has 1 skin. Adventurers carry **76** clips and Skeletons **95** (names read from the glTF JSON). The ones the PoC needs:
  - idle: `Idle`, `2H_Melee_Idle`, `Unarmed_Idle` (Skeletons add `Idle_B`, `Idle_Combat`)
  - walk and run: `Walking_A/B/C`, `Walking_Backwards`, `Running_A/B`, `Running_Strafe_Left/Right` (Skeletons add `Walking_D_Skeletons`, `Running_C`)
  - attack: `1H_Melee_Attack_Chop / Slice_Diagonal / Slice_Horizontal / Stab`, `2H_Melee_Attack_Chop / Slice / Spin / Stab`, `Dualwield_*`, `Block_Attack`, `Unarmed_Melee_Attack_*` (Skeletons add `1H_Melee_Attack_Jump_Chop`)
  - hit and block: `Hit_A`, `Hit_B`, `Block`, `Blocking`, `Block_Hit`
  - death: `Death_A`, `Death_B` (+ `_Pose` end frames). Skeletons add `Death_C_Skeletons` and `Death_C_Skeletons_Resurrect`.
  - extras useful for Feel: `Dodge_Forward/Backward/Left/Right`. Skeletons add `Spawn_Ground`, `Skeletons_Awaken_Floor/Standing`, `Taunt` and `Spellcast_*`, which are good for telegraphs.
- **Style:** one artist and one gradient-atlas texture (1024x1024, "can be downsampled to 128x128"). The chunky proportions and flat colour areas should survive pixelation well [U until tested].
- **Formats and size:** FBX and glTF. Each character GLB is **3.6-4.9 MB** because every clip is embedded. For mobile, strip unused clips (e.g. with gltf-transform) and share one clip set across characters, since they use the same rig [U: sharing clips between packs assumes the rigs match; the names match, which suggests they do].
- **Separate animation library:** "KayKit Character Animations" (CC0, 133 clips, split by Rig_Medium and Rig_Large) [S].

### 3D-2 Quaternius [S]

- **Links:** `quaternius.com/packs/rpgcharacters.html`, `/ultimatemonsters.html`, `/modulardungeon.html` and `/medievaldungeon.html`, `/universalanimationlibrary.html`. Mirrors: `quaternius.itch.io`, poly.pizza, Sketchfab.
- **Licence:** CC0 on every page seen through search. Price: free (itch.io "name your own price"; Patreon for sources).
- **RPG Character Pack:** 6 rigged, textured fantasy characters with weapons, "around 14 animations including Idle, Death, Attacking, Run, Roll, Walk, Pick Up". FBX/OBJ/Blend/glTF. Whether it has a hit/hurt clip was not confirmed [U].
- **Ultimate Monsters:** 50 animated monsters, "attack, death, running, walking, and many more", FBX/OBJ/Blend/glTF. Per-monster clip lists not seen [U].
- **Modular Dungeon:** 45+ modular pieces (walls, barrels, torches, potions...), FBX/OBJ/Blend/GLB.
- **Universal Animation Library:** 120+ clips on a humanoid rig for retargeting, CC0. It could top up the RPG characters' clip set, at the cost of retargeting work.
- **Style:** flat-shaded low poly, one artist. The monsters are cuter and rounder than the characters, and neither is gritty. Mixing with KayKit is possible but visible.

### 3D-3 Kenney Mini Dungeon / Blocky Characters [S]

- **Links:** `kenney.nl/assets/mini-dungeon`, `kenney.nl/assets/blocky-characters`, also on OpenGameArt and `kenney-assets.itch.io`.
- **Licence:** CC0, free.
- **Mini Dungeon:** 20-30 models including `character-human.glb` and `character-orc.glb` (file names confirmed in a third-party repo's credits file, gheja/shifty-dungeon), walls, floors, stairs, doors, props. Its changelog says animations were added; the clip list was not seen [U].
- **Blocky Characters:** 18 characters, 27 animations (Kenney's own announcement). Blocky/voxel look.
- **Verdict:** fine for a grey-box, but only 2 characters in the dungeon pack, and the tone is far from "Diablo but slower".

### 2D-1 Pre-render KayKit to sprite sheets [V licence, U effort]

- CC0 allows any derivative, so rendered sheets may be committed and shipped.
- Needs a render script: orthographic camera at the game's isometric angle, 8 yaw steps, low-res target, nearest-neighbour, optional outline and palette pass, then pack into atlases. Every clip listed in 3D-1 becomes available in 8 directions, with frame counts set by the sampling rate.
- The Area's tiles would be rendered the same way from Dungeon Remastered, so the style match is exact.
- This depends on the rendering spike (issue 01/04). If pixelated 3D wins, this step disappears.

### 2D-2 Flare fantasycore [V]

- **Link:** [github.com/flareteam/flare-game](https://github.com/flareteam/flare-game) (the `mods/fantasycore` art). Homepage flarerpg.org.
- **Licence:** from the README: "All of the art and data files for Flare: Empyrean Campaign are released under CC-BY-SA 3.0. Later versions are permitted." LICENSE.txt is the CC-BY-SA 3.0 Unported text. The art has many authors (listed in CREDITS.txt); per-file attribution is on the flare-game wiki Credits page.
- **Price:** free.
- **Directions:** 8. Frame definitions use direction indices 0-7 (`frame=index,direction,...`), checked in `animations/enemies/skeleton.txt`.
- **Animations (from `animations/enemies/*.txt`):**
  - skeleton: `stance` 4f, `run` 8f, `swing` 4f, `cast` 4f, `shoot` 4f, `block` 2f, `hit` 2f, `die` 6f, `critdie` 6f
  - goblin and zombie: the same set; zombie adds `spawn` 8f
  - hero (layered avatar): `stance`, `run`, `swing`, `block`, `hit`, `die`, `cast`, `shoot`
  - **no separate walk cycle.** "Walk" would be a slowed `run`, which may fight the slower tempo.
- **Enemies available:** antlion (+small, fire, ice ant), cursed_grave, goblin (+elite, runner), minotaur, skeleton (+archer, mage, weak), wyvern (4 variants), zombie; plus hobgoblin, bosses and a necromancer in the campaign mod. Blender sources exist in `art_src/characters/*` for most of them, so re-rendering in a pixel style is possible.
- **Tiles:** isometric tilesets for dungeon (189 tile definitions), cave and grassland, and snowplains/ruins. Tile size **192x96** (`engine/tileset_config.txt`); the art is HD, not the old 64x32.
- **Hero:** a paper-doll made of layers (head, chest, legs, feet, hands, main hand, off hand, per gear item, male and female). A Warrior needs those layers composited, either baked into one sheet or drawn as several sprites.
- **Style:** consistent across hero, enemies and tiles, since they were built for one game. The look is painterly and pre-rendered, frames around 210-225 px, so it needs downscaling and colour quantising to pass as pixel art.

### 2D-3 SmallScaleInt [S]

- **Links:** `smallscaleint.itch.io`: `8-directional-top-down-character-pack`, `hd-8-directional-top-down-character-pack-1`, `hd-8-directional-top-down-barbarian-pack-1`, `hd-8-directional-top-down-enemy-pack`, `top-down-orcs-and-goblins`, `top-down-demons`, `2d-fantasy-tileset`.
- **Licence:** commercial use in your own games is allowed. "You may not resell, redistribute, or repackage the assets as game assets, standalone or as part of another pack", and this applies to all their assets. One commenter noted there is no LICENSE.txt in the packs. **Raw files must stay out of the public repo.**
- **Price (sale prices seen via search):** Orcs & Goblins $24.99 ($12.49 on sale); HD Enemy pack $19.99 ($9.99 on sale); 2D Fantasy tileset $19.99+.
- **Contents:**
  - HD Character pack 1: 9 characters, 8 directions, "over 30 unique animations per character", sheets and single frames
  - Orcs & Goblins: 31 characters (12 orcs, 17 goblins, 2 war dogs), 8 directions, 624 sheets, separate shadow and FX layers
  - HD Enemy pack: 13 "Empire" characters, no strafe clips
  - 2D Fantasy tileset: isometric, 1800+ tiles (ground, walls in wood, stone and brick, props, cliffs, stairs) plus 7 characters from their Character Creator
- **Style:** one artist across characters and isometric tiles. Described as "top-down" but sold for isometric use; the angle match with the tileset needs checking visually [U].

### 2D-4 Hormelz 8-Directional Knight [S]

- **Link:** `hormelz.itch.io/8-directional-knight` (also `/8-directional-iron-knight`, `/8-directional-great-sword-knight-character`).
- **Licence:** CC0 for the free files (KnightBasic, KnightAdvCombat, KnightExMovement). Sword-and-shield variants are paid.
- **Animations (33):**
  - Basic: Attack, Run, Walk, Jump, Idle 1, Die 1
  - Advanced Combat: Jump Attack, Jump Spin Attack, Spin Attack, Combo Attack, Crouch Attack, Kick, Knock, Cast, Cast Sky, Block 1/2, Impact, Die 2
  - Extra Movement: Climb, Crouch, Draw, Idle 2/3, Run Jump, Slide, Strafe, Walk back/left/right, Power Up
- **Details:** 8 directions (`_dir1`...`_dir8`, starting down-left), 256x256 canvas, JSON + GIF + Aseprite per clip. "2.5D" means pre-rendered from 3D.
- **Gap:** no enemies or tiles in the same style, so it cannot carry the PoC alone.

### 2D-5 Engvee [S, licence U]

- **Links:** `engvee.itch.io`: `animated-isometric-halberd-warrior` (free), `isometric-orc-warrior-male` (free), `isometric-skeleton` ($4), `animated-isometric-thief` ($3+), `animated-isometric-jaggernaut` ($2+), `animated-isometric-prototyping-hero` (free, described as "for prototyping and non-commercial use").
- **Directions:** 16 (22.5 degree steps) on most; some also ship 12 and 8. The Thief is 8.
- **Animations:**
  - Orc Warrior: 21 (Attack1-3, Death, Hits, Idle, Jump, Shout, Run, Walk, Draw weapon, Block; armed and unarmed variants), sheets at 180/256/320 px, separate shadow layer
  - Thief: 19 (Attack 1-4, Block, Death, Hit, Idle, Run, Walk, Stun...)
- **Gaps:** no tileset, and the licence text was not found. Treat as non-redistributable.

### 2D-6 / 2D-7 enemy-only packs [S]

- **MrMGames Goblin Characters Pack**: `mrmgames.itch.io/goblin-characters-pack-pixelart`, $30+. 5 goblins, 8 directions, 15 clips each (listed in the table). Licence not seen.
- **zaicuch Skeleton**: `zaicuch.itch.io/skeleton-isometric-character-sprite-animation-pack`, $5+. 8 directions, pre-rendered, separate shadow sheets. Licence and clip list not seen.

### Tiles only [S]

- **Kenney Isometric Miniature Dungeon**: `kenney.nl/assets/isometric-miniature-dungeon`. CC0, ~70 assets (walls, floors, furniture, crates, barrels, stairs) plus one character in 8 directions with 3 animations; Tiled and Unity samples.
- **Isometric Stone Soup** (Screaming Brain Studios): `opengameart.org/content/isometric-stone-soup`, `screamingbrainstudios.itch.io/isometric-stone-soup`. CC0, 1895 floor and wall tiles at 64x32, walls as full and half blocks, magenta background, no props. The same studio also has an "Isometric Object Pack" [S].

### Rejected

- **Clint Bellanger "Isometric Hero and Creatures"** (OGA, CC-BY 3.0): 8 directions at 256x256, low colour count. But attack, special, hit and dead are single frames and movement is 4 frames, which is too thin to judge Feel. The .blend sources are gone.
- **Clint Bellanger "Isometric Hero and Heroine"** (OGA, CC-BY 3.0): about 50 px tall for 64x32 tiles, 32-frame Blender render script. Superseded by Flare.
- **OGA "Warrior (Animated Character | Isometric)"** (2dpixx, CC-BY 3.0): only 4 directions, idle/walk/attack.
- **CraftPix**: royalty-free use, but the original files may not be redistributed. Same repo problem as SmallScaleInt, and no single-artist isometric set was found.

## Open questions for the pick (issue 06)

- Is "pixel art" a hard requirement, or is a pixelated low-poly or downscaled pre-render acceptable? This decides between 2D-1 and 2D-3.
- Are 3 skeleton variants distinct enough as Enemy types, or do we want one non-skeleton (KayKit Golem EXTRA, a Quaternius monster, or a paid KayKit series character)?
- Indoor dungeon or outdoor Area? KayKit Dungeon Remastered is indoor only; outdoor would need another KayKit pack (not researched here).

## Sources

Fetched directly (primary):
- https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 (README, LICENSE.txt, `Characters/gltf/*.glb` animation names)
- https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0 (README, LICENSE.txt, `Characters/gltf/*.glb`)
- https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0 (README, LICENSE.txt, `Assets/gltf` tree)
- https://github.com/flareteam/flare-game (README, LICENSE.txt, CREDITS.txt, `mods/fantasycore/animations/*`, `tilesetdefs/*`, `engine/tileset_config.txt`, `art_src/`)
- https://github.com/gheja/shifty-dungeon/blob/main/licenses.md (third-party; only used for Kenney Mini Dungeon file names)

Seen through search-engine snippets of the primary page (the pages themselves were blocked):
- https://kaylousberg.itch.io/kaykit-skeletons/purchase, https://kaylousberg.itch.io/kaykit-series-4, https://kaylousberg.itch.io/kaykit-series-6/purchase, https://kaylousberg.itch.io/kaykit-character-animations
- https://quaternius.com/packs/rpgcharacters.html, https://quaternius.com/packs/ultimatemonsters.html, https://quaternius.com/packs/universalanimationlibrary.html, https://quaternius.itch.io/lowpoly-modular-dungeon-pack
- https://kenney.nl/assets/mini-dungeon, https://kenney.nl/assets/blocky-characters, https://x.com/KenneyNL/status/1932369466249142622, https://kenney.nl/assets/isometric-miniature-dungeon
- https://smallscaleint.itch.io/top-down-orcs-and-goblins, https://smallscaleint.itch.io/hd-8-directional-top-down-character-pack-1, https://smallscaleint.itch.io/hd-8-directional-top-down-enemy-pack, https://smallscaleint.itch.io/2d-fantasy-tileset, https://smallscaleint.itch.io/zombie-interior-hd-isometric-tileset (licence wording)
- https://hormelz.itch.io/8-directional-knight
- https://engvee.itch.io/isometric-orc-warrior-male, https://engvee.itch.io/animated-isometric-thief, https://engvee.itch.io/animated-isometric-jaggernaut, https://engvee.itch.io/animated-isometric-prototyping-hero, https://engvee.itch.io/isometric-skeleton
- https://mrmgames.itch.io/goblin-characters-pack-pixelart
- https://zaicuch.itch.io/skeleton-isometric-character-sprite-animation-pack
- https://opengameart.org/content/isometric-stone-soup
- https://opengameart.org/content/isometric-hero-and-creatures, https://opengameart.org/content/isometric-hero-and-heroine, https://opengameart.org/content/warrior-animated-character-isometric
- CraftPix licence summary: https://craftpix.net/file-licenses/ (via search)
- Public-repo guidance: https://itch.io/jam/game-off-2024/topic/4220573/frequently-asked-questions-faq, https://itch.io/t/997657/release-free-game-with-open-source-code-using-art-which-costs-money
