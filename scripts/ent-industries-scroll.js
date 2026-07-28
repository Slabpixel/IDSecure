/**
 * Enterprise industries: pinned horizontal scroll + cursor-following circle link.
 */
(function () {
  'use strict';

  var section = document.querySelector('.ent-industries-section');
  if (!section || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  var viewport = section.querySelector('.ent-industries_viewport');
  var list = section.querySelector('.ent-industries_wrap');
  var cursor = section.querySelector('.ent-industries_cursor');
  var cursorScale = cursor && cursor.querySelector('.ent-industries_cursor-scale');
  var items = gsap.utils.toArray(section.querySelectorAll('.ent-industries_item'));

  if (!viewport || !list || !cursor || !cursorScale || !items.length) {
    return;
  }

  document.body.appendChild(cursor);

  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  var scrollTween = null;
  var cursorQuickX = null;
  var cursorQuickY = null;
  var hoveredItem = null;
  var viewportMoveHandler = null;
  var cursorVisible = false;

  var scaleInEase = 'elastic.out(1, 0.45)';
  var scaleOutEase = 'power2.inOut';

  function getScrollDistance() {
    return Math.max(0, list.scrollWidth - viewport.clientWidth);
  }

  function setPinActive(isActive) {
    section.classList.toggle('is-pin-active', isActive);
  }

  function killDesktopScroll() {
    if (scrollTween) {
      if (scrollTween.scrollTrigger) {
        scrollTween.scrollTrigger.kill();
      }
      scrollTween.kill();
      scrollTween = null;
    }

    gsap.set(list, { clearProps: 'transform' });
    setPinActive(false);
  }

  function showCursorScale() {
    gsap.killTweensOf(cursorScale);
    gsap.set(cursor, { visibility: 'visible' });
    cursor.setAttribute('aria-hidden', 'false');

    gsap.fromTo(
      cursorScale,
      { scale: 0 },
      {
        scale: 1,
        duration: 0.55,
        ease: scaleInEase,
        overwrite: true,
      }
    );
  }

  function hideCursorScale() {
    gsap.killTweensOf(cursorScale);

    gsap.to(cursorScale, {
      scale: 0,
      duration: 0.3,
      ease: scaleOutEase,
      overwrite: true,
      onComplete: function () {
        gsap.set(cursor, { visibility: 'hidden' });
        cursor.setAttribute('aria-hidden', 'true');
      },
    });
  }

  function clearHover() {
    if (!cursorVisible) {
      return;
    }

    cursorVisible = false;

    if (hoveredItem) {
      hoveredItem.classList.remove('is-hovered');
      hoveredItem = null;
    }

    hideCursorScale();
  }

  function setHover(item) {
    var href = item.getAttribute('data-href');
    if (!href) {
      return;
    }

    if (hoveredItem && hoveredItem !== item) {
      hoveredItem.classList.remove('is-hovered');
    }

    hoveredItem = item;
    item.classList.add('is-hovered');
    cursor.href = href;

    if (!cursorVisible) {
      cursorVisible = true;
      showCursorScale();
    }
  }

  function killCursorFollow() {
    cursorVisible = false;
    gsap.killTweensOf(cursorScale);

    if (hoveredItem) {
      hoveredItem.classList.remove('is-hovered');
      hoveredItem = null;
    }

    gsap.set(cursorScale, { scale: 0 });
    gsap.set(cursor, { visibility: 'hidden' });
    cursor.setAttribute('aria-hidden', 'true');

    if (viewportMoveHandler) {
      viewport.removeEventListener('mousemove', viewportMoveHandler);
      viewport.removeEventListener('mouseleave', clearHover);
      viewportMoveHandler = null;
    }

    items.forEach(function (item) {
      if (item._entIndustriesClick) {
        item.removeEventListener('click', item._entIndustriesClick);
        delete item._entIndustriesClick;
      }
    });

    cursorQuickX = null;
    cursorQuickY = null;
  }

  function initCursorFollow() {
    killCursorFollow();

    gsap.set(cursor, { xPercent: -50, yPercent: -50, visibility: 'hidden', force3D: true });
    gsap.set(cursorScale, { scale: 0, transformOrigin: '50% 50%' });

    cursorQuickX = gsap.quickTo(cursor, 'x', { duration: 0.16, ease: 'power3.out' });
    cursorQuickY = gsap.quickTo(cursor, 'y', { duration: 0.16, ease: 'power3.out' });

    viewportMoveHandler = function (event) {
      cursorQuickX(event.clientX);
      cursorQuickY(event.clientY);

      var target = document.elementFromPoint(event.clientX, event.clientY);
      var item = target && target.closest('.ent-industries_item');

      if (item && viewport.contains(item)) {
        setHover(item);
        return;
      }

      clearHover();
    };

    viewport.addEventListener('mousemove', viewportMoveHandler);
    viewport.addEventListener('mouseleave', clearHover);

    items.forEach(function (item) {
      var onClick = function () {
        var href = item.getAttribute('data-href');
        if (href) {
          window.location.href = href;
        }
      };

      item._entIndustriesClick = onClick;
      item.addEventListener('click', onClick);
    });
  }

  mm.add('(prefers-reduced-motion: reduce)', function () {
    killDesktopScroll();
    killCursorFollow();
    return function () {};
  });

  mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', function () {
    initCursorFollow();

    scrollTween = gsap.to(list, {
      x: function () {
        return -getScrollDistance();
      },
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: function () {
          return '+=' + getScrollDistance();
        },
        pin: section,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        id: 'ent-industries-pin',
        onEnter: function () {
          setPinActive(true);
        },
        onEnterBack: function () {
          setPinActive(true);
        },
        onLeave: function () {
          setPinActive(false);
          clearHover();
        },
        onLeaveBack: function () {
          setPinActive(false);
          clearHover();
        },
        onKill: function () {
          setPinActive(false);
          clearHover();
        },
      },
    });

    var onResize = debounce(function () {
      ScrollTrigger.refresh();
    }, 200);

    window.addEventListener('resize', onResize);

    requestAnimationFrame(function () {
      ScrollTrigger.refresh();
    });

    return function () {
      window.removeEventListener('resize', onResize);
      killDesktopScroll();
      killCursorFollow();
    };
  });

  mm.add('(max-width: 768px) and (prefers-reduced-motion: no-preference)', function () {
    killDesktopScroll();
    killCursorFollow();
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
