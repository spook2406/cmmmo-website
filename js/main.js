/**
 * @fileoverview CEEMO Corporate Website - Global Script.
 *
 * Zero-dependency, vanilla JavaScript. Provides shared site configuration and
 * three controllers (navigation, form, reveal) assembled by an {@link App}
 * bootstrap object. All interactions are driven by agreed-upon CSS class
 * conventions:
 *   - `.is-open`     : mobile menu expanded / hamburger active
 *   - `.is-scrolled` : header scrolled shadow state
 *   - `.is-visible`  : element revealed by scroll animation
 *   - `.is-active`   : current navigation link highlight
 *   - `.is-success`  : form feedback success state
 *   - `.is-error`    : form feedback error state
 *
 * @author CEEMO Engineering
 */

'use strict';

/* ==========================================================================
   1. Site Configuration
   ========================================================================== */

/**
 * Centralized site configuration. All placeholder data lives here so it can
 * be replaced in a single location once confirmed by the company.
 *
 * @const {!Object}
 */
const SiteConfig = Object.freeze({
  /** @type {string} Legal company name. */
  companyName: '温州酷默技术科技有限公司',
  /** @type {string} Chinese brand. */
  brandNameZh: '酷默',
  /** @type {string} English / product brand. */
  brandName: 'cmmmo',
  /** @type {string} Alternate Latin brand. */
  brandAlt: 'CEEMO',
  /** @type {string} Registered address. */
  address: '浙江省温州市鹿城区南汇街道车站大道577号财富中心1504室-6',
  /** @type {string} Legal representative. */
  legalPerson: '黄海湖',
  /** @type {string} Contact phone (placeholder until provided). */
  phone: '待补充',
  /** @type {string} Contact email (placeholder until provided). */
  email: 'contact@cmmmo.com',
  /** @type {!Array<!Object>} Navigation items in display order. */
  navItems: Object.freeze([
    Object.freeze({ label: '首页', href: 'index.html' }),
    Object.freeze({ label: '关于我们', href: 'about.html' }),
    Object.freeze({ label: '产品中心', href: 'products.html' }),
    Object.freeze({ label: 'X1 Pro', href: 'product-x1pro.html' }),
    Object.freeze({ label: '联系我们', href: 'contact.html' }),
  ]),
});

/* ==========================================================================
   2. Shared Constants
   ========================================================================== */

/**
 * CSS class names used to drive interactions. Kept in one place so the
 * JavaScript and stylesheet contracts stay in sync.
 *
 * @const {!Object<string, string>}
 */
const CSS_CLASS = Object.freeze({
  MENU_OPEN: 'is-open',
  SCROLLED: 'is-scrolled',
  VISIBLE: 'is-visible',
  ACTIVE: 'is-active',
  SUCCESS: 'is-success',
  ERROR: 'is-error',
});

/**
 * Default page used when the current URL has no file segment (e.g. a
 * directory URL or `file://` root).
 *
 * @const {string}
 */
const DEFAULT_PAGE = 'index.html';

/**
 * Scroll offset (in pixels) beyond which the header gains its shadow.
 *
 * @const {number}
 */
const SCROLL_SHADOW_THRESHOLD = 8;

/**
 * Feedback messages shown by the contact form.
 *
 * @const {!Object<string, string>}
 */
const FORM_MESSAGE = Object.freeze({
  SUCCESS: '提交成功（演示）',
  REQUIRED: '请填写必填项',
  EMAIL: '请检查邮箱格式',
});

/**
 * Simple RFC-5322-ish email pattern.
 *
 * @const {!RegExp}
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ==========================================================================
   3. NavController
   ========================================================================== */

/**
 * Controls the site header: hamburger toggle, scroll shadow, and active link
 * highlighting.
 */
class NavController {
  /**
   * @param {!Object=} config Site configuration (defaults to {@link SiteConfig}).
   */
  constructor(config = SiteConfig) {
    /** @type {!Object} */
    this.config = config;
    /** @type {?HTMLElement} */
    this.header = document.querySelector('.site-header');
    /** @type {?HTMLElement} */
    this.navToggle = document.querySelector('.nav-toggle');
    /** @type {?HTMLElement} */
    this.navMenu = document.querySelector('.nav-menu');
    /** @type {boolean} */
    this.isMenuOpen = false;

    this.__init();
  }

  /**
   * Binds all navigation behaviors. Safe to call when elements are absent.
   * @private
   */
  __init() {
    this.bindToggle();
    this.bindScrollShadow();
    this.highlightActive();
  }

  /**
   * Wires the hamburger button and outside-click / escape closing.
   * @return {void}
   */
  bindToggle() {
    if (!this.navToggle || !this.navMenu) {
      return;
    }

    this.navToggle.addEventListener('click', () => {
      if (this.isMenuOpen) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    });

    // Close when a nav link is clicked (mobile UX).
    this.navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Close on Escape key.
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });

    // Close when clicking outside the header. The toggle click is ignored
    // here so the toggle handler alone owns open/close state transitions.
    document.addEventListener('click', (event) => {
      if (!this.isMenuOpen || !this.header) {
        return;
      }
      const target = /** @type {!Node} */ (event.target);
      if (this.navToggle && this.navToggle.contains(target)) {
        return;
      }
      if (!this.header.contains(target)) {
        this.closeMenu();
      }
    });
  }

  /**
   * Opens the mobile menu.
   * @return {void}
   */
  openMenu() {
    if (!this.navToggle || !this.navMenu) {
      return;
    }
    this.isMenuOpen = true;
    this.navToggle.classList.add(CSS_CLASS.MENU_OPEN);
    this.navMenu.classList.add(CSS_CLASS.MENU_OPEN);
    this.navToggle.setAttribute('aria-expanded', 'true');
  }

  /**
   * Closes the mobile menu.
   * @return {void}
   */
  closeMenu() {
    if (!this.navToggle || !this.navMenu) {
      return;
    }
    this.isMenuOpen = false;
    this.navToggle.classList.remove(CSS_CLASS.MENU_OPEN);
    this.navMenu.classList.remove(CSS_CLASS.MENU_OPEN);
    this.navToggle.setAttribute('aria-expanded', 'false');
  }

  /**
   * Toggles the header shadow based on scroll position.
   * @return {void}
   */
  bindScrollShadow() {
    if (!this.header) {
      return;
    }

    const updateShadow = () => {
      if (window.scrollY > SCROLL_SHADOW_THRESHOLD) {
        this.header.classList.add(CSS_CLASS.SCROLLED);
      } else {
        this.header.classList.remove(CSS_CLASS.SCROLLED);
      }
    };

    updateShadow();
    window.addEventListener('scroll', updateShadow, { passive: true });
  }

  /**
   * Resolves the current page file name from the URL path, falling back to
   * {@link DEFAULT_PAGE} when the path is empty or ends with a directory
   * separator (e.g. `file:///.../` or `https://example.com/`).
   *
   * @return {string} The current page file name.
   * @private
   */
  static resolveCurrentPage() {
    const segments = window.location.pathname.split('/');
    const lastSegment = segments.pop() || '';
    if (!lastSegment) {
      return DEFAULT_PAGE;
    }
    try {
      return decodeURIComponent(lastSegment);
    } catch (error) {
      return lastSegment;
    }
  }

  /**
   * Highlights the navigation link matching the current page.
   * @return {void}
   */
  highlightActive() {
    if (!this.navMenu) {
      return;
    }

    const currentPath = NavController.resolveCurrentPage();
    const links = this.navMenu.querySelectorAll('.nav-menu__link');

    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const target = href.split('/').pop();
      if (target === currentPath) {
        link.classList.add(CSS_CLASS.ACTIVE);
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove(CSS_CLASS.ACTIVE);
        link.removeAttribute('aria-current');
      }
    });
  }
}

/* ==========================================================================
   4. FormController
   ========================================================================== */

/**
 * Handles the contact form: front-end validation and demo feedback only.
 * No network requests are made.
 */
class FormController {
  /**
   * @param {!Object=} config Site configuration (defaults to {@link SiteConfig}).
   */
  constructor(config = SiteConfig) {
    /** @type {!Object} */
    this.config = config;
    /** @type {?HTMLFormElement} */
    this.form = document.querySelector('.contact-form');
    /** @type {?HTMLElement} */
    this.feedback = document.querySelector('.form-feedback');

    this.__init();
  }

  /**
   * Binds the submit listener if a form exists.
   * @private
   */
  __init() {
    if (!this.form) {
      return;
    }
    this.form.addEventListener('submit', (event) => this.handleSubmit(event));
  }

  /**
   * Validates the collected form data.
   * @param {!Object<string, string>} data Field name to value map.
   * @return {boolean} True when all required fields are valid.
   */
  validate(data) {
    const name = (data.name || '').trim();
    const email = (data.email || '').trim();
    const message = (data.message || '').trim();

    if (!name || !email || !message) {
      return false;
    }

    return EMAIL_PATTERN.test(email);
  }

  /**
   * Handles form submission: prevents default, validates, shows feedback.
   * @param {!Event} event The submit event.
   * @return {void}
   */
  handleSubmit(event) {
    event.preventDefault();

    if (!this.form) {
      return;
    }

    /** @type {!Object<string, string>} */
    const data = {};
    const formData = new FormData(this.form);
    formData.forEach((value, key) => {
      data[key] = String(value);
    });

    if (!this.validate(data)) {
      const email = (data.email || '').trim();
      const hasRequired =
        (data.name || '').trim() &&
        email &&
        (data.message || '').trim();
      const message = hasRequired ? FORM_MESSAGE.EMAIL : FORM_MESSAGE.REQUIRED;
      this.showFeedback(message, 'error');
      return;
    }

    this.showFeedback(FORM_MESSAGE.SUCCESS, 'success');
    this.form.reset();
  }

  /**
   * Displays a feedback message with a type-based style and appropriate ARIA
   * role (`status` for success, `alert` for errors).
   *
   * @param {string} message The message text.
   * @param {string} type Either 'success' or 'error'.
   * @return {void}
   */
  showFeedback(message, type) {
    if (!this.feedback) {
      return;
    }
    const isSuccess = type === 'success';
    this.feedback.textContent = message;
    this.feedback.classList.remove(CSS_CLASS.SUCCESS, CSS_CLASS.ERROR);
    this.feedback.classList.add(isSuccess ? CSS_CLASS.SUCCESS : CSS_CLASS.ERROR);
    this.feedback.setAttribute('role', isSuccess ? 'status' : 'alert');
  }
}

/* ==========================================================================
   5. RevealController
   ========================================================================== */

/**
 * Reveals elements with a fade-in animation as they enter the viewport.
 */
class RevealController {
  constructor() {
    /** @type {!NodeList<!HTMLElement>} */
    this.elements = document.querySelectorAll('[data-reveal]');
    /** @type {?IntersectionObserver} */
    this.observer = null;

    this.__init();
  }

  /**
   * Sets up the IntersectionObserver and begins observing.
   * @private
   */
  __init() {
    if (!this.elements.length) {
      return;
    }

    // Fallback: reveal immediately if IntersectionObserver is unsupported.
    if (typeof IntersectionObserver === 'undefined') {
      this.elements.forEach((el) => this.reveal(el));
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.reveal(/** @type {!HTMLElement} */ (entry.target));
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    this.observe();
  }

  /**
   * Starts observing all reveal targets.
   * @return {void}
   */
  observe() {
    if (!this.observer) {
      return;
    }
    this.elements.forEach((el) => this.observer.observe(el));
  }

  /**
   * Marks an element as visible.
   * @param {!HTMLElement} el The element to reveal.
   * @return {void}
   */
  reveal(el) {
    el.classList.add(CSS_CLASS.VISIBLE);
  }
}

/* ==========================================================================
   6. App Bootstrap
   ========================================================================== */

/**
 * Application bootstrap: assembles controllers on DOM ready.
 */

/**
 * Apply SiteConfig values into [data-config] nodes and footer year.
 * @param {!Object=} config
 * @return {void}
 */
function applySiteConfig(config = SiteConfig) {
  document.querySelectorAll('[data-config]').forEach((el) => {
    const key = el.getAttribute('data-config');
    if (key && Object.prototype.hasOwnProperty.call(config, key)) {
      el.textContent = String(config[key]);
    }
  });
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
  document.querySelectorAll('[data-config-company]').forEach((el) => {
    el.textContent = config.companyName;
  });
}

class App {
  constructor() {
    /** @type {?NavController} */
    this.nav = null;
    /** @type {?FormController} */
    this.form = null;
    /** @type {?RevealController} */
    this.reveal = null;
  }

  /**
   * Initializes all controllers.
   * @return {void}
   */
  init() {
    applySiteConfig(SiteConfig);
    this.nav = new NavController(SiteConfig);
    this.reveal = new RevealController();
    // FormController is a no-op when no form is present on the page.
    this.form = new FormController(SiteConfig);
  }
}

/* ==========================================================================
   7. Entry Point
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
