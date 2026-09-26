# Which gritty, rigged 3D characters and dungeon kit could replace KayKit?

Type: research
Mode: AFK
Status: claimed
Blocked by: (none)

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
