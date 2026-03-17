// ============================================
// ELEGANT ELECTRIC NYC — Modern Interactions
// ============================================

// ---- Mobile Menu ----
const createMobileMenu = () => {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');

    if (window.innerWidth <= 768) {
        if (!document.querySelector('.mobile-menu-btn')) {
            const mobileMenuBtn = document.createElement('button');
            mobileMenuBtn.className = 'mobile-menu-btn';
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            mobileMenuBtn.setAttribute('aria-label', 'Toggle menu');

            const logo = document.querySelector('.logo');
            if (logo && logo.parentNode) {
                logo.parentNode.insertBefore(mobileMenuBtn, logo.nextSibling);
            }

            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                mobileMenuBtn.innerHTML = navLinks.classList.contains('active')
                    ? '<i class="fas fa-times"></i>'
                    : '<i class="fas fa-bars"></i>';
            });
        }
    } else {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        if (mobileMenuBtn) mobileMenuBtn.remove();
        if (navLinks) navLinks.classList.remove('active');
    }
};

window.addEventListener('resize', createMobileMenu);
window.addEventListener('load', createMobileMenu);

// ---- Smooth Scrolling ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            const headerOffset = 90;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
                if (mobileMenuBtn) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        }
    });
});

// ---- Header Scroll Effect ----
const header = document.querySelector('header');
let lastScroll = 0;

if (header) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            header.classList.remove('scroll-down');
            return;
        }

        if (currentScroll > lastScroll && currentScroll > 80 && !header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });
}

// ---- Scroll Reveal Animations ----
const initReveal = () => {
    const elements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the animation for sibling elements
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach((el, index) => {
        // Auto-stagger siblings
        const parent = el.parentElement;
        if (parent) {
            const siblings = Array.from(parent.querySelectorAll('.reveal'));
            const siblingIndex = siblings.indexOf(el);
            if (siblingIndex > 0) {
                el.dataset.delay = siblingIndex * 80;
            }
        }
        observer.observe(el);
    });
};

window.addEventListener('load', initReveal);

// ---- Animated Counter ----
const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-number[data-target]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000; // ms
                const startTime = performance.now();

                const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

                const updateCounter = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easedProgress = easeOutQuart(progress);
                    const currentValue = Math.floor(easedProgress * target);

                    counter.textContent = currentValue + (target >= 100 ? '+' : target === 24 ? '/7' : target === 98 ? '%' : '+');

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        // Final value with suffix
                        if (target >= 100) {
                            counter.textContent = target + '+';
                        } else if (target === 24) {
                            counter.textContent = '24/7';
                        } else if (target === 98) {
                            counter.textContent = '98%';
                        } else {
                            counter.textContent = target + '+';
                        }
                    }
                };

                requestAnimationFrame(updateCounter);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
};

window.addEventListener('load', animateCounters);

// ---- Form Validation & Submission ----
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        const requiredFields = contactForm.querySelectorAll('[required]');

        // Remove existing messages
        const existingMsg = contactForm.querySelector('.form-message');
        if (existingMsg) existingMsg.remove();

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#ef4444';
                field.addEventListener('input', function handler() {
                    this.style.borderColor = '';
                    this.removeEventListener('input', handler);
                }, { once: true });
            } else {
                field.style.borderColor = '';
            }
        });

        if (isValid) {
            const msg = document.createElement('div');
            msg.className = 'form-message';
            msg.style.cssText = `
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 1rem 1.25rem;
                border-radius: 14px;
                text-align: center;
                font-weight: 600;
                font-size: 0.95rem;
                animation: fadeInUp 0.4s ease both;
            `;
            msg.textContent = '✓ Thank you! We will get back to you soon.';
            contactForm.appendChild(msg);
            contactForm.reset();
            setTimeout(() => msg.remove(), 5000);
        } else {
            const msg = document.createElement('div');
            msg.className = 'form-message';
            msg.style.cssText = `
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                padding: 1rem 1.25rem;
                border-radius: 14px;
                text-align: center;
                font-weight: 600;
                font-size: 0.95rem;
                animation: fadeInUp 0.4s ease both;
            `;
            msg.textContent = 'Please fill in all required fields.';
            contactForm.appendChild(msg);
            setTimeout(() => msg.remove(), 4000);
        }
    });
}

// ---- Schedule Button ----
const scheduleBtn = document.querySelector('.schedule-btn');
if (scheduleBtn) {
    scheduleBtn.addEventListener('click', () => {
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            const headerOffset = 90;
            const elementPosition = contactSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    });
}

// ---- Dropdown Menu ----
const initDropdowns = () => {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        if (!dropdownContent) return;

        let hideTimeout = null;

        const showDropdown = () => {
            if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
            if (window.innerWidth > 768) {
                dropdownContent.style.display = 'block';
            }
        };

        const hideDropdown = (delay = 200) => {
            if (hideTimeout) clearTimeout(hideTimeout);
            if (window.innerWidth > 768) {
                hideTimeout = setTimeout(() => {
                    dropdownContent.style.display = 'none';
                    hideTimeout = null;
                }, delay);
            }
        };

        dropdown.addEventListener('mouseenter', showDropdown);
        dropdownContent.addEventListener('mouseenter', showDropdown);
        dropdown.addEventListener('mouseleave', () => hideDropdown(200));
        dropdownContent.addEventListener('mouseleave', () => hideDropdown(150));
    });
};

window.addEventListener('load', initDropdowns);
window.addEventListener('resize', () => setTimeout(initDropdowns, 100));

// ---- Scroll-to-Top Button ----
let scrollToTopBtn = null;

const createScrollToTop = () => {
    if (!scrollToTopBtn) {
        scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollToTopBtn.className = 'scroll-to-top';
        scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(scrollToTopBtn);

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 400) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });
};

window.addEventListener('load', createScrollToTop);

// ---- Image Fade In ----
document.querySelectorAll('img').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    if (img.complete) {
        img.style.opacity = '1';
    } else {
        img.addEventListener('load', function () {
            this.style.opacity = '1';
        });
    }
});
