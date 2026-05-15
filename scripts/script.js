// Nav Dropdown Interaction

const govNavDesktopMq = window.matchMedia('(min-width: 1025px)');
const govNavDropToggle = document.querySelectorAll('.gov-nav-item--dropdown');

govNavDropToggle.forEach((item) => {
  const govDropMenu = item.querySelector('.gov-nav-dropdown');
  const trigger = item.querySelector('.gov-nav-link');
  if (!govDropMenu || !trigger) return;

  let mouseIsOver = false;

  const mouseState = () => {
    if (!govNavDesktopMq.matches) {
      govDropMenu.classList.remove('gov-nav-hover-active');
      return;
    }
    if (mouseIsOver) {
      govDropMenu.classList.add('gov-nav-hover-active');
    } else {
      govDropMenu.classList.remove('gov-nav-hover-active');
    }
  };

  trigger.addEventListener('mouseenter', () => {
    mouseIsOver = true;
    mouseState();
  });
  trigger.addEventListener('mouseleave', () => {
    mouseIsOver = false;
    mouseState();
  });
  govDropMenu.addEventListener('mouseenter', () => {
    mouseIsOver = true;
    mouseState();
  });
  govDropMenu.addEventListener('mouseleave', () => {
    mouseIsOver = false;
    mouseState();
  });
  trigger.addEventListener('click', (e) => {
    if (!govNavDesktopMq.matches) {
      e.preventDefault();
    }
  });
});

// Gov mobile menu
const govNavBtn = document.querySelector('.gov-nav-btn');
const govNavMobile = document.querySelector('.gov-nav-mobile');
const govSiteNav = document.querySelector('.gov-site-navigation');

const setGovMobileMenuOpen = (open) => {
  if (!govNavBtn || !govNavMobile || !govSiteNav) return;

  govNavBtn.classList.toggle('is-active', open);
  govNavMobile.classList.toggle('is-open', open);
  govSiteNav.classList.toggle('is-menu-open', open);
  govNavBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  govNavBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  govNavMobile.setAttribute('aria-hidden', open ? 'false' : 'true');
  document.body.style.overflow = open ? 'hidden' : '';
};

govNavBtn?.addEventListener('click', () => {
  setGovMobileMenuOpen(!govNavMobile.classList.contains('is-open'));
});

document.querySelectorAll('.gov-nav-mobile-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const group = trigger.closest('.gov-nav-mobile-group');
    if (!group) return;

    const isOpen = group.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
});

govNavMobile?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    setGovMobileMenuOpen(false);
  });
});

const navDropToggle = document.querySelectorAll('.nav-menu-toggle');

navDropToggle.forEach((x) => {
  const navDropMenu = x.querySelector('.nav-menu-dropdown');
  let mouseIsOver = false;

  x.querySelector('a').addEventListener('mouseenter', () => {
    mouseIsOver = true;
    mouseState()
  });
  x.querySelector('a').addEventListener('mouseleave', () => {
    mouseIsOver = false;
    mouseState()
  });
  navDropMenu.addEventListener('mouseleave', () => {
    mouseIsOver = false;
    mouseState()
  });
  navDropMenu.addEventListener('mouseenter', () => {
    mouseIsOver = true;
    mouseState()
  });

  function mouseState() {
    if(mouseIsOver) {
      navDropMenu.classList.add('nav-hover-active');
    } else {
      navDropMenu.classList.remove('nav-hover-active');
    }
  } 
});

// Mega Menu Interaction 

const menuBtn = document.querySelectorAll('.nav-menu-btn');
const navMain = document.querySelector('.nav-main');

for(btn of menuBtn) {
  btn.addEventListener('click', () => {
    console.log('click ok');
    navMain.classList.toggle('hide');

    if(navMain.classList.contains('hide')) {
      document.querySelector('body').style.overflow = 'unset';
    } else {
      document.querySelector('body').style.overflow = 'hidden';
    }
  })
}


// Infinite Marquee Animation

const marqueeWrapper = document.querySelectorAll('.marquee-wrapper');

for(x of marqueeWrapper) {
  let gap = window.getComputedStyle(x).getPropertyValue('gap');
  let itemWidth = x.querySelector('.marquee-item').offsetWidth;
  let number = parseInt(gap.replace('px', ''));
  console.log(itemWidth, number);

  x.animate([
    { transform: `translateX(0px)` },
    { transform: `translateX(-${number + itemWidth}px)` }
  ], {
    duration: 15000,
    iterations: Infinity
  });
}

// Remove overflow for blog pages

document.addEventListener("DOMContentLoaded", (event) => {
  if(window.location.href.includes('blog')) {
    console.log('url true')
    document.querySelector('.site-container').style.overflow = "visible";
  }
});


// Prevent Right Click on Images

document.querySelectorAll('img').forEach((image) => {
  image.addEventListener('contextmenu', event => event.preventDefault());
  image.setAttribute('draggable', false);
});

// Government page: SPECTRE product tabs (.gov-tab)
document.querySelectorAll('.gov-tab').forEach((root) => {
  const buttons = root.querySelectorAll('.gov-tab-button');
  const panels = root.querySelectorAll('.gov-tab-content-item');
  if (!buttons.length || !panels.length) return;

  let current = 0;

  function activate(index) {
    const i = Math.max(0, Math.min(index, buttons.length - 1));
    current = i;
    buttons.forEach((btn, j) => {
      const on = j === i;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.tabIndex = 0;
    });
    panels.forEach((panel, j) => {
      panel.classList.toggle('active', j === i);
    });
  }

  const initial = Array.from(buttons).findIndex((b) => b.classList.contains('active'));
  activate(initial >= 0 ? initial : 0);

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => activate(i));
  });

  const tablist = root.querySelector('.gov-tab-header');
  if (tablist) {
    tablist.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      const next = (current + delta + buttons.length) % buttons.length;
      activate(next);
      buttons[next].focus();
    });
  }
});