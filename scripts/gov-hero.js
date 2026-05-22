/**
 * Government hero: load intro (text, then bg fade) + scroll parallax on .gov-hero-bg media.
 * Requires gsap + ScrollTrigger (government.region).
 */
(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var section = document.querySelector('.gov-section.hero');
  if (!section) {
    return;
  }

  var bg = section.querySelector('.gov-hero-bg');
  var media = bg && bg.querySelector('video, img');
  if (!bg || !media) {
    return;
  }

  var main = section.querySelector('.gov-hero-content-main');
  var eyebrow = main && main.querySelector('.gov-eyebrow');
  var title = main && main.querySelector('.gov-hero-title');
  var btnEls = main
    ? gsap.utils.toArray(main.querySelectorAll('.gov-hero-button-wrapper a'))
    : [];
  var desc = section.querySelector('.gov-hero-content-description');

  var introEls = [eyebrow, title].filter(Boolean).concat(btnEls);
  if (desc) {
    introEls.push(desc);
  }

  var mm = gsap.matchMedia();
  var parallaxTween = null;

  function killParallax() {
    if (parallaxTween) {
      if (parallaxTween.scrollTrigger) {
        parallaxTween.scrollTrigger.kill();
      }
      parallaxTween.kill();
      parallaxTween = null;
    }
    gsap.killTweensOf(media);
    gsap.set(media, { clearProps: 'transform' });
  }

  function setupParallax() {
    killParallax();
    parallaxTween = gsap.fromTo(
      media,
      { yPercent: -10 },
      {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      }
    );
  }

  mm.add('(prefers-reduced-motion: reduce)', function () {
    gsap.set(bg, { opacity: 1 });
    gsap.set(introEls, { autoAlpha: 1, y: 0 });
    section.classList.add('gov-hero-ready');
    return function () {};
  });

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    gsap.set(bg, { opacity: 0 });
    gsap.set(introEls, { autoAlpha: 0, y: 28 });

    var loadTl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: function () {
        section.classList.add('gov-hero-ready');
      },
    });

    if (eyebrow) {
      loadTl.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.45 });
    }
    if (title) {
      loadTl.to(title, { autoAlpha: 1, y: 0, duration: 0.55 }, eyebrow ? '-=0.35' : 0);
    }
    if (btnEls.length) {
      loadTl.to(
        btnEls,
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 },
        '-=0.4'
      );
    }
    if (desc) {
      loadTl.to(desc, { autoAlpha: 1, y: 0, duration: 0.45 }, '-=0.25');
    }

    loadTl.to(
      bg,
      { opacity: 1, duration: 1.5, ease: 'power2.out' },
      '-=0.25'
    );

    var parallaxMm = gsap.matchMedia();

    parallaxMm.add('(min-width: 769px)', function () {
      setupParallax();
      requestAnimationFrame(function () {
        ScrollTrigger.refresh();
      });
      return function () {
        killParallax();
      };
    });

    requestAnimationFrame(function () {
      ScrollTrigger.refresh();
    });

    return function () {
      loadTl.kill();
      parallaxMm.revert();
      gsap.killTweensOf(bg);
      gsap.killTweensOf(introEls);
    };
  });

  function debounce(fn, ms) {
    var id;
    return function () {
      clearTimeout(id);
      id = setTimeout(fn, ms);
    };
  }

  window.addEventListener(
    'resize',
    debounce(function () {
      ScrollTrigger.refresh();
    }, 200)
  );
})();
