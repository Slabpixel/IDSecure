/**
 * How it works: pinned section, is-active steps through items on scroll.
 * Initializes after industries pin so sections do not overlap.
 */
(function () {
  'use strict';

  var section = document.querySelector('.ent-how-section');
  if (!section || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  var items = gsap.utils.toArray(section.querySelectorAll('.ent-how_item'));
  if (!items.length) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  var scrollTrigger = null;

  function setActive(index) {
    var activeIndex = Math.max(0, Math.min(index, items.length - 1));

    items.forEach(function (item, i) {
      item.classList.toggle('is-active', i === activeIndex);
    });
  }

  function getActiveIndex(progress) {
    return Math.min(items.length - 1, Math.floor(progress * items.length));
  }

  function getScrollDistance() {
    return Math.round(window.innerHeight * 1.5);
  }

  function setPinActive(isActive) {
    section.classList.toggle('is-pin-active', isActive);
  }

  function killScrollTrigger() {
    if (scrollTrigger) {
      scrollTrigger.kill();
      scrollTrigger = null;
    }
    setPinActive(false);
  }

  function createScrollTrigger() {
    killScrollTrigger();
    setActive(0);

    scrollTrigger = ScrollTrigger.create({
      id: 'ent-how-pin',
      trigger: section,
      start: 'top top',
      end: function () {
        return '+=' + getScrollDistance();
      },
      pin: section,
      pinSpacing: true,
      scrub: 0.5,
      anticipatePin: 0,
      invalidateOnRefresh: true,
      onUpdate: function (self) {
        setActive(getActiveIndex(self.progress));
      },
      onEnter: function () {
        setPinActive(true);
      },
      onEnterBack: function () {
        setPinActive(true);
      },
      onLeave: function () {
        setPinActive(false);
      },
      onLeaveBack: function () {
        setPinActive(false);
      },
      onKill: function () {
        setPinActive(false);
      },
    });
  }

  mm.add('(prefers-reduced-motion: reduce)', function () {
    killScrollTrigger();
    setActive(0);
    return function () {};
  });

  mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', function () {
    var onResize = debounce(function () {
      ScrollTrigger.refresh();
    }, 200);

    window.addEventListener('resize', onResize);

    requestAnimationFrame(function () {
      ScrollTrigger.refresh();
      createScrollTrigger();
      ScrollTrigger.refresh();
      setActive(0);
    });

    return function () {
      window.removeEventListener('resize', onResize);
      killScrollTrigger();
    };
  });

  mm.add('(max-width: 768px) and (prefers-reduced-motion: no-preference)', function () {
    killScrollTrigger();
    setActive(0);
    return function () {};
  });

  function debounce(fn, ms) {
    var id;
    return function () {
      clearTimeout(id);
      id = setTimeout(fn, ms);
    };
  }
})();
