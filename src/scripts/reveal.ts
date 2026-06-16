// Reveal on-scroll: marca [data-rev] con data-in cuando entran al viewport.
const els = document.querySelectorAll<HTMLElement>('[data-rev]');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.setAttribute('data-in', '');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  els.forEach((el) => io.observe(el));
} else {
  els.forEach((el) => el.setAttribute('data-in', ''));
}
