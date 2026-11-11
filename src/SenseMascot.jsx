import React, { useId } from 'react';
import './assistant-mascot.css';

// Separate vector parts make expressions and gestures possible at any size.
export default function SenseMascot({ pose = 'idle', animated = false }) {
  const id = useId().replaceAll(':', '');
  const paint = name => `url(#${id}-${name})`;
  return <svg className="sense-character" data-pose={pose} data-animated={animated} viewBox="0 0 200 220" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id={`${id}-coral`} cx="32%" cy="22%" r="85%"><stop stopColor="#ff997d"/><stop offset=".5" stopColor="#ff6d6b"/><stop offset="1" stopColor="#e74768"/></radialGradient>
      <radialGradient id={`${id}-cream`} cx="35%" cy="25%" r="80%"><stop stopColor="#fff4d9"/><stop offset="1" stopColor="#f4cfaa"/></radialGradient>
      <linearGradient id={`${id}-eye`} x2=".3" y2="1"><stop stopColor="#593b3b"/><stop offset="1" stopColor="#30262e"/></linearGradient>
    </defs>
    <ellipse className="pet-shadow" cx="101" cy="208" rx="53" ry="5" fill="#51352e" opacity=".16"/>
    <g className="pet-body">
      <g className="pet-tail"><path d="M145 162C184 176 190 137 174 134C161 131 166 150 157 148" fill="none" stroke="#ee5c70" strokeWidth="18" strokeLinecap="round"/></g>
      <g className="pet-foot pet-foot-left"><ellipse cx="76" cy="196" rx="23" ry="11" fill={paint('coral')}/><path d="M64 200h16" stroke="#ec506a" strokeWidth="2" strokeLinecap="round"/></g>
      <g className="pet-foot pet-foot-right"><ellipse cx="127" cy="196" rx="23" ry="11" fill={paint('coral')}/><path d="M122 200h15" stroke="#ec506a" strokeWidth="2" strokeLinecap="round"/></g>
      <ellipse className="pet-torso" cx="101" cy="154" rx="52" ry="46" fill={paint('coral')}/>
      <ellipse cx="101" cy="162" rx="31" ry="28" fill={paint('cream')}/>
      <g className="pet-head">
        <g className="pet-ear pet-ear-left"><ellipse cx="52" cy="45" rx="24" ry="28" transform="rotate(-25 52 45)" fill={paint('coral')}/><ellipse cx="52" cy="45" rx="12" ry="16" transform="rotate(-25 52 45)" fill={paint('cream')}/></g>
        <g className="pet-ear pet-ear-right"><ellipse cx="147" cy="42" rx="23" ry="27" transform="rotate(25 147 42)" fill={paint('coral')}/><ellipse cx="147" cy="42" rx="11" ry="15" transform="rotate(25 147 42)" fill={paint('cream')}/></g>
        <path d="M30 93C29 49 65 35 100 37C142 32 173 56 173 96C176 130 145 146 101 145C58 147 26 131 30 93Z" fill={paint('coral')}/>
        <path d="M47 72C56 55 72 49 88 48" fill="none" stroke="#ffc1a1" strokeWidth="4" opacity=".35" strokeLinecap="round"/>
        <ellipse cx="51" cy="115" rx="12" ry="6" fill="#f54d70" opacity=".3"/><ellipse cx="149" cy="115" rx="12" ry="6" fill="#f54d70" opacity=".3"/>
        <g className="pet-eyes">
          <g className="pet-eye pet-eye-left"><ellipse cx="72" cy="96" rx="12" ry="18" fill={paint('eye')}/><ellipse cx="68" cy="88" rx="4" ry="6" fill="#fff4dc"/><circle cx="77" cy="104" r="2" fill="#fff4dc"/></g>
          <g className="pet-eye pet-eye-right"><ellipse cx="131" cy="96" rx="12" ry="18" fill={paint('eye')}/><ellipse cx="127" cy="88" rx="4" ry="6" fill="#fff4dc"/><circle cx="136" cy="104" r="2" fill="#fff4dc"/></g>
        </g>
        <g className="pet-sleep-eyes" fill="none" stroke="#63363e" strokeWidth="4" strokeLinecap="round"><path d="M60 99q12 10 24 0M119 99q12 10 24 0"/></g>
        <path className="pet-smile" d="M91 116q10 12 20 0" fill="none" stroke="#733641" strokeWidth="4" strokeLinecap="round"/>
        <ellipse className="pet-yawn" cx="101" cy="119" rx="7" ry="9" fill="#733641"/>
      </g>
      <g className="pet-paw pet-paw-left"><ellipse cx="49" cy="150" rx="14" ry="23" transform="rotate(-27 49 150)" fill={paint('coral')}/></g>
      <g className="pet-paw pet-paw-right"><ellipse cx="153" cy="146" rx="14" ry="23" transform="rotate(30 153 146)" fill={paint('coral')}/></g>
    </g>
    <g className="pet-snooze" fill="#a63e55" fontFamily="sans-serif" fontWeight="700"><text x="161" y="94" fontSize="14">z</text><text x="176" y="76" fontSize="10">z</text></g>
  </svg>;
}
