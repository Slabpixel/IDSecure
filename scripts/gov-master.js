/**
 * Master hub cards: play video on hover, pause when not hovered.
 */
(function () {
  'use strict';

  var yearEl = document.querySelector('.gov-copyright-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  var cards = document.querySelectorAll('.gov-master-card');
  if (!cards.length) {
    return;
  }

  function playVideo(video) {
    if (!video) return;
    var p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () {});
    }
  }

  function pauseVideo(video, rewind) {
    if (!video) return;
    video.pause();
    if (rewind) {
      video.currentTime = 0;
    }
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cards.forEach(function (card) {
      pauseVideo(card.querySelector('video'), false);
    });
    return;
  }

  var hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)');

  cards.forEach(function (card) {
    var video = card.querySelector('video');
    if (!video) return;

    pauseVideo(video, false);

    if (!hoverMq.matches) {
      playVideo(video);
      return;
    }

    card.addEventListener('mouseenter', function () {
      playVideo(video);
    });

    card.addEventListener('mouseleave', function () {
      pauseVideo(video, true);
    });
  });
})();
