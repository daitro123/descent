# Which CC0 or licensed asset packs could the PoC use?

Type: research
Mode: AFK
Status: resolved

## Question

Build a shortlist for **each** rendering approach (see the Three.js pixel-rendering research question), since the approach isn't chosen yet:

- **2D:** isometric pixel-art sprite sets with **8 directions**: a warrior (idle, walk, attack, hit, death at minimum), 3 visually distinct enemies, and an isometric tileset with floor, walls and props. Ideally all from one artist or matching in style.
- **3D:** low-poly, rigged and animated models (a warrior, 3 enemies, dungeon or outdoor kit pieces) that would read well once pixelated.

For each candidate: link, licence (it must allow a public web build in a public repo), price, animation list, direction count, and whether the pieces match in style. Flag the top 2–3 per approach.

Findings go to `.scratch/isometric-poc/research/asset-candidates.md`.

## Answer

Full findings: [research/asset-candidates.md](../research/asset-candidates.md). itch.io, Kenney, Quaternius and OpenGameArt were blocked from the research sandbox, so items marked [S] (price, licence wording) need checking on the store page before picking.

- **3D, top pick: KayKit Adventurers + Skeletons + Dungeon Remastered.** CC0, free, on GitHub. One artist and one shared rig, 76–95 clips per character (idle, walk, 1H/2H attacks, block, hits, deaths, dodges), and a dungeon kit of 200+ pieces. Weak point: all 4 free enemies are skeletons (Minion, Warrior, Rogue, Mage). They differ in silhouette and weapon; a $7.95 add-on brings a Skeleton Golem. The model files are 3.6–4.9 MB each, so unused animations must be stripped for mobile.
- **3D, fallbacks:** Quaternius (CC0, many more monster types, but about 14 clips and a cuter style); Kenney (CC0, toy-like).
- **2D, top pick: render KayKit into 8-direction sprite sheets ourselves.** It's the only free, CC0, style-matched 2D option. It costs an offline render step, and it means the 2D-vs-3D prototype compares the same art.
- **2D, alternatives:** Flare art (CC-BY-SA; 8 directions and many enemies, but painterly high-res art, not true pixel art, and no walk cycle). SmallScaleInt (paid, true pixel art, 8 directions, but no redistribution, so the raw files can't be committed to the public repo).
- **Repo constraint:** most paid itch.io/CraftPix packs forbid redistribution. CC0 and CC-BY assets are safe to commit.
