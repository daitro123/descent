import type GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';

const STORAGE_KEY = 'descent.tuning';

/** The Tuning panel is only built when the page is opened with `?tune`. */
export function isTuningEnabled(): boolean {
  return new URLSearchParams(location.search).has('tune');
}

/**
 * Opens the Tuning panel. Feel values get added to the returned GUI as folders and controllers.
 * The panel's lil-gui code is loaded on demand, so the normal build doesn't ship it.
 *
 * Tuned values survive a reload (localStorage). "Copy values" puts them on the clipboard as JSON,
 * ready to paste back into the code as new defaults.
 */
export async function openTuningPanel(): Promise<GUI> {
  const { default: LilGUI } = await import('three/examples/jsm/libs/lil-gui.module.min.js');
  const gui = new LilGUI({ title: 'Tuning' });

  const actions = {
    copyValues: () => {
      void navigator.clipboard?.writeText(JSON.stringify(gui.save(), null, 2));
    },
    reset: () => {
      gui.reset();
      removeSaved();
    },
  };
  gui.add(actions, 'copyValues').name('Copy values');
  gui.add(actions, 'reset').name('Reset to defaults');

  gui.onFinishChange(() => storeSaved(gui));
  return gui;
}

/** Re-applies values saved by an earlier session. Call after all controllers have been added. */
export function restoreTuning(gui: GUI): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) gui.load(JSON.parse(saved));
  } catch {
    // Storage blocked or stale data: keep the defaults.
  }
}

function storeSaved(gui: GUI): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gui.save()));
  } catch {
    // Storage blocked: values just won't survive a reload.
  }
}

function removeSaved(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to remove.
  }
}
