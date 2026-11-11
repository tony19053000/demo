import { useEffect } from 'react';

// Keep commerce and the complete selectable journey usable before (or without)
// the separate motion download. A late import never touches an unmounted route.
export default function useLandingMotion(root, calm, controller, selectedRef, setSelected) {
  useEffect(()=>{
    let disposed=false;
    let cleanup;
    if(!calm) import('./motionEngine').then(engine=>{
      if(!disposed && root.current) cleanup=engine.setupLandingMotion(root,controller,selectedRef,setSelected);
    }).catch(error=>console.warn('ShopSense motion unavailable; using static presentation.',error));
    return ()=>{disposed=true; cleanup?.(); controller.current=null;};
  },[root,calm,controller,selectedRef,setSelected]);
}
