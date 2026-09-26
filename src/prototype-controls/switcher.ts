// PROTOTYPE (throwaway): touch control schemes. See .scratch/isometric-poc/issues/05-touch-controls.md
//
// Deliberately shown in the production build: the comparison happens on the deployed page on the
// phone. It goes away with the rest of the prototype once a scheme wins.

export type Variant = { key: string; label: string; help: string };

export function currentVariant<T extends Variant>(variants: readonly T[]): T {
  const key = new URLSearchParams(location.search).get('variant');
  return variants.find((v) => v.key === key) ?? variants[0];
}

/**
 * Floating bar, top centre (the bottom corners belong to the controls): ‹ variant › cycles
 * variants by reloading with `?variant=`, keeping the other URL parameters, `?tune` included.
 * Shift+←/→ does the same on a keyboard. A second line shows the scheme's gestures, a third the
 * live tally.
 */
export function createSwitcher(variants: readonly Variant[], current: Variant) {
  const bar = document.createElement('div');
  bar.className = 'proto-switcher';
  const prev = button('‹', 'Previous variant');
  const next = button('›', 'Next variant');
  const label = document.createElement('div');
  label.className = 'proto-switcher-label';
  const title = document.createElement('strong');
  title.textContent = current.label;
  const help = document.createElement('span');
  help.textContent = current.help;
  const tally = document.createElement('span');
  label.append(title, help, tally);
  bar.append(prev, label, next);
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
  window.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable]')) return;
    if (event.key === 'ArrowLeft' && event.shiftKey) go(-1);
    if (event.key === 'ArrowRight' && event.shiftKey) go(1);
  });

  return {
    setTally(text: string) {
      tally.textContent = text;
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
