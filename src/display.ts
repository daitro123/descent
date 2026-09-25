import type { WebGLRenderer } from 'three';

export type DisplaySize = {
  /** Drawing-buffer size in device pixels. */
  width: number;
  height: number;
  devicePixelRatio: number;
};

/**
 * Keeps the renderer's drawing buffer at the canvas's exact size in device pixels.
 *
 * Sized by hand rather than with `renderer.setPixelRatio`, so the buffer size is always known:
 * the pixel-art upscale has to divide it by a whole number.
 */
export function trackDisplaySize(
  canvas: HTMLCanvasElement,
  renderer: WebGLRenderer,
  onResize: (size: DisplaySize) => void,
): void {
  const apply = (width: number, height: number) => {
    width = Math.max(1, width);
    height = Math.max(1, height);
    renderer.setSize(width, height, false);
    onResize({ width, height, devicePixelRatio: window.devicePixelRatio });
  };

  const observer = new ResizeObserver(([entry]) => {
    // Exact device pixels where supported (Chrome, Firefox); rounded CSS size × DPR elsewhere.
    const box = entry.devicePixelContentBoxSize?.[0];
    if (box) {
      apply(box.inlineSize, box.blockSize);
    } else {
      const css = entry.contentBoxSize[0];
      apply(
        Math.round(css.inlineSize * window.devicePixelRatio),
        Math.round(css.blockSize * window.devicePixelRatio),
      );
    }
  });

  try {
    observer.observe(canvas, { box: 'device-pixel-content-box' });
  } catch {
    observer.observe(canvas, { box: 'content-box' });
  }
}
