/**
 * Press list: staggered columns + Coming Soon bookends (desktop only, 1025px+).
 */
(function () {
  'use strict';

  var grid = document.querySelector('.gov-press-grid');
  if (!grid) return;

  var wrap = grid.closest('.gov-press-grid-wrap');
  var template = document.getElementById('gov-press-soon-template');
  var cards = Array.prototype.slice.call(
    grid.querySelectorAll(':scope > .gov-press-card')
  );
  var mqDesktop = window.matchMedia('(min-width: 1025px)');
  var mqMobile = window.matchMedia('(max-width: 768px)');

  var CARD_HEIGHT = 360;
  var CARD_GAP = 16;
  var COL_OFFSET = 180;
  var BASE_WRAP_HEIGHT = 1112;
  var BASE_ITEM_COUNT = 4;

  function createSoonCard() {
    if (template && template.content.firstElementChild) {
      return template.content.firstElementChild.cloneNode(true);
    }

    var card = document.createElement('div');
    card.className =
      'gov-press-card gov-press-card--placeholder gov-press-card--soon';
    card.innerHTML =
      '<div class="gov-press-card-glow" aria-hidden="true"></div>' +
      '<div class="gov-press-card-fingerprint" aria-hidden="true">' +
      '<img src="/assets/fingerprint.svg" alt="" />' +
      '</div>' +
      '<div class="gov-press-card-inner">' +
      '<h2 class="gov-press-card-title">Coming<br>Soon</h2>' +
      '</div>';
    return card;
  }

  function columnStackHeight(cardCount) {
    if (cardCount <= 0) return 0;
    return cardCount * CARD_HEIGHT + (cardCount - 1) * CARD_GAP;
  }

  function calcWrapHeight(itemCount) {
    if (itemCount <= BASE_ITEM_COUNT) {
      return BASE_WRAP_HEIGHT;
    }

    var leftCards = Math.ceil(itemCount / 2) + 2;
    var rightCards = Math.floor(itemCount / 2) + 2;
    var leftHeight = columnStackHeight(leftCards);
    var rightHeight = COL_OFFSET + columnStackHeight(rightCards);

    return Math.max(leftHeight, rightHeight, BASE_WRAP_HEIGHT);
  }

  function setWrapHeight() {
    if (!wrap) return;

    if (!mqDesktop.matches) {
      wrap.style.maxHeight = '';
      return;
    }

    var itemCount = cards.length;

    // Fixed viewport: real cards centered, Coming Soon bookends peek at edges.
    if (itemCount <= BASE_ITEM_COUNT) {
      wrap.style.maxHeight = BASE_WRAP_HEIGHT + 'px';
      return;
    }

    var height = calcWrapHeight(itemCount);
    var left = grid.querySelector('.gov-press-col--left');
    var right = grid.querySelector('.gov-press-col--right');

    if (left && right) {
      height = Math.max(height, left.offsetHeight, right.offsetHeight);
    }

    wrap.style.maxHeight = height + 'px';
  }

  function clearLayout() {
    grid.querySelectorAll('.gov-press-card--soon').forEach(function (el) {
      el.remove();
    });

    var left = grid.querySelector('.gov-press-col--left');
    var right = grid.querySelector('.gov-press-col--right');
    if (left) left.remove();
    if (right) right.remove();

    cards.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  function layout() {
    clearLayout();

    if (mqDesktop.matches) {
      var left = document.createElement('div');
      left.className = 'gov-press-col gov-press-col--left';
      var right = document.createElement('div');
      right.className =
        'gov-press-col gov-press-col--right gov-press-col--offset';
      grid.appendChild(left);
      grid.appendChild(right);

      left.appendChild(createSoonCard());
      cards.forEach(function (card, i) {
        if (i % 2 === 0) left.appendChild(card);
      });
      left.appendChild(createSoonCard());

      right.appendChild(createSoonCard());
      cards.forEach(function (card, i) {
        if (i % 2 === 1) right.appendChild(card);
      });
      right.appendChild(createSoonCard());

      setWrapHeight();
      return;
    }

    setWrapHeight();

    if (mqMobile.matches) {
      return;
    }

    var tabletLeft = document.createElement('div');
    tabletLeft.className = 'gov-press-col gov-press-col--left';
    var tabletRight = document.createElement('div');
    tabletRight.className = 'gov-press-col gov-press-col--right';
    grid.appendChild(tabletLeft);
    grid.appendChild(tabletRight);

    cards.forEach(function (card, i) {
      (i % 2 === 0 ? tabletLeft : tabletRight).appendChild(card);
    });
  }

  layout();

  function onChange() {
    layout();
  }

  if (mqDesktop.addEventListener) {
    mqDesktop.addEventListener('change', onChange);
    mqMobile.addEventListener('change', onChange);
  } else {
    mqDesktop.addListener(onChange);
    mqMobile.addListener(onChange);
  }
})();
