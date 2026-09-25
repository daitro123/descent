# Gritty 3D assets for the PoC

Answers [issue 12](../issues/12-gritty-3d-assets.md): which rigged, animated 3D assets could give the **Warrior**, 3 **Enemy types** and a dungeon **Area** a gritty, grounded tone instead of KayKit's chunky one. Researched 2026-09-25. Builds on [asset-candidates.md](asset-candidates.md); KayKit, Kenney, the older Quaternius packs and the 2D packs are not repeated here.

**How much was verified.** As before, the sandbox blocked itch.io, quaternius.com, mixamo.com, helpx.adobe.com, syntystore.com, sketchfab, fab.com and opengameart.org. GitHub was reachable, and this time that covered a lot:

- Quaternius's own website source is public at [`Quaternius/quaternius.github.io`](https://github.com/Quaternius/quaternius.github.io) (commit `f09e1f2`, 2026-08-28). Pack pages, licence page, FAQ, preview images and the animation viewer's Godot data were read from it. That counts as the creator's page.
- Many game repos commit the free Quaternius packs unchanged. The shipped `.gltf`/`.glb` files and `License_Standard.txt` were read from those, and the clip, bone and triangle counts below come from parsing the files.
- A throwaway render test (below) put some of the candidates through a copy of the project's pixel pipeline.

Tags:
- **[V] Verified**: from primary files (creator's site source, the shipped model or licence files, or our own render).
- **[S] Search snippet**: from a search engine's summary of a page that could not be opened. Check it on the page, especially prices and licence wording.
- **[U] Unverified**: inferred or estimated.

## Summary table

| # | Candidate | Slots | Licence | Public repo OK? | Price | Rig / clips | Tris (measured) | Tone | Status |
|---|---|---|---|---|---|---|---|---|---|
| **G-1** | **Quaternius Universal Base Characters + Modular Character Outfits – Fantasy** | Warrior, human Enemy types (bandit, ghoul) | CC0 1.0 | **Yes** | Standard free; Outfits Source $20, UBC Source $19.99 [S] | UE5-mannequin-style 65-joint humanoid, **no clips of its own**; driven by G-2 | Superhero body 14.3k, Ranger outfit 27.0k, Peasant outfit 12.9k (no head) | Realistic proportions, grounded medieval clothing and plate armour; stylised painted textures | [V] (Source tier [S]) |
| **G-2** | **Quaternius Universal Animation Library 1 + 2** | Clips for G-1 and G-3 | CC0 1.0 | **Yes** | Standard free (43 + 43 clips); UAL1 Source $14.99 [S]; UAL2 Source price not found | Same 65-joint skeleton as G-1; full Source list 126 + 134 clips | Mannequin 13.7k (not shipped) | Neutral mocap-like motion; has sword-and-shield combos, block, hits, death, zombie locomotion | [V] |
| G-3 | Quaternius Bestiary – Dungeon Monsters Kit (Aug 2026) | Creature Enemy types | **Quaternius Asset License (QAL) v1.0: no redistribution** | **No** (build-time fetch) | Standard free (Imp, Puglin); Source price not found | Same skeleton family as G-1 (55 joints, no pinkies); UAL clips play on it | Imp 15.2k | Stylised, saturated (WoW/Fortnite-like); 7 monsters incl. skeletons, werewolf, demon knight, crab brute | [V] licence, Standard files; Source contents from creator's preview image |
| **G-4** | **Quaternius Medieval Village MegaKit + Fantasy Props MegaKit** | Area kit (stone cellar), props, sword and shield | CC0 1.0 | **Yes** | Standard free (176 + 94 pieces) | n/a | Wall 56, floor 4, arch 196 | Same textured style as G-1; uneven stone brick, dark wood, iron | [V] Village, [V] Props page and preview |
| G-5 | Synty POLYGON Dark Fantasy (+ Dungeon Realms) | Warrior, many on-tone enemies, environment | Synty EULA: use in games, no redistribution | **No** (build-time fetch) | Dark Fantasy $199.99, $100 on sale; Dungeon Realms $29.99 [S] | Synty humanoid rig, **no clips**; ANIMATION Sword Combat (105 clips) sold separately, $49.99-69.99 [S] | Not found | The most on-tone content found: plague lord, inquisitor, corpse, wraith, undead, knights; flat-colour atlas low poly | [S] |
| G-6 | Mixamo characters + clips (Adobe) | Warrior, enemies, clips | Adobe terms: royalty-free use, **no distribution of raw files** | **No** (build-time fetch) | Free (Adobe ID) | `mixamorig:*` skeleton (49-67 joints), shared by every Mixamo character; not the same names as G-1 | Vanguard soldier 11.4k (the one in the three.js repo) | Realistic PBR; gritty characters exist (Paladin, Skeletonzombie, Warrok, Maw...) | licence [S], files [V] via three.js |
| G-7 | PSX-style CC0 packs (scoppio Fullplate Armor Knight; RgsDev and SigilsVault dungeon kits; Retro3DGraphicsCollection list) | Warrior, Area | CC0 (knight, RgsDev) [S]; SigilsVault licence not found | Yes if CC0 | Free | Knight: "simple rigging", no clips listed; other rigs unknown | Not measured | Grittiest look, but no matching animated enemies | [S] |

### Ranked recommendation

1. **All-Quaternius, new generation (G-1 + G-2 + G-4, with G-3 as an option).** This is the only option found that is free or cheap, CC0, grounded in proportion, and on **one shared skeleton** that the render test proved works in three.js without retargeting. It covers every slot:
   - **Warrior:** a plate-armour outfit from the Outfits **Source** tier ($20 [S]). The free tier only has Peasant and Ranger. Free stopgap: the hooded Ranger with a sword and round shield from Fantasy Props MegaKit.
   - **Enemy types (free, CC0):** (a) a **bandit or cutthroat** in the Ranger outfit, using its alternative texture `T_Ranger_3` and sword clips; (b) a **ghoul**: the free Superhero base body (shirtless, head included), with a sickly skin tint and UAL2's free zombie clips; (c) a **creature**, either the Bestiary Imp (free, but QAL, so build-time fetch) or, if everything must be CC0, a third human variant such as a heavy (Source outfit) or a cultist (Peasant outfit + a UBC Source head). That gives two humans and one undead, not three skeletons.
   - **Clips:** UAL1 + UAL2 Standard (free) already have idle, walk, jog and sprint, sword idle, three-hit sword combos, `Sword_Block`, `Idle_Shield_Loop`, `Shield_OneShot`, `Hit_Chest/Head/Knockback`, `Death01`, `Roll` and zombie locomotion. UAL1 Source ($14.99 [S]) adds `Death02`, `Dodge_Left/Right`, 8-way walk and jog, and `Hit_Shoulder_*`.
   - **Area:** a stone cellar built from Village MegaKit's `Wall_UnevenBrick_*`, `Floor_UnevenBrick`, `Wall_Arch` and `Stair_Interior_*`, dressed with Fantasy Props MegaKit (barrels, chests, cage, chains, candles, chandelier).
   - **Cost:** $0 to about $55: Outfits Source $20, optional UBC Source $19.99 for bare "Regular" heads, optional UAL1 Source $14.99.
   - **Risks:** the style is "stylised realistic" rather than grim (clean painted textures, heroic faces), so grit has to come from palette, lighting and choice of outfits. The files are heavy (27k tris, 4096² textures) and need a decimate-and-downscale step. Bare heads need a paid tier or Blender work.
2. **Synty POLYGON Dark Fantasy (G-5)** if tone matters more than licence convenience and $100-200. Its roster is exactly "gritty dark fantasy", and flat-colour atlas models should read well as pixels. But it has no clips (buy Synty ANIMATION or use Mixamo, both needing retargeting), it is a Unity-first FBX pack, it is not redistributable (the build-time-fetch workaround is needed), and every detail is [S].
3. **Mixamo (G-6)** as a **clip source only**, fetched at build time, for anything UAL lacks (for example a shield bash or a heavy two-hander), retargeted to the Quaternius skeleton offline. Mixamo characters themselves are the wrong fit here: realistic PBR textures turn to noise at 48 px (see render test), and raw files cannot go in the repo.
4. **PSX CC0 packs (G-7)** only for the Area, or as a later art pass. No animated enemy set matches them.

The current KayKit stand-in stays usable until the pick; recolouring it does not fix its proportions.

## Licences and the public repo

- **CC0 (Quaternius UBC, Outfits, UAL1/2, Village and Props MegaKits):** no conditions; raw files may be committed and served from Pages [V]. Each Standard zip ships `License_Standard.txt` or `License.txt` with the CC0 1.0 text, read from the files. The site FAQ also says "All models are under the CC0 License" [V]. The pack pages list CC0 for the Source tier as well ("Free to use in personal, educational and commercial projects. (CC0 License)") [V: page], but no Source download's licence file was seen [U].
- **New: Quaternius Asset License (QAL) v1.0, dated 2026-08-28** [V: `license.html` and the Bestiary's shipped `License_Standard.txt`]. Of the 83 pack pages, only the **Bestiary – Dungeon Monsters Kit** is under QAL; every other page still says CC0 [V: scanned all pack pages]. QAL §3a: "You may not extract, repackage, sublicense, sell, or otherwise redistribute the Assets (in original or modified form) as a standalone asset, asset pack, stock file, template, or similar product, whether for free or for payment... It does not restrict distributing a completed Product." A public repo that holds the raw `.glb` files is the same grey zone as the earlier "no redistribution" packs, so treat it the same way: **gitignore it and fetch at build time**. QAL §7 says future releases may use later versions, so **re-check the licence of any Quaternius pack released after August 2026**.
- **Mixamo:** the Adobe FAQ says characters and animations are "royalty free for personal, commercial, and non-profit projects" and that the one restriction is distributing the raw character and animation files [S: Adobe FAQ via search; the page was blocked]. Adobe community answers on open-source games say the same: use them inside your project, but do not redistribute the files [S]. Note that three.js commits Mixamo-derived models (`examples/models/gltf/Soldier.glb`, `Xbot.glb`, `Michelle.glb`) with no licence note [V]. That is a precedent, not a permission. **Build-time fetch**; also note that Mixamo downloads need an Adobe login, so CI would fetch from our own private store, not from Mixamo.
- **Synty:** the one-time-purchase licence is perpetual, "not limited by game engine, OS, platform or device", non-transferable, and forbids redistributing or reselling the assets [S]. One search summary mentions a duty to take "reasonable steps" to protect the assets [S, wording not seen]. A web game serves each `.glb` as a fetchable file, so read the EULA before buying. **Build-time fetch** at minimum.
- **CMU motion capture:** free for any use, including commercial, but the data itself must not be resold [S]. It is raw mocap and would need cleanup; not recommended for combat.

## Render test: how they read at ~48 art pixels [V, our render]

A throwaway page in the scratchpad copied the project's view and pipeline: a 600×270 target, 24 art px per world unit, orthographic camera at 45° yaw and 30° pitch, `MeshLambertMaterial` with the base-colour map only, the same hemisphere and key lights, the depth-edge outline (0.45 strength, 0.35 threshold), then ×4 nearest upscale. It was rendered in headless Chromium (SwiftShader), not on the Redmi. Every model was scaled to the KayKit Knight's height (the ~48 px Warrior) and posed with an idle clip and an attack clip.

What it showed:

- **Rig sharing works as-is.** UAL `Sword_Idle` and `Sword_Regular_A`, played by a plain `AnimationMixer` on the Ranger outfit and the Bestiary Imp, give the same poses as on UAL's own mannequin (the control column). Dropping every position track except `root` and `pelvis` changed nothing visible, so differences in proportion between the mannequin and the outfits don't distort the poses. No retargeting step is needed within the Quaternius family.
- **KayKit Knight** (6.7k tris): head about a third of its height and very wide; reads instantly, but toy-like. This is what the user rejected.
- **Quaternius Ranger + UAL** (27k tris): reads as a lean adult human. The head is about 6 px, limbs 2-3 px wide, and the stance and lunge are clearly legible. Belts, bracers and buckles turn into 1-2 px specks. It is darker and lower in contrast against a dark floor than KayKit, so enemy readability will depend on value and hue contrast, and on the outline.
- **Bestiary Imp + UAL** (15k tris): a gaunt red creature; the spiked club and hunched pose read. Its saturated red is the least gritty element.
- **Mixamo Vanguard soldier** (11.4k tris, PBR diffuse): the photo-like texture breaks into mottled noise at this size. It reads as a bulky figure, but with no clean colour areas.
- **Takeaway for the pick:** at 48 px, tone comes from **proportion, palette and pose**, not detail. Realistic proportions already read as grounded. Textures should be downscaled to 256² or 512² (flat-ish colour areas read best), and each Enemy type needs a distinct silhouette and value (for example a hooded dark bandit, a pale hunched ghoul, a red or brown creature).

The screenshots are only in the scratchpad (`scratchpad/lineup/lineup.png`); re-render in the real scene when the pick is made.

## Mali-G57 budget

- **Known good:** the rendering prototype held a steady frame rate on the Redmi with the KayKit Knight (6.7k tris) and a small KayKit Area [V: issue 04, no numbers recorded].
- **Triangles:** the free Quaternius characters are 13-27k tris each, 2-4× the Knight. The Warrior plus 3-4 enemies as shipped is about 70-120k skinned tris. That is probably fine for the GPU at 600×270, where fragment cost is tiny [U]. But at 48 px tall a character covers only about 1,000-1,500 pixels, so decimating to about 5-8k tris costs nothing visible. **Recommend a decimation pass** (Blender or `gltf-transform simplify`) to ≤ ~8k tris per character [U: target is an estimate; measure on the phone].
- **Draw calls:** the Ranger outfit is 9 separate skinned meshes in 2 materials. Merge the parts per character (they share one skeleton) to keep draw calls low.
- **Textures, the real risk:** `T_Ranger_BaseColor.png` is **4096² (6.4 MB PNG)**; body textures are 2048² [V]. 4096²×4 bytes is 64 MB of GPU memory per texture before mipmaps [V: arithmetic]. Downscale to 256-512², which is plenty at 48 px. Drop the normal, ORM and roughness maps: the Lambert pipeline only uses `map`.
- **Clips:** `UAL1_Standard.glb` is 7.4 MB and `UAL2_Standard.glb` 7.9 MB, each carrying 43 clips plus a 13.7k-tri mannequin [V]. Extract only the ~15 clips the PoC needs into one clip-only `.glb` shared by every character, estimated at 1-2 MB [U].
- **Area:** the Village MegaKit pieces are nearly free in geometry (straight wall 56 tris, floor 4, arch 196 [V]). Their look lives in 2048² tiling textures (normal + roughness + base colour); downscale those too.

## Details

### G-1 Quaternius Universal Base Characters + Modular Character Outfits – Fantasy [V, Source tier S]

- **Links:** [UBC page source](https://github.com/Quaternius/quaternius.github.io/blob/main/packs/universalbasecharacters.html), [Outfits page source](https://github.com/Quaternius/quaternius.github.io/blob/main/packs/modularcharacteroutfitsfantasy.html) (live: `quaternius.com/packs/universalbasecharacters.html`, `/modularcharacteroutfitsfantasy.html`; store: `quaternius.itch.io/universal-base-characters`, `/modular-character-outfits-fantasy`).
- **Screenshots:** [Outfits, all 12 (Source)](https://github.com/Quaternius/quaternius.github.io/blob/main/assets/images/fullres/modularcharacteroutfitsfantasy/source.jpg), [Outfits, free tier](https://github.com/Quaternius/quaternius.github.io/blob/main/assets/images/fullres/modularcharacteroutfitsfantasy/standard.jpg), [UBC](https://github.com/Quaternius/quaternius.github.io/blob/main/assets/images/fullres/universalbasecharacters.jpg).
- **Released:** UBC August 2025, Outfits November 2025 (updated January 2026 [S]).
- **Contents (page):**
  - UBC: 6 bodies (Superhero, Regular and Teen proportions, male and female), 20 hairstyles, "average 13k triangle count".
  - Outfits: 12 outfits from 62 modular parts, 3 colour textures each. The Source preview shows peasants, rangers, hooded rogues, nobles and **several plate-armour knights with closed helmets**.
- **Free (Standard) contents, read from a committed copy** ([Barbatos6669/elderforge](https://github.com/Barbatos6669/elderforge) `bb2ce46`; [lluancarlo/ReadyToStrategize](https://github.com/lluancarlo/ReadyToStrategize) `1a9c056`):
  - UBC Standard: only `Superhero_Male_FullBody` and `Superhero_Female_FullBody`, plus 7 hairstyles and eyebrows. The head is part of the single body mesh; only eyes and eyebrows are separate.
  - Outfits Standard: **only Peasant and Ranger** (male and female, whole outfits and modular parts), with alternative base colours `T_Peasant_2` and `T_Ranger_3`. The outfits carry their own "Regular" arms and legs but **no head**. The Ranger's hood hides this; the Peasant is headless (checked in a close-up render). A bare-headed human needs UBC Source ($19.99 [S]) or cutting the head off the free Superhero mesh in Blender [U: seam fit untested].
- **Rig:** one skin with **65 joints named like the UE5 mannequin**: `root`, `pelvis`, `spine_01-03`, `neck_01`, `Head`, `clavicle_l`, `upperarm_l`... `ball_leaf_r`. The joint set is identical to the UAL files [V: compared]. No clips inside the character files.
- **Measured:**

  | File | Tris | Meshes | Textures |
  |---|---|---|---|
  | `Superhero_Male_FullBody` | 14,318 | 3 | 2048² base colour |
  | `Male_Ranger` | 26,982 | 9 | 4096² base colour + 2048² body |
  | `Male_Peasant` | 12,894 | 4 | |

  Materials are PBR (base colour + normal + ORM/roughness). glTF 2.0 with separate `.bin` and `.png`; FBX also provided.
- **Look at 48 px:** see the render test. Grounded, lean silhouettes; the painted textures need downscaling and probably a darker, desaturated palette for "gritty".
- **Price:** Standard free (pay what you want). Outfits Source $20.00 and UBC Source $19.99 on itch.io [S]. Patreon $10/month gives one Source key a month ("worth $15") [V: page].

### G-2 Quaternius Universal Animation Library 1 and 2 [V]

- **Links:** [UAL1 page source](https://github.com/Quaternius/quaternius.github.io/blob/main/packs/universalanimationlibrary.html) (March 2025), [UAL2 page source](https://github.com/Quaternius/quaternius.github.io/blob/main/packs/universalanimationlibrary2.html) (January 2026), the [animation viewer](https://quaternius.com/animviewer.html) (a Godot web export; its `index.pck` in the site repo holds the full Source clip lists, which is where they were read from). Store: `quaternius.itch.io/universal-animation-library`, `/universal-animation-library-2`. Mirror of UAL1 Standard: [J-Ponzo/gltf-universal-animation-library](https://github.com/J-Ponzo/gltf-universal-animation-library) (CC0 LICENSE, 2025-06-10 copy).
- **Licence:** CC0 1.0 in the shipped `License.txt` [V].
- **Files:** each library ships a normal and an `_RM` (root-motion baked) variant.
- **Free Standard clips (read from `UAL1_Standard.glb` and `UAL2_Standard.glb`), filtered to what the PoC needs:**
  - idle: `Idle_Loop`, `Sword_Idle`, `Idle_Shield_Loop`, `Zombie_Idle_Loop`
  - locomotion: `Walk_Loop`, `Jog_Fwd_Loop`, `Sprint_Loop`, `Walk_Carry_Loop`, `Zombie_Walk_Fwd_Loop`, `Crouch_Fwd_Loop`
  - attack: `Sword_Attack`, `Sword_Regular_A/B/C` (each with a `_Rec` recovery clip), `Sword_Regular_Combo`, `Sword_Heavy_Combo`, `Sword_Dash`, `Shield_Dash`, `Shield_OneShot`, `Punch_Jab`, `Punch_Cross`, `Melee_Hook` (+`_Rec`), `Zombie_Scratch`, `OverhandThrow`, `Spell_Simple_*`
  - block: `Sword_Block`, `Idle_Shield_Break`
  - hit: `Hit_Chest`, `Hit_Head`, `Hit_Knockback`
  - death: `Death01`
  - evade: `Roll`
- **Source-only extras that matter** (full lists: UAL1 126 clips, UAL2 134 clips):
  - `Death02`, `Dodge_Left/Right`, 8-way `Walk_*`, `Jog_*` and `Crouch_*`, `Hit_Shoulder_L/R`, `Hit_Stomach`, `Turn90_L/R`, `Kick`
  - `Sword_Light_A-D` and `Sword_Heavy_A-D` (with recoveries), `Sword_Aerial_*`, `Sword_GroundPound`, `Sword_UpperCut`, `Sprint_Shield`
  - `Zombie_Bite`, `Zombie_Run_*`, `Zombie_Spawn`, `MonsterTransformation`, `KipUp`, `LiftAir_*`
- **Gaps for a gritty Warrior:** no two-handed weapon set, no 1H backstep or parry clip, and one free death. Mixamo or a Source tier would fill these.
- **Price:** Standard free; UAL1 Source $14.99 [S]; a "Pro" tier at $9.99 is mentioned in one snippet [S]; UAL2 Source price not found [U].

### G-3 Quaternius Bestiary – Dungeon Monsters Kit [V licence and Standard, S Source]

- **Links:** [page source](https://github.com/Quaternius/quaternius.github.io/blob/main/packs/bestiarydungeonmonsterskit.html), store `quaternius.itch.io/bestiary-dungeon-monsters-kit`. Screenshots: [all 7 (Source)](https://github.com/Quaternius/quaternius.github.io/blob/main/assets/images/fullres/bestiarydungeonmonsterskit/source.jpg), [free tier](https://github.com/Quaternius/quaternius.github.io/blob/main/assets/images/fullres/bestiarydungeonmonsterskit/standard.jpg).
- **Released:** August 2026. **Licence: QAL v1.0**, no redistribution (see above).
- **Contents:** 7 monsters with weapons, 3 colour variants each; "Humanoid Rig... Compatible with the Universal Animation Library"; FBX and GLB. From the Source preview image: an imp or goblin with a spiked club, two skeleton variants, a large armoured crab-shell brute, a horned demon knight with a flaming sword, a werewolf, and a pig-faced "Puglin". Names beyond Imp and Puglin were not seen in text [U].
- **Free Standard:** Imp and Puglin only [V: preview text and committed copies, e.g. [Elianfarias/Mismo](https://github.com/Elianfarias/Mismo), [devarminas/marque](https://github.com/devarminas/marque)].
- **Imp.glb:** 15,232 tris, 5 meshes, 55-joint skeleton with the same names as G-1 minus the pinkies; base colour, emissive, normal and ORM textures; **9.2 MB**; no clips [V].
- **Tone:** stylised and saturated, closer to WoW than to Diablo. Darker colour variants exist, but the shapes are cartoon-heroic.
- **Price:** Source price not found [U].

### G-4 Quaternius Medieval Village MegaKit + Fantasy Props MegaKit (Area) [V]

- **Links:** [Village page source](https://github.com/Quaternius/quaternius.github.io/blob/main/packs/medievalvillagemegakit.html) (January 2025), [Props page source](https://github.com/Quaternius/quaternius.github.io/blob/main/packs/fantasypropsmegakit.html) (June 2025). Mirror of Village Standard: [J-Ponzo/gltf-medieval-village-megakit](https://github.com/J-Ponzo/gltf-medieval-village-megakit) (CC0 LICENSE). Screenshots: [Village free tier](https://github.com/Quaternius/quaternius.github.io/blob/main/assets/images/fullres/medievalvillagemegakit/standard.jpg), [Props free tier](https://github.com/Quaternius/quaternius.github.io/blob/main/assets/images/fullres/fantasypropsmegakit/standard.jpg).
- **Licence:** CC0.
- **Village Standard: 176 glTF pieces [V: mirror].** Dungeon-usable:
  - walls: `Wall_UnevenBrick_Straight / _Door_Flat / _Door_Round / _Window_*`, `Wall_Arch`, `Wall_BottomCover`, `Corner_Exterior_Brick`
  - floors: `Floor_UnevenBrick`, `Floor_Brick`, `Floor_RedBrick`, `Floor_WoodDark*`
  - doors: `Door_*_Flat/Round`, `DoorFrame_Round_Brick`
  - stairs: `Stair_Interior_*`, `Stairs_Exterior_*`
  - props: `Prop_Support`, `Prop_MetalFence_*`, `Prop_Crate`, `Prop_Brick1-4`, `Prop_Vine*`
  - The rest is roofs and plaster walls (village-only). It builds a **stone cellar or undercroft**, not a cave or crypt; there are no pillars, bones or grates.
- **Props Standard:** 94 of 211 props, all using 4 shared texture sets. From the free-tier preview: barrels, crates, chests, iron cage, chains, candles and chandeliers, cauldrons, banners, anvil, tables and shelves, **a sword and a round shield** (usable as the Warrior's weapons), potions, keys, coins. The worn texture variants are Source-only.
- **Look:** painted PBR textures in the same family as G-1, so characters and Area match.
- **Alternative in the same family:** Quaternius's older "Modular Dungeons Pack" (2019, CC0, 48 models) is flat-shaded sandstone with red banners ([preview](https://github.com/Quaternius/quaternius.github.io/blob/main/assets/images/fullres/updatedmodulardungeon.jpg)). It is more dungeon-like, but its flat, bright style clashes with G-1 unless retinted.

### G-5 Synty POLYGON Dark Fantasy / Dungeon Realms [S]

- **Links:** `syntystore.com/products/polygon-dark-fantasy`, `/polygon-dungeon-realms`, `/animation-sword-combat`; licence `syntystore.com/pages/one-time-purchase-licence`.
- **Dark Fantasy:** 13 characters (apothecary, barbarian, behemoth, colossus, corpse, inquisitor, knights, necromancer, plague, plague lord, undeads, wraith) and 21 attachments, plus a cathedral environment. Unity 2022.3+, Mecanim. $199.99, $100 on sale, one-time with 5 seats [S].
- **Dungeon Realms:** 19 characters (dwarves, hero male and female, nomads, 3 demon skeletons, undead knight, big demon), 1,118 prefabs. $29.99 [S].
- **Clips:** Synty characters come without clips as far as the snippets show [U]. ANIMATION – Sword Combat is 105 clips on the Synty rig with a prop bone, and needs third-party retargeting for other rigs [S].
- **Budget and look:** poly counts not found. Synty's single-atlas flat colours should pixelate cleanly [U].
- **Licence:** no redistribution, so build-time fetch; Unity-first FBX needs converting to glTF [U].

### G-6 Mixamo [licence S, rig V]

- **Link:** `mixamo.com` (Adobe ID needed); FAQ `helpx.adobe.com/creative-cloud/faq/mixamo-faq.html`.
- **Rig:** every Mixamo character and clip uses the `mixamorig:` skeleton [V: `Soldier.glb` 49 joints, `Xbot.glb` 67 joints in the three.js repo]. Clips therefore move between Mixamo characters without retargeting. Onto the Quaternius skeleton they need a one-off offline retarget (Blender, or three.js `SkeletonUtils.retargetClip`) [U: not tried].
- **Clip packs:** a "Pro Sword and Shield Pack" exists, with slash, kick and strafe files seen in a third-party repo; the full list was not seen [S].
- **Characters:** gritty characters exist (Paladin w/ Prop J Nordstrom, Skeletonzombie T Avelange, Warrok W Kurniawan, Maw J Laygo, several zombies) [S]. Poly counts vary; the Vanguard soldier is 11.4k tris, 2.1 MB with 4 clips [V].
- **Verdict:** use it as a gap-filling clip source, not for characters. Raw files stay out of the repo.

### G-7 PSX-style CC0 [S]

- **scoppio (Luana Coppio) "Fullplate Armor Knight":** `scoppio.itch.io/fullplate-armor-knight`. CC0, "simple rigging", low-res PSX textures, Blend/FBX/GLB. No clips listed and the rig is unknown.
- **RgsDev "Free Modular Low Poly Dungeon Pack":** walls, doors, floors, stairs, traps, chest; CC0; colours by material; 6.7 MB.
- **SigilsVault "Modular Dungeon Kit v1.0":** 90+ dark-fantasy pieces, "GameCube/PS2-era". **Licence not found**; their Cathedral kit is CC0.
- **[Miziziziz/Retro3DGraphicsCollection](https://github.com/Miziziziz/Retro3DGraphicsCollection):** a curated link list of CC0 PSX assets, incl. the knight above, "retro modular dungeon tileset" (valsekamerplant) and Kenney Retro Medieval Kit [V: README]. The files themselves are on itch.io.
- **Verdict:** a good look for grit, but no animated enemy family and unknown rigs. Park it as an Area or art-pass option.

### Rejected or not pursued

- **Recoloured KayKit:** fixes palette, not proportions.
- **Quaternius Ultimate Monsters and RPG Characters:** CC0 but cute, and on their own older rigs (see asset-candidates.md).
- **AI-generated "CC0" models** (for example Meshy listings): provenance unclear; skipped.
- **Sketchfab and Fab CC-BY rigged knights:** one-off characters with no matching enemies, and they could not be opened to verify.
- **CMU mocap:** unrestricted but raw; too much cleanup for combat clips.

## Open questions for the asset pick (issue 06)

- Is "stylised realistic" (Quaternius new-generation) gritty enough, or does the tone need Synty Dark Fantasy's plague and undead roster? A 10-minute look at both previews would settle it: [Outfits Source](https://github.com/Quaternius/quaternius.github.io/blob/main/assets/images/fullres/modularcharacteroutfitsfantasy/source.jpg) vs the Synty store page.
- Spend ~$20-55 on Quaternius Source tiers (armoured Warrior, bare heads, `Death02`/dodges)? Or start free with the Ranger as the Warrior and upgrade later?
- Is a QAL creature (the Bestiary Imp, via build-time fetch) acceptable for the third Enemy type? Or should all three be CC0 humans or undead (bandit, ghoul, heavy)?
- Build-time fetch: if any non-redistributable pack is chosen (Bestiary, Synty, Mixamo clips), where is the private store (a private repo or a secret URL), and who sets up the CI secret?
- Asset processing step: decimate to ≤ ~8k tris, downscale textures to 256-512², merge meshes, and extract a shared clip `.glb`. Is that a build script in the repo (`gltf-transform`) or a one-off Blender pass whose outputs are committed?
- Area: is a stone cellar (Village MegaKit) acceptable as "dungeon", or is a crypt or cave wanted? The latter points to a PSX kit or Synty.
- Measure on the Redmi: Warrior + 4 enemies at 8k vs 27k tris, and texture memory at 512² vs 4096².

## Sources

Read directly (primary):
- https://github.com/Quaternius/quaternius.github.io (commit `f09e1f2`): `license.html` (QAL v1.0), `faq.html`, `packs/*.html` (all 83 scanned for their licence line), `assets/images/fullres/*` previews, `animviewer.html` + `index.pck` (UAL1/UAL2 Source clip names)
- https://github.com/lluancarlo/ReadyToStrategize (`1a9c056`): `Universal Animation Library[Standard]/…/UAL1_Standard.glb`, `Universal Animation Library 2[Standard]/…/UAL2_Standard.glb` + `License.txt`, `README.txt`; `Universal Base Characters[Standard]/…/Superhero_Male_FullBody.gltf` + `License_Standard.txt`
- https://github.com/Barbatos6669/elderforge (`bb2ce46`): `Modular Character Outfits - Fantasy[Standard]/…` (file list, `Male_Ranger.gltf`, `Male_Peasant.gltf`, textures, `License_Standard.txt`)
- https://github.com/Elianfarias/Mismo (`9eb63a5`): Bestiary Standard file list and `License_Standard.txt` (QAL text)
- https://github.com/devarminas/marque (`d918c76`): `client/assets/quaternius/bestiary/Imp.glb`
- https://github.com/J-Ponzo/gltf-universal-animation-library (`e24c23c`), https://github.com/J-Ponzo/gltf-medieval-village-megakit (`21104b4`): README, LICENSE, file lists, sample pieces
- https://github.com/mrdoob/three.js: `examples/models/gltf/Soldier.glb`, `Xbot.glb`, `examples/models/fbx/README.md`
- https://github.com/Miziziziz/Retro3DGraphicsCollection: README
- This repo: `src/render/view.ts`, `src/render/pixel-pipeline.ts`, `src/scene/assets.ts`, `public/models/kaykit/knight.glb` (render test baseline)

Seen through search-engine snippets (pages blocked):
- https://quaternius.itch.io/universal-base-characters/purchase, https://quaternius.itch.io/modular-character-outfits-fantasy/purchase, https://quaternius.itch.io/universal-animation-library/purchase, https://quaternius.itch.io/universal-animation-library-2, https://quaternius.itch.io/bestiary-dungeon-monsters-kit, https://itch.io/e/37883297/quaternius-updated-modular-character-outfits-fantasy
- https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html, https://community.adobe.com/t5/mixamo-discussions/mixamo-faq-licensing-royalties-ownership-eula-and-tos/td-p/13234775, https://community.adobe.com/questions-617/creation-of-an-open-source-game-repository-with-mixamo-animations-568796, https://wiki.socialakiba.com/index.php/Mixamo_Characters
- https://syntystore.com/products/polygon-dark-fantasy, https://syntystore.com/products/polygon-dungeon-realms, https://syntystore.com/products/animation-sword-combat, https://syntystore.com/pages/one-time-purchase-licence, https://syntystore.com/pages/licences-overview
- https://scoppio.itch.io/fullplate-armor-knight, https://rgsdev.itch.io/free-modular-low-poly-dungeon-pack-by-rgsdev, https://sigilsvault.itch.io/modular-dungeon-kit-v10, https://sigilsvault.itch.io/modular-cathedral-kit, https://elbolilloduro.itch.io/characters-psx
- CMU mocap licence summary: https://www.re3data.org/repository/r3d100012183, https://huggingface.co/datasets/gbionics/cmu-fbx
