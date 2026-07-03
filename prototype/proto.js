/* blog_tech prototype — interactions partagées */

/* thème clair/sombre persistant */
const saved = localStorage.getItem('bt-theme');
if (saved) document.documentElement.dataset.theme = saved;
function toggleTheme() {
  const cur = document.documentElement.dataset.theme === 'light' ? '' : 'light';
  document.documentElement.dataset.theme = cur;
  localStorage.setItem('bt-theme', cur);
}

document.addEventListener('DOMContentLoaded', () => {
  /* barre de progression de lecture réelle */
  const bar = document.querySelector('.progress');
  if (bar) {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* scrollspy du sommaire */
  const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
  if (tocLinks.length) {
    const heads = tocLinks
      .map(a => document.getElementById(a.getAttribute('href').slice(1)))
      .filter(Boolean);
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          tocLinks.forEach(a => a.classList.toggle('on',
            a.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    heads.forEach(h => spy.observe(h));
  }

  /* reveals au scroll */
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('reveal'); ro.unobserve(e.target); } });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal-scroll').forEach(el => ro.observe(el));

  /* claps */
  document.querySelectorAll('.clap').forEach(c => {
    c.addEventListener('click', () => {
      const b = c.querySelector('b');
      if (b) b.textContent = (+b.textContent.replace(/\s/g, '') + 1).toLocaleString('fr-FR');
      c.style.transform = 'scale(1.18)';
      setTimeout(() => c.style.transform = '', 150);
    });
  });

  /* retour en haut */
  const bt = document.querySelector('.back-top');
  if (bt) {
    document.addEventListener('scroll', () =>
      bt.classList.toggle('show', document.documentElement.scrollTop > 500), { passive: true });
    bt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* copier (feedback visuel) */
  document.querySelectorAll('.copy').forEach(c =>
    c.addEventListener('click', () => { const t = c.textContent; c.textContent = '✓ copié'; setTimeout(() => c.textContent = t, 1200); }));
});
