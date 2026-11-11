const poses = [
  [50, 62, 1.16, -6, 1],
  [18, 29, .46, -14, .82],
  [50, 14, .33, 0, .64],
  [82, 29, .46, 14, .82],
];
// Separate curved lanes let the outgoing product clear the centre first.
const controls = [[85, 65], [17, 65], [26, 8], [74, 8]];
const ease = value => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export function authProductPose(index, elapsed) {
  const cycle = 4600, hold = 2700, travel = cycle - hold;
  const turn = Math.floor(elapsed / cycle);
  const part = elapsed % cycle;
  const progress = Math.max(0, (part - hold) / travel);
  const slot = ((index - turn) % 4 + 4) % 4;
  const from = poses[slot], to = poses[(slot + 3) % 4];
  const t = ease(progress);
  // Shrink the departing item early and enlarge the arrival only after it clears.
  const scaleProgress = slot === 0 ? ease(progress / .65) :
    slot === 1 ? ease((progress - .25) / .75) : t;
  const [cx, cy] = controls[slot];
  const x = (1-t)**2*from[0] + 2*(1-t)*t*cx + t*t*to[0];
  const y = (1-t)**2*from[1] + 2*(1-t)*t*cy + t*t*to[1];
  const breath = slot === 0 && part < hold ? .025*Math.sin(Math.PI*part/hold)**2 : 0;
  return [
    x, y, from[2]+(to[2]-from[2])*scaleProgress+breath,
    from[3]+(to[3]-from[3])*t,
    from[4]+(to[4]-from[4])*t,
  ];
}
