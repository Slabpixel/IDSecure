// Enterprise nav — desktop dropdown hover
const entNavDesktopMq = window.matchMedia('(min-width: 1025px)');
const entNavDropToggle = document.querySelectorAll('.ent-nav-item--dropdown');

entNavDropToggle.forEach((item) => {
  const entDropMenu = item.querySelector('.ent-nav-dropdown');
  const trigger = item.querySelector('.ent-nav-link');
  if (!entDropMenu || !trigger) return;

  let mouseIsOver = false;

  const mouseState = () => {
    if (!entNavDesktopMq.matches) {
      entDropMenu.classList.remove('ent-nav-hover-active');
      return;
    }
    if (mouseIsOver) {
      entDropMenu.classList.add('ent-nav-hover-active');
    } else {
      entDropMenu.classList.remove('ent-nav-hover-active');
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
  entDropMenu.addEventListener('mouseenter', () => {
    mouseIsOver = true;
    mouseState();
  });
  entDropMenu.addEventListener('mouseleave', () => {
    mouseIsOver = false;
    mouseState();
  });
  trigger.addEventListener('click', (e) => {
    if (!entNavDesktopMq.matches) {
      e.preventDefault();
    }
  });
});
