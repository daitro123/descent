// PROTOTYPE (throwaway): touch control schemes. See .scratch/isometric-poc/issues/05-touch-controls.md
//
// The full KayKit Knight (block, dodge and hit clips) and a Skeleton Minion as the stand-in enemy.
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

const BASE = `${import.meta.env.BASE_URL}prototype-controls/kaykit/`;
const loader = new GLTFLoader();

export async function loadCharacter(name: 'knight' | 'skeleton-minion'): Promise<GLTF> {
  const gltf = await loader.loadAsync(`${BASE}${name}.glb`);
  gltf.scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const source = object.material as THREE.MeshStandardMaterial;
    object.material = new THREE.MeshLambertMaterial({ map: source.map, side: source.side });
    source.dispose();
    object.frustumCulled = false;
  });
  return gltf;
}

/** Gives every mesh under `root` its own material, so one character can flash without the others. */
export function ownMaterials(root: THREE.Object3D): THREE.MeshLambertMaterial[] {
  const materials: THREE.MeshLambertMaterial[] = [];
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const copy = (object.material as THREE.MeshLambertMaterial).clone();
    object.material = copy;
    materials.push(copy);
  });
  return materials;
}

/** Tints `materials` towards `color` by `amount` (0 = off), through the emissive term. */
export function flash(materials: THREE.MeshLambertMaterial[], color: number, amount: number): void {
  for (const m of materials) m.emissive.setHex(color).multiplyScalar(amount);
}

export function clipNamed(gltf: GLTF, name: string): THREE.AnimationClip {
  const clip = THREE.AnimationClip.findByName(gltf.animations, name);
  if (!clip) throw new Error(`No animation named ${name}`);
  return clip;
}
