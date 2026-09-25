import type { WebGLRenderer } from 'three';
import type { DisplaySize } from './display';

const REPORT_INTERVAL_S = 0.5;

/**
 * On-screen frame-rate readout: fps, average and worst frame time, drawing-buffer size, DPR,
 * GPU and draw calls. Everything the baseline measurement on the phone has to record.
 */
export function createStats(element: HTMLElement, renderer: WebGLRenderer) {
  const gpu = gpuName(renderer);
  let size: DisplaySize | undefined;
  let frames = 0;
  let elapsed = 0;
  let worst = 0;

  return {
    setSize(next: DisplaySize) {
      size = next;
    },

    /** Call once per rendered frame with the real (unclamped) frame time in seconds. */
    frame(dt: number) {
      frames++;
      elapsed += dt;
      worst = Math.max(worst, dt);
      if (elapsed < REPORT_INTERVAL_S) return;

      const fps = frames / elapsed;
      const avgMs = (elapsed / frames) * 1000;
      const { calls, triangles } = renderer.info.render;
      element.textContent = [
        `${fps.toFixed(0)} fps  ${avgMs.toFixed(1)} ms  (worst ${(worst * 1000).toFixed(1)})`,
        size
          ? `${size.width}×${size.height} px  dpr ${size.devicePixelRatio.toFixed(2)}`
          : '',
        `${calls} calls  ${triangles} tris`,
        gpu,
      ].join('\n');

      frames = 0;
      elapsed = 0;
      worst = 0;
    },
  };
}

function gpuName(renderer: WebGLRenderer): string {
  const gl = renderer.getContext();
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
}
