// The PoC scene: the Warrior in the stand-in Area, rendered as pixelated 3D (low-res render,
// depth-edge outline, whole-number upscale, pixel-snapped camera and objects).
import './scene.css';
import * as THREE from 'three';
import type { createStats } from '../stats';
import { trackDisplaySize } from '../display';
import { PixelPipeline, pixelLook } from '../render/pixel-pipeline';
import { createLights, createViewCamera, placeCamera, setPixelFrustum, snapToPixel } from '../render/view';
import { isTuningEnabled, openTuningPanel, restoreTuning } from '../tuning';
import { buildArea } from './area';
import { clipNamed, loadModel } from './assets';
import { Autopilot, createInput } from './input';
import { CLIPS, movement, Warrior } from './warrior';
import { WarriorView } from './warrior-view';

/** Longest step the simulation takes; a longer stall (tab switch, GC) is cut short. */
const MAX_STEP_S = 0.1;

const cameraLook = {
  /** How fast the camera catches up with the Warrior (1/s); 0 locks it on. */
  follow: 8,
};

type Stats = ReturnType<typeof createStats>;

export async function startScene(canvas: HTMLCanvasElement, renderer: THREE.WebGLRenderer, stats: Stats): Promise<void> {
  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.textContent = 'Loading…';
  document.body.append(loading);

  const [area, knight] = await Promise.all([buildArea(), loadModel('knight')]);
  const warrior = new Warrior(area, clipNamed(knight, CLIPS.attack).duration);
  const view = new WarriorView(knight);
  loading.remove();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14121a);
  scene.add(...createLights(), area.root, view.root);

  // Blob shadow: grounds the Warrior without real shadows.
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
  const autoButton = button('auto on', 'Auto', 'Toggle autopilot');
  autoButton.addEventListener('click', () => {
    auto = !auto;
    if (auto) autopilot.restart(warrior);
    autoButton.classList.toggle('on', auto);
  });
  const attackButton = button('attack', '⚔', 'Attack');
  const input = createInput(canvas, attackButton, () => {
    auto = false;
    autoButton.classList.remove('on');
  });

  const applySize = () => setPixelFrustum(camera, pipeline.width, pipeline.height);
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

function button(className: string, text: string, label: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = className;
  b.textContent = text;
  b.setAttribute('aria-label', label);
  document.body.append(b);
  return b;
}
