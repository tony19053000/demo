import React, {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,ArrowUp,ChevronRight,Tag,X} from 'lucide-react';
import {products} from './data/catalog';
import {assistantReply,money} from './shop';
import useOverlay from './useOverlay';

const suggestions=[
  {label:'Phones under ₹30,000', query:'Phones under 30000', id:121},
  {label:'Beauty picks', query:'Beauty picks', id:8},
];

export default function Chat({close,initialMode}) {
  const [mode,setMode]=useState(initialMode==='help'?'help':'shop');
  const [threads,setThreads]=useState({shop:[],help:[]});
  const [drafts,setDrafts]=useState({shop:'',help:''});
  const messages=threads[mode], input=drafts[mode];
  const setInput=value=>setDrafts(previous=>({...previous,[mode]:value}));
  const panel=useOverlay(true,close);
  const feed=useRef(null), composer=useRef(null);
  useEffect(()=>{
    const list=feed.current;
    if(list) list.scrollTo({top:list.scrollHeight,behavior:'instant'});
  },[messages]);
  function send(value) {
    const text=value.trim();
    if(!text)return;
    const reply=assistantReply(products,text,mode);
    setThreads(previous=>({...previous,[mode]:[...previous[mode],{who:'user',text},reply]}));
    setInput('');
    composer.current?.focus({preventScroll:true});
  }
  return <section ref={panel} className="chat-panel sense-dialog" id="sense-chat" role="dialog" aria-labelledby="sense-title">
    <header><span className="sense-emblem" aria-hidden="true"/><div><b id="sense-title">Sense</b><small>Shopping &amp; support</small></div>
      <button type="button" aria-label="Close chat" onClick={close}><X size={18}/></button></header>
    <div className="sense-modes" role="group" aria-label="Choose an assistant">
      {[['shop','Personal shopper'],['help','Help desk']].map(([key,label])=><button key={key} aria-pressed={mode===key} onClick={()=>setMode(key)}>{label}</button>)}
    </div>
    {messages.length===0 ? <div className="sense-welcome">
      {mode==='shop'?<><h2>What can I help<br/>you <em>find?</em></h2>
      <div className="sense-picks">{suggestions.map(({label,query,id})=><button key={id} onClick={()=>send(query)}>
        <img src={products.find(p=>p.id===id)?.image} alt=""/><span>{label}<ArrowRight size={14}/></span>
      </button>)}</div>
      <div className="sense-shortcuts"><button onClick={()=>send('Offers')}><Tag size={15}/>Offers</button></div></>:<>
        <h2>How can I <em>help?</em></h2>
        <div className="sense-topics">{['Orders & delivery','Returns & refunds','Bag & offers','Account settings'].map(topic=><button key={topic} onClick={()=>send(topic)}>{topic}<ChevronRight size={15}/></button>)}</div>
      </>}
    </div> : <div className="chat-messages" ref={feed} role="log" aria-label="Conversation">
      {messages.map((m,i)=><div key={i} className={'message '+m.who}><p>{m.text}</p>
        {m.action&&<Link className="chat-help-link" to={m.action.to} onClick={close}>{m.action.label}<ArrowRight size={14}/></Link>}
        {m.help&&<Link className="chat-help-link" to="/help" onClick={close}>Shopping help <ArrowRight size={14}/></Link>}
        {m.picks?.map(p=><Link className="chat-product" to={'/product/'+p.id} onClick={close} key={p.id}>
          <img src={p.image} alt=""/><span><b>{p.title}</b><small>{money(p.price)} · {p.rating} ★</small></span><ChevronRight size={16}/>
        </Link>)}</div>)}

    </div>}
    <form onSubmit={e=>{e.preventDefault();send(input)}}><input ref={composer} aria-label="Message Sense" placeholder={mode==='shop'?'Ask about a product…':'Ask a support question…'} value={input} onChange={e=>setInput(e.target.value)}/>
      <button type="submit" disabled={!input.trim()} aria-label="Send message"><ArrowUp size={18}/></button></form>
  </section>;
}
