/* ============================================================
   (SECRET) TECHNOLOGIES — MAIN SCRIPT
   Handles header scroll, mobile menu, and reveal animations
   ============================================================ */

(function () {
  'use strict';

  // -----------------------------------------------
  // 1. HEADER SCROLL BEHAVIOR
  // -----------------------------------------------
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  let lastScrollY = 0;
  let headerTicking = false;

  function updateHeader() {
    const scrollY = window.scrollY;
    const heroHeight = hero ? hero.offsetHeight : 600;
    const threshold = heroHeight * 0.12; // Trigger after scrolling 12% of hero

    if (scrollY > threshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScrollY = scrollY;
    headerTicking = false;
  }

  function onScroll() {
    if (!headerTicking) {
      window.requestAnimationFrame(updateHeader);
      headerTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // Initial check
  updateHeader();


  // -----------------------------------------------
  // 2. MOBILE MENU
  // -----------------------------------------------
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation menu');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenu.classList.add('is-open');
    document.body.classList.add('menu-open');

    // Force header to scrolled style when menu is open
    header.classList.add('scrolled');

    // Focus the first link after transition
    setTimeout(function () {
      if (mobileLinks.length > 0) {
        mobileLinks[0].focus();
      }
    }, 100);
  }

  function closeMenu() {
    menuOpen = false;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');

    // Restore header state based on scroll position
    updateHeader();

    // Return focus to toggle
    menuToggle.focus();
  }

  function toggleMenu() {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
  }

  // Close menu on link click
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (menuOpen) {
        closeMenu();
      }
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) {
      closeMenu();
    }
  });

  // Focus trapping inside mobile menu
  if (mobileMenu && menuToggle) {
    mobileMenu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !menuOpen) return;

      const focusable = mobileMenu.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if at first element, go to toggle
        if (document.activeElement === first) {
          e.preventDefault();
          menuToggle.focus();
        }
      } else {
        // Tab: if at last element, go to toggle
        if (document.activeElement === last) {
          e.preventDefault();
          menuToggle.focus();
        }
      }
    });

    // Tab from toggle into menu
    menuToggle.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && menuOpen && !e.shiftKey) {
        e.preventDefault();
        var firstLink = mobileMenu.querySelector('a[href], button');
        if (firstLink) firstLink.focus();
      }
    });
  }

  // Close menu on resize to desktop
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth >= 1024 && menuOpen) {
        closeMenu();
      }
    }, 150);
  });


  // -----------------------------------------------
  // 3. SCROLL REVEAL ANIMATIONS
  // -----------------------------------------------
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initRevealAnimations() {
    // If user prefers reduced motion, show everything immediately
    if (prefersReducedMotion.matches) {
      document.querySelectorAll('.reveal-up').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    // Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal-up').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    // Separate observer for grid cards (staggered reveal)
    var cardObserver = new IntersectionObserver(
      function (entries) {
        // Group intersecting cards by parent to stagger them together
        var groups = {};
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var parent = entry.target.parentElement;
            var key = parent ? parent.className : 'default';
            if (!groups[key]) groups[key] = [];
            groups[key].push(entry.target);
          }
        });

        Object.keys(groups).forEach(function (key) {
          groups[key].forEach(function (card, index) {
            var delay = index * 80;
            card.style.transitionDelay = delay + 'ms';
            card.classList.add('is-visible');
            cardObserver.unobserve(card);

            // Clear the delay after animation so it doesn't affect hover
            setTimeout(function () {
              card.style.transitionDelay = '';
            }, 800 + delay);
          });
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    // Standard observer for non-card reveal elements
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    document.querySelectorAll('.reveal-up').forEach(function (el) {
      if (el.classList.contains('outcome-card')) {
        cardObserver.observe(el);
      } else {
        revealObserver.observe(el);
      }
    });
  }

  // Run on DOM ready (script is deferred, so DOM should be ready)
  initRevealAnimations();

  // Re-check if motion preference changes
  prefersReducedMotion.addEventListener('change', function () {
    if (prefersReducedMotion.matches) {
      document.querySelectorAll('.reveal-up').forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  });


  // -----------------------------------------------
  // 4. SMOOTH SCROLL FOR ANCHOR LINKS
  // -----------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();

        var headerOffset = header ? header.offsetHeight : 80;
        var elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;
        var offsetPosition = elementPosition - headerOffset - 20;

        window.scrollTo({
          top: offsetPosition,
          behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
        });

        // Set focus to target for accessibility
        targetEl.setAttribute('tabindex', '-1');
        targetEl.focus({ preventScroll: true });
      }
    });
  });

})();
