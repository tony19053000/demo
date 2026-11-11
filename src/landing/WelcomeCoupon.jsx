import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, ArrowUpRight } from 'lucide-react';

export default function WelcomeCoupon() {
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [torn, setTorn] = useState(false);
  const [copyVersion, setCopyVersion] = useState(0);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (!copyVersion) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copyVersion]);
  async function copyCode() {
    try {
      await navigator.clipboard.writeText('SENSE25');
      if (!mounted.current) return;
      setStatus('Coupon code copied.');
      setCopied(true);
      setTorn(true);
      setCopyVersion(value => value + 1);
    } catch {
      if (!mounted.current) return;
      setCopied(false);
      setStatus('Select SENSE25 and copy it to use in your bag.');
    }
  }
  return <section className="welcome-coupon" aria-label="ShopSense coupon">
    <div className={'coupon-body'+(torn?' coupon-body-torn':'')}>
    <div className="coupon-message"><span className="landing-kicker">A LITTLE WELCOME GIFT</span><h2>Nice find.<br/><em>Nicer price.</em></h2></div>
    <div className="coupon-value"><strong>25<span>% off</span></strong><p>Your bag, up to ₹200.</p></div>
    </div>
    <div className={'coupon-stub'+(torn?' coupon-stub-torn':'')}><span className="coupon-corner" aria-hidden="true"/><span className="landing-kicker">YOUR CODE</span><button type="button" className="coupon-copy" onClick={copyCode} aria-label={copied?'Coupon code copied. Copy SENSE25 again':'Copy coupon code SENSE25'}><span>SENSE25</span>{copied?<Check size={17}/>:<Copy size={17}/>}</button><span className="coupon-feedback" role="status">{status}</span>{status.startsWith('Select')&&<span className="coupon-copy-error">{status}</span>}<Link to="/shop">Find your favourite <ArrowUpRight size={16}/></Link></div>
  </section>;
}
