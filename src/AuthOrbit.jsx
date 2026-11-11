import React, {useEffect, useRef} from 'react';
import {products} from './data/catalog';
import {authProductPose} from './authProductMotion.js';

const picks = [101, 88, 173, 94].map(id => products.find(product => product.id === id));

export default function AuthOrbit() {
  const stage = useRef(null);

  useEffect(() => {
    const element = stage.current;
    const items = [...element.querySelectorAll('.auth-orbit-item')];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, previous = 0, elapsed = 0;
    let visible = false;

    function paint(time) {
      items.forEach((item, index) => {
        const pose = authProductPose(index, time);
        item.style.left = pose[0] + '%';
        item.style.top = pose[1] + '%';
        item.style.transform = 'translate(-50%, -50%) translateZ(' + ((pose[2] - .6) * 90) +
          'px) rotateY(' + ((pose[0] - 50) * -.5) + 'deg) rotate(' + pose[3] +
          'deg) scale(' + pose[2] + ')';
        item.style.opacity = pose[4];
        item.firstElementChild.style.filter = 'drop-shadow(0 15px 9px #302d2b38) blur(' +
          Math.max(0, (.65 - pose[2]) * 2) + 'px)';
        item.style.zIndex = Math.round(pose[2] * 100);
      });
    }

    function tick(now) {
      elapsed += previous ? Math.min(50, now - previous) : 0;
      previous = now;
      paint(elapsed);
      frame = requestAnimationFrame(tick);
    }

    function sync() {
      cancelAnimationFrame(frame);
      previous = 0;
      if (reduced.matches) { elapsed = 0; paint(0); }
      else if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    }

    paint(0);
    const observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; sync();});
    observer.observe(element);
    const resize = new ResizeObserver(() => {
      paint(reduced.matches ? 0 : elapsed);
    });
    resize.observe(element);
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return <div className="auth-product-orbit" ref={stage} aria-hidden="true">
    <div className="auth-orbit-disc"/>
    {picks.map(product => <div className="auth-orbit-item" key={product.id}>
      <img src={product.images[1] || product.image} alt="" draggable="false"/>
    </div>)}
  </div>;
}
