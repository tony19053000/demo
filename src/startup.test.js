import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/);

test('fresh document resets an old scroll position before the application loads', () => {
  assert.ok(bootstrap && bootstrap.index < html.indexOf('<script type="module"'));
  const history = { scrollRestoration: 'auto' };
  let scrollY = 2400, scrollX = 80;
  const order = [];
  const window = { history, scrollTo(options) {
    order.push(history.scrollRestoration);
    assert.equal(options.behavior, 'instant');
    scrollY = options.top; scrollX = options.left;
  } };
  vm.runInNewContext(bootstrap[1], { window });
  assert.equal(history.scrollRestoration, 'manual');
  assert.deepEqual(order, ['manual']);
  assert.equal(scrollY, 0); assert.equal(scrollX, 0);
  // Startup installs no recurring reset to fight subsequent user scrolling.
  window.scrollTo({ top: 800, left: 0, behavior: 'instant' });
  assert.equal(scrollY, 800);
});

test('startup still scrolls to top without the restoration API', () => {
  let called = false;
  vm.runInNewContext(bootstrap[1], { window: { history: {}, scrollTo({top,left}) {
    called = true; assert.equal(top, 0); assert.equal(left, 0);
  } } });
  assert.equal(called, true);
});
