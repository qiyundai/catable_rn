const ready = (fn) => {
  if (document.readyState !== 'loading') {
    fn();
    return;
  }
  document.addEventListener('DOMContentLoaded', fn);
};

const enableSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      const target = targetId ? document.querySelector(targetId) : null;
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', targetId);
      }
    });
  });
};

const heroAnimate = () => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  requestAnimationFrame(() => {
    hero.classList.add('hero--visible');
  });
};

const checkWebBuildAvailability = () => {
  const previewLink = document.querySelectorAll('a[href$="preview.html"]');
  if (!previewLink.length) return;

  fetch('./web-build/index.html', { method: 'HEAD' })
    .then((response) => {
      if (!response.ok) throw new Error('Missing web build');
      previewLink.forEach((link) => link.classList.remove('is-disabled'));
    })
    .catch(() => {
      previewLink.forEach((link) => {
        link.classList.add('is-disabled');
        link.setAttribute('title', 'Run `npx expo export:web` to generate the preview.');
      });
    });
};

ready(() => {
  enableSmoothScroll();
  heroAnimate();
  checkWebBuildAvailability();
});
