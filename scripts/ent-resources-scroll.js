/**
 * Enterprise resources: pinned section + horizontal list scrub (ScrollTrigger).
 * Syncs .ent-resources_progress-fill with scroll position.
 */
(function () {
  "use strict";

  var section = document.querySelector(".ent-resources-section");
  if (
    !section ||
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined"
  ) {
    return;
  }

  var root = section.querySelector(".ent-resources");
  var viewport = section.querySelector(".ent-resources_viewport");
  var list = section.querySelector(".ent-resources_list");
  var progressBar = section.querySelector(".ent-resources_progress");
  var progressFill = section.querySelector(".ent-resources_progress-fill");

  if (!root || !viewport || !list || !progressBar || !progressFill) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  var scrollTween = null;
  var mobileViewportHandler = null;

  function getScrollDistance() {
    return Math.max(0, list.scrollWidth - viewport.clientWidth);
  }

  function setProgress(progress) {
    var value = Math.max(0, Math.min(1, progress));
    progressFill.style.width = value * 100 + "%";
    progressBar.setAttribute("aria-valuenow", String(Math.round(value * 100)));
  }

  function getProgressFromScrollLeft() {
    var distance = getScrollDistance();
    if (distance <= 0) {
      return 0;
    }
    return viewport.scrollLeft / distance;
  }

  function killDesktop() {
    if (scrollTween) {
      if (scrollTween.scrollTrigger) {
        scrollTween.scrollTrigger.kill();
      }
      scrollTween.kill();
      scrollTween = null;
    }

    gsap.set(list, { clearProps: "transform" });
  }

  function killMobile() {
    if (mobileViewportHandler) {
      viewport.removeEventListener("scroll", mobileViewportHandler);
      mobileViewportHandler = null;
    }
  }

  function onMobileViewportScroll() {
    setProgress(getProgressFromScrollLeft());
  }

  mm.add("(prefers-reduced-motion: reduce)", function () {
    killDesktop();
    killMobile();
    setProgress(0);
    return function () {};
  });

  mm.add(
    "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
    function () {
      killMobile();

      scrollTween = gsap.to(list, {
        x: function () {
          return -getScrollDistance();
        },
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 32px",
          end: function () {
            return "+=" + getScrollDistance();
          },
          pin: section,
          pinSpacing: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            setProgress(self.progress);
          },
        },
      });

      var onResize = debounce(function () {
        ScrollTrigger.refresh();
      }, 200);
      window.addEventListener("resize", onResize);

      requestAnimationFrame(function () {
        ScrollTrigger.refresh();
        setProgress(0);
      });

      return function () {
        window.removeEventListener("resize", onResize);
        killDesktop();
      };
    },
  );

  mm.add(
    "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
    function () {
      killDesktop();

      mobileViewportHandler = onMobileViewportScroll;
      viewport.addEventListener("scroll", mobileViewportHandler, {
        passive: true,
      });
      onMobileViewportScroll();

      return function () {
        killMobile();
      };
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
