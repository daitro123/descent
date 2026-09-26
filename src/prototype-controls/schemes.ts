// PROTOTYPE (throwaway): touch control schemes. See .scratch/isometric-poc/issues/05-touch-controls.md
//
//   stick     A: floating stick on the left, ⚔ / 🛡 / dodge buttons on the right
//   tap       B: one finger: tap the floor to walk, tap an Enemy to attack it,
//                hold to block towards the finger, flick to dodge
//   gestures  C: floating stick on the left, no buttons: the right half is a gesture pad
//                (tap = attack, tap on an Enemy = attack it, hold = block, flick = dodge)
import * as THREE from 'three';
import { combat, type Intent } from './warrior';
import type { Foe } from './foes';
import {
  facingFromScreen,
  facingTo,
  FloatingStick,
  Gestures,
  Keyboard,
  Steering,
  touchButton,
  type Scheme,
  type SchemeContext,
} from './input-parts';

export const tapTuning = {
  /** Tap-to-attack keeps swinging at the picked Enemy until it dies (off = one tap, one swing). */
  repeat: false,
};

/** Share of the screen width, from the left, that belongs to the stick. */
const STICK_SHARE = 0.45;

const leftSide = (x: number) => x < window.innerWidth * STICK_SHARE;

/** Dodge direction when there's no stick direction: straight back from the facing. */
const backwards = (facing: number) => (facing + 4) % 8;

export function stickAndButtons({ canvas, warrior }: SchemeContext): Scheme {
  const stick = new FloatingStick(canvas, leftSide);
  const keys = new Keyboard();
  let attack = false;
  let dodge = false;
  let block = false;
  touchButton('proto-attack', '⚔', 'Attack', () => (attack = true));
  touchButton('proto-block', '🛡', 'Block (hold)', () => (block = true), () => (block = false));
  touchButton('proto-dodge', '»', 'Dodge', () => (dodge = true));

  const steering = () => stick.facing() ?? keys.facing();
  return {
    intent(): Intent {
      const move = steering();
      const intent: Intent = {
        move,
        attack: attack || keys.takeAttack(),
        aim: null,
        block: block || keys.blocking(),
        dodge: dodge || keys.takeDodge() ? (move ?? backwards(warrior.facing)) : null,
      };
      attack = dodge = false;
      return intent;
    },
    target: () => null,
    destination: () => null,
    steering,
  };
}

export function tapToMove({ canvas, warrior, groundAt, foeAt, toScreen }: SchemeContext): Scheme {
  let destination: THREE.Vector3 | null = null;
  let target: Foe | null = null;
  let swingQueued = false;
  let dodge: number | null = null;
  let blockAt: { x: number; y: number } | null = null;
  const steering = new Steering();

  const faceFinger = (x: number, y: number) => {
    const feet = toScreen(warrior.position.clone().setY(0.8));
    return facingFromScreen(x - feet.x, feet.y - y);
  };

  const gestures = new Gestures(canvas, () => true, {
    tap(x, y) {
      const foe = foeAt(x, y);
      steering.reset();
      if (foe) {
        target = foe;
        destination = null;
        swingQueued = true;
      } else {
        destination = groundAt(x, y);
        target = null;
      }
    },
    flick(dx, dyUp) {
      dodge = facingFromScreen(dx, dyUp);
      destination = null;
    },
    holdStart(x, y) {
      destination = null;
      blockAt = { x, y };
    },
    holdMove(x, y) {
      blockAt = { x, y };
    },
    holdEnd() {
      blockAt = null;
    },
  });

  return {
    intent(): Intent {
      gestures.tick();
      const intent: Intent = { move: null, attack: false, aim: null, block: false, dodge };
      dodge = null;
      if (target && !target.alive) target = null;

      if (blockAt) {
        intent.block = true;
        intent.aim = faceFinger(blockAt.x, blockAt.y);
      } else if (target) {
        const distance = Math.hypot(target.position.x - warrior.position.x, target.position.z - warrior.position.z);
        const free = warrior.state === 'idle' || warrior.state === 'move' || warrior.state === 'block';
        if (distance > combat.reach * 0.85) {
          if (free) intent.move = steering.towards(warrior.position, target.position);
        } else if ((swingQueued || tapTuning.repeat) && free) {
          intent.attack = true;
          intent.aim = facingTo(warrior, target.position);
          swingQueued = false;
        }
      } else if (destination) {
        if (Math.hypot(destination.x - warrior.position.x, destination.z - warrior.position.z) < 0.3) {
          destination = null;
        } else {
          intent.move = steering.towards(warrior.position, destination);
        }
      }
      return intent;
    },
    target: () => target,
    destination: () => destination,
    steering: () => null,
  };
}

export function stickAndGestures({ canvas, warrior, foeAt }: SchemeContext): Scheme {
  const stick = new FloatingStick(canvas, leftSide);
  const keys = new Keyboard();
  let attack = false;
  let aim: number | null = null;
  let dodge: number | null = null;
  let block = false;
  let picked: Foe | null = null;

  const gestures = new Gestures(canvas, (x) => !leftSide(x), {
    tap(x, y) {
      attack = true;
      picked = foeAt(x, y);
      aim = picked ? facingTo(warrior, picked.position) : null;
    },
    flick(dx, dyUp) {
      dodge = facingFromScreen(dx, dyUp);
    },
    holdStart() {
      block = true;
    },
    holdMove() {},
    holdEnd() {
      block = false;
    },
  });

  const steering = () => stick.facing() ?? keys.facing();
  return {
    intent(): Intent {
      gestures.tick();
      const move = steering();
      const intent: Intent = {
        move,
        attack: attack || keys.takeAttack(),
        aim,
        block: block || keys.blocking(),
        dodge: dodge ?? (keys.takeDodge() ? (move ?? backwards(warrior.facing)) : null),
      };
      attack = false;
      aim = dodge = null;
      if (picked && !picked.alive) picked = null;
      return intent;
    },
    target: () => picked,
    destination: () => null,
    steering,
  };
}
