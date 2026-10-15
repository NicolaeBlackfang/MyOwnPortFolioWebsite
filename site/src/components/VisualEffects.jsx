import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function VisualEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.querySelector('main') || document.body;
    const tiltCards = new Set();
    const typewriterTimers = new Map();
    const initializedTypewriters = new WeakSet();
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries => entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.animate(
            [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' },
          );
          observer.unobserve(entry.target);
        }), { threshold: 0.12 })
      : null;

    const move = event => {
      const card = event.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 5}deg) translateY(-6px)`;
    };
    const reset = event => { event.currentTarget.style.transform = ''; };

    const startTypewriter = element => {
      if (initializedTypewriters.has(element)) return;
      initializedTypewriters.add(element);
      const words = ['Vibe Coder', 'Engineering Enthusiast', 'Minecraft Builder', 'AI-Assisted Maker'];
      let wordIndex = 0;
      let charIndex = 0;
      let deleting = false;
      const tick = () => {
        const word = words[wordIndex];
        element.textContent = deleting ? word.slice(0, charIndex--) : word.slice(0, charIndex++);
        if (!deleting && charIndex > word.length + 8) deleting = true;
        if (deleting && charIndex < 0) {
          deleting = false;
          charIndex = 0;
          wordIndex = (wordIndex + 1) % words.length;
        }
        typewriterTimers.set(element, window.setTimeout(tick, deleting ? 55 : 95));
      };
      tick();
    };

    const initialize = node => {
      if (!(node instanceof Element)) return;
      const elements = [node, ...node.querySelectorAll('.reveal, [data-tilt], [data-typewriter]')];
      for (const element of elements) {
        if (element.matches('.reveal')) observer?.observe(element);
        if (element.matches('[data-tilt]') && !tiltCards.has(element)) {
          tiltCards.add(element);
          element.addEventListener('pointermove', move);
          element.addEventListener('pointerleave', reset);
        }
        if (element.matches('[data-typewriter]')) startTypewriter(element);
      }
    };

    initialize(root);
    const mutations = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(initialize));
    });
    mutations.observe(root, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer?.disconnect();
      typewriterTimers.forEach(timer => window.clearTimeout(timer));
      tiltCards.forEach(card => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', reset);
      });
    };
  }, [pathname]);

  return null;
}
