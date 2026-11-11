import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { categories } from '../data/catalog';
import FindsReel from './FindsReel.jsx';
import WelcomeCoupon from './WelcomeCoupon.jsx';
import { chapters, journeyProducts, imageFor } from './edits';
import useLandingMotion from './useLandingMotion';
import './landing.css';

function labelClearanceByRow(poses) {
  const rows = new Map();
  for (const [, row, scale, angle] of poses) {
    const radians = angle * Math.PI / 180;
    const halfHeight = scale * (Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians))) / 2;
    rows.set(row, Math.max(rows.get(row) ?? 0, halfHeight));
  }
  return rows;
}

const exploreChapter = chapters.at(-1);
// Each row shares a label baseline below its tallest rotated image box.
const desktopClearance = labelClearanceByRow(exploreChapter.pose);
const mobileClearance = labelClearanceByRow(exploreChapter.mobile);
const ribbonPhrases = [
  { lead: 'Everyday', accent: 'essentials.', treatment: 'bold' },
  { lead: 'Personal', accent: 'favourites.', treatment: 'outline' },
  { lead: 'Style', accent: 'your way.', treatment: 'slant' },
  { lead: 'Comforts', accent: 'of home.', treatment: 'serif' },
  { lead: 'For work', accent: 'and play.', treatment: 'contrast' },
  { lead: 'All in', accent: 'one place.', treatment: 'signature' },
];

function ProductJourney({ selected, choose, controlsHidden }) {
  const chapter = chapters[selected];
  return <section className="product-journey" data-chapter={selected} aria-label="Discover your ShopSense world">
    <div className="journey-topline"><span>A WORLD OF GOOD FINDS</span><Link to="/shop">Shop everything <ArrowUpRight size={15}/></Link></div>
    <div className="journey-scene">
      <div className="journey-atmosphere" aria-hidden="true"><div className="journey-portal"/><div className="journey-orbit"/><span className="journey-spark">✳</span></div>
      <div className="journey-backwords" aria-hidden="true">{chapters.slice(0,3).map((c,i)=><span key={c.word} className={'backword backword-'+i}>{c.word}</span>)}</div>
      <div className="journey-copies">{chapters.map((c,i)=><div key={c.label} className={'journey-copy copy-'+i} aria-hidden={selected!==i} inert={selected!==i}>
        <span className="landing-kicker">{c.kicker}</span>
        {i===0?<h1>{c.title}{' '}<br/><em>{c.accent}</em></h1>:<h2>{c.title}{' '}<br/><em>{c.accent}</em></h2>}
        {i===0?<><p>Your soundtrack. Your everyday tech.</p><Link className="landing-button" to="/shop">Explore ShopSense <ArrowUpRight size={19}/></Link></>:i<3?<div className="chapter-shop-links">{c.groups.map(id=><Link key={id} to={'/shop?category='+id}>{categories.find(c=>c.id===id).name}<ArrowUpRight size={15}/></Link>)}</div>:null}
      </div>)}</div>
      <div className="journey-products">{journeyProducts.map(({product:p,category:c,artwork},i)=>{
        const vars = Object.fromEntries(chapters.flatMap((ch,j)=>['x','y','s','r'].flatMap((key,k)=>[[`--${key}${j}`,ch.pose[i][k]],[`--m${key}${j}`,ch.mobile[i][k]]])));
        const pose=chapter.pose[i];
        const visible=selected===3 || (pose[0]>0 && pose[0]<100 && pose[1]>0 && pose[1]<100);
        return <div key={p.id} className={'journey-actor actor-'+i} style={vars} aria-hidden={!visible} inert={!visible}>
          <div className="actor-entry"><div className="actor-pointer"><Link className="actor-product" to={selected===3?'/shop?category='+c.id:artwork?.to||'/product/'+p.id} aria-label={selected===3?'Shop '+c.name:artwork?.label||'Discover '+p.title}><img src={artwork?.image||imageFor(p)} alt={artwork?.alt||p.title} width="800" height="800" fetchPriority={i===0?'high':undefined} draggable="false"/></Link></div></div>
        </div>;
      })}</div>
      <div className="journey-floor" aria-hidden="true"/>
      <div className="journey-department-labels" aria-hidden={selected !== 3} inert={selected !== 3}>
        {journeyProducts.map(({ category }, index) => {
          const [x, row] = exploreChapter.pose[index];
          const [mobileX, mobileRow] = exploreChapter.mobile[index];
          const position = {
            '--dx': x,
            '--dy': row,
            '--mdx': mobileX,
            '--mdy': mobileRow,
            '--label-clearance': desktopClearance.get(row),
            '--mobile-label-clearance': mobileClearance.get(mobileRow),
          };
          return (
            <Link key={category.id} to={'/shop?category=' + category.id} style={position}>
              {category.name}<ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </div>
    <div className="journey-bottom" data-hidden={controlsHidden} inert={controlsHidden} aria-hidden={controlsHidden}>
      <div className="journey-controls" role="group" aria-label="Choose a shopping world">
        {chapters.map((chapter, index) => (
          <button key={chapter.label} type="button" aria-pressed={selected === index} onClick={() => choose(index)}>
            <span>{chapter.label}</span>
            <i aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
    <div className="journey-progress" aria-hidden="true"/>
  </section>;
}

export default function LandingPage({ ProductCard }) {
  const root = useRef(null);
  const controller = useRef(null);
  const [selected,setSelected] = useState(0);
  const [journeyLeaving,setJourneyLeaving] = useState(false);
  const selectedRef=useRef(selected);
  selectedRef.current=selected;
  const [systemReduced,setSystemReduced] = useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setSystemReduced(preference.matches);
    preference.addEventListener('change',update);
    return ()=>preference.removeEventListener('change',update);
  },[]);
  useLandingMotion(root,systemReduced,controller,selectedRef,setSelected);
  useEffect(()=>{
    setJourneyLeaving(false);
    const stage=root.current.querySelector('.product-journey');
    stage.style.removeProperty('--journey-exit-offset');
    if(selected!==chapters.length-1) return;
    const ribbon=root.current.querySelector('.discovery-ribbon');
    const rail=stage.querySelector('.journey-bottom');
    const progressLine=stage.querySelector('.journey-progress');
    let frame=0;
    const update=()=>{
      frame=0;
      const pinnedLayout=!systemReduced && window.matchMedia('(min-width: 1001px) and (min-height: 700px)').matches;
      const stageTop=stage.getBoundingClientRect().top;
      // Billboard visibility alone is insufficient on tall screens. Keep the
      // controls throughout Explore All, until the stage leaves its pin at 82px.
      const leaving=stageTop<(pinnedLayout?81:-1);
      const ribbonTop=ribbon.getBoundingClientRect().top;
      const exiting=leaving && ribbonTop<window.innerHeight;
      setJourneyLeaving(exiting);
      // Translate products, labels and the final heading by the same offset.
      // Replace exactly the lost rail height, then stop; actor poses stay owned
      // by GSAP. Smoothstep makes the short scroll-driven settle gentle at both ends.
      const travel=Math.max(0,rail.offsetHeight-progressLine.offsetHeight);
      const distance=Math.min((pinnedLayout?82:0)-stageTop,window.innerHeight-ribbonTop);
      const fraction=exiting?Math.min(1,Math.max(0,distance/140)):0;
      const eased=fraction*fraction*(3-2*fraction);
      const offset=travel*(systemReduced?(exiting?1:0):eased);
      stage.style.setProperty('--journey-exit-offset',`${offset.toFixed(3)}px`);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    schedule();
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule);
    return ()=>{
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll',schedule);
      window.removeEventListener('resize',schedule);
      stage.style.removeProperty('--journey-exit-offset');
    };
  },[selected,systemReduced]);
  const choose=i=>controller.current?controller.current(i):setSelected(i);
  return <div ref={root} className={'landing-page'+(systemReduced?' motion-calm':'')}>
    <ProductJourney selected={selected} choose={choose} controlsHidden={selected===chapters.length-1 && journeyLeaving}/>
    <section className="discovery-ribbon" aria-label="ShopSense at a glance" tabIndex={0}>
      <div className="ribbon-track">
        {[0, 1].map(copy => (
          <div className="ribbon-copy" key={copy} aria-hidden={copy === 1 ? true : undefined}>
            {ribbonPhrases.map(phrase => (
              <span className={'ribbon-phrase ribbon-'+phrase.treatment} key={phrase.lead}>
                <span className="ribbon-lead">{phrase.lead}</span>{' '}<em>{phrase.accent}</em>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
    <section className="editorial-collections" id="shop-the-edits" aria-label="Shop the edits">
      <Link to="/shop?category=fashion" className="editorial-card fashion-editorial"><img className="editorial-image" src="/editorial/fashion.jpg" alt="Personal style and layered fashion" loading="lazy" width="900" height="700"/><div><span className="landing-kicker">THE STYLE EDIT</span><h2>Wear it<br/><em>your way.</em></h2><span className="editorial-link">Explore fashion <ArrowUpRight size={22}/></span></div></Link>
      <Link to="/shop?category=home" className="editorial-card home-editorial"><img className="editorial-image" src="/editorial/home.jpg" alt="A warm, thoughtfully styled living space" loading="lazy" width="900" height="700"/><div><span className="landing-kicker">THE HOME EDIT</span><h2>Room to<br/><em>be you.</em></h2><span className="editorial-link">Explore home <ArrowUpRight size={22}/></span></div></Link>
    </section>
    <section className="landing-trending" aria-labelledby="good-finds-title">
      <div className="landing-section-heading"><div><span className="landing-kicker">THE SHORTLIST</span><h2 id="good-finds-title">Good <em>finds.</em></h2></div><Link className="text-arrow" to="/shop">Explore all <ArrowUpRight size={18}/></Link></div>
      <FindsReel ProductCard={ProductCard} reduced={systemReduced}/>
    </section>
    <WelcomeCoupon/>
  </div>;
}

