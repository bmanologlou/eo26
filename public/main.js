// EO site scripts — runs on first load and after every View Transition

// ---- Lenis smooth scroll (init once, persists across View Transitions) ----
(function(){
  if (window.__lenisStarted) return;
  window.__lenisStarted = true;

  // respect reduced-motion preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const s = document.createElement('script');
  s.src = 'https://unpkg.com/lenis@1.1.14/dist/lenis.min.js';
  s.onload = function(){
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t)=>Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    window.__lenis = lenis;
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // reset scroll cleanly on View Transition navigation
    document.addEventListener('astro:after-swap', ()=>{ lenis.scrollTo(0, { immediate: true }); });
  };
  document.head.appendChild(s);
})();

function initEO(){
// preloader: reveal once fonts + page are ready
  (function(){
    function reveal(){ document.body.classList.add('loaded'); }
    const fontReady = document.fonts ? document.fonts.ready : Promise.resolve();
    let done = false;
    const finish = ()=>{ if(!done){ done = true; reveal(); } };
    fontReady.then(()=>setTimeout(finish, 120));
    window.addEventListener('load', ()=>setTimeout(finish, 400));
    // safety fallback so it never hangs
    setTimeout(finish, 2500);
  })();

  // hero word rotator: type in, fade out to white (word stays, no jump), settles on Imagine
  (function(){
    const el = document.getElementById('rotator');
    if(!el) return;
    const words = ['Think','Create','Build','Lead','Imagine'];
    const typeSpeed = 95, holdTime = 1200, fadeTime = 350;
    let wi = 0;

    function typeIn(word, done){
      let ci = 0;
      // set first char while still white, then reveal color
      el.textContent = word.slice(0, 1);
      el.classList.remove('fade-out');
      ci = 1;
      (function step(){
        el.textContent = word.slice(0, ci);
        if(ci < word.length){ ci++; setTimeout(step, typeSpeed); }
        else if(done){ done(); }
      })();
    }

    function cycle(){
      if(wi >= words.length - 1) return;   // stop on Imagine
      setTimeout(()=>{
        el.classList.add('fade-out');        // fade current to white, stays in place
        setTimeout(()=>{
          wi++;
          typeIn(words[wi], ()=>{
            cycle();
          });
        }, fadeTime);
      }, holdTime);
    }

    el.textContent = words[0];   // Think already written
    cycle();
  })();

  // scroll reveal
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((e,i)=>{
      if(e.isIntersecting){
        const el = e.target;
        // small natural stagger for groups
        setTimeout(()=>el.classList.add('in'), (el.dataset.delay?+el.dataset.delay:0));
        io.unobserve(el);
      }
    });
  },{threshold:.15});
  document.querySelectorAll('.scroll-reveal').forEach((el,i)=>{
    el.dataset.delay = (i % 5) * 70;
    io.observe(el);
  });

  // shrink logo to EO after scroll
  let scrolled=false;
  window.addEventListener('scroll', ()=>{
    const past = window.scrollY > window.innerHeight * 0.6;
    if(past !== scrolled){
      scrolled = past;
      document.body.classList.toggle('scrolled', scrolled);
    }
  }, {passive:true});

  // burger / mobile menu
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  if(burger){
    burger.addEventListener('click', ()=>{
      document.body.classList.toggle('menu-open');
    });
    mobileMenu.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>document.body.classList.remove('menu-open'));
    });
  }

  // POV keyword hover -> explanation panel (desktop only)
  if(window.matchMedia('(min-width:721px)').matches){
    document.querySelectorAll('.pov-text .kw').forEach(kw=>{
      const target = document.getElementById(kw.dataset.panel);
      if(!target) return;
      kw.addEventListener('mouseenter', ()=>target.classList.add('show'));
      kw.addEventListener('mouseleave', ()=>target.classList.remove('show'));
    });
  }

  // showcase video: play when in view, pause when out, click to pause/resume
  const reel = document.getElementById('showreel');
  if(reel){
    let manuallyPaused = false;
    let inView = false;

    const vio = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        inView = e.isIntersecting;
        if(inView){
          if(!manuallyPaused) reel.play().catch(()=>{});
        } else {
          reel.pause();
        }
      });
    },{threshold:.4});
    vio.observe(reel);

    // click on video toggles pause/resume
    reel.addEventListener('click', ()=>{
      if(reel.paused){
        manuallyPaused = false;
        reel.play().catch(()=>{});
      } else {
        manuallyPaused = true;
        reel.pause();
      }
    });

    // sound toggle
    const toggle = document.getElementById('soundToggle');
    const iconMuted = document.getElementById('iconMuted');
    const iconSound = document.getElementById('iconSound');
    toggle.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      reel.muted = !reel.muted;
      iconMuted.style.display = reel.muted ? 'block' : 'none';
      iconSound.style.display = reel.muted ? 'none' : 'block';
      if(!reel.muted && inView){ manuallyPaused = false; reel.play().catch(()=>{}); }
    });
  }

}
if (document.readyState !== 'loading') { initEO(); }
document.addEventListener('astro:page-load', initEO);
