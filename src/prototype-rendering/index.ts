// PROTOTYPE (throwaway): 2D sprites vs pixelated 3D. See .scratch/isometric-poc/issues/04-rendering-approach.md
//
// Three variants of the same scene on the game's one page, switched with `?variant=`:
//   sprites     A: 8-direction sprite sheet baked from the KayKit Knight, 12 fps, instant turns
//   3d          B: the live KayKit Knight, smooth animation, blended clips, smooth turns
//   3d-stepped  C: the live KayKit Knight, animation sampled at 12 fps, cuts, instant turns
// Everything else is shared: Area, camera, low-res render + outline + whole-number upscale,
// pixel snapping, controls, Tuning panel.
import './prototype.css';
import * as THREE from 'three';
import type { createStats } from '../stats';
import { trackDisplaySize } from '../display';
import { isTuningEnabled, openTuningPanel, restoreTuning } from '../tuning';
import { clipNamed, loadModel } from './assets';
import { buildArea } from './area';
import { Autopilot, createInput } from './input';
import { PixelPipeline, pixelLook } from './pixel-pipeline';
import { createSwitcher, currentVariant } from './switcher';
import {
  createLights,
  createViewCamera,
  placeCamera,
  setPixelFrustum,
  snapToPixel,
} from './view';
import { CLIPS, movement, Warrior } from './warrior';
import { Warrior3DView } from './warrior-3d';
import { bakeSpriteSheet, SPRITE_FPS, WarriorSpriteView } from './warrior-sprite';

const VARIANTS = [
  { key: 'sprites', label: 'A · 2D sprites' },
  { key: '3d', label: 'B · 3D smooth' },
  { key: '3d-stepped', label: 'C · 3D stepped' },
] as const;

/** Longest step the simulation takes; a longer stall (tab switch, GC) is cut short. */
const MAX_STEP_S = 0.1;

const cameraLook = {
  /** How fast the camera catches up with the Warrior (1/s); 0 locks it on. */
  follow: 8,
};

type Stats = ReturnType<typeof createStats>;

export async function startRenderingPrototype(
  canvas: HTMLCanvasElement,
  renderer: THREE.WebGLRenderer,
  stats: Stats,
): Promise<void> {
  const variant = currentVariant(VARIANTS);
  const loading = document.createElement('div');
  loading.className = 'proto-loading';
  loading.textContent = 'Loading…';
  document.body.append(loading);

  const [area, knight] = await Promise.all([buildArea(), loadModel('knight')]);
  const attackClip = clipNamed(knight, CLIPS.attack);
  const warrior = new Warrior(area, attackClip.duration);

  let bakeNote = '';
  let view: { root: THREE.Object3D; sync(warrior: Warrior, dt: number): void };
  if (variant.key === 'sprites') {
    loading.textContent = 'Baking sprites…';
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const start = performance.now();
    const sheet = bakeSpriteSheet(renderer, knight);
    const frames = [...sheet.strips.values()].reduce((sum, s) => sum + s.count * 8, 0);
    bakeNote = ` · ${frames} frames baked in ${Math.round(performance.now() - start)} ms`;
    view = new WarriorSpriteView(sheet);
  } else {
    view = new Warrior3DView(
      knight,
      variant.key === '3d'
        ? { stepFps: 0, smoothTurn: true, crossfade: 0.15 }
        : { stepFps: SPRITE_FPS, smoothTurn: false, crossfade: 0 },
    );
  }
  loading.remove();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14121a);
  scene.add(...createLights(), area.root, view.root);

  // Blob shadow: grounds the Warrior the same way in every variant (no real shadows).
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 16).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }),
  );
  scene.add(shadow);

  const camera = createViewCamera();
  const pipeline = new PixelPipeline();
  renderer.setClearColor(0x000000, 1);
  // Several renders per frame: keep the counts for the whole frame, reset by hand below.
  renderer.info.autoReset = false;

  const autopilot = new Autopilot();
  let auto = true;
  const switcher = createSwitcher(VARIANTS, variant, () => {
    auto = !auto;
    if (auto) autopilot.restart(warrior);
    switcher.setAuto(auto);
  });
  switcher.setAuto(auto);

  const attackButton = document.createElement('button');
  attackButton.type = 'button';
  attackButton.className = 'proto-attack';
  attackButton.textContent = '⚔';
  attackButton.setAttribute('aria-label', 'Attack');
  document.body.append(attackButton);
  const input = createInput(canvas, attackButton, () => {
    auto = false;
    switcher.setAuto(false);
  });

  const applySize = () => {
    setPixelFrustum(camera, pipeline.width, pipeline.height);
    switcher.setDetail(`${pipeline.width}×${pipeline.height} ×${pixelLook.scale}${bakeNote}`);
  };
  trackDisplaySize(canvas, renderer, (size) => {
    pipeline.resize(size.width, size.height);
    applySize();
    stats.setSize(size);
  });

  if (isTuningEnabled()) {
    const gui = await openTuningPanel();
    const pixels = gui.addFolder('Pixels');
    pixels
      .add(pixelLook, 'scale', 2, 8, 1)
      .name('screen px per art px')
      .onChange(() => {
        pipeline.refresh();
        applySize();
      });
    pixels.add(pixelLook, 'outline', 0, 1, 0.05).name('outline strength');
    pixels.add(pixelLook, 'outlineDepth', 0.05, 2, 0.05).name('outline depth');
    const moves = gui.addFolder('Movement');
    moves.add(movement, 'gait', ['walk', 'run']);
    moves.add(movement, 'walkSpeed', 1, 6, 0.1).name('walk speed');
    moves.add(movement, 'runSpeed', 1, 8, 0.1).name('run speed');
    moves.add(movement, 'animSpeed', 0.5, 1.5, 0.05).name('animation speed');
    gui.addFolder('Camera').add(cameraLook, 'follow', 0, 20, 0.5).name('follow (0 = locked)');
    restoreTuning(gui);
  }

  const focus = warrior.position.clone();
  let last = performance.now();
  renderer.setAnimationLoop((now: number) => {
    const dt = (now - last) / 1000;
    last = now;
    const step = Math.min(dt, MAX_STEP_S);

    if (auto) {
      const steer = autopilot.steer(warrior, step);
      warrior.update(step, steer.facing, steer.attack);
    } else {
      warrior.update(step, input.facing(), input.takeAttack());
    }
    view.sync(warrior, step);
    shadow.position.copy(warrior.position).y = 0.02;
    snapToPixel(shadow.position);

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
