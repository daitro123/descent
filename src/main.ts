import * as THREE from 'three';
import { trackDisplaySize } from './display';
import { setUpFullscreenButton } from './fullscreen';
import { createStats } from './stats';
import { isTuningEnabled, openTuningPanel, restoreTuning } from './tuning';

/** Longest step the simulation takes; a longer stall (tab switch, GC) is cut short. */
const MAX_STEP_S = 0.1;

/** World units visible from the bottom to the top of the screen. */
const VIEW_HEIGHT = 10;

const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setClearColor(0x14121a);

const scene = new THREE.Scene();

// Isometric-style orthographic camera: turned 45° around the vertical axis, tilted 30° down
// (2:1 ground diamonds; see the Three.js pixel-rendering research).
const camera = new THREE.OrthographicCamera();
const yaw = THREE.MathUtils.degToRad(45);
const pitch = THREE.MathUtils.degToRad(30);
const distance = 50;
camera.position.set(
  Math.sin(yaw) * Math.cos(pitch) * distance,
  Math.sin(pitch) * distance,
  Math.cos(yaw) * Math.cos(pitch) * distance,
);
camera.lookAt(0, 0, 0);

// Placeholder content: a floor grid and one spinning box, so there is something to look at and
// the delta-time loop can be seen running at the right speed.
scene.add(new THREE.GridHelper(8, 8, 0x5a5670, 0x34313f));
scene.add(new THREE.HemisphereLight(0xffffff, 0x444466, 2));
const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xd08a3c }));
box.position.y = 0.5;
scene.add(box);

const stats = createStats(document.querySelector<HTMLElement>('#stats')!, renderer);

trackDisplaySize(canvas, renderer, (size) => {
  const aspect = size.width / size.height;
  camera.top = VIEW_HEIGHT / 2;
  camera.bottom = -VIEW_HEIGHT / 2;
  camera.left = (-VIEW_HEIGHT / 2) * aspect;
  camera.right = (VIEW_HEIGHT / 2) * aspect;
  camera.updateProjectionMatrix();
  stats.setSize(size);
});

setUpFullscreenButton(document.querySelector<HTMLElement>('#fullscreen')!);

if (isTuningEnabled()) {
  void openTuningPanel().then(restoreTuning);
}

// The Redmi's screen runs at 120 Hz, so rAF may fire every 8.3 ms: everything moves by delta time.
const spinSpeed = 1; // radians per second
let last = performance.now();
renderer.setAnimationLoop((now: number) => {
  const dt = (now - last) / 1000;
  last = now;
  const step = Math.min(dt, MAX_STEP_S);

  box.rotation.y += spinSpeed * step;

  renderer.render(scene, camera);
  stats.frame(dt);
});
