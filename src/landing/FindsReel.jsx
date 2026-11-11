import React, { useEffect, useRef, useState } from 'react';
import { products } from '../data/catalog';
import { imageFor } from './edits';
import { findsColumns, findsViews, maxReelPosition, clampView, reelPosition, reelOffset } from './findsReelData.js';
import { startReelAutoplay } from './reelAutoplay.js';

export default function FindsReel({ ProductCard, reduced }) {
  const track = useRef(null);
  const current = useRef(0);
  const gesture = useRef(null);
  const dragged = useRef(false);
  const [position, setPosition] = useState(0);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 700px)').matches);
  const [dragging, setDragging] = useState(false);
  const firstVisible = Math.floor(position);
  const lastVisible = Math.ceil(position) + (mobile ? 0 : 1);

  useEffect(() => {
    if (reduced) return;
    return startReelAutoplay(track.current);
  }, [reduced, mobile]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 700px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const move = (value, instant = false) => {
    const el = track.current;
    const next = clampView(value);
    current.current = next;
    setPosition(next);
    el.scrollTo({ left: reelOffset(next, el.scrollWidth - el.clientWidth), behavior: instant || reduced ? 'instant' : 'smooth' });
  };

  useEffect(() => {
    const el = track.current;
    gesture.current = null;
    setDragging(false);
    // Preserve the exact fractional position, including a partly revealed card.
    const restore = () => {
      const next = current.current;
      el.scrollTo({ left: reelOffset(next, el.scrollWidth - el.clientWidth), behavior: 'instant' });
      current.current = next;
      setPosition(next);
    };
    restore();
    const observer = new ResizeObserver(restore);
    observer.observe(el);
    return () => observer.disconnect();
  }, [mobile]);

  const finishDrag = event => {
    const drag = gesture.current;
    if (!drag) return;
    gesture.current = null;
    setDragging(false);
    const el = track.current;
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
  };

  const column = (data, index) => <div className={'finds-column finds-column-'+data.kind+(data.tone ? ' finds-tone-'+data.tone : '')} key={index}>
    {data.ids.map((id, item) => {
      const p = products.find(product => product.id === id);
      return <div className={'finds-slot finds-slot-'+(data.kind === 'feature' ? 0 : item + 1)} key={id}>
        <ProductCard p={p} showcase={data.kind === 'feature' ? 'feature' : 'compact'} image={imageFor(p)}/>
      </div>;
    })}
  </div>;

  return <div className="finds-reel">
    <div ref={track} className={'finds-reel-track'+(mobile?' finds-reel-mobile':'')+(dragging?' is-dragging':'')} tabIndex={0}
      role="region" aria-roledescription="carousel" aria-label="Good finds, three collections"
      onScroll={event => {
        const el = event.currentTarget;
        const next = reelPosition(el.scrollLeft, el.scrollWidth - el.clientWidth);
        current.current = next;
        setPosition(next);
      }}
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        const next = { ArrowRight: current.current + .1, ArrowLeft: current.current - .1, Home: 0, End: maxReelPosition }[event.key];
        if (next !== undefined) { event.preventDefault(); move(next); }
      }}
      onDragStart={event => event.preventDefault()}
      onPointerDown={event => {
        dragged.current = false;
        if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button')) return;
        gesture.current = { x: event.clientX, left: event.currentTarget.scrollLeft };
      }}
      onPointerMove={event => {
        const drag = gesture.current;
        if (!drag) return;
        const delta = event.clientX - drag.x;
        if (Math.abs(delta) > 6 && !dragged.current) {
          dragged.current = true;
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }
        if (dragged.current) { event.preventDefault(); event.currentTarget.scrollLeft = drag.left - delta; }
      }}
      onPointerUp={finishDrag} onPointerCancel={finishDrag}
      onPointerLeave={event => { if (!dragged.current) gesture.current = null; }}
      onClickCapture={event => {
        if (dragged.current) { event.preventDefault(); event.stopPropagation(); dragged.current = false; }
      }}>
      {mobile ? findsViews.map((pair, index) => <div className="finds-mobile-view" key={index} inert={index < firstVisible || index > lastVisible} aria-hidden={index < firstVisible || index > lastVisible}>
        {pair.map(column)}
      </div>) : findsColumns.map((data, index) => <div className="finds-reel-panel" key={index} inert={index < firstVisible || index > lastVisible} aria-hidden={index < firstVisible || index > lastVisible}>
        {column(data, index)}
      </div>)}
    </div>
    <input className="finds-reel-slider" type="range" min="0" max={maxReelPosition} step="any" value={position}
      aria-label="Browse Good finds collections" aria-valuetext={Math.round(position / maxReelPosition * 100)+'% through collections'}
      onKeyDown={event => {
        const next = { ArrowRight: current.current + .1, ArrowUp: current.current + .1, ArrowLeft: current.current - .1, ArrowDown: current.current - .1, Home: 0, End: maxReelPosition }[event.key];
        if (next !== undefined) { event.preventDefault(); move(next, true); }
      }}
      onChange={event => move(event.target.value, true)}/>
  </div>;
}
