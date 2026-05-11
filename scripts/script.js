// Nav Dropdown Interaction 

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