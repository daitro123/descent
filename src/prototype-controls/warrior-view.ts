// PROTOTYPE (throwaway): touch control schemes. See .scratch/isometric-poc/issues/05-touch-controls.md
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { movement } from '../scene/warrior';
import { facingYaw, snapToPixel } from '../render/view';
import { clipNamed, flash, ownMaterials } from './assets';
import { CLIPS, combat, type Warrior } from './warrior';

const HIDDEN_GEAR = ['1H_Sword_Offhand', 'Badge_Shield', 'Rectangle_Shield', 'Spike_Shield', '2H_Sword'];
const ONE_SHOT: string[] = [CLIPS.attack, CLIPS.blockHit, CLIPS.hurt, ...CLIPS.dodge];
const CROSSFADE_S = 0.12;
const TURN_RATE = 16;

/** The live Knight, as in the PoC scene, plus block, dodge and hit clips and a red flash when hit. */
export class WarriorView {
  readonly root: THREE.Object3D;
  private readonly mixer: THREE.AnimationMixer;
  private readonly actions = new Map<string, THREE.AnimationAction>();
  private readonly materials: THREE.MeshLambertMaterial[];
  private current: THREE.AnimationAction | null = null;
  private serial = -1;
  private yaw = 0;
  private flashLeft = 0;

  constructor(gltf: GLTF) {
    for (const name of HIDDEN_GEAR) {
      const node = gltf.scene.getObjectByName(name);
      if (node) node.visible = false;
    }
    this.root = gltf.scene;
    this.materials = ownMaterials(this.root);
    this.mixer = new THREE.AnimationMixer(this.root);
    for (const name of [CLIPS.idle, CLIPS.walk, CLIPS.run, CLIPS.block, ...ONE_SHOT]) {
      const action = this.mixer.clipAction(clipNamed(gltf, name));
      if (ONE_SHOT.includes(name)) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      }
      this.actions.set(name, action);
    }
  }

  hurt(): void {
    this.flashLeft = 0.18;
  }

  sync(warrior: Warrior, dt: number): void {
    const next = this.actions.get(warrior.clip)!;
    const restart = warrior.serial !== this.serial && ONE_SHOT.includes(warrior.clip);
    if (next !== this.current || restart) {
      next.reset().play();
      // Dodges play in exactly the dodge time, whatever the clip's own length.
      const rate = CLIPS.dodge.includes(warrior.clip as never) ? next.getClip().duration / combat.dodgeTime : 1;
      next.setEffectiveTimeScale(rate);
      if (this.current && this.current !== next) next.crossFadeFrom(this.current, CROSSFADE_S, false);
      this.current = next;
    }
    this.serial = warrior.serial;
    this.mixer.timeScale = movement.animSpeed;
    this.mixer.update(dt);

    this.flashLeft -= dt;
    flash(this.materials, 0xff2020, this.flashLeft > 0 ? 0.8 : 0);

    const target = facingYaw(warrior.facing);
    const diff = Math.atan2(Math.sin(target - this.yaw), Math.cos(target - this.yaw));
    this.yaw += Math.sign(diff) * Math.min(Math.abs(diff), TURN_RATE * dt);
    this.root.rotation.y = this.yaw;
    snapToPixel(this.root.position.copy(warrior.position));
  }
}
