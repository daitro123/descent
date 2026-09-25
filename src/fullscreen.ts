/**
 * Fullscreen + landscape lock on the button's tap. Both need a user gesture, and the orientation
 * lock only works in fullscreen on Android. Browsers without either (iOS) keep the CSS
 * "turn your phone" overlay in portrait.
 */
export function setUpFullscreenButton(button: HTMLElement): void {
  const sync = () => {
    button.style.display = document.fullscreenElement ? 'none' : '';
  };
  document.addEventListener('fullscreenchange', sync);

  if (!document.documentElement.requestFullscreen) {
    button.style.display = 'none';
    return;
  }

  button.addEventListener('click', async () => {
    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      await (screen.orientation as ScreenOrientation & {
        lock?: (orientation: string) => Promise<void>;
      }).lock?.('landscape');
    } catch {
      // Refused (desktop, iOS, or a setting): play in whatever the browser allows.
    }
  });
}
