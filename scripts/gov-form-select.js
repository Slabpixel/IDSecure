/**
 * Custom dropdown for Squarespace form block select fields inside .gov-form.
 * Keeps the native <select> for submission; replaces the visible UI only.
 */
(function () {
  'use strict';

  var OPEN_CLASS = 'is-open';
  var ENHANCED_ATTR = 'data-gov-custom-select';
  var syncTimers = new WeakMap();

  function isPlaceholderOption(option) {
    return (
      option.disabled ||
      option.hidden ||
      option.hasAttribute('hidden') ||
      option.value === ''
    );
  }

  function getPlaceholderOption(select) {
    return (
      select.querySelector('option[disabled]') ||
      select.querySelector('option[hidden]') ||
      (select.options[0] && isPlaceholderOption(select.options[0])
        ? select.options[0]
        : null)
    );
  }

  function getPlaceholderText(select) {
    var placeholderOpt = getPlaceholderOption(select);
    return placeholderOpt ? placeholderOpt.textContent.trim() : 'Select';
  }

  function getPlaceholderValue(select) {
    var placeholderOpt = getPlaceholderOption(select);
    return placeholderOpt ? placeholderOpt.value : '';
  }

  function getSelectableOptions(select) {
    var placeholderValue = getPlaceholderValue(select);
    return Array.prototype.filter.call(select.options, function (opt) {
      if (isPlaceholderOption(opt)) return false;
      if (placeholderValue && opt.value === placeholderValue) return false;
      return true;
    });
  }

  function getSelectHost(select) {
    return select ? select.parentElement : null;
  }

  function getNativeSelect(custom) {
    var host = custom.parentElement;
    return host ? host.querySelector('select') : null;
  }

  function setNativeSelectValue(select, value) {
    var descriptor = Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype,
      'value'
    );

    if (descriptor && descriptor.set) {
      descriptor.set.call(select, value);
    } else {
      select.value = value;
    }

    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function concealNativeSelect(select) {
    if (!select) return;

    select.setAttribute(ENHANCED_ATTR, 'true');
    select.classList.add('gov-custom-select__native');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
  }

  function concealHostExtras(host, select) {
    if (!host) return;

    Array.prototype.forEach.call(host.children, function (child) {
      if (child === select) return;
      if (child.classList && child.classList.contains('gov-custom-select')) return;

      if (
        child.classList &&
        child.classList.contains('form-input-effects')
      ) {
        child.style.display = 'none';
        return;
      }

      if (child.querySelector && child.querySelector('svg')) {
        child.style.display = 'none';
      }
    });
  }

  function closeSelect(root) {
    root.classList.remove(OPEN_CLASS);
    var trigger = root.querySelector('.gov-custom-select__trigger');
    var list = root.querySelector('.gov-custom-select__list');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (list) list.hidden = true;
  }

  function closeAll(except) {
    document
      .querySelectorAll('.gov-custom-select.' + OPEN_CLASS)
      .forEach(function (el) {
        if (el !== except) closeSelect(el);
      });
  }

  function openSelect(root) {
    closeAll(root);
    root.classList.add(OPEN_CLASS);
    var trigger = root.querySelector('.gov-custom-select__trigger');
    var list = root.querySelector('.gov-custom-select__list');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (list) list.hidden = false;
  }

  function updateDisplay(root, select, value, label) {
    if (!select) return;

    var valueEl = root.querySelector('.gov-custom-select__value');
    var trigger = root.querySelector('.gov-custom-select__trigger');
    var placeholder = getPlaceholderText(select);

    if (valueEl) {
      valueEl.textContent = label || placeholder;
      valueEl.classList.toggle('is-placeholder', !label);
    }

    if (trigger) {
      trigger.classList.toggle('has-value', Boolean(label));
    }

    root.querySelectorAll('.gov-custom-select__option').forEach(function (opt) {
      opt.setAttribute(
        'aria-selected',
        opt.dataset.value === value ? 'true' : 'false'
      );
    });

    if (label) {
      select.classList.remove('show-placeholder');
    } else {
      select.classList.add('show-placeholder');
    }
  }

  function syncDisplayFromNative(custom) {
    var select = getNativeSelect(custom);
    if (!select) return;

    var currentValue = select.value;
    var placeholderValue = getPlaceholderValue(select);

    if (currentValue && currentValue !== placeholderValue) {
      var selected = select.options[select.selectedIndex];
      if (selected && !isPlaceholderOption(selected)) {
        updateDisplay(
          custom,
          select,
          selected.value,
          selected.textContent.trim()
        );
        return;
      }
    }

    updateDisplay(custom, select, '', '');
  }

  function selectOption(root, value, label, shouldClose) {
    var select = getNativeSelect(root);
    var host = getSelectHost(select);

    if (!select) return;

    setNativeSelectValue(select, value);
    updateDisplay(root, select, value, label);
    concealNativeSelect(select);
    concealHostExtras(host, select);

    if (shouldClose !== false) {
      closeSelect(root);
    }

    // Squarespace React may replace the <select> after state updates.
    requestAnimationFrame(function () {
      syncSelectField(root.closest('.form-item.field.select'));
    });
    setTimeout(function () {
      syncSelectField(root.closest('.form-item.field.select'));
    }, 0);
    setTimeout(function () {
      syncSelectField(root.closest('.form-item.field.select'));
    }, 50);
  }

  function bindCustomSelect(custom) {
    if (custom.getAttribute('data-gov-custom-select-bound')) return;
    custom.setAttribute('data-gov-custom-select-bound', 'true');

    var trigger = custom.querySelector('.gov-custom-select__trigger');
    var list = custom.querySelector('.gov-custom-select__list');

    trigger.addEventListener('click', function () {
      if (custom.classList.contains(OPEN_CLASS)) {
        closeSelect(custom);
      } else {
        openSelect(custom);
      }
    });

    trigger.addEventListener('keydown', function (event) {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();
        openSelect(custom);
        var first = list.querySelector('.gov-custom-select__option');
        if (first) first.focus();
      }
    });

    list.addEventListener('click', function (event) {
      var item = event.target.closest('.gov-custom-select__option');
      if (!item) return;

      selectOption(custom, item.dataset.value, item.textContent.trim());
      trigger.focus();
    });

    list.addEventListener('keydown', function (event) {
      var items = Array.prototype.slice.call(
        list.querySelectorAll('.gov-custom-select__option')
      );
      var current = document.activeElement;
      var index = items.indexOf(current);

      if (event.key === 'Escape') {
        event.preventDefault();
        closeSelect(custom);
        trigger.focus();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        var next = items[Math.min(index + 1, items.length - 1)] || items[0];
        next.focus();
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        var prev = items[Math.max(index - 1, 0)];
        prev.focus();
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (current && current.classList.contains('gov-custom-select__option')) {
          selectOption(
            custom,
            current.dataset.value,
            current.textContent.trim()
          );
          trigger.focus();
        }
      }
    });
  }

  function buildCustomSelect(select, host, fieldWrap) {
    var fieldId = fieldWrap.id || '';
    var labelEl = fieldWrap.querySelector('label.title');
    var labelId = labelEl ? labelEl.id || fieldId + '-label' : '';

    if (labelEl && !labelEl.id && labelId) {
      labelEl.id = labelId;
    }

    var placeholder = getPlaceholderText(select);
    var options = getSelectableOptions(select);
    var listId =
      (fieldId ? fieldId + '-listbox' : 'gov-select-') +
      Math.random().toString(36).slice(2);

    var custom = document.createElement('div');
    custom.className = 'gov-custom-select';

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'gov-custom-select__trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    if (labelId) trigger.setAttribute('aria-labelledby', labelId);
    trigger.setAttribute('aria-controls', listId);

    var valueSpan = document.createElement('span');
    valueSpan.className = 'gov-custom-select__value is-placeholder';
    valueSpan.textContent = placeholder;

    var chevron = document.createElement('span');
    chevron.className = 'gov-custom-select__chevron';
    chevron.setAttribute('aria-hidden', 'true');

    trigger.appendChild(valueSpan);
    trigger.appendChild(chevron);

    var list = document.createElement('ul');
    list.className = 'gov-custom-select__list';
    list.id = listId;
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    if (labelId) list.setAttribute('aria-labelledby', labelId);

    options.forEach(function (opt, index) {
      var item = document.createElement('li');
      item.className = 'gov-custom-select__option';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      item.tabIndex = -1;
      item.id = listId + '-opt-' + index;
      item.dataset.value = opt.value;
      item.textContent = opt.textContent.trim();
      list.appendChild(item);
    });

    custom.appendChild(trigger);
    custom.appendChild(list);
    host.appendChild(custom);
    bindCustomSelect(custom);

    return custom;
  }

  function syncSelectField(fieldWrap) {
    if (!fieldWrap) return;

    var host = fieldWrap.querySelector(':scope > div');
    if (!host) return;

    var select = host.querySelector('select');
    var custom = host.querySelector('.gov-custom-select');

    if (!select) return;

    if (!custom) {
      custom = buildCustomSelect(select, host, fieldWrap);
    } else {
      bindCustomSelect(custom);
    }

    concealNativeSelect(select);
    concealHostExtras(host, select);
    syncDisplayFromNative(custom);
  }

  function syncGovCustomSelects(root) {
    root = root || document;

    root
      .querySelectorAll('.gov-form .form-item.field.select')
      .forEach(syncSelectField);
  }

  function scheduleSync(root) {
    var target = root || document;

    if (syncTimers.has(target)) {
      clearTimeout(syncTimers.get(target));
    }

    syncTimers.set(
      target,
      setTimeout(function () {
        syncGovCustomSelects(target);
      }, 0)
    );
  }

  function observeForms() {
    document.querySelectorAll('.gov-form').forEach(function (form) {
      if (form.getAttribute('data-gov-select-observed')) return;
      form.setAttribute('data-gov-select-observed', 'true');

      var observer = new MutationObserver(function () {
        scheduleSync(form);
      });
      observer.observe(form, { childList: true, subtree: true });
    });
  }

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.gov-custom-select')) {
      closeAll(null);
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    syncGovCustomSelects();
    observeForms();
  });

  window.addEventListener('load', function () {
    syncGovCustomSelects();
    observeForms();
    setTimeout(function () {
      syncGovCustomSelects();
    }, 100);
    setTimeout(function () {
      syncGovCustomSelects();
    }, 500);
  });
})();
