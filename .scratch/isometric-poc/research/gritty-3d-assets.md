# Gritty, rigged 3D characters and a dungeon kit

Answers [issue 12](../issues/12-gritty-3d-assets.md): which 3D assets could replace KayKit with a **gritty, grounded** look for the **Warrior**, 3 **Enemy types** and one dungeon **Area**, in the pixelated-3D pipeline chosen in [issue 04](../issues/04-rendering-approach.md). Researched 2026-09-26. Builds on [asset-candidates.md](asset-candidates.md), including its build-time-fetch workaround for packs that forbid redistribution.

**How much was verified.** The sandbox's egress proxy blocked every store and docs site tried (itch.io, quaternius.com, syntystore.com, Unity Asset Store, Fab, Epic docs, Adobe/Mixamo help, Sketchfab, OpenGameArt, creativecommons.org). GitHub (git and raw files) was reachable. The same tags as the earlier research are used:

- **[V] Verified**: read from the files themselves. Clip names, joint lists and triangle counts were read from glTF JSON, Collada and `.blend` files in public GitHub repos, and licence text from the files shipped with them.
- **[S] Search snippet**: taken from the search engine's index of the creator's own page, which could not be opened. Check price and licence wording on the page before buying or committing anything.
- **[U] Unverified**: inferred or estimated, with no primary source.

## The answer in brief

- **No free, redistributable asset set is gritty, fully animated and one artist's work all at once.** Every gritty set found either forbids redistribution (Mixamo, Synty, the PSX packs) or is CC-BY-SA art from an open-source game that needs real conversion work (0 A.D., Flare).
- **The animation problem is solved, and CC0.** Quaternius' *Universal Animation Library* 1 and 2 (free Standard tiers) share one 65-joint humanoid rig [V]. Between them they have every clip the PoC needs: idle, walk, jog, sprint, sword attacks and combos, sword block, a shield idle and a shield-block break, chest, head and knockback hits, death, roll, and a zombie set [V]. Any humanoid character can be retargeted onto it, and the result can sit in the public repo.
- **The best-reading gritty option is Synty POLYGON** (Dungeon Pack or Dark Fantasy). One vendor supplies the knight, varied enemies (skeletons, goblins, a golem, ghosts, demons, a plague doctor) and a matching dungeon kit. Its flat-colour atlas textures suit flat Lambert and pixelation best. The catches: it is paid, forbids sharing the source files, and ships no animations.
- **The most gritty and realistic option is Mixamo.** Characters such as Paladin, Knight, Warrok (orc), Mutant, Skeletonzombie and Vampire share one rig, and the library has a full sword-and-shield set. It is free, but the raw files may not be redistributed, and the models are 11–15k triangles with PBR textures made for close-up views.
- **The Area kit is the weakest part.** Synty's dungeon comes with its characters. Outside Synty, the choice is cheap PSX-style kits with no-redistribution licences, a few small CC0 kits, or retexturing KayKit Dungeon's geometry with gritty CC0 textures.

## Budget and how an asset reads at ~48 art pixels

**Device budget (estimates [U], anchored on one measurement).** The current `public/models/kaykit/knight.glb` is **6,652 triangles, 41 joints, 1 texture, 4 clips, 499 KB** [V, read from the file]. The Redmi (Mali-G57 MC2) ran that scene at a steady frame rate in issue 04. No three.js budget for this GPU is published (see [threejs-pixel-rendering.md](threejs-pixel-rendering.md)). Working targets until measured:

- **Per character:** ≤ ~7k triangles is proven on the device. 10–15k is probably fine for a handful of Enemies at 600×270 [U]. Skinning runs on the GPU in three.js, so its cost scales with vertex count × influences.
- **Detail you can't see:** a 48-pixel-tall figure covers at most about 48×20 ≈ 1,000 art pixels. Triangles and texels finer than one art pixel are thrown away by the downsample. Above roughly 2–3k triangles, a character looks no different at this size [U], and textures above 256–512 px add download size and GPU memory, not detail [U]. Decimating in Blender or with `gltf-transform simplify` and downscaling textures is safe.
- **Download:** only the base colour matters under flat Lambert. Normal, metal/roughness and AO maps can be dropped, or AO baked into the base colour. Unused clips should be stripped, as was done for KayKit.

**How a style reads after the pipeline (600×270 art pixels, flat Lambert, depth outline) [U, reasoned, not rendered].**

- **Flat-colour atlas (Synty, KayKit):** every surface is one colour block, so the downsample gives clean clusters of 2–6 pixels, and the depth outline carries the silhouette. Reads best.
- **Low-res painted textures (PSX packs, 0 A.D.):** 128–256 px textures come close to one texel per art pixel, so the result looks close to hand-pixelled. 0 A.D.'s units were made to be seen tens of pixels tall from an RTS camera, which is the same scale as ours. Reads well.
- **Realistic PBR (Mixamo, Quaternius outfits):** the material read comes from normal, roughness and specular, which flat Lambert discards. Desaturated brown and grey base colours then turn to mush at 48 px. Faces become about 4 pixels. Silhouettes still carry large, distinct shapes (a hunched orc, a shield and helm). These need a value or contrast boost or a palette pass, and **need an on-device test before committing**.
- **Silhouette matters more than detail.** At 48 px, Enemy types are told apart by size, posture and weapon shape. Pick one small-fast type, one human-sized armed type and one big type.

## Summary table

| # | Candidate | Covers | Licence | Public repo? | Price | Rig and clips | Tris / size | Pixel read | Status |
|---|---|---|---|---|---|---|---|---|---|
| **C1** | **Mixamo characters + animations** (Adobe) | Warrior (Paladin J Nordstrom, Knight D Pelegrini), enemies (Warrok W Kurniawan orc, Mutant, Skeletonzombie T Avelange, Vampire A Lusth, Maw J Laygo, Parasite L Starkie...) | Mixamo terms: royalty-free use in projects; **no redistribution of raw character/animation files** | **No**: build-time fetch from private storage | Free (Adobe ID) | One shared `mixamorig` rig; full sword-and-shield and great-sword sets, zombie and mutant sets (list below) | ~11–15k tris each [S]; PBR textures | Gritty; needs contrast boost | [S] |
| **C2** | **Synty POLYGON Dungeon Pack / Dark Fantasy / Dungeon Realms** | Knight hero, skeletons, goblins, rock golem, ghosts, demons, plague doctor, witch...; modular dungeon in the same packs | Synty EULA: use in your games; **don't share source files outside your team** | **No**: build-time fetch | Paid: Dungeon Realms $199.99 on the Unity Asset Store; Synty subscription from $30/mo; other one-time prices not captured [S] | Shared POLYGON humanoid rig, **no clips included**; animation sold separately (Sword Combat, 105 clips; Base Locomotion, 247) | Low poly, one atlas texture [S] (tris not published) | Best read; grittier than KayKit, still stylised | [S] |
| C3 | **Quaternius Universal Base Characters + Modular Character Outfits – Fantasy** | Warrior (knight outfit in the paid Source tier), humans; no monsters | **CC0** [V] | **Yes** | Free Standard (peasant and ranger only [V]); Source $20 [S] | Same 65-joint rig as UAL [V]; clips from UAL1+2 | Male_Ranger outfit **26,982 tris**, 6 PNG maps (PBR) [V] | Semi-realistic PBR; needs decimation and contrast; not gritty | [V]/[S] |
| C4 | **PSX packs**: Retro Spud *PSX Dark Knights* and monsters, Puck *PSX Goblin Pack* / zombies, Pinky *Ghoul*, scoppio *Fullplate Armor Knight* | Warrior (dark knights, plate knight), goblins, zombies, ghoul, abominations | Mostly "use in projects, **no redistribution**"; scoppio knight **CC0** [S] | Only the CC0 knight; the rest via build-time fetch | $4.99–$11.99 per pack; knight free [S] | Humanoid rigs, "work with Mixamo animations" [S]; few or no clips of their own | Very low poly, 256×256 textures [S] | Near 1:1 texel to art pixel; gritty; mixed artists | [S] |
| C5 | **0 A.D. art** (Wildfire Games) | Human soldiers (swordsman, spearman, archer...), wolf, bear, boar, lion, mastiff | **CC-BY-SA 3.0** [V] | **Yes**, with attribution and share-alike on the art | Free | One shared biped skeleton; swordsman idle, walk, jog, run, 13 attacks, 2 deaths; **no block, no hit** [V]. Wolf and bear: idle, walk, run, attack, death [V] | Body mesh 219 tris + head/helmet/shield props; wolf 896, bear 1,340 [V] | Grounded and realistic, made for this size; no undead | [V] |
| C6 | **Flare `art_src` Blender sources** | Hero (paper-doll gear), goblin, skeleton (+archer, mage, knight), zombie, minotaur, wyvern, antlion | **CC-BY-SA 3.0** [V, earlier research] | Yes, with attribution and share-alike | Free | Hero, goblin, skeleton, zombie share one armature `arMaleArm` [V]; minotaur has named actions Attack, Block, Death, Idle, Run... [V] | Unknown; procedural Blender-Internal materials, no image textures (except minotaur) [V] | Painterly source; needs texture baking | [V] |
| Area | **Synty dungeon** (in C2) | Modular dungeon, 770 assets in Dungeon Pack [S] | Synty EULA | No (fetch) | see C2 | – | Low poly atlas | Matches C2 | [S] |
| Area | AssetHunts *Dark Dungeon* | 175+ modular pieces, statues, props | **CC0** [S] | Yes | Free | – | "optimised" [S] | Look not seen | [S] |
| Area | valsekamerplant *Retro Modular Dungeon Tileset* | 35 PSX pieces | **CC0** [S] | Yes | Free | – | PSX | Small kit | [S] |
| Area | OrcPoweredGames / Venturon / CrimsongCat / SigilsVault PSX kits | Modular dungeon and catacomb kits | Venturon: no redistribution of source files [S]; others not seen | Fetch | ~$5 each [S] | – | PSX | Gritty; unchecked | [S] |
| Area | KayKit Dungeon Remastered geometry + gritty CC0 textures | 203 pieces (already verified) | CC0 | Yes | Free | – | 136–1,331 tris per piece [V] | Chunky shapes remain | [U] idea |
| Anim | **Quaternius UAL1 + UAL2 (Standard)** | 43 + 43 clips, one rig | **CC0** [V] | **Yes** | Free (Pro/Source $9.99–$14.99) | See below | ~8 MB per library GLB, uncompressed [V] | – | [V] |
| Anim | Mixamo library | Thousands of clips | No raw redistribution | No | Free | `mixamorig` | per-clip FBX | – | [S] |
| Anim | Synty ANIMATION packs | Sword Combat 105, Base Locomotion 247 | Synty EULA | No | Paid [S] | POLYGON / Mecanim humanoid | – | – | [S] |
| Anim | CMU mocap | Raw mocap, mostly locomotion | Free for all uses; may not resell the data [S] | Probably yes [U] | Free | Needs retarget and cleanup | – | – | [S] |
| Reject | Bandai Namco Research Motion Dataset | Fighting, locomotion, styles (BVH) | **CC BY-NC 4.0** [V] | NC only | Free | – | – | – | [V] |
| Reject | PROTOFACTOR Heroic Fantasy Creatures | 30 creatures per volume | Unity Asset Store EULA | No (fetch) | $299.90–$350 per volume [S] | Full creature sets | Aimed at "PC / MAC / Linux / PS4 / XBOX1" [S] | – | [S] |

## Characters

### C1 Mixamo (Adobe) [S]

- **Look:** [mixamo.com](https://www.mixamo.com/) (Adobe ID). Official Mixamo uploads on Sketchfab: [Paladin with prop](https://sketchfab.com/3d-models/paladin-with-prop-8c581692669b43c6b6f1e25fa3e3ef40), and [sketchfab.com/mixamo](https://sketchfab.com/mixamo). The Warrok and Mutant pages found are re-uploads by third parties (an "Attribution" tag on a re-upload does not change Adobe's terms).
- **Licence:** the [Mixamo FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html) (via search snippets): characters and animations are "royalty free for personal, commercial, and non-profit projects". The restriction is on raw files: you may not "distribute the raw character and animation files", create "asset packages ... which redistribute character or animation raw files", or give the files "to customers or non-team members". Team members may share them. **So they cannot go in the public repo.** Use the build-time fetch from private storage, as for any no-redistribution pack. The deployed game still serves the converted GLBs over HTTP, as any web game does. That the final game build is the permitted "incorporated into a project" case is the usual reading, but it is not legal advice.
- **Price:** free.
- **Characters for the PoC** (names confirmed across several listings [S]):
  - Warrior: *Paladin J Nordstrom* (sword, shield, plate) or *Knight D Pelegrini*.
  - Enemies, all with distinct silhouettes: *Warrok W Kurniawan* (big orc brute), *Mutant* (hulking creature, with its own Mutant clip set), *Skeletonzombie T Avelange*, *Vampire A Lusth*, *Maw J Laygo*, *Parasite L Starkie*, *Ganfaul M Aure* (necromancer).
- **Rig and clips:** every Mixamo character uses the same `mixamorig` skeleton, so every clip plays on every character. Clip names below are from a third-party dump of the Mixamo catalogue on GitHub ([animation-names.json](https://github.com/ShaTir24/cursor-hackathon/blob/HEAD/mixamo/animation-names.json)), so treat them as [S]:
  - **Sword And Shield set:** Idle, Walk, Run, Backward Walk/Run, Strafe, Turns, Slash Combo, Downward/Power/Cross Slash, High/Low/Jump Attack, Hilt Melee, Sparta Kick, **Block Idle, Idle To Block, Blocked Impact, Head Impact, Unblocked Impact, Falling Back Death**, Crouch Block.
  - **Great Sword set:** the same shape for two-handed swords (Idle, Walk, Run, Slashes, Blocking Idle, Blocked/Unblocked/Head Impact, and "two handed sword death" in the pack listing).
  - **Enemies:** Zombie (Standing Idle, Walk, Run, Attack, Headbutt, Reaction Hit, Getting Hit And Falling, Laying To Standing Up...); Mutant (Breathing Idle, Brutal Walk, Running, Attacking With Left Hand, Jump Attack, Roaring, Dying); generic Death Falling Backwards/Forwards/Left/Right.
- **Poly count and size:** Sketchfab listings give Paladin with prop **15k triangles**, Warrok **12.6k**, Mutant **11.3k** [S]. That is about 2× the KayKit Knight. It is acceptable for 4–6 characters at 600×270 [U], and decimating to ~5k loses nothing visible at 48 px [U]. Textures are PBR-style maps meant for close-ups. Downscale the base colour to 256–512 and drop the rest.
- **Pixel read [U]:** grittiest and most grounded of all the options. The risk is the realistic, low-contrast albedo under flat Lambert. The big creatures (Warrok, Mutant) will read on silhouette alone; the Paladin needs his shield and helmet to read. The characters were made by different contest artists, so style consistency varies.

### C2 Synty POLYGON [S]

- **Look and contents:**
  - [POLYGON Dungeon Pack](https://syntystore.com/products/polygon-dungeon-pack): 770 assets, a demo scene, and 16 characters: Hero Knight Male and Female, Ghost ×2, Tormented Soul, Rock Golem, Skeleton Knight, Skeleton Slave, Skeleton Soldier ×2, Goblin Male and Female, Goblin Shaman, Goblin Warchief, Goblin Warrior Male and Female. Also 73 weapons and shields, 4 colour variants.
  - [POLYGON Dark Fantasy](https://syntystore.com/products/polygon-dark-fantasy): Dark Lord, Demon ×2, Gargoyle, Grave Digger, Hunter M/F, Plague Doctor, Priest, Skeleton ×5 variants, Witch. Graveyard and cathedral environment. "Set up with Mecanim (no animations included)". The grittiest Synty set.
  - [POLYGON Dungeon Realms](https://syntystore.com/products/polygon-dungeon-realms): 1,118 prefabs, 19 characters (Hero M/F, dwarves, nomads, Big Demon, Demon Skeleton ×3, Undead Knight). **$199.99** on the Unity Asset Store.
  - Every Synty pack is also on the Synty subscription ("from $30 USD/mo"). One-time prices for Dungeon Pack and Dark Fantasy were not captured.
- **Licence:** the Synty [one-time purchase licence](https://syntystore.com/pages/one-time-purchase-licence) (via snippets): "You must not share the source files of any Assets outside your team"; contractors must delete them when done; no resale of edited assets. The FAQ says Synty only *supports* Unity and Unreal, but "it is technically possible" to use the assets in other engines, and buying direct from the Synty Store gets both engine versions ([FAQ](https://syntystore.com/community/faq)). **Not in the public repo; use the build-time fetch.** Whether the subscription licence lets a shipped game keep using the assets after the subscription ends was not checked [U]. Read the full EULA before buying.
- **Rig and clips:** POLYGON characters share one humanoid rig, and the Synty animation packs target "standard POLYGON characters". But **the character packs include no animations**. Clips come from:
  - [ANIMATION – Sword Combat](https://syntystore.com/products/animation-sword-combat): 105 FBX clips (light and heavy attacks, blocks, deaths), plus root-motion versions.
  - [ANIMATION – Base Locomotion](https://syntystore.com/products/animation-base-locomotion): 247 clips, "designed to work inside Unity" (Mecanim humanoid).
  - Or retarget Quaternius UAL or Mixamo clips onto the Synty rig.
- **Poly count and size:** Synty does not publish triangle counts [S]. POLYGON characters are low poly with a single colour-atlas texture. They are probably at or below the KayKit Knight's 6.6k [U]. Measure once bought.
- **Pixel read [U]:** best of the gritty options. The flat colour atlas gives clean pixel clusters, and proportions are adult rather than chibi. Dark Fantasy's palette is dark and desaturated. It is still "stylised low poly", so less gritty than Mixamo. The FBX files reference `.psd` textures; community converters exist (e.g. [synty-godot-converter](https://github.com/DeniedWorks/synty-godot-converter)), so expect a small Blender or conversion step to reach glTF.

### C3 Quaternius Universal Base Characters + Modular Character Outfits – Fantasy [V/S]

- **Look:** [quaternius.com/packs/modularcharacteroutfitsfantasy.html](https://quaternius.com/packs/modularcharacteroutfitsfantasy.html) and [universalbasecharacters.html](https://quaternius.com/packs/universalbasecharacters.html).
- **Licence:** CC0 1.0. Read from `License_Standard.txt` in a public mirror ([MateusJuni0/worldrpgs](https://github.com/MateusJuni0/worldrpgs)) [V]. The paid Source tier is also CC0 [S], so even the paid files may be committed.
- **Price:** Standard is free, but it contains **only the Peasant and Ranger outfits** (male and female) [V, file list]. All 12 outfits (62 parts, including a knight) are in the Source tier, $20 [S].
- **Rig:** the same **65-joint UE-mannequin-style rig** (`root, pelvis, spine_01..., clavicle_l...`) as UAL1 and UAL2 [V]. So every UAL clip plays on these characters with no retargeting.
- **Poly count and size:** `Male_Ranger.gltf` is **26,982 triangles**, 9 meshes, 6 PNG maps (BaseColor, Normal, ORM, plus body maps), with a 1.7 MB `.bin` [V]. That is ~4× the KayKit Knight, so decimate it. The readme says to use only the head of the base body under an outfit, which helps.
- **Enemies:** none that are monsters. UAL2 has a zombie clip set, so a peasant outfit with a darkened texture could stand in for a zombie. It is still one human silhouette.
- **Pixel read [U]:** more realistic proportions than older Quaternius, but a clean, heroic look, not gritty. PBR maps are lost under Lambert. **Best used for its animations (see below), not as the character source.**

### C4 PSX-style packs [S]

- **Retro Spud** ([retro-spud.itch.io](https://retro-spud.itch.io/)):
  - [PSX Dark Knights Pack](https://retro-spud.itch.io/psx-dark-knights-pack): 7 GLB/FBX models and 7 PNG textures at **256×256**, "rigged humanoid and work with Mixamo animations" (not rigged by Mixamo), **$4.99**. Licence: "edit and use ... in any commercial or non-commercial project, but you cannot resell or distribute the asset".
  - Also: [PSX Character Megapack](https://retro-spud.itch.io/psx-character-megapack) ("Horror/Fantasy", $11.99), and single monsters (Abomination, Muscular Abomination, Eyehead Monstrosity).
- **Puck** ([puszke.itch.io](https://puszke.itch.io/)): [PSX Goblin Pack](https://puszke.itch.io/psx-goblin-pack) ("ugly little goblins ... gritty PSX aesthetic", $5+) and [Retro Low Poly Zombie PSX Models – Fully Rigged](https://puszke.itch.io/zombie-psx-models). The creator says you can use them commercially but not resell the models alone. Whether they include animations was not seen.
- **Pinky (Daniel Almenara):** [Retro Low Poly Ghoul / Zombie – Rigged and Animated](https://daniel-almenara.itch.io/ghoul-zombie), $5+. Clip list and licence were not seen.
- **scoppio (Luana Coppio):** [Fullplate Armor Knight](https://scoppio.itch.io/fullplate-armor-knight), low-poly, low-res, "simple rigging", Blender + FBX + GLB, **CC0**. It is listed in the curated CC0/no-attribution [Retro3DGraphicsCollection](https://github.com/Miziziziz/Retro3DGraphicsCollection) [V, that list].
- **Rig and clips:** mostly rigs without clips. Animate with Mixamo (upload for auto-rig) or retarget Quaternius UAL. Whether the rigs match each other is not known [U].
- **Pixel read [U]:** closest to one texel per art pixel, with naturally gritty palettes. It reads like hand-made pixel art after the pipeline. The risks are that the packs come from different artists, so styles may clash, and that PSX-era faceting shows under Lambert unless normals are smoothed.

### C5 0 A.D. art [V]

- **Look:** [play0ad.com](https://play0ad.com/). Source: the archived GitHub mirror [0ad/0ad](https://github.com/0ad/0ad) (the project moved to gitea.wildfiregames.com in August 2024).
- **Licence:** `LICENSE.txt`: `binaries/data/mods/*/art` is "Creative Commons Attribution-Share Alike 3.0" [V]. It may go in the public repo with a credits file. Share-alike covers the art and our edits of it.
- **Rig and clips (file names read from the tree) [V]:**
  - All human units share the biped skeleton (`art/skeletons/biped.xml`, animations under `art/animation/biped/`).
  - `infantry/swordsman/`: `idle_ready_shield_01..07`, `idle_relax_*`, `walk_ready_shield`, `jog_ready_shield`, `run_ready_shield`, `attack_melee_shield_01..06`, `attack_melee_shieldarm_01..03`, `attack_melee_2h_01..04` (plus `_2h` idle, walk and run). Shared `infantry/death_a` and `death_b`. Spearman, axe, knife, archer and slinger sets besides.
  - **No block and no hit-reaction clips** (an RTS doesn't need them). Take these from Quaternius UAL after retargeting.
  - Animals, each on its own skeleton: `wolf_idle_01..03, wolf_walk, wolf_run, wolf_attack_01/02, wolf_death_01/02`; `bear_idle_01..04, bear_walk, bear_run, bear_attack_01..03, bear_death_01`; also boar, lion, mastiff/wolfhound.
- **Poly count [V, counted from the Collada]:** `m_armor_tunic_short.dae` body **219 triangles** (48 joints; head, helmet, shield and weapon are separate props attached by actor XML files); `wolf.dae` **896**; `bear.dae` **1,340**. Very light.
- **Enemy types:** grounded ones: bandit swordsman or spearman, wolf, bear. No undead or monsters (a `dragon.dae` exists but is not a PoC fit).
- **Work needed:** Collada meshes plus XML "actors" that assemble body, head, props and textures. Convert through Blender to glTF, one character at a time, with props parented to prop bones. Moderate effort, but mechanical [U].
- **Pixel read [U]:** made for an RTS camera where units are a few dozen pixels tall. Painted textures with baked shading, realistic proportions. The closest thing to "grounded at 48 px" found, and free to commit. The historical (Hellenic, Celtic, Roman) costume may clash with a dark-fantasy dungeon.

### C6 Flare `art_src` Blender sources [V]

- **Look:** [flare-game](https://github.com/flareteam/flare-game) (`art_src/characters/`). The rendered sprites are the "fantasycore" set from the earlier research.
- **Licence:** CC-BY-SA 3.0 (earlier research, [V]).
- **Contents [V]:**
  - `hero/` and `heroine/` gear pieces (plate helm, cuirass, greaves, longsword, shield...).
  - Enemies: `goblin`, `goblin_elite`, `hobgoblin`, `skeleton` (+archer, mage, weak), `skeleton_bosses/skeleton_knight`, `zombie`, `minotaur`, `wyvern`, `antlion`.
- **Rig [V, read from the `.blend` ID blocks]:** hero, goblin, skeleton, skeleton_knight and zombie all use the armature `arMaleArm`, so they share one rig. Their animation lives in a single `Action` per file (sprite frames set by render ranges [U]). The minotaur has its own `MinotaurRIG` with named actions `Attack, AxeThrow, Block, Death, Idle, MagicCast, Run, Stomp`.
- **Why it ranks low:** the files are Blender 2.49–2.79, and materials are procedural (the only image data blocks are `Render Result`, except the minotaur's `catfur.jpg` and a normal map). Every model needs its textures baked and its single action split into clips before glTF export. Poly counts are unknown.

### Not pursued

- **PROTOFACTOR Heroic Fantasy Creatures**: 30 creatures per volume, $299.90–$350 [S], aimed at PC and consoles. Too costly and heavy for a PoC.
- **Sketchfab CC-BY one-offs** (e.g. Northcliffe's [Dwarf Warrior](https://github.com/J-Ponzo/gltf-dwarf-warrior), CC-BY-4.0 [V]): fine for licence, but every model is by a different artist, with a different rig and texture density.
- **KayKit, Kenney, older Quaternius packs**: rejected by the user for tone (issue 04).

## Dungeon Area kits

- **Synty dungeon (inside C2) [S].** The Dungeon Pack's 770 assets and Dungeon Realms' 1,118 prefabs come with the characters, so the style matches exactly. Same licence and fetch constraint as C2.
- **AssetHunts – Low Poly Asset Pack: Dark Dungeon [S].** On [itch.io](https://assethunts.itch.io/darkdungeon) and [OpenGameArt](https://opengameart.org/content/assethunts-low-poly-asset-pack-dark-dungeon). "175+" pieces (wall tiles, columns, props, statues, skeletons), FBX and GLB, **CC0**, free, released July 2024. Look not seen; the name promises dark, but it may be flat-colour low poly close to KayKit. Check the screenshots first.
- **valsekamerplant – Retro Modular Dungeon Tileset [S].** [itch.io](https://valsekamerplant.itch.io/retro-modular-dungeon-tileset). 35 PSX pieces (4 tile sets of 5, containers, chains, vegetation, ladder, exits), **CC0**. Small, but pairs with C4.
- **Paid PSX kits [S]:**
  - [OrcPoweredGames PSX / Retro Modular Dungeon Kit](https://orcpoweredgames.itch.io/psx-retro-modular-dungeon-kit), $4.99.
  - [Venturon Dungeon & Catacombs](https://venturon.itch.io/dungeon-catacombs-3d), $5, FBX/GLB. Licence: "no reselling, sharing, or redistributing the source files".
  - [CrimsongCat PS1 Dungeon Modular Pack](https://crimsongcat.itch.io/ps1-dungeon-pack), 43 pieces.
  - [SigilsVault Modular Dungeon Kit](https://sigilsvault.itch.io/modular-dungeon-kit-v10): 90+ pieces, dark fantasy, GameCube/PS2 look, 1 m grid, GLB with embedded textures.
  - Licences not seen except Venturon's; treat as no redistribution.
- **Retexture KayKit Dungeon Remastered [U idea].** Its geometry is already verified, CC0 and light (136–1,331 triangles per piece measured here). The "cute" comes mostly from its bright gradient-atlas colours and rounded props. Swapping the atlas for dark, desaturated palette colours, or CC0 stone textures (ambientCG, Poly Haven), might be enough for walls and floors, with props replaced. Cheap to try because the loader already exists.

## Animation libraries for a shared humanoid rig

### Quaternius Universal Animation Library 1 + 2 (Standard, CC0) [V]

- **Source:** [quaternius.com UAL](https://quaternius.com/packs/universalanimationlibrary.html) and [UAL2](https://quaternius.com/packs/universalanimationlibrary2.html). Files read from GitHub mirrors of the free tier: [J-Ponzo/gltf-universal-animation-library](https://github.com/J-Ponzo/gltf-universal-animation-library) (UAL1, CC0 per its README) and [NafisRayan/Animate-Rigged-Humanoid-No-Blender](https://github.com/NafisRayan/Animate-Rigged-Humanoid-No-Blender) (`UAL1_Standard.glb`, `UAL2_Standard.glb`).
- **Licence:** CC0, so the files and any retargeted derivatives can be committed. Pro and Source tiers add ~30% more clips ($9.99–$14.99 [S]).
- **Rig:** UAL1 and UAL2 GLBs have the **same 65 joints** (`root, pelvis, spine_01, spine_02, spine_03, neck_01, Head, clavicle_l`...) [V]. The older Godot export of UAL1 uses Rigify `DEF-*` names with 53 joints, so use the Unreal-Godot GLBs.
- **PoC clips [V]:**

| Need | UAL1 (43 clips) | UAL2 (43 clips) |
|---|---|---|
| idle | `Idle_Loop`, `Sword_Idle`, `Idle_Torch_Loop` | `Idle_Shield_Loop`, `Idle_Lantern_Loop` |
| walk / run | `Walk_Loop`, `Jog_Fwd_Loop`, `Sprint_Loop`, `Crouch_Fwd_Loop` | `Walk_Carry_Loop` |
| attack | `Sword_Attack`, `Punch_Jab`, `Punch_Cross` | `Sword_Regular_A/B/C` (+ `_Rec` recoveries), `Sword_Regular_Combo`, `Sword_Heavy_Combo`, `Sword_Dash`, `Melee_Hook` (+`_Rec`), `Shield_Dash`, `OverhandThrow` |
| block | – | `Sword_Block`, `Shield_OneShot`, `Idle_Shield_Break` |
| hit | `Hit_Chest`, `Hit_Head` | `Hit_Knockback` |
| death | `Death01` | `LayToIdle` (get-up) |
| other | `Roll`, `Jump_*`, `Spell_Simple_*` | `Zombie_Idle_Loop`, `Zombie_Walk_Fwd_Loop`, `Zombie_Scratch`, `Slide_*` |

- **Size:** each library GLB is ~8 MB with all 43 clips and a 13.7k-triangle mannequin [V]. A dozen clips, stripped and resampled (e.g. `gltf-transform`), should be a few hundred KB [U].
- **Gaps:** one death, no dedicated two-handed set. The zombie set and the unarmed punches/hook cover a shambling or brawler Enemy type.

### Mixamo [S]

The most complete library (full sword-and-shield and great-sword sets, per-direction deaths, zombie and mutant sets; see C1), free. **Raw clips may not be redistributed.** A Mixamo clip retargeted onto another rig is still derived from Mixamo raw animation data, so it must stay out of the public repo too [U, conservative reading]. Only worth it if the characters are Mixamo too, or behind the build-time fetch anyway.

### KayKit Character Animations [S, earlier research]

CC0, 133 clips, but for KayKit's own rigs (Rig_Medium, Rig_Large). Useful only if KayKit-rigged characters stay.

### Synty ANIMATION packs [S]

Sword Combat (105 clips) and Base Locomotion (247): for the Synty rig, Unity-oriented, paid, Synty EULA (no sharing source files). Only with C2.

### CMU Graphics Lab Motion Capture Database [S]

[mocap.cs.cmu.edu](https://mocap.cs.cmu.edu/): "free for all uses". "You may include this data in commercially-sold products, but you may not resell this data directly, even in converted form". Committing retargeted clips for an open game is probably fine, but that is [U]. Mostly raw locomotion and everyday motion, few sword moves, and it needs cleanup. Low value next to UAL.

### Rejected

The [Bandai Namco Research Motion Dataset](https://github.com/BandaiNamcoResearchInc/Bandai-Namco-Research-Motiondataset) has fighting motions in BVH, but is **CC BY-NC 4.0** [V, README], so non-commercial only.

### Retargeting

Retargeting between rigs (Mixamo to UAL, 0 A.D. biped to UAL, Synty to UAL) is a Blender step, or three.js `SkeletonUtils.retargetClip` at build or load time [U, not tried]. Characters built on the UAL rig (Quaternius outfits) need none.

## Licence and the public repo (summary)

- **Commit freely:** CC0 (Quaternius UAL and outfits, scoppio knight, AssetHunts, valsekamerplant, KayKit).
- **Commit with attribution and share-alike on the art:** CC-BY-SA 3.0 (0 A.D., Flare). Add a credits file.
- **Keep out of the repo; fetch at build time from private storage:** Mixamo, Synty, Retro Spud, Puck, Pinky, Venturon and the other paid itch.io kits, and any Unity Asset Store or Fab purchase. For the Unity Asset Store, the standard EULA licenses assets as "embedded components" of a product and does not tie them to Unity; "Restricted" assets are the exception ([EULA FAQ](https://assetstore.unity.com/browse/eula-faq), via snippets). Fab's Standard License lets you share with collaborators "via a private repository" ([Fab docs](https://dev.epicgames.com/documentation/fab/licenses-and-pricing-in-fab), via snippets).
- **Not legal advice.** Read each licence page before buying or committing, especially the [S] rows.

## Ranked recommendation

1. **Animations: Quaternius UAL1 + UAL2 Standard (CC0), whatever the characters.** Verified clip coverage for everything the Warrior and the Enemies need, one rig, committable. Keep it as the shared clip set and retarget characters onto it.
2. **Characters, if the look must be gritty and the build-time fetch is acceptable: try Mixamo first, then Synty.**
   - **Mixamo** (free, grittiest): Paladin as the Warrior; Warrok (big), Skeletonzombie or Vampire (human-sized), Parasite or Mutant (odd silhouette) as the three Enemy types. Its own sword-and-shield clips cover block, hit and death. Decimate to ~5k triangles and downscale textures, then **judge it on the Redmi before building on it**: realistic albedo under flat Lambert is the main risk.
   - **Synty POLYGON Dungeon Pack**, or Dark Fantasy for the darkest tone, if Mixamo turns to mush. It is the best-reading and most coherent set: knight, skeletons, goblins, a golem and a matching dungeon from one artist. Paid, and it needs animation retargeted from UAL or a Synty animation pack.
3. **Characters, if everything must be committable: 0 A.D.** (CC-BY-SA). Grounded, made for exactly this on-screen size, very light, one shared biped. The Enemy types would be bandit, wolf and bear, taking block and hit clips from UAL. It costs a Collada conversion step and commits the art to share-alike.
4. **Wildcard: PSX packs** (Retro Spud Dark Knights plus Puck goblins and zombies, or the CC0 scoppio knight), animated with UAL. The cheapest ($5–12) and the best texel-to-pixel fit. The risk is style clashes between artists.
5. **Area:** use Synty's dungeon if C2 is picked. Otherwise, first try **retexturing KayKit Dungeon's geometry dark** (free, already integrated). Then look at the **AssetHunts Dark Dungeon** screenshots (CC0), and a ~$5 PSX kit (OrcPoweredGames or Venturon) behind the build-time fetch.

**Suggested next step (for the asset-pick ticket):** a one-scene bake-off on the Redmi. Load the UAL clips onto a decimated Mixamo Paladin and Warrok, a 0 A.D. swordsman and wolf, and the CC0 scoppio knight, beside the current KayKit Knight, in the existing pipeline. Then choose by eye.

## Open questions

- Is the build-time fetch from private storage acceptable for the PoC? It is needed for Mixamo, Synty and every paid PSX pack. If not, the choice narrows to CC0 and CC-BY-SA (Quaternius, 0 A.D., Flare, the scoppio knight, AssetHunts).
- How dark is "gritty": grounded-historical (0 A.D.), dark fantasy (Synty Dark Fantasy, Mixamo creatures), or PS1 horror (PSX packs)? Each points to a different set.
- Are undead or monsters wanted, or are humans and beasts enough (bandits, wolves, bears)?
- Budget for paid packs, and whether a Synty subscription is acceptable.

## Sources

Read directly (primary files on GitHub):
- Quaternius UAL1 (Godot export) and README/licence: https://github.com/J-Ponzo/gltf-universal-animation-library
- Quaternius UAL1 and UAL2 Standard GLBs (clip names, joints, triangles): https://github.com/NafisRayan/Animate-Rigged-Humanoid-No-Blender (`Universal Animation Library[Standard]/.../UAL1_Standard.glb`, `Universal Animation Library 2[Standard]/.../UAL2_Standard.glb`)
- Quaternius Modular Character Outfits – Fantasy Standard (`License_Standard.txt`, `Readme.txt`, `Male_Ranger.gltf`): https://github.com/MateusJuni0/worldrpgs (`art/models/quaternius-modular-outfits/`)
- 0 A.D. (`LICENSE.txt`, `binaries/data/mods/public/art/{animation,skeletons,meshes/skeletal}`): https://github.com/0ad/0ad
- Flare (`art_src/characters/*.blend` ID blocks): https://github.com/flareteam/flare-game
- Bandai Namco motion dataset README (licence): https://github.com/BandaiNamcoResearchInc/Bandai-Namco-Research-Motiondataset
- Retro 3D CC0 collection (scoppio knight, valsekamerplant dungeon listed): https://github.com/Miziziziz/Retro3DGraphicsCollection
- Mixamo clip names (third-party dump, used as [S]): https://github.com/ShaTir24/cursor-hackathon/blob/HEAD/mixamo/animation-names.json
- Dwarf Warrior CC-BY mirror: https://github.com/J-Ponzo/gltf-dwarf-warrior
- This repo: `public/models/kaykit/knight.glb` and dungeon pieces (baseline triangle counts)

Seen through search-engine snippets of the primary page (the pages themselves were blocked):
- Mixamo FAQ: https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html; Adobe community licensing FAQ: https://community.adobe.com/questions-696/mixamo-faq-licensing-royalties-ownership-eula-and-tos-589400
- Mixamo model triangle counts: https://sketchfab.com/3d-models/paladin-with-prop-8c581692669b43c6b6f1e25fa3e3ef40, https://sketchfab.com/3d-models/warrok-w-kurniawan-45b12525a6a14627aeeead841bba6192, https://sketchfab.com/3d-models/mutant-mixamo-0e88f98743fb41799501acb9b5cbb5ed
- Synty: https://syntystore.com/products/polygon-dungeon-pack, https://syntystore.com/products/polygon-dark-fantasy, https://syntystore.com/products/polygon-dungeon-realms, https://assetstore.unity.com/packages/3d/environments/dungeons/polygon-dungeon-realms-pack-art-by-synty-189093, https://syntystore.com/products/animation-sword-combat, https://syntystore.com/products/animation-base-locomotion, https://syntystore.com/pages/one-time-purchase-licence, https://syntystore.com/community/faq
- Quaternius: https://quaternius.com/packs/modularcharacteroutfitsfantasy.html, https://quaternius.itch.io/modular-character-outfits-fantasy/purchase, https://quaternius.com/packs/universalanimationlibrary2.html, https://quaternius.itch.io/universal-animation-library-2/purchase, https://quaternius.itch.io/universal-animation-library
- PSX packs: https://retro-spud.itch.io/psx-dark-knights-pack, https://retro-spud.itch.io/psx-character-megapack, https://puszke.itch.io/psx-goblin-pack, https://puszke.itch.io/zombie-psx-models, https://daniel-almenara.itch.io/ghoul-zombie, https://scoppio.itch.io/fullplate-armor-knight
- Dungeon kits: https://assethunts.itch.io/darkdungeon, https://opengameart.org/content/assethunts-low-poly-asset-pack-dark-dungeon, https://valsekamerplant.itch.io/retro-modular-dungeon-tileset, https://orcpoweredgames.itch.io/psx-retro-modular-dungeon-kit, https://venturon.itch.io/dungeon-catacombs-3d, https://crimsongcat.itch.io/ps1-dungeon-pack, https://sigilsvault.itch.io/modular-dungeon-kit-v10
- PROTOFACTOR: https://protofactor.biz/product/heroic-fantasy-cretures-full-pack-vol-1/, https://assetstore.unity.com/packages/3d/characters/creatures/heroic-fantasy-creatures-full-pack-vol-1-5730
- Store licences: https://assetstore.unity.com/browse/eula-faq, https://unity.com/legal/as-terms, https://dev.epicgames.com/documentation/fab/licenses-and-pricing-in-fab, https://www.fab.com/eula
- CMU mocap terms: https://mocap.cs.cmu.edu/
