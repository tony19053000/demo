// One cancellable timer owns the pet's idle and interaction sequences.
export function createPetBehavior(onPose, { random = Math.random, setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
  let timer, stopped = false, engaged = false, pose = 'idle', previous = '', awakeActions = 0;
  const clear = () => { clearTimer(timer); timer = undefined; };
  const show = next => { if (!stopped) { pose = next; onPose(next); } };
  const later = (fn, delay) => { clear(); timer = setTimer(() => { timer = undefined; if (!stopped) fn(); }, delay); };
  const rest = () => { show('idle'); later(act, 3800 + random() * 4400); };
  const act = () => {
    const actions = ['wave', 'hop', 'look', 'stretch', 'tired'];
    let index = Math.min(actions.length - 1, Math.floor(random() * actions.length));
    if (actions[index] === previous) index = (index + 1) % actions.length;
    if (++awakeActions >= 4) index = 4;
    previous = actions[index];
    show(previous);
    if (previous === 'tired') {
      awakeActions = 0;
      later(() => { show('sleep'); later(() => { show('wake'); later(rest, 1000); }, 8500); }, 2200);
    } else later(rest, { wave: 1800, hop: 1400, look: 2400, stretch: 1900 }[previous]);
  };
  const celebrate = () => { show('excited'); later(() => show('happy'), 1800); };
  rest();
  return {
    engage(value) {
      if (stopped || engaged === value) return;
      engaged = value;
      clear();
      if (value) {
        if (pose === 'sleep' || pose === 'tired') { show('wake'); later(celebrate, 800); }
        else celebrate();
      } else rest();
    },
    destroy() { stopped = true; clear(); },
  };
}
