import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { chapters } from './edits';

gsap.registerPlugin(ScrollTrigger);
const stops=[0,1.92,3.84,5.76];
const transitionDuration=1.7;
const journeyDuration=5.98;
const poseVars=pose=>({'--x':pose[0],'--y':pose[1],'--s':pose[2],'--r':pose[3]});
const actorVars=pose=>({...poseVars(pose),opacity:pose[0]>0&&pose[0]<100&&pose[1]>0&&pose[1]<100?1:0});

export function setupLandingMotion(root, controller, selectedRef, setSelected) {
  const media=gsap.matchMedia();
  media.add({motion:'(prefers-reduced-motion: no-preference)',desktop:'(min-width: 1001px) and (min-height: 700px)',mobile:'(max-width: 600px)',pointer:'(hover: hover) and (pointer: fine)'},context=>{
    if(!context.conditions.motion) return;
    const el=root.current;
    const q=gsap.utils.selector(el);
    const stage=q('.product-journey')[0];
    const actors=q('.journey-actor');
    const productArea=q('.journey-products')[0];
    // Desktop movement writes a single compositor transform instead of four
    // inherited custom properties per actor per frame. Measure only on init /
    // refresh; explicit from/to poses keep resize and reverse-scroll stable.
    const desktopPose=pose=>({
      x:()=>productArea.clientWidth*pose[0]/100,
      y:()=>productArea.clientHeight*pose[1]/100,
      xPercent:-50,yPercent:-50,scale:pose[2],rotation:pose[3],force3D:true,
      opacity:pose[0]>0&&pose[0]<100&&pose[1]>0&&pose[1]<100?1:0,
    });
    const copies=q('.journey-copy');
    const words=q('.backword');
    const portal=q('.journey-portal');
    const orbit=q('.journey-orbit');
    const floor=q('.journey-floor');
    const labels=q('.journey-department-labels');
    const poseKey=context.conditions.mobile?'mobile':'pose';
    const current=selectedRef.current;
    let last=current;
    let transition;
    const announce=index=>{if(index!==last){last=index;setSelected(index);}};
    actors.forEach((actor,i)=>gsap.set(actor,actorVars(chapters[current][poseKey][i])));
    gsap.set(copies,{autoAlpha:0}); gsap.set(copies[current],{autoAlpha:1});
    gsap.set(words,{autoAlpha:0}); if(current<3)gsap.set(words[current],{autoAlpha:1});
    gsap.set(stage,{backgroundColor:chapters[current].tone,'--glow':chapters[current].glow});
    gsap.set(labels,{autoAlpha:current===3?1:0});
    gsap.set(portal,{opacity:current===3?.15:.8});
    gsap.set(floor,{opacity:current===3?0:1});

    // Entrance owns inner wrappers; scene transforms remain exclusively owned
    // by the journey timeline, and pointer motion owns a third wrapper.
    const intro=gsap.timeline({defaults:{ease:'power3.out'}});
    intro.from(q('.journey-topline'),{y:12,opacity:0,duration:.65})
      .from(q('.journey-copies'),{y:25,duration:1},.1)
      .from(q('.actor-entry'),{scale:.76,y:75,opacity:0,rotate:8,duration:1.25,stagger:.04},.15)
      .from(q('.journey-controls'),{y:20,opacity:0,duration:.8},.5);

    let journey;
    if(context.conditions.desktop){
      // A shared stage, not independent section reveals. Every object has a
      // continuous path, including the final docking into department positions.
      journey=gsap.timeline({defaults:{ease:'sine.inOut'},scrollTrigger:{trigger:stage,start:'top top+=82',end:()=>'+='+Math.round(window.innerHeight*3.4),pin:true,scrub:1.2,anticipatePin:1,invalidateOnRefresh:true},onUpdate(){
        const t=this.time(); announce(t>=4.81?3:t>=2.89?2:t>=.97?1:0);
      }});
      // Explicit starts prevent CSS fallback state or reverse scrolling from
      // changing the timeline's captured starting geometry.
      actors.forEach((actor,i)=>journey.set(actor,desktopPose(chapters[0].pose[i]),0));
      gsap.set(copies,{autoAlpha:0});gsap.set(copies[0],{autoAlpha:1});
      gsap.set(words,{autoAlpha:0});gsap.set(words[0],{autoAlpha:1});
      gsap.set(stage,{backgroundColor:chapters[0].tone,'--glow':chapters[0].glow});
      gsap.set(portal,{opacity:.8});gsap.set(floor,{opacity:1});gsap.set(labels,{autoAlpha:0});
      for(let j=1;j<chapters.length;j++){
        const start=stops[j]-1.8;
        const chapter=chapters[j];
        actors.forEach((actor,i)=>journey.fromTo(actor,desktopPose(chapters[j-1].pose[i]),{...desktopPose(chapter.pose[i]),duration:transitionDuration,immediateRender:false},start));
        journey.to(stage,{backgroundColor:chapter.tone,'--glow':chapter.glow,duration:transitionDuration},start)
          .to(copies[j-1],{y:-28,autoAlpha:0,duration:.65},start+.18)
          .fromTo(copies[j],{y:32,autoAlpha:0},{y:0,autoAlpha:1,duration:.7},start+.9)
          .to(words[j-1],{xPercent:-12,autoAlpha:0,duration:.9},start)
          .to(portal,{scale:j===3?1.8:j===2?1.04:1.12,rotation:j*35,opacity:j===3?.15:.8,duration:transitionDuration},start)
          .to(orbit,{rotation:-28+j*65,scale:j===3?1.45:1,opacity:j===3?.15:1,duration:transitionDuration},start)
          .to(floor,{scaleX:j===1?1.3:1,opacity:j===3?0:1,duration:transitionDuration},start);
        if(j<3)journey.fromTo(words[j],{xPercent:12,autoAlpha:0},{xPercent:0,autoAlpha:1,duration:1},start+.6);
        else journey.to(labels,{autoAlpha:1,duration:.45},start+1.25);
      }
      journey.to(q('.journey-progress'),{scaleX:1,ease:'none',duration:journeyDuration},0);
      // Build the complete timeline before measuring it, then render its actual
      // starting scroll position immediately rather than scrubbing from stale state.
      journey.scrollTrigger.refresh();
      journey.scrollTrigger.getTween()?.progress(1);
      journey.progress(journey.scrollTrigger.progress);
      context.add('choose',index=>{
        const trigger=journey.scrollTrigger;
        window.scrollTo({top:trigger.start+(stops[index]/journey.duration())*(trigger.end-trigger.start)+(index===0?0:1),behavior:'smooth'});
      });
      controller.current=context.choose;
    }else{
      context.add('choose',index=>{
        transition?.kill();
        announce(index);
        const chapter=chapters[index];
        transition=gsap.timeline({defaults:{ease:'power3.inOut',duration:.9}});
        actors.forEach((actor,i)=>transition.to(actor,actorVars(chapter[poseKey][i]),0));
        transition.to(stage,{backgroundColor:chapter.tone,'--glow':chapter.glow},0)
          .to(copies,{autoAlpha:0,y:-15,duration:.2},0)
          .fromTo(copies[index],{autoAlpha:0,y:25},{autoAlpha:1,y:0,duration:.5},.25)
          .to(words,{autoAlpha:0,duration:.25},0)
          .to(portal,{rotation:index*35,scale:index===3?1.2:1,opacity:index===3?.15:.8},0)
          .to(orbit,{rotation:-28+index*55,opacity:index===3?.15:1},0)
          .to(floor,{opacity:index===3?0:1},0)
          .to(labels,{autoAlpha:index===3?1:0,duration:.25},index===3?.65:0)
          .to(q('.journey-progress'),{scaleX:index/3},0);
        if(index<3)transition.to(words[index],{autoAlpha:1,duration:.5},.25);
      });
      controller.current=context.choose;
    }

    // Photo panels open like a pair of shutters; the products have just docked
    // above them. Content is fully visible if motion is unavailable or disabled.
    const editorial=q('.editorial-collections')[0];
    gsap.from(q('.editorial-card'),{clipPath:'inset(16% 0% 16% 0% round 90px)',y:35,duration:1,ease:'power2.out',scrollTrigger:{trigger:editorial,start:'top 90%',end:'top 25%',scrub:.5}});

    // One shared entrance, with independent image hover transforms. The media
    // context reverts this tween and its trigger on unmount or reduced motion.
    gsap.from(q('.finds-reel'),{y:24,clipPath:'inset(6% 0 0 0 round 8px)',duration:.7,ease:'power2.out',scrollTrigger:{trigger:q('.finds-reel')[0],start:'top 88%',once:true}});

    const surface=q('.journey-scene')[0];
    let move,leave;
    if(context.conditions.pointer){
      const layers=q('.actor-pointer');
      const xs=layers.map((layer,i)=>gsap.quickTo(layer,'x',{duration:.8,ease:'power3.out'}));
      const ys=layers.map(layer=>gsap.quickTo(layer,'y',{duration:.8,ease:'power3.out'}));
      move=e=>{const b=surface.getBoundingClientRect();const x=(e.clientX-b.left)/b.width-.5;const y=(e.clientY-b.top)/b.height-.5;xs.forEach((fn,i)=>fn(x*(i%2?18:28)));ys.forEach((fn,i)=>fn(y*(i%2?14:22)));};
      leave=()=>{xs.forEach(fn=>fn(0));ys.forEach(fn=>fn(0));};
      surface.addEventListener('pointermove',move,{passive:true});surface.addEventListener('pointerleave',leave);
    }
    let mounted=true;
    document.fonts?.ready.then(()=>{if(mounted)ScrollTrigger.refresh();});
    return ()=>{
      mounted=false;controller.current=null;
      if(move){surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerleave',leave);}
      transition?.kill();
      // Nested timeline startAt tweens can restore their initial desktop
      // transform on revert. Release every scene-owned property so mobile and
      // reduced-motion CSS can position the same actors after teardown.
      actors.forEach(actor=>['transform','opacity','--x','--y','--s','--r'].forEach(property=>actor.style.removeProperty(property)));
    };
  },root);
  return ()=>{media.revert();controller.current=null;};
}
