import React,{useState,useRef,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {Check,MapPin,CreditCard,Smartphone,Wallet} from 'lucide-react';
import {blankAddress,readPreferences,savePreferences} from './accountPreferences.js';
import {totals,money} from './shop.js';
import './checkout.css';

const fields=[['name','Full name'],['phone','Mobile number'],['pin','PIN code'],['city','City'],['street','Street address']];
const methods=[['UPI',Smartphone,'UPI app'],['Card',CreditCard,'Credit or debit card'],['Cash on delivery',Wallet,'Pay when delivered']];

export default function CheckoutFlow({items,shop,coupon,Summary}){
 const {profile,setOrders,setBag}=shop;
 const [prefs,setPrefs]=useState(()=>readPreferences(profile?.id));
 const [selected,setSelected]=useState(prefs.addresses[0]?.id||'');
 const [editing,setEditing]=useState(!prefs.addresses.length);
 const [draft,setDraft]=useState({...blankAddress,name:profile?.name||''});
 const [save,setSave]=useState(!!profile);
 const [address,setAddress]=useState(null);
 const [method,setMethod]=useState(prefs.payment==='No preference'?'UPI':prefs.payment);
 const [step,setStep]=useState('address'),[error,setError]=useState('');
 const title=useRef(),submitted=useRef(false),first=useRef(true);
 const t=totals(items,coupon);
 useEffect(()=>{if(first.current){first.current=false;return;}title.current?.focus();},[step]);
 function proceed(e){
   e.preventDefault();setError('');
   let next=editing?{...draft}:prefs.addresses.find(a=>a.id===selected);
   if(!next){setError('Select or add a delivery address.');return;}
   if(editing){
     next={...next,name:next.name.trim(),street:next.street.trim(),city:next.city.trim()};
     if(!next.name||!next.street||!next.city){setError('Complete your delivery address.');return;}
     if(profile&&save){
       next.id=crypto.randomUUID();
       try {const saved=savePreferences(profile.id,{addresses:[...readPreferences(profile.id).addresses,next]});setPrefs(saved);setSelected(next.id);setEditing(false);}
       catch{setError('Could not save the address. Try again or untick Save to my addresses.');return;}
     }
   }
   setAddress(next);setStep('payment');
 }
 function confirm(){
   if(submitted.current)return;
   submitted.current=true;
   setOrders(previous=>[{id:'SS-'+crypto.randomUUID().slice(0,8),owner:profile?.id||null,date:new Date().toLocaleDateString('en-IN'),items,total:t.total,payment:method},...previous]);
   setBag([]);setStep('done');
 }
 if(step==='done')return <div className="checkout-page checkout-flow"><div className="checkout-success"><Check size={36}/><h1 ref={title} tabIndex={-1}>Order preview saved.</h1><p>No payment was collected or delivery arranged.</p><Link className="primary" to="/account?section=orders">View orders</Link></div></div>;
 if(!items.length)return <div className="empty"><h1>Your bag is empty</h1><Link className="primary" to="/shop">Explore products</Link></div>;
 return <div className="checkout-page checkout-flow">
   <nav className="checkout-progress" aria-label="Checkout progress"><Link to="/bag">Bag</Link><span>—</span><button aria-current={step==='address'?'step':undefined} onClick={()=>setStep('address')}>Address</button><span>—</span><span aria-current={step==='payment'?'step':undefined}>Payment</span></nav>
   <div className="bag-layout"><section className="checkout-content">
     <h1 tabIndex={-1} ref={title}>{step==='address'?'Choose your address':'Choose payment'}</h1>
     {step==='address'?<form onSubmit={proceed}>
       {prefs.addresses.length>0&&<fieldset className="address-choices"><legend>Saved addresses</legend>{prefs.addresses.map((a,i)=><label className="address-choice" key={a.id}>
         <input type="radio" name="address" checked={!editing&&selected===a.id} onChange={()=>{setSelected(a.id);setEditing(false)}}/>
         <span><strong>{a.name}</strong>{i===0&&<small>Default</small>}<span>{a.street}, {a.city} — {a.pin}</span><span>{a.phone}</span></span>
       </label>)}</fieldset>}
       {!editing&&<button type="button" className="outline" onClick={()=>{setDraft({...blankAddress,name:profile?.name||''});setEditing(true)}}>Add a new address</button>}
       {editing&&<div className="checkout-address-fields">{fields.map(([key,label])=><label key={key}>{label}<input required value={draft[key]} maxLength={key==='phone'?10:key==='pin'?6:160} pattern={key==='phone'?'[6-9][0-9]{9}':key==='pin'?'[1-9][0-9]{5}':undefined} inputMode={['phone','pin'].includes(key)?'numeric':'text'} onChange={e=>setDraft({...draft,[key]:e.target.value})}/></label>)}
         {profile?<label className="save-address"><input type="checkbox" checked={save} onChange={e=>setSave(e.target.checked)}/>Save to my addresses</label>:<Link to="/account?section=addresses">Sign in to use saved addresses</Link>}
       </div>}
       {error&&<p role="alert" className="error">{error}</p>}
       <button className="primary full checkout-next">Continue to payment</button>
     </form>:<>
       <div className="delivery-choice"><MapPin size={18}/><div><b>Deliver to {address.name}</b><p>{address.street}, {address.city} — {address.pin}</p></div><button onClick={()=>setStep('address')}>Change</button></div>
       <fieldset className="payment-choices"><legend>Payment method</legend>{methods.map(([value,Icon,description])=><label key={value}><input type="radio" name="payment" checked={method===value} onChange={()=>setMethod(value)}/><Icon size={20}/><span><strong>{value}</strong><small>{description}</small></span></label>)}</fieldset>
       <div className="payment-demo"><b>{method} · Demo checkout</b><p>This saves your selected method with an order preview. No payment details are required and no money is charged.</p></div>
       <button className="primary full" onClick={confirm}>Confirm demo order · {money(t.total)}</button>
     </>}
   </section><aside className="bag-summary"><Summary t={t} count={items.length}/><div className="checkout-items">{items.map(item=><Link key={item.id+item.size} to={'/product/'+item.id}><img src={item.image} alt=""/><span>{item.title}<small>{item.size?'Size '+item.size+' · ':''}Qty {item.qty}</small></span></Link>)}</div></aside></div>
 </div>;
}
