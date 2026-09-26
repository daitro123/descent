// PROTOTYPE (throwaway): touch control schemes. See .scratch/isometric-poc/issues/05-touch-controls.md
//
// Three control schemes for the same scene, switched with `?variant=` (see schemes.ts). Shared:
// the PoC's pixelated 3D rendering, stand-in Area and camera, a Warrior that can swing, block and
// dodge, three Skeleton Minions that telegraph their swings, aim assist, and the Tuning panel.
import './prototype.css';
import * as THREE from 'three';
import type { createStats } from '../stats';
import { trackDisplaySize } from '../display';
import { PixelPipeline, pixelLook } from '../render/pixel-pipeline';
import {
  createLights,
  createViewCamera,
  facingOf,
  facingVector,
  placeCamera,
  setPixelFrustum,
  snapToPixel,
} from '../render/view';
import { buildArea } from '../scene/area';
import { movement } from '../scene/warrior';
import { isTuningEnabled, openTuningPanel, restoreTuning } from '../tuning';
import { clipNamed, loadCharacter } from './assets';
import { Foes, FoeView, foeTuning } from './foes';
import { touchTuning, type SchemeContext } from './input-parts';
import { stickAndButtons, stickAndGestures, tapToMove, tapTuning } from './schemes';
import { createSwitcher, currentVariant } from './switcher';
import { CLIPS, combat, Warrior } from './warrior';
import { WarriorView } from './warrior-view';

const VARIANTS = [
  {
    key: 'stick',
    label: 'A · Stick + buttons',
    help: 'left: stick · ⚔ attack · 🛡 hold to block · » dodge',
    create: stickAndButtons,
  },
  {
    key: 'tap',
    label: 'B · Tap to move',
    help: 'tap floor: walk · tap skeleton: attack · hold: block · flick: dodge',
    create: tapToMove,
  },
  {
    key: 'gestures',
    label: 'C · Stick + gesture pad',
    help: 'left: stick · right: tap attack · hold block · flick dodge',
    create: stickAndGestures,
  },
] as const;

const MAX_STEP_S = 0.1;
const cameraLook = { follow: 8 };
const FOE_HOMES = [new THREE.Vector3(-2, 0, -5), new THREE.Vector3(7, 0, -1), new THREE.Vector3(-5, 0, 6)];

type Stats = ReturnType<typeof createStats>;

export async function startControlsPrototype(
  canvas: HTMLCanvasElement,
  renderer: THREE.WebGLRenderer,
  stats: Stats,
): Promise<void> {
  const variant = currentVariant(VARIANTS);
  const loading = document.createElement('div');
  loading.className = 'proto-loading';
  loading.textContent = 'Loading…';
  document.body.append(loading);

  const [area, knight, skeleton] = await Promise.all([
    buildArea(),
    loadCharacter('knight'),
    loadCharacter('skeleton-minion'),
  ]);
  loading.remove();

  const warrior = new Warrior(area, clipNamed(knight, CLIPS.attack).duration);
  const warriorView = new WarriorView(knight);
  const foes = new Foes(area, FOE_HOMES);
  const foeViews = foes.list.map((f) => new FoeView(skeleton, f));
  warrior.onSwing = (w) => foes.swing(w, combat.reach, combat.arc, facingVector(w.facing));
  warrior.assist = (facing) => {
    const foe = foes.nearest(warrior.position, combat.assistRange, facingVector(facing), combat.assistAngle);
    return foe ? facingOf(foe.position.x - warrior.position.x, foe.position.z - warrior.position.z) : facing;
  };
  foes.onWarriorHit = (result) => {
    if (result === 'hit') warriorView.hurt();
  };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14121a);
  scene.add(...createLights(), area.root, warriorView.root, ...foeViews.map((v) => v.root));

  const shadowGeometry = new THREE.CircleGeometry(0.5, 16).rotateX(-Math.PI / 2);
  const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });
  const shadows = [warrior, ...foes.list].map(() => new THREE.Mesh(shadowGeometry, shadowMaterial));
  scene.add(...shadows);

  // Markers on the floor: the Enemy a swing would go to (thin) or the picked one (bold), and the
  // tap-to-move destination.
  const ring = (inner: number, outer: number, color: number) => {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(inner, outer, 24).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false }),
    );
    mesh.visible = false;
    scene.add(mesh);
    return mesh;
  };
  const assistMarker = ring(0.55, 0.62, 0xffd23f);
  const targetMarker = ring(0.5, 0.68, 0xffd23f);
  const destinationMarker = ring(0.15, 0.25, 0xffffff);

  const camera = createViewCamera();
  const pipeline = new PixelPipeline();
  renderer.setClearColor(0x000000, 1);
  renderer.info.autoReset = false;
  const device = { width: 1, height: 1 };

  const applySize = () => setPixelFrustum(camera, pipeline.width, pipeline.height);
  trackDisplaySize(canvas, renderer, (size) => {
    device.width = size.width;
    device.height = size.height;
    pipeline.resize(size.width, size.height);
    applySize();
    stats.setSize(size);
  });

  // Screen (CSS px) <-> the upscaled, centred art-pixel image.
  const imageRect = () => {
    const rect = canvas.getBoundingClientRect();
    const k = rect.width / device.width;
    const w = pipeline.width * pixelLook.scale * k;
    const h = pipeline.height * pixelLook.scale * k;
    const left = rect.left + Math.floor((device.width - pipeline.width * pixelLook.scale) / 2) * k;
    const top = rect.top + (device.height - Math.floor((device.height - pipeline.height * pixelLook.scale) / 2)) * k - h;
    return { left, top, w, h };
  };
  const raycaster = new THREE.Raycaster();
  const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const toScreen = (p: THREE.Vector3) => {
    const r = imageRect();
    const v = p.clone().project(camera);
    return { x: r.left + ((v.x + 1) / 2) * r.w, y: r.top + ((1 - v.y) / 2) * r.h };
  };
  const context: SchemeContext = {
    canvas,
    warrior,
    foes,
    groundAt(x, y) {
      const r = imageRect();
      const ndc = new THREE.Vector2(((x - r.left) / r.w) * 2 - 1, 1 - ((y - r.top) / r.h) * 2);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.ray.intersectPlane(floor, new THREE.Vector3());
    },
    foeAt(x, y) {
      let best = null;
      let bestD = touchTuning.pickRadius;
      for (const foe of foes.list) {
        if (!foe.alive) continue;
        // Distance to the body: the nearer of its feet and its chest on screen.
        const d = Math.min(
          ...[0.2, 0.9].map((h) => {
            const s = toScreen(foe.position.clone().setY(h));
            return Math.hypot(s.x - x, s.y - y);
          }),
        );
        if (d < bestD) {
          best = foe;
          bestD = d;
        }
      }
      return best;
    },
    toScreen,
  };
  const scheme = variant.create(context);
  // For poking at it from the console (and headless checks).
  Object.assign(window, { proto: { warrior, foes, context } });
  const switcher = createSwitcher(VARIANTS, variant);

  if (isTuningEnabled()) {
    const gui = await openTuningPanel();
    const fight = gui.addFolder('Combat');
    fight.add(combat, 'aimAssist').name('aim assist');
    fight.add(combat, 'assistRange', 1, 6, 0.1).name('assist range');
    fight.add(combat, 'assistAngle', 10, 180, 5).name('assist angle ±°');
    fight.add(combat, 'reach', 1, 3, 0.1);
    fight.add(combat, 'arc', 20, 180, 5).name('swing arc ±°');
    fight.add(combat, 'hitAt', 0.1, 0.9, 0.05).name('hit lands at');
    fight.add(combat, 'buffer', 0, 0.6, 0.05).name('input buffer s');
    fight.add(combat, 'dodgeDistance', 1, 5, 0.1).name('dodge distance');
    fight.add(combat, 'dodgeTime', 0.2, 0.8, 0.05).name('dodge time s');
    fight.add(combat, 'blockAngle', 30, 180, 5).name('block angle ±°');
    const touch = gui.addFolder('Touch');
    touch.add(touchTuning, 'holdDelay', 0.1, 0.6, 0.02).name('hold delay s');
    touch.add(touchTuning, 'flickDistance', 10, 80, 2).name('flick px');
    touch.add(touchTuning, 'pickRadius', 15, 90, 5).name('tap pick radius px');
    touch.add(touchTuning, 'stickRadius', 25, 90, 5).name('stick radius px');
    touch.add(touchTuning, 'deadZone', 2, 30, 1).name('stick dead zone px');
    touch.add(tapTuning, 'repeat').name('B: keep swinging');
    const enemies = gui.addFolder('Enemies');
    enemies.add(foeTuning, 'attack').name('they attack');
    enemies.add(foeTuning, 'windup', 0.3, 1.5, 0.05).name('telegraph s');
    enemies.add(foeTuning, 'speed', 0.5, 4, 0.1);
    enemies.add(foeTuning, 'aggro', 2, 12, 0.5);
    enemies.add(foeTuning, 'cooldown', 0.3, 4, 0.1).name('rest between swings s');
    const moves = gui.addFolder('Movement');
    moves.add(movement, 'gait', ['walk', 'run']);
    moves.add(movement, 'walkSpeed', 1, 6, 0.1).name('walk speed');
    moves.add(movement, 'runSpeed', 1, 8, 0.1).name('run speed');
    moves.add(movement, 'animSpeed', 0.5, 1.5, 0.05).name('animation speed');
    gui.addFolder('Camera').add(cameraLook, 'follow', 0, 20, 0.5).name('follow (0 = locked)');
    gui.folders.forEach((f) => f.close());
    restoreTuning(gui);
  }

  const focus = warrior.position.clone();
  let last = performance.now();
  let tallyText = '';
  renderer.setAnimationLoop((now: number) => {
    const dt = (now - last) / 1000;
    last = now;
    const step = Math.min(dt, MAX_STEP_S);

    warrior.update(step, scheme.intent(step));
    foes.update(step, warrior);
    warriorView.sync(warrior, step);
    foeViews.forEach((v) => v.sync(step));

    [warrior, ...foes.list].forEach((body, i) => {
      shadows[i].visible = !('alive' in body) || body.state !== 'gone';
      snapToPixel(shadows[i].position.copy(body.position).setY(0.02));
    });

    const picked = scheme.target();
    const steer = scheme.steering() ?? warrior.facing;
    const candidate =
      !picked && combat.aimAssist && variant.key !== 'tap'
        ? foes.nearest(warrior.position, combat.assistRange, facingVector(steer), combat.assistAngle)
        : null;
    place(targetMarker, picked?.position ?? null);
    place(assistMarker, candidate?.position ?? null);
    place(destinationMarker, scheme.destination());

    const t = foes.tally;
    const text = `hit ${t.hits} · blocked ${t.blocked} · dodged ${t.dodged} · kills ${t.kills}`;
    if (text !== tallyText) switcher.setTally((tallyText = text));

    if (cameraLook.follow > 0) {
      focus.lerp(warrior.position, 1 - Math.exp(-cameraLook.follow * step));
    } else {
      focus.copy(warrior.position);
    }
    placeCamera(camera, focus);

    renderer.info.reset();
    pipeline.render(renderer, scene, camera);
    stats.frame(dt);
  });
}

function place(marker: THREE.Object3D, p: THREE.Vector3 | null): void {
  marker.visible = p !== null;
  if (p) snapToPixel(marker.position.copy(p).setY(0.03));
}
