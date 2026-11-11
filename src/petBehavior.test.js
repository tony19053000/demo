import test from 'node:test';
import assert from 'node:assert/strict';
import { createPetBehavior } from './petBehavior.js';

function rig(random = () => .99) {
  const poses = [], timers = new Map(); let serial = 0;
  const pet = createPetBehavior(pose => poses.push(pose), {
    random, setTimer: (fn, delay) => { timers.set(++serial, { fn, delay }); return serial; }, clearTimer: id => timers.delete(id),
  });
  return { pet, poses, timers, get pose() { return poses.at(-1); }, next() {
    assert.equal(timers.size, 1, 'at most one action timer');
    const [id, task] = [...timers][0]; timers.delete(id); task.fn();
  } };
}
test('tired pet lies down, naps, wakes and returns to idle', () => {
  const r = rig(); assert.equal(r.pose, 'idle');
  r.next(); assert.equal(r.pose, 'tired');
  r.next(); assert.equal(r.pose, 'sleep');
  r.next(); assert.equal(r.pose, 'wake');
  r.next(); assert.equal(r.pose, 'idle'); r.pet.destroy();
});
test('hover interrupts sleep and settles happily without repeated jumping', () => {
  const r = rig(); r.next(); r.next(); r.pet.engage(true);
  assert.equal(r.pose, 'wake'); r.next(); assert.equal(r.pose, 'excited');
  r.next(); assert.equal(r.pose, 'happy'); assert.equal(r.timers.size, 0);
  r.pet.engage(false); assert.equal(r.pose, 'idle'); assert.equal(r.timers.size, 1); r.pet.destroy();
});
test('leaving during wake cancels the queued excitement', () => {
  const r = rig(); r.next(); r.next(); r.pet.engage(true); r.pet.engage(false);
  assert.equal(r.pose, 'idle'); r.next(); assert.notEqual(r.pose, 'excited'); r.pet.destroy();
});
test('cleanup cancels scheduled and already queued callbacks', () => {
  const r = rig(); const callback = [...r.timers.values()][0].fn;
  r.pet.destroy(); callback(); r.pet.engage(true);
  assert.deepEqual(r.poses, ['idle']); assert.equal(r.timers.size, 0);
});
test('idle variety avoids consecutive repeats and eventually gets tired', () => {
  const r = rig(() => 0); const actions = [];
  for (let i = 0; i < 4; i++) { r.next(); actions.push(r.pose); if (i < 3) r.next(); }
  assert.deepEqual(actions, ['wave', 'hop', 'wave', 'tired']); r.pet.destroy();
});
