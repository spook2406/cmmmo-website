/**
 * 酷默 / CMMMO — Main JavaScript
 * Zero-dependency: glass nav, reveal, contact form.
 */
(function () {
  'use strict';

  class SiteConfig {
    constructor() {
      this.brand = '酷默 / CMMMO';
      this.company = '温州酷默技术科技有限公司';
      this.email = 'huanghaihu@cmmmo.com';
      this.address = '浙江省温州市鹿城区南汇街道车站大道577号财富中心1504室-6';
    }
  }

  class RevealController {
    constructor(options) {
      this.options = Object.assign(
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
        options || {}
      );
      this.observer = null;
      this.reduced =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    observeAll(selector) {
      var nodes = Array.prototype.slice.call(document.querySelectorAll(selector || '.reveal'));
      if (this.reduced) {
        nodes.forEach(function (el) { el.classList.add('is-visible'); });
        return;
      }
      var self = this;
      this.observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            self.reveal(entry.target);
            self.observer.unobserve(entry.target);
          }
        });
      }, this.options);
      nodes.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i % 8, 7) * 50 + 'ms';
        self.observer.observe(el);
      });
    }

    reveal(el) {
      el.classList.add('is-visible');
    }

    destroy() {
      if (this.observer) this.observer.disconnect();
    }
  }

  class NavController {
    constructor() {
      this.navBar = document.querySelector('[data-nav]');
      this.menuToggle = document.querySelector('[data-menu-toggle]');
      this.mobileMenu = document.querySelector('[data-mobile-menu]');
      this.isOpen = false;
      this.bindScroll();
      this.bindMenu();
    }

    bindScroll() {
      var self = this;
      var onScroll = function () {
        if (!self.navBar) return;
        if (window.scrollY > 40) self.navBar.classList.add('is-scrolled');
        else self.navBar.classList.remove('is-scrolled');
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    bindMenu() {
      var self = this;
      if (!this.menuToggle || !this.mobileMenu) return;
      this.menuToggle.addEventListener('click', function () {
        self.toggleMenu();
      });
      this.mobileMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { self.closeMenu(); });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') self.closeMenu();
      });
    }

    toggleMenu() {
      if (this.isOpen) this.closeMenu();
      else this.openMenu();
    }

    openMenu() {
      this.isOpen = true;
      if (this.mobileMenu) {
        this.mobileMenu.classList.add('is-open');
        this.mobileMenu.setAttribute('aria-hidden', 'false');
      }
      if (this.menuToggle) {
        this.menuToggle.setAttribute('aria-expanded', 'true');
      }
      document.body.classList.add('is-locked');
    }

    closeMenu() {
      this.isOpen = false;
      if (this.mobileMenu) {
        this.mobileMenu.classList.remove('is-open');
        this.mobileMenu.setAttribute('aria-hidden', 'true');
      }
      if (this.menuToggle) {
        this.menuToggle.setAttribute('aria-expanded', 'false');
      }
      document.body.classList.remove('is-locked');
    }
  }

  class ContactForm {
    constructor(form, mailtoTarget) {
      this.form = form;
      this.mailtoTarget = mailtoTarget || form.getAttribute('data-mailto-target') || 'huanghaihu@cmmmo.com';
      this.status = form.querySelector('[data-form-status]');
      var self = this;
      form.addEventListener('submit', function (e) { self.onSubmit(e); });
      form.addEventListener('reset', function () {
        self.clearAllErrors();
        if (self.status) self.status.textContent = '';
      });
    }

    _msg(attr, fallback) {
      return this.form.getAttribute(attr) || fallback;
    }

    _fieldValue(name) {
      var el = this.form.elements.namedItem(name);
      return el && 'value' in el ? String(el.value).trim() : '';
    }

    _setFieldError(name, message) {
      var err = this.form.querySelector('[data-error-for="' + name + '"]');
      var input = this.form.elements.namedItem(name);
      if (err) {
        err.hidden = false;
        err.textContent = message;
      }
      if (input && input.setAttribute) input.setAttribute('aria-invalid', 'true');
    }

    _clearFieldError(name) {
      var err = this.form.querySelector('[data-error-for="' + name + '"]');
      var input = this.form.elements.namedItem(name);
      if (err) {
        err.hidden = true;
        err.textContent = '';
      }
      if (input && input.removeAttribute) input.removeAttribute('aria-invalid');
    }

    clearAllErrors() {
      var self = this;
      ['name', 'email', 'message'].forEach(function (n) { self._clearFieldError(n); });
    }

    validate() {
      this.clearAllErrors();
      var ok = true;
      var name = this._fieldValue('name');
      var email = this._fieldValue('email');
      var message = this._fieldValue('message');
      if (!name) { this._setFieldError('name', this._msg('data-err-name', 'Please enter your name')); ok = false; }
      if (!email) { this._setFieldError('email', this._msg('data-err-email', 'Please enter your email')); ok = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this._setFieldError('email', this._msg('data-err-email-invalid', 'Please enter a valid email')); ok = false;
      }
      if (!message) { this._setFieldError('message', this._msg('data-err-message', 'Please enter a message')); ok = false; }
      return ok;
    }

    buildMailtoUrl(data) {
      var subjectPrefix = this._msg('data-mail-subject', 'CMMMO website inquiry');
      var nameLabel = this._msg('data-mail-name', 'Name');
      var emailLabel = this._msg('data-mail-email', 'Email');
      var subject = encodeURIComponent(subjectPrefix + ' — ' + data.name);
      var body = encodeURIComponent(
        nameLabel + '：' + data.name + '\n' + emailLabel + '：' + data.email + '\n\n' + data.message
      );
      return 'mailto:' + this.mailtoTarget + '?subject=' + subject + '&body=' + body;
    }

    onSubmit(event) {
      event.preventDefault();
      if (!this.validate()) {
        if (this.status) this.status.textContent = this._msg('data-status-check', 'Please check the form.');
        return;
      }
      var data = {
        name: this._fieldValue('name'),
        email: this._fieldValue('email'),
        message: this._fieldValue('message')
      };
      if (this.status) this.status.textContent = this._msg('data-status-opening', 'Opening email…');
      window.location.href = this.buildMailtoUrl(data);
    }
  }

  class App {
    constructor() {
      this.config = new SiteConfig();
      this.revealController = null;
      this.navController = null;
      this.contactForm = null;
    }

    init() {
      this.navController = new NavController();
      this.revealController = new RevealController();
      this.revealController.observeAll('.reveal');
      this.bindSmoothScroll();
      this.updateYear();

      var form = document.querySelector('[data-contact-form]');
      if (form) {
        this.contactForm = new ContactForm(
          form,
          form.getAttribute('data-mailto-target') || this.config.email
        );
      }
    }

    bindSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var id = a.getAttribute('href');
          if (!id || id === '#') return;
          var target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }

    updateYear() {
      var y = String(new Date().getFullYear());
      document.querySelectorAll('[data-current-year]').forEach(function (el) {
        el.textContent = y;
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    new App().init();
  });
})();
