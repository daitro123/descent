// Camera and art-pixel grid for pixelated 3D. Why 3D: .scratch/isometric-poc/issues/04-rendering-approach.md
import * as THREE from 'three';

/** Art density: virtual (art) pixels per world unit, measured on screen. The Warrior is ~48 px tall. */
export const PX_PER_UNIT = 24;

/** 45° around the vertical axis, 30° down: 2:1 ground diamonds. */
export const YAW = THREE.MathUtils.degToRad(45);
export const PITCH = THREE.MathUtils.degToRad(30);
const DISTANCE = 50;
export const NEAR = 1;
export const FAR = 100;

/** Unit vector from the scene towards the camera. */
export const BACK = new THREE.Vector3(
  Math.sin(YAW) * Math.cos(PITCH),
  Math.sin(PITCH),
  Math.cos(YAW) * Math.cos(PITCH),
);
/** Camera axes: screen right and screen up, in world space. */
export const RIGHT = new THREE.Vector3(Math.cos(YAW), 0, -Math.sin(YAW));
export const UP = new THREE.Vector3().crossVectors(BACK, RIGHT).normalize();

/** Screen right and screen up flattened onto the ground, for turning stick input into world directions. */
export const GROUND_RIGHT = RIGHT.clone();
export const GROUND_UP = new THREE.Vector3(-Math.sin(YAW), 0, -Math.cos(YAW));

/** Soft sky fill plus a key light from the camera's upper left. */
export function createLights(): THREE.Light[] {
  const key = new THREE.DirectionalLight(0xfff1dc, 2.2);
  key.position.set(-4, 10, 8);
  return [new THREE.HemisphereLight(0xdfe6ff, 0x3a3346, 1.4), key];
}

/** An orthographic camera pointed along the view, looking at the origin. */
export function createViewCamera(): THREE.OrthographicCamera {
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, NEAR, FAR);
  camera.up.set(0, 1, 0);
  camera.position.copy(BACK).multiplyScalar(DISTANCE);
  camera.lookAt(0, 0, 0);
  return camera;
}

/**
 * Frustum for a `width`×`height` virtual-pixel target, with pixel edges on whole multiples of
 * 1/PX_PER_UNIT from the camera, so snapped objects land exactly on the pixel grid.
 */
export function setPixelFrustum(camera: THREE.OrthographicCamera, width: number, height: number): void {
  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);
  camera.left = -halfW / PX_PER_UNIT;
  camera.right = (width - halfW) / PX_PER_UNIT;
  camera.bottom = -halfH / PX_PER_UNIT;
  camera.top = (height - halfH) / PX_PER_UNIT;
  camera.updateProjectionMatrix();
}

/** Puts the camera so it looks at `focus`, snapped to whole virtual pixels. */
export function placeCamera(camera: THREE.OrthographicCamera, focus: THREE.Vector3): void {
  snapToPixel(camera.position.copy(BACK).multiplyScalar(DISTANCE).add(focus));
}

/**
 * Moves `p` (in place) to the nearest point whose screen position is a whole virtual pixel.
 * Depth along the view is kept. Gameplay keeps the true position; only render copies are snapped.
 */
export function snapToPixel(p: THREE.Vector3): THREE.Vector3 {
  const r = Math.round(p.dot(RIGHT) * PX_PER_UNIT) / PX_PER_UNIT;
  const u = Math.round(p.dot(UP) * PX_PER_UNIT) / PX_PER_UNIT;
  const b = p.dot(BACK);
  return p.copy(RIGHT).multiplyScalar(r).addScaledVector(UP, u).addScaledVector(BACK, b);
}

/** Yaw (rotation.y) of the 8 facings, 0 = +Z (glTF forward), counter-clockwise seen from above. */
export function facingYaw(facing: number): number {
  return facing * (Math.PI / 4);
}

export function facingVector(facing: number, out = new THREE.Vector3()): THREE.Vector3 {
  const yaw = facingYaw(facing);
  return out.set(Math.sin(yaw), 0, Math.cos(yaw));
}

/** Nearest of the 8 facings to a world direction on the ground. */
export function facingOf(x: number, z: number): number {
  return ((Math.round(Math.atan2(x, z) / (Math.PI / 4)) % 8) + 8) % 8;
}
