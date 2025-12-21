// Language Management Module
let currentLang = 'es';

function detectLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // English-speaking country timezones
    const englishTimezones = [
        'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'America/Toronto', 'America/Vancouver', 'Australia/Sydney', 'Australia/Melbourne',
        'Europe/London', 'Europe/Dublin', 'Pacific/Auckland', 'Pacific/Fiji'
    ];

    // Check if browser language is English
    if (userLang.startsWith('en')) {
        return 'en';
    }

    // Check if timezone matches English-speaking country
    if (englishTimezones.some(tz => timezone === tz)) {
        return 'en';
    }

    // Default to Spanish
    return 'es';
}

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    // Update button text for all language toggle buttons
    document.querySelectorAll('.lang-toggle').forEach(btn => {
        btn.textContent = lang === 'es' ? 'EN' : 'ES';
    });

    // Update all language elements
    document.querySelectorAll('.lang-es, .lang-en').forEach(el => {
        el.classList.remove('active', 'active-inline');
    });

    document.querySelectorAll(`.lang-${lang}`).forEach(el => {
        if (el.style.display === 'inline' || el.tagName === 'P' || el.tagName === 'H2' || el.tagName === 'H3') {
            if (getComputedStyle(el.parentElement).display === 'inline') {
                el.classList.add('active-inline');
            } else {
                el.classList.add('active');
            }
        } else {
            el.classList.add('active');
        }
    });

    // Update navigation
    document.querySelectorAll('.nav-text').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });

    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.textContent = btn.getAttribute(`data-${lang}`);
    });

    // Update overlay buttons
    document.querySelectorAll('.project-overlay-btn').forEach(btn => {
        btn.textContent = btn.getAttribute(`data-${lang}`);
    });

    // Update overlay text
    document.querySelectorAll('.project-overlay-text').forEach(text => {
        text.innerHTML = text.getAttribute(`data-${lang}`);
    });
}

function toggleLanguage() {
    setLanguage(currentLang === 'es' ? 'en' : 'es');
}

// Initialize language
function initLanguage() {
    const pathname = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    let lang = 'es'; // Default to Spanish

    // Check URL path for language/region
    if (pathname.includes('/en/') || pathname.endsWith('/en') || searchParams.get('lang') === 'en') {
        lang = 'en';
    } else if (pathname.includes('/mx/') || pathname.includes('/es/') || pathname.endsWith('/mx') || pathname.endsWith('/es')) {
        lang = 'es';
    } else {
        lang = detectLanguage();
    }

    setLanguage(lang);
    sessionStorage.setItem('preferredLanguage', lang);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
} else {
    initLanguage();
}
