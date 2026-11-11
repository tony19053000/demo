import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import './auth.css';
import AuthOrbit from './AuthOrbit.jsx';

export default function AuthPage({mode,profile,onAuthenticate}) {
  const registering=mode==='register';
  const navigate=useNavigate();
  const returnState=useLocation().state;
  const section=new URLSearchParams(returnState?.accountSearch).get('section');
  const destination=section ? '/account?section='+encodeURIComponent(section) : '/account';
  const [show,setShow]=useState(false);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  if(profile) return <Navigate to={destination} replace/>;
  async function submit(event) {
    event.preventDefault();
    if(busy) return;
    const form=event.currentTarget;
    const data=Object.fromEntries(new FormData(form));
    setError('');
    if(registering && data.password!==data.confirm) {setError('Your passwords do not match.');form.elements.confirm.focus();return;}
    setBusy(true);
    try {await onAuthenticate(mode,data);form.reset();navigate(destination,{replace:true});}
    catch(e){setError(e.message||'Unable to continue. Check that browser storage is enabled.');}
    finally {setBusy(false);}
  }
  return <section className="auth-page">
    <div className="auth-story"><span className="auth-eyebrow">YOUR SHOPSENSE</span><h1>{registering?'A little more':'Good to have'}<br/><em>{registering?'you.':'you back.'}</em></h1><p>Your favourites. Your next find.</p><AuthOrbit/><Link to="/shop">Keep exploring <ArrowRight size={17}/></Link></div>
    <div className="auth-form-panel"><div className="auth-switch"><Link state={returnState} to="/login" aria-current={!registering?'page':undefined}>Log in</Link><Link state={returnState} to="/register" aria-current={registering?'page':undefined}>Create account</Link></div>
      <h2>{registering?'Make yourself at home.':'Welcome back.'}</h2>
      <p className="auth-demo-note">Browser-only demo. Use a demo password, not one you use elsewhere.</p>
      <form onSubmit={submit}>
        {registering&&<label>Your name<input name="name" autoComplete="name" required maxLength={40} placeholder="Your name" disabled={busy}/></label>}
        <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" disabled={busy}/></label>
        <label>Password<span className="auth-password"><input name="password" type={show?'text':'password'} autoComplete={registering?'new-password':'current-password'} required minLength={registering?8:undefined} maxLength={128} placeholder={registering?'At least 8 characters':'Your password'} disabled={busy}/><button type="button" aria-label={show?'Hide password':'Show password'} aria-pressed={show} onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>
        {registering&&<label>Confirm password<input name="confirm" type={show?'text':'password'} autoComplete="new-password" required maxLength={128} disabled={busy}/></label>}
        {error&&<p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" disabled={busy}>{busy?'Please wait…':registering?'Create account':'Log in'}<ArrowRight size={17}/></button>
      </form>
      <p className="auth-local-note">Accounts stay in this browser. Your bag and wishlist are shared on this device. No email verification or password recovery.</p>
    </div>
  </section>;
}
