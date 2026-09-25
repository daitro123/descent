import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

const BASE = `${import.meta.env.BASE_URL}models/kaykit/`;
const loader = new GLTFLoader();

export async function loadModel(name: string): Promise<GLTF> {
  const gltf = await loader.loadAsync(`${BASE}${name}.glb`);
  gltf.scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    // Lambert instead of the packs' PBR material: flat, cheaper on the Mali GPU, and no
    // specular glints to sparkle at low resolution.
    const source = object.material as THREE.MeshStandardMaterial;
    object.material = new THREE.MeshLambertMaterial({ map: source.map, side: source.side });
    source.dispose();
    // Skinned meshes keep their bind-pose bounds while animating; never cull them wrongly.
    object.frustumCulled = false;
  });
  return gltf;
}

export function clipNamed(gltf: GLTF, name: string): THREE.AnimationClip {
  const clip = THREE.AnimationClip.findByName(gltf.animations, name);
  if (!clip) throw new Error(`No animation named ${name}`);
  return clip;
}
