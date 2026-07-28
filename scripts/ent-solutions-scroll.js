/**
 * Enterprise solutions: pinned section with clip-path image/copy reveals + nav sync.
 */
(function () {
  "use strict";

  var root = document.querySelector(".ent-solutions");
  if (
    !root ||
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined"
  ) {
    return;
  }

  var mediaItems = gsap.utils.toArray(
    root.querySelectorAll(".ent-solutions_media-item"),
  );
  var copyItems = gsap.utils.toArray(
    root.querySelectorAll(".ent-solutions_copy-item"),
  );
  var navItems = gsap.utils.toArray(
    root.querySelectorAll(".ent-solution_navigation-item"),
  );
  var count = mediaItems.length;

  if (!count || copyItems.length !== count || !navItems.length) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  var timeline = null;
  var hiddenClip = "inset(0% 100% 0% 0%)";
  var visibleClip = "inset(0% 0% 0% 0%)";
  var stepDuration = 0.4;
  var stepSpacing = 0.5;

  mediaItems.forEach(function (item, index) {
    item.style.zIndex = String(index + 1);
  });

  copyItems.forEach(function (item, index) {
    item.style.zIndex = String(index + 1);
  });

  function setActiveNav(index) {
    var activeIndex = Math.max(0, Math.min(index, navItems.length - 1));

    navItems.forEach(function (item, i) {
      item.classList.toggle("is-active", i === activeIndex);
    });
  }

  function setStaticState(index) {
    var activeIndex = Math.max(0, Math.min(index, count - 1));

    mediaItems.forEach(function (item, i) {
      item.style.clipPath = i <= activeIndex ? visibleClip : hiddenClip;
    });

    copyItems.forEach(function (item, i) {
      item.style.clipPath = i === activeIndex ? visibleClip : hiddenClip;
    });

    setActiveNav(activeIndex);
  }

  function killTimeline() {
    if (timeline) {
      if (timeline.scrollTrigger) {
        timeline.scrollTrigger.kill();
      }
      timeline.kill();
      timeline = null;
    }

    gsap.killTweensOf(mediaItems);
    gsap.killTweensOf(copyItems);
  }

  function getScrollDistance() {
    return Math.round(window.innerHeight * 1.5);
  }

  mm.add("(prefers-reduced-motion: reduce)", function () {
    killTimeline();
    setStaticState(0);
    return function () {};
  });

  mm.add(
    "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
    function () {
      gsap.set(mediaItems, {
        clipPath: function (i) {
          return i === 0 ? visibleClip : hiddenClip;
        },
      });

      gsap.set(copyItems, {
        clipPath: function (i) {
          return i === 0 ? visibleClip : hiddenClip;
        },
      });

      setActiveNav(0);

      timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: function () {
            return "+=" + getScrollDistance();
          },
          pin: root,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            var index = Math.min(count - 1, Math.floor(self.progress * count));
            setActiveNav(index);
          },
        },
      });

      var step;
      for (step = 1; step < count; step++) {
        var position = (step - 1) * stepSpacing;

        timeline.to(
          mediaItems[step],
          {
            clipPath: visibleClip,
            duration: stepDuration,
            ease: "none",
          },
          position,
        );

        timeline.to(
          copyItems[step - 1],
          {
            clipPath: hiddenClip,
            duration: stepDuration,
            ease: "none",
          },
          position,
        );

        timeline.to(
          copyItems[step],
          {
            clipPath: visibleClip,
            duration: stepDuration,
            ease: "none",
          },
          position,
        );
      }

      navItems.forEach(function (item, index) {
        item.addEventListener("click", function (event) {
          event.preventDefault();
          var st = timeline && timeline.scrollTrigger;
          if (!st || count <= 1) {
            return;
          }

          var progress = index / (count - 1);
          var scrollPos = st.start + progress * (st.end - st.start);
          st.scroll(scrollPos);
        });
      });

      var onResize = debounce(function () {
        ScrollTrigger.refresh();
      }, 200);

      window.addEventListener("resize", onResize);

      requestAnimationFrame(function () {
        ScrollTrigger.refresh();
      });

      return function () {
        window.removeEventListener("resize", onResize);
        killTimeline();
      };
    },
  );

  mm.add(
    "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
    function () {
      killTimeline();
      setStaticState(0);
      return function () {};
    },
  );

  function debounce(fn, ms) {
    var id;
    return function () {
      clearTimeout(id);
      id = setTimeout(fn, ms);
    };
  }
})();
