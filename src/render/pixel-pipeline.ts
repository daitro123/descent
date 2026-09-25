import * as THREE from 'three';
import { FAR, NEAR } from './view';

/** Tunable look of the pipeline. */
export const pixelLook = {
  /** Device pixels per art pixel (whole number). */
  scale: 4,
  /** 0..1, how much the depth-edge outline darkens. */
  outline: 0.45,
  /** Depth jump, in world units, that counts as an edge. */
  outlineDepth: 0.35,
};

const fullScreenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Darkens pixels that sit in front of a neighbour (outer silhouettes and overlaps), like
 * RenderPixelatedPass's depth edges, but from the depth buffer alone: no second normals render.
 */
const outlineFragment = /* glsl */ `
  uniform sampler2D tColor;
  uniform sampler2D tDepth;
  uniform vec2 texel;
  uniform float strength;
  uniform float threshold;
  uniform float depthRange;
  varying vec2 vUv;

  float edgeTo(float d0, vec2 offset) {
    float d = texture2D(tDepth, vUv + offset * texel).r;
    return (d - d0) * depthRange > threshold ? 1.0 : 0.0;
  }

  void main() {
    vec4 color = texture2D(tColor, vUv);
    float d0 = texture2D(tDepth, vUv).r;
    float edge = 0.0;
    if (d0 < 1.0) {
      edge = max(max(edgeTo(d0, vec2(1.0, 0.0)), edgeTo(d0, vec2(-1.0, 0.0))),
                 max(edgeTo(d0, vec2(0.0, 1.0)), edgeTo(d0, vec2(0.0, -1.0))));
    }
    gl_FragColor = vec4(color.rgb * (1.0 - strength * edge), color.a);
    #include <colorspace_fragment>
  }
`;

const blitFragment = /* glsl */ `
  uniform sampler2D tColor;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(tColor, vUv);
    #include <colorspace_fragment>
  }
`;

/** Low-res colour target (sRGB, nearest), optionally with a depth texture. */
function createPixelTarget(width: number, height: number, withDepth: boolean): THREE.WebGLRenderTarget {
  const target = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    generateMipmaps: false,
    depthBuffer: true,
    depthTexture: withDepth ? new THREE.DepthTexture(width, height) : null,
  });
  target.texture.colorSpace = THREE.SRGBColorSpace;
  return target;
}

/** One full-screen triangle pair, drawn with whichever material a pass needs. */
class FullScreenQuad {
  private readonly mesh: THREE.Mesh;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  constructor() {
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  render(renderer: THREE.WebGLRenderer, material: THREE.Material): void {
    this.mesh.material = material;
    renderer.render(this.scene, this.camera);
  }
}

class OutlinePass {
  private readonly quad = new FullScreenQuad();
  private readonly material = new THREE.ShaderMaterial({
    uniforms: {
      tColor: { value: null },
      tDepth: { value: null },
      texel: { value: new THREE.Vector2() },
      strength: { value: 0 },
      threshold: { value: 0 },
      depthRange: { value: FAR - NEAR },
    },
    vertexShader: fullScreenVertex,
    fragmentShader: outlineFragment,
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
  });

  /** Reads `source` (colour + depth) and writes the outlined image to `target`. */
  render(renderer: THREE.WebGLRenderer, source: THREE.WebGLRenderTarget, target: THREE.WebGLRenderTarget): void {
    const u = this.material.uniforms;
    u.tColor.value = source.texture;
    u.tDepth.value = source.depthTexture;
    u.texel.value.set(1 / source.width, 1 / source.height);
    u.strength.value = pixelLook.outline;
    u.threshold.value = pixelLook.outlineDepth;
    renderer.setRenderTarget(target);
    this.quad.render(renderer, this.material);
  }
}

/**
 * Renders a scene at low virtual resolution, outlines it, then scales it up to the canvas by a
 * whole number with nearest-neighbour sampling. Any remainder is letterboxed in black.
 */
export class PixelPipeline {
  /** Virtual (art-pixel) resolution. */
  width = 1;
  height = 1;

  private sceneTarget = createPixelTarget(1, 1, true);
  private outlineTarget = createPixelTarget(1, 1, false);
  private readonly outline = new OutlinePass();
  private readonly quad = new FullScreenQuad();
  private readonly blit = new THREE.ShaderMaterial({
    uniforms: { tColor: { value: null } },
    vertexShader: fullScreenVertex,
    fragmentShader: blitFragment,
    depthTest: false,
    depthWrite: false,
  });
  private deviceWidth = 1;
  private deviceHeight = 1;

  resize(deviceWidth: number, deviceHeight: number): void {
    this.deviceWidth = deviceWidth;
    this.deviceHeight = deviceHeight;
    const width = Math.max(1, Math.floor(deviceWidth / pixelLook.scale));
    const height = Math.max(1, Math.floor(deviceHeight / pixelLook.scale));
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.sceneTarget.dispose();
    this.sceneTarget.depthTexture?.dispose();
    this.outlineTarget.dispose();
    this.sceneTarget = createPixelTarget(width, height, true);
    this.outlineTarget = createPixelTarget(width, height, false);
  }

  /** Re-applies the current scale to the last canvas size. */
  refresh(): void {
    this.resize(this.deviceWidth, this.deviceHeight);
  }

  /** Relies on `renderer.autoClear` and a black, opaque clear colour; the scene sets its own background. */
  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void {
    renderer.setRenderTarget(this.sceneTarget);
    renderer.render(scene, camera);

    this.outline.render(renderer, this.sceneTarget, this.outlineTarget);

    // Whole-number upscale, centred; the margin stays black (autoClear clears the whole canvas).
    const scaledWidth = this.width * pixelLook.scale;
    const scaledHeight = this.height * pixelLook.scale;
    renderer.setRenderTarget(null);
    renderer.setViewport(
      Math.floor((this.deviceWidth - scaledWidth) / 2),
      Math.floor((this.deviceHeight - scaledHeight) / 2),
      scaledWidth,
      scaledHeight,
    );
    this.blit.uniforms.tColor.value = this.outlineTarget.texture;
    this.quad.render(renderer, this.blit);
  }
}
