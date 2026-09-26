// PROTOTYPE (throwaway): touch control schemes. See .scratch/isometric-poc/issues/05-touch-controls.md
//
// A Warrior with just enough moveset to judge the controls: 8-direction movement, a rooted swing,
// a held block and a dodge. Every control scheme boils down to the same per-frame Intent.
import * as THREE from 'three';
import type { Area } from '../scene/area';
import { movement } from '../scene/warrior';
import { facingVector } from '../render/view';

/** What the player asks for this frame. */
export type Intent = {
  /** Walk this way (facing 0-7), or stand. */
  move: number | null;
  /** Swing (once per press; buffered briefly if the Warrior is busy). */
  attack: boolean;
  /** Facing to swing towards; null = where the Warrior faces (or walks). Aim assist may override. */
  aim: number | null;
  /** Block while true. */
  block: boolean;
  /** Dodge this way (facing 0-7), once. */
  dodge: number | null;
};

export const NO_INTENT: Intent = { move: null, attack: false, aim: null, block: false, dodge: null };

export const CLIPS = {
  idle: 'Idle',
  walk: 'Walking_A',
  run: 'Running_A',
  attack: '1H_Melee_Attack_Chop',
  block: 'Blocking',
  blockHit: 'Block_Hit',
  hurt: 'Hit_A',
  dodge: ['Dodge_Forward', 'Dodge_Left', 'Dodge_Backward', 'Dodge_Right'],
} as const;

/** Tunable combat values shared by every scheme. */
export const combat = {
  /** Turn a swing towards the nearest Enemy in front. */
  aimAssist: true,
  /** How far (world units) and how wide (degrees either side of the aim) aim assist looks. */
  assistRange: 3,
  assistAngle: 70,
  /** Reach of the swing, and how wide it hits (degrees either side). */
  reach: 1.8,
  arc: 60,
  /** When in the swing the hit lands, as a fraction of the swing. */
  hitAt: 0.4,
  /** An attack press this early (seconds) before the Warrior is free still counts. */
  buffer: 0.3,
  dodgeDistance: 2.8,
  dodgeTime: 0.45,
  /** Blocks hits from this many degrees either side of the facing. */
  blockAngle: 75,
};

export type WarriorState = 'idle' | 'move' | 'attack' | 'block' | 'dodge' | 'hurt';
export type HitResult = 'hit' | 'blocked' | 'dodged';

const RADIUS = 0.45;
const HURT_S = 0.45;
const BLOCK_HIT_S = 0.4;

export class Warrior {
  readonly position = new THREE.Vector3(3.6, 0, 6);
  facing = 4;
  state: WarriorState = 'idle';
  stateTime = 0;
  /** Bumped on every state (re)entry, so views restart one-shot clips. */
  serial = 0;
  /** Dodge direction relative to the facing: 0 forward, 1 left, 2 back, 3 right. */
  dodgeSide = 0;
  /** Set for a moment after a blocked hit. */
  blockHitTime = -1;
  /** Called when a swing lands; the world decides what it hits. */
  onSwing: (warrior: Warrior) => void = () => {};
  /** Aim assist: may turn a swing's facing towards a target. */
  assist: (facing: number) => number = (f) => f;

  private landed = false;
  private buffered = 0;
  private bufferedAim: number | null = null;
  private readonly dodgeDir = new THREE.Vector3();
  private readonly knockback = new THREE.Vector3();

  constructor(
    private readonly area: Area,
    private readonly swingClipS: number,
  ) {}

  get swingS(): number {
    return this.swingClipS / movement.animSpeed;
  }

  get clip(): string {
    switch (this.state) {
      case 'attack':
        return CLIPS.attack;
      case 'block':
        return this.blockHitTime >= 0 ? CLIPS.blockHit : CLIPS.block;
      case 'dodge':
        return CLIPS.dodge[this.dodgeSide];
      case 'hurt':
        return CLIPS.hurt;
      case 'move':
        return movement.gait === 'run' ? CLIPS.run : CLIPS.walk;
      default:
        return CLIPS.idle;
    }
  }

  update(dt: number, intent: Intent): void {
    this.stateTime += dt;
    if (intent.attack) {
      this.buffered = combat.buffer;
      this.bufferedAim = intent.aim;
    } else {
      this.buffered -= dt;
    }
    if (this.blockHitTime >= 0) {
      this.blockHitTime += dt;
      if (this.blockHitTime > BLOCK_HIT_S) {
        this.blockHitTime = -1;
        this.serial++;
      }
    }

    switch (this.state) {
      case 'attack':
        if (!this.landed && this.stateTime >= combat.hitAt * this.swingS) {
          this.landed = true;
          this.onSwing(this);
        }
        if (this.stateTime < this.swingS) return;
        this.enter('idle');
        break;
      case 'dodge': {
        const t0 = Math.min(1, (this.stateTime - dt) / combat.dodgeTime);
        const t1 = Math.min(1, this.stateTime / combat.dodgeTime);
        this.position.addScaledVector(this.dodgeDir, combat.dodgeDistance * (easeOut(t1) - easeOut(t0)));
        this.area.collide(this.position, RADIUS);
        if (t1 < 1) return;
        this.enter('idle');
        break;
      }
      case 'hurt':
        this.position.addScaledVector(this.knockback, dt);
        this.knockback.multiplyScalar(Math.exp(-10 * dt));
        this.area.collide(this.position, RADIUS);
        if (this.stateTime < HURT_S) return;
        this.enter('idle');
        break;
    }

    // Free to act: idle, moving or blocking.
    if (intent.dodge !== null) {
      this.dodgeSide = [0, 0, 1, 2, 2, 2, 3, 0][(intent.dodge - this.facing + 8) % 8];
      facingVector(intent.dodge, this.dodgeDir);
      this.enter('dodge');
      return;
    }
    if (this.buffered > 0) {
      const aim = this.bufferedAim ?? intent.move ?? this.facing;
      this.facing = combat.aimAssist ? this.assist(aim) : aim;
      this.buffered = 0;
      this.landed = false;
      this.enter('attack');
      return;
    }
    if (intent.block) {
      if (this.state !== 'block') this.enter('block');
      if (intent.move !== null) this.facing = intent.move;
      if (intent.aim !== null) this.facing = intent.aim;
      return;
    }
    if (intent.move === null) {
      if (this.state !== 'idle') this.enter('idle');
      return;
    }
    if (this.state !== 'move') this.enter('move');
    this.facing = intent.move;
    const speed = movement.gait === 'run' ? movement.runSpeed : movement.walkSpeed;
    this.position.addScaledVector(facingVector(intent.move), speed * dt);
    this.area.collide(this.position, RADIUS);
  }

  /** An Enemy's strike reaches the Warrior from `from`. */
  takeHit(from: THREE.Vector3): HitResult {
    if (this.state === 'dodge' && this.stateTime < combat.dodgeTime * 0.85) return 'dodged';
    const toFoe = new THREE.Vector3().subVectors(from, this.position).setY(0).normalize();
    const away = toFoe.clone().negate();
    if (this.state === 'block') {
      const cos = facingVector(this.facing).dot(toFoe);
      if (cos >= Math.cos(THREE.MathUtils.degToRad(combat.blockAngle))) {
        this.blockHitTime = 0;
        this.serial++;
        this.position.addScaledVector(away, 0.2);
        this.area.collide(this.position, RADIUS);
        return 'blocked';
      }
    }
    this.knockback.copy(away).multiplyScalar(4);
    this.enter('hurt');
    return 'hit';
  }

  private enter(state: WarriorState): void {
    this.state = state;
    this.stateTime = 0;
    this.serial++;
    if (state !== 'block') this.blockHitTime = -1;
  }
}

function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}
