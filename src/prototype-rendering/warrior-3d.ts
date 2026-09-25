// PROTOTYPE (throwaway): 2D sprites vs pixelated 3D. See .scratch/isometric-poc/issues/04-rendering-approach.md
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clipNamed } from './assets';
import { CLIPS, movement, type Warrior } from './warrior';
import { facingYaw, snapToPixel } from './view';

/** Knight.glb carries every weapon and shield; show one sword and one shield. */
const HIDDEN_GEAR = ['1H_Sword_Offhand', 'Badge_Shield', 'Rectangle_Shield', 'Spike_Shield', '2H_Sword'];

export function equipKnight(gltf: GLTF): void {
  for (const name of HIDDEN_GEAR) {
    const node = gltf.scene.getObjectByName(name);
    if (node) node.visible = false;
  }
}

export type Model3DStyle = {
  /** Animation sample rate; 0 plays the clips smoothly at the display rate. */
  stepFps: number;
  /** Turn towards a new facing over time instead of snapping to it. */
  smoothTurn: boolean;
  /** Blend time between clips, in seconds; 0 cuts. */
  crossfade: number;
};

const TURN_RATE = 14; // radians per second

/** Approach B: the live, skinned KayKit model, drawn into the low-res target. */
export class Warrior3DView {
  readonly root: THREE.Object3D;
  private readonly mixer: THREE.AnimationMixer;
  private readonly actions = new Map<string, THREE.AnimationAction>();
  private current: THREE.AnimationAction | null = null;
  private serial = -1;
  private yaw = 0;
  private pending = 0;

  constructor(
    gltf: GLTF,
    private readonly style: Model3DStyle,
  ) {
    equipKnight(gltf);
    this.root = gltf.scene;
    this.mixer = new THREE.AnimationMixer(this.root);
    for (const name of Object.values(CLIPS)) {
      const clip = clipNamed(gltf, name);
      const action = this.mixer.clipAction(clip);
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
      if (this.current && this.current !== next && this.style.crossfade > 0) {
        next.crossFadeFrom(this.current, this.style.crossfade, false);
      } else if (this.current && this.current !== next) {
        this.current.stop();
      }
      this.current = next;
      // A cut shows the new clip's first pose immediately, even when stepping.
      if (this.style.stepFps > 0) this.mixer.update(0);
    }
    this.serial = warrior.serial;

    this.mixer.timeScale = movement.animSpeed;
    if (this.style.stepFps > 0) {
      const step = 1 / this.style.stepFps;
      this.pending += dt;
      while (this.pending >= step) {
        this.mixer.update(step);
        this.pending -= step;
      }
    } else {
      this.mixer.update(dt);
    }

    const target = facingYaw(warrior.facing);
    if (this.style.smoothTurn) {
      const diff = Math.atan2(Math.sin(target - this.yaw), Math.cos(target - this.yaw));
      this.yaw += Math.sign(diff) * Math.min(Math.abs(diff), TURN_RATE * dt);
    } else {
      this.yaw = target;
    }
    this.root.rotation.y = this.yaw;
    snapToPixel(this.root.position.copy(warrior.position));
  }
}
