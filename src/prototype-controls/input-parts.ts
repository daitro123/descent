// PROTOTYPE (throwaway): touch control schemes. See .scratch/isometric-poc/issues/05-touch-controls.md
//
// Building blocks the schemes are assembled from: a floating stick, a tap / hold / flick
// recogniser, keyboard for desktop, and screen-to-world helpers.
import * as THREE from 'three';
import type { Foe, Foes } from './foes';
import type { Intent, Warrior } from './warrior';
import { facingOf, facingVector, GROUND_RIGHT, GROUND_UP } from '../render/view';

export const touchTuning = {
  /** Stick: knob travel and the dead zone, in CSS px. */
  stickRadius: 50,
  deadZone: 12,
  /** A touch held still this long (s) becomes a hold (block). */
  holdDelay: 0.22,
  /** A touch that travels this far (CSS px) before the hold delay is a flick (dodge). */
  flickDistance: 30,
  /** How far (CSS px) from an Enemy's body a tap still picks it. */
  pickRadius: 45,
};

export type Scheme = {
  intent(dt: number): Intent;
  /** An Enemy the player has picked (shown with a marker), if the scheme has targets. */
  target(): Foe | null;
  /** Where tap-to-move is walking to, if anywhere. */
  destination(): THREE.Vector3 | null;
  /** Facing the player is steering, if any (for the aim-assist marker). */
  steering(): number | null;
};

export type SchemeContext = {
  canvas: HTMLCanvasElement;
  warrior: Warrior;
  foes: Foes;
  /** Floor point under a screen point (CSS px), or null. */
  groundAt(x: number, y: number): THREE.Vector3 | null;
  /** The living Enemy drawn nearest a screen point, within `touchTuning.pickRadius`. */
  foeAt(x: number, y: number): Foe | null;
  /** Screen position (CSS px) of a world point. */
  toScreen(p: THREE.Vector3): { x: number; y: number };
};

/** Facing (0-7) for each of the 8 screen directions, counter-clockwise from screen right. */
const SCREEN_TO_FACING = Array.from({ length: 8 }, (_, sector) => {
  const a = sector * (Math.PI / 4);
  const world = GROUND_RIGHT.clone().multiplyScalar(Math.cos(a)).addScaledVector(GROUND_UP, Math.sin(a));
  return facingOf(world.x, world.z);
});

/** Nearest of the 8 facings to a screen direction (dy positive = up the screen). */
export function facingFromScreen(dx: number, dyUp: number): number {
  const sector = ((Math.round(Math.atan2(dyUp, dx) / (Math.PI / 4)) % 8) + 8) % 8;
  return SCREEN_TO_FACING[sector];
}

/**
 * Steers along the 8 directions towards a point without dithering: keeps the current facing
 * until it's more than 30° off, so a diagonal target is reached in one or two straight legs.
 */
export class Steering {
  private last: number | null = null;

  towards(from: THREE.Vector3, to: THREE.Vector3): number {
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    if (this.last !== null) {
      const v = facingVector(this.last);
      const cos = (v.x * dx + v.z * dz) / Math.hypot(dx, dz);
      if (cos > Math.cos(THREE.MathUtils.degToRad(30))) return this.last;
    }
    this.last = facingOf(dx, dz);
    return this.last;
  }

  reset(): void {
    this.last = null;
  }
}

/** A stick that appears wherever a finger lands inside `region`. */
export class FloatingStick {
  private id: number | null = null;
  private readonly origin = { x: 0, y: 0 };
  private readonly offset = { x: 0, y: 0 };
  private readonly base = document.createElement('div');
  private readonly knob = document.createElement('div');

  constructor(canvas: HTMLCanvasElement, region: (x: number, y: number) => boolean) {
    this.base.className = 'proto-stick';
    this.knob.className = 'proto-stick-knob';
    this.base.append(this.knob);
    document.body.append(this.base);

    canvas.addEventListener('pointerdown', (event) => {
      if (this.id !== null || !region(event.clientX, event.clientY)) return;
      this.id = event.pointerId;
      canvas.setPointerCapture(event.pointerId);
      this.origin.x = event.clientX;
      this.origin.y = event.clientY;
      this.offset.x = this.offset.y = 0;
      this.base.style.display = 'block';
      this.base.style.left = `${this.origin.x}px`;
      this.base.style.top = `${this.origin.y}px`;
      this.knob.style.transform = '';
    });
    canvas.addEventListener('pointermove', (event) => {
      if (event.pointerId !== this.id) return;
      this.offset.x = event.clientX - this.origin.x;
      this.offset.y = event.clientY - this.origin.y;
      const length = Math.hypot(this.offset.x, this.offset.y);
      const k = length > touchTuning.stickRadius ? touchTuning.stickRadius / length : 1;
      this.knob.style.transform = `translate(${this.offset.x * k}px, ${this.offset.y * k}px)`;
    });
    const release = (event: PointerEvent) => {
      if (event.pointerId !== this.id) return;
      this.id = null;
      this.base.style.display = 'none';
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
  }

  facing(): number | null {
    if (this.id === null || Math.hypot(this.offset.x, this.offset.y) < touchTuning.deadZone) return null;
    return facingFromScreen(this.offset.x, -this.offset.y);
  }
}

export type GestureHandlers = {
  tap(x: number, y: number): void;
  flick(dx: number, dyUp: number): void;
  holdStart(x: number, y: number): void;
  holdMove(x: number, y: number): void;
  holdEnd(): void;
};

/**
 * One finger at a time inside `region`: a quick touch is a tap (on release), a touch that
 * travels `flickDistance` before `holdDelay` is a flick (at once), a touch kept still past
 * `holdDelay` is a hold until release. Call `tick` every frame so holds start on time.
 */
export class Gestures {
  private id: number | null = null;
  private phase: 'pending' | 'hold' | 'done' = 'done';
  private start = { x: 0, y: 0, t: 0 };
  private last = { x: 0, y: 0 };

  constructor(
    canvas: HTMLCanvasElement,
    region: (x: number, y: number) => boolean,
    private readonly on: GestureHandlers,
  ) {
    canvas.addEventListener('pointerdown', (event) => {
      if (this.id !== null || !region(event.clientX, event.clientY)) return;
      this.id = event.pointerId;
      canvas.setPointerCapture(event.pointerId);
      this.phase = 'pending';
      this.start = { x: event.clientX, y: event.clientY, t: performance.now() };
      this.last = { x: event.clientX, y: event.clientY };
    });
    canvas.addEventListener('pointermove', (event) => {
      if (event.pointerId !== this.id) return;
      this.last = { x: event.clientX, y: event.clientY };
      const dx = event.clientX - this.start.x;
      const dy = event.clientY - this.start.y;
      if (this.phase === 'pending' && Math.hypot(dx, dy) >= touchTuning.flickDistance) {
        this.phase = 'done';
        this.on.flick(dx, -dy);
      } else if (this.phase === 'hold') {
        this.on.holdMove(event.clientX, event.clientY);
      }
    });
    const release = (event: PointerEvent) => {
      if (event.pointerId !== this.id) return;
      this.id = null;
      if (this.phase === 'pending' && event.type === 'pointerup') this.on.tap(this.start.x, this.start.y);
      if (this.phase === 'hold') this.on.holdEnd();
      this.phase = 'done';
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
  }

  tick(): void {
    if (this.phase === 'pending' && performance.now() - this.start.t >= touchTuning.holdDelay * 1000) {
      this.phase = 'hold';
      this.on.holdStart(this.last.x, this.last.y);
    }
  }
}

/** Desktop convenience: WASD / arrows move, J or Space attacks, K blocks (held), L or Shift dodges. */
export class Keyboard {
  private readonly keys = new Set<string>();
  private attackQueued = false;
  private dodgeQueued = false;

  constructor() {
    window.addEventListener('keydown', (event) => {
      if (event.repeat || event.shiftKey && event.key.startsWith('Arrow')) return;
      if (event.code === 'Space' || event.code === 'KeyJ') this.attackQueued = true;
      if (event.code === 'KeyL' || event.code === 'ShiftLeft') this.dodgeQueued = true;
      this.keys.add(event.code);
    });
    window.addEventListener('keyup', (event) => this.keys.delete(event.code));
  }

  private held(...codes: string[]): number {
    return codes.some((c) => this.keys.has(c)) ? 1 : 0;
  }

  facing(): number | null {
    const x = this.held('KeyD', 'ArrowRight') - this.held('KeyA', 'ArrowLeft');
    const y = this.held('KeyW', 'ArrowUp') - this.held('KeyS', 'ArrowDown');
    return x || y ? facingFromScreen(x, y) : null;
  }

  blocking(): boolean {
    return this.keys.has('KeyK');
  }

  takeAttack(): boolean {
    const q = this.attackQueued;
    this.attackQueued = false;
    return q;
  }

  takeDodge(): boolean {
    const q = this.dodgeQueued;
    this.dodgeQueued = false;
    return q;
  }
}

/** A round on-screen button; `down` and `up` fire on touch start and end. */
export function touchButton(className: string, text: string, label: string, down: () => void, up = () => {}) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `proto-button ${className}`;
  b.textContent = text;
  b.setAttribute('aria-label', label);
  b.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    b.setPointerCapture(event.pointerId);
    b.classList.add('down');
    down();
  });
  const end = () => {
    if (!b.classList.contains('down')) return;
    b.classList.remove('down');
    up();
  };
  b.addEventListener('pointerup', end);
  b.addEventListener('pointercancel', end);
  document.body.append(b);
  return b;
}

/** Facing from the Warrior's feet to a world point. */
export function facingTo(warrior: Warrior, p: THREE.Vector3): number {
  return facingOf(p.x - warrior.position.x, p.z - warrior.position.z);
}
