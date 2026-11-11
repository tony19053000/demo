import {useEffect,useRef} from 'react';
export default function useOverlay(open,onClose,{modal=false}={}){
 const ref=useRef(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{if(!open)return;const previous=document.activeElement;const panel=ref.current;const focusable=()=>[...(panel?.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select,[tabindex="0"]')||[])].filter(el=>el.getClientRects().length);
 const initial=panel?.querySelector('[data-initial-focus], input:not(:disabled)')||focusable()[0];initial?.focus({preventScroll:true});
 const key=e=>{if(e.key==='Escape'){e.preventDefault();close.current();}if(modal&&e.key==='Tab'){const nodes=focusable(),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};
 const overflow=document.body.style.overflow;if(modal)document.body.style.overflow='hidden';document.addEventListener('keydown',key);
 return()=>{document.removeEventListener('keydown',key);if(modal)document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true})};},[open,modal]);return ref;
}
