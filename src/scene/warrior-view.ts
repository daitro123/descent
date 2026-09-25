import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { facingYaw, snapToPixel } from '../render/view';
import { clipNamed } from './assets';
import { CLIPS, movement, type Warrior } from './warrior';

/** Knight.glb carries every weapon and shield; show one sword and one shield. */
const HIDDEN_GEAR = ['1H_Sword_Offhand', 'Badge_Shield', 'Rectangle_Shield', 'Spike_Shield', '2H_Sword'];

/** Blend time between clips, in seconds. */
const CROSSFADE_S = 0.15;
const TURN_RATE = 14; // radians per second

/**
 * The live, skinned KayKit Knight: smooth animation at the display rate, blended clips and
 * smooth turns towards the 8 facings. The model is drawn into the low-res target like the rest of
 * the scene; only its position is snapped to the art-pixel grid.
 */
export class WarriorView {
  readonly root: THREE.Object3D;
  private readonly mixer: THREE.AnimationMixer;
  private readonly actions = new Map<string, THREE.AnimationAction>();
  private current: THREE.AnimationAction | null = null;
  private serial = -1;
  private yaw = 0;

  constructor(gltf: GLTF) {
    for (const name of HIDDEN_GEAR) {
      const node = gltf.scene.getObjectByName(name);
      if (node) node.visible = false;
    }
    this.root = gltf.scene;
    this.mixer = new THREE.AnimationMixer(this.root);
    for (const name of Object.values(CLIPS)) {
      const action = this.mixer.clipAction(clipNamed(gltf, name));
      if (name === CLIPS.attack) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      }
      this.actions.set(name, action);
    }
  }

  sync(warrior: Warrior, dt: number): void {
    const next = this.actions.get(warrior.clip)!;
    const repeatAttack = warrior.state === 'attack' && warrior.serial !== this.serial;
    if (next !== this.current || repeatAttack) {
      next.reset().play();
      if (this.current && this.current !== next) next.crossFadeFrom(this.current, CROSSFADE_S, false);
      this.current = next;
    }
    this.serial = warrior.serial;

    this.mixer.timeScale = movement.animSpeed;
    this.mixer.update(dt);

    const target = facingYaw(warrior.facing);
    const diff = Math.atan2(Math.sin(target - this.yaw), Math.cos(target - this.yaw));
    this.yaw += Math.sign(diff) * Math.min(Math.abs(diff), TURN_RATE * dt);
    this.root.rotation.y = this.yaw;
    snapToPixel(this.root.position.copy(warrior.position));
  }
}
