import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import SenseMascot from './SenseMascot';
import { createPetBehavior } from './petBehavior';

export default function SenseLauncher({ open, onToggle }) {
  const [pose, setPose] = useState('idle');
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(() => !document.hidden);
  const behavior = useRef(null);
  const attention = useRef({ pointer: false, focus: false });
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    const visibility = () => setVisible(!document.hidden);
    media.addEventListener('change', change);
    document.addEventListener('visibilitychange', visibility);
    return () => { media.removeEventListener('change', change); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    setPose('idle');
    if (open || reduced || !visible) return;
    const pet = createPetBehavior(setPose);
    behavior.current = pet;
    pet.engage(attention.current.pointer || attention.current.focus);
    return () => { pet.destroy(); behavior.current = null; };
  }, [open, reduced, visible]);
  const attend = (kind, value) => {
    attention.current[kind] = value;
    behavior.current?.engage(attention.current.pointer || attention.current.focus);
  };
  return <button className="chat-launch sense-launch" aria-expanded={open} aria-controls={open ? 'sense-chat' : undefined} aria-label={open ? 'Close shopping assistant' : 'Open shopping assistant'}
    onClick={onToggle} onPointerEnter={e => { if (e.pointerType !== 'touch') attend('pointer', true); }} onPointerLeave={() => attend('pointer', false)}
    onFocus={e => attend('focus', e.currentTarget.matches(':focus-visible'))} onBlur={() => attend('focus', false)}>
    {open ? <X aria-hidden="true"/> : <><SenseMascot pose={pose} animated={!reduced && visible}/><span className="sense-pet-tooltip" aria-hidden="true">Ask Sense</span></>}
  </button>;
}
