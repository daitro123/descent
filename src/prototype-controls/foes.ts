// PROTOTYPE (throwaway): touch control schemes. See .scratch/isometric-poc/issues/05-touch-controls.md
//
// Stand-in Enemies: Skeleton Minions that walk up, telegraph a swing with a red wedge on the floor
// (where it will hit), then strike. Only one winds up at a time, to fit the slower tempo. Three
// hits kill one; it comes back out of the floor a few seconds later. Just enough to have something
// to aim at, block and dodge.
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { Area } from '../scene/area';
import { snapToPixel } from '../render/view';
import { clipNamed, flash, ownMaterials } from './assets';
import type { HitResult, Warrior } from './warrior';

export const foeTuning = {
  /** Enemies swing at the Warrior (off = punching bags). */
  attack: true,
  /** Telegraph time before a strike lands (s). */
  windup: 0.8,
  speed: 1.4,
  /** Distance at which an Enemy notices the Warrior. */
  aggro: 8,
  /** Rest between one Enemy's swings (s). */
  cooldown: 1.6,
};

const CLIPS = {
  spawn: 'Spawn_Ground_Skeletons',
  idle: 'Idle_Combat',
  walk: 'Walking_D_Skeletons',
  attack: '1H_Melee_Attack_Chop',
  hurt: 'Hit_A',
  dead: 'Death_C_Skeletons',
} as const;

const RADIUS = 0.45;
const REACH = 1.5;
const STRIKE_ARC = THREE.MathUtils.degToRad(50);
const HP = 3;
const SPAWN_S = 1.6;
const HURT_S = 0.4;
const DEAD_S = 2;
const RESPAWN_S = 4;
/** The chop clip: wind-up is its first part (stretched to the windup time), the rest is the strike. */
const CHOP_WINDUP_END = 0.38;
const CHOP_IMPACT = 0.46;

export type FoeState = 'spawn' | 'idle' | 'chase' | 'windup' | 'strike' | 'recover' | 'hurt' | 'dead' | 'gone';

export class Foe {
  readonly position: THREE.Vector3;
  yaw = 0;
  state: FoeState = 'spawn';
  stateTime = 0;
  serial = 0;
  hp = HP;
  cooldown = 0;
  struck = false;
  private readonly knockback = new THREE.Vector3();

  constructor(readonly home: THREE.Vector3) {
    this.position = home.clone();
  }

  get alive(): boolean {
    return this.state !== 'dead' && this.state !== 'gone' && this.state !== 'spawn';
  }

  /** Unit vector the Enemy faces. */
  forward(out = new THREE.Vector3()): THREE.Vector3 {
    return out.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
  }

  /** The Warrior's swing lands on this Enemy. */
  takeHit(from: THREE.Vector3): void {
    this.hp--;
    this.knockback.subVectors(this.position, from).setY(0).normalize().multiplyScalar(this.hp > 0 ? 5 : 3);
    this.enter(this.hp > 0 ? 'hurt' : 'dead');
  }

  enter(state: FoeState): void {
    this.state = state;
    this.stateTime = 0;
    this.serial++;
  }

  push(dt: number): void {
    this.position.addScaledVector(this.knockback, dt);
    this.knockback.multiplyScalar(Math.exp(-10 * dt));
  }
}

export type Tally = { hits: number; blocked: number; dodged: number; kills: number };

export class Foes {
  readonly list: Foe[];
  readonly tally: Tally = { hits: 0, blocked: 0, dodged: 0, kills: 0 };
  onWarriorHit: (result: HitResult) => void = () => {};

  constructor(
    private readonly area: Area,
    homes: THREE.Vector3[],
  ) {
    this.list = homes.map((h) => new Foe(h));
  }

  update(dt: number, warrior: Warrior): void {
    const busy = this.list.some((f) => f.state === 'windup' || f.state === 'strike');
    const toWarrior = new THREE.Vector3();
    for (const foe of this.list) {
      foe.stateTime += dt;
      foe.cooldown -= dt;
      toWarrior.subVectors(warrior.position, foe.position).setY(0);
      const distance = toWarrior.length();
      const face = () => {
        foe.yaw = turnTowards(foe.yaw, Math.atan2(toWarrior.x, toWarrior.z), 8 * dt);
      };

      switch (foe.state) {
        case 'spawn':
          if (foe.stateTime >= SPAWN_S) foe.enter('idle');
          break;
        case 'idle':
          if (distance < foeTuning.aggro) foe.enter('chase');
          break;
        case 'chase':
          face();
          if (distance > foeTuning.aggro * 1.5) {
            foe.enter('idle');
          } else if (distance > REACH * 0.9) {
            foe.position.addScaledVector(toWarrior.normalize(), foeTuning.speed * dt);
          } else if (foeTuning.attack && !busy && foe.cooldown <= 0) {
            foe.struck = false;
            foe.enter('windup');
          }
          break;
        case 'windup':
          // The direction is locked for the whole telegraph: step out of the wedge to avoid it.
          if (foe.stateTime >= foeTuning.windup) foe.enter('strike');
          break;
        case 'strike':
          if (!foe.struck && foe.stateTime >= CHOP_IMPACT - CHOP_WINDUP_END) {
            foe.struck = true;
            const angle = foe.forward().angleTo(toWarrior.clone().normalize());
            if (distance <= REACH + 0.4 && angle <= STRIKE_ARC) {
              const result = warrior.takeHit(foe.position);
              if (result === 'hit') this.tally.hits++;
              if (result === 'blocked') this.tally.blocked++;
              if (result === 'dodged') this.tally.dodged++;
              this.onWarriorHit(result);
            } else if (warrior.state === 'dodge') {
              this.tally.dodged++;
            }
          }
          if (foe.stateTime >= 1.07 - CHOP_WINDUP_END) {
            foe.cooldown = foeTuning.cooldown;
            foe.enter('recover');
          }
          break;
        case 'recover':
          if (foe.stateTime >= 0.5) foe.enter('chase');
          break;
        case 'hurt':
          foe.push(dt);
          if (foe.stateTime >= HURT_S) foe.enter('chase');
          break;
        case 'dead':
          foe.push(dt);
          if (foe.stateTime >= DEAD_S) foe.enter('gone');
          break;
        case 'gone':
          if (foe.stateTime >= RESPAWN_S) {
            foe.position.copy(foe.home);
            foe.hp = HP;
            foe.enter('spawn');
          }
          break;
      }
    }

    // Keep bodies apart: Enemies from each other and from the Warrior, and out of the walls.
    for (const foe of this.list) {
      if (foe.state === 'gone') continue;
      for (const other of [...this.list, warrior]) {
        if (other === foe || (other instanceof Foe && other.state === 'gone')) continue;
        const dx = foe.position.x - other.position.x;
        const dz = foe.position.z - other.position.z;
        const d = Math.hypot(dx, dz);
        const min = RADIUS * 2;
        if (d < min && d > 1e-6) {
          foe.position.x += (dx / d) * (min - d);
          foe.position.z += (dz / d) * (min - d);
        }
      }
      this.area.collide(foe.position, RADIUS);
    }
  }

  /** Called by the Warrior's swing: hits every living Enemy in the arc. Returns how many. */
  swing(warrior: Warrior, reach: number, arcDeg: number, forward: THREE.Vector3): number {
    let count = 0;
    const cos = Math.cos(THREE.MathUtils.degToRad(arcDeg));
    for (const foe of this.list) {
      if (!foe.alive) continue;
      const to = new THREE.Vector3().subVectors(foe.position, warrior.position).setY(0);
      const d = to.length();
      if (d > reach + RADIUS || (d > 0.3 && to.normalize().dot(forward) < cos)) continue;
      foe.takeHit(warrior.position);
      if (foe.state === 'dead') this.tally.kills++;
      count++;
    }
    return count;
  }

  /** The living Enemy nearest to `from` within `range` and `angleDeg` of `dir` (any direction if dir is null). */
  nearest(from: THREE.Vector3, range: number, dir: THREE.Vector3 | null, angleDeg: number): Foe | null {
    let best: Foe | null = null;
    let bestD = Infinity;
    const cos = Math.cos(THREE.MathUtils.degToRad(angleDeg));
    for (const foe of this.list) {
      if (!foe.alive) continue;
      const to = new THREE.Vector3().subVectors(foe.position, from).setY(0);
      const d = to.length();
      if (d > range || d >= bestD) continue;
      if (dir && d > 0.3 && to.normalize().dot(dir) < cos) continue;
      best = foe;
      bestD = d;
    }
    return best;
  }
}

/** Draws one Foe: its own skinned clone, a hit flash, and the telegraph wedge. */
export class FoeView {
  readonly root = new THREE.Group();
  private readonly model: THREE.Object3D;
  private readonly mixer: THREE.AnimationMixer;
  private readonly actions = new Map<string, THREE.AnimationAction>();
  private readonly materials: THREE.MeshLambertMaterial[];
  private readonly wedge: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private current: THREE.AnimationAction | null = null;
  private serial = -1;
  private flashLeft = 0;

  constructor(
    gltf: GLTF,
    private readonly foe: Foe,
  ) {
    this.model = cloneSkinned(gltf.scene);
    this.materials = ownMaterials(this.model);
    this.mixer = new THREE.AnimationMixer(this.model);
    for (const name of Object.values(CLIPS)) {
      const action = this.mixer.clipAction(clipNamed(gltf, name));
      if (name !== CLIPS.idle && name !== CLIPS.walk) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      }
      this.actions.set(name, action);
    }
    // The strike zone: a wedge of the reach and arc the strike checks, drawn on the floor.
    this.wedge = new THREE.Mesh(
      // Centred on -90°, which the -90° tilt onto the floor turns into +Z, the model's forward.
      new THREE.RingGeometry(0.3, REACH + 0.4, 16, 1, -Math.PI / 2 - STRIKE_ARC, STRIKE_ARC * 2).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xff3030, transparent: true, depthWrite: false }),
    );
    this.root.add(this.model, this.wedge);
  }

  sync(dt: number): void {
    const foe = this.foe;
    this.root.visible = foe.state !== 'gone';
    if (foe.serial !== this.serial) {
      if (foe.state === 'hurt' || foe.state === 'dead') this.flashLeft = 0.12;
      this.serial = foe.serial;
      const name = clipFor(foe.state);
      const next = this.actions.get(name)!;
      if (next !== this.current || foe.state === 'hurt' || foe.state === 'spawn' || foe.state === 'windup') {
        next.reset().play();
        next.setEffectiveTimeScale(foe.state === 'spawn' ? next.getClip().duration / SPAWN_S : 1);
        if (this.current && this.current !== next) next.crossFadeFrom(this.current, 0.12, false);
        this.current = next;
      }
    }
    // The chop is driven by hand: wind-up stretched over the telegraph, then the strike at speed.
    if (foe.state === 'windup' || foe.state === 'strike') {
      const chop = this.actions.get(CLIPS.attack)!;
      chop.setEffectiveTimeScale(0);
      chop.time =
        foe.state === 'windup'
          ? CHOP_WINDUP_END * Math.min(1, foe.stateTime / foeTuning.windup)
          : CHOP_WINDUP_END + foe.stateTime;
    }
    this.mixer.update(dt);

    this.flashLeft -= dt;
    flash(this.materials, 0xffffff, this.flashLeft > 0 ? 0.9 : 0);

    // Telegraph: fades in and fills over the wind-up, flares on the strike.
    const w = this.wedge.material;
    if (foe.state === 'windup') {
      const t = Math.min(1, foe.stateTime / foeTuning.windup);
      this.wedge.visible = true;
      w.opacity = 0.2 + 0.45 * t;
      this.wedge.scale.setScalar(0.5 + 0.5 * t);
    } else if (foe.state === 'strike' && foe.stateTime < 0.15) {
      this.wedge.visible = true;
      w.opacity = 0.9;
      this.wedge.scale.setScalar(1);
    } else {
      this.wedge.visible = false;
    }

    this.model.rotation.y = foe.yaw;
    this.wedge.rotation.y = foe.yaw;
    this.wedge.position.y = 0.03;
    snapToPixel(this.root.position.copy(foe.position));
  }
}

function clipFor(state: FoeState): string {
  switch (state) {
    case 'spawn':
      return CLIPS.spawn;
    case 'chase':
      return CLIPS.walk;
    case 'windup':
    case 'strike':
      return CLIPS.attack;
    case 'hurt':
      return CLIPS.hurt;
    case 'dead':
    case 'gone':
      return CLIPS.dead;
    default:
      return CLIPS.idle;
  }
}

function turnTowards(from: number, to: number, maxStep: number): number {
  const diff = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
}
