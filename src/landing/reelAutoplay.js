import { maxReelPosition, reelPosition, reelOffset } from './findsReelData.js';

// Autoplay and manual input both move the native scroll track.
export function startReelAutoplay(track) {
  const surface = track.parentElement;
  const events = new AbortController();
  const listen = (target, type, handler) =>
    target.addEventListener(type, handler, { passive: true, signal: events.signal });

  let visible = false;
  let hovering = false;
  let pressing = false;
  let keyboardFocus = false;
  let frame = 0;
  let timer = 0;

  function schedule() {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    if (!visible || hovering || pressing || keyboardFocus || document.hidden) return;
    timer = setTimeout(advance, 3000);
  }

  function advance() {
    const maximum = track.scrollWidth - track.clientWidth;
    if (maximum <= 0) return;
    const origin = track.scrollLeft;
    const position = reelPosition(origin, maximum);
    // Allow for the browser rounding a settled scroll offset to a pixel.
    const next = Math.floor(position + maxReelPosition / maximum) + 1;
    const returning = next > maxReelPosition;
    const destination = reelOffset(returning ? 0 : next, maximum);
    const started = performance.now();
    const duration = returning ? 1100 : 720;

    function move(now) {
      const progress = Math.min(1, Math.max(0, (now - started) / duration));
      const eased = progress * progress * (3 - 2 * progress);
      track.scrollLeft = origin + (destination - origin) * eased;
      if (progress < 1) frame = requestAnimationFrame(move);
      else schedule();
    }
    frame = requestAnimationFrame(move);
  }

  listen(surface, 'pointerenter', event => {
    hovering = event.pointerType === 'mouse';
    schedule();
  });
  listen(surface, 'pointerleave', () => { hovering = false; schedule(); });
  listen(surface, 'pointerdown', () => { pressing = true; keyboardFocus = false; schedule(); });
  function release() {
    if (!pressing) return;
    pressing = false;
    schedule();
  }
  listen(window, 'pointerup', release);
  listen(window, 'pointercancel', release);
  listen(surface, 'focusin', event => {
    keyboardFocus = !pressing && event.target.matches(':focus-visible');
    schedule();
  });
  listen(surface, 'focusout', event => {
    if (!surface.contains(event.relatedTarget)) keyboardFocus = false;
    schedule();
  });
  listen(surface, 'keydown', () => { keyboardFocus = true; schedule(); });
  listen(surface, 'wheel', () => schedule());
  listen(document, 'visibilitychange', () => schedule());
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  });
  observer.observe(track);

  return () => {
    events.abort();
    observer.disconnect();
    clearTimeout(timer);
    cancelAnimationFrame(frame);
  };
}
