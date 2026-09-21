const gallery = document.querySelector<HTMLElement>('[data-travel-gallery]');

if (gallery) {
  const photos = Array.from(gallery.querySelectorAll<HTMLElement>('[data-travel-photo]'));
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Animate only approaching images; content remains visible if scripts are unavailable.
  if (!motion.matches && 'IntersectionObserver' in window && 'animate' in Element.prototype) {
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry, index) => {
        const animation = entry.target.animate(
          [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 800, delay: index * 75, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' },
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    photos.forEach((photo) => observer.observe(photo));
    const stopMotion = () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
    motion.addEventListener('change', (event) => { if (event.matches) stopMotion(); });
    window.addEventListener('pagehide', stopMotion, { once: true });
  }

  const viewer = gallery.querySelector<HTMLDialogElement>('[data-travel-viewer]');
  const links = Array.from(gallery.querySelectorAll<HTMLAnchorElement>('[data-travel-open]'));
  const picture = viewer?.querySelector<HTMLImageElement>('[data-travel-full]');
  const city = viewer?.querySelector<HTMLElement>('[data-travel-city]');
  const country = viewer?.querySelector<HTMLElement>('[data-travel-country]');
  const counter = viewer?.querySelector<HTMLElement>('[data-travel-current]');

  if (viewer && picture && city && country && counter && typeof viewer.showModal === 'function') {
    let current = 0;
    let trigger: HTMLAnchorElement | null = null;
    let previousOverflow = '';
    let pointerStart: { x: number; y: number } | null = null;

    const showPhoto = (index: number) => {
      current = (index + links.length) % links.length;
      const link = links[current]!;
      picture.src = link.href;
      picture.alt = link.querySelector('img')?.alt ?? '';
      city.textContent = link.dataset.city ?? '';
      country.textContent = link.dataset.country ?? '';
      counter.textContent = String(current + 1).padStart(2, '0');
    };

    links.forEach((link, index) => {
      link.setAttribute('aria-haspopup', 'dialog');
      link.addEventListener('click', (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        trigger = link;
        showPhoto(index);
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        viewer.showModal();
      });
    });

    viewer.querySelector('[data-travel-prev]')?.addEventListener('click', () => showPhoto(current - 1));
    viewer.querySelector('[data-travel-next]')?.addEventListener('click', () => showPhoto(current + 1));
    viewer.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showPhoto(current + (event.key === 'ArrowLeft' ? -1 : 1));
      }
    });
    picture.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch' && event.isPrimary) pointerStart = { x: event.clientX, y: event.clientY };
    });
    picture.addEventListener('pointerup', (event) => {
      if (!pointerStart || !event.isPrimary) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(current + (dx < 0 ? 1 : -1));
    });
    picture.addEventListener('pointercancel', () => { pointerStart = null; });
    picture.style.touchAction = 'pan-y pinch-zoom';

    // A click on the backdrop has coordinates outside the dialog's rectangle.
    viewer.addEventListener('click', (event) => {
      if (event.target !== viewer) return;
      const rect = viewer.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
    });
    viewer.addEventListener('close', () => {
      document.body.style.overflow = previousOverflow;
      picture.removeAttribute('src');
      pointerStart = null;
      trigger?.focus({ preventScroll: true });
    });
  }
}
