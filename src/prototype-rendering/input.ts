// PROTOTYPE (throwaway): 2D sprites vs pixelated 3D. See .scratch/isometric-poc/issues/04-rendering-approach.md
// Stand-in controls only: the real scheme is its own ticket (touch controls).
import * as THREE from 'three';
import type { Warrior } from './warrior';
import { facingOf, GROUND_RIGHT, GROUND_UP } from './view';

const DEAD_ZONE_PX = 12;
const STICK_RADIUS_PX = 50;

/** Facing (0-7) for each of the 8 screen directions, counter-clockwise from screen right. */
const SCREEN_TO_FACING = Array.from({ length: 8 }, (_, sector) => {
  const a = sector * (Math.PI / 4);
  const world = GROUND_RIGHT.clone().multiplyScalar(Math.cos(a)).addScaledVector(GROUND_UP, Math.sin(a));
  return facingOf(world.x, world.z);
});

function facingFromScreen(dx: number, dyUp: number): number {
  const sector = ((Math.round(Math.atan2(dyUp, dx) / (Math.PI / 4)) % 8) + 8) % 8;
  return SCREEN_TO_FACING[sector];
}

/**
 * A floating stick wherever a finger lands on the game, an attack button, and WASD/arrows +
 * Space on desktop. `onManual` fires on the first input of each kind, to stop the autopilot.
 */
export function createInput(canvas: HTMLCanvasElement, attackButton: HTMLElement, onManual: () => void) {
  const base = document.createElement('div');
  base.className = 'proto-stick';
  const knob = document.createElement('div');
  knob.className = 'proto-stick-knob';
  base.append(knob);
  document.body.append(base);

  let stickId: number | null = null;
  const origin = { x: 0, y: 0 };
  const offset = { x: 0, y: 0 };
  let attackQueued = false;
  const keys = new Set<string>();

  canvas.addEventListener('pointerdown', (event) => {
    if (stickId !== null) return;
    stickId = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    origin.x = event.clientX;
    origin.y = event.clientY;
    offset.x = offset.y = 0;
    base.style.display = 'block';
    base.style.left = `${origin.x}px`;
    base.style.top = `${origin.y}px`;
    knob.style.transform = '';
    onManual();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerId !== stickId) return;
    offset.x = event.clientX - origin.x;
    offset.y = event.clientY - origin.y;
    const length = Math.hypot(offset.x, offset.y);
    const k = length > STICK_RADIUS_PX ? STICK_RADIUS_PX / length : 1;
    knob.style.transform = `translate(${offset.x * k}px, ${offset.y * k}px)`;
  });
  const release = (event: PointerEvent) => {
    if (event.pointerId !== stickId) return;
    stickId = null;
    base.style.display = 'none';
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  attackButton.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    attackQueued = true;
    onManual();
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Space' || event.code === 'KeyJ') attackQueued = true;
    keys.add(event.code);
    onManual();
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));

  const held = (...codes: string[]) => (codes.some((c) => keys.has(c)) ? 1 : 0);

  return {
    /** Where the stick or keys point (0-7), or null. */
    facing(): number | null {
      if (stickId !== null && Math.hypot(offset.x, offset.y) >= DEAD_ZONE_PX) {
        return facingFromScreen(offset.x, -offset.y);
      }
      const x = held('KeyD', 'ArrowRight') - held('KeyA', 'ArrowLeft');
      const y = held('KeyW', 'ArrowUp') - held('KeyS', 'ArrowDown');
      return x || y ? facingFromScreen(x, y) : null;
    },
    /** True once per attack press. */
    takeAttack(): boolean {
      const queued = attackQueued;
      attackQueued = false;
      return queued;
    },
  };
}

type Waypoint = { x: number; z: number; attack?: boolean };

/**
 * A fixed loop through the Area, on 8-direction lines only: past the pillar, up to the barrels,
 * behind the low wall and back in front of it, swinging at three stops. Lets the variants be
 * compared (and their frame rate measured) hands-free, on the same path.
 */
const ROUTE: Waypoint[] = [
  { x: 3.6, z: 6 },
  { x: 3.6, z: -5, attack: true },
  { x: 3.6, z: -7 },
  { x: -3, z: -7, attack: true },
  { x: -3, z: 0 },
  { x: -8, z: 0 },
  { x: -8, z: 4 },
  { x: 0, z: 4, attack: true },
  { x: 2, z: 6 },
];
const ARRIVE = 0.15;
const PAUSE_S = 0.6;

export class Autopilot {
  private next = 1;
  private pause = 0;

  /** Puts the Warrior back at the start of the loop. */
  restart(warrior: Warrior): void {
    warrior.position.set(ROUTE[0].x, 0, ROUTE[0].z);
    this.next = 1;
    this.pause = 0;
  }

  steer(warrior: Warrior, dt: number): { facing: number | null; attack: boolean } {
    if (warrior.state === 'attack') return { facing: null, attack: false };
    if (this.pause > 0) {
      this.pause -= dt;
      return { facing: null, attack: false };
    }
    const target = ROUTE[this.next];
    const to = new THREE.Vector2(target.x - warrior.position.x, target.z - warrior.position.z);
    if (to.length() > ARRIVE) return { facing: facingOf(to.x, to.y), attack: false };

    warrior.position.x = target.x;
    warrior.position.z = target.z;
    this.next = (this.next + 1) % ROUTE.length;
    this.pause = target.attack ? PAUSE_S : 0;
    return { facing: null, attack: target.attack === true };
  }
}
