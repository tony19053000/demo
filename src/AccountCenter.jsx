import React, {useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {UserRound, MapPin, CreditCard, KeyRound, Package, Heart, CircleHelp} from 'lucide-react';
import {blankAddress, paymentOptions, readPreferences, savePreferences} from './accountPreferences.js';
import {money} from './shop.js';
import './account.css';

const sections = [
  ['profile','Profile details',UserRound], ['orders','Orders',Package],
  ['addresses','Addresses',MapPin], ['payments','Payments',CreditCard],
  ['security','Password',KeyRound]
];

function AddressBook({addresses, persist}) {
  const [draft,setDraft]=useState(null);
  function save(event) {
    event.preventDefault();
    const item={...draft};
    for(const key of ['name','street','city']) item[key]=item[key].trim();
    if(!item.name || !item.street || !item.city) return;
    const next=item.id ? addresses.map(a=>a.id===item.id?item:a) : [...addresses,{...item,id:crypto.randomUUID()}];
    if(persist({addresses:next})) setDraft(null);
  }
  return <>
    <p>Checkout starts with your default address. Use sample details for this browser demo.</p>
    {addresses.map((a,index)=><div className="address-entry" key={a.id}>
      <strong>{a.name}</strong>{index===0&&<small>Default</small>}
      <p>{a.street}, {a.city} · {a.pin}<br/>{a.phone}</p>
      <div className="account-tools"><button onClick={()=>setDraft({...a})}>Edit</button>
        {index>0&&<button onClick={()=>persist({addresses:[a,...addresses.filter(v=>v.id!==a.id)]})}>Make default</button>}
        <button onClick={()=>{if(persist({addresses:addresses.filter(v=>v.id!==a.id)}) && draft?.id===a.id)setDraft(null)}}>Remove</button></div>
    </div>)}
    {draft ? <form onSubmit={save}>{[['name','Recipient'],['street','Street address'],['city','City'],['pin','PIN code'],['phone','Mobile number']].map(([key,label])=>
      <label key={key}>{label}<input required value={draft[key]} pattern={key==='phone'?'[6-9][0-9]{9}':key==='pin'?'[1-9][0-9]{5}':'.*\\S.*'} maxLength={key==='phone'?10:key==='pin'?6:160} inputMode={['phone','pin'].includes(key)?'numeric':'text'} onChange={e=>setDraft({...draft,[key]:e.target.value})}/></label>)}
      <button className="primary">Save address</button> <button type="button" onClick={()=>setDraft(null)}>Cancel</button></form>:
      <button className="outline" onClick={()=>setDraft({...blankAddress})}>Add address</button>}
  </>;
}

function PasswordForm({auth}) {
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  async function submit(e) {
    e.preventDefault();
    const form=e.currentTarget, data=new FormData(form);
    if(data.get('next')!==data.get('confirm')) {setMessage('New passwords do not match.');return;}
    setBusy(true);
    try {await auth.changePassword(data.get('current'),data.get('next'));form.reset();setMessage('Password updated.');}
    catch(error){setMessage(error.message);} finally {setBusy(false);}
  }
  return <form onSubmit={submit}><p>Change the demo password for this browser.</p>
    {[['current','Current password'],['next','New password'],['confirm','Confirm new password']].map(([key,label])=><label key={key}>{label}<input type="password" required name={key} minLength={key==='current'?1:8} maxLength={128} autoComplete={key==='current'?'current-password':'new-password'}/></label>)}
    <button className="primary" disabled={busy}>Change password</button><p role="status">{message}</p></form>;
}

export default function AccountCenter({profile,setProfile,orders,auth}) {
  const [params]=useSearchParams();
  const [active,title]=sections.find(([key])=>key===params.get('section'))||sections[0];
  const [name,setName]=useState(profile.name);
  const [prefs,setPrefs]=useState(()=>readPreferences(profile.id)),[feedback,setFeedback]=useState('');
  function persist(changes){
    try{setPrefs(savePreferences(profile.id,changes));setFeedback('Saved in this browser.');return true;}
    catch{setFeedback('Could not save changes in this browser.');return false;}
  }
  const history=orders.filter(order=>order.owner===profile.id || !order.owner);
  return <section className="account-page shop-interior account-center">
    <header className="account-heading"><div><h1>My <em>account.</em></h1><p>{profile.name}</p></div><button onClick={()=>setProfile(null)}>Sign out</button></header>
    <div className="account-layout"><nav aria-label="Account sections">{sections.map(([key,label,Icon])=><Link key={key} aria-current={active===key?'page':undefined} to={'/account?section='+key} onClick={()=>setFeedback('')}><Icon size={17}/>{label}</Link>)}<Link to="/wishlist"><Heart size={17}/>Wishlist</Link><Link to="/help"><CircleHelp size={17}/>Help</Link></nav>
    <section key={active} className="account-card"><h2>{title}</h2>
      {active==='profile'&&<form onSubmit={e=>{e.preventDefault();setProfile({...profile,name})}}><label>Name<input required maxLength={40} value={name} onChange={e=>setName(e.target.value)}/></label><label>Login email<input readOnly value={profile.email}/></label><button className="primary">Save changes</button></form>}
      {active==='addresses'&&<AddressBook addresses={prefs.addresses} persist={persist}/>}
      {active==='payments'&&<><p>Choose a preferred method for checkout previews. No payment credentials are stored.</p><label>Preferred method<select value={prefs.payment} onChange={e=>persist({payment:e.target.value})}>{paymentOptions.map(v=><option key={v}>{v}</option>)}</select></label></>}
      {active==='security'&&<PasswordForm auth={auth}/>}
      {active==='orders'&&(history.length?history.map(o=><div className="order" key={o.id}><div><b>{o.id}</b><small>{o.date} · {o.owner?'Order preview':'Device preview'}</small></div><strong>{money(o.total)}</strong><div className="order-images">{o.items.map(i=><Link key={i.id+i.size} to={'/product/'+i.id}><img src={i.image} alt={i.title}/></Link>)}</div><Link to="/help">Order help</Link></div>):<p>Your saved order previews will appear here. <Link to="/shop">Browse products</Link></p>)}
      {['addresses','payments'].includes(active)&&<p role="status">{feedback}</p>}
    </section></div></section>;
}
