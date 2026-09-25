// PROTOTYPE (throwaway): 2D sprites vs pixelated 3D. See .scratch/isometric-poc/issues/04-rendering-approach.md
//
// Deliberately shown in the production build: the comparison happens on the deployed page on the
// phone. It goes away with the rest of the prototype once a variant wins.

export type Variant = { key: string; label: string };

export function currentVariant<T extends Variant>(variants: readonly T[]): T {
  const key = new URLSearchParams(location.search).get('variant');
  return variants.find((v) => v.key === key) ?? variants[0];
}

/**
 * Floating bar, bottom centre: ‹ variant › cycles variants (Shift+←/→ on a keyboard, as the
 * arrows alone move the Warrior) by
 * reloading with `?variant=`, keeping the other URL parameters, `?tune` included. A second line
 * shows live details. "Auto" toggles the autopilot.
 */
export function createSwitcher(variants: readonly Variant[], current: Variant, onAuto: () => void) {
  const bar = document.createElement('div');
  bar.className = 'proto-switcher';
  const prev = button('‹', 'Previous variant');
  const next = button('›', 'Next variant');
  const label = document.createElement('div');
  label.className = 'proto-switcher-label';
  const title = document.createElement('strong');
  title.textContent = current.label;
  const detail = document.createElement('span');
  label.append(title, detail);
  const auto = button('Auto', 'Toggle autopilot');
  auto.classList.add('proto-switcher-auto');
  bar.append(prev, label, next, auto);
  document.body.append(bar);

  const go = (step: number) => {
    const index = variants.indexOf(current);
    const target = variants[(index + step + variants.length) % variants.length];
    const params = new URLSearchParams(location.search);
    params.set('variant', target.key);
    location.search = params.toString();
  };
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  auto.addEventListener('click', onAuto);
  window.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable]')) return;
    if (event.key === 'ArrowLeft' && event.shiftKey) go(-1);
    if (event.key === 'ArrowRight' && event.shiftKey) go(1);
  });

  return {
    setDetail(text: string) {
      detail.textContent = text;
    },
    setAuto(on: boolean) {
      auto.classList.toggle('on', on);
    },
  };
}

function button(text: string, label: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = text;
  b.setAttribute('aria-label', label);
  return b;
}
