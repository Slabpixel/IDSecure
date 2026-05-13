/**
 * Gov Platform page: scrubbed layer stack (images + copy) via GSAP ScrollTrigger.
 * Requires gsap + ScrollTrigger (loaded before this file in government.region).
 */
(function () {
  'use strict';

  var root = document.querySelector('.gov-platform-layers');
  if (!root || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var images = gsap.utils.toArray(root.querySelectorAll('.gov-platform-layers-image'));
  var items = gsap.utils.toArray(root.querySelectorAll('.gov-platform-layers-content-item'));
  if (!images.length || !items.length) {
    return;
  }

  /* Pin only the diagram block (.gov-platform-layers); title scrolls away first */
  var mm = gsap.matchMedia();

  function killTriggersForPinTarget() {
    ScrollTrigger.getAll().forEach(function (st) {
      if (st.trigger === root) {
        st.kill();
      }
    });
  }

  function fallbackStaticStack() {
    killTriggersForPinTarget();
    gsap.killTweensOf(images);
    gsap.killTweensOf(items);
    gsap.set(images, {
      autoAlpha: function (i) {
        return i === images.length - 1 ? 1 : 0;
      },
    });
    gsap.set(items, { autoAlpha: 1 });
  }

  mm.add('(prefers-reduced-motion: reduce)', function () {
    fallbackStaticStack();
    return function () {};
  });

  mm.add('(max-width: 768px)', function () {
    fallbackStaticStack();
    return function () {};
  });

  mm.add(
    '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
    function () {
      gsap.set(images, {
        autoAlpha: function (i) {
          return i === 0 ? 1 : 0;
        },
      });
      gsap.set(items, {
        autoAlpha: function (i) {
          return i === 0 ? 1 : 0;
        },
      });

      /* Long scroll distance = more wheel/trackpad travel while pinned, so the next section doesn’t rush in mid-scrub */
      var scrollDistance = function () {
        return Math.round(window.innerHeight * 4);
      };

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: function () {
            return '+=' + scrollDistance();
          },
          pin: root,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      var steps = images.length;
      var step;
      for (step = 1; step < steps; step++) {
        var t = step - 1;
        tl.to(
          images[step - 1],
          { autoAlpha: 0, duration: 0.5, ease: 'none' },
          t
        ).to(
          images[step],
          { autoAlpha: 1, duration: 0.5, ease: 'none' },
          t
        );
        items.forEach(function (item, j) {
          tl.to(
            item,
            {
              autoAlpha: j === step ? 1 : 0,
              duration: 0.2,
              ease: 'none',
            },
            t
          );
        });
      }

      var onResize = debounce(function () {
        ScrollTrigger.refresh();
      }, 200);
      window.addEventListener('resize', onResize);

      requestAnimationFrame(function () {
        ScrollTrigger.refresh();
      });

      return function () {
        window.removeEventListener('resize', onResize);
        if (tl.scrollTrigger) {
          tl.scrollTrigger.kill();
        }
        tl.kill();
        gsap.killTweensOf(images);
        gsap.killTweensOf(items);
      };
    }
  );

  function debounce(fn, ms) {
    var id;
    return function () {
      clearTimeout(id);
      id = setTimeout(fn, ms);
    };
  }
})();
