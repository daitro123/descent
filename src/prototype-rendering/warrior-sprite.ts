// PROTOTYPE (throwaway): 2D sprites vs pixelated 3D. See .scratch/isometric-poc/issues/04-rendering-approach.md
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clipNamed } from './assets';
import { createPixelTarget, OutlinePass } from './pixel-pipeline';
import { CLIPS, movement, type Warrior } from './warrior';
import { equipKnight } from './warrior-3d';
import { BACK, createLights, facingYaw, FAR, NEAR, PITCH, PX_PER_UNIT, snapToPixel, YAW } from './view';

/** Frame rate the sprite sheet is sampled at, like hand-drawn pixel-art animation. */
export const SPRITE_FPS = 12;
/** Each frame is a CELL×CELL art-pixel cell, with the feet FOOT_ROW pixels above its bottom. */
const CELL = 96;
const FOOT_ROW = 24;

type Strip = { start: number; count: number };

export type SpriteSheet = {
  texture: THREE.Texture;
  columns: number;
  rows: number;
  /** Per clip: frames are laid out as start + facing × count + frame. */
  strips: Map<string, Strip>;
};

/**
 * Approach A's asset step, done in the browser at load instead of offline: renders the KayKit
 * Knight from the game's camera angle into an 8-direction sprite sheet, one art pixel per texel,
 * sampled at SPRITE_FPS. The same outline pass as the game scene draws the inner edges; the
 * outer silhouette edge comes from the game scene itself, as for the 3D model.
 */
export function bakeSpriteSheet(renderer: THREE.WebGLRenderer, gltf: GLTF): SpriteSheet {
  equipKnight(gltf);
  const model = gltf.scene;
  const clips = Object.values(CLIPS).map((name) => clipNamed(gltf, name));

  const strips = new Map<string, Strip>();
  let total = 0;
  for (const clip of clips) {
    const count = Math.max(1, Math.round(clip.duration * SPRITE_FPS));
    strips.set(clip.name, { start: total, count });
    total += count * 8;
  }
  const columns = Math.min(total, Math.floor(Math.min(renderer.capabilities.maxTextureSize, 4096) / CELL));
  const rows = Math.ceil(total / columns);

  const atlas = createPixelTarget(columns * CELL, rows * CELL, false);
  const frame = createPixelTarget(CELL, CELL, true);
  const outline = new OutlinePass();

  const scene = new THREE.Scene();
  scene.add(...createLights(), model);
  const camera = new THREE.OrthographicCamera(
    -CELL / 2 / PX_PER_UNIT,
    CELL / 2 / PX_PER_UNIT,
    (CELL - FOOT_ROW) / PX_PER_UNIT,
    -FOOT_ROW / PX_PER_UNIT,
    NEAR,
    FAR,
  );
  camera.position.copy(BACK).multiplyScalar(50);
  camera.lookAt(0, 0, 0);

  const mixer = new THREE.AnimationMixer(model);
  const clearColor = renderer.getClearColor(new THREE.Color());
  const clearAlpha = renderer.getClearAlpha();
  renderer.setClearColor(0x000000, 0);
  renderer.setRenderTarget(atlas);
  renderer.clear();
  atlas.scissorTest = true;

  for (const clip of clips) {
    const { start, count } = strips.get(clip.name)!;
    mixer.stopAllAction();
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.reset().play();
    for (let f = 0; f < count; f++) {
      mixer.setTime(f / SPRITE_FPS);
      for (let facing = 0; facing < 8; facing++) {
        model.rotation.y = facingYaw(facing);
        renderer.setRenderTarget(frame);
        renderer.render(scene, camera);

        const index = start + facing * count + f;
        const x = (index % columns) * CELL;
        const y = Math.floor(index / columns) * CELL;
        atlas.viewport.set(x, y, CELL, CELL);
        atlas.scissor.set(x, y, CELL, CELL);
        outline.render(renderer, frame, atlas, true);
      }
    }
  }

  atlas.scissorTest = false;
  renderer.setRenderTarget(null);
  renderer.setClearColor(clearColor, clearAlpha);
  mixer.stopAllAction();
  scene.remove(model);
  frame.dispose();
  frame.depthTexture?.dispose();

  return { texture: atlas.texture, columns, rows, strips };
}

/**
 * Approach A in the scene: one quad standing upright on the Warrior's feet, turned to face the
 * camera and stretched by 1/cos(pitch) so one texel covers one art pixel on screen. Alpha-tested,
 * so the depth buffer sorts it against walls and props per pixel (as a flat card).
 */
export class WarriorSpriteView {
  readonly root: THREE.Mesh;
  private readonly texture: THREE.Texture;

  constructor(private readonly sheet: SpriteSheet) {
    const width = CELL / PX_PER_UNIT;
    const height = CELL / PX_PER_UNIT / Math.cos(PITCH);
    const geometry = new THREE.PlaneGeometry(width, height);
    geometry.translate(0, height / 2 - FOOT_ROW / PX_PER_UNIT / Math.cos(PITCH), 0);

    this.texture = sheet.texture;
    this.texture.repeat.set(1 / sheet.columns, 1 / sheet.rows);
    this.root = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: this.texture, alphaTest: 0.5 }));
    this.root.rotation.y = YAW;
  }

  sync(warrior: Warrior): void {
    const strip = this.sheet.strips.get(warrior.clip)!;
    let frame = Math.floor(warrior.stateTime * SPRITE_FPS * movement.animSpeed);
    frame = warrior.state === 'attack' ? Math.min(frame, strip.count - 1) : frame % strip.count;
    const index = strip.start + warrior.facing * strip.count + frame;
    this.texture.offset.set(
      (index % this.sheet.columns) / this.sheet.columns,
      Math.floor(index / this.sheet.columns) / this.sheet.rows,
    );
    snapToPixel(this.root.position.copy(warrior.position));
  }
}
