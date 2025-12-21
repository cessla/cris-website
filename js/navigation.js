// Navigation & Menu Management Module

function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');

    navLinks.classList.toggle('mobile-open');

    // Change hamburger to X and back
    if (navLinks.classList.contains('mobile-open')) {
        hamburger.textContent = '✕';
    } else {
        hamburger.textContent = '☰';
    }
}

function closeMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');

    if (navLinks.classList.contains('mobile-open')) {
        navLinks.classList.remove('mobile-open');
        hamburger.textContent = '☰';
    }
}

function initNavigation() {
    // Close mobile menu when a link is clicked
    document.querySelectorAll('#navLinks a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}
