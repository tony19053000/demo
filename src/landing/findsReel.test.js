import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import React from 'react';
import { transformSync } from 'esbuild';
import { products } from '../data/catalog.js';
import { findsColumns, findsViews, maxReelPosition, clampView, reelPosition, reelOffset } from './findsReelData.js';

test('three complete sets contain twelve unique products with shared transitions', () => {
  assert.deepEqual(findsViews.map(view=>view.map(column=>column.kind)), [
    ['feature','stack'], ['stack','feature'], ['feature','stack'], ['stack','feature'], ['feature','stack'],
  ]);
  assert.equal(findsViews[0][1], findsViews[1][0]);
  assert.equal(findsViews[1][1], findsViews[2][0]);
  assert.deepEqual(findsViews[0].flatMap(column=>column.ids), [90,103,45,173]);
  assert.equal(new Set(findsColumns.flatMap(column=>column.ids)).size, 12);
  assert.equal(findsColumns.filter(column=>column.kind==='feature').length,3);
  assert.equal(findsColumns.filter(column=>column.kind==='stack').length,3);
  for(let i=0;i<findsViews.length-1;i++) assert.equal(findsViews[i][1],findsViews[i+1][0]);
  assert.deepEqual(findsViews[4].flatMap(column=>column.ids),[174,93,4,143]);
  for (const column of findsColumns) {
    assert.equal(column.ids.length, column.kind==='feature'?1:3);
    for (const id of column.ids) {
      const p = products.find(product=>product.id===id);
      assert.ok(p, `product route ${id} exists`);
      assert.ok(existsSync(new URL('../../public'+(p.images[1]||p.image), import.meta.url)));
    }
  }
});

test('reel positions preserve the middle view across desktop and phone widths', () => {
  for (const max of [345,690,1224,1464]) {
    for (const view of [0,.137,.5,.863,1,1.427,2,3.21,4]) assert.ok(Math.abs(reelPosition(reelOffset(view,max),max)-view)<1e-12);
    assert.equal(reelOffset(2,max),max/2);
  }
});

test('continuous slider follows fractional input, release does not snap, resize preserves position', () => {
  // Execute the real component handlers with a small DOM/hook harness. Layout
  // and browser pointer hit testing still require visual QA.
  const originalWindow = globalThis.window;
  const originalObserver = globalThis.ResizeObserver;
  const effects = [];
  let onResize, disconnected = false, removed = false;
  globalThis.window = { matchMedia: () => ({ matches:false, addEventListener(){}, removeEventListener(){removed=true;} }) };
  globalThis.ResizeObserver = class {
    constructor(callback){onResize=callback;}
    observe(){}
    disconnect(){disconnected=true;}
  };
  try {
    const source = readFileSync(new URL('./FindsReel.jsx',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace('export default function','function');
    const code = transformSync(source,{loader:'jsx',format:'cjs'}).code;
    const factory = new Function('React','useEffect','useRef','useState','products','imageFor','findsColumns','findsViews','maxReelPosition','clampView','reelPosition','reelOffset','startReelAutoplay',code+';return FindsReel;');
    const Component = factory(React,fn=>effects.push(fn),value=>({current:value}),value=>[typeof value==='function'?value():value,()=>{}],products,p=>p.images[1]||p.image,findsColumns,findsViews,maxReelPosition,clampView,reelPosition,reelOffset,()=>()=>{});
    const [track,slider] = Component({ProductCard:()=>null,reduced:false}).props.children;
    let captured=false;
    const calls=[];
    const el={scrollLeft:0,scrollWidth:2000,clientWidth:1000,scrollTo(options){calls.push(options);this.scrollLeft=options.left;},setPointerCapture(){captured=true;},hasPointerCapture(){return captured;},releasePointerCapture(){captured=false;}};
    track.props.ref.current=el;
    const cleanups=effects.map(fn=>fn());
    assert.equal(slider.props.step,'any');
    assert.equal(slider.props.max,4);
    assert.equal(track.props.children.length,6);
    slider.props.onChange({target:{value:'.74'}});
    assert.equal(el.scrollLeft,185);
    assert.equal(calls.at(-1).behavior,'instant');
    let prevented=0;
    const event={pointerType:'mouse',button:0,pointerId:1,clientX:500,currentTarget:el,target:{closest:()=>null},preventDefault(){prevented++;},stopPropagation(){}};
    track.props.onPointerDown(event);
    track.props.onPointerMove({...event,clientX:498});
    assert.equal(el.scrollLeft,185);
    track.props.onPointerMove({...event,clientX:463});
    assert.equal(el.scrollLeft,222);
    assert.equal(captured,true);
    track.props.onScroll({currentTarget:el});
    const count=calls.length;
    track.props.onPointerUp(event);
    assert.equal(captured,false);
    assert.equal(calls.length,count,'release must not scroll to a preset');
    assert.equal(el.scrollLeft,222);
    track.props.onClickCapture(event);
    assert.equal(prevented,2,'drag click is suppressed');
    el.scrollWidth=3000;
    onResize();
    assert.equal(el.scrollLeft,444,'same fractional position after resize');
    slider.props.onKeyDown({key:'End',preventDefault(){}});
    assert.equal(el.scrollLeft,2000,'keyboard reaches the final complete set');
    for(const cleanup of cleanups) cleanup();
    assert.equal(disconnected,true);
    assert.equal(removed,true);
  } finally {
    globalThis.window=originalWindow;
    globalThis.ResizeObserver=originalObserver;
  }
});

test('reel clamps endpoint gestures and handles an unmeasured viewport', () => {
  assert.equal(reelPosition(-45,1000),0);
  assert.equal(reelPosition(1200,1000),4);
  assert.equal(reelPosition(50,0),0);
  assert.equal(reelOffset(-1,1000),0);
  assert.equal(reelOffset(5,1000),1000);
  assert.equal(reelOffset(1,-5),0);
});
