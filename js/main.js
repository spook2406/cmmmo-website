/**
 * 酷默 cmmmo site behavior.
 * Sticky nav, mobile menu, scroll reveals, light hero parallax, demo contact form.
 * No network requests. Honors prefers-reduced-motion.
 */
'use strict';

const SiteConfig = Object.freeze({
  companyName: '温州酷默技术科技有限公司',
  brandNameZh: '酷默',
  brandName: 'cmmmo',
  brandAlt: 'CEEMO',
  address: '浙江省温州市鹿城区南汇街道车站大道577号财富中心1504室-6',
  legalPerson: '黄海湖',
  phone: '待补充',
  email: 'contact@cmmmo.com',
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function applySiteConfig(config) {
  document.querySelectorAll('[data-config]').forEach((el) => {
    const key = el.getAttribute('data-config');
    if (key && Object.prototype.hasOwnProperty.call(config, key)) {
      el.textContent = String(config[key]);
    }
  });
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

function setupNav() {
  const header = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const panel = document.querySelector('.nav__panel');
  if (!header || !toggle || !panel) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    panel.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const desktop = window.matchMedia('(min-width: 834px)');
  const closeIfDesktop = () => {
    if (desktop.matches) setOpen(false);
  };
  if (typeof desktop.addEventListener === 'function') {
    desktop.addEventListener('change', closeIfDesktop);
  } else if (typeof desktop.addListener === 'function') {
    desktop.addListener(closeIfDesktop);
  }
}

function setupReveal() {
  const nodes = document.querySelectorAll('[data-reveal]');
  if (!nodes.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof IntersectionObserver === 'undefined') {
    nodes.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const groups = new Map();
  nodes.forEach((el) => {
    const parent = el.parentElement || document.body;
    const list = groups.get(parent) || [];
    list.push(el);
    groups.set(parent, list);
  });
  groups.forEach((list) => {
    list.forEach((el, index) => {
      el.style.setProperty('--d', `${Math.min(index, 5) * 90}ms`);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
  );

  nodes.forEach((el) => observer.observe(el));
}

function setupParallax() {
  const nodes = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!nodes.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  const update = () => {
    nodes.forEach((el) => {
      const speed = Number(el.getAttribute('data-parallax')) || 0.08;
      const rect = el.getBoundingClientRect();
      const elMid = rect.top + rect.height / 2;
      const viewMid = window.innerHeight / 2;
      const delta = (viewMid - elMid) * speed;
      const limited = Math.max(-28, Math.min(28, delta));
      el.style.transform = `translate3d(0, ${limited.toFixed(2)}px, 0)`;
    });
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true }
  );
  update();
}

function setupForm() {
  const form = document.querySelector('.contact-form');
  const feedback = document.querySelector('.feedback');
  if (!form || !feedback) return;

  const show = (message, ok) => {
    feedback.textContent = message;
    feedback.classList.remove('is-success', 'is-error');
    feedback.classList.add(ok ? 'is-success' : 'is-error');
    feedback.setAttribute('role', ok ? 'status' : 'alert');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();

    if (!name || !email || !message) {
      show('请填写必填项。', false);
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      show('请检查邮箱格式。', false);
      return;
    }

    show('已记录在本页（演示）。请发送邮件至 contact@cmmmo.com，我们会尽快回复。', true);
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applySiteConfig(SiteConfig);
  setupNav();
  setupReveal();
  setupParallax();
  setupForm();
});
