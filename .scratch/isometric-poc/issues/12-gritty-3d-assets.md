# Which gritty, rigged 3D characters and dungeon kit could replace KayKit?

Type: research
Mode: AFK
Status: resolved
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

## Answer

Findings: [research/gritty-3d-assets.md](../research/gritty-3d-assets.md) (researched 2026-09-26; captured on the throwaway branch `research/gritty-3d-assets`, commit `0f18991`). Store and licence pages were blocked by the sandbox proxy. Figures read from files on GitHub are marked [V]; prices and licence wording taken from search snippets are marked [S] and need checking before anything is bought.

- **No free, redistributable set is gritty, fully animated and from one artist.** The gritty sets either forbid redistribution (Mixamo, Synty, PSX packs) or are CC-BY-SA art that needs converting (0 A.D., Flare).
- **Animations are solved, and CC0:** Quaternius Universal Animation Library 1 and 2 (free Standard tiers) share one 65-joint rig. Between them they cover idle and locomotion, sword attacks, sword and shield block, hits, death, roll and a zombie set [V]. They can be committed; retarget any humanoid character onto them.
- **Characters, by constraint:**
  - **If the build-time fetch is acceptable:** Mixamo first (free and the grittiest: Paladin as the Warrior; Warrok, Skeletonzombie or Vampire, and Mutant or Parasite as Enemy types). The risk is realistic textures turning to mush under flat Lambert at 48 px. Then Synty POLYGON Dungeon or Dark Fantasy: the best read and one artist with a matching dungeon, but paid and with no clips of its own.
  - **If everything must be committable:** 0 A.D. (CC-BY-SA 3.0): grounded, very light (219 to 1,340 triangles), made for this on-screen size. The Enemy types would be bandits, wolves and bears; there are no undead. It needs a Collada conversion and clips from the Quaternius library.
  - **Wildcard:** $5–12 PSX packs (no redistribution), or the free CC0 scoppio plate knight. Best texel-to-pixel fit; mixed artists.
- **Area kit:** Synty's dungeon if Synty is picked. Otherwise, first try retexturing the KayKit Dungeon geometry already in use in dark colours. After that, AssetHunts Dark Dungeon (CC0, look unseen) or a ~$5 PSX kit behind the fetch.
- **Budget:** the current Knight (6,652 triangles, 499 KB) runs steadily on the Redmi. Detail beyond roughly 2–3k triangles or 256–512 px textures can't be seen at 48 px, so decimating and downscaling is safe.
- **Open questions for the pick:** is the build-time fetch acceptable? How dark is "gritty" (grounded-historical, dark fantasy, PS1 horror)? Undead and monsters, or humans and beasts? Budget for paid packs?

The research recommends choosing by eye after an on-device bake-off, which is now [Which gritty candidates read best through the pixel pipeline on the Redmi?](13-asset-bake-off.md), ahead of [Which asset pack(s) does the PoC use?](06-asset-pick.md).
