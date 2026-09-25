// PROTOTYPE (throwaway): 2D sprites vs pixelated 3D. See .scratch/isometric-poc/issues/04-rendering-approach.md
import * as THREE from 'three';
import type { Area } from './area';
import { facingVector } from './view';

export type Gait = 'walk' | 'run';
export type WarriorState = 'idle' | 'move' | 'attack';

/** Clip names in knight.glb, per state. */
export const CLIPS = {
  idle: 'Idle',
  walk: 'Walking_A',
  run: 'Running_A',
  attack: '1H_Melee_Attack_Chop',
} as const;

export const movement = {
  gait: 'run' as Gait,
  walkSpeed: 2.2,
  runSpeed: 4.2,
  /** Playback rate of every clip. */
  animSpeed: 1,
};

const RADIUS = 0.45;

/**
 * The Warrior's simulation, shared by every variant: 8-direction movement, and an attack that
 * roots the Warrior in place until the swing ends. The variants only differ in how they draw it.
 */
export class Warrior {
  readonly position = new THREE.Vector3(3.6, 0, 6);
  facing = 4;
  state: WarriorState = 'idle';
  /** Seconds since the current state began. */
  stateTime = 0;
  /** Bumped on every state change, so views can restart a clip that repeats (attack, attack). */
  serial = 0;

  constructor(
    private readonly area: Area,
    private readonly attackDuration: number,
  ) {}

  /** The clip for the current state. */
  get clip(): string {
    if (this.state === 'attack') return CLIPS.attack;
    if (this.state === 'move') return movement.gait === 'run' ? CLIPS.run : CLIPS.walk;
    return CLIPS.idle;
  }

  /** @param facing where the stick points (0-7), or null when it's released. */
  update(dt: number, facing: number | null, attack: boolean): void {
    this.stateTime += dt;

    if (this.state === 'attack') {
      if (this.stateTime * movement.animSpeed < this.attackDuration) return;
      this.enter('idle');
    }

    if (attack) {
      if (facing !== null) this.facing = facing;
      this.enter('attack');
      return;
    }

    if (facing === null) {
      if (this.state !== 'idle') this.enter('idle');
      return;
    }

    if (this.state !== 'move') this.enter('move');
    this.facing = facing;
    const speed = movement.gait === 'run' ? movement.runSpeed : movement.walkSpeed;
    this.position.addScaledVector(facingVector(facing), speed * dt);
    this.area.collide(this.position, RADIUS);
  }

  private enter(state: WarriorState): void {
    this.state = state;
    this.stateTime = 0;
    this.serial++;
  }
}
