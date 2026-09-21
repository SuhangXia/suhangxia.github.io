import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initialiseNavigation() {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const navigation = document.querySelector<HTMLElement>('[data-site-nav]');
  if (!header || !toggle || !navigation) return;
  const backgroundRegions = document.querySelectorAll<HTMLElement>('main, footer');

  let ticking = false;
  const updateHeader = () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHeader);
    },
    { passive: true },
  );
  updateHeader();

  const setMenu = (open: boolean, restoreFocus = false) => {
    header.classList.toggle('menu-active', open);
    document.body.classList.toggle('menu-open', open);
    backgroundRegions.forEach((region) => region.toggleAttribute('inert', open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');

    if (open) {
      navigation.querySelector<HTMLAnchorElement>('a')?.focus();
    } else if (restoreFocus) {
      toggle.focus();
    }
  };

  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  navigation.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setMenu(false);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false, true);
    }
  });

  window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });
}

function initialiseMotion() {
  if (reducedMotion.matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const context = gsap.context(() => {
    const hero = document.querySelector<HTMLElement>('[data-hero]');

    if (hero) {
      const heroMedia = hero.querySelector<HTMLElement>('[data-hero-media]');
      const heroImage = heroMedia?.querySelector('img');
      const heroMeta = hero.querySelectorAll<HTMLElement>('[data-hero-meta]');
      const mobile = window.matchMedia('(max-width: 767px)').matches;

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (heroMedia) {
        intro.fromTo(
          heroMedia,
          { clipPath: mobile ? 'inset(40% 4% 7% 18%)' : 'inset(28% 7% 8% 47%)' },
          {
            clipPath: mobile ? 'inset(34% 0% 0% 11%)' : 'inset(22% 2% 2% 40%)',
            duration: 1.35,
          },
          0,
        );
      }
      intro
        .to(heroMeta, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.65);

      if (heroMedia && heroImage) {
        const settledClip = mobile ? 'inset(34% 0% 0% 11%)' : 'inset(22% 2% 2% 40%)';
        gsap
          .timeline({
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
            },
          })
          .fromTo(
            heroMedia,
            { clipPath: settledClip },
            { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', immediateRender: false },
            0,
          )
          .fromTo(heroImage, { scale: 1.035 }, { scale: 1.1, ease: 'none', immediateRender: false }, 0)
          .fromTo(
            heroMeta,
            { autoAlpha: 1, y: 0 },
            { autoAlpha: 0, y: -24, ease: 'none', immediateRender: false },
            0,
          );
      }
    }

    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
      gsap.to(element, {
        autoAlpha: 1,
        y: 0,
        duration: 0.95,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 88%',
          once: true,
        },
      });
    });

    gsap.utils.toArray<HTMLElement>('[data-reveal-line]').forEach((line) => {
      gsap.to(line, {
        scaleX: 1,
        duration: 1.25,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: line,
          start: 'top 92%',
          once: true,
        },
      });
    });

    gsap.utils.toArray<HTMLElement>('[data-reveal-media]').forEach((media) => {
      gsap.to(media, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.25,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: media,
          start: 'top 84%',
          once: true,
        },
      });
    });

    gsap.utils.toArray<HTMLElement>('[data-project-media]').forEach((media) => {
      gsap.fromTo(
        media,
        { clipPath: 'inset(0% 0% 16% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.15,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: media,
            start: 'top 86%',
            once: true,
          },
        },
      );
    });

    const story = document.querySelector<HTMLElement>('[data-scroll-story]');
    if (story && window.matchMedia('(min-width: 900px)').matches) {
      const steps = Array.from(story.querySelectorAll<HTMLElement>('[data-story-step]'));
      const media = Array.from(story.querySelectorAll<HTMLElement>('[data-story-media]'));
      const progress = story.querySelector<HTMLElement>('[data-story-progress]');
      const counter = story.querySelector<HTMLElement>('[data-story-current]');

      const activateStage = (index: number) => {
        steps.forEach((step, itemIndex) => step.classList.toggle('active', itemIndex === index));
        media.forEach((item, itemIndex) => {
          item.classList.toggle('active', itemIndex === index);
          gsap.to(item, {
            autoAlpha: itemIndex === index ? 1 : 0,
            scale: itemIndex === index ? 1 : 1.015,
            duration: 0.7,
            ease: 'power2.out',
            overwrite: true,
          });
        });
        if (progress) gsap.to(progress, { scaleX: (index + 1) / steps.length, duration: 0.45 });
        if (counter) counter.textContent = String(index + 1).padStart(2, '0');
      };

      steps.forEach((step, index) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 55%',
          end: 'bottom 55%',
          onEnter: () => activateStage(index),
          onEnterBack: () => activateStage(index),
        });
      });
    }
  });

  window.addEventListener('pagehide', () => context.revert(), { once: true });
}

initialiseNavigation();
initialiseMotion();
