// PROTOTYPE (throwaway): 2D sprites vs pixelated 3D. See .scratch/isometric-poc/issues/04-rendering-approach.md
import * as THREE from 'three';
import { loadModel } from './assets';

/** Half the Area's side: the floor runs from -HALF to +HALF on x and z. */
const HALF = 10;
const TILE = 4;

type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };
type Circle = { x: number; z: number; r: number };

export type Area = {
  root: THREE.Group;
  /** Pushes a circle at (p.x, p.z) with radius r out of walls and props, in place. */
  collide(p: THREE.Vector3, r: number): void;
};

/**
 * A small room from the KayKit Dungeon kit: 5×5 floor tiles, back walls, a low wall to walk
 * behind, a pillar, barrels and crates to brush past. Identical in all variants.
 */
export async function buildArea(): Promise<Area> {
  const [floor, wall, pillar, barrelLarge, barrelSmall, crates] = await Promise.all(
    ['floor_tile_large', 'wall', 'pillar', 'barrel_large', 'barrel_small', 'crates_stacked'].map(
      async (name) => (await loadModel(name)).scene,
    ),
  );

  const root = new THREE.Group();
  const rects: Rect[] = [];
  const circles: Circle[] = [];

  const place = (model: THREE.Object3D, x: number, z: number, yaw = 0, scaleY = 1) => {
    const copy = model.clone();
    copy.position.set(x, 0, z);
    copy.rotation.y = yaw;
    copy.scale.y = scaleY;
    root.add(copy);
    return copy;
  };

  for (let x = -HALF + TILE / 2; x < HALF; x += TILE) {
    for (let z = -HALF + TILE / 2; z < HALF; z += TILE) {
      // Tile tops sit at y = 0.05; drop them so feet at y = 0 stand on the surface.
      place(floor, x, z).position.y = -0.05;
    }
  }

  // Back walls (the far sides from the camera), 4 units tall. The near sides stay open.
  for (let c = -HALF + TILE / 2; c < HALF; c += TILE) {
    place(wall, c, -HALF);
    place(wall, -HALF, c, Math.PI / 2);
  }

  // A free-standing wall, squashed to half height so the Warrior's head shows above it from
  // behind: the case where sprite sorting goes wrong first.
  place(wall, -4, 2, 0, 0.5);
  place(wall, 0, 2, 0, 0.5);
  rects.push({ minX: -6, maxX: 2, minZ: 1.5, maxZ: 2.5 });

  place(pillar, 5, -5);
  circles.push({ x: 5, z: -5, r: 0.75 });
  place(barrelLarge, -6, -6);
  circles.push({ x: -6, z: -6, r: 0.9 });
  place(barrelSmall, -4.6, -7.2);
  circles.push({ x: -4.6, z: -7.2, r: 0.5 });
  place(crates, -7, 7, 0.3);
  circles.push({ x: -7, z: 7, r: 1.1 });

  return {
    root,
    collide(p, r) {
      for (const c of circles) {
        const dx = p.x - c.x;
        const dz = p.z - c.z;
        const d = Math.hypot(dx, dz);
        const min = c.r + r;
        if (d < min && d > 1e-6) {
          p.x = c.x + (dx / d) * min;
          p.z = c.z + (dz / d) * min;
        }
      }
      for (const b of rects) {
        const cx = THREE.MathUtils.clamp(p.x, b.minX, b.maxX);
        const cz = THREE.MathUtils.clamp(p.z, b.minZ, b.maxZ);
        const dx = p.x - cx;
        const dz = p.z - cz;
        const d = Math.hypot(dx, dz);
        if (d < r && d > 1e-6) {
          p.x = cx + (dx / d) * r;
          p.z = cz + (dz / d) * r;
        }
      }
      // Back walls are 1 unit thick, centred on the edge; the near edges are the floor's edge.
      p.x = THREE.MathUtils.clamp(p.x, -HALF + 0.5 + r, HALF - r);
      p.z = THREE.MathUtils.clamp(p.z, -HALF + 0.5 + r, HALF - r);
    },
  };
}
