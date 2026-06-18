/**
 * Lenis smooth scroll + GSAP ScrollTrigger sync (government layout only).
 * Requires lenis.min.js, gsap, and ScrollTrigger (government.region).
 */
(function () {
  "use strict";

  if (
    typeof Lenis === "undefined" ||
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined"
  ) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var lenis = new Lenis({
    anchors: true,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
})();
