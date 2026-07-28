/**
 * Operating model blocks: one active bg at a time, switches on hover.
 */
(function () {
  'use strict';

  var wrap = document.querySelector('.ent-block_wrap');
  if (!wrap) {
    return;
  }

  var items = wrap.querySelectorAll('.ent-block_item');
  if (!items.length) {
    return;
  }

  function setActive(item) {
    items.forEach(function (el) {
      el.classList.toggle('is-active', el === item);
    });
  }

  items.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      setActive(item);
    });
  });
})();
