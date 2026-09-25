# Which gritty, rigged 3D characters and dungeon kit could replace KayKit?

Type: research
Mode: AFK
Status: resolved
Blocked by:

## Question

The PoC renders live 3D models as pixel art (see [Pixel art from 2D sprites or from pixelated 3D models?](04-rendering-approach.md)), and the user wants a **gritty, grounded** tone, not the cute, chunky style of KayKit, Quaternius or Kenney. Which 3D assets could supply that?

Find candidates for:
- a Warrior (melee, sword and shield or two-handed)
- at least 3 visually distinct enemy types (ideally not all skeletons)
- a dungeon Area kit

For each candidate, record:
- **Licence:** can the files be committed to a **public** repo and served from GitHub Pages? CC0 and CC-BY are fine; "no redistribution" packs need the build-time-fetch workaround from the asset-candidates research.
- **Price.**
- **Rig and clips:** is it rigged, and does it have idle, walk and/or run, attacks, block, hit and death clips? Can the characters share a rig and clips?
- **Poly count and file size:** the Mali-G57 budget, and whether it still reads at ~48 art pixels tall.
- **Look:** a screenshot or link.

Also check animation libraries that could fill gaps on a shared humanoid rig, such as Mixamo, and whether their licence allows the files in a public repo. Say how well each candidate would read after the pixel pipeline (600×270 art pixels, flat Lambert lighting, depth outline).

Findings go in `.scratch/isometric-poc/research/gritty-3d-assets.md`.

## Answer

Full findings: [research/gritty-3d-assets.md](../research/gritty-3d-assets.md). itch.io, Synty, Adobe and Mixamo pages were blocked from the research sandbox, so prices, Synty and Mixamo licence wording, and paid-tier contents are from search summaries (marked [S] there).

- **Top pick: new-generation Quaternius, all on one shared skeleton.** A render test in a copy of our pixel pipeline played the clips on the outfits and the Bestiary Imp in three.js with no retargeting.
  - **Characters:** Universal Base Characters + Modular Character Outfits – Fantasy.
  - **Clips:** Universal Animation Library 1 + 2.
  - **Area:** Medieval Village MegaKit + Fantasy Props MegaKit.
  - **Licence and cost:** CC0, and free except the optional Source tiers (about $20–55).
- **Slots:**
  - **Warrior:** the free hooded Ranger with sword and shield for now; a plate-armour outfit is in the Outfits Source tier ($20 [S]).
  - **Enemy types:** a bandit (Ranger outfit), a ghoul (bare base body with zombie clips), and either the Bestiary Imp or a third human. The Imp is under Quaternius's new no-redistribution licence (QAL, 2026-08), so it needs the build-time fetch.
  - **Area:** a stone cellar, not a crypt or cave.
- **Clips already in the free tiers:** sword idle, 3-hit combos, block, shield, hits, death, roll and zombie walk. Mixamo is a fallback clip source only: build-time fetch, and its clips need retargeting.
- **Look at ~48 px:** Quaternius reads as grounded adults. Fine detail becomes 1–2 px specks, so grit has to come from proportion, palette and silhouette. The style is "stylised realistic", not grim.
- **Runner-up for tone:** Synty POLYGON Dark Fantasy (about $100–200 [S]). It has no clips and can't be redistributed.
- **Mixamo characters don't fit:** their realistic PBR textures turn to noise at this size.
- **Processing needed before the phone:**
  - cut characters to ≤ ~8k triangles (from 13–27k)
  - shrink textures to 256–512² (from 4096², 64 MB of GPU memory each)
  - merge the 9 meshes per outfit
  - extract one shared clip file
  - measure the result on the Redmi
