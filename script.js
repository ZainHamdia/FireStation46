// Theme (Light/Dark Mode) Detection, Storage & Multi-Tab Synchronization
function getStoredTheme() {
    try {
        const saved = localStorage.getItem('station46_theme');
        if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    try {
        const match = document.cookie.match(/(?:^|;)\s*station46_theme=([^;]+)/);
        if (match && (match[1] === 'dark' || match[1] === 'light')) return match[1];
    } catch (e) {}
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}

function persistTheme(theme) {
    try {
        localStorage.setItem('station46_theme', theme);
    } catch (e) {}
    try {
        document.cookie = 'station46_theme=' + theme + '; path=/; max-age=31536000; SameSite=Lax';
    } catch (e) {}
}

(function initTheme() {
    const initialTheme = getStoredTheme();
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.documentElement.style.colorScheme = initialTheme;

    // Sync across browser tabs in real-time
    window.addEventListener('storage', (e) => {
        if (e.key === 'station46_theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
            document.documentElement.setAttribute('data-theme', e.newValue);
            document.documentElement.style.colorScheme = e.newValue;
            if (window.updateThemeSwitchUI) {
                window.updateThemeSwitchUI(e.newValue);
            }
        }
    });

    // Listen to OS system preference if user hasn't chosen manually
    if (window.matchMedia) {
        const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = (e) => {
            let hasManualChoice = false;
            try { hasManualChoice = !!localStorage.getItem('station46_theme'); } catch (err) {}
            if (!hasManualChoice) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                document.documentElement.style.colorScheme = newTheme;
                if (window.updateThemeSwitchUI) {
                    window.updateThemeSwitchUI(newTheme);
                }
            }
        };
        if (themeMediaQuery.addEventListener) {
            themeMediaQuery.addEventListener('change', handleSystemChange);
        } else if (themeMediaQuery.addListener) {
            themeMediaQuery.addListener(handleSystemChange);
        }
    }
})();

// Light / Dark Mode Toggle Switch Controller (Bottom-Right Corner)
function setupThemeSwitch() {
    let wrapper = document.getElementById('theme-switch-wrapper');
    if (!wrapper && document.body) {
        wrapper = document.createElement('div');
        wrapper.id = 'theme-switch-wrapper';
        wrapper.className = 'theme-switch-wrapper';
        wrapper.innerHTML = `
            <button type="button" 
                    class="theme-switch-btn" 
                    id="theme-switch-btn" 
                    role="switch" 
                    aria-checked="false" 
                    aria-label="Toggle light and dark mode" 
                    title="Toggle theme">
                <span class="theme-switch-track">
                    <span class="theme-track-icon sun-icon" aria-hidden="true">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="4"></circle>
                            <path d="M12 2v2"></path>
                            <path d="M12 20v2"></path>
                            <path d="m4.93 4.93 1.41 1.41"></path>
                            <path d="m17.66 17.66 1.41 1.41"></path>
                            <path d="M2 12h2"></path>
                            <path d="M20 12h2"></path>
                            <path d="m6.34 17.66-1.41 1.41"></path>
                            <path d="m19.07 4.93-1.41 1.41"></path>
                        </svg>
                    </span>
                    <span class="theme-track-icon moon-icon" aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                        </svg>
                    </span>
                    <span class="theme-switch-thumb">
                        <span class="thumb-icon-sun" aria-hidden="true">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="4"></circle>
                                <path d="M12 2v2"></path>
                                <path d="M12 20v2"></path>
                                <path d="m4.93 4.93 1.41 1.41"></path>
                                <path d="m17.66 17.66 1.41 1.41"></path>
                                <path d="M2 12h2"></path>
                                <path d="M20 12h2"></path>
                                <path d="m6.34 17.66-1.41 1.41"></path>
                                <path d="m19.07 4.93-1.41 1.41"></path>
                            </svg>
                        </span>
                        <span class="thumb-icon-moon" aria-hidden="true">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0.5">
                                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                            </svg>
                        </span>
                    </span>
                </span>
            </button>
            <div class="theme-switch-tooltip" id="theme-switch-tooltip">Switch to Dark Mode</div>
        `;
        document.body.appendChild(wrapper);
    }

    const btn = document.getElementById('theme-switch-btn');
    const tooltip = document.getElementById('theme-switch-tooltip');

    function updateUI(theme) {
        const isDark = theme === 'dark';
        if (btn) {
            btn.setAttribute('aria-checked', isDark ? 'true' : 'false');
            btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
            btn.classList.toggle('dark', isDark);
            btn.classList.toggle('light', !isDark);
        }
        if (tooltip) {
            tooltip.textContent = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        }
    }

    window.updateThemeSwitchUI = updateUI;

    const currentTheme = document.documentElement.getAttribute('data-theme') || getStoredTheme();
    updateUI(currentTheme);

    if (btn && !btn.dataset.switchBound) {
        btn.dataset.switchBound = 'true';
        btn.addEventListener('click', () => {
            const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';

            // Trigger smooth theme transition animation
            document.documentElement.classList.add('theme-transition');
            document.documentElement.setAttribute('data-theme', nextTheme);
            document.documentElement.style.colorScheme = nextTheme;
            persistTheme(nextTheme);
            updateUI(nextTheme);

            window.setTimeout(() => {
                document.documentElement.classList.remove('theme-transition');
            }, 350);
        });
    }
}

// Initialize switch as early as possible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupThemeSwitch);
} else {
    setupThemeSwitch();
}

document.addEventListener('DOMContentLoaded', () => {
    // Secondary check to guarantee switch presence once DOM is fully populated
    setupThemeSwitch();

    // Set current year in footer
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        // Create backdrop overlay if not already in DOM
        let backdrop = document.querySelector('.nav-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'nav-backdrop';
            document.body.appendChild(backdrop);
        }

        const openMenu = () => {
            mobileBtn.classList.add('active');
            navLinks.classList.add('active');
            backdrop.classList.add('active');
            document.body.classList.add('menu-open');
            mobileBtn.setAttribute('aria-expanded', 'true');
        };

        const closeMenu = () => {
            mobileBtn.classList.remove('active');
            navLinks.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.classList.remove('menu-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
        };

        mobileBtn.setAttribute('aria-expanded', 'false');

        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.contains('active');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close when clicking backdrop
        backdrop.addEventListener('click', closeMenu);

        // Close when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });

        // Close if resized to desktop width
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1280 && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Dynamic Active Nav Indicator & Homepage Scrollspy
    const navLinksList = document.querySelectorAll('.nav-links a');
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

    if (isHomePage) {
        const homeLink = document.querySelector('.nav-links a[href="#home"], .nav-links a[href="index.html"]');
        const donateLink = document.querySelector('.nav-links a[href="#donate"], .nav-links a[href$="#donate"]');
        const donateSection = document.getElementById('donate');

        function updateHomeNavActive() {
            if (!navLinksList.length) return;

            const hash = window.location.hash;
            let activateDonate = false;

            if (hash === '#donate') {
                activateDonate = true;
            } else if (donateSection) {
                const rect = donateSection.getBoundingClientRect();
                // When donate section is visible in the upper half of viewport
                if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= 80) {
                    activateDonate = true;
                }
            }

            if (activateDonate && donateLink) {
                navLinksList.forEach(a => a.classList.remove('active'));
                donateLink.classList.add('active');
            } else if (homeLink) {
                navLinksList.forEach(a => a.classList.remove('active'));
                homeLink.classList.add('active');
            }
        }

        window.addEventListener('scroll', updateHomeNavActive, { passive: true });
        window.addEventListener('hashchange', updateHomeNavActive);
        window.addEventListener('load', updateHomeNavActive);
        setTimeout(updateHomeNavActive, 100);

        // Immediate active update on clicking in-page anchor
        document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
            link.addEventListener('click', () => {
                navLinksList.forEach(a => a.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    // Intersection Observer for Fade-in Animations
    const observerOptions = {
        root: null,
        rootMargin: '50px 0px',
        threshold: 0.01
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < (window.innerHeight || document.documentElement.clientHeight) + 50) {
            element.classList.add('visible');
        } else {
            observer.observe(element);
        }
    });
    
    // Real form submission via FormSubmit.co (handles membership & recruitment/inquiry forms)
    const formsToHandle = document.querySelectorAll('.membership-application-form, #membership-application-form, #home-recruit-form, .contact-form');
    formsToHandle.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]') || form.querySelector('button');
            const originalText = btn.textContent;
            
            btn.textContent = 'Sending...';
            btn.style.opacity = '0.8';
            
            // Gather data from within this specific form
            const nameEl = form.querySelector('[name="name"]') || form.querySelector('#name') || form.querySelector('.form-name');
            const emailEl = form.querySelector('[name="email"]') || form.querySelector('#email') || form.querySelector('.form-email');
            const phoneEl = form.querySelector('[name="phone"]') || form.querySelector('#phone') || form.querySelector('.form-phone');
            const typeEl = form.querySelector('[name="membership_type"]') || form.querySelector('[name="topic"]') || form.querySelector('#membership-type') || form.querySelector('.form-type');
            const msgEl = form.querySelector('[name="message"]') || form.querySelector('textarea');

            const name = nameEl ? nameEl.value : '';
            const email = emailEl ? emailEl.value : '';
            const phone = phoneEl ? phoneEl.value : '';
            const topic = typeEl ? typeEl.value : 'General Inquiry';
            const message = msgEl ? msgEl.value : '';

            const isRecruit = form.id === 'membership-application-form' || form.classList.contains('membership-application-form');
            const subject = isRecruit 
                ? "New Membership Application for MTVFC #2 (Station 46)" 
                : `MTVFC #2 Inquiry: ${topic || 'General Contact'}`;

            const payload = {
                name: name,
                email: email,
                phone: phone,
                topic: topic,
                _subject: subject
            };
            if (message) payload.message = message;

            fetch("https://formsubmit.co/ajax/membership@mtvfc2.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(data => {
                btn.textContent = 'Message Sent!';
                btn.style.background = '#2a9d8f'; // Success green color
                form.reset();
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.style.opacity = '1';
                }, 4000);
            })
            .catch(error => {
                console.error('Error:', error);
                btn.textContent = 'Error. Try again.';
                btn.style.background = '#e76f51';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.style.opacity = '1';
                }, 3000);
            });
        });
    });

    // History Accordion Dropdown on About Page
    const historyBtn = document.getElementById('history-dropdown-btn');
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            const isExpanded = historyBtn.getAttribute('aria-expanded') === 'true';
            historyBtn.setAttribute('aria-expanded', !isExpanded);
        });

        // If URL has #history or on hashchange, automatically expand and scroll
        const checkHistoryHash = () => {
            if (window.location.hash === '#history') {
                historyBtn.setAttribute('aria-expanded', 'true');
                setTimeout(() => {
                    historyBtn.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 200);
            }
        };
        checkHistoryHash();
        window.addEventListener('hashchange', checkHistoryHash);
    }

    // Navigation Dropdown Mobile Toggle
    document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const dropdown = toggle.closest('.nav-dropdown');
                if (dropdown) {
                    const isOpen = dropdown.classList.contains('is-open');
                    dropdown.classList.toggle('is-open', !isOpen);
                }
            }
        });
    });

    // Membership cards: Quick select membership type on button click
    document.querySelectorAll('.select-membership-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.getAttribute('data-type');
            const select = document.getElementById('membership-type');
            if (select && type) {
                select.value = type;
                select.dispatchEvent(new Event('change'));
            }
        });
    });


    // Helper: Date Formatter
    function getFormattedDate() {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    }

    // GitHub Cloud Sync Config (syncs updates across all users and devices worldwide)
    // Writes go through the Cloudflare Pages Function at /api/github, which holds the
    // GitHub token as a server-side secret. No credentials are stored in this file.
    const GITHUB_REPO = 'ZainHamdia/FireStation46';
    const GITHUB_PROXY = '/api/github';

    // Helper: Admin credentials for the current browser session (set at login)
    function getAdminCredentials() {
        try {
            return JSON.parse(sessionStorage.getItem('admin_credentials') || 'null');
        } catch (e) {
            return null;
        }
    }

    // Sessions from the old client-side login have no credentials; force a fresh login
    if (sessionStorage.getItem('admin_logged_in') === 'true' && !getAdminCredentials()) {
        sessionStorage.removeItem('admin_logged_in');
    }

    // Helper: Normalize page filename so edits match across localhost, custom domain, and github pages
    function getPageKey() {
        let p = window.location.pathname || '';
        p = p.split('?')[0].split('#')[0];
        p = p.replace(/\/+$/, '');
        let filename = p.substring(p.lastIndexOf('/') + 1);
        if (!filename || filename === '' || filename === '/' || filename === 'index') return 'index.html';
        if (!filename.includes('.')) return filename + '.html';
        return filename.toLowerCase();
    }

    // Helper: Sync data (HTML string or JSON object) to GitHub via the Cloudflare proxy
    async function syncToGitHub(filePath, dataObj, commitMessage) {
        const creds = getAdminCredentials();
        if (!creds) {
            console.error('[Station 46] Not logged in as admin. Please log in again on admin.html to push changes.');
            return false;
        }

        try {
            const contentString = typeof dataObj === 'string' ? dataObj : JSON.stringify(dataObj, null, 2);
            const res = await fetch(GITHUB_PROXY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'save',
                    username: creds.username,
                    password: creds.password,
                    path: filePath,
                    content: contentString,
                    message: commitMessage || `Update ${filePath}`
                })
            });

            const result = await res.json().catch(() => ({}));
            if (res.ok && result.ok) {
                console.log(result.unchanged
                    ? `[Station 46] ${filePath} is already identical on GitHub. Skipping duplicate commit.`
                    : `[Station 46] Successfully synced ${filePath} to GitHub across all devices!`);
                return true;
            }

            if (res.status === 401) {
                sessionStorage.removeItem('admin_credentials');
                sessionStorage.removeItem('admin_logged_in');
            }
            console.error(`[Station 46] GitHub sync error for ${filePath}:`, res.status, result);
            return false;
        } catch (err) {
            console.error(`[Station 46] Network error during ${filePath} sync:`, err);
            return false;
        }
    }

    // Helper: Toast Notification for Admin Actions
    function showAdminToast(message, isError = false) {
        let toast = document.getElementById('admin-toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'admin-toast-notification';
            toast.style.position = 'fixed';
            toast.style.top = '1.5rem';
            toast.style.right = '1.5rem';
            toast.style.zIndex = '999999';
            toast.style.padding = '12px 24px';
            toast.style.borderRadius = '4px';
            toast.style.fontSize = '0.95rem';
            toast.style.fontWeight = '700';
            toast.style.color = '#ffffff';
            toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            toast.style.transition = 'opacity 0.2s ease';
            toast.style.opacity = '0';
            toast.style.fontFamily = 'var(--font-heading, sans-serif)';
            document.body.appendChild(toast);
        }

        toast.innerHTML = message;
        toast.style.background = isError ? '#9b1b24' : '#15803d';
        toast.style.border = isError ? '1px solid #7a151d' : '1px solid #166534';
        toast.style.opacity = '1';

        setTimeout(() => {
            if (toast) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-10px)';
            }
        }, 3500);
    }

    // Helper: Fetch raw text of a file (checks Cloudflare proxy first, then raw GitHub, then local file)
    async function fetchRawFile(filePath) {
        // 1. Cloudflare proxy → GitHub API (always real-time, no cache delay)
        try {
            const apiRes = await fetch(`${GITHUB_PROXY}?path=${encodeURIComponent(filePath)}&t=${Date.now()}`, {
                cache: 'no-store'
            });
            if (apiRes.ok) {
                const result = await apiRes.json();
                if (typeof result.content === 'string') {
                    return result.content;
                }
            }
        } catch (e) {
            console.warn(`[Station 46] Could not fetch ${filePath} from GitHub proxy:`, e);
        }

        // 2. Try raw GitHub
        try {
            const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${filePath}?t=${Date.now()}`;
            const res = await fetch(rawUrl, { cache: 'no-store' });
            if (res.ok) {
                return await res.text();
            }
        } catch (e) {}

        // 3. Fallback to local relative file
        try {
            const localRes = await fetch(`${filePath}?t=${Date.now()}`, { cache: 'no-store' });
            if (localRes.ok) {
                return await localRes.text();
            }
        } catch (e) {}

        return null;
    }

    // Helper: Fetch remote JSON data across devices
    async function fetchRemoteData(filePath) {
        const rawText = await fetchRawFile(filePath);
        if (rawText) {
            try {
                return JSON.parse(rawText);
            } catch (e) {
                console.warn(`[Station 46] Error parsing JSON from ${filePath}:`, e);
            }
        }
        return null;
    }

    // Expose helpers globally for Station 46 systems
    window.syncToGitHub = syncToGitHub;
    window.fetchRemoteData = fetchRemoteData;
    window.showAdminToast = showAdminToast;

    // Helper: Get posts from localStorage
    function getStoredPosts() {
        const posts = localStorage.getItem('station46_posts');
        return posts ? JSON.parse(posts) : [];
    }

    // Helper: Save posts to localStorage & sync to remote database
    async function savePosts(posts) {
        localStorage.setItem('station46_posts', JSON.stringify(posts));
        await syncToGitHub('data/posts.json', posts, 'Admin: Update news posts');
    }

    // Helper: Escape HTML to prevent XSS (safe against null/undefined)
    function escapeHtml(unsafe) {
        if (unsafe === undefined || unsafe === null) return '';
        return String(unsafe)
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    // Supported Font Family Library (Google Fonts & Web-Safe Fonts)
    const SUPPORTED_FONTS = [
        { name: 'Default (Inherit)', value: 'inherit', google: null },
        { name: 'Inter (Modern Sans)', value: "'Inter', sans-serif", google: 'Inter:wght@400;500;600;700' },
        { name: 'Roboto (Clean Sans)', value: "'Roboto', sans-serif", google: 'Roboto:wght@400;500;700' },
        { name: 'Montserrat (Bold Geometric)', value: "'Montserrat', sans-serif", google: 'Montserrat:wght@400;600;700;800' },
        { name: 'Open Sans (Humanist)', value: "'Open Sans', sans-serif", google: 'Open+Sans:wght@400;600;700' },
        { name: 'Lato (Contemporary Sans)', value: "'Lato', sans-serif", google: 'Lato:wght@400;700' },
        { name: 'Poppins (Geometric Friendly)', value: "'Poppins', sans-serif", google: 'Poppins:wght@400;500;600;700' },
        { name: 'Oswald (Condensed Display)', value: "'Oswald', sans-serif", google: 'Oswald:wght@400;600;700' },
        { name: 'Bebas Neue (Headline Bold)', value: "'Bebas Neue', sans-serif", google: 'Bebas+Neue' },
        { name: 'Anton (Ultra Bold Poster)', value: "'Anton', sans-serif", google: 'Anton' },
        { name: 'Playfair Display (Editorial Serif)', value: "'Playfair Display', serif", google: 'Playfair+Display:wght@400;600;700' },
        { name: 'Merriweather (Classic Literary)', value: "'Merriweather', serif", google: 'Merriweather:wght@400;700' },
        { name: 'Cinzel (Civic / Roman)', value: "'Cinzel', serif", google: 'Cinzel:wght@500;700' },
        { name: 'Space Grotesk (Tech Modern)', value: "'Space Grotesk', sans-serif", google: 'Space+Grotesk:wght@500;700' },
        { name: 'Arial (System Sans)', value: 'Arial, Helvetica, sans-serif', google: null },
        { name: 'Georgia (System Serif)', value: 'Georgia, serif', google: null },
        { name: 'Courier New (Monospace)', value: "'Courier New', Courier, monospace", google: null }
    ];

    function loadGoogleFont(fontValue) {
        if (!fontValue || fontValue === 'inherit') return;
        const font = SUPPORTED_FONTS.find(f => f.value === fontValue || fontValue.toLowerCase().includes(f.name.toLowerCase().split(' ')[0]));
        if (!font || !font.google) return;
        const fontId = 'font-link-' + font.google.split(':')[0].replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        if (document.getElementById(fontId)) return;
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`;
        document.head.appendChild(link);
    }

    // Comprehensive Editable Selectors (covering all content text across every page)
    const editableSelectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'blockquote', 'figcaption', 'address',
        'li', 'dt', 'dd',
        'a', 'button',
        '.btn', '.btn-primary', '.btn-secondary', '.btn-action',
        'span', 'strong', 'b', 'em', 'i', 'label', 'small', 'cite', 'summary',
        'td', 'th',
        '.hero-title', '.hero-subtitle', '.hero-desc',
        '.section-title', '.section-subtitle',
        '.stat-number', '.stat-label', '.stat-year-badge', '.stat-row-label', '.stat-row-value', '.stat-unit',
        '.rank-badge', '.roster-name', '.roster-avatar', '.roster-category-title',
        '.card-title', '.card-desc', '.card-text', '.card-img-placeholder',
        '.santa-badge', '.date-card-title', '.date-card-subtitle',
        '.guideline-num', '.guideline-text h4', '.guideline-text p',
        '.printable-form-preview h3', '.printable-form-preview p',
        '.faq-question', '.faq-question > span', '.faq-answer p',
        '.donation-desc', '.form-note', '.mailing-box',
        '.footer-info p', '.footer-brand span', '.footer-links a', '.footer-copy',
        '.top-bar-item', '.top-bar-link',
        '.tag-new', '.news-card-tag', '.recent-post-tag', '.membership-badge-tag',
        '.role-badge-tag', '.upcoming-badge-tag', '.blueprint-tag', '.badge', '.top-bar-badge',
        '.custom-spotlight-caption', '.custom-card-title', '.custom-card-desc', '.custom-lead-text',
        '.custom-faq-q', '.custom-callout-title', '.custom-callout-text', '.custom-stat-num',
        '.custom-stat-label', '.custom-stat-sub', '.custom-gallery-caption'
    ].join(', ');

    // Helper: Check if element is allowed to be edited
    function isEditableElement(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;

        // Technical / system / non-content elements
        const tagName = element.tagName.toUpperCase();
        if (['SCRIPT', 'STYLE', 'LINK', 'META', 'SVG', 'PATH', 'POLYLINE', 'CIRCLE', 'RECT', 'LINE', 'IMG', 'IFRAME', 'VIDEO', 'AUDIO', 'CANVAS', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].includes(tagName)) {
            return false;
        }

        // On admin.html, only the welcome heading is editable; never edit admin management controls
        const isCurrentAdminPage = window.location.pathname.endsWith('admin.html') || window.location.pathname.includes('admin.html');
        if (isCurrentAdminPage && element.id !== 'admin-welcome-heading') {
            return false;
        }

        // Never edit internal admin controls, floating bar, font toolbar, modals, or toasts
        if (element.closest('#admin-floating-bar') ||
            element.closest('#admin-font-toolbar') ||
            element.closest('.admin-font-modal-overlay') ||
            element.closest('#admin-toast-notification') ||
            element.closest('#admin-posts-list-container') ||
            element.closest('#admin-dashboard-view') ||
            element.closest('#admin-login-view') ||
            element.closest('.admin-form-container') ||
            element.closest('.admin-dashboard') ||
            element.closest('#admin-login-form') ||
            element.closest('#admin-publish-form')) {
            if (element.id !== 'admin-welcome-heading') return false;
        }

        // Never edit system/automated widgets: storm banner/hub, theme toggle, mobile hamburger toggle, dynamic year
        if (element.closest('#theme-switch-wrapper') ||
            element.closest('.theme-switch-btn') ||
            element.closest('.mobile-menu-btn') ||
            element.closest('#station46-storm-banner') ||
            element.closest('#station46-storm-floating-pill') ||
            element.closest('#storm-hub-modal') ||
            element.closest('.storm-modal-backdrop') ||
            element.closest('#admin-weather-card') ||
            element.closest('.storm-toggle-btn') ||
            element.id === 'year' ||
            element.classList.contains('roster-card-remove-btn') ||
            element.classList.contains('btn-roster-add-member') ||
            element.classList.contains('roster-card-drag-handle') ||
            element.classList.contains('roster-drag-placeholder') ||
            element.classList.contains('roster-card-tag-btn') ||
            element.classList.contains('roster-tag-delete-btn') ||
            element.closest('.roster-modal-overlay') ||
            element.closest('.station-slider-admin-actions') ||
            element.closest('.slider-card-admin-controls') ||
            element.classList.contains('stat-row-remove-btn') ||
            element.classList.contains('slider-nav-btn') ||
            element.classList.contains('slider-dot') ||
            element.classList.contains('apparatus-card-remove-btn') ||
            element.classList.contains('apparatus-card-drag-handle') ||
            element.classList.contains('apparatus-move-btn') ||
            element.closest('.apparatus-card-admin-header') ||
            element.closest('.apparatus-drag-placeholder') ||
            element.classList.contains('btn-apparatus-add') ||
            element.closest('.apparatus-admin-actions') ||
            element.closest('.apparatus-add-modal-overlay') ||
            element.closest('#apparatus-modal') ||
            element.closest('.station-builder-modal-overlay') ||
            element.closest('.section-admin-bar') ||
            element.closest('.section-insert-divider') ||
            element.classList.contains('section-card-add-btn') ||
            element.classList.contains('card-admin-remove-btn') ||
            element.classList.contains('section-item-upload-btn') ||
            element.classList.contains('section-admin-btn') ||
            element.classList.contains('section-insert-divider-btn') ||
            element.closest('form')) {
            return false;
        }

        // Skip non-text icons
        if (element.closest('.info-card-icon') ||
            element.closest('.donation-list-icon') ||
            element.closest('.date-icon-box') ||
            element.closest('.paypal-badge') ||
            element.closest('.empty-state-icon') ||
            element.closest('.search-icon') ||
            element.closest('.nav-badge-img') ||
            element.closest('.footer-badge-img')) {
            return false;
        }

        // Skip major layout containers that enclose nested block content
        const layoutContainers = ['HTML', 'BODY', 'MAIN', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'NAV', 'ASIDE', 'TABLE', 'TBODY', 'THEAD', 'TR', 'UL', 'OL', 'FORM'];
        if (layoutContainers.includes(tagName)) {
            return false;
        }

        // If this element contains nested block containers, skip the outer wrapper so inner text elements are editable
        if (element.querySelector('h1, h2, h3, h4, h5, h6, p, ul, ol, table, section, article, header, footer')) {
            return false;
        }

        return true;
    }

    // Helper: Generate a stable DOM path selector for each element to avoid index-shifting bugs
    function getElementSelectorPath(el) {
        if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
        if (el.id) return `#${el.id}`;
        
        let path = [];
        let current = el;
        while (current && current.nodeType === Node.ELEMENT_NODE && current.tagName !== 'BODY' && current.tagName !== 'HTML') {
            let selector = current.tagName.toLowerCase();
            if (current.id) {
                selector = `#${current.id}`;
                path.unshift(selector);
                break;
            } else {
                let parent = current.parentElement;
                if (parent) {
                    let siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
                    if (siblings.length > 1) {
                        let idx = siblings.indexOf(current) + 1;
                        selector += `:nth-of-type(${idx})`;
                    }
                }
                path.unshift(selector);
            }
            current = current.parentElement;
        }
        return path.join(' > ');
    }

    // Helper: Collect all editable elements in deterministic DOM order without duplicate nesting
    function getEditableElements(root = document) {
        const list = [];
        const seen = new Set();

        // 1. Matched by standard editable selectors
        root.querySelectorAll(editableSelectors).forEach(el => {
            if (isEditableElement(el) && !seen.has(el)) {
                seen.add(el);
                list.push(el);
            }
        });

        // 2. Also match any element that directly contains visible text (e.g. unclassed divs, badges, notes)
        root.querySelectorAll('div').forEach(el => {
            if (!seen.has(el) && isEditableElement(el)) {
                const hasDirectText = Array.from(el.childNodes).some(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim().length > 0);
                if (hasDirectText && !el.querySelector('div, p, h1, h2, h3, h4, h5, h6, ul, ol')) {
                    seen.add(el);
                    list.push(el);
                }
            }
        });

        // De-duplicate: If an element's ancestor is already directly editable, don't double-register child inline elements
        return list.filter(el => {
            let p = el.parentElement;
            while (p && p !== root) {
                if (seen.has(p)) return false;
                p = p.parentElement;
            }
            return true;
        });
    }

    // Helper: Client-side Image Compression to avoid QuotaExceededError in localStorage
    function compressImage(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Scale down if larger than 800px
                const maxDim = 800;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress as JPEG with 0.7 quality
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                callback(compressedBase64);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Inline CMS / Text Editing Backdoor
    const isAdminLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    let editModeActive = true;

    // Clean up legacy index-based corrupted edits from older versions
    (function cleanupLegacyEdits() {
        try {
            const stored = localStorage.getItem('station46_text_edits');
            if (stored) {
                const raw = JSON.parse(stored);
                let changed = false;
                for (const k in raw) {
                    if (k.match(/^edit_text_[a-zA-Z0-9_\-\.]+\.html_\d+$/)) {
                        delete raw[k];
                        changed = true;
                    }
                }
                if (changed) {
                    localStorage.setItem('station46_text_edits', JSON.stringify(raw));
                }
            }
        } catch(e) {
            localStorage.removeItem('station46_text_edits');
        }
    })();

    function getStoredTextEdits() {
        const edits = localStorage.getItem('station46_text_edits');
        return edits ? JSON.parse(edits) : {};
    }

    function saveTextEdit(key, value) {
        const edits = getStoredTextEdits();
        edits[key] = value;
        localStorage.setItem('station46_text_edits', JSON.stringify(edits));
    }

    function saveFontEdit(key, fontValue) {
        const edits = getStoredTextEdits();
        if (fontValue && fontValue !== 'inherit') {
            edits[key] = fontValue;
        } else {
            delete edits[key];
        }
        localStorage.setItem('station46_text_edits', JSON.stringify(edits));
    }

    function applyTextEdits(edits) {
        if (!edits || typeof edits !== 'object') return;
        const pageKey = getPageKey();

        // Apply global typography settings if present
        if (edits['global_heading_font']) {
            document.documentElement.style.setProperty('--font-heading', edits['global_heading_font']);
            loadGoogleFont(edits['global_heading_font']);
        }
        if (edits['global_body_font']) {
            document.documentElement.style.setProperty('--font-body', edits['global_body_font']);
            loadGoogleFont(edits['global_body_font']);
        }

        const elements = getEditableElements();
        elements.forEach((element) => {
            const selectorPath = getElementSelectorPath(element);
            const storageKey = `edit_v2_${pageKey}_${selectorPath}`;
            const fontKey = `font_v2_${pageKey}_${selectorPath}`;

            // Apply element-specific font
            if (edits[fontKey]) {
                element.style.fontFamily = edits[fontKey];
                loadGoogleFont(edits[fontKey]);
            }

            if (edits[storageKey] !== undefined && edits[storageKey] !== null) {
                if (document.activeElement !== element) {
                    const val = edits[storageKey];
                    // Safety: Never inject full paragraphs or block tags into inline elements or tags
                    if ((element.classList.contains('stat-number') || element.classList.contains('stat-label') || element.classList.contains('filter-count') || element.classList.contains('roster-avatar') || element.classList.contains('tag-new')) && (val.includes('<p') || val.length > 50)) {
                        return;
                    }
                    element.innerHTML = val;
                }
            }
        });
    }

    // Apply local edits immediately on page load
    applyTextEdits(getStoredTextEdits());

    // ==========================================
    // Universal Picture Editing Data & Persistence
    // ==========================================
    const STATION_MEDIA_ASSETS = [
        { src: 'truck46.jpg', name: 'Truck 46 (Aerialscope)', category: 'apparatus' },
        { src: 'engine46-8.jpg', name: 'Engine 46-8 (Pierce Enforcer)', category: 'apparatus' },
        { src: 'engine46-7.jpg', name: 'Engine 46-7 (Rescue Pumper)', category: 'apparatus' },
        { src: 'rescue46.jpg', name: 'Rescue 46 (SVI)', category: 'apparatus' },
        { src: 'brush46.jpg', name: 'Brush 46', category: 'apparatus' },
        { src: 'car46.jpg', name: 'Car 46 (Chief)', category: 'apparatus' },
        { src: 'car462.jpg', name: 'Car 46-2 (Deputy Chief)', category: 'apparatus' },
        { src: 'marine46.jpg', name: 'Marine 46 (Rescue Boat)', category: 'apparatus' },
        { src: 'hero-bg.jpg', name: 'Station 46 Headquarters', category: 'station' },
        { src: 'apparatus-bg.jpg', name: 'Apparatus Bay Interior', category: 'station' },
        { src: 'drill-1.jpg', name: 'Drill: Live Fire Training', category: 'training' },
        { src: 'drill-2.jpg', name: 'Drill: Structural Burn', category: 'training' },
        { src: 'drill-3.jpg', name: 'Drill: Vehicle Extrication', category: 'training' },
        { src: 'drill-4.jpg', name: 'Drill: Ladder & Roof Ventilation', category: 'training' },
        { src: 'drill-5.jpg', name: 'Drill: Hose Line Advance', category: 'training' },
        { src: 'family.jpg', name: 'Station 46 Family & Volunteers', category: 'community' },
        { src: 'class2.jpg', name: 'Company Officers Class', category: 'community' },
        { src: 'christmas.jpg', name: 'Santa Tour Fire Truck', category: 'community' },
        { src: 'santapath.png', name: 'District Route Map', category: 'documents' },
        { src: 'retired108.jpg', name: 'Retired 108 (Mack Pumper)', category: 'retired' },
        { src: 'retiredbrush.jpg', name: 'Retired Ford Brush', category: 'retired' },
        { src: 'retiredtower.jpg', name: 'Retired Tower 46', category: 'retired' },
        { src: 'blueprint-1.jpg', name: 'Rescue Blueprint (Elevations)', category: 'blueprints' },
        { src: 'blueprint-2.jpg', name: 'Rescue Blueprint (Layout)', category: 'blueprints' },
        { src: 'blueprint-3.jpg', name: 'Rescue Blueprint (Interior)', category: 'blueprints' },
        { src: 'logo.png', name: 'Station 46 Official Seal', category: 'station' }
    ];

    function getStoredImageEdits() {
        try {
            const stored = localStorage.getItem('station46_image_edits');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }

    function saveImageEdit(pageKey, selectorPath, src, isBackground = false) {
        const edits = getStoredImageEdits();
        const key = `${isBackground ? 'bg' : 'img'}_v2_${pageKey}_${selectorPath}`;
        edits[key] = src;
        localStorage.setItem('station46_image_edits', JSON.stringify(edits));
    }

    function applyImageEdits(edits = getStoredImageEdits()) {
        if (!edits || typeof edits !== 'object') return;
        const pageKey = getPageKey();

        for (const key in edits) {
            if (!key.includes(`_${pageKey}_`)) continue;
            const isBg = key.startsWith('bg_v2_');
            const selectorPath = key.replace(/^(?:bg|img)_v2_[^_]+_/, '');
            const src = edits[key];
            if (!src) continue;

            try {
                const el = document.querySelector(selectorPath);
                if (el) {
                    if (isBg) {
                        if (el.classList.contains('card-img-placeholder')) {
                            el.style.background = `linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.45)), url("${src}") center/cover`;
                            el.style.color = 'white';
                            el.style.fontWeight = '800';
                            el.style.textShadow = '0 2px 8px rgba(0,0,0,0.9)';
                        } else if (el.classList.contains('hero-bg') || el.classList.contains('hero') || el.classList.contains('small-hero') || el.classList.contains('custom-hero-mini-wrap')) {
                            el.style.backgroundImage = `linear-gradient(rgba(15, 25, 43, 0.25), rgba(15, 25, 43, 0.48)), url("${src}")`;
                            el.style.backgroundSize = 'cover';
                            el.style.backgroundPosition = 'center';
                        } else {
                            el.style.backgroundImage = `url("${src}")`;
                            el.style.backgroundSize = 'cover';
                            el.style.backgroundPosition = 'center';
                        }
                    } else if (el.tagName === 'IMG') {
                        el.src = src;
                    }
                }
            } catch (e) {}
        }
    }

    // Apply local image edits immediately on page load
    applyImageEdits(getStoredImageEdits());

    // ==========================================
    // Roster Management System (Add/Remove Members & Initials)
    // ==========================================
    const ROSTER_SECTIONS = {
        'line-officers': {
            title: 'Fire Line Officers',
            gridClass: 'roster-grid-modern roster-grid-officers',
            cardTier: 'tier-line-officer',
            avatarClass: 'avatar-line',
            defaultBadge: 'badge-line',
            ranks: ['Fire Chief', 'Deputy Chief', 'Captain', 'Lieutenant', 'Chief Engineer']
        },
        'company-officers': {
            title: 'Company Officers',
            gridClass: 'roster-grid-modern roster-grid-officers',
            cardTier: 'tier-company-officer',
            avatarClass: 'avatar-company',
            defaultBadge: 'badge-company',
            ranks: ['President', '1st Vice President', '2nd Vice President', '3rd Vice President', 'Treasurer', 'Recording Secretary', 'Corresponding Secretary', 'Trustee']
        },
        'firefighters': {
            title: 'Interior Firefighters',
            gridClass: 'roster-grid-modern',
            cardTier: '',
            avatarClass: 'avatar-firefighter',
            defaultBadge: 'badge-firefighter',
            ranks: ['Interior Firefighter', 'Exterior Firefighter', 'Probationary Firefighter']
        },
        'juniors': {
            title: 'Junior Firefighters',
            gridClass: 'roster-grid-modern',
            cardTier: '',
            avatarClass: 'avatar-junior',
            defaultBadge: 'badge-junior',
            ranks: ['Junior Firefighter']
        },
        'fire-police': {
            title: 'Fire Police',
            gridClass: 'roster-grid-modern',
            cardTier: '',
            avatarClass: 'avatar-police',
            defaultBadge: 'badge-police',
            ranks: ['Captain (Fire Police)', 'Sergeant (Fire Police)', 'Corporal (Fire Police)', 'Fire Police']
        },
        'associate-members': {
            title: 'Associate Members',
            gridClass: 'roster-grid-modern',
            cardTier: '',
            avatarClass: 'avatar-associate',
            defaultBadge: 'badge-associate',
            ranks: ['Associate Member']
        }
    };

    function computeInitials(name) {
        if (!name) return '';
        const primaryName = name.split('&')[0].split(/\band\b/i)[0].trim();
        const clean = primaryName.replace(/[^a-zA-Z\s]/g, ' ').trim();
        const parts = clean.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function getCleanRosterHtml() {
        const container = document.getElementById('roster-container');
        if (!container) return null;
        const clone = container.cloneNode(true);
        // Remove admin-only controls, drag handles, modal, placeholders, tag delete buttons, and image edit overlays
        clone.querySelectorAll('.roster-card-remove-btn, .btn-roster-add-member, .roster-modal-overlay, .roster-card-drag-handle, .roster-drag-placeholder, .roster-card-tag-btn, .roster-tag-delete-btn, .station-image-change-btn').forEach(el => el.remove());
        // Clean runtime markers on tag-new elements
        clone.querySelectorAll('.tag-new').forEach(tag => {
            const delBtn = tag.querySelector('.roster-tag-delete-btn');
            if (delBtn) delBtn.remove();
            tag.removeAttribute('data-tag-control-init');
            tag.removeAttribute('title');
            tag.removeAttribute('role');
            tag.removeAttribute('tabindex');
            tag.removeAttribute('contenteditable');
            const cleanText = tag.textContent.trim().toUpperCase();
            tag.textContent = cleanText || 'NEW';
        });
        // Remove contenteditable and draggable attributes and runtime markers
        clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        clone.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
        clone.querySelectorAll('[data-editor-init]').forEach(el => el.removeAttribute('data-editor-init'));
        clone.querySelectorAll('[data-drag-init]').forEach(el => el.removeAttribute('data-drag-init'));
        clone.querySelectorAll('[data-drag-grid-init]').forEach(el => el.removeAttribute('data-drag-grid-init'));
        clone.querySelectorAll('.roster-card-dragging, .roster-grid-drag-hover, .roster-card-draggable').forEach(el => {
            el.classList.remove('roster-card-dragging', 'roster-grid-drag-hover', 'roster-card-draggable');
        });
        return clone.innerHTML;
    }

    function saveRosterState() {
        const cleanHtml = getCleanRosterHtml();
        if (cleanHtml !== null) {
            localStorage.setItem('station46_roster_html', cleanHtml);
        }
    }

    function setupCardTagControl(card) {
        if (!isAdminLoggedIn) return;

        const existingTag = card.querySelector('.tag-new');
        const existingTagBtn = card.querySelector('.roster-card-tag-btn');
        const nameEl = card.querySelector('.roster-name');
        const memberName = nameEl ? nameEl.textContent.trim() : (card.getAttribute('data-name') || 'this member');

        if (existingTag) {
            if (existingTagBtn) existingTagBtn.remove();
            existingTag.setAttribute('contenteditable', editModeActive ? 'true' : 'false');
            existingTag.title = 'Click to edit tag text';

            // Ensure delete button exists inside existingTag
            let delBtn = existingTag.querySelector('.roster-tag-delete-btn');
            if (!delBtn) {
                delBtn = document.createElement('button');
                delBtn.type = 'button';
                delBtn.className = 'roster-tag-delete-btn';
                delBtn.title = `Remove tag from ${memberName}`;
                delBtn.innerHTML = '✕';
                delBtn.setAttribute('contenteditable', 'false');
                existingTag.appendChild(delBtn);
            }

            if (existingTag.dataset.tagControlInit !== 'true') {
                existingTag.dataset.tagControlInit = 'true';

                // Save tag edits on input & blur
                existingTag.addEventListener('input', () => {
                    saveRosterState();
                });

                existingTag.addEventListener('blur', () => {
                    const clone = existingTag.cloneNode(true);
                    const btn = clone.querySelector('.roster-tag-delete-btn');
                    if (btn) btn.remove();
                    const text = clone.textContent.trim().toUpperCase();
                    if (!text) {
                        existingTag.remove();
                        setupCardTagControl(card);
                        saveRosterState();
                        showAdminToast(`✅ Removed tag from ${memberName}.`);
                    } else {
                        const currentDel = existingTag.querySelector('.roster-tag-delete-btn');
                        existingTag.textContent = text;
                        if (currentDel) existingTag.appendChild(currentDel);
                        saveRosterState();
                    }
                });

                existingTag.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        existingTag.blur();
                    }
                });

                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    existingTag.remove();
                    setupCardTagControl(card);
                    saveRosterState();
                    showAdminToast(`✅ Removed tag from ${memberName}. Click '💾 Save & Push to Git' to publish.`);
                });
            }
        } else {
            if (!existingTagBtn) {
                const tagBtn = document.createElement('button');
                tagBtn.type = 'button';
                tagBtn.className = 'roster-card-tag-btn';
                tagBtn.title = `Add custom tag to ${memberName}`;
                tagBtn.setAttribute('aria-label', `Add custom tag to ${memberName}`);
                tagBtn.innerHTML = '+ Tag';

                tagBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const tagText = (prompt(`Enter tag text for ${memberName} (e.g. NEW, PROBATIONARY, DRIVER):`, 'NEW') || '').trim();
                    if (!tagText) return;

                    const newTag = document.createElement('span');
                    newTag.className = 'tag-new';
                    newTag.textContent = tagText.toUpperCase();

                    const delBtn = document.createElement('button');
                    delBtn.type = 'button';
                    delBtn.className = 'roster-tag-delete-btn';
                    delBtn.title = `Remove tag from ${memberName}`;
                    delBtn.innerHTML = '✕';
                    delBtn.setAttribute('contenteditable', 'false');
                    newTag.appendChild(delBtn);

                    card.insertBefore(newTag, card.firstChild);

                    setupCardTagControl(card);
                    saveRosterState();
                    showAdminToast(`✅ Added "${tagText.toUpperCase()}" tag to ${memberName}. Click '💾 Save & Push to Git' to publish.`);
                });

                card.appendChild(tagBtn);
            }
        }
    }

    function attachRemoveButton(card) {
        if (!isAdminLoggedIn || card.querySelector('.roster-card-remove-btn')) return;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'roster-card-remove-btn';
        removeBtn.title = 'Remove this member';
        removeBtn.setAttribute('aria-label', 'Remove member');
        removeBtn.innerHTML = '✕';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const nameEl = card.querySelector('.roster-name');
            const memberName = nameEl ? nameEl.textContent.trim() : (card.getAttribute('data-name') || 'this member');
            if (confirm(`Are you sure you want to remove "${memberName}" from the roster?`)) {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.85)';
                setTimeout(() => {
                    card.remove();
                    saveRosterState();
                    showAdminToast(`✅ Removed ${memberName} from roster.`);
                }, 300);
            }
        });
        card.appendChild(removeBtn);
    }

    function attachAddButtons() {
        if (!isAdminLoggedIn) return;
        const sections = document.querySelectorAll('.roster-category-section');
        sections.forEach(section => {
            const header = section.querySelector('.roster-category-header');
            if (!header || header.querySelector('.btn-roster-add-member')) return;
            const category = section.getAttribute('data-section-category') || 'firefighters';
            const addBtn = document.createElement('button');
            addBtn.className = 'btn-roster-add-member';
            addBtn.setAttribute('data-section', category);
            addBtn.innerHTML = '+ Add Member';
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openAddMemberModal(category);
            });
            header.appendChild(addBtn);
        });
    }

    function createAddMemberModal() {
        if (document.getElementById('roster-add-member-modal')) return;

        const overlay = document.createElement('div');
        overlay.id = 'roster-add-member-modal';
        overlay.className = 'roster-modal-overlay';
        overlay.innerHTML = `
            <div class="roster-modal-card">
                <div class="roster-modal-header">
                    <h3 class="roster-modal-title">Add New Member</h3>
                    <p class="roster-modal-subtitle" id="roster-modal-section-label">Section</p>
                </div>
                <form class="roster-modal-form" id="roster-add-member-form">
                    <input type="hidden" id="roster-member-category" value="firefighters">
                    <div class="form-group">
                        <label for="roster-member-name">Member Full Name</label>
                        <input type="text" id="roster-member-name" placeholder="e.g. Jane Doe" required autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label for="roster-member-initials">Avatar Initials</label>
                        <input type="text" id="roster-member-initials" placeholder="e.g. JD" maxlength="4" style="text-transform: uppercase;" required autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label for="roster-member-rank">Rank / Role</label>
                        <select id="roster-member-rank" required></select>
                    </div>
                    <div class="form-group" id="roster-custom-rank-group" style="display: none;">
                        <label for="roster-member-custom-rank">Custom Rank / Role</label>
                        <input type="text" id="roster-member-custom-rank" placeholder="Enter custom rank">
                    </div>
                    <div class="form-group" style="margin-bottom: 1.25rem;">
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <label for="roster-member-tag-new" style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--navy-blue); font-size: 0.95rem; user-select: none;">
                                <input type="checkbox" id="roster-member-tag-new" style="width: 17px; height: 17px; cursor: pointer; accent-color: #10b981;">
                                <span>Add <strong>Tag / Badge</strong></span>
                            </label>
                            <div id="roster-member-tag-input-container" style="display: none; align-items: center; gap: 6px; flex: 1; min-width: 140px;">
                                <input type="text" id="roster-member-tag-text" placeholder="Tag text (e.g. NEW, PROBATIONARY)" value="NEW" style="padding: 6px 10px; font-size: 0.85rem; border-radius: 4px; border: 1px solid #cbd5e1; width: 100%;">
                            </div>
                        </div>
                    </div>
                    <div class="roster-modal-actions">
                        <button type="button" class="btn btn-roster-cancel" id="roster-modal-cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="roster-modal-submit-btn">Add Member</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        const form = overlay.querySelector('#roster-add-member-form');
        const nameInput = overlay.querySelector('#roster-member-name');
        const initialsInput = overlay.querySelector('#roster-member-initials');
        const rankSelect = overlay.querySelector('#roster-member-rank');
        const customRankGroup = overlay.querySelector('#roster-custom-rank-group');
        const customRankInput = overlay.querySelector('#roster-member-custom-rank');
        const tagNewCheckbox = overlay.querySelector('#roster-member-tag-new');
        const tagInputContainer = overlay.querySelector('#roster-member-tag-input-container');
        const cancelBtn = overlay.querySelector('#roster-modal-cancel-btn');

        if (tagNewCheckbox && tagInputContainer) {
            tagNewCheckbox.addEventListener('change', () => {
                tagInputContainer.style.display = tagNewCheckbox.checked ? 'flex' : 'none';
            });
        }

        let autoInitials = true;

        if (nameInput && initialsInput) {
            nameInput.addEventListener('input', () => {
                if (autoInitials) {
                    initialsInput.value = computeInitials(nameInput.value);
                }
            });

            initialsInput.addEventListener('input', () => {
                autoInitials = false;
                initialsInput.value = initialsInput.value.toUpperCase();
            });
        }

        if (rankSelect && customRankGroup && customRankInput) {
            rankSelect.addEventListener('change', () => {
                if (rankSelect.value === '__custom__') {
                    customRankGroup.style.display = 'block';
                    customRankInput.required = true;
                    customRankInput.focus();
                } else {
                    customRankGroup.style.display = 'none';
                    customRankInput.required = false;
                }
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                overlay.classList.remove('active');
            });
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });

        if (form && nameInput && initialsInput && rankSelect) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const categoryInput = overlay.querySelector('#roster-member-category');
                const category = categoryInput ? categoryInput.value : 'firefighters';
                const name = nameInput.value.trim();
                const initials = initialsInput.value.trim().toUpperCase() || computeInitials(name);
                const role = (rankSelect.value === '__custom__' && customRankInput) ? customRankInput.value.trim() : rankSelect.value;
                const isNew = tagNewCheckbox ? tagNewCheckbox.checked : false;
                const tagTextInput = overlay.querySelector('#roster-member-tag-text');
                const tagText = isNew ? ((tagTextInput && tagTextInput.value.trim()) ? tagTextInput.value.trim().toUpperCase() : 'NEW') : '';
                if (!name || !role) return;

                addMemberToSection(category, name, role, initials, isNew, tagText);
                overlay.classList.remove('active');
                form.reset();
                if (tagNewCheckbox) tagNewCheckbox.checked = false;
                if (tagInputContainer) tagInputContainer.style.display = 'none';
                autoInitials = true;
            });
        }
    }

    function openAddMemberModal(category) {
        createAddMemberModal();
        const overlay = document.getElementById('roster-add-member-modal');
        if (!overlay) return;
        const config = ROSTER_SECTIONS[category] || ROSTER_SECTIONS['firefighters'];
        const sectionLabel = overlay.querySelector('#roster-modal-section-label');
        const catInput = overlay.querySelector('#roster-member-category');
        const rankSelect = overlay.querySelector('#roster-member-rank');
        const customRankGroup = overlay.querySelector('#roster-custom-rank-group');
        const nameInput = overlay.querySelector('#roster-member-name');
        const initialsInput = overlay.querySelector('#roster-member-initials');
        const tagNewCheckbox = overlay.querySelector('#roster-member-tag-new');
        const tagInputContainer = overlay.querySelector('#roster-member-tag-input-container');

        if (sectionLabel) sectionLabel.textContent = `Section: ${config.title}`;
        if (catInput) catInput.value = category;
        if (tagNewCheckbox) tagNewCheckbox.checked = false;
        if (tagInputContainer) tagInputContainer.style.display = 'none';

        if (rankSelect) {
            rankSelect.innerHTML = '';
            config.ranks.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r;
                opt.textContent = r;
                rankSelect.appendChild(opt);
            });

            const customOpt = document.createElement('option');
            customOpt.value = '__custom__';
            customOpt.textContent = 'Custom Rank / Role...';
            rankSelect.appendChild(customOpt);
        }

        if (customRankGroup) customRankGroup.style.display = 'none';
        if (nameInput) nameInput.value = '';
        if (initialsInput) initialsInput.value = '';

        overlay.classList.add('active');
        if (nameInput) nameInput.focus();
    }

    function addMemberToSection(category, name, role, initials, isNew, tagText = 'NEW') {
        const section = document.querySelector(`.roster-category-section[data-section-category="${category}"]`);
        if (!section) return;

        let grid = section.querySelector('.roster-grid-modern');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = ROSTER_SECTIONS[category]?.gridClass || 'roster-grid-modern';
            section.appendChild(grid);
        }

        const config = ROSTER_SECTIONS[category] || ROSTER_SECTIONS['firefighters'];
        let badgeClass = config.defaultBadge;
        let avatarClass = config.avatarClass;
        let cardTier = config.cardTier;

        if (category === 'line-officers') {
            badgeClass = role.toLowerCase().includes('chief') ? 'badge-chief' : 'badge-line';
        } else if (category === 'company-officers') {
            badgeClass = role.toLowerCase() === 'president' ? 'badge-president' : 'badge-company';
        } else if (category === 'firefighters') {
            badgeClass = role.toLowerCase().includes('probationary') ? 'badge-probationary' : 'badge-firefighter';
        } else if (category === 'fire-police') {
            badgeClass = 'badge-police';
            avatarClass = 'avatar-police';
        } else if (category === 'associate-members') {
            badgeClass = 'badge-associate';
            avatarClass = 'avatar-associate';
        }

        const card = document.createElement('div');
        card.className = `roster-card ${cardTier}`.trim();
        card.setAttribute('data-category', category);
        card.setAttribute('data-name', name);
        card.setAttribute('data-role', role);

        const newTagHtml = (isNew && tagText) ? `<span class="tag-new">${escapeHtml(tagText)}</span>` : (isNew ? '<span class="tag-new">NEW</span>' : '');

        card.innerHTML = `
            ${newTagHtml}
            <div class="roster-avatar ${avatarClass}">${escapeHtml(initials)}</div>
            <div class="roster-info">
                <h4 class="roster-name">${escapeHtml(name)}</h4>
                <span class="rank-badge ${badgeClass}">${escapeHtml(role)}</span>
            </div>
        `;

        grid.appendChild(card);
        attachRemoveButton(card);
        setupCardTagControl(card);
        setupCardDrag(card);
        initLiveEditor();
        saveRosterState();

        showAdminToast(`✅ Added ${name} to ${config.title}! Click '💾 Save & Push to Git' to publish.`);
    }

    // ==========================================
    // Roster Drag & Drop Reordering
    // ==========================================
    let draggedCard = null;
    let dragPlaceholder = null;

    function createDragPlaceholder() {
        const el = document.createElement('div');
        el.className = 'roster-drag-placeholder';
        return el;
    }

    function adaptCardToCategory(card, newCategory) {
        const config = ROSTER_SECTIONS[newCategory] || ROSTER_SECTIONS['firefighters'];
        card.setAttribute('data-category', newCategory);

        // Update tier classes on card
        card.classList.remove('tier-line-officer', 'tier-company-officer');
        if (config.cardTier) {
            card.classList.add(config.cardTier);
        }

        // Update avatar classes
        const avatar = card.querySelector('.roster-avatar');
        if (avatar) {
            avatar.classList.remove('avatar-line', 'avatar-company', 'avatar-firefighter', 'avatar-junior', 'avatar-police', 'avatar-associate');
            avatar.classList.add(config.avatarClass);
        }

        // Update badge classes
        const badge = card.querySelector('.rank-badge');
        const role = card.getAttribute('data-role') || (badge ? badge.textContent.trim() : '');
        if (badge) {
            badge.classList.remove('badge-chief', 'badge-line', 'badge-president', 'badge-company', 'badge-firefighter', 'badge-probationary', 'badge-junior', 'badge-police', 'badge-associate');
            
            let badgeClass = config.defaultBadge;
            if (newCategory === 'line-officers') {
                badgeClass = role.toLowerCase().includes('chief') ? 'badge-chief' : 'badge-line';
            } else if (newCategory === 'company-officers') {
                badgeClass = role.toLowerCase() === 'president' ? 'badge-president' : 'badge-company';
            } else if (newCategory === 'firefighters') {
                badgeClass = role.toLowerCase().includes('probationary') ? 'badge-probationary' : 'badge-firefighter';
            } else if (newCategory === 'fire-police') {
                badgeClass = 'badge-police';
            } else if (newCategory === 'associate-members') {
                badgeClass = 'badge-associate';
            }
            badge.classList.add(badgeClass);
        }
    }

    function setupCardDrag(card) {
        if (!isAdminLoggedIn) return;
        if (card.dataset.dragInit === 'true') return;
        card.dataset.dragInit = 'true';

        card.classList.add('roster-card-draggable');
        if (editModeActive) {
            card.setAttribute('draggable', 'true');
        }

        // Attach drag handle if not already present
        let handle = card.querySelector('.roster-card-drag-handle');
        if (!handle) {
            handle = document.createElement('div');
            handle.className = 'roster-card-drag-handle';
            handle.innerHTML = '⋮⋮';
            handle.title = 'Drag to reorder';
            handle.setAttribute('aria-label', 'Drag to reorder');
            card.appendChild(handle);
        }

        // Setup touch drag support on handle for mobile/tablet devices
        setupTouchDrag(handle, card);

        // HTML5 Drag Events
        card.addEventListener('dragstart', (e) => {
            // Guard: If dragging from an editable element or remove button, do not start card drag
            if (e.target.isContentEditable || e.target.closest('[contenteditable="true"]') || e.target.closest('.roster-card-remove-btn')) {
                e.preventDefault();
                return;
            }

            draggedCard = card;
            if (!dragPlaceholder) {
                dragPlaceholder = createDragPlaceholder();
            }

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.getAttribute('data-name') || '');

            setTimeout(() => {
                card.classList.add('roster-card-dragging');
            }, 0);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('roster-card-dragging');
            if (dragPlaceholder && dragPlaceholder.parentNode) {
                dragPlaceholder.parentNode.insertBefore(card, dragPlaceholder);
                dragPlaceholder.remove();
                saveRosterState();
            }
            draggedCard = null;
            document.querySelectorAll('.roster-grid-drag-hover').forEach(g => g.classList.remove('roster-grid-drag-hover'));
        });

        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!draggedCard || draggedCard === card) return;

            if (!dragPlaceholder) {
                dragPlaceholder = createDragPlaceholder();
            }

            const parentGrid = card.closest('.roster-grid-modern');
            if (parentGrid) {
                parentGrid.classList.add('roster-grid-drag-hover');
            }

            const rect = card.getBoundingClientRect();
            const isHorizontal = rect.width > 200;
            const mousePos = isHorizontal ? (e.clientX - rect.left) : (e.clientY - rect.top);
            const dimension = isHorizontal ? rect.width : rect.height;

            if (mousePos < dimension / 2) {
                card.parentNode.insertBefore(dragPlaceholder, card);
            } else {
                card.parentNode.insertBefore(dragPlaceholder, card.nextSibling);
            }
        });
    }

    function setupGridDrag(grid) {
        if (!isAdminLoggedIn) return;
        if (grid.dataset.dragGridInit === 'true') return;
        grid.dataset.dragGridInit = 'true';

        grid.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!draggedCard) return;

            grid.classList.add('roster-grid-drag-hover');

            if (!dragPlaceholder) {
                dragPlaceholder = createDragPlaceholder();
            }

            if (e.target === grid || !grid.contains(dragPlaceholder)) {
                grid.appendChild(dragPlaceholder);
            }
        });

        grid.addEventListener('dragleave', (e) => {
            if (!grid.contains(e.relatedTarget)) {
                grid.classList.remove('roster-grid-drag-hover');
            }
        });

        grid.addEventListener('drop', (e) => {
            e.preventDefault();
            grid.classList.remove('roster-grid-drag-hover');

            if (!draggedCard) return;

            const targetSection = grid.closest('.roster-category-section');
            const targetCategory = targetSection ? targetSection.getAttribute('data-section-category') : null;
            const prevCategory = draggedCard.getAttribute('data-category');

            if (dragPlaceholder && dragPlaceholder.parentNode === grid) {
                grid.insertBefore(draggedCard, dragPlaceholder);
                dragPlaceholder.remove();
            } else {
                grid.appendChild(draggedCard);
            }

            draggedCard.classList.remove('roster-card-dragging');

            if (targetCategory && targetCategory !== prevCategory) {
                adaptCardToCategory(draggedCard, targetCategory);
                const targetConfig = ROSTER_SECTIONS[targetCategory];
                showAdminToast(`Moved ${draggedCard.getAttribute('data-name') || 'member'} to ${targetConfig ? targetConfig.title : targetCategory}.`);
            } else {
                showAdminToast(`Updated roster order.`);
            }

            draggedCard = null;
            saveRosterState();
        });
    }

    function setupTouchDrag(handle, card) {
        let touchActive = false;
        let clone = null;
        let startX = 0, startY = 0;

        handle.addEventListener('touchstart', (e) => {
            if (!editModeActive) return;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            touchActive = true;
            draggedCard = card;

            if (!dragPlaceholder) {
                dragPlaceholder = createDragPlaceholder();
            }

            clone = card.cloneNode(true);
            clone.classList.add('roster-card-touch-ghost');
            clone.style.position = 'fixed';
            clone.style.width = `${card.offsetWidth}px`;
            clone.style.left = `${card.getBoundingClientRect().left}px`;
            clone.style.top = `${card.getBoundingClientRect().top}px`;
            clone.style.zIndex = '9999';
            clone.style.opacity = '0.85';
            clone.style.pointerEvents = 'none';
            clone.style.boxShadow = '0 12px 30px rgba(0,0,0,0.5)';
            clone.style.border = '2px solid var(--gold)';
            document.body.appendChild(clone);

            card.classList.add('roster-card-dragging');
            card.parentNode.insertBefore(dragPlaceholder, card);
        }, { passive: true });

        handle.addEventListener('touchmove', (e) => {
            if (!touchActive || !clone) return;
            const touch = e.touches[0];
            e.preventDefault();

            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            clone.style.transform = `translate(${dx}px, ${dy}px) scale(1.03)`;

            clone.style.display = 'none';
            const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            clone.style.display = '';

            if (!elemBelow) return;

            const hoverCard = elemBelow.closest('.roster-card');
            const hoverGrid = elemBelow.closest('.roster-grid-modern');

            if (hoverCard && hoverCard !== card && hoverCard.parentNode) {
                const rect = hoverCard.getBoundingClientRect();
                const relY = touch.clientY - rect.top;
                if (relY < rect.height / 2) {
                    hoverCard.parentNode.insertBefore(dragPlaceholder, hoverCard);
                } else {
                    hoverCard.parentNode.insertBefore(dragPlaceholder, hoverCard.nextSibling);
                }
            } else if (hoverGrid && !hoverGrid.contains(dragPlaceholder)) {
                hoverGrid.appendChild(dragPlaceholder);
            }
        }, { passive: false });

        const endTouch = () => {
            if (!touchActive) return;
            touchActive = false;
            if (clone) {
                clone.remove();
                clone = null;
            }
            card.classList.remove('roster-card-dragging');

            if (dragPlaceholder && dragPlaceholder.parentNode) {
                const targetGrid = dragPlaceholder.parentNode;
                const targetSection = targetGrid.closest('.roster-category-section');
                const targetCategory = targetSection ? targetSection.getAttribute('data-section-category') : null;
                const prevCategory = card.getAttribute('data-category');

                targetGrid.insertBefore(card, dragPlaceholder);
                dragPlaceholder.remove();

                if (targetCategory && targetCategory !== prevCategory) {
                    adaptCardToCategory(card, targetCategory);
                    const targetConfig = ROSTER_SECTIONS[targetCategory];
                    showAdminToast(`Moved ${card.getAttribute('data-name') || 'member'} to ${targetConfig ? targetConfig.title : targetCategory}.`);
                } else {
                    showAdminToast(`Updated roster order.`);
                }
                saveRosterState();
            }
            draggedCard = null;
        };

        handle.addEventListener('touchend', endTouch);
        handle.addEventListener('touchcancel', endTouch);
    }

    function initRosterDragAndDrop() {
        const container = document.getElementById('roster-container');
        if (!container || !isAdminLoggedIn) return;

        container.querySelectorAll('.roster-card').forEach(card => {
            setupCardDrag(card);
        });

        container.querySelectorAll('.roster-grid-modern').forEach(grid => {
            setupGridDrag(grid);
        });
    }

    function initRosterAdmin() {
        const container = document.getElementById('roster-container');
        if (!container) return;

        // Restore pending local edits if any
        const pending = localStorage.getItem('station46_roster_html');
        if (pending && pending.trim().length > 50) {
            container.innerHTML = pending;
        }

        if (isAdminLoggedIn) {
            attachAddButtons();
            container.querySelectorAll('.roster-card').forEach(card => {
                attachRemoveButton(card);
                setupCardTagControl(card);
            });
            createAddMemberModal();
            initRosterDragAndDrop();
        }
    }

    // ==========================================
    // Apparatus Fleet Admin Management (Active & Retired)
    // ==========================================
    function getCleanApparatusHtml(type = 'active') {
        const containerId = (type === 'retired') ? 'retired-apparatus-list' : 'active-apparatus-list';
        const container = document.getElementById(containerId);
        if (!container) return null;

        const clone = container.cloneNode(true);
        // Remove admin-only controls, reorder handles, remove buttons, placeholders, modal overlays, and image edit overlays
        clone.querySelectorAll('.apparatus-card-remove-btn, .apparatus-card-admin-header, .apparatus-drag-placeholder, .apparatus-add-modal-overlay, .station-image-change-btn').forEach(el => el.remove());
        // Clean runtime contenteditable and initialization markers
        clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        clone.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
        clone.querySelectorAll('[data-editor-init]').forEach(el => el.removeAttribute('data-editor-init'));
        clone.querySelectorAll('[data-modal-bound]').forEach(el => el.removeAttribute('data-modal-bound'));
        clone.querySelectorAll('[data-apparatus-index]').forEach(el => el.removeAttribute('data-apparatus-index'));
        clone.querySelectorAll('[data-apparatus-drag-init]').forEach(el => el.removeAttribute('data-apparatus-drag-init'));
        clone.querySelectorAll('.apparatus-card-dragging, .apparatus-card-draggable').forEach(el => {
            el.classList.remove('apparatus-card-dragging', 'apparatus-card-draggable');
        });
        return clone.innerHTML;
    }

    function saveApparatusState(type) {
        if (!type || type === 'active') {
            const cleanActive = getCleanApparatusHtml('active');
            if (cleanActive !== null) {
                localStorage.setItem('station46_active_apparatus_html', cleanActive);
            }
        }
        if (!type || type === 'retired') {
            const cleanRetired = getCleanApparatusHtml('retired');
            if (cleanRetired !== null) {
                localStorage.setItem('station46_retired_apparatus_html', cleanRetired);
            }
        }
    }

    function attachApparatusRemoveButton(card, type = 'active') {
        if (!isAdminLoggedIn) return;
        if (card.querySelector('.apparatus-card-remove-btn')) return;

        card.style.position = 'relative';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'apparatus-card-remove-btn';
        btn.title = 'Delete apparatus';
        btn.setAttribute('aria-label', 'Delete apparatus');
        btn.setAttribute('contenteditable', 'false');
        btn.innerHTML = '✕';
        if (editModeActive) {
            btn.style.display = 'inline-flex';
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const title = card.querySelector('h3')?.textContent.trim() || 'this apparatus';
            if (confirm(`Are you sure you want to delete ${title}? This will permanently remove it from the apparatus fleet.`)) {
                card.remove();
                saveApparatusState(type);
                if (typeof window.refreshApparatusModalList === 'function') {
                    window.refreshApparatusModalList();
                }
                showAdminToast(`🗑️ Removed ${title}. Remember to click 'Save & Push to Git' to publish.`);
            }
        });

        card.appendChild(btn);
    }

    // Apparatus Reordering (Move Left/Right & Drag-and-Drop)
    function moveApparatusCard(card, direction, type) {
        const parent = card.parentNode;
        if (!parent) return;
        const cards = Array.from(parent.querySelectorAll('.card'));
        const index = cards.indexOf(card);
        if (index === -1) return;

        if (direction === 'prev' && index > 0) {
            parent.insertBefore(card, cards[index - 1]);
        } else if (direction === 'next' && index < cards.length - 1) {
            parent.insertBefore(card, cards[index + 1].nextSibling);
        } else {
            return;
        }

        saveApparatusState(type);
        if (typeof window.refreshApparatusModalList === 'function') {
            window.refreshApparatusModalList();
        }
        const title = card.querySelector('h3')?.textContent.trim() || 'Apparatus';
        showAdminToast(`✅ Moved ${title} ${direction === 'prev' ? 'earlier' : 'later'}. Click "Push to Git" to publish.`);
    }

    let draggedApparatusCard = null;
    let apparatusDragPlaceholder = null;

    function createApparatusDragPlaceholder() {
        const ph = document.createElement('div');
        ph.className = 'card apparatus-drag-placeholder';
        ph.innerHTML = `<div class="apparatus-drag-placeholder-inner"><span>Drop Vehicle Here</span></div>`;
        return ph;
    }

    function setupApparatusTouchDrag(handle, card, type) {
        let touchActive = false;
        let clone = null;
        let startX = 0, startY = 0;

        handle.addEventListener('touchstart', (e) => {
            if (!editModeActive) return;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            touchActive = true;
            draggedApparatusCard = card;

            if (!apparatusDragPlaceholder) {
                apparatusDragPlaceholder = createApparatusDragPlaceholder();
            }

            clone = card.cloneNode(true);
            clone.classList.add('apparatus-card-touch-ghost');
            clone.style.position = 'fixed';
            clone.style.width = `${card.offsetWidth}px`;
            clone.style.left = `${card.getBoundingClientRect().left}px`;
            clone.style.top = `${card.getBoundingClientRect().top}px`;
            clone.style.zIndex = '9999';
            clone.style.opacity = '0.85';
            clone.style.pointerEvents = 'none';
            clone.style.boxShadow = '0 16px 36px rgba(0,0,0,0.5)';
            clone.style.border = '2px solid var(--fire-red, #b3212b)';
            document.body.appendChild(clone);

            card.classList.add('apparatus-card-dragging');
            card.parentNode.insertBefore(apparatusDragPlaceholder, card);
        }, { passive: true });

        handle.addEventListener('touchmove', (e) => {
            if (!touchActive || !clone) return;
            const touch = e.touches[0];
            e.preventDefault();

            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            clone.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;

            clone.style.display = 'none';
            const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            clone.style.display = '';

            if (!elemBelow) return;

            const targetCard = elemBelow.closest('.card:not(.apparatus-drag-placeholder):not(.apparatus-card-touch-ghost)');
            if (targetCard && targetCard.parentNode === card.parentNode) {
                const rect = targetCard.getBoundingClientRect();
                const isHorizontal = rect.width > 200;
                const pos = isHorizontal ? (touch.clientX - rect.left) : (touch.clientY - rect.top);
                const dimension = isHorizontal ? rect.width : rect.height;

                if (pos < dimension / 2) {
                    targetCard.parentNode.insertBefore(apparatusDragPlaceholder, targetCard);
                } else {
                    targetCard.parentNode.insertBefore(apparatusDragPlaceholder, targetCard.nextSibling);
                }
            }
        });

        const endTouch = () => {
            if (!touchActive) return;
            touchActive = false;
            if (clone) {
                clone.remove();
                clone = null;
            }
            card.classList.remove('apparatus-card-dragging');
            if (apparatusDragPlaceholder && apparatusDragPlaceholder.parentNode) {
                apparatusDragPlaceholder.parentNode.insertBefore(card, apparatusDragPlaceholder);
                apparatusDragPlaceholder.remove();
                saveApparatusState(type);
                if (typeof window.refreshApparatusModalList === 'function') {
                    window.refreshApparatusModalList();
                }
                showAdminToast('✅ Updated apparatus order. Remember to click "Push to Git" to publish.');
            }
            draggedApparatusCard = null;
        };

        handle.addEventListener('touchend', endTouch);
        handle.addEventListener('touchcancel', endTouch);
    }

    function setupApparatusCardDrag(card, type = 'active') {
        if (!isAdminLoggedIn) return;
        if (card.dataset.apparatusDragInit === 'true') return;
        card.dataset.apparatusDragInit = 'true';

        card.classList.add('apparatus-card-draggable');
        if (editModeActive) {
            card.setAttribute('draggable', 'true');
        }

        // Attach admin header toolbar on top left if not present
        let adminHeader = card.querySelector('.apparatus-card-admin-header');
        if (!adminHeader) {
            adminHeader = document.createElement('div');
            adminHeader.className = 'apparatus-card-admin-header';
            adminHeader.innerHTML = `
                <div class="apparatus-admin-left">
                    <div class="apparatus-card-drag-handle" title="Drag to reorder apparatus" aria-label="Drag to reorder">⋮⋮</div>
                    <div class="apparatus-card-reorder-group">
                        <button type="button" class="apparatus-move-btn apparatus-move-prev" title="Move earlier" aria-label="Move earlier">‹</button>
                        <button type="button" class="apparatus-move-btn apparatus-move-next" title="Move later" aria-label="Move later">›</button>
                    </div>
                </div>
            `;
            card.appendChild(adminHeader);
        }

        // Wire move buttons
        const prevBtn = adminHeader.querySelector('.apparatus-move-prev');
        const nextBtn = adminHeader.querySelector('.apparatus-move-next');
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                moveApparatusCard(card, 'prev', type);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                moveApparatusCard(card, 'next', type);
            });
        }

        // Setup touch drag for mobile/tablet on drag handle
        const dragHandle = adminHeader.querySelector('.apparatus-card-drag-handle');
        if (dragHandle) {
            setupApparatusTouchDrag(dragHandle, card, type);
        }

        // HTML5 Drag Events
        card.addEventListener('dragstart', (e) => {
            if (e.target.isContentEditable || e.target.closest('[contenteditable="true"]') || e.target.closest('.apparatus-card-remove-btn') || e.target.closest('.apparatus-move-btn')) {
                e.preventDefault();
                return;
            }

            draggedApparatusCard = card;
            if (!apparatusDragPlaceholder) {
                apparatusDragPlaceholder = createApparatusDragPlaceholder();
            }

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.querySelector('h3')?.textContent.trim() || '');

            setTimeout(() => {
                card.classList.add('apparatus-card-dragging');
            }, 0);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('apparatus-card-dragging');
            if (apparatusDragPlaceholder && apparatusDragPlaceholder.parentNode) {
                apparatusDragPlaceholder.parentNode.insertBefore(card, apparatusDragPlaceholder);
                apparatusDragPlaceholder.remove();
                saveApparatusState(type);
                if (typeof window.refreshApparatusModalList === 'function') {
                    window.refreshApparatusModalList();
                }
                showAdminToast('✅ Updated apparatus order. Remember to click "Push to Git" to publish.');
            }
            draggedApparatusCard = null;
        });

        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!draggedApparatusCard || draggedApparatusCard === card) return;

            if (!apparatusDragPlaceholder) {
                apparatusDragPlaceholder = createApparatusDragPlaceholder();
            }

            const rect = card.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            if (mouseX < rect.width / 2) {
                card.parentNode.insertBefore(apparatusDragPlaceholder, card);
            } else {
                card.parentNode.insertBefore(apparatusDragPlaceholder, card.nextSibling);
            }
        });
    }

    async function addCardToRemoteApparatusPage(type, cardHtml) {
        const pageName = (type === 'retired') ? 'retired-apparatus.html' : 'apparatus.html';
        const listId = (type === 'retired') ? 'retired-apparatus-list' : 'active-apparatus-list';
        const storageKey = (type === 'retired') ? 'station46_retired_apparatus_html' : 'station46_active_apparatus_html';

        let currentListHtml = localStorage.getItem(storageKey);
        if (!currentListHtml) {
            try {
                const raw = await fetchRawFile(pageName);
                if (raw) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(raw, 'text/html');
                    const listEl = doc.getElementById(listId);
                    if (listEl) {
                        currentListHtml = listEl.innerHTML;
                    }
                }
            } catch (err) {
                console.error('[Station 46] Failed loading remote page HTML', err);
            }
        }

        if (currentListHtml) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = currentListHtml;
            tempDiv.insertAdjacentHTML('beforeend', cardHtml);
            tempDiv.querySelectorAll('.apparatus-card-remove-btn, .apparatus-card-admin-header, .apparatus-drag-placeholder').forEach(el => el.remove());
            tempDiv.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
            tempDiv.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
            tempDiv.querySelectorAll('[data-editor-init]').forEach(el => el.removeAttribute('data-editor-init'));
            tempDiv.querySelectorAll('[data-modal-bound]').forEach(el => el.removeAttribute('data-modal-bound'));
            tempDiv.querySelectorAll('[data-apparatus-index]').forEach(el => el.removeAttribute('data-apparatus-index'));
            tempDiv.querySelectorAll('[data-apparatus-drag-init]').forEach(el => el.removeAttribute('data-apparatus-drag-init'));
            tempDiv.querySelectorAll('.apparatus-card-dragging, .apparatus-card-draggable').forEach(el => {
                el.classList.remove('apparatus-card-dragging', 'apparatus-card-draggable');
            });
            localStorage.setItem(storageKey, tempDiv.innerHTML);
        }
    }

    let apparatusAddModalOverlay = null;
    let selectedApparatusType = 'active';
    let uploadedApparatusBase64 = null;

    function createAddApparatusModal() {
        if (apparatusAddModalOverlay) return apparatusAddModalOverlay;

        apparatusAddModalOverlay = document.createElement('div');
        apparatusAddModalOverlay.id = 'apparatus-add-modal-overlay';
        apparatusAddModalOverlay.className = 'apparatus-add-modal-overlay';
        apparatusAddModalOverlay.innerHTML = `
            <div class="apparatus-add-modal-card">
                <div class="apparatus-add-modal-header">
                    <div class="apparatus-modal-header-text">
                        <h3 class="apparatus-add-modal-title">🚒 Add New Apparatus</h3>
                        <p class="apparatus-add-modal-subtitle">Add a frontline emergency unit or retired vehicle to Station 46</p>
                    </div>
                    <button type="button" class="apparatus-add-modal-close" id="apparatus-modal-close-btn" aria-label="Close dialog" title="Close">&times;</button>
                </div>
                <form id="apparatus-add-form" class="apparatus-add-form">
                    <div class="apparatus-form-group">
                        <label class="apparatus-form-label">Fleet Assignment</label>
                        <div class="apparatus-status-toggle-group">
                            <button type="button" class="apparatus-status-btn active" data-type="active" id="btn-status-active">
                                <span class="status-btn-icon">🚒</span>
                                <span class="status-btn-text">
                                    <strong>Active Fleet</strong>
                                    <small>apparatus.html</small>
                                </span>
                            </button>
                            <button type="button" class="apparatus-status-btn" data-type="retired" id="btn-status-retired">
                                <span class="status-btn-icon">🏛️</span>
                                <span class="status-btn-text">
                                    <strong>Retired Fleet</strong>
                                    <small>retired-apparatus.html</small>
                                </span>
                            </button>
                        </div>
                    </div>

                    <div class="apparatus-form-group">
                        <label class="apparatus-form-label" for="apparatus-input-title">
                            Apparatus Name / Call-Sign <span class="required-star">*</span>
                        </label>
                        <input type="text" id="apparatus-input-title" class="apparatus-form-input" placeholder="e.g. Engine 46-9, Tower 46, Marine 46-2" required autocomplete="off">
                    </div>

                    <div class="apparatus-form-group">
                        <label class="apparatus-form-label" for="apparatus-input-specs">
                            Technical Specifications &amp; Equipment
                        </label>
                        <textarea id="apparatus-input-specs" class="apparatus-form-textarea" rows="4" placeholder="Enter one specification or detail per line, e.g.:&#10;2026 Pierce Velocity Custom Chassis&#10;2000 GPM Waterous Pump / 1000 Gal Tank&#10;Seats 6 Firefighters / 5 SCBA&#10;Full Complement of Tools &amp; Equipment" autocomplete="off"></textarea>
                        <span class="apparatus-form-hint">💡 Each line will become a bullet point on the apparatus card and popup modal.</span>
                    </div>

                    <div class="apparatus-form-group">
                        <label class="apparatus-form-label">Apparatus Photo (Upload File or Enter Image URL)</label>
                        <div class="apparatus-photo-input-row">
                            <input type="text" id="apparatus-input-img-url" class="apparatus-form-input" placeholder="e.g. engine46.jpg or https://..." autocomplete="off">
                            <label class="apparatus-file-upload-btn">
                                <span>📁 Choose File</span>
                                <input type="file" id="apparatus-input-file" accept="image/*">
                            </label>
                        </div>

                        <div id="apparatus-img-preview-box" class="apparatus-img-preview-card" style="display: none;">
                            <img id="apparatus-img-preview-thumb" src="" alt="Preview">
                            <div class="apparatus-img-preview-info">
                                <span id="apparatus-img-preview-label" class="apparatus-img-preview-name"></span>
                                <span class="apparatus-img-preview-status">Ready to publish</span>
                            </div>
                            <button type="button" id="apparatus-img-preview-clear" class="apparatus-img-preview-remove" title="Remove photo">Remove</button>
                        </div>
                    </div>

                    <div class="apparatus-add-modal-footer">
                        <button type="button" class="btn apparatus-modal-btn-cancel" id="apparatus-add-cancel-btn">Cancel</button>
                        <button type="submit" class="btn apparatus-modal-btn-submit" id="apparatus-add-submit-btn">➕ Add to Fleet</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(apparatusAddModalOverlay);

        // Status Toggle listeners
        const btnActive = apparatusAddModalOverlay.querySelector('#btn-status-active');
        const btnRetired = apparatusAddModalOverlay.querySelector('#btn-status-retired');
        const setStatusType = (type) => {
            selectedApparatusType = type;
            if (type === 'active') {
                btnActive.classList.add('active');
                btnRetired.classList.remove('active');
            } else {
                btnRetired.classList.add('active');
                btnActive.classList.remove('active');
            }
        };

        btnActive.addEventListener('click', () => setStatusType('active'));
        btnRetired.addEventListener('click', () => setStatusType('retired'));

        // Close handlers
        const closeBtn = apparatusAddModalOverlay.querySelector('#apparatus-modal-close-btn');
        const cancelBtn = apparatusAddModalOverlay.querySelector('#apparatus-add-cancel-btn');
        const closeModal = () => apparatusAddModalOverlay.classList.remove('active');
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        apparatusAddModalOverlay.addEventListener('click', (e) => {
            if (e.target === apparatusAddModalOverlay) closeModal();
        });

        // Image handlers
        const urlInput = apparatusAddModalOverlay.querySelector('#apparatus-input-img-url');
        const fileInput = apparatusAddModalOverlay.querySelector('#apparatus-input-file');
        const previewBox = apparatusAddModalOverlay.querySelector('#apparatus-img-preview-box');
        const previewThumb = apparatusAddModalOverlay.querySelector('#apparatus-img-preview-thumb');
        const previewLabel = apparatusAddModalOverlay.querySelector('#apparatus-img-preview-label');
        const previewClear = apparatusAddModalOverlay.querySelector('#apparatus-img-preview-clear');

        urlInput.addEventListener('input', () => {
            const val = urlInput.value.trim();
            if (val && !uploadedApparatusBase64) {
                previewThumb.src = val;
                previewLabel.textContent = val;
                previewBox.style.display = 'flex';
            } else if (!val && !uploadedApparatusBase64) {
                previewBox.style.display = 'none';
            }
        });

        fileInput.addEventListener('change', () => {
            const file = fileInput.files && fileInput.files[0];
            if (file) {
                compressImage(file, (base64) => {
                    uploadedApparatusBase64 = base64;
                    previewThumb.src = base64;
                    previewLabel.textContent = `${file.name} (uploaded photo)`;
                    previewBox.style.display = 'flex';
                    urlInput.value = '';
                });
            }
        });

        previewClear.addEventListener('click', () => {
            uploadedApparatusBase64 = null;
            fileInput.value = '';
            urlInput.value = '';
            previewBox.style.display = 'none';
            previewThumb.src = '';
            previewLabel.textContent = '';
        });

        // Form Submission
        const form = apparatusAddModalOverlay.querySelector('#apparatus-add-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = apparatusAddModalOverlay.querySelector('#apparatus-input-title').value.trim();
            const specsRaw = apparatusAddModalOverlay.querySelector('#apparatus-input-specs').value.trim();
            const manualUrl = urlInput.value.trim();
            const finalImgSrc = uploadedApparatusBase64 || manualUrl;

            if (!title) {
                alert('Please enter an apparatus title / call-sign.');
                return;
            }

            // Generate tech specs list items
            const specsLines = specsRaw ? specsRaw.split('\n').map(l => l.trim()).filter(Boolean) : [];
            let specsHtml = '';
            specsLines.forEach(line => {
                specsHtml += `<li>${escapeHtml(line)}</li>\n                                `;
            });
            if (!specsHtml) {
                specsHtml = `<li>Montgomery Township Volunteer Fire Company #2</li>`;
            }

            const bgStyle = finalImgSrc
                ? `background: linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.45)), url('${finalImgSrc}') center/cover; color: white; font-weight: 800; text-shadow: 0 2px 8px rgba(0,0,0,0.9);`
                : `background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; font-weight: 800;`;

            const card = document.createElement('div');
            card.className = 'card glass-card hover-lift fade-in';
            card.innerHTML = `
                <div class="card-img-wrapper">
                    <div class="card-img-placeholder" style="${bgStyle}">${escapeHtml(title)}</div>
                </div>
                <div class="card-content">
                    <h3>${escapeHtml(title)}</h3>
                    <ul class="tech-specs">
                        ${specsHtml}
                    </ul>
                </div>
            `;

            const targetContainerId = (selectedApparatusType === 'retired') ? 'retired-apparatus-list' : 'active-apparatus-list';
            const liveContainer = document.getElementById(targetContainerId);

            if (liveContainer) {
                liveContainer.appendChild(card);
                attachApparatusRemoveButton(card, selectedApparatusType);
                setupApparatusCardDrag(card, selectedApparatusType);
                initLiveEditor();
                saveApparatusState(selectedApparatusType);
                if (typeof window.refreshApparatusModalList === 'function') {
                    window.refreshApparatusModalList();
                }
                showAdminToast(`✅ Added ${title} to ${selectedApparatusType === 'retired' ? 'Retired Fleet' : 'Active Fleet'}!`);
            } else {
                // Admin is adding to the other fleet page
                await addCardToRemoteApparatusPage(selectedApparatusType, card.outerHTML);
                showAdminToast(`✅ Added ${title} to ${selectedApparatusType === 'retired' ? 'Retired Fleet' : 'Active Fleet'}! Saved for ${selectedApparatusType === 'retired' ? 'retired-apparatus.html' : 'apparatus.html'}.`);
            }

            // Reset and close
            form.reset();
            uploadedApparatusBase64 = null;
            previewBox.style.display = 'none';
            previewThumb.src = '';
            previewLabel.textContent = '';
            closeModal();
        });

        return apparatusAddModalOverlay;
    }

    function openAddApparatusModal(defaultType = 'active') {
        const modal = createAddApparatusModal();
        selectedApparatusType = defaultType;
        const btnActive = modal.querySelector('#btn-status-active');
        const btnRetired = modal.querySelector('#btn-status-retired');
        if (defaultType === 'retired') {
            btnRetired.classList.add('active');
            btnActive.classList.remove('active');
        } else {
            btnActive.classList.add('active');
            btnRetired.classList.remove('active');
        }
        modal.classList.add('active');
        const titleInput = modal.querySelector('#apparatus-input-title');
        if (titleInput) {
            setTimeout(() => titleInput.focus(), 80);
        }
    }

    function initApparatusAdmin() {
        const activeContainer = document.getElementById('active-apparatus-list');
        const retiredContainer = document.getElementById('retired-apparatus-list');

        // Restore pending local edits for active fleet
        if (activeContainer) {
            const pendingActive = localStorage.getItem('station46_active_apparatus_html');
            if (pendingActive && pendingActive.trim().length > 50) {
                activeContainer.innerHTML = pendingActive;
            }
        }

        // Restore pending local edits for retired fleet
        if (retiredContainer) {
            const pendingRetired = localStorage.getItem('station46_retired_apparatus_html');
            if (pendingRetired && pendingRetired.trim().length > 50) {
                retiredContainer.innerHTML = pendingRetired;
            }
        }

        if (isAdminLoggedIn) {
            createAddApparatusModal();

            const btnAddActive = document.getElementById('btn-add-apparatus-active');
            if (btnAddActive && !btnAddActive.dataset.bound) {
                btnAddActive.dataset.bound = 'true';
                btnAddActive.addEventListener('click', (e) => {
                    e.preventDefault();
                    openAddApparatusModal('active');
                });
            }

            const btnAddRetired = document.getElementById('btn-add-apparatus-retired');
            if (btnAddRetired && !btnAddRetired.dataset.bound) {
                btnAddRetired.dataset.bound = 'true';
                btnAddRetired.addEventListener('click', (e) => {
                    e.preventDefault();
                    openAddApparatusModal('retired');
                });
            }

            if (activeContainer) {
                activeContainer.querySelectorAll('.card').forEach(card => {
                    attachApparatusRemoveButton(card, 'active');
                    setupApparatusCardDrag(card, 'active');
                });
            }

            if (retiredContainer) {
                retiredContainer.querySelectorAll('.card').forEach(card => {
                    attachApparatusRemoveButton(card, 'retired');
                    setupApparatusCardDrag(card, 'retired');
                });
            }
        }
    }

    // ==========================================
    // Typography & Font Customization System
    // ==========================================
    let currentFontTarget = null;
    let fontToolbarEl = null;

    function getOrCreateFontToolbar() {
        if (fontToolbarEl) return fontToolbarEl;

        fontToolbarEl = document.createElement('div');
        fontToolbarEl.id = 'admin-font-toolbar';

        let optionsHtml = '';
        SUPPORTED_FONTS.forEach(font => {
            optionsHtml += `<option value="${escapeHtml(font.value)}">${escapeHtml(font.name)}</option>`;
        });

        fontToolbarEl.innerHTML = `
            <span class="font-toolbar-label" id="font-toolbar-target-type">🔤 Font:</span>
            <select id="font-toolbar-select" aria-label="Choose font family">
                ${optionsHtml}
            </select>
            <button type="button" class="font-toolbar-btn" id="font-toolbar-reset-btn" title="Reset font to default">Reset</button>
            <button type="button" class="font-toolbar-close" id="font-toolbar-close-btn" title="Close toolbar">&times;</button>
        `;

        document.body.appendChild(fontToolbarEl);

        const select = fontToolbarEl.querySelector('#font-toolbar-select');
        const resetBtn = fontToolbarEl.querySelector('#font-toolbar-reset-btn');
        const closeBtn = fontToolbarEl.querySelector('#font-toolbar-close-btn');

        select.addEventListener('change', () => {
            if (!currentFontTarget) return;
            const val = select.value;
            const pageKey = getPageKey();
            const selectorPath = getElementSelectorPath(currentFontTarget);
            const fontKey = `font_v2_${pageKey}_${selectorPath}`;

            if (val === 'inherit') {
                currentFontTarget.style.fontFamily = '';
                saveFontEdit(fontKey, null);
                showAdminToast(`Reset font for this text.`);
            } else {
                currentFontTarget.style.fontFamily = val;
                loadGoogleFont(val);
                saveFontEdit(fontKey, val);
                const fontObj = SUPPORTED_FONTS.find(f => f.value === val);
                showAdminToast(`✅ Font set to ${fontObj ? fontObj.name.split(' (')[0] : 'custom'}`);
            }
            if (currentFontTarget.closest('#roster-container')) {
                saveRosterState();
            }
            if (currentFontTarget.closest('#active-apparatus-list')) {
                saveApparatusState('active');
            } else if (currentFontTarget.closest('#retired-apparatus-list')) {
                saveApparatusState('retired');
            }
            updateFontToolbarPosition(currentFontTarget);
        });

        resetBtn.addEventListener('click', () => {
            if (!currentFontTarget) return;
            const pageKey = getPageKey();
            const selectorPath = getElementSelectorPath(currentFontTarget);
            const fontKey = `font_v2_${pageKey}_${selectorPath}`;
            currentFontTarget.style.fontFamily = '';
            select.value = 'inherit';
            saveFontEdit(fontKey, null);
            if (currentFontTarget.closest('#roster-container')) {
                saveRosterState();
            }
            if (currentFontTarget.closest('#active-apparatus-list')) {
                saveApparatusState('active');
            } else if (currentFontTarget.closest('#retired-apparatus-list')) {
                saveApparatusState('retired');
            }
            showAdminToast(`Reset font for this text.`);
            updateFontToolbarPosition(currentFontTarget);
        });

        closeBtn.addEventListener('click', () => {
            hideFontToolbar();
        });

        // Reposition on scroll or resize
        window.addEventListener('scroll', () => {
            if (currentFontTarget && fontToolbarEl.classList.contains('active')) {
                updateFontToolbarPosition(currentFontTarget);
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            if (currentFontTarget && fontToolbarEl.classList.contains('active')) {
                updateFontToolbarPosition(currentFontTarget);
            }
        }, { passive: true });

        // Close on clicking outside
        document.addEventListener('pointerdown', (e) => {
            if (fontToolbarEl && fontToolbarEl.classList.contains('active')) {
                if (!fontToolbarEl.contains(e.target) && (!currentFontTarget || !currentFontTarget.contains(e.target)) && !e.target.closest('.admin-font-modal-overlay')) {
                    hideFontToolbar();
                }
            }
        });

        return fontToolbarEl;
    }

    function updateFontToolbarPosition(targetEl) {
        if (!targetEl || !fontToolbarEl) return;
        const rect = targetEl.getBoundingClientRect();

        // Check if element is in viewport
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
            fontToolbarEl.classList.remove('active');
            return;
        }

        fontToolbarEl.classList.add('active');

        // Position above target, or below if target is near top of viewport
        let top = rect.top - 46;
        if (top < 10) {
            top = rect.bottom + 8;
        }
        let left = rect.left;
        const toolbarWidth = fontToolbarEl.offsetWidth || 300;
        if (left + toolbarWidth > window.innerWidth - 12) {
            left = window.innerWidth - toolbarWidth - 12;
        }
        if (left < 10) left = 10;

        fontToolbarEl.style.top = `${Math.round(top)}px`;
        fontToolbarEl.style.left = `${Math.round(left)}px`;
    }

    function showFontToolbar(element) {
        if (!isAdminLoggedIn || !editModeActive || !element) return;
        currentFontTarget = element;
        const toolbar = getOrCreateFontToolbar();

        // Determine current font
        const pageKey = getPageKey();
        const selectorPath = getElementSelectorPath(element);
        const fontKey = `font_v2_${pageKey}_${selectorPath}`;
        const storedEdits = getStoredTextEdits();
        const storedFont = storedEdits[fontKey] || element.style.fontFamily;

        const select = toolbar.querySelector('#font-toolbar-select');
        let matchedValue = 'inherit';
        if (storedFont) {
            const found = SUPPORTED_FONTS.find(f => f.value.toLowerCase() === storedFont.toLowerCase() || (f.value !== 'inherit' && storedFont.toLowerCase().includes(f.name.toLowerCase().split(' ')[0])));
            if (found) {
                matchedValue = found.value;
            } else {
                matchedValue = storedFont;
            }
        }
        select.value = matchedValue;

        // Update label to reflect element type
        const typeLabel = toolbar.querySelector('#font-toolbar-target-type');
        let tagDesc = element.tagName.toUpperCase();
        if (element.classList.contains('tag-new') || element.classList.contains('news-card-tag') || element.classList.contains('recent-post-tag')) {
            tagDesc = 'TAG';
        } else if (element.classList.contains('rank-badge')) {
            tagDesc = 'BADGE';
        } else if (element.classList.contains('btn') || element.classList.contains('btn-primary')) {
            tagDesc = 'BUTTON';
        }
        if (typeLabel) {
            typeLabel.textContent = `🔤 ${tagDesc}:`;
        }

        updateFontToolbarPosition(element);
    }

    function hideFontToolbar() {
        if (fontToolbarEl) {
            fontToolbarEl.classList.remove('active');
        }
        currentFontTarget = null;
    }

    function openTypographyModal() {
        let overlay = document.getElementById('admin-font-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'admin-font-modal-overlay';
            overlay.className = 'admin-font-modal-overlay';

            let fontOpts = '';
            SUPPORTED_FONTS.forEach(f => {
                fontOpts += `<option value="${escapeHtml(f.value)}">${escapeHtml(f.name)}</option>`;
            });

            overlay.innerHTML = `
                <div class="admin-font-modal">
                    <div class="admin-font-modal-header">
                        <h3>🔤 Site & Page Typography</h3>
                        <button type="button" class="admin-font-modal-close" id="admin-font-modal-close-btn">&times;</button>
                    </div>
                    <div class="admin-font-modal-body">
                        <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 0.5rem;">
                            Customize fonts across headings and body content, or apply a font to every piece of text on this page.
                        </p>
                        <div class="admin-font-option-group">
                            <label for="modal-font-heading">Headings Font (h1, h2, h3, titles):</label>
                            <select id="modal-font-heading">
                                ${fontOpts}
                            </select>
                        </div>
                        <div class="admin-font-option-group">
                            <label for="modal-font-body">Body & Content Font (paragraphs, lists):</label>
                            <select id="modal-font-body">
                                ${fontOpts}
                            </select>
                        </div>
                        <div class="admin-font-preview-box">
                            <h4 id="modal-preview-heading" style="margin: 0 0 4px 0; color: var(--navy-blue);">Montgomery Township Volunteer Fire Company #2</h4>
                            <p id="modal-preview-body" style="margin: 0; font-size: 0.88rem; color: #475569;">Serving our community with dedication, pride, and excellence since 1946.</p>
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button type="button" class="btn" id="modal-apply-page-btn" style="background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 7px 12px; font-size: 0.85rem; font-weight: 600; border-radius: 6px; cursor: pointer;">
                                Apply Body Font to Every Element on This Page
                            </button>
                        </div>
                    </div>
                    <div class="admin-font-modal-actions">
                        <button type="button" class="btn" id="modal-font-reset-all-btn" style="background: #f8fafc; color: #b3212b; border: 1px solid #f0a3a8; padding: 9px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">Reset to Defaults</button>
                        <button type="button" class="btn btn-primary" id="modal-font-save-btn" style="padding: 9px 20px; border-radius: 6px; font-weight: 700; cursor: pointer;">Save Typography</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const closeBtn = overlay.querySelector('#admin-font-modal-close-btn');
            const headingSelect = overlay.querySelector('#modal-font-heading');
            const bodySelect = overlay.querySelector('#modal-font-body');
            const previewHeading = overlay.querySelector('#modal-preview-heading');
            const previewBody = overlay.querySelector('#modal-preview-body');
            const saveBtn = overlay.querySelector('#modal-font-save-btn');
            const applyPageBtn = overlay.querySelector('#modal-apply-page-btn');
            const resetBtn = overlay.querySelector('#modal-font-reset-all-btn');

            function updatePreviews() {
                const hVal = headingSelect.value !== 'inherit' ? headingSelect.value : "'Inter', sans-serif";
                const bVal = bodySelect.value !== 'inherit' ? bodySelect.value : "'Inter', sans-serif";
                previewHeading.style.fontFamily = hVal;
                previewBody.style.fontFamily = bVal;
                loadGoogleFont(headingSelect.value);
                loadGoogleFont(bodySelect.value);
            }

            headingSelect.addEventListener('change', updatePreviews);
            bodySelect.addEventListener('change', updatePreviews);

            closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('active');
            });

            saveBtn.addEventListener('click', () => {
                const hVal = headingSelect.value;
                const bVal = bodySelect.value;
                const edits = getStoredTextEdits();

                if (hVal && hVal !== 'inherit') {
                    edits['global_heading_font'] = hVal;
                    document.documentElement.style.setProperty('--font-heading', hVal);
                    loadGoogleFont(hVal);
                } else {
                    delete edits['global_heading_font'];
                    document.documentElement.style.removeProperty('--font-heading');
                }

                if (bVal && bVal !== 'inherit') {
                    edits['global_body_font'] = bVal;
                    document.documentElement.style.setProperty('--font-body', bVal);
                    loadGoogleFont(bVal);
                } else {
                    delete edits['global_body_font'];
                    document.documentElement.style.removeProperty('--font-body');
                }

                localStorage.setItem('station46_text_edits', JSON.stringify(edits));
                overlay.classList.remove('active');
                showAdminToast(`✅ Typography settings saved! Click '💾 Save & Push to Git' to publish.`);
            });

            applyPageBtn.addEventListener('click', () => {
                const fontVal = bodySelect.value;
                if (!fontVal || fontVal === 'inherit') {
                    alert('Please select a Body Font from the dropdown first.');
                    return;
                }
                const pageKey = getPageKey();
                const elements = getEditableElements();
                elements.forEach(el => {
                    el.style.fontFamily = fontVal;
                    const path = getElementSelectorPath(el);
                    saveFontEdit(`font_v2_${pageKey}_${path}`, fontVal);
                });
                loadGoogleFont(fontVal);
                if (document.getElementById('roster-container')) {
                    saveRosterState();
                }
                if (document.getElementById('active-apparatus-list')) {
                    saveApparatusState('active');
                }
                if (document.getElementById('retired-apparatus-list')) {
                    saveApparatusState('retired');
                }
                showAdminToast(`✅ Applied font to all ${elements.length} elements on this page!`);
            });

            resetBtn.addEventListener('click', () => {
                const edits = getStoredTextEdits();
                delete edits['global_heading_font'];
                delete edits['global_body_font'];
                document.documentElement.style.removeProperty('--font-heading');
                document.documentElement.style.removeProperty('--font-body');
                localStorage.setItem('station46_text_edits', JSON.stringify(edits));
                headingSelect.value = 'inherit';
                bodySelect.value = 'inherit';
                updatePreviews();
                showAdminToast(`Reset site-wide fonts to default.`);
            });
        }

        // Populate current values
        const edits = getStoredTextEdits();
        const headingSelect = overlay.querySelector('#modal-font-heading');
        const bodySelect = overlay.querySelector('#modal-font-body');
        if (headingSelect) headingSelect.value = edits['global_heading_font'] || 'inherit';
        if (bodySelect) bodySelect.value = edits['global_body_font'] || 'inherit';

        const previewHeading = overlay.querySelector('#modal-preview-heading');
        const previewBody = overlay.querySelector('#modal-preview-body');
        if (previewHeading && edits['global_heading_font']) previewHeading.style.fontFamily = edits['global_heading_font'];
        if (previewBody && edits['global_body_font']) previewBody.style.fontFamily = edits['global_body_font'];

        overlay.classList.add('active');
    }

    // Runtime tracker for bound elements to prevent duplicate listeners without persisting HTML attributes
    const boundEditorElements = new WeakSet();

    // ==========================================================================
    // Page & Section Builder Suite (Custom Sections, Block Library & Page Creator)
    // ==========================================================================

    function getCleanMainHtml(mainElement = document.querySelector('main')) {
        if (!mainElement) return null;
        const clone = mainElement.cloneNode(true);

        // Remove administrative toolbars, inserters, add/remove buttons, file inputs and temporary markers
        clone.querySelectorAll(
            '.section-admin-bar, .section-insert-divider, .section-card-add-btn, ' +
            '.card-admin-remove-btn, .section-item-upload-btn, .station-builder-modal-overlay, ' +
            '.apparatus-card-remove-btn, .apparatus-card-admin-header, .apparatus-drag-placeholder, ' +
            '.apparatus-add-modal-overlay, .roster-admin-header, .roster-drag-placeholder, ' +
            '.slider-card-admin-controls, .stat-row-remove-btn, .station-image-change-btn, ' +
            '.section-drag-handle, .section-drop-indicator, .section-drag-ghost-badge'
        ).forEach(el => el.remove());

        // Remove hidden file inputs added for image uploads
        clone.querySelectorAll('input[type="file"]').forEach(el => el.remove());

        // Clean runtime editable and draggable attributes
        clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        clone.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
        clone.querySelectorAll('[data-editor-init]').forEach(el => el.removeAttribute('data-editor-init'));
        clone.querySelectorAll('[data-faq-init]').forEach(el => el.removeAttribute('data-faq-init'));
        clone.querySelectorAll('[data-section-init]').forEach(el => el.removeAttribute('data-section-init'));
        clone.querySelectorAll('[data-modal-bound]').forEach(el => el.removeAttribute('data-modal-bound'));
        clone.querySelectorAll('[data-image-edit-bound]').forEach(el => el.removeAttribute('data-image-edit-bound'));
        clone.querySelectorAll('[data-bg-edit-bound]').forEach(el => el.removeAttribute('data-bg-edit-bound'));
        clone.querySelectorAll('.section-dragging, .section-drop-highlight').forEach(el => {
            el.classList.remove('section-dragging', 'section-drop-highlight');
        });

        return clone.innerHTML;
    }

    function saveMainHtmlState(pageKey = getPageKey()) {
        if (!pageKey || pageKey === 'admin.html') return;
        const cleanHtml = getCleanMainHtml();
        if (cleanHtml !== null) {
            localStorage.setItem('station46_main_html_' + pageKey, cleanHtml);
        }
    }

    function restoreMainHtmlIfPresent() {
        const pageKey = getPageKey();
        if (!pageKey || pageKey === 'admin.html') return;
        const saved = localStorage.getItem('station46_main_html_' + pageKey);

        // If cached main HTML contains stale instagram-media, purge the cache so fresh static HTML with POWr is displayed
        if (saved && (saved.includes('instagram-media') || saved.includes('instagram.com/embed.js'))) {
            localStorage.removeItem('station46_main_html_' + pageKey);
            return;
        }

        const mainEl = document.querySelector('main');
        if (saved && mainEl) {
            mainEl.innerHTML = saved;
            // Defensive cleanup: remove any errant toolbars or dividers that may have been saved inside hero
            mainEl.querySelectorAll('.hero .section-admin-bar, .small-hero .section-admin-bar, #home .section-admin-bar, .hero-content .section-admin-bar, .hero .section-insert-divider, #home .section-insert-divider, .small-hero .section-insert-divider').forEach(el => el.remove());

            // If powr-social-feed is present in restored HTML, ensure powr script initializes
            if (mainEl.querySelector('.powr-social-feed')) {
                if (!document.querySelector('script[src*="powr.io/powr.js"]')) {
                    const ps = document.createElement('script');
                    ps.src = 'https://www.powr.io/powr.js?platform=html';
                    document.body.appendChild(ps);
                } else if (window.loadPowr) {
                    try { window.loadPowr(); } catch (e) {}
                }
            }
        }
    }

    function initCustomFaqAccordions(root = document) {
        root.querySelectorAll('.custom-faq-header').forEach(header => {
            if (header.dataset.faqInit === 'true') return;
            header.dataset.faqInit = 'true';
            header.addEventListener('click', (e) => {
                // In edit mode, if clicking directly on contenteditable text, don't collapse
                if (editModeActive && e.target.isContentEditable) return;
                const item = header.closest('.custom-faq-item');
                if (item) {
                    item.classList.toggle('open');
                }
            });
        });
    }

    function attachCardRemoveButton(container, onRemove) {
        if (!isAdminLoggedIn || !container) return;
        if (container.querySelector(':scope > .card-admin-remove-btn')) return;

        container.style.position = 'relative';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'card-admin-remove-btn';
        btn.innerHTML = '✕';
        btn.title = 'Remove this item';
        btn.style.display = editModeActive ? 'flex' : 'none';

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (confirm('Remove this item?')) {
                if (typeof onRemove === 'function') onRemove();
            }
        });
        container.appendChild(btn);
    }

    // ==========================================================================
    // Universal Image Editor Suite (Upload, Assets Library, URL & Backgrounds)
    // ==========================================================================
    function openImageEditorModal(targetElement = null, isBackground = false) {
        if (!isAdminLoggedIn) return;
        const isBrowsingOnly = !targetElement;
        let overlay = document.getElementById('station-image-editor-modal');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'station-image-editor-modal';
            overlay.className = 'station-builder-modal-overlay';
            overlay.innerHTML = `
                <div class="station-builder-modal-card" style="max-width: 840px;">
                    <div class="station-builder-modal-header">
                        <div>
                            <h3 class="station-builder-modal-title">📷 Change Picture</h3>
                            <p class="station-builder-modal-subtitle">Upload a photo from your computer, choose from station media, or enter an image URL.</p>
                        </div>
                        <button type="button" class="station-builder-modal-close" aria-label="Close modal">&times;</button>
                    </div>
                    <div class="station-builder-modal-body">
                        <!-- Preview Box -->
                        <div class="image-editor-preview-card">
                            <img id="image-editor-preview-thumb" class="image-editor-preview-img" src="" alt="Selected Preview">
                            <div class="image-editor-preview-info">
                                <span id="image-editor-preview-name">No picture selected</span>
                                <span id="image-editor-preview-meta"></span>
                            </div>
                        </div>

                        <!-- Navigation Tabs -->
                        <div class="image-editor-tabs">
                            <button type="button" class="image-editor-tab-btn active" data-tab="upload" id="tab-btn-upload">📁 Upload from Device</button>
                            <button type="button" class="image-editor-tab-btn" data-tab="library" id="tab-btn-library">🚒 Station Media Library (26)</button>
                            <button type="button" class="image-editor-tab-btn" data-tab="url" id="tab-btn-url">🔗 Image URL</button>
                        </div>

                        <!-- Tab 1: Upload from Computer -->
                        <div id="image-tab-upload" class="image-editor-tab-content">
                            <label class="image-editor-dropzone">
                                <input type="file" id="image-editor-file-input" accept="image/*" style="display: none;">
                                <div class="image-editor-dropzone-icon">☁️</div>
                                <div class="image-editor-dropzone-title">Click or Drop File to Upload</div>
                                <div class="image-editor-dropzone-sub">Supports JPG, PNG, WEBP, GIF. Auto-compressed for rapid loading.</div>
                            </label>
                        </div>

                        <!-- Tab 2: Media Library -->
                        <div id="image-tab-library" class="image-editor-tab-content" style="display: none;">
                            <input type="text" id="image-library-search-input" class="image-library-search" placeholder="🔍 Search station photos (truck, drill, engine, family, blueprint...)...">
                            <div class="image-library-grid" id="image-library-grid"></div>
                        </div>

                        <!-- Tab 3: URL -->
                        <div id="image-tab-url" class="image-editor-tab-content" style="display: none;">
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 6px; color: var(--navy-blue);">Image URL or Local Filename</label>
                                <input type="text" id="image-url-input" class="page-creator-input" placeholder="e.g. truck46.jpg, drill-2.jpg or https://images.unsplash.com/...">
                            </div>
                        </div>

                        <!-- Alt Text / Caption (for img) -->
                        <div id="image-alt-group" style="margin-top: 1.25rem;">
                            <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 6px; color: var(--navy-blue);">Image Description / Alt Text</label>
                            <input type="text" id="image-alt-input" class="page-creator-input" placeholder="e.g. Truck 46 Seagrave Aerialscope in service">
                        </div>
                    </div>
                    <div class="station-builder-modal-footer">
                        <button type="button" class="btn btn-secondary station-image-modal-close-btn" style="padding: 9px 18px; border-radius: 6px;">Cancel</button>
                        <button type="button" id="station-image-apply-btn" class="btn btn-primary" style="padding: 9px 24px; border-radius: 6px; font-weight: 700;">Apply Picture</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            overlay.querySelectorAll('.station-builder-modal-close, .station-image-modal-close-btn').forEach(b => {
                b.addEventListener('click', () => overlay.classList.remove('active'));
            });
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('active');
            });
        }

        let selectedSrc = '';
        const previewThumb = overlay.querySelector('#image-editor-preview-thumb');
        const previewName = overlay.querySelector('#image-editor-preview-name');
        const previewMeta = overlay.querySelector('#image-editor-preview-meta');
        const fileInput = overlay.querySelector('#image-editor-file-input');
        const urlInput = overlay.querySelector('#image-url-input');
        const altInput = overlay.querySelector('#image-alt-input');
        const altGroup = overlay.querySelector('#image-alt-group');
        const libraryGrid = overlay.querySelector('#image-library-grid');
        const librarySearch = overlay.querySelector('#image-library-search-input');
        const applyBtn = overlay.querySelector('#station-image-apply-btn');
        const modalTitle = overlay.querySelector('.station-builder-modal-title');
        const modalSubtitle = overlay.querySelector('.station-builder-modal-subtitle');

        if (isBrowsingOnly) {
            if (modalTitle) modalTitle.textContent = '🖼️ Station Photo Library';
            if (modalSubtitle) modalSubtitle.textContent = 'Browse 26 official station photos. Click any photo to copy its filename, or use "📷 Change Photo" on any picture on the page.';
            altGroup.style.display = 'none';
            applyBtn.textContent = '📋 Copy Photo Name';
        } else {
            if (modalTitle) modalTitle.textContent = isBackground ? '📷 Change Background Picture' : '📷 Change Picture';
            if (modalSubtitle) modalSubtitle.textContent = 'Upload a photo from your computer, choose from station media, or enter an image URL.';
            applyBtn.textContent = 'Apply Picture';
        }

        // Determine current image from element
        let currentSrc = '';
        if (targetElement) {
            if (isBackground) {
                altGroup.style.display = 'none';
                const bg = targetElement.style.backgroundImage || getComputedStyle(targetElement).backgroundImage;
                const match = bg.match(/url\(["']?([^"']+)["']?\)/);
                if (match) currentSrc = match[1];
            } else {
                altGroup.style.display = '';
                currentSrc = targetElement.getAttribute('src') || '';
                altInput.value = targetElement.getAttribute('alt') || '';
            }
        } else {
            currentSrc = 'truck46.jpg';
        }

        selectedSrc = currentSrc;
        previewThumb.src = currentSrc || 'truck46.jpg';
        previewName.textContent = currentSrc ? (currentSrc.startsWith('data:') ? 'Custom Uploaded Photo' : currentSrc) : (isBrowsingOnly ? 'Select a photo' : 'Current Picture');
        previewMeta.textContent = isBrowsingOnly ? 'Station Media' : (isBackground ? 'Background Picture' : 'Image Tag');
        urlInput.value = currentSrc && !currentSrc.startsWith('data:') ? currentSrc : '';

        // Tab switcher
        overlay.querySelectorAll('.image-editor-tab-btn').forEach(btn => {
            btn.onclick = () => {
                overlay.querySelectorAll('.image-editor-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const targetTab = btn.dataset.tab;
                overlay.querySelector('#image-tab-upload').style.display = targetTab === 'upload' ? 'block' : 'none';
                overlay.querySelector('#image-tab-library').style.display = targetTab === 'library' ? 'block' : 'none';
                overlay.querySelector('#image-tab-url').style.display = targetTab === 'url' ? 'block' : 'none';
            };
        });

        // Set default tab for browsing mode
        if (isBrowsingOnly) {
            overlay.querySelectorAll('.image-editor-tab-btn').forEach(b => b.classList.remove('active'));
            const libBtn = overlay.querySelector('.image-editor-tab-btn[data-tab="library"]');
            if (libBtn) libBtn.classList.add('active');
            overlay.querySelector('#image-tab-upload').style.display = 'none';
            overlay.querySelector('#image-tab-library').style.display = 'block';
            overlay.querySelector('#image-tab-url').style.display = 'none';
        }

        // Render station media library
        function renderLibrary(query = '') {
            libraryGrid.innerHTML = '';
            const filtered = STATION_MEDIA_ASSETS.filter(a => !query || a.name.toLowerCase().includes(query.toLowerCase()) || a.src.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()));
            filtered.forEach(asset => {
                const card = document.createElement('div');
                card.className = 'image-library-item' + (selectedSrc === asset.src ? ' selected' : '');
                card.innerHTML = `
                    <img src="${asset.src}" alt="${asset.name}" class="image-library-thumb" loading="lazy">
                    <span class="image-library-item-name" title="${asset.name}">${asset.name}</span>
                `;
                card.addEventListener('click', () => {
                    libraryGrid.querySelectorAll('.image-library-item').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    selectedSrc = asset.src;
                    previewThumb.src = asset.src;
                    previewName.textContent = asset.name;
                    previewMeta.textContent = asset.src;
                    urlInput.value = asset.src;
                    if (isBrowsingOnly) {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(asset.src).catch(() => {});
                        }
                        showAdminToast(`📋 Copied "${asset.src}" to clipboard!`);
                    }
                });
                libraryGrid.appendChild(card);
            });
        }
        renderLibrary();
        librarySearch.oninput = () => renderLibrary(librarySearch.value.trim());

        // File upload with auto-compression
        fileInput.onchange = () => {
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                previewName.textContent = 'Optimizing ' + file.name + '...';
                compressImage(file, (dataUrl) => {
                    selectedSrc = dataUrl;
                    previewThumb.src = dataUrl;
                    previewName.textContent = file.name;
                    previewMeta.textContent = Math.round(dataUrl.length / 1024) + ' KB (optimized)';
                });
            }
        };

        // URL manual typing
        urlInput.oninput = () => {
            const val = urlInput.value.trim();
            if (val) {
                selectedSrc = val;
                previewThumb.src = val;
                previewName.textContent = val;
                previewMeta.textContent = 'Custom URL';
            }
        };

        // Apply changes
        applyBtn.onclick = () => {
            if (isBrowsingOnly) {
                const toCopy = selectedSrc || 'truck46.jpg';
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(toCopy).catch(() => {});
                }
                showAdminToast(`📋 Copied "${toCopy}" to clipboard!`);
                overlay.classList.remove('active');
                return;
            }

            if (!selectedSrc) {
                alert('Please select or upload an image first.');
                return;
            }

            if (isBackground) {
                if (targetElement.classList.contains('card-img-placeholder')) {
                    targetElement.style.background = `linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.45)), url("${selectedSrc}") center/cover`;
                    targetElement.style.color = 'white';
                    targetElement.style.fontWeight = '800';
                    targetElement.style.textShadow = '0 2px 8px rgba(0,0,0,0.9)';
                } else if (targetElement.classList.contains('hero-bg') || targetElement.classList.contains('hero') || targetElement.classList.contains('small-hero') || targetElement.classList.contains('custom-hero-mini-wrap')) {
                    targetElement.style.backgroundImage = `linear-gradient(rgba(15, 25, 43, 0.25), rgba(15, 25, 43, 0.48)), url("${selectedSrc}")`;
                    targetElement.style.backgroundSize = 'cover';
                    targetElement.style.backgroundPosition = 'center';
                } else {
                    targetElement.style.backgroundImage = `url("${selectedSrc}")`;
                    targetElement.style.backgroundSize = 'cover';
                    targetElement.style.backgroundPosition = 'center';
                }
            } else {
                targetElement.src = selectedSrc;
                if (altInput.value.trim()) {
                    targetElement.alt = altInput.value.trim();
                }
            }

            const pageKey = getPageKey();
            const selectorPath = getElementSelectorPath(targetElement);
            saveImageEdit(pageKey, selectorPath, selectedSrc, isBackground);

            if (targetElement.closest('main')) {
                saveMainHtmlState();
            }
            if (targetElement.closest('#active-apparatus-list')) {
                saveApparatusState('active');
            } else if (targetElement.closest('#retired-apparatus-list')) {
                saveApparatusState('retired');
            }
            if (targetElement.closest('#roster-container')) {
                saveRosterState();
            }

            overlay.classList.remove('active');
            showAdminToast('✅ Picture updated! Click "💾 Save & Push to Git" to publish.');
        };

        overlay.classList.add('active');
    }

    function attachImageChangeOverlay(img) {
        if (!isAdminLoggedIn || !img) return;
        const parent = img.parentElement;
        if (!parent) return;

        if (getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
        }

        if (!parent.querySelector(':scope > .station-image-change-btn[data-for-img]')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'station-image-change-btn';
            btn.dataset.forImg = 'true';
            btn.style.display = editModeActive ? 'inline-flex' : 'none';
            btn.innerHTML = '📷 Change Photo';
            btn.title = 'Click to change this picture';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                openImageEditorModal(img, false);
            });
            parent.appendChild(btn);
        }

        if (!img.dataset.imageEditBound) {
            img.dataset.imageEditBound = 'true';
            img.addEventListener('click', (e) => {
                if (editModeActive && isAdminLoggedIn) {
                    e.preventDefault();
                    e.stopPropagation();
                    openImageEditorModal(img, false);
                }
            });
        }
    }

    function attachBackgroundImageChangeOverlay(el) {
        if (!isAdminLoggedIn || !el) return;
        if (getComputedStyle(el).position === 'static') {
            el.style.position = 'relative';
        }

        if (!el.querySelector(':scope > .station-image-change-btn[data-for-bg]')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'station-image-change-btn station-image-change-bg-btn';
            btn.dataset.forBg = 'true';
            btn.style.display = editModeActive ? 'inline-flex' : 'none';
            btn.innerHTML = '📷 Change Background';
            btn.title = 'Click to change background picture';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                openImageEditorModal(el, true);
            });
            el.appendChild(btn);
        }

        if (el.classList.contains('card-img-placeholder') && !el.dataset.bgEditBound) {
            el.dataset.bgEditBound = 'true';
            el.addEventListener('click', (e) => {
                if (editModeActive && isAdminLoggedIn) {
                    e.preventDefault();
                    e.stopPropagation();
                    openImageEditorModal(el, true);
                }
            });
        }
    }

    function setupUniversalImageEditors() {
        if (!isAdminLoggedIn) return;

        // 1. All images across page
        document.querySelectorAll('img').forEach(img => {
            if (img.closest('#station-image-editor-modal') ||
                img.closest('#station-section-picker-modal') ||
                img.closest('#station-page-creator-modal') ||
                img.closest('#admin-font-modal-overlay') ||
                img.closest('#admin-toast-notification') ||
                img.closest('#admin-floating-bar') ||
                img.classList.contains('nav-badge-img') ||
                img.classList.contains('footer-badge-img')) {
                return;
            }
            attachImageChangeOverlay(img);
        });

        // 2. All background elements (fleet cards, hero banners, custom blocks)
        document.querySelectorAll(
            '.card-img-placeholder, .hero-bg, .hero-membership, .hero.small-hero, ' +
            '.small-hero, .hero#home, .custom-hero-mini-wrap, [style*="background-image"]'
        ).forEach(el => {
            if (el.closest('#station-image-editor-modal') || el.closest('#admin-floating-bar')) return;
            attachBackgroundImageChangeOverlay(el);
        });
    }

    function attachGalleryControls(card) {
        if (!isAdminLoggedIn || !card) return;
        attachCardRemoveButton(card, () => {
            card.remove();
            saveMainHtmlState();
            showAdminToast('Photo removed');
        });

        const img = card.querySelector('img');
        if (img) {
            attachImageChangeOverlay(img);
        }
    }

    function setupChildItemControls(section) {
        if (!section) return;

        // 1. Cards Grids (+ Add Card and ✕ Remove Card)
        const cardsGrids = section.querySelectorAll('.custom-cards-grid');
        cardsGrids.forEach(grid => {
            grid.querySelectorAll('.custom-feature-card').forEach(card => {
                attachCardRemoveButton(card, () => {
                    card.remove();
                    saveMainHtmlState();
                    showAdminToast('Card removed');
                });
            });

            if (!grid.parentElement.querySelector(':scope > .section-card-add-btn[data-target="cards"]')) {
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'section-card-add-btn';
                addBtn.dataset.target = 'cards';
                addBtn.style.display = editModeActive ? 'flex' : 'none';
                addBtn.innerHTML = '➕ Add Feature Card';
                addBtn.addEventListener('click', () => {
                    const newCard = document.createElement('div');
                    newCard.className = 'custom-feature-card glass-card';
                    newCard.innerHTML = `
                        <div class="custom-card-icon" contenteditable="${editModeActive ? 'true' : 'false'}">⭐</div>
                        <h3 class="custom-card-title" contenteditable="${editModeActive ? 'true' : 'false'}">New Service or Feature</h3>
                        <p class="custom-card-desc" contenteditable="${editModeActive ? 'true' : 'false'}">Enter description here. Click to edit any details or add new points.</p>
                        <a href="#" class="custom-card-link" contenteditable="${editModeActive ? 'true' : 'false'}">Learn More &rarr;</a>
                    `;
                    grid.appendChild(newCard);
                    attachCardRemoveButton(newCard, () => {
                        newCard.remove();
                        saveMainHtmlState();
                        showAdminToast('Card removed');
                    });
                    initLiveEditor();
                    saveMainHtmlState();
                    showAdminToast('Card added! Click any text to edit.');
                });
                grid.after(addBtn);
            }
        });

        // 2. FAQ Accordions (+ Add Question and ✕ Remove)
        const faqLists = section.querySelectorAll('.custom-faq-list');
        faqLists.forEach(list => {
            list.querySelectorAll('.custom-faq-item').forEach(item => {
                attachCardRemoveButton(item, () => {
                    item.remove();
                    saveMainHtmlState();
                    showAdminToast('Question removed');
                });
            });

            if (!list.parentElement.querySelector(':scope > .section-card-add-btn[data-target="faq"]')) {
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'section-card-add-btn';
                addBtn.dataset.target = 'faq';
                addBtn.style.display = editModeActive ? 'flex' : 'none';
                addBtn.innerHTML = '➕ Add FAQ Question';
                addBtn.addEventListener('click', () => {
                    const newItem = document.createElement('div');
                    newItem.className = 'custom-faq-item glass-card open';
                    newItem.innerHTML = `
                        <button type="button" class="custom-faq-header">
                            <span class="custom-faq-q" contenteditable="${editModeActive ? 'true' : 'false'}">New Question Here?</span>
                            <span class="custom-faq-chevron">▾</span>
                        </button>
                        <div class="custom-faq-answer">
                            <p contenteditable="${editModeActive ? 'true' : 'false'}">Provide the answer here. Click text to edit anytime.</p>
                        </div>
                    `;
                    list.appendChild(newItem);
                    attachCardRemoveButton(newItem, () => {
                        newItem.remove();
                        saveMainHtmlState();
                        showAdminToast('Question removed');
                    });
                    initCustomFaqAccordions(newItem);
                    initLiveEditor();
                    saveMainHtmlState();
                    showAdminToast('Question added!');
                });
                list.after(addBtn);
            }
        });

        // 3. Stats Grids (+ Add Stat and ✕ Remove)
        const statsGrids = section.querySelectorAll('.custom-stats-grid');
        statsGrids.forEach(grid => {
            grid.querySelectorAll('.custom-stat-box').forEach(box => {
                attachCardRemoveButton(box, () => {
                    box.remove();
                    saveMainHtmlState();
                    showAdminToast('Stat removed');
                });
            });

            if (!grid.parentElement.querySelector(':scope > .section-card-add-btn[data-target="stats"]')) {
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'section-card-add-btn';
                addBtn.dataset.target = 'stats';
                addBtn.style.display = editModeActive ? 'flex' : 'none';
                addBtn.innerHTML = '➕ Add Stat Box';
                addBtn.addEventListener('click', () => {
                    const newBox = document.createElement('div');
                    newBox.className = 'custom-stat-box glass-card';
                    newBox.innerHTML = `
                        <div class="custom-stat-num" contenteditable="${editModeActive ? 'true' : 'false'}">100+</div>
                        <div class="custom-stat-label" contenteditable="${editModeActive ? 'true' : 'false'}">Metric Title</div>
                        <p class="custom-stat-sub" contenteditable="${editModeActive ? 'true' : 'false'}">Short note about this metric.</p>
                    `;
                    grid.appendChild(newBox);
                    attachCardRemoveButton(newBox, () => {
                        newBox.remove();
                        saveMainHtmlState();
                        showAdminToast('Stat removed');
                    });
                    initLiveEditor();
                    saveMainHtmlState();
                    showAdminToast('Stat added!');
                });
                grid.after(addBtn);
            }
        });

        // 4. Photo Gallery Grid (+ Add Photo and Change Image)
        const galleryGrids = section.querySelectorAll('.custom-gallery-grid');
        galleryGrids.forEach(grid => {
            grid.querySelectorAll('.custom-gallery-card').forEach(card => {
                attachGalleryControls(card);
            });

            if (!grid.parentElement.querySelector(':scope > .section-card-add-btn[data-target="gallery"]')) {
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'section-card-add-btn';
                addBtn.dataset.target = 'gallery';
                addBtn.style.display = editModeActive ? 'flex' : 'none';
                addBtn.innerHTML = '➕ Add Photo to Showcase';
                addBtn.addEventListener('click', () => {
                    const newCard = document.createElement('div');
                    newCard.className = 'custom-gallery-card';
                    newCard.innerHTML = `
                        <img src="drill-1.jpg" alt="Photo" class="custom-gallery-img">
                        <div class="custom-gallery-caption" contenteditable="${editModeActive ? 'true' : 'false'}">Photo Caption Here</div>
                    `;
                    grid.appendChild(newCard);
                    attachGalleryControls(newCard);
                    initLiveEditor();
                    saveMainHtmlState();
                    showAdminToast('Photo added! Click Change Photo to change picture.');
                });
                grid.after(addBtn);
            }
        });

        // 5. Timeline Milestones (+ Add Milestone and ✕ Remove)
        const timelineLists = section.querySelectorAll('.custom-timeline-list');
        timelineLists.forEach(list => {
            list.querySelectorAll('.custom-timeline-item').forEach(item => {
                attachCardRemoveButton(item, () => {
                    item.remove();
                    saveMainHtmlState();
                    showAdminToast('Milestone removed');
                });
            });

            if (!list.parentElement.querySelector(':scope > .section-card-add-btn[data-target="timeline"]')) {
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'section-card-add-btn';
                addBtn.dataset.target = 'timeline';
                addBtn.style.display = editModeActive ? 'flex' : 'none';
                addBtn.innerHTML = '➕ Add Milestone to Timeline';
                addBtn.addEventListener('click', () => {
                    const newItem = document.createElement('div');
                    newItem.className = 'custom-timeline-item glass-card';
                    newItem.innerHTML = `
                        <div class="custom-timeline-year" contenteditable="${editModeActive ? 'true' : 'false'}">Year</div>
                        <div class="custom-timeline-body">
                            <h3 class="custom-timeline-title" contenteditable="${editModeActive ? 'true' : 'false'}">New Milestone Title</h3>
                            <p class="custom-timeline-desc" contenteditable="${editModeActive ? 'true' : 'false'}">Description of station accomplishment, history or response milestone.</p>
                        </div>
                    `;
                    list.appendChild(newItem);
                    attachCardRemoveButton(newItem, () => {
                        newItem.remove();
                        saveMainHtmlState();
                        showAdminToast('Milestone removed');
                    });
                    initLiveEditor();
                    saveMainHtmlState();
                    showAdminToast('Milestone added!');
                });
                list.after(addBtn);
            }
        });

        // 6. Events Grid (+ Add Event and ✕ Remove)
        const eventsGrids = section.querySelectorAll('.custom-events-grid');
        eventsGrids.forEach(grid => {
            grid.querySelectorAll('.custom-event-card').forEach(card => {
                attachCardRemoveButton(card, () => {
                    card.remove();
                    saveMainHtmlState();
                    showAdminToast('Event removed');
                });
            });

            if (!grid.parentElement.querySelector(':scope > .section-card-add-btn[data-target="events"]')) {
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'section-card-add-btn';
                addBtn.dataset.target = 'events';
                addBtn.style.display = editModeActive ? 'flex' : 'none';
                addBtn.innerHTML = '➕ Add Event Card';
                addBtn.addEventListener('click', () => {
                    const newCard = document.createElement('div');
                    newCard.className = 'custom-event-card glass-card';
                    newCard.innerHTML = `
                        <div class="custom-event-date-badge">
                            <span class="custom-event-month" contenteditable="${editModeActive ? 'true' : 'false'}">DATE</span>
                            <span class="custom-event-day" contenteditable="${editModeActive ? 'true' : 'false'}">01</span>
                        </div>
                        <div class="custom-event-info">
                            <h3 class="custom-event-title" contenteditable="${editModeActive ? 'true' : 'false'}">New Station Event</h3>
                            <div class="custom-event-meta" contenteditable="${editModeActive ? 'true' : 'false'}">Time &bull; Station 46 Headquarters</div>
                            <p class="custom-event-desc" contenteditable="${editModeActive ? 'true' : 'false'}">Event summary and community details. Click text to edit.</p>
                            <a href="#" class="btn btn-sm btn-primary" contenteditable="${editModeActive ? 'true' : 'false'}">Event Details &rarr;</a>
                        </div>
                    `;
                    grid.appendChild(newCard);
                    attachCardRemoveButton(newCard, () => {
                        newCard.remove();
                        saveMainHtmlState();
                        showAdminToast('Event removed');
                    });
                    initLiveEditor();
                    saveMainHtmlState();
                    showAdminToast('Event added!');
                });
                grid.after(addBtn);
            }
        });

        // 7. Testimonials Quotes Grid (+ Add Quote and ✕ Remove)
        const quotesGrids = section.querySelectorAll('.custom-quotes-grid');
        quotesGrids.forEach(grid => {
            grid.querySelectorAll('.custom-quote-card').forEach(card => {
                attachCardRemoveButton(card, () => {
                    card.remove();
                    saveMainHtmlState();
                    showAdminToast('Quote removed');
                });
            });

            if (!grid.parentElement.querySelector(':scope > .section-card-add-btn[data-target="quotes"]')) {
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'section-card-add-btn';
                addBtn.dataset.target = 'quotes';
                addBtn.style.display = editModeActive ? 'flex' : 'none';
                addBtn.innerHTML = '➕ Add Resident Quote';
                addBtn.addEventListener('click', () => {
                    const newCard = document.createElement('div');
                    newCard.className = 'custom-quote-card glass-card';
                    newCard.innerHTML = `
                        <div class="custom-quote-stars" contenteditable="${editModeActive ? 'true' : 'false'}">⭐⭐⭐⭐⭐</div>
                        <p class="custom-quote-text" contenteditable="${editModeActive ? 'true' : 'false'}">"Enter quote or feedback from resident or community partner."</p>
                        <div class="custom-quote-author" contenteditable="${editModeActive ? 'true' : 'false'}">Resident Name &mdash; Montgomery Township</div>
                    `;
                    grid.appendChild(newCard);
                    attachCardRemoveButton(newCard, () => {
                        newCard.remove();
                        saveMainHtmlState();
                        showAdminToast('Quote removed');
                    });
                    initLiveEditor();
                    saveMainHtmlState();
                    showAdminToast('Quote added!');
                });
                grid.after(addBtn);
            }
        });

        // 8. Recruitment Steps Grid (+ Add Step and ✕ Remove)
        const stepsGrids = section.querySelectorAll('.custom-steps-grid');
        stepsGrids.forEach(grid => {
            grid.querySelectorAll('.custom-step-card').forEach(card => {
                attachCardRemoveButton(card, () => {
                    card.remove();
                    saveMainHtmlState();
                    showAdminToast('Step removed');
                });
            });

            if (!grid.parentElement.querySelector(':scope > .section-card-add-btn[data-target="steps"]')) {
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'section-card-add-btn';
                addBtn.dataset.target = 'steps';
                addBtn.style.display = editModeActive ? 'flex' : 'none';
                addBtn.innerHTML = '➕ Add Process Step';
                addBtn.addEventListener('click', () => {
                    const stepCount = grid.querySelectorAll('.custom-step-card').length + 1;
                    const newCard = document.createElement('div');
                    newCard.className = 'custom-step-card glass-card';
                    newCard.innerHTML = `
                        <div class="custom-step-num" contenteditable="${editModeActive ? 'true' : 'false'}">${stepCount < 10 ? '0' + stepCount : stepCount}</div>
                        <h3 class="custom-step-title" contenteditable="${editModeActive ? 'true' : 'false'}">New Onboarding Step</h3>
                        <p class="custom-step-desc" contenteditable="${editModeActive ? 'true' : 'false'}">Describe what candidates or community members do in this step.</p>
                    `;
                    grid.appendChild(newCard);
                    attachCardRemoveButton(newCard, () => {
                        newCard.remove();
                        saveMainHtmlState();
                        showAdminToast('Step removed');
                    });
                    initLiveEditor();
                    saveMainHtmlState();
                    showAdminToast('Step added!');
                });
                grid.after(addBtn);
            }
        });

        // 9. Specifications Table (+ Add Row and ✕ Remove)
        const specsTables = section.querySelectorAll('.custom-specs-table');
        specsTables.forEach(table => {
            const tbody = table.querySelector('tbody') || table;
            tbody.querySelectorAll('.custom-specs-row').forEach(row => {
                if (!row.querySelector('.stat-row-remove-btn')) {
                    const cell = row.lastElementChild;
                    if (cell) {
                        const removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.className = 'stat-row-remove-btn';
                        removeBtn.innerHTML = '✕';
                        removeBtn.title = 'Remove row';
                        removeBtn.style.display = editModeActive ? 'inline-flex' : 'none';
                        removeBtn.style.marginLeft = '8px';
                        removeBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            row.remove();
                            saveMainHtmlState();
                            showAdminToast('Row removed');
                        });
                        cell.appendChild(removeBtn);
                    }
                }
            });

            if (!table.parentElement.querySelector(':scope > .section-card-add-btn[data-target="specs"]')) {
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'section-card-add-btn';
                addBtn.dataset.target = 'specs';
                addBtn.style.display = editModeActive ? 'flex' : 'none';
                addBtn.innerHTML = '➕ Add Table Row';
                addBtn.addEventListener('click', () => {
                    const newRow = document.createElement('tr');
                    newRow.className = 'custom-specs-row';
                    newRow.innerHTML = `
                        <td contenteditable="${editModeActive ? 'true' : 'false'}">Equipment / Unit</td>
                        <td contenteditable="${editModeActive ? 'true' : 'false'}">Make &amp; Model</td>
                        <td contenteditable="${editModeActive ? 'true' : 'false'}">2024</td>
                        <td contenteditable="${editModeActive ? 'true' : 'false'}">Capacity / Spec</td>
                        <td contenteditable="${editModeActive ? 'true' : 'false'}">Operational Role</td>
                    `;
                    tbody.appendChild(newRow);
                    const cell = newRow.lastElementChild;
                    if (cell) {
                        const removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.className = 'stat-row-remove-btn';
                        removeBtn.innerHTML = '✕';
                        removeBtn.title = 'Remove row';
                        removeBtn.style.display = editModeActive ? 'inline-flex' : 'none';
                        removeBtn.style.marginLeft = '8px';
                        removeBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            newRow.remove();
                            saveMainHtmlState();
                            showAdminToast('Row removed');
                        });
                        cell.appendChild(removeBtn);
                    }
                    initLiveEditor();
                    saveMainHtmlState();
                    showAdminToast('Row added!');
                });
                table.after(addBtn);
            }
        });

        // 10. Donation Tiers Grid (+ Add Tier and ✕ Remove)
        const donateGrids = section.querySelectorAll('.custom-donate-tiers-grid');
        donateGrids.forEach(grid => {
            grid.querySelectorAll('.custom-donate-tier-card').forEach(card => {
                attachCardRemoveButton(card, () => {
                    card.remove();
                    saveMainHtmlState();
                    showAdminToast('Tier removed');
                });
            });

            if (!grid.parentElement.querySelector(':scope > .section-card-add-btn[data-target="donate"]')) {
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'section-card-add-btn';
                addBtn.dataset.target = 'donate';
                addBtn.style.display = editModeActive ? 'flex' : 'none';
                addBtn.innerHTML = '➕ Add Donation Tier';
                addBtn.addEventListener('click', () => {
                    const newCard = document.createElement('div');
                    newCard.className = 'custom-donate-tier-card glass-card';
                    newCard.innerHTML = `
                        <div class="custom-donate-amount" contenteditable="${editModeActive ? 'true' : 'false'}">$500</div>
                        <div class="custom-donate-title" contenteditable="${editModeActive ? 'true' : 'false'}">Sponsorship Level</div>
                        <p class="custom-donate-desc" contenteditable="${editModeActive ? 'true' : 'false'}">Description of equipment purchased with this donation.</p>
                    `;
                    grid.appendChild(newCard);
                    attachCardRemoveButton(newCard, () => {
                        newCard.remove();
                        saveMainHtmlState();
                        showAdminToast('Tier removed');
                    });
                    initLiveEditor();
                    saveMainHtmlState();
                    showAdminToast('Donation tier added!');
                });
                grid.after(addBtn);
            }
        });

        // 11. Connect image change triggers on any images or backgrounds within the section
        setupUniversalImageEditors();
    }

    function isEligibleContentSection(section) {
        if (!section || section.nodeType !== Node.ELEMENT_NODE) return false;
        if (section.tagName !== 'SECTION') return false;
        if (section.classList.contains('hero') ||
            section.classList.contains('small-hero') ||
            section.id === 'home' ||
            section.closest('.hero') ||
            section.closest('#home') ||
            section.closest('.small-hero') ||
            section.querySelector('.hero-content') ||
            section.querySelector('.hero-bg') ||
            section.querySelector('.hero-title')) {
            return false;
        }
        if (section.classList.contains('admin-main-section') ||
            section.id === 'admin-login-view' ||
            section.id === 'admin-dashboard-view' ||
            section.closest('.admin-dashboard') ||
            section.closest('#admin-login-view')) {
            return false;
        }
        return true;
    }

    // ==========================================================================
    // Website Builder Drag & Drop Section Reordering Engine
    // ==========================================================================
    let draggedSection = null;
    let sectionDropIndicator = null;

    function removeSectionDropIndicators() {
        document.querySelectorAll('.section-drop-indicator').forEach(el => el.remove());
        sectionDropIndicator = null;
    }

    function showSectionDropIndicator(targetSection, position = 'before') {
        if (!sectionDropIndicator) {
            sectionDropIndicator = document.createElement('div');
            sectionDropIndicator.className = 'section-drop-indicator';
            sectionDropIndicator.innerHTML = '<span class="section-drop-indicator-badge">↳ Drop Section Here</span>';
        }

        if (position === 'before') {
            if (targetSection.previousElementSibling !== sectionDropIndicator) {
                targetSection.parentNode.insertBefore(sectionDropIndicator, targetSection);
            }
        } else {
            if (targetSection.nextElementSibling !== sectionDropIndicator) {
                targetSection.parentNode.insertBefore(sectionDropIndicator, targetSection.nextSibling);
            }
        }
    }

    function setupSectionTouchDrag(handle, section) {
        let startY = 0;
        let initialTouchMoved = false;
        let touchGhost = null;

        handle.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            startY = e.touches[0].clientY;
            initialTouchMoved = false;
            draggedSection = section;
        }, { passive: true });

        handle.addEventListener('touchmove', (e) => {
            if (!draggedSection || e.touches.length !== 1) return;
            const touch = e.touches[0];
            const currentY = touch.clientY;

            if (Math.abs(currentY - startY) > 10 && !initialTouchMoved) {
                initialTouchMoved = true;
                section.classList.add('section-dragging');

                touchGhost = document.createElement('div');
                touchGhost.className = 'section-drop-indicator-badge';
                touchGhost.style.position = 'fixed';
                touchGhost.style.zIndex = '999999';
                touchGhost.style.pointerEvents = 'none';
                touchGhost.textContent = `Moving: ${section.id || 'Section'}`;
                document.body.appendChild(touchGhost);
            }

            if (initialTouchMoved) {
                e.preventDefault();
                if (touchGhost) {
                    touchGhost.style.top = `${touch.clientY - 20}px`;
                    touchGhost.style.left = `${touch.clientX - 60}px`;
                }

                if (touch.clientY < 80) {
                    window.scrollBy({ top: -15, behavior: 'auto' });
                } else if (touch.clientY > window.innerHeight - 80) {
                    window.scrollBy({ top: 15, behavior: 'auto' });
                }

                const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
                const targetSec = elementUnderTouch ? elementUnderTouch.closest('section') : null;

                if (targetSec && isEligibleContentSection(targetSec) && targetSec !== section) {
                    const rect = targetSec.getBoundingClientRect();
                    const isUpper = (touch.clientY - rect.top) < (rect.height / 2);
                    showSectionDropIndicator(targetSec, isUpper ? 'before' : 'after');
                }
            }
        }, { passive: false });

        const endTouch = () => {
            if (touchGhost) {
                touchGhost.remove();
                touchGhost = null;
            }

            if (draggedSection) {
                draggedSection.classList.remove('section-dragging');
            }

            if (initialTouchMoved && sectionDropIndicator && sectionDropIndicator.parentNode) {
                const parent = sectionDropIndicator.parentNode;
                parent.insertBefore(section, sectionDropIndicator);
                removeSectionDropIndicators();

                section.classList.add('section-drop-highlight');
                setTimeout(() => section.classList.remove('section-drop-highlight'), 1200);

                ensureSectionInsertDividers();
                setupUniversalImageEditors();
                saveMainHtmlState();
                showAdminToast('✅ Section moved! Click "Save & Push to Git" to publish.');
            } else {
                removeSectionDropIndicators();
            }

            draggedSection = null;
            initialTouchMoved = false;
        };

        handle.addEventListener('touchend', endTouch);
        handle.addEventListener('touchcancel', endTouch);
    }

    function setupSectionControls(section) {
        if (!isEligibleContentSection(section)) return;
        if (section.querySelector(':scope > .section-admin-bar')) return;

        const bar = document.createElement('div');
        bar.className = 'section-admin-bar';
        bar.style.display = editModeActive ? 'flex' : 'none';

        // Drag Handle on Left
        const dragHandle = document.createElement('div');
        dragHandle.className = 'section-drag-handle';
        dragHandle.setAttribute('draggable', 'true');
        dragHandle.title = 'Drag to reorder section anywhere on page';
        dragHandle.innerHTML = `<span class="section-drag-grip">⋮⋮</span><span>Move</span>`;

        const titleWrap = document.createElement('div');
        titleWrap.className = 'section-admin-bar-title';

        let labelText = section.id ? `#${section.id}` : 'Section';
        const heading = section.querySelector('h1, h2, h3, .section-title');
        if (heading && heading.textContent.trim()) {
            const t = heading.textContent.trim();
            labelText = t.length > 28 ? t.substring(0, 25) + '...' : t;
        }
        titleWrap.innerHTML = `<span class="section-admin-bar-icon">📌</span><span class="section-admin-bar-label">${escapeHtml(labelText)}</span>`;

        const actions = document.createElement('div');
        actions.className = 'section-admin-bar-actions';

        // Move Up - Only swap with prior eligible content sections (never above hero)
        const upBtn = document.createElement('button');
        upBtn.type = 'button';
        upBtn.className = 'section-admin-btn';
        upBtn.innerHTML = '▲ Up';
        upBtn.title = 'Move section up';
        upBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let prev = section.previousElementSibling;
            while (prev && !isEligibleContentSection(prev)) {
                prev = prev.previousElementSibling;
            }
            if (prev && isEligibleContentSection(prev)) {
                section.parentNode.insertBefore(section, prev);
                ensureSectionInsertDividers();
                saveMainHtmlState();
                showAdminToast('Section moved up');
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                showAdminToast('Already at the top of content', true);
            }
        });

        // Move Down - Only swap with subsequent eligible content sections
        const downBtn = document.createElement('button');
        downBtn.type = 'button';
        downBtn.className = 'section-admin-btn';
        downBtn.innerHTML = '▼ Down';
        downBtn.title = 'Move section down';
        downBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let next = section.nextElementSibling;
            while (next && !isEligibleContentSection(next)) {
                next = next.nextElementSibling;
            }
            if (next && isEligibleContentSection(next)) {
                section.parentNode.insertBefore(next, section);
                ensureSectionInsertDividers();
                saveMainHtmlState();
                showAdminToast('Section moved down');
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                showAdminToast('Already at the bottom of content', true);
            }
        });

        // Insert Below
        const addBelowBtn = document.createElement('button');
        addBelowBtn.type = 'button';
        addBelowBtn.className = 'section-admin-btn section-btn-add-below';
        addBelowBtn.innerHTML = '➕ Insert Below';
        addBelowBtn.title = 'Insert a new section directly below this one';
        addBelowBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openAddSectionModal(section);
        });

        // Delete Section
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'section-admin-btn section-btn-delete';
        deleteBtn.innerHTML = '🗑️ Delete';
        deleteBtn.title = 'Delete this section';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete this section (${labelText})?`)) {
                section.remove();
                ensureSectionInsertDividers();
                saveMainHtmlState();
                showAdminToast('Section deleted');
            }
        });

        // Wire HTML5 Drag Events on Handle
        dragHandle.addEventListener('dragstart', (e) => {
            draggedSection = section;
            section.classList.add('section-dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', section.id || 'section');
        });

        dragHandle.addEventListener('dragend', () => {
            section.classList.remove('section-dragging');
            draggedSection = null;
            removeSectionDropIndicators();
        });

        setupSectionTouchDrag(dragHandle, section);

        // Section Drop Target Listeners
        section.addEventListener('dragover', (e) => {
            if (!draggedSection || draggedSection === section) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const rect = section.getBoundingClientRect();
            const isUpper = (e.clientY - rect.top) < (rect.height / 2);
            showSectionDropIndicator(section, isUpper ? 'before' : 'after');
        });

        section.addEventListener('drop', (e) => {
            if (!draggedSection || draggedSection === section) return;
            e.preventDefault();
            const rect = section.getBoundingClientRect();
            const isUpper = (e.clientY - rect.top) < (rect.height / 2);
            removeSectionDropIndicators();

            if (isUpper) {
                section.parentNode.insertBefore(draggedSection, section);
            } else {
                section.parentNode.insertBefore(draggedSection, section.nextSibling);
            }

            draggedSection.classList.remove('section-dragging');
            draggedSection.classList.add('section-drop-highlight');
            setTimeout(() => draggedSection?.classList.remove('section-drop-highlight'), 1200);

            draggedSection = null;
            ensureSectionInsertDividers();
            setupUniversalImageEditors();
            saveMainHtmlState();
            showAdminToast('✅ Section reordered! Remember to click "Save & Push to Git" to publish.');
        });

        actions.appendChild(dragHandle);
        actions.appendChild(upBtn);
        actions.appendChild(downBtn);
        actions.appendChild(addBelowBtn);
        actions.appendChild(deleteBtn);

        bar.appendChild(titleWrap);
        bar.appendChild(actions);

        section.insertBefore(bar, section.firstChild);

        setupChildItemControls(section);
    }

    function ensureSectionInsertDividers() {
        if (!isAdminLoggedIn) return;
        const main = document.querySelector('main');
        if (!main) return;

        main.querySelectorAll(':scope > .section-insert-divider, .hero .section-insert-divider, #home .section-insert-divider, .small-hero .section-insert-divider').forEach(el => el.remove());

        const heroSec = main.querySelector(':scope > section.hero, :scope > section#home, :scope > section.small-hero');
        const eligibleSections = Array.from(main.querySelectorAll(':scope > section')).filter(s => isEligibleContentSection(s));

        // Allow inserting directly below the hero banner (above first content section)
        if (heroSec) {
            const div = document.createElement('div');
            div.className = 'section-insert-divider';
            div.style.display = editModeActive ? 'flex' : 'none';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'section-insert-divider-btn';
            btn.innerHTML = '➕ Insert New Section Here';
            btn.addEventListener('click', () => {
                openAddSectionModal(heroSec);
            });

            div.appendChild(btn);
            heroSec.after(div);
        } else if (eligibleSections.length === 0) {
            // Page with no hero and no sections
            const div = document.createElement('div');
            div.className = 'section-insert-divider';
            div.style.display = editModeActive ? 'flex' : 'none';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'section-insert-divider-btn';
            btn.innerHTML = '➕ Insert New Section Here';
            btn.addEventListener('click', () => {
                openAddSectionModal(null);
            });

            div.appendChild(btn);
            main.appendChild(div);
        }

        eligibleSections.forEach((sec) => {
            const div = document.createElement('div');
            div.className = 'section-insert-divider';
            div.style.display = editModeActive ? 'flex' : 'none';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'section-insert-divider-btn';
            btn.innerHTML = '➕ Insert New Section Here';
            btn.addEventListener('click', () => {
                openAddSectionModal(sec);
            });

            div.appendChild(btn);
            sec.after(div);
        });
    }

    function setupAllSectionControls() {
        if (!isAdminLoggedIn) return;
        const main = document.querySelector('main');
        if (!main) return;

        // Clean up any errant toolbar in hero or admin view elements
        main.querySelectorAll('.hero .section-admin-bar, .small-hero .section-admin-bar, #home .section-admin-bar, .hero-content .section-admin-bar, .admin-main-section .section-admin-bar').forEach(el => el.remove());

        main.querySelectorAll(':scope > section').forEach(section => {
            if (isEligibleContentSection(section)) {
                setupSectionControls(section);
            }
        });

        ensureSectionInsertDividers();
    }

    function openAddSectionModal(insertTargetSection = null) {
        let overlay = document.getElementById('station-section-picker-modal');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'station-section-picker-modal';
            overlay.className = 'station-builder-modal-overlay';
            overlay.innerHTML = `
                <div class="station-builder-modal-card" style="max-width: 980px;">
                    <div class="station-builder-modal-header">
                        <div>
                            <h3 class="station-builder-modal-title">➕ Add New Section</h3>
                            <p class="station-builder-modal-subtitle">Choose from 16 pre-styled civic block templates to insert into this page.</p>
                        </div>
                        <button type="button" class="station-builder-modal-close" aria-label="Close modal">&times;</button>
                    </div>
                    <div class="station-builder-modal-body">
                        <div class="template-modal-top">
                            <input type="text" id="section-template-search-input" class="template-search-input" placeholder="🔍 Search templates (e.g. event, timeline, donate, fleet, stats, quotes, alert...)...">
                            <div class="template-filter-pills" id="section-template-filter-pills">
                                <button type="button" class="template-filter-pill active" data-category="all">All Templates (16)</button>
                                <button type="button" class="template-filter-pill" data-category="featured">🌟 Featured</button>
                                <button type="button" class="template-filter-pill" data-category="grids">🗂️ Grids &amp; Content</button>
                                <button type="button" class="template-filter-pill" data-category="advisory">🚨 Alerts &amp; Notice</button>
                                <button type="button" class="template-filter-pill" data-category="community">👥 Community &amp; Team</button>
                            </div>
                        </div>
                        <div class="section-template-grid" id="section-template-picker-grid"></div>
                    </div>
                    <div class="station-builder-modal-footer">
                        <button type="button" class="btn btn-secondary station-builder-modal-close-btn" style="padding: 9px 18px; border-radius: 6px;">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            overlay.querySelectorAll('.station-builder-modal-close, .station-builder-modal-close-btn').forEach(btn => {
                btn.addEventListener('click', () => overlay.classList.remove('active'));
            });
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('active');
            });
        }

        const grid = overlay.querySelector('#section-template-picker-grid');
        const searchInput = overlay.querySelector('#section-template-search-input');
        const filterPills = overlay.querySelectorAll('.template-filter-pill');

        const templates = [
            {
                key: 'spotlight',
                title: 'Spotlight / 2-Column Split',
                tag: 'Featured',
                category: 'featured',
                icon: '🌟',
                desc: 'Story with image upload, heading, checklist bullets, and action buttons.'
            },
            {
                key: 'hero-mini',
                title: 'Action Banner Showcase',
                tag: 'Showcase',
                category: 'featured',
                icon: '🚒',
                desc: 'High-impact banner with background photo, bold title, dual buttons, and 3 quick stat pills.'
            },
            {
                key: 'cards-grid',
                title: 'Civic Cards Grid',
                tag: '3 Columns',
                category: 'grids',
                icon: '🗂️',
                desc: 'Grid of glass cards with icons and descriptions. Includes + Add Card button.'
            },
            {
                key: 'stats-grid',
                title: 'By The Numbers / Stats Grid',
                tag: 'Metrics',
                category: 'featured',
                icon: '📊',
                desc: 'Key operational statistics counters. Includes + Add Stat button.'
            },
            {
                key: 'events-grid',
                title: 'Upcoming Events & Calendar',
                tag: 'Events',
                category: 'community',
                icon: '📅',
                desc: 'Event cards with calendar date badges, time, location, and RSVP links. Includes + Add Event button.'
            },
            {
                key: 'timeline',
                title: 'Station Milestones Timeline',
                tag: 'Milestones',
                category: 'community',
                icon: '⏳',
                desc: 'Historical milestones timeline with year badges and story descriptions. Includes + Add Milestone button.'
            },
            {
                key: 'quotes-grid',
                title: 'Resident Testimonials & Quotes',
                tag: 'Reviews',
                category: 'community',
                icon: '💬',
                desc: 'Resident review cards with 5-star ratings, quote text, and neighborhood tag. Includes + Add Quote button.'
            },
            {
                key: 'gallery',
                title: 'Photo & Media Showcase',
                tag: 'Gallery',
                category: 'featured',
                icon: '📸',
                desc: 'Photo cards with captions and image upload support. Includes + Add Photo button.'
            },
            {
                key: 'alert-box',
                title: 'Emergency Advisory Box',
                tag: 'Urgent Alert',
                category: 'advisory',
                icon: '⚠️',
                desc: 'Multi-tier readiness status box, burn ban advisory, weather standby, and dispatch numbers.'
            },
            {
                key: 'callout-banner',
                title: 'Emergency Callout Banner',
                tag: 'High Visibility',
                category: 'advisory',
                icon: '🚨',
                desc: 'Full-width civic alert or urgent announcement with icon and action button.'
            },
            {
                key: 'rich-text',
                title: 'Rich Content & Notice',
                tag: 'Official Copy',
                category: 'advisory',
                icon: '📜',
                desc: 'Official station notice, lead paragraph, formatted copy, and safety callout box.'
            },
            {
                key: 'faq-accordion',
                title: 'FAQ / Q&A Accordion',
                tag: 'Collapsible',
                category: 'community',
                icon: '❓',
                desc: 'Expandable question & answer items. Includes + Add Question button.'
            },
            {
                key: 'recruitment-steps',
                title: 'Volunteer Onboarding Steps',
                tag: 'Recruitment',
                category: 'community',
                icon: '🪜',
                desc: '4-step onboarding journey: Connect, Tour, Free Fire Academy, and Ride The Trucks. Includes + Add Step.'
            },
            {
                key: 'specs-table',
                title: 'Fleet & Equipment Specs Table',
                tag: 'Data Table',
                category: 'grids',
                icon: '📋',
                desc: 'Responsive comparison table for apparatus, pumps, chassis, and roles. Includes + Add Row button.'
            },
            {
                key: 'contact-grid',
                title: 'Headquarters & Directory Contacts',
                tag: 'Contacts',
                category: 'community',
                icon: '📞',
                desc: '3-card directory for 911 Dispatch, Headquarters non-emergency line, and station address.'
            },
            {
                key: 'donate-callout',
                title: 'Fund Drive & Donation Tiers',
                tag: 'Fundraising',
                category: 'featured',
                icon: '❤️',
                desc: 'Fund drive appeal with donation tier cards ($50, $100, $250, Custom) and equipment impact notes.'
            }
        ];

        let currentCategory = 'all';

        function renderTemplates() {
            grid.innerHTML = '';
            const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

            const filtered = templates.filter(tmpl => {
                const matchesCat = (currentCategory === 'all' || tmpl.category === currentCategory);
                const matchesQuery = !query || tmpl.title.toLowerCase().includes(query) || tmpl.desc.toLowerCase().includes(query) || tmpl.tag.toLowerCase().includes(query);
                return matchesCat && matchesQuery;
            });

            filtered.forEach(tmpl => {
                const card = document.createElement('div');
                card.className = 'section-template-card';
                card.innerHTML = `
                    <div class="section-template-icon-wrap">
                        <span class="section-template-icon">${tmpl.icon}</span>
                        <span class="section-template-tag">${tmpl.tag}</span>
                    </div>
                    <h4 class="section-template-title">${tmpl.title}</h4>
                    <p class="section-template-desc">${tmpl.desc}</p>
                    <button type="button" class="btn btn-primary w-100" style="padding: 8px 14px; font-size: 0.82rem; margin-top: auto;">Select Template</button>
                `;

                card.addEventListener('click', () => {
                    insertSectionFromTemplate(tmpl.key, insertTargetSection);
                    overlay.classList.remove('active');
                });

                grid.appendChild(card);
            });

            if (filtered.length === 0) {
                grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #64748b;">No templates found matching "${escapeHtml(query)}". Try another search or filter.</div>`;
            }
        }

        renderTemplates();

        if (searchInput) {
            searchInput.oninput = () => renderTemplates();
        }

        filterPills.forEach(pill => {
            pill.onclick = () => {
                filterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentCategory = pill.dataset.category || 'all';
                renderTemplates();
            };
        });

        overlay.classList.add('active');
    }

    function insertSectionFromTemplate(templateKey, targetSection = null) {
        const main = document.querySelector('main');
        if (!main) return;

        const id = 'section-' + Date.now();
        const section = document.createElement('section');
        section.className = 'section custom-section custom-section-' + templateKey;
        section.id = id;

        if (templateKey === 'spotlight') {
            section.innerHTML = `
                <div class="container">
                    <div class="custom-spotlight-wrap">
                        <div class="custom-spotlight-media">
                            <img src="drill-1.jpg" alt="Featured Story" class="custom-spotlight-img">
                            <div class="custom-spotlight-caption">Station 46 Operations</div>
                        </div>
                        <div class="custom-spotlight-body">
                            <span class="section-badge badge-red">Featured Spotlight</span>
                            <h2 class="section-title">Community Dedication &amp; Preparedness</h2>
                            <p class="custom-lead-text">Our dedicated volunteers train every week in advanced vehicle extrication, interior firefighting, and structural rescue.</p>
                            <ul class="custom-check-list">
                                <li><span>✓</span> Over 40 active volunteer firefighters on call 24/7/365</li>
                                <li><span>✓</span> State-of-the-art apparatus equipped for rapid deployment</li>
                                <li><span>✓</span> 100% free professional training and turnout gear provided</li>
                            </ul>
                            <div class="custom-action-row">
                                <a href="membership.html" class="btn btn-primary">Join Our Team</a>
                                <a href="about.html" class="btn btn-secondary">Learn More</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (templateKey === 'hero-mini') {
            section.innerHTML = `
                <div class="container">
                    <div class="custom-hero-mini-wrap" style="background-image: url('drill-2.jpeg');">
                        <div class="custom-hero-mini-overlay"></div>
                        <div class="custom-hero-mini-content">
                            <span class="section-badge badge-red">Station 46 Showcase</span>
                            <h2 class="custom-hero-mini-title">Prepared to Protect, Trained to Save</h2>
                            <p class="custom-hero-mini-lead">Montgomery Township Volunteer Fire Company #2 has answered the call with pride and honor since 1946. Providing 24-hour fire suppression, heavy rescue, and community safety services.</p>
                            <div class="custom-action-row">
                                <a href="membership.html" class="btn btn-primary">Become a Volunteer</a>
                                <a href="apparatus.html" class="btn btn-secondary" style="color: #ffffff; border-color: rgba(255,255,255,0.4);">View Our Fleet</a>
                            </div>
                            <div class="custom-hero-mini-pills">
                                <span class="custom-mini-stat-pill">⏱️ 24/7 Rapid Response</span>
                                <span class="custom-mini-stat-pill">🚒 100% Volunteer Staffed</span>
                                <span class="custom-mini-stat-pill">🎓 Free Certified Fire Academy</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (templateKey === 'cards-grid') {
            section.innerHTML = `
                <div class="container">
                    <div class="section-header text-center">
                        <span class="section-badge badge-blue">Programs &amp; Services</span>
                        <h2 class="section-title">How We Serve Montgomery</h2>
                        <p class="section-subtitle">Delivering high-caliber emergency response and community safety resources.</p>
                    </div>
                    <div class="custom-cards-grid">
                        <div class="custom-feature-card glass-card">
                            <div class="custom-card-icon">🚒</div>
                            <h3 class="custom-card-title">Fire Suppression</h3>
                            <p class="custom-card-desc">Rapid structural, brush, and vehicle fire response utilizing modern suppression technology.</p>
                            <a href="#" class="custom-card-link">Read Details &rarr;</a>
                        </div>
                        <div class="custom-feature-card glass-card">
                            <div class="custom-card-icon">🆘</div>
                            <h3 class="custom-card-title">Heavy Rescue</h3>
                            <p class="custom-card-desc">Advanced vehicle extrication, search &amp; rescue, and specialized rope operations.</p>
                            <a href="#" class="custom-card-link">Read Details &rarr;</a>
                        </div>
                        <div class="custom-feature-card glass-card">
                            <div class="custom-card-icon">🌊</div>
                            <h3 class="custom-card-title">Water Operations</h3>
                            <p class="custom-card-desc">Rapid watercraft deployment on Bedens Brook and the Millstone River during severe storms.</p>
                            <a href="#" class="custom-card-link">Read Details &rarr;</a>
                        </div>
                    </div>
                </div>
            `;
        } else if (templateKey === 'rich-text') {
            section.innerHTML = `
                <div class="container custom-container-narrow">
                    <div class="section-header">
                        <span class="section-badge badge-gold">Official Notice</span>
                        <h2 class="section-title">Public Safety Advisory &amp; Station Guidelines</h2>
                        <p class="section-subtitle">Important regulations and resident guidance from Montgomery Fire Company #2.</p>
                    </div>
                    <div class="custom-rich-content glass-card">
                        <p class="custom-lead-text">Montgomery Township Volunteer Fire Company #2 operates 24 hours a day to safeguard life and property throughout Montgomery and surrounding mutual aid townships.</p>
                        <p>During winter months and severe storm events, please ensure all nearby fire hydrants are shoveled clear with at least 3 feet of clearance on all sides. Fast hydrant access saves critical minutes during structural emergencies.</p>
                        <div class="custom-highlight-box">
                            <h4>⚠️ Important Reminder for Residents</h4>
                            <p>Never drive through flooded roadways or around barricades. Even six inches of fast-moving water can stall a passenger vehicle and endanger occupants.</p>
                        </div>
                        <p>For non-emergency station inquiries or banquet hall rental information, contact our headquarters office at (609) 466-3926.</p>
                    </div>
                </div>
            `;
        } else if (templateKey === 'faq-accordion') {
            section.innerHTML = `
                <div class="container custom-container-narrow">
                    <div class="section-header text-center">
                        <span class="section-badge badge-blue">Frequently Asked Questions</span>
                        <h2 class="section-title">Community Questions &amp; Answers</h2>
                        <p class="section-subtitle">Find fast answers regarding volunteering, services, and station operations.</p>
                    </div>
                    <div class="custom-faq-list">
                        <div class="custom-faq-item glass-card open">
                            <button type="button" class="custom-faq-header">
                                <span class="custom-faq-q">Do I need prior firefighting experience to join?</span>
                                <span class="custom-faq-chevron">▾</span>
                            </button>
                            <div class="custom-faq-answer">
                                <p>No prior experience is necessary. Station 46 sponsors all formal training through the Somerset County Emergency Services Training Academy at no cost to you.</p>
                            </div>
                        </div>
                        <div class="custom-faq-item glass-card">
                            <button type="button" class="custom-faq-header">
                                <span class="custom-faq-q">What is the minimum age requirement to volunteer?</span>
                                <span class="custom-faq-chevron">▾</span>
                            </button>
                            <div class="custom-faq-answer">
                                <p>Junior firefighters can join at age 16 with parental consent. Regular active firefighters can join starting at age 18.</p>
                            </div>
                        </div>
                        <div class="custom-faq-item glass-card">
                            <button type="button" class="custom-faq-header">
                                <span class="custom-faq-q">How does Station 46 receive funding?</span>
                                <span class="custom-faq-chevron">▾</span>
                            </button>
                            <div class="custom-faq-answer">
                                <p>Station 46 is funded through Montgomery Township Fire District #2 taxes, supplemented by community donations and fundraising events.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (templateKey === 'gallery') {
            section.innerHTML = `
                <div class="container">
                    <div class="section-header text-center">
                        <span class="section-badge badge-red">Photo Showcase</span>
                        <h2 class="section-title">Station Life &amp; Action Gallery</h2>
                        <p class="section-subtitle">A glimpse inside our training, emergency responses, and community events.</p>
                    </div>
                    <div class="custom-gallery-grid">
                        <div class="custom-gallery-card">
                            <img src="drill-2.jpg" alt="Drill Training" class="custom-gallery-img">
                            <div class="custom-gallery-caption">Weekly Live Fire Simulation</div>
                        </div>
                        <div class="custom-gallery-card">
                            <img src="drill-3.jpg" alt="Vehicle Extrication" class="custom-gallery-img">
                            <div class="custom-gallery-caption">Hydraulic Rescue Tool Practice</div>
                        </div>
                        <div class="custom-gallery-card">
                            <img src="family.jpg" alt="Community Event" class="custom-gallery-img">
                            <div class="custom-gallery-caption">Annual Open House &amp; BBQ</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (templateKey === 'callout-banner') {
            section.innerHTML = `
                <div class="container">
                    <div class="custom-callout-banner">
                        <div class="custom-callout-icon">🚨</div>
                        <div class="custom-callout-content">
                            <span class="custom-callout-badge">Important Community Announcement</span>
                            <h3 class="custom-callout-title">Severe Weather &amp; Emergency Preparedness</h3>
                            <p class="custom-callout-text">Station 46 is actively monitoring regional forecasts. Please check the Storm Safety Hub for live road closures and emergency updates.</p>
                        </div>
                        <div class="custom-callout-action">
                            <a href="#" class="btn btn-primary">View Safety Advisory</a>
                        </div>
                    </div>
                </div>
            `;
        } else if (templateKey === 'stats-grid') {
            section.innerHTML = `
                <div class="container">
                    <div class="section-header text-center">
                        <span class="section-badge badge-gold">By The Numbers</span>
                        <h2 class="section-title">Station 46 Operational Metrics</h2>
                        <p class="section-subtitle">Dedicated service to the township 24 hours a day, 365 days a year.</p>
                    </div>
                    <div class="custom-stats-grid">
                        <div class="custom-stat-box glass-card">
                            <div class="custom-stat-num">500+</div>
                            <div class="custom-stat-label">Annual Responses</div>
                            <p class="custom-stat-sub">Fires, rescues, and severe weather calls.</p>
                        </div>
                        <div class="custom-stat-box glass-card">
                            <div class="custom-stat-num">45+</div>
                            <div class="custom-stat-label">Active Volunteers</div>
                            <p class="custom-stat-sub">Firefighters, officers, and fire police.</p>
                        </div>
                        <div class="custom-stat-box glass-card">
                            <div class="custom-stat-num">100%</div>
                            <div class="custom-stat-label">Volunteer Driven</div>
                            <p class="custom-stat-sub">Neighbors protecting neighbors since 1946.</p>
                        </div>
                        <div class="custom-stat-box glass-card">
                            <div class="custom-stat-num">4-6 min</div>
                            <div class="custom-stat-label">Average Rollout Time</div>
                            <p class="custom-stat-sub">Fast response from Station 46 headquarters.</p>
                        </div>
                    </div>
                </div>
            `;
        } else if (templateKey === 'events-grid') {
            section.innerHTML = `
                <div class="container">
                    <div class="section-header text-center">
                        <span class="section-badge badge-red">Community Calendar</span>
                        <h2 class="section-title">Upcoming Station Events &amp; Activities</h2>
                        <p class="section-subtitle">Join us for community open houses, safety workshops, and volunteer drills.</p>
                    </div>
                    <div class="custom-events-grid">
                        <div class="custom-event-card glass-card">
                            <div class="custom-event-date-badge">
                                <span class="custom-event-month">OCT</span>
                                <span class="custom-event-day">24</span>
                            </div>
                            <div class="custom-event-info">
                                <h3 class="custom-event-title">Annual Fire Safety Open House</h3>
                                <div class="custom-event-meta">11:00 AM - 3:00 PM &bull; Station 46 HQ</div>
                                <p class="custom-event-desc">Tour apparatus, try on firefighter gear, watch live vehicle extrication demos, and enjoy free refreshments.</p>
                                <a href="#" class="btn btn-sm btn-primary">Event Info &rarr;</a>
                            </div>
                        </div>
                        <div class="custom-event-card glass-card">
                            <div class="custom-event-date-badge">
                                <span class="custom-event-month">NOV</span>
                                <span class="custom-event-day">15</span>
                            </div>
                            <div class="custom-event-info">
                                <h3 class="custom-event-title">Volunteer Info &amp; Drill Night</h3>
                                <div class="custom-event-meta">7:30 PM &bull; Station 46 Bay 2</div>
                                <p class="custom-event-desc">Meet line officers, explore the fleet, and discover how you can become a certified volunteer firefighter with free training.</p>
                                <a href="membership.html" class="btn btn-sm btn-primary">RSVP Now &rarr;</a>
                            </div>
                        </div>
                        <div class="custom-event-card glass-card">
                            <div class="custom-event-date-badge">
                                <span class="custom-event-month">DEC</span>
                                <span class="custom-event-day">14</span>
                            </div>
                            <div class="custom-event-info">
                                <h3 class="custom-event-title">Santa Tour Neighborhood Run</h3>
                                <div class="custom-event-meta">9:00 AM - 4:00 PM &bull; District Routes</div>
                                <p class="custom-event-desc">Santa tours the neighborhood streets of Montgomery Township aboard Truck 46 with holiday lights, sirens, and treats.</p>
                                <a href="santa.html" class="btn btn-sm btn-primary">View Routes &rarr;</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (templateKey === 'timeline') {
            section.innerHTML = `
                <div class="container">
                    <div class="section-header text-center">
                        <span class="section-badge badge-gold">Our Legacy</span>
                        <h2 class="section-title">Milestones in Station History</h2>
                        <p class="section-subtitle">Eight decades of volunteer dedication and continuous service to Montgomery Township.</p>
                    </div>
                    <div class="custom-timeline-list">
                        <div class="custom-timeline-item glass-card">
                            <div class="custom-timeline-year">1946</div>
                            <div class="custom-timeline-body">
                                <h3 class="custom-timeline-title">Founding of Company #2</h3>
                                <p class="custom-timeline-desc">Organized by local Blawenburg and Montgomery residents to establish rapid structural fire defense for township farms and homes.</p>
                            </div>
                        </div>
                        <div class="custom-timeline-item glass-card">
                            <div class="custom-timeline-year">1975</div>
                            <div class="custom-timeline-body">
                                <h3 class="custom-timeline-title">Route 518 Firehouse Headquarters Built</h3>
                                <p class="custom-timeline-desc">Construction of our 4-bay headquarters station, providing dedicated training bays, meeting halls, and modern apparatus housing.</p>
                            </div>
                        </div>
                        <div class="custom-timeline-item glass-card">
                            <div class="custom-timeline-year">2010</div>
                            <div class="custom-timeline-body">
                                <h3 class="custom-timeline-title">Heavy Rescue &amp; Thermal Imaging Expansion</h3>
                                <p class="custom-timeline-desc">Upgraded frontline fleet with state-of-the-art hydraulic rescue tools, thermal imaging cameras, and advanced water rescue capabilities.</p>
                            </div>
                        </div>
                        <div class="custom-timeline-item glass-card">
                            <div class="custom-timeline-year">Today</div>
                            <div class="custom-timeline-body">
                                <h3 class="custom-timeline-title">Modern Fleet &amp; 500+ Annual Responses</h3>
                                <p class="custom-timeline-desc">Operating Seagrave 95' Aerialscope Truck 46 and custom Pierce pumpers with over 40 highly trained active volunteer responders.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (templateKey === 'quotes-grid') {
            section.innerHTML = `
                <div class="container">
                    <div class="section-header text-center">
                        <span class="section-badge badge-blue">Community Voices</span>
                        <h2 class="section-title">What Our Neighbors Say</h2>
                        <p class="section-subtitle">Heartfelt words and testimonials from Montgomery Township families and businesses.</p>
                    </div>
                    <div class="custom-quotes-grid">
                        <div class="custom-quote-card glass-card">
                            <div class="custom-quote-stars">⭐⭐⭐⭐⭐</div>
                            <p class="custom-quote-text">"When a downed tree and power line blocked our street during severe weather, Station 46 arrived in under 5 minutes and secured the area safely. True local heroes!"</p>
                            <div class="custom-quote-author">David M. &mdash; Skillman Resident</div>
                        </div>
                        <div class="custom-quote-card glass-card">
                            <div class="custom-quote-stars">⭐⭐⭐⭐⭐</div>
                            <p class="custom-quote-text">"The level of professionalism and care these volunteer firefighters bring to our township is extraordinary. They give up their personal time 24/7 to keep us protected."</p>
                            <div class="custom-quote-author">Sarah T. &mdash; Montgomery Business Owner</div>
                        </div>
                        <div class="custom-quote-card glass-card">
                            <div class="custom-quote-stars">⭐⭐⭐⭐⭐</div>
                            <p class="custom-quote-text">"Our children look forward to the Santa Run and Open House every year! Station 46 is so much more than an emergency service—they are the heart of our community."</p>
                            <div class="custom-quote-author">The Chen Family &mdash; Belle Mead</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (templateKey === 'alert-box') {
            section.innerHTML = `
                <div class="container">
                    <div class="custom-alert-box">
                        <div class="custom-alert-status-header">
                            <div>
                                <span class="custom-alert-status-pill">🟢 Normal Station Readiness</span>
                                <span style="margin-left: 10px; font-size: 0.82rem; color: #64748b; font-weight: 600;">Live Department Advisory</span>
                            </div>
                            <div style="font-weight: 800; color: #b91c1c; font-size: 0.95rem;">Montgomery Fire District #2</div>
                        </div>
                        <div class="custom-alert-grid">
                            <div class="custom-alert-card-item">
                                <h4>🔥 Open Burning Regulations</h4>
                                <p>Open campfires and leaf burning are subject to NJ Forest Fire Service restrictions. Always consult township code before burning.</p>
                            </div>
                            <div class="custom-alert-card-item">
                                <h4>⛈️ Severe Storm Standby</h4>
                                <p>Crews and emergency generators are ready for rapid rollout during high wind and regional flooding conditions.</p>
                            </div>
                            <div class="custom-alert-card-item">
                                <h4>🚒 Hydrant Clearance</h4>
                                <p>Please keep a 3-foot clearance perimeter around all neighborhood fire hydrants during snow and lawn maintenance.</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; align-items: center;">
                            <a href="tel:911" class="btn btn-primary" style="background: #dc2626; border-color: #dc2626;">🚨 Call 911 (Emergency)</a>
                            <a href="tel:6094663926" class="btn btn-secondary">Non-Emergency: (609) 466-3926</a>
                        </div>
                    </div>
                </div>
            `;
        } else if (templateKey === 'recruitment-steps') {
            section.innerHTML = `
                <div class="container">
                    <div class="section-header text-center">
                        <span class="section-badge badge-red">Join The Ranks</span>
                        <h2 class="section-title">4 Simple Steps to Become a Firefighter</h2>
                        <p class="section-subtitle">No prior experience required. All professional equipment, gear, and certifications 100% free.</p>
                    </div>
                    <div class="custom-steps-grid">
                        <div class="custom-step-card glass-card">
                            <div class="custom-step-num">01</div>
                            <h3 class="custom-step-title">Connect &amp; Visit</h3>
                            <p class="custom-step-desc">Visit any Monday drill night at 7:30 PM. Tour our trucks, meet the volunteer crew, and ask any questions.</p>
                        </div>
                        <div class="custom-step-card glass-card">
                            <div class="custom-step-num">02</div>
                            <h3 class="custom-step-title">Application &amp; Physical</h3>
                            <p class="custom-step-desc">Submit your membership application and complete a routine physical exam fully paid for by Company #2.</p>
                        </div>
                        <div class="custom-step-card glass-card">
                            <div class="custom-step-num">03</div>
                            <h3 class="custom-step-title">Free Academy Training</h3>
                            <p class="custom-step-desc">Attend state certified Firefighter I training at Somerset County Fire Academy with full station sponsorship.</p>
                        </div>
                        <div class="custom-step-card glass-card">
                            <div class="custom-step-num">04</div>
                            <h3 class="custom-step-title">Ride The Trucks</h3>
                            <p class="custom-step-desc">Receive your personalized turnout gear, pager, and badge. Start responding to emergency alarms with Station 46!</p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 2.5rem;">
                        <a href="membership.html" class="btn btn-primary" style="padding: 12px 28px; font-size: 1rem;">Start Your Application &rarr;</a>
                    </div>
                </div>
            `;
        } else if (templateKey === 'specs-table') {
            section.innerHTML = `
                <div class="container">
                    <div class="section-header text-center">
                        <span class="section-badge badge-gold">Apparatus Overview</span>
                        <h2 class="section-title">Fleet Specifications &amp; Capabilities</h2>
                        <p class="section-subtitle">Detailed engineering specifications of Station 46 emergency apparatus.</p>
                    </div>
                    <div class="custom-specs-table-wrap glass-card">
                        <table class="custom-specs-table">
                            <thead>
                                <tr>
                                    <th>Apparatus Unit</th>
                                    <th>Chassis &amp; Manufacturer</th>
                                    <th>Year</th>
                                    <th>Pumping / Water Capacity</th>
                                    <th>Primary Operational Role</th>
                                </tr>
                            </thead>
                            <tbody class="custom-specs-tbody">
                                <tr class="custom-specs-row">
                                    <td><strong>Truck 46</strong></td>
                                    <td>Seagrave Marauder II 95' Aerialscope</td>
                                    <td>2024</td>
                                    <td>No Pump / No Tank</td>
                                    <td>Elevated Master Stream, Ventilation &amp; Heavy Rescue</td>
                                </tr>
                                <tr class="custom-specs-row">
                                    <td><strong>Engine 46-8</strong></td>
                                    <td>Pierce Enforcer Custom Chassis</td>
                                    <td>2019</td>
                                    <td>2000 GPM / 750 Gallon</td>
                                    <td>Primary Structural Attack, Supply Hose &amp; Foam</td>
                                </tr>
                                <tr class="custom-specs-row">
                                    <td><strong>Engine 46-7</strong></td>
                                    <td>Pierce Enforcer Custom Chassis</td>
                                    <td>2015</td>
                                    <td>2000 GPM / 750 Gallon</td>
                                    <td>Secondary Structural Attack &amp; Water Supply</td>
                                </tr>
                                <tr class="custom-specs-row">
                                    <td><strong>Rescue 46</strong></td>
                                    <td>SVI Heavy Rescue Custom Walk-In</td>
                                    <td>Upcoming</td>
                                    <td>Specialized Rescue Body</td>
                                    <td>Vehicle Extrication, Ropes, Watercraft &amp; Technical Rescue</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (templateKey === 'contact-grid') {
            section.innerHTML = `
                <div class="container">
                    <div class="section-header text-center">
                        <span class="section-badge badge-blue">Connect With Us</span>
                        <h2 class="section-title">Station Directory &amp; Contact Information</h2>
                        <p class="section-subtitle">Reach Montgomery Township Volunteer Fire Company #2 anytime.</p>
                    </div>
                    <div class="custom-contact-grid">
                        <div class="custom-contact-card glass-card">
                            <div class="custom-contact-icon">🚨</div>
                            <h3>Emergency Dispatch</h3>
                            <div class="custom-contact-highlight">Dial 911</div>
                            <p>For active fire, smoke, medical emergency, or vehicle crash, dial 911 immediately for Somerset County dispatch.</p>
                            <a href="tel:911" class="btn btn-primary" style="background: #dc2626; border-color: #dc2626;">Call 911 Now</a>
                        </div>
                        <div class="custom-contact-card glass-card">
                            <div class="custom-contact-icon">🏢</div>
                            <h3>Headquarters Office</h3>
                            <div class="custom-contact-highlight">(609) 466-3926</div>
                            <p>Non-emergency station business, membership questions, vendor inquiries, and banquet hall rental reservations.</p>
                            <a href="tel:6094663926" class="btn btn-secondary">Call Station 46</a>
                        </div>
                        <div class="custom-contact-card glass-card">
                            <div class="custom-contact-icon">📍</div>
                            <h3>Firehouse Location</h3>
                            <div class="custom-contact-highlight">Skillman, NJ</div>
                            <p>529 Route 518, Skillman, NJ 08558. Located in Blawenburg near Great Road intersection.</p>
                            <a href="https://maps.google.com/?q=529+Route+518+Skillman+NJ+08558" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">Get Directions &rarr;</a>
                        </div>
                    </div>
                </div>
            `;
        } else if (templateKey === 'donate-callout') {
            section.innerHTML = `
                <div class="container">
                    <div class="section-header text-center">
                        <span class="section-badge badge-gold">Support Your Firefighters</span>
                        <h2 class="section-title">Help Fund Life-Saving Gear &amp; Equipment</h2>
                        <p class="section-subtitle">Your tax-deductible contribution directly protects Montgomery Township volunteer firefighters.</p>
                    </div>
                    <div class="custom-donate-tiers-grid">
                        <div class="custom-donate-tier-card glass-card">
                            <div class="custom-donate-amount">$50</div>
                            <div class="custom-donate-title">Safety Gloves &amp; Hoods</div>
                            <p class="custom-donate-desc">Provides particulate-blocking protective hood and thermal structural firefighting gloves for one volunteer.</p>
                        </div>
                        <div class="custom-donate-tier-card glass-card">
                            <div class="custom-donate-amount">$100</div>
                            <div class="custom-donate-title">SCBA Mask Maintenance</div>
                            <p class="custom-donate-desc">Supports annual fit-testing, voice amplifier modules, and safety regulator maintenance for breathing apparatus.</p>
                        </div>
                        <div class="custom-donate-tier-card glass-card">
                            <div class="custom-donate-amount">$250</div>
                            <div class="custom-donate-title">Rescue Tool Upkeep</div>
                            <p class="custom-donate-desc">Maintains high-pressure hydraulic vehicle extrication cutters, spreaders, and stabilization struts.</p>
                        </div>
                        <div class="custom-donate-tier-card glass-card">
                            <div class="custom-donate-amount">Custom</div>
                            <div class="custom-donate-title">Community Fund Drive</div>
                            <p class="custom-donate-desc">Every donation large or small equips our volunteers with modern protective gear and training resources.</p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 2rem; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                        <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 12px 28px; font-size: 1rem;">Donate Online Now &rarr;</a>
                        <a href="about.html" class="btn btn-secondary" style="padding: 12px 24px;">Mail-in Contribution Info</a>
                    </div>
                </div>
            `;
        }

        if (targetSection && targetSection.parentNode === main) {
            targetSection.after(section);
        } else {
            main.appendChild(section);
        }

        setupSectionControls(section);
        ensureSectionInsertDividers();
        setupUniversalImageEditors();
        initCustomFaqAccordions(section);
        initLiveEditor();
        saveMainHtmlState();

        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showAdminToast('Section added! Click any text or photo to edit.');
    }

    function openCreatePageModal() {
        let overlay = document.getElementById('station-page-creator-modal');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'station-page-creator-modal';
            overlay.className = 'station-builder-modal-overlay';
            overlay.innerHTML = `
                <div class="station-builder-modal-card" style="max-width: 680px;">
                    <div class="station-builder-modal-header">
                        <div>
                            <h3 class="station-builder-modal-title">📄 Create New Page</h3>
                            <p class="station-builder-modal-subtitle">Generate a new civic page with matching header, navigation, and footer.</p>
                        </div>
                        <button type="button" class="station-builder-modal-close" aria-label="Close modal">&times;</button>
                    </div>
                    <div class="station-builder-modal-body">
                        <form id="station-page-creator-form">
                            <div class="page-creator-form-group">
                                <label class="page-creator-label" for="new-page-title">Page Title *</label>
                                <input type="text" id="new-page-title" class="page-creator-input" placeholder="e.g. Hall Rental, Auxiliary, Community Outreach" required>
                            </div>
                            <div class="page-creator-form-group">
                                <label class="page-creator-label" for="new-page-slug">Filename / URL Slug *</label>
                                <input type="text" id="new-page-slug" class="page-creator-input" placeholder="e.g. hall-rental.html" required>
                                <div class="page-creator-hint">Must end in .html (e.g. hall-rental.html). Auto-suggested as you type the title.</div>
                            </div>
                            <div class="page-creator-form-group">
                                <label class="page-creator-label" for="new-page-subtitle">Subtitle / Tagline</label>
                                <input type="text" id="new-page-subtitle" class="page-creator-input" placeholder="e.g. Banquet facilities, reservations, and community meeting spaces">
                            </div>
                            <div class="page-creator-form-group">
                                <label class="page-creator-label">Starter Layout Template</label>
                                <div class="page-creator-templates">
                                    <div class="page-creator-template-option selected" data-template="standard">
                                        <div class="page-creator-template-option-icon">📄</div>
                                        <div class="page-creator-template-option-title">Standard Content</div>
                                        <div class="page-creator-hint" style="font-size: 0.72rem;">Hero + Spotlight + Cards</div>
                                    </div>
                                    <div class="page-creator-template-option" data-template="directory">
                                        <div class="page-creator-template-option-icon">🗂️</div>
                                        <div class="page-creator-template-option-title">Directory / Cards</div>
                                        <div class="page-creator-hint" style="font-size: 0.72rem;">Hero + Cards + Stats</div>
                                    </div>
                                    <div class="page-creator-template-option" data-template="guide">
                                        <div class="page-creator-template-option-icon">❓</div>
                                        <div class="page-creator-template-option-title">Guide &amp; FAQ</div>
                                        <div class="page-creator-hint" style="font-size: 0.72rem;">Hero + Notice + FAQ</div>
                                    </div>
                                    <div class="page-creator-template-option" data-template="blank">
                                        <div class="page-creator-template-option-icon">📑</div>
                                        <div class="page-creator-template-option-title">Blank Canvas</div>
                                        <div class="page-creator-hint" style="font-size: 0.72rem;">Hero + Add Sections</div>
                                    </div>
                                </div>
                                <input type="hidden" id="new-page-template-type" value="standard">
                            </div>
                            <label class="page-creator-checkbox-wrap">
                                <input type="checkbox" id="new-page-add-to-nav" checked>
                                <span>Add this page to the main navigation menu</span>
                            </label>
                        </form>
                    </div>
                    <div class="station-builder-modal-footer">
                        <button type="button" class="btn btn-secondary station-builder-modal-close-btn" style="padding: 10px 18px; border-radius: 6px;">Cancel</button>
                        <button type="submit" form="station-page-creator-form" id="create-page-submit-btn" class="btn btn-primary" style="padding: 10px 22px; border-radius: 6px; font-weight: 700;">🚀 Create Page</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const titleInput = overlay.querySelector('#new-page-title');
            const slugInput = overlay.querySelector('#new-page-slug');
            let userHasEditedSlug = false;

            titleInput.addEventListener('input', () => {
                if (!userHasEditedSlug) {
                    const slugified = titleInput.value.trim().toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    slugInput.value = slugified ? slugified + '.html' : '';
                }
            });

            slugInput.addEventListener('input', () => {
                userHasEditedSlug = true;
            });

            const templateOptions = overlay.querySelectorAll('.page-creator-template-option');
            const templateInput = overlay.querySelector('#new-page-template-type');
            templateOptions.forEach(opt => {
                opt.addEventListener('click', () => {
                    templateOptions.forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                    templateInput.value = opt.dataset.template;
                });
            });

            overlay.querySelectorAll('.station-builder-modal-close, .station-builder-modal-close-btn').forEach(btn => {
                btn.addEventListener('click', () => overlay.classList.remove('active'));
            });
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('active');
            });

            const form = overlay.querySelector('#station-page-creator-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = overlay.querySelector('#create-page-submit-btn');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '⏳ Creating...';
                submitBtn.disabled = true;

                const title = titleInput.value.trim();
                let slug = slugInput.value.trim().toLowerCase();
                if (!slug.endsWith('.html')) slug += '.html';
                const subtitle = overlay.querySelector('#new-page-subtitle').value.trim() || 'Montgomery Township Volunteer Fire Company #2';
                const templateType = templateInput.value;
                const addToNav = overlay.querySelector('#new-page-add-to-nav').checked;

                try {
                    const fullHtml = generateNewCivicPageHtml({ title, slug, subtitle, templateType, addToNav });

                    // Register in custom pages
                    const customPages = JSON.parse(localStorage.getItem('station46_custom_pages') || '[]');
                    if (!customPages.find(p => p.slug === slug)) {
                        customPages.push({ slug, title, subtitle, templateType, created: new Date().toISOString() });
                        localStorage.setItem('station46_custom_pages', JSON.stringify(customPages));
                    }

                    // Register in custom navigation links
                    if (addToNav) {
                        const customLinks = JSON.parse(localStorage.getItem('station46_custom_nav_links') || '[]');
                        if (!customLinks.find(l => l.slug === slug)) {
                            customLinks.push({ slug, title });
                            localStorage.setItem('station46_custom_nav_links', JSON.stringify(customLinks));
                            renderCustomNavLinks();
                        }
                    }

                    // Sync to GitHub via Cloudflare Pages proxy
                    await syncToGitHub(slug, fullHtml, `Admin: Create new page ${slug}`);

                    showAdminToast(`🎉 Page ${slug} created successfully! Opening...`);
                    overlay.classList.remove('active');

                    setTimeout(() => {
                        window.location.href = slug;
                    }, 800);
                } catch (err) {
                    console.error('[Station 46] Error creating page:', err);
                    showAdminToast(`❌ Error creating page: ${err.message || err}`, true);
                } finally {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
        }

        overlay.classList.add('active');
    }

    function generateNewCivicPageHtml(options) {
        const { title, slug, subtitle, templateType, addToNav } = options;
        const customLinks = JSON.parse(localStorage.getItem('station46_custom_nav_links') || '[]');
        if (addToNav && !customLinks.find(l => l.slug === slug)) {
            customLinks.push({ slug, title });
        }

        let extraNavHtml = '';
        customLinks.forEach(l => {
            const isActive = (l.slug === slug) ? ' active' : '';
            extraNavHtml += `\n                <a href="${escapeHtml(l.slug)}" class="nav-link${isActive}">${escapeHtml(l.title)}</a>`;
        });

        let mainContentHtml = '';
        if (templateType === 'standard') {
            mainContentHtml = `
        <section class="section custom-section custom-section-spotlight" id="overview">
            <div class="container">
                <div class="custom-spotlight-wrap">
                    <div class="custom-spotlight-media">
                        <img src="drill-1.jpg" alt="${escapeHtml(title)}" class="custom-spotlight-img">
                        <div class="custom-spotlight-caption">Station 46 - Montgomery, NJ</div>
                    </div>
                    <div class="custom-spotlight-body">
                        <span class="section-badge badge-red">Overview</span>
                        <h2 class="section-title">${escapeHtml(title)} Information</h2>
                        <p class="custom-lead-text">${escapeHtml(subtitle || 'Montgomery Township Volunteer Fire Company #2.')}</p>
                        <ul class="custom-check-list">
                            <li><span>✓</span> Dedicated community service and volunteer excellence</li>
                            <li><span>✓</span> Direct coordination with Township emergency services</li>
                            <li><span>✓</span> Professional facilities and certified emergency personnel</li>
                        </ul>
                        <div class="custom-action-row">
                            <a href="#details" class="btn btn-primary">Learn More</a>
                            <a href="about.html" class="btn btn-secondary">Contact Station</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section custom-section custom-section-cards" id="details">
            <div class="container">
                <div class="section-header text-center">
                    <span class="section-badge badge-blue">Highlights</span>
                    <h2 class="section-title">Key Information &amp; Services</h2>
                    <p class="section-subtitle">Explore details and policies for ${escapeHtml(title)}.</p>
                </div>
                <div class="custom-cards-grid">
                    <div class="custom-feature-card glass-card">
                        <div class="custom-card-icon">📌</div>
                        <h3 class="custom-card-title">General Guidelines</h3>
                        <p class="custom-card-desc">Detailed guidelines and standards maintained by Station 46.</p>
                        <a href="#" class="custom-card-link">View Guidelines &rarr;</a>
                    </div>
                    <div class="custom-feature-card glass-card">
                        <div class="custom-card-icon">📋</div>
                        <h3 class="custom-card-title">Requirements &amp; Forms</h3>
                        <p class="custom-card-desc">Downloadable forms, requirements, and registration details.</p>
                        <a href="#" class="custom-card-link">Download Forms &rarr;</a>
                    </div>
                    <div class="custom-feature-card glass-card">
                        <div class="custom-card-icon">📞</div>
                        <h3 class="custom-card-title">Direct Inquiries</h3>
                        <p class="custom-card-desc">Have questions? Contact our company officers directly.</p>
                        <a href="about.html" class="custom-card-link">Contact Us &rarr;</a>
                    </div>
                </div>
            </div>
        </section>

        <section class="section custom-section custom-section-callout" id="action-banner">
            <div class="container">
                <div class="custom-callout-banner">
                    <div class="custom-callout-icon">🚒</div>
                    <div class="custom-callout-content">
                        <span class="custom-callout-badge">Get Involved</span>
                        <h3 class="custom-callout-title">Support Montgomery Volunteer Fire Company #2</h3>
                        <p class="custom-callout-text">We are always seeking dedicated volunteers and community supporters to join our mission.</p>
                    </div>
                    <div class="custom-callout-action">
                        <a href="membership.html" class="btn btn-primary">Join Today</a>
                    </div>
                </div>
            </div>
        </section>`;
        } else if (templateType === 'directory') {
            mainContentHtml = `
        <section class="section custom-section custom-section-cards" id="directory">
            <div class="container">
                <div class="section-header text-center">
                    <span class="section-badge badge-blue">Directory</span>
                    <h2 class="section-title">${escapeHtml(title)} Directory</h2>
                    <p class="section-subtitle">${escapeHtml(subtitle)}</p>
                </div>
                <div class="custom-cards-grid">
                    <div class="custom-feature-card glass-card">
                        <div class="custom-card-icon">🏢</div>
                        <h3 class="custom-card-title">Facility &amp; Operations</h3>
                        <p class="custom-card-desc">Primary facilities and apparatus bay operations at Station 46.</p>
                        <a href="#" class="custom-card-link">Read More &rarr;</a>
                    </div>
                    <div class="custom-feature-card glass-card">
                        <div class="custom-card-icon">🤝</div>
                        <h3 class="custom-card-title">Community Programs</h3>
                        <p class="custom-card-desc">Fire prevention education and community outreach programs.</p>
                        <a href="#" class="custom-card-link">Read More &rarr;</a>
                    </div>
                    <div class="custom-feature-card glass-card">
                        <div class="custom-card-icon">📄</div>
                        <h3 class="custom-card-title">Documents &amp; Requests</h3>
                        <p class="custom-card-desc">Official documents and request forms for community residents.</p>
                        <a href="#" class="custom-card-link">Read More &rarr;</a>
                    </div>
                </div>
            </div>
        </section>

        <section class="section custom-section custom-section-stats" id="stats">
            <div class="container">
                <div class="section-header text-center">
                    <span class="section-badge badge-gold">By The Numbers</span>
                    <h2 class="section-title">Station 46 Operational Metrics</h2>
                    <p class="section-subtitle">Dedicated 24/7 service to Montgomery Township.</p>
                </div>
                <div class="custom-stats-grid">
                    <div class="custom-stat-box glass-card">
                        <div class="custom-stat-num">500+</div>
                        <div class="custom-stat-label">Annual Calls</div>
                        <p class="custom-stat-sub">Emergency response calls per year.</p>
                    </div>
                    <div class="custom-stat-box glass-card">
                        <div class="custom-stat-num">45+</div>
                        <div class="custom-stat-label">Volunteers</div>
                        <p class="custom-stat-sub">Active members on roster.</p>
                    </div>
                    <div class="custom-stat-box glass-card">
                        <div class="custom-stat-num">1946</div>
                        <div class="custom-stat-label">Founded</div>
                        <p class="custom-stat-sub">Decades of dedicated service.</p>
                    </div>
                    <div class="custom-stat-box glass-card">
                        <div class="custom-stat-num">100%</div>
                        <div class="custom-stat-label">Volunteer</div>
                        <p class="custom-stat-sub">Neighbors protecting neighbors.</p>
                    </div>
                </div>
            </div>
        </section>`;
        } else if (templateType === 'guide') {
            mainContentHtml = `
        <section class="section custom-section custom-section-notice" id="guide">
            <div class="container custom-container-narrow">
                <div class="section-header">
                    <span class="section-badge badge-gold">Official Guide</span>
                    <h2 class="section-title">${escapeHtml(title)}</h2>
                    <p class="section-subtitle">${escapeHtml(subtitle)}</p>
                </div>
                <div class="custom-rich-content glass-card">
                    <p class="custom-lead-text">Welcome to the official information page for ${escapeHtml(title)} at Montgomery Township Volunteer Fire Company #2.</p>
                    <p>Station 46 provides this resource to assist township residents, members, and partner agencies with important guidelines, policies, and procedural information.</p>
                    <div class="custom-highlight-box">
                        <h4>📌 Important Note</h4>
                        <p>All policies and procedures are reviewed annually by the Company Executive Committee and Board of Fire Commissioners.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section custom-section custom-section-faq" id="faq">
            <div class="container custom-container-narrow">
                <div class="section-header text-center">
                    <span class="section-badge badge-blue">Frequently Asked Questions</span>
                    <h2 class="section-title">Common Questions &amp; Answers</h2>
                    <p class="section-subtitle">Find fast answers regarding ${escapeHtml(title)}.</p>
                </div>
                <div class="custom-faq-list">
                    <div class="custom-faq-item glass-card open">
                        <button type="button" class="custom-faq-header">
                            <span class="custom-faq-q">What are the general rules and requirements?</span>
                            <span class="custom-faq-chevron">▾</span>
                        </button>
                        <div class="custom-faq-answer">
                            <p>All participants and applicants must comply with Station 46 by-laws and safety protocols.</p>
                        </div>
                    </div>
                    <div class="custom-faq-item glass-card">
                        <button type="button" class="custom-faq-header">
                            <span class="custom-faq-q">How do I submit an application or inquiry?</span>
                            <span class="custom-faq-chevron">▾</span>
                        </button>
                        <div class="custom-faq-answer">
                            <p>Contact our station headquarters directly at (609) 466-3926 or speak with an officer during Wednesday drill nights.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>`;
        } else {
            mainContentHtml = `
        <section class="section custom-section" id="welcome-section">
            <div class="container text-center">
                <div class="section-header">
                    <span class="section-badge badge-red">New Page</span>
                    <h2 class="section-title">${escapeHtml(title)}</h2>
                    <p class="section-subtitle">${escapeHtml(subtitle || 'Click Edit Mode in the bottom admin bar to add sections and content.')}</p>
                </div>
            </div>
        </section>`;
        }

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <title>${escapeHtml(title)} | Montgomery Township Volunteer Fire Company #2</title>
    <meta name="description" content="${escapeHtml(subtitle || title + ' - MTVFC #2 Station 46, Skillman, NJ.')}">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="512x512" href="favicon.png">
    <link rel="apple-touch-icon" href="apple-touch-icon.png">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <script>
        (function() {
            try {
                var t = localStorage.getItem('station46_theme') || 
                        (document.cookie.match(/(?:^|;)\\s*station46_theme=([^;]+)/) || [])[1] || 
                        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}
        })();
    </script>
    <link rel="stylesheet" href="styles.css?v=106">
</head>
<body>
    <!-- Civic Top Utility Bar -->
    <div class="top-bar">
        <div class="top-bar-container">
            <div class="top-bar-left">
                <span class="top-bar-badge">🚨 EMERGENCY: DIAL 911</span>
                <span class="top-bar-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Station: (609) 466-3926
                </span>
                <span class="top-bar-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    529 Route 518, Skillman, NJ 08558
                </span>
            </div>
            <div class="top-bar-right">
                <a href="https://bofc46.com" target="_blank" rel="noopener noreferrer" class="top-bar-item top-bar-link" title="Montgomery Township Fire District #2 Board of Fire Commissioners">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    <span>Fire District (BOFC)</span>
                </a>
                <a href="https://www.facebook.com/mtvfc2" target="_blank" rel="noopener noreferrer" class="top-bar-social" aria-label="Facebook">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="https://www.instagram.com/MTVFC2" target="_blank" rel="noopener noreferrer" class="top-bar-social" aria-label="Instagram">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </a>
            </div>
        </div>
    </div>

    <!-- Navigation Bar -->
    <nav class="navbar">
        <div class="nav-container">
            <a href="index.html" class="nav-logo">
                <img src="logo.png" alt="MTVFC #2 Logo" class="nav-badge-img">
                <div class="logo-text">
                    <span class="mtvfc">Montgomery Township Volunteer Fire Company #2</span>
                    <span class="subtitle">Montgomery Township, Somerset County, NJ</span>
                </div>
            </a>
            
            <div class="nav-links">
                <a href="index.html" class="nav-link">Home</a>
                <a href="membership.html" class="nav-link">Membership</a>
                <div class="nav-dropdown">
                    <a href="about.html" class="nav-link nav-dropdown-toggle">About</a>
                    <div class="nav-dropdown-menu">
                        <a href="about.html" class="nav-dropdown-item">About Us</a>
                        <a href="history.html" class="nav-dropdown-item">History</a>
                    </div>
                </div>
                <a href="apparatus.html" class="nav-link">Apparatus</a>
                <a href="news.html" class="nav-link">News &amp; Calls</a>${extraNavHtml}
                <a href="index.html#donate" class="nav-link nav-btn-donate">Donate</a>
            </div>
            
            <button class="mobile-menu-btn" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </nav>

    <!-- Page Hero Banner -->
    <header class="hero small-hero" style="background-image: linear-gradient(rgba(10, 11, 13, 0.25), rgba(10, 11, 13, 0.55)), url('engine46-7.jpg'); min-height: 40vh; background-position: center; background-size: cover; text-shadow: 0 3px 14px rgba(0,0,0,0.9);">
        <div class="container text-center">
            <h1 class="hero-title fade-in">${escapeHtml(title)}</h1>
            <p class="hero-subtitle fade-in delay-1" style="color: var(--gold); letter-spacing: 1.5px;">${escapeHtml(subtitle || 'Montgomery Township Volunteer Fire Company #2')}</p>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="main-content">
${mainContentHtml}
    </main>

    <!-- Civic Footer -->
    <footer>
        <div class="footer-container">
            <div class="footer-brand">
                <img src="logo.png" alt="MTVFC #2 Logo" class="footer-badge-img">
                <span>Montgomery Township Volunteer Fire Company #2</span>
            </div>
            <div class="footer-info">
                <p><strong>MTVFC #2</strong> (Station 46) | 529 County Route 518, Skillman, NJ 08558</p>
                <p>Emergency: <strong>911</strong> | Non-Emergency: (609) 466-3926</p>
                <p><a href="https://bofc46.com" target="_blank" rel="noopener noreferrer" style="color: var(--fire-red); font-weight: 600; text-decoration: underline;">Board of Fire Commissioners (BOFC46.com) &rarr;</a></p>
            </div>
            <div class="footer-social">
                <a href="https://www.facebook.com/mtvfc2" target="_blank" rel="noopener noreferrer" class="footer-social-link facebook" aria-label="Facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    <span>Facebook</span>
                </a>
                <a href="https://www.instagram.com/MTVFC2" target="_blank" rel="noopener noreferrer" class="footer-social-link instagram" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                    <span>Instagram</span>
                </a>
            </div>
            <div class="footer-copy">
                &copy; <span id="year">2026</span> Montgomery Township Volunteer Fire Company #2. All Rights Reserved. | <a href="https://bofc46.com" target="_blank" rel="noopener noreferrer">Fire District Website (BOFC46.com)</a> | <a href="admin.html" class="admin-link">Admin Portal</a>
            </div>
        </div>
    </footer>

    <!-- Light / Dark Mode Toggle Switch -->
    <div id="theme-switch-wrapper" class="theme-switch-wrapper">
        <button type="button" 
                class="theme-switch-btn" 
                id="theme-switch-btn" 
                role="switch" 
                aria-checked="false" 
                aria-label="Toggle light and dark mode" 
                title="Toggle theme">
            <span class="theme-switch-track">
                <span class="theme-track-icon sun-icon" aria-hidden="true">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="4"></circle>
                        <path d="M12 2v2"></path>
                        <path d="M12 20v2"></path>
                        <path d="m4.93 4.93 1.41 1.41"></path>
                        <path d="m17.66 17.66 1.41 1.41"></path>
                        <path d="M2 12h2"></path>
                        <path d="M20 12h2"></path>
                        <path d="m6.34 17.66-1.41 1.41"></path>
                        <path d="m19.07 4.93-1.41 1.41"></path>
                    </svg>
                </span>
                <span class="theme-track-icon moon-icon" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                    </svg>
                </span>
                <span class="theme-switch-thumb">
                    <span class="thumb-icon-sun" aria-hidden="true">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="4"></circle>
                            <path d="M12 2v2"></path>
                            <path d="M12 20v2"></path>
                            <path d="m4.93 4.93 1.41 1.41"></path>
                            <path d="m17.66 17.66 1.41 1.41"></path>
                            <path d="M2 12h2"></path>
                            <path d="M20 12h2"></path>
                            <path d="m6.34 17.66-1.41 1.41"></path>
                            <path d="m19.07 4.93-1.41 1.41"></path>
                        </svg>
                    </span>
                    <span class="thumb-icon-moon" aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0.5">
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                        </svg>
                    </span>
                </span>
            </span>
        </button>
        <div class="theme-switch-tooltip" id="theme-switch-tooltip">Switch to Dark Mode</div>
    </div>

    <script src="script.js?v=106"></script>
</body>
</html>`;
    }

    function renderCustomNavLinks() {
        const navLinksContainer = document.querySelector('.navbar .nav-links');
        if (!navLinksContainer) return;
        const customLinks = JSON.parse(localStorage.getItem('station46_custom_nav_links') || '[]');
        const currentPage = getPageKey();

        customLinks.forEach(link => {
            if (!navLinksContainer.querySelector(`a[href="${link.slug}"]`)) {
                const a = document.createElement('a');
                a.href = link.slug;
                a.className = 'nav-link';
                if (currentPage === link.slug) {
                    a.classList.add('active');
                }
                a.textContent = link.title;
                const donateBtn = navLinksContainer.querySelector('.nav-btn-donate');
                if (donateBtn) {
                    navLinksContainer.insertBefore(a, donateBtn);
                } else {
                    navLinksContainer.appendChild(a);
                }
            }
        });
    }

    function renderAdminPagesManager() {
        const container = document.getElementById('admin-pages-list-container');
        if (!container) return;

        const defaultPages = [
            { slug: 'index.html', title: 'Home / Main Page', type: 'built-in' },
            { slug: 'about.html', title: 'About Us & Station Roster', type: 'built-in' },
            { slug: 'apparatus.html', title: 'Active Apparatus Fleet', type: 'built-in' },
            { slug: 'retired-apparatus.html', title: 'Historic & Retired Fleet', type: 'built-in' },
            { slug: 'news.html', title: 'News, Calls & Community Updates', type: 'built-in' },
            { slug: 'membership.html', title: 'Volunteer Membership & Roles', type: 'built-in' },
            { slug: 'juniors.html', title: 'Junior Firefighter Program', type: 'built-in' },
            { slug: 'santa.html', title: 'Operation Santa Tour', type: 'built-in' }
        ];

        const customPages = JSON.parse(localStorage.getItem('station46_custom_pages') || '[]');
        const allPages = defaultPages.concat(customPages.map(p => ({
            slug: p.slug,
            title: p.title,
            type: 'custom'
        })));

        container.innerHTML = '';
        allPages.forEach(p => {
            const item = document.createElement('div');
            item.className = 'admin-page-item';
            item.innerHTML = `
                <div class="admin-page-info">
                    <span class="admin-page-type-badge ${p.type === 'custom' ? 'admin-page-type-custom' : 'admin-page-type-built-in'}">${p.type}</span>
                    <div>
                        <div class="admin-page-name">${escapeHtml(p.title)}</div>
                        <div class="admin-page-slug">${escapeHtml(p.slug)}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <a href="${escapeHtml(p.slug)}" class="btn btn-admin-action" style="padding: 7px 14px; font-size: 0.82rem; text-decoration: none;">
                        ✏️ Open &amp; Edit Page &rarr;
                    </a>
                    ${p.type === 'custom' ? `
                        <button type="button" class="btn btn-admin-logout admin-delete-page-btn" data-slug="${escapeHtml(p.slug)}" style="padding: 7px 12px; font-size: 0.82rem;" title="Delete this page">
                            🗑️
                        </button>
                    ` : ''}
                </div>
            `;

            if (p.type === 'custom') {
                const delBtn = item.querySelector('.admin-delete-page-btn');
                delBtn.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete custom page "${p.title}" (${p.slug})?`)) {
                        const updatedCustom = customPages.filter(cp => cp.slug !== p.slug);
                        localStorage.setItem('station46_custom_pages', JSON.stringify(updatedCustom));

                        const updatedNav = JSON.parse(localStorage.getItem('station46_custom_nav_links') || '[]').filter(nl => nl.slug !== p.slug);
                        localStorage.setItem('station46_custom_nav_links', JSON.stringify(updatedNav));

                        localStorage.removeItem('station46_main_html_' + p.slug);
                        renderAdminPagesManager();
                        showAdminToast(`Page ${p.slug} removed`);
                    }
                });
            }

            container.appendChild(item);
        });
    }

    // Initialize in-place editing on all editable elements when logged in
    function initLiveEditor() {
        const pageKey = getPageKey();
        const elements = getEditableElements();

        elements.forEach((element) => {
            const storageKey = `edit_v2_${pageKey}_${getElementSelectorPath(element)}`;

            // Remove any legacy static attribute so it never blocks live editing
            element.removeAttribute('data-editor-init');

            if (isAdminLoggedIn) {
                element.setAttribute('contenteditable', editModeActive ? 'true' : 'false');
                
                if (boundEditorElements.has(element)) {
                    return;
                }
                boundEditorElements.add(element);

                // Show font toolbar on focus or click
                element.addEventListener('focus', () => {
                    if (editModeActive) {
                        showFontToolbar(element);
                    }
                });

                element.addEventListener('click', (e) => {
                    if (editModeActive) {
                        showFontToolbar(element);
                    }
                });

                // Save on input (real-time typing)
                element.addEventListener('input', () => {
                    const currentText = element.innerHTML.trim();
                    saveTextEdit(storageKey, currentText);
                    if (element.closest('#roster-container')) {
                        saveRosterState();
                    }
                    if (element.closest('#station-sliders-track')) {
                        saveSlidersState();
                    }
                    if (element.closest('#active-apparatus-list')) {
                        saveApparatusState('active');
                    } else if (element.closest('#retired-apparatus-list')) {
                        saveApparatusState('retired');
                    }
                    if (element.closest('main')) {
                        saveMainHtmlState();
                    }
                    if (currentFontTarget === element) {
                        updateFontToolbarPosition(element);
                    }
                });

                // Save on blur (clicking outside)
                element.addEventListener('blur', () => {
                    let currentText = element.innerHTML.trim();
                    if (element.classList.contains('roster-avatar')) {
                        currentText = element.textContent.trim().toUpperCase();
                        if (element.textContent !== currentText) {
                            element.textContent = currentText;
                        }
                    }
                    if (element.classList.contains('roster-name')) {
                        const card = element.closest('.roster-card');
                        if (card) {
                            card.setAttribute('data-name', element.textContent.trim());
                        }
                    }
                    if (element.classList.contains('rank-badge')) {
                        const card = element.closest('.roster-card');
                        if (card) {
                            card.setAttribute('data-role', element.textContent.trim());
                        }
                    }
                    saveTextEdit(storageKey, currentText);
                    if (element.closest('#roster-container')) {
                        saveRosterState();
                    }
                    if (element.closest('#station-sliders-track')) {
                        saveSlidersState();
                    }
                    if (element.closest('#active-apparatus-list')) {
                        saveApparatusState('active');
                    } else if (element.closest('#retired-apparatus-list')) {
                        saveApparatusState('retired');
                    }
                    if (element.closest('main')) {
                        saveMainHtmlState();
                    }
                });

                // Prevent link navigation or button action during active edit mode so admin can edit text
                if (element.tagName === 'A' || element.closest('a') || element.tagName === 'BUTTON' || element.closest('button')) {
                    element.addEventListener('click', (e) => {
                        if (editModeActive && !element.closest('#admin-floating-bar')) {
                            e.preventDefault();
                        }
                    });
                }
                
                // Handle Enter key for single-line elements to blur instead of inserting line breaks
                if (element.tagName.match(/^H[1-6]$/) || element.tagName === 'BUTTON' || element.classList.contains('btn') || element.classList.contains('roster-avatar') || element.classList.contains('rank-badge') || element.classList.contains('tag-new')) {
                    element.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            element.blur();
                        }
                    });
                }
            }
        });
    }

    // ==========================================================================
    // Station Sliders (Call Volume & Statistics) Engine & Admin Management
    // ==========================================================================
    let currentSlideIndex = 0;

    function getCleanSlidersHtml() {
        const track = document.getElementById('station-sliders-track');
        if (!track) return null;
        const clone = track.cloneNode(true);

        // Remove active slide classes from all slides so on reload it starts cleanly
        clone.querySelectorAll('.station-slider-card').forEach((card, idx) => {
            if (idx === 0) {
                card.classList.add('active-slide');
            } else {
                card.classList.remove('active-slide');
            }
        });

        // Remove contenteditable attributes and runtime admin controls
        clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        clone.querySelectorAll('[data-editor-init]').forEach(el => el.removeAttribute('data-editor-init'));
        clone.querySelectorAll('.station-image-change-btn').forEach(el => el.remove());
        clone.querySelectorAll('.slider-card-admin-controls, .stat-row-remove-btn').forEach(el => {
            el.style.display = 'none';
        });

        return clone.innerHTML;
    }

    function saveSlidersState() {
        const cleanHtml = getCleanSlidersHtml();
        if (cleanHtml !== null) {
            localStorage.setItem('station46_sliders_html', cleanHtml);
        }
    }

    function updateSliderCarouselUI() {
        const track = document.getElementById('station-sliders-track');
        const dotsContainer = document.getElementById('station-slider-dots');
        const prevBtn = document.getElementById('slider-prev-btn');
        const nextBtn = document.getElementById('slider-next-btn');
        if (!track) return;

        const slides = Array.from(track.querySelectorAll('.station-slider-card'));
        const total = slides.length;

        if (total === 0) {
            if (dotsContainer) dotsContainer.innerHTML = '';
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            return;
        }

        // Clamp index
        if (currentSlideIndex >= total) currentSlideIndex = total - 1;
        if (currentSlideIndex < 0) currentSlideIndex = 0;

        // Toggle slides
        slides.forEach((slide, idx) => {
            if (idx === currentSlideIndex) {
                slide.classList.add('active-slide');
            } else {
                slide.classList.remove('active-slide');
            }
        });

        // Navigation buttons
        if (prevBtn && nextBtn) {
            if (total <= 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            }
        }

        // Render dots
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            if (total > 1) {
                slides.forEach((slide, idx) => {
                    const dot = document.createElement('button');
                    dot.type = 'button';
                    dot.className = `slider-dot ${idx === currentSlideIndex ? 'active' : ''}`;
                    const title = slide.getAttribute('data-title') || slide.querySelector('.slider-card-title')?.textContent.trim() || `Slide ${idx + 1}`;
                    dot.title = title;
                    dot.setAttribute('aria-label', `Go to ${title}`);
                    dot.addEventListener('click', () => {
                        currentSlideIndex = idx;
                        updateSliderCarouselUI();
                    });
                    dotsContainer.appendChild(dot);
                });
            }
        }
    }

    function attachSliderCardControls(card) {
        // Wire up remove button on each stat row
        card.querySelectorAll('.slider-stat-row').forEach(row => {
            attachRowRemoveButton(row);
        });

        // Wire up "Add Item" button
        const addItemBtn = card.querySelector('.btn-add-item-ctrl');
        if (addItemBtn && !addItemBtn.dataset.listenerBound) {
            addItemBtn.dataset.listenerBound = 'true';
            addItemBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openAddItemToSliderModal(card);
            });
        }

        // Wire up "Delete Slider" button
        const delSliderBtn = card.querySelector('.btn-del-slider-ctrl');
        if (delSliderBtn && !delSliderBtn.dataset.listenerBound) {
            delSliderBtn.dataset.listenerBound = 'true';
            delSliderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const title = card.querySelector('.slider-card-title')?.textContent.trim() || 'this slider';
                if (confirm(`Are you sure you want to delete "${title}"?`)) {
                    card.remove();
                    currentSlideIndex = 0;
                    updateSliderCarouselUI();
                    saveSlidersState();
                    showAdminToast(`🗑️ Deleted slider "${title}".`);
                }
            });
        }
    }

    function attachRowRemoveButton(row) {
        let removeBtn = row.querySelector('.stat-row-remove-btn');
        if (!removeBtn) {
            removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'stat-row-remove-btn';
            removeBtn.title = 'Remove this statistic item';
            removeBtn.innerHTML = '✕';
            row.appendChild(removeBtn);
        }

        if (isAdminLoggedIn && editModeActive) {
            removeBtn.style.display = 'flex';
        } else {
            removeBtn.style.display = 'none';
        }

        if (!removeBtn.dataset.bound) {
            removeBtn.dataset.bound = 'true';
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const label = row.querySelector('.stat-year-badge')?.textContent.trim() || row.querySelector('.stat-row-label')?.textContent.trim() || 'item';
                if (confirm(`Remove "${label}" from this slider?`)) {
                    row.remove();
                    saveSlidersState();
                    showAdminToast(`Removed "${label}".`);
                }
            });
        }
    }

    function openAddItemToSliderModal(card) {
        let modalOverlay = document.getElementById('station-slider-add-item-modal');
        if (!modalOverlay) {
            modalOverlay = document.createElement('div');
            modalOverlay.id = 'station-slider-add-item-modal';
            modalOverlay.className = 'roster-modal-overlay station-slider-modal-overlay';
            modalOverlay.innerHTML = `
                <div class="roster-modal-card" style="max-width: 440px;">
                    <div class="roster-modal-header">
                        <h3 class="roster-modal-title">Add Statistic Item</h3>
                        <p class="roster-modal-subtitle" id="slider-add-item-target-label">Add to slider</p>
                    </div>
                    <form class="roster-modal-form" id="slider-add-item-form">
                        <div class="form-group">
                            <label for="item-year-or-tag">Year or Prefix Badge (e.g. 2026, Q1, MUTUAL AID)</label>
                            <input type="text" id="item-year-or-tag" placeholder="e.g. 2026" required autocomplete="off">
                        </div>
                        <div class="form-group">
                            <label for="item-label-text">Metric Label (e.g. Call Volume, Drills Held, Training Hours)</label>
                            <input type="text" id="item-label-text" placeholder="e.g. Call Volume" value="Call Volume" required autocomplete="off">
                        </div>
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.75rem;">
                            <div class="form-group">
                                <label for="item-value-text">Number / Value (e.g. 412)</label>
                                <input type="text" id="item-value-text" placeholder="e.g. 412" required autocomplete="off">
                            </div>
                            <div class="form-group">
                                <label for="item-unit-text">Unit (e.g. calls)</label>
                                <input type="text" id="item-unit-text" placeholder="e.g. calls" value="calls" autocomplete="off">
                            </div>
                        </div>
                        <div class="roster-modal-actions">
                            <button type="button" class="btn btn-roster-cancel" id="slider-add-item-cancel">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Item</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modalOverlay);

            modalOverlay.querySelector('#slider-add-item-cancel').addEventListener('click', () => {
                modalOverlay.classList.remove('active');
            });
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) modalOverlay.classList.remove('active');
            });
        }

        const sliderTitle = card.querySelector('.slider-card-title')?.textContent.trim() || 'Selected Slider';
        document.getElementById('slider-add-item-target-label').textContent = `Adding to: ${sliderTitle}`;

        const form = document.getElementById('slider-add-item-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const yearTag = document.getElementById('item-year-or-tag').value.trim();
            const labelText = document.getElementById('item-label-text').value.trim() || 'Call Volume';
            const valueText = document.getElementById('item-value-text').value.trim();
            const unitText = document.getElementById('item-unit-text').value.trim();

            if (!yearTag || !valueText) return;

            const itemsList = card.querySelector('.slider-items-list');
            if (itemsList) {
                const row = document.createElement('div');
                row.className = 'slider-stat-row';
                row.innerHTML = `
                    <div class="stat-row-left">
                        <span class="stat-year-badge">${escapeHtml(yearTag)}</span>
                        <span class="stat-row-label">${escapeHtml(labelText)}</span>
                    </div>
                    <div class="stat-row-dots"></div>
                    <div class="stat-row-right">
                        <span class="stat-row-value">${escapeHtml(valueText)}</span>
                        ${unitText ? `<span class="stat-unit">${escapeHtml(unitText)}</span>` : ''}
                    </div>
                    <button type="button" class="stat-row-remove-btn" title="Remove item" style="display: flex;">✕</button>
                `;
                // Insert at the top of the list
                itemsList.insertBefore(row, itemsList.firstChild);
                attachRowRemoveButton(row);
                initLiveEditor();
                saveSlidersState();
                showAdminToast(`✅ Added ${yearTag}: ${valueText} ${unitText} to ${sliderTitle}!`);
            }

            modalOverlay.classList.remove('active');
            form.reset();
        };

        modalOverlay.classList.add('active');
        document.getElementById('item-year-or-tag').focus();
    }

    function openCreateSliderModal() {
        let modalOverlay = document.getElementById('station-slider-create-deck-modal');
        if (!modalOverlay) {
            modalOverlay = document.createElement('div');
            modalOverlay.id = 'station-slider-create-deck-modal';
            modalOverlay.className = 'roster-modal-overlay station-slider-modal-overlay';
            modalOverlay.innerHTML = `
                <div class="roster-modal-card" style="max-width: 480px;">
                    <div class="roster-modal-header">
                        <h3 class="roster-modal-title">Create New Statistics Slider</h3>
                        <p class="roster-modal-subtitle">Add a new slider deck to display custom metrics (e.g., Mutual Aid Responses, Training Hours, Apparatus Runs)</p>
                    </div>
                    <form class="roster-modal-form" id="slider-create-deck-form">
                        <div class="form-group">
                            <label for="new-slider-badge">Category Badge</label>
                            <input type="text" id="new-slider-badge" placeholder="e.g. OPERATIONS, DISPATCH METRICS, TRAINING" value="STATION METRICS" required autocomplete="off">
                        </div>
                        <div class="form-group">
                            <label for="new-slider-title">Slider Title</label>
                            <input type="text" id="new-slider-title" placeholder="e.g. Mutual Aid Incident Runs" required autocomplete="off">
                        </div>
                        <div class="form-group">
                            <label for="new-slider-desc">Subtitle / Description</label>
                            <input type="text" id="new-slider-desc" placeholder="e.g. Calls assisted in neighboring communities and districts" autocomplete="off">
                        </div>
                        <div class="roster-modal-actions">
                            <button type="button" class="btn btn-roster-cancel" id="slider-create-deck-cancel">Cancel</button>
                            <button type="submit" class="btn btn-primary">Create Slider</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modalOverlay);

            modalOverlay.querySelector('#slider-create-deck-cancel').addEventListener('click', () => {
                modalOverlay.classList.remove('active');
            });
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) modalOverlay.classList.remove('active');
            });
        }

        const form = document.getElementById('slider-create-deck-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const badge = document.getElementById('new-slider-badge').value.trim() || 'STATION METRICS';
            const title = document.getElementById('new-slider-title').value.trim();
            const desc = document.getElementById('new-slider-desc').value.trim() || 'Station performance and operational milestones';

            if (!title) return;

            const track = document.getElementById('station-sliders-track');
            if (track) {
                const sliderId = 'slider-' + Date.now();
                const card = document.createElement('div');
                card.className = 'station-slider-card glass-panel';
                card.setAttribute('data-slider-id', sliderId);
                card.setAttribute('data-title', title);
                card.innerHTML = `
                    <div class="slider-card-header">
                        <div class="slider-card-heading-group">
                            <span class="slider-card-badge">${escapeHtml(badge)}</span>
                            <h4 class="slider-card-title">${escapeHtml(title)}</h4>
                            <p class="slider-card-desc">${escapeHtml(desc)}</p>
                        </div>
                        <div class="slider-card-admin-controls" style="display: ${isAdminLoggedIn && editModeActive ? 'flex' : 'none'};">
                            <button type="button" class="btn-slider-ctrl btn-add-item-ctrl" title="Add another year/item to this slider">+ Add Item</button>
                            <button type="button" class="btn-slider-ctrl btn-del-slider-ctrl" title="Delete this slider">✕ Delete Slider</button>
                        </div>
                    </div>
                    <div class="slider-items-list" id="items-list-${sliderId}">
                        <div class="slider-stat-row">
                            <div class="stat-row-left">
                                <span class="stat-year-badge">2025</span>
                                <span class="stat-row-label">Activity Total</span>
                            </div>
                            <div class="stat-row-dots"></div>
                            <div class="stat-row-right">
                                <span class="stat-row-value">120</span>
                                <span class="stat-unit">runs</span>
                            </div>
                            <button type="button" class="stat-row-remove-btn" title="Remove item" style="display: ${isAdminLoggedIn && editModeActive ? 'flex' : 'none'};">✕</button>
                        </div>
                    </div>
                `;

                track.appendChild(card);
                attachSliderCardControls(card);

                // Switch to the newly created slide
                const slides = Array.from(track.querySelectorAll('.station-slider-card'));
                currentSlideIndex = slides.length - 1;
                updateSliderCarouselUI();

                initLiveEditor();
                saveSlidersState();
                showAdminToast(`✅ Created new slider "${title}"! Click '+ Add Item' to customize it.`);
            }

            modalOverlay.classList.remove('active');
            form.reset();
        };

        modalOverlay.classList.add('active');
        document.getElementById('new-slider-title').focus();
    }

    function initStationSliders() {
        const section = document.getElementById('station-sliders-section');
        const track = document.getElementById('station-sliders-track');
        if (!section || !track) return;

        // Restore pending local edits if any
        const pendingSliders = localStorage.getItem('station46_sliders_html');
        if (pendingSliders && pendingSliders.trim().length > 50) {
            track.innerHTML = pendingSliders;
        }

        // Setup Carousel Navigation buttons
        const prevBtn = document.getElementById('slider-prev-btn');
        const nextBtn = document.getElementById('slider-next-btn');

        if (prevBtn && !prevBtn.dataset.bound) {
            prevBtn.dataset.bound = 'true';
            prevBtn.addEventListener('click', () => {
                const total = track.querySelectorAll('.station-slider-card').length;
                if (total <= 1) return;
                currentSlideIndex = (currentSlideIndex - 1 + total) % total;
                updateSliderCarouselUI();
            });
        }

        if (nextBtn && !nextBtn.dataset.bound) {
            nextBtn.dataset.bound = 'true';
            nextBtn.addEventListener('click', () => {
                const total = track.querySelectorAll('.station-slider-card').length;
                if (total <= 1) return;
                currentSlideIndex = (currentSlideIndex + 1) % total;
                updateSliderCarouselUI();
            });
        }

        // Touch swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            const total = track.querySelectorAll('.station-slider-card').length;
            if (total <= 1) return;
            if (diff < -50) {
                // Swipe left -> Next
                currentSlideIndex = (currentSlideIndex + 1) % total;
                updateSliderCarouselUI();
            } else if (diff > 50) {
                // Swipe right -> Prev
                currentSlideIndex = (currentSlideIndex - 1 + total) % total;
                updateSliderCarouselUI();
            }
        }, { passive: true });

        // Admin Actions Setup
        const adminBar = document.getElementById('slider-section-admin-bar');
        const addDeckBtn = document.getElementById('btn-add-slider-deck');

        if (isAdminLoggedIn) {
            if (adminBar) adminBar.style.display = 'flex';
            if (addDeckBtn && !addDeckBtn.dataset.bound) {
                addDeckBtn.dataset.bound = 'true';
                addDeckBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    openCreateSliderModal();
                });
            }
        }

        // Wire controls for each card in the track
        track.querySelectorAll('.station-slider-card').forEach(card => {
            attachSliderCardControls(card);
            const adminCtrl = card.querySelector('.slider-card-admin-controls');
            if (adminCtrl) {
                adminCtrl.style.display = (isAdminLoggedIn && editModeActive) ? 'flex' : 'none';
            }
        });

        // Initialize Carousel Display
        updateSliderCarouselUI();
    }

    restoreMainHtmlIfPresent();
    initCustomFaqAccordions();
    renderCustomNavLinks();
    initRosterAdmin();
    initStationSliders();
    initApparatusAdmin();
    initLiveEditor();
    applyImageEdits(getStoredImageEdits());
    if (isAdminLoggedIn) {
        setupAllSectionControls();
        setupUniversalImageEditors();
    }

    // Helper: Push actual modified HTML files directly to GitHub
    async function syncHtmlPagesToGitHub(edits) {
        if (!edits || typeof edits !== 'object') return true;

        // 1. Collect all distinct HTML pages that have text or font edits
        const editedPages = new Set();
        Object.keys(edits).forEach(key => {
            const match = key.match(/^(?:edit_v2|font_v2)_([a-zA-Z0-9_\-\.]+\.html)_/);
            if (match && match[1]) {
                editedPages.add(match[1]);
            }
        });

        // Collect all distinct HTML pages that have image or background edits
        const imageEdits = getStoredImageEdits();
        Object.keys(imageEdits).forEach(key => {
            const match = key.match(/^(?:bg|img)_v2_([a-zA-Z0-9_\-\.]+\.html)_/);
            if (match && match[1]) {
                editedPages.add(match[1]);
            }
        });

        // Always include current page if on an HTML page
        const currentPage = getPageKey();
        if (currentPage && currentPage.endsWith('.html') && currentPage !== 'admin.html') {
            editedPages.add(currentPage);
        }

        // Always include about.html if there are pending roster modifications or slider changes
        if (localStorage.getItem('station46_roster_html') || localStorage.getItem('station46_sliders_html')) {
            editedPages.add('about.html');
        }

        // Always include apparatus pages if there are pending fleet changes
        if (localStorage.getItem('station46_active_apparatus_html')) {
            editedPages.add('apparatus.html');
        }
        if (localStorage.getItem('station46_retired_apparatus_html')) {
            editedPages.add('retired-apparatus.html');
        }

        // Include any pages that have custom sections or updated main content
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('station46_main_html_')) {
                const p = k.replace('station46_main_html_', '');
                if (p.endsWith('.html')) editedPages.add(p);
            }
        }

        // If global fonts were customized, sync typography across all site pages
        if (edits['global_heading_font'] || edits['global_body_font']) {
            ['index.html', 'about.html', 'apparatus.html', 'retired-apparatus.html', 'news.html', 'membership.html', 'juniors.html', 'santa.html', 'history.html'].forEach(p => editedPages.add(p));
        }

        // If there are custom navigation links, sync all standard pages to ensure navbar consistency
        const customLinks = JSON.parse(localStorage.getItem('station46_custom_nav_links') || '[]');
        if (customLinks.length > 0) {
            ['index.html', 'about.html', 'apparatus.html', 'retired-apparatus.html', 'news.html', 'membership.html', 'juniors.html', 'santa.html'].forEach(p => editedPages.add(p));
        }

        // Include any custom created pages
        const customPages = JSON.parse(localStorage.getItem('station46_custom_pages') || '[]');
        customPages.forEach(cp => {
            if (cp.slug) editedPages.add(cp.slug);
        });

        // Include admin.html if admin welcome heading was edited
        if (localStorage.getItem('station46_admin_welcome') || (edits && edits['edit_v2_admin.html_#admin-welcome-heading'])) {
            editedPages.add('admin.html');
        }

        let allHtmlSuccess = true;

        for (const pageName of editedPages) {
            try {
                const rawHtml = await fetchRawFile(pageName);
                if (!rawHtml) {
                    console.warn(`[Station 46] Could not load raw HTML for ${pageName}`);
                    continue;
                }

                const parser = new DOMParser();
                const doc = parser.parseFromString(rawHtml, 'text/html');
                let pageHasChanges = false;

                // Synchronize global typography if set
                if (edits['global_heading_font'] || edits['global_body_font']) {
                    let styleTag = doc.getElementById('station46-custom-typography');
                    if (!styleTag) {
                        styleTag = doc.createElement('style');
                        styleTag.id = 'station46-custom-typography';
                        doc.head.appendChild(styleTag);
                    }
                    const hRule = edits['global_heading_font'] ? `--font-heading: ${edits['global_heading_font']};` : '';
                    const bRule = edits['global_body_font'] ? `--font-body: ${edits['global_body_font']};` : '';
                    const newCss = `:root { ${hRule} ${bRule} }`;
                    if (styleTag.textContent.trim() !== newCss.trim()) {
                        styleTag.textContent = newCss;
                        pageHasChanges = true;
                    }
                }

                // Synchronize roster container if present on this page
                const docRoster = doc.getElementById('roster-container');
                const liveRosterCleanHtml = (pageName === currentPage && document.getElementById('roster-container'))
                    ? getCleanRosterHtml()
                    : localStorage.getItem('station46_roster_html');

                if (docRoster && liveRosterCleanHtml) {
                    if (docRoster.innerHTML.trim() !== liveRosterCleanHtml.trim()) {
                        docRoster.innerHTML = liveRosterCleanHtml;
                        pageHasChanges = true;
                    }
                }

                // Synchronize station sliders track if present on about.html
                if (pageName === 'about.html') {
                    const docSlidersTrack = doc.getElementById('station-sliders-track');
                    const liveSlidersCleanHtml = (pageName === currentPage && document.getElementById('station-sliders-track'))
                        ? (typeof getCleanSlidersHtml === 'function' ? getCleanSlidersHtml() : null)
                        : localStorage.getItem('station46_sliders_html');

                    if (docSlidersTrack && liveSlidersCleanHtml) {
                        if (docSlidersTrack.innerHTML.trim() !== liveSlidersCleanHtml.trim()) {
                            docSlidersTrack.innerHTML = liveSlidersCleanHtml;
                            pageHasChanges = true;
                        }
                    }
                }

                // Synchronize active apparatus grid if present on apparatus.html
                if (pageName === 'apparatus.html') {
                    const docActiveApparatus = doc.getElementById('active-apparatus-list');
                    const liveActiveCleanHtml = (pageName === currentPage && document.getElementById('active-apparatus-list'))
                        ? (typeof getCleanApparatusHtml === 'function' ? getCleanApparatusHtml('active') : null)
                        : localStorage.getItem('station46_active_apparatus_html');

                    if (docActiveApparatus && liveActiveCleanHtml) {
                        if (docActiveApparatus.innerHTML.trim() !== liveActiveCleanHtml.trim()) {
                            docActiveApparatus.innerHTML = liveActiveCleanHtml;
                            pageHasChanges = true;
                        }
                    }
                }

                // Synchronize retired apparatus grid if present on retired-apparatus.html
                if (pageName === 'retired-apparatus.html') {
                    const docRetiredApparatus = doc.getElementById('retired-apparatus-list');
                    const liveRetiredCleanHtml = (pageName === currentPage && document.getElementById('retired-apparatus-list'))
                        ? (typeof getCleanApparatusHtml === 'function' ? getCleanApparatusHtml('retired') : null)
                        : localStorage.getItem('station46_retired_apparatus_html');

                    if (docRetiredApparatus && liveRetiredCleanHtml) {
                        if (docRetiredApparatus.innerHTML.trim() !== liveRetiredCleanHtml.trim()) {
                            docRetiredApparatus.innerHTML = liveRetiredCleanHtml;
                            pageHasChanges = true;
                        }
                    }
                }

                // Synchronize admin welcome heading if syncing admin.html
                if (pageName === 'admin.html') {
                    const docWelcome = doc.getElementById('admin-welcome-heading');
                    const savedAdminWelcome = localStorage.getItem('station46_admin_welcome') || (edits && edits['edit_v2_admin.html_#admin-welcome-heading']);
                    if (docWelcome && savedAdminWelcome && docWelcome.innerHTML.trim() !== savedAdminWelcome.trim()) {
                        docWelcome.innerHTML = savedAdminWelcome.trim();
                        pageHasChanges = true;
                    }
                }

                // Synchronize custom navigation links across all pages
                if (customLinks.length > 0) {
                    const docNavLinks = doc.querySelector('.navbar .nav-links');
                    if (docNavLinks) {
                        customLinks.forEach(link => {
                            if (!docNavLinks.querySelector(`a[href="${link.slug}"]`)) {
                                const newLink = doc.createElement('a');
                                newLink.href = link.slug;
                                newLink.className = 'nav-link' + (pageName === link.slug ? ' active' : '');
                                newLink.textContent = link.title;
                                const donateBtn = docNavLinks.querySelector('.nav-btn-donate');
                                if (donateBtn) {
                                    docNavLinks.insertBefore(newLink, donateBtn);
                                } else {
                                    docNavLinks.appendChild(newLink);
                                }
                                pageHasChanges = true;
                            }
                        });
                    }
                }

                // Synchronize main content if modified or custom sections present
                const liveMainCleanHtml = (pageName === currentPage && document.querySelector('main'))
                    ? getCleanMainHtml()
                    : localStorage.getItem('station46_main_html_' + pageName);

                const docMain = doc.querySelector('main');
                if (docMain && liveMainCleanHtml) {
                    if (docMain.innerHTML.trim() !== liveMainCleanHtml.trim()) {
                        docMain.innerHTML = liveMainCleanHtml;
                        pageHasChanges = true;
                    }
                }

                const elements = getEditableElements(doc);

                elements.forEach((element) => {
                    const selectorPath = getElementSelectorPath(element);
                    const storageKey = `edit_v2_${pageName}_${selectorPath}`;
                    const fontKey = `font_v2_${pageName}_${selectorPath}`;

                    // Update element-specific font
                    if (edits[fontKey]) {
                        if (element.style.fontFamily !== edits[fontKey]) {
                            element.style.fontFamily = edits[fontKey];
                            pageHasChanges = true;
                        }
                    }

                    if (edits[storageKey] !== undefined && edits[storageKey] !== null) {
                        const newContent = edits[storageKey].trim();
                        if (element.innerHTML.trim() !== newContent) {
                            element.innerHTML = newContent;
                            pageHasChanges = true;
                        }
                    }
                });

                // Ensure Google Font links are injected into doc.head if needed
                const fontsToLoad = [edits['global_heading_font'], edits['global_body_font']];
                elements.forEach(el => {
                    const fk = `font_v2_${pageName}_${getElementSelectorPath(el)}`;
                    if (edits[fk]) fontsToLoad.push(edits[fk]);
                });
                fontsToLoad.forEach(fv => {
                    if (!fv || fv === 'inherit') return;
                    const fontObj = SUPPORTED_FONTS.find(f => f.value === fv || fv.toLowerCase().includes(f.name.toLowerCase().split(' ')[0]));
                    if (fontObj && fontObj.google) {
                        const linkId = 'font-link-' + fontObj.google.split(':')[0].replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                        if (!doc.getElementById(linkId)) {
                            const fontLink = doc.createElement('link');
                            fontLink.id = linkId;
                            fontLink.rel = 'stylesheet';
                            fontLink.href = `https://fonts.googleapis.com/css2?family=${fontObj.google}&display=swap`;
                            doc.head.appendChild(fontLink);
                            pageHasChanges = true;
                        }
                    }
                });

                // Synchronize stored image edits for this page
                for (const key in imageEdits) {
                    if (!key.startsWith(`img_v2_${pageName}_`) && !key.startsWith(`bg_v2_${pageName}_`)) continue;
                    const isBg = key.startsWith(`bg_v2_${pageName}_`);
                    const selectorPath = isBg ? key.replace(`bg_v2_${pageName}_`, '') : key.replace(`img_v2_${pageName}_`, '');
                    const src = imageEdits[key];
                    if (!src) continue;

                    try {
                        const targetEl = doc.querySelector(selectorPath);
                        if (targetEl) {
                            if (isBg) {
                                if (targetEl.classList.contains('card-img-placeholder')) {
                                    targetEl.style.background = `linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.45)), url("${src}") center/cover`;
                                    targetEl.style.color = 'white';
                                    targetEl.style.fontWeight = '800';
                                    targetEl.style.textShadow = '0 2px 8px rgba(0,0,0,0.9)';
                                } else if (targetEl.classList.contains('hero-bg') || targetEl.classList.contains('hero') || targetEl.classList.contains('small-hero') || targetEl.classList.contains('custom-hero-mini-wrap')) {
                                    targetEl.style.backgroundImage = `linear-gradient(rgba(15, 25, 43, 0.25), rgba(15, 25, 43, 0.48)), url("${src}")`;
                                    targetEl.style.backgroundSize = 'cover';
                                    targetEl.style.backgroundPosition = 'center';
                                } else {
                                    targetEl.style.backgroundImage = `url("${src}")`;
                                    targetEl.style.backgroundSize = 'cover';
                                    targetEl.style.backgroundPosition = 'center';
                                }
                                pageHasChanges = true;
                            } else if (targetEl.tagName === 'IMG') {
                                if (targetEl.getAttribute('src') !== src) {
                                    targetEl.setAttribute('src', src);
                                    pageHasChanges = true;
                                }
                            }
                        }
                    } catch (err) {
                        console.warn(`[Station 46] Error applying image edit ${key} in ${pageName}:`, err);
                    }
                }

                if (pageHasChanges) {
                    // Strip any runtime attributes or markers before generating clean static HTML
                    doc.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
                    doc.querySelectorAll('[data-editor-init]').forEach(el => el.removeAttribute('data-editor-init'));
                    doc.querySelectorAll('.admin-edit-focus, .apparatus-card-dragging, .roster-card-dragging').forEach(el => {
                        el.classList.remove('admin-edit-focus', 'apparatus-card-dragging', 'roster-card-dragging');
                    });
                    doc.querySelectorAll('.station-image-change-btn, .section-drag-handle, .section-drop-indicator, .section-drag-ghost-badge, .section-admin-bar, .section-insert-divider, .section-card-add-btn, .card-admin-remove-btn, .section-item-upload-btn').forEach(el => el.remove());
                    const updatedHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
                    const success = await syncToGitHub(pageName, updatedHtml, `Admin: Update content in ${pageName}`);
                    if (!success) allHtmlSuccess = false;
                }
            } catch (err) {
                console.error(`[Station 46] Error applying edits to HTML file ${pageName}:`, err);
                allHtmlSuccess = false;
            }
        }

        return allHtmlSuccess;
    }

    // Universal Save & Push Handler (Updates both the actual HTML files and backup JSONs on GitHub)
    async function triggerUniversalGitSync(triggerElement) {
        const originalText = triggerElement ? triggerElement.innerHTML : '';
        if (triggerElement) {
            triggerElement.innerHTML = '⏳ Pushing to Git...';
            triggerElement.style.background = 'rgba(230, 81, 0, 0.95)'; // Orange
            triggerElement.disabled = true;
        }

        // 1. If an element is currently focused, blur it to ensure input handler ran
        if (document.activeElement && document.activeElement.isContentEditable) {
            document.activeElement.blur();
        }

        if (typeof saveApparatusState === 'function') {
            saveApparatusState('active');
            saveApparatusState('retired');
        }
        if (typeof saveSlidersState === 'function') {
            saveSlidersState();
        }
        if (typeof saveRosterState === 'function') {
            saveRosterState();
        }

        try {
            // 2. Fetch latest edits from GitHub to guarantee no remote edits are lost
            let remoteEdits = {};
            try {
                const remoteData = await fetchRemoteData('data/edits.json');
                if (remoteData && typeof remoteData === 'object') {
                    remoteEdits = remoteData;
                }
            } catch (e) {
                console.warn('[Station 46] Could not fetch latest remote edits before push:', e);
            }

            // 3. Smart Merge: Combine all existing remote edits from GitHub with all local edits across all pages
            const localEdits = getStoredTextEdits();
            const mergedEdits = Object.assign({}, remoteEdits, localEdits);
            localStorage.setItem('station46_text_edits', JSON.stringify(mergedEdits));

            // 4. Update the actual HTML files directly on GitHub (e.g. index.html, about.html, etc.)
            const htmlSuccess = await syncHtmlPagesToGitHub(mergedEdits);

            // 5. If HTML files updated, clear local text edits, image edits, roster buffer, sliders buffer and apparatus buffers so future reloads use clean HTML
            if (htmlSuccess) {
                localStorage.removeItem('station46_text_edits');
                localStorage.removeItem('station46_image_edits');
                localStorage.removeItem('station46_roster_html');
                localStorage.removeItem('station46_sliders_html');
                localStorage.removeItem('station46_active_apparatus_html');
                localStorage.removeItem('station46_retired_apparatus_html');
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith('station46_main_html_')) {
                        localStorage.removeItem(k);
                    }
                }
                await syncToGitHub('data/edits.json', {}, 'Admin: Reset edits buffer after HTML sync');
            } else {
                await syncToGitHub('data/edits.json', mergedEdits, 'Admin: Update live text edits buffer');
            }

            const currentPosts = getStoredPosts();
            const postSuccess = await syncToGitHub('data/posts.json', currentPosts, 'Admin: Update news posts');

            if (htmlSuccess || postSuccess) {
                if (triggerElement) {
                    triggerElement.innerHTML = '✅ Saved & Pushed to Git!';
                    triggerElement.style.background = 'rgba(46, 125, 50, 0.95)'; // Green
                }
                showAdminToast('✅ Changes saved directly to HTML and pushed to GitHub!');
            } else {
                if (triggerElement) {
                    triggerElement.innerHTML = '❌ Push Failed (Check console)';
                    triggerElement.style.background = 'rgba(179, 33, 43, 0.95)';
                }
                showAdminToast('❌ Failed to push changes to GitHub. Please check console.', true);
            }
        } catch (err) {
            console.error('[Station 46] Universal sync error:', err);
            if (triggerElement) {
                triggerElement.innerHTML = '❌ Push Error';
                triggerElement.style.background = 'rgba(179, 33, 43, 0.95)';
            }
            showAdminToast('❌ Error pushing to GitHub: ' + (err.message || err), true);
        } finally {
            setTimeout(() => {
                if (triggerElement) {
                    triggerElement.innerHTML = originalText || '💾 Save & Push to Git';
                    triggerElement.style.background = 'rgba(21, 101, 192, 0.95)';
                    triggerElement.disabled = false;
                }
            }, 3500);
        }
    }

    // Add a floating admin control bar on public pages when logged in (never on admin.html)
    const isActualAdminPortal = window.location.pathname.endsWith('admin.html') || window.location.pathname.includes('admin.html');
    if (isAdminLoggedIn && !isActualAdminPortal && !document.getElementById('admin-floating-bar')) {
        const bar = document.createElement('div');
        bar.id = 'admin-floating-bar';
        bar.className = 'admin-floating-bar';
        bar.style.position = 'fixed';
        bar.style.bottom = '24px';
        bar.style.left = '50%';
        bar.style.transform = 'translateX(-50%)';
        bar.style.display = 'flex';
        bar.style.alignItems = 'center';
        bar.style.gap = '0.5rem';
        bar.style.zIndex = '99999';
        bar.style.background = '#0f172a';
        bar.style.padding = '8px 14px';
        bar.style.borderRadius = '30px';
        bar.style.border = '1px solid #334155';
        bar.style.boxShadow = '0 8px 28px rgba(0,0,0,0.45)';
        bar.style.maxWidth = 'calc(100vw - 32px)';
        bar.style.boxSizing = 'border-box';

        // 1. Save & Push to Git Button
        const saveGitBtn = document.createElement('button');
        saveGitBtn.id = 'admin-save-git-btn';
        saveGitBtn.style.background = 'rgba(21, 101, 192, 0.95)'; // Blue
        saveGitBtn.style.color = 'white';
        saveGitBtn.style.padding = '10px 18px';
        saveGitBtn.style.borderRadius = '30px';
        saveGitBtn.style.fontSize = '0.85rem';
        saveGitBtn.style.fontWeight = '700';
        saveGitBtn.style.border = 'none';
        saveGitBtn.style.cursor = 'pointer';
        saveGitBtn.style.transition = 'all 0.2s ease';
        saveGitBtn.style.fontFamily = 'var(--font-heading, sans-serif)';
        saveGitBtn.style.boxShadow = '0 0 15px rgba(33, 150, 243, 0.4)';
        saveGitBtn.innerHTML = '💾 Save & Push to Git';

        // 2. Add Section Button
        const addSectionBtn = document.createElement('button');
        addSectionBtn.id = 'admin-floating-add-section-btn';
        addSectionBtn.style.background = 'rgba(255, 255, 255, 0.12)';
        addSectionBtn.style.color = 'white';
        addSectionBtn.style.padding = '10px 16px';
        addSectionBtn.style.borderRadius = '30px';
        addSectionBtn.style.fontSize = '0.85rem';
        addSectionBtn.style.fontWeight = '600';
        addSectionBtn.style.border = 'none';
        addSectionBtn.style.cursor = 'pointer';
        addSectionBtn.style.transition = 'all 0.2s ease';
        addSectionBtn.style.fontFamily = 'var(--font-heading, sans-serif)';
        addSectionBtn.innerHTML = '➕ Section';
        addSectionBtn.title = 'Add a new civic section to this page';
        addSectionBtn.addEventListener('click', () => openAddSectionModal());

        // 3. New Page Button
        const newPageBtn = document.createElement('button');
        newPageBtn.id = 'admin-floating-new-page-btn';
        newPageBtn.style.background = 'rgba(255, 255, 255, 0.12)';
        newPageBtn.style.color = 'white';
        newPageBtn.style.padding = '10px 16px';
        newPageBtn.style.borderRadius = '30px';
        newPageBtn.style.fontSize = '0.85rem';
        newPageBtn.style.fontWeight = '600';
        newPageBtn.style.border = 'none';
        newPageBtn.style.cursor = 'pointer';
        newPageBtn.style.transition = 'all 0.2s ease';
        newPageBtn.style.fontFamily = 'var(--font-heading, sans-serif)';
        newPageBtn.innerHTML = '📄 New Page';
        newPageBtn.title = 'Create a brand new page on the website';
        newPageBtn.addEventListener('click', () => openCreatePageModal());

        // 4. Media Library & Photos Button
        const photosBtn = document.createElement('button');
        photosBtn.id = 'admin-floating-photos-btn';
        photosBtn.style.background = 'rgba(255, 255, 255, 0.12)';
        photosBtn.style.color = 'white';
        photosBtn.style.padding = '10px 16px';
        photosBtn.style.borderRadius = '30px';
        photosBtn.style.fontSize = '0.85rem';
        photosBtn.style.fontWeight = '600';
        photosBtn.style.border = 'none';
        photosBtn.style.cursor = 'pointer';
        photosBtn.style.transition = 'all 0.2s ease';
        photosBtn.style.fontFamily = 'var(--font-heading, sans-serif)';
        photosBtn.innerHTML = '🖼️ Photos';
        photosBtn.title = 'Browse station photo library and assets';
        photosBtn.addEventListener('click', () => openImageEditorModal(null, false));

        // 5. Typography / Fonts Button
        const fontsBtn = document.createElement('button');
        fontsBtn.id = 'admin-typography-btn';
        fontsBtn.style.background = 'rgba(255, 255, 255, 0.12)';
        fontsBtn.style.color = 'white';
        fontsBtn.style.padding = '10px 16px';
        fontsBtn.style.borderRadius = '30px';
        fontsBtn.style.fontSize = '0.85rem';
        fontsBtn.style.fontWeight = '600';
        fontsBtn.style.border = 'none';
        fontsBtn.style.cursor = 'pointer';
        fontsBtn.style.transition = 'all 0.2s ease';
        fontsBtn.style.fontFamily = 'var(--font-heading, sans-serif)';
        fontsBtn.innerHTML = '🔤 Fonts';
        fontsBtn.addEventListener('click', openTypographyModal);

        // 6. Toggle Edit Mode Button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'edit-mode-toggle-btn';
        toggleBtn.style.background = 'rgba(46, 125, 50, 0.9)'; // Green for ON
        toggleBtn.style.color = 'white';
        toggleBtn.style.padding = '10px 18px';
        toggleBtn.style.borderRadius = '30px';
        toggleBtn.style.fontSize = '0.85rem';
        toggleBtn.style.fontWeight = '700';
        toggleBtn.style.border = 'none';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.transition = 'all 0.2s ease';
        toggleBtn.style.fontFamily = 'var(--font-heading, sans-serif)';
        toggleBtn.innerHTML = '⚡ Edit Mode: ON';

        // 7. Admin Portal link button
        const portalBtn = document.createElement('a');
        portalBtn.href = 'admin.html';
        portalBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        portalBtn.style.color = 'white';
        portalBtn.style.padding = '10px 16px';
        portalBtn.style.borderRadius = '30px';
        portalBtn.style.fontSize = '0.85rem';
        portalBtn.style.fontWeight = '600';
        portalBtn.style.textDecoration = 'none';
        portalBtn.style.transition = 'all 0.2s ease';
        portalBtn.style.fontFamily = 'var(--font-heading, sans-serif)';
        portalBtn.innerHTML = '⚙️ Dashboard';

        // 8. Quick Logout Button
        const quickLogoutBtn = document.createElement('button');
        quickLogoutBtn.id = 'admin-quick-logout-btn';
        quickLogoutBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        quickLogoutBtn.style.color = 'rgba(255, 255, 255, 0.8)';
        quickLogoutBtn.style.padding = '10px 16px';
        quickLogoutBtn.style.borderRadius = '30px';
        quickLogoutBtn.style.fontSize = '0.85rem';
        quickLogoutBtn.style.fontWeight = '600';
        quickLogoutBtn.style.border = 'none';
        quickLogoutBtn.style.cursor = 'pointer';
        quickLogoutBtn.style.transition = 'all 0.2s ease';
        quickLogoutBtn.style.fontFamily = 'var(--font-heading, sans-serif)';
        quickLogoutBtn.innerHTML = 'Log Out';

        // Hover animations
        saveGitBtn.addEventListener('mouseenter', () => saveGitBtn.style.transform = 'translateY(-2px)');
        saveGitBtn.addEventListener('mouseleave', () => saveGitBtn.style.transform = 'none');
        addSectionBtn.addEventListener('mouseenter', () => { addSectionBtn.style.transform = 'translateY(-2px)'; addSectionBtn.style.background = 'rgba(255, 255, 255, 0.22)'; });
        addSectionBtn.addEventListener('mouseleave', () => { addSectionBtn.style.transform = 'none'; addSectionBtn.style.background = 'rgba(255, 255, 255, 0.12)'; });
        newPageBtn.addEventListener('mouseenter', () => { newPageBtn.style.transform = 'translateY(-2px)'; newPageBtn.style.background = 'rgba(255, 255, 255, 0.22)'; });
        newPageBtn.addEventListener('mouseleave', () => { newPageBtn.style.transform = 'none'; newPageBtn.style.background = 'rgba(255, 255, 255, 0.12)'; });
        photosBtn.addEventListener('mouseenter', () => { photosBtn.style.transform = 'translateY(-2px)'; photosBtn.style.background = 'rgba(255, 255, 255, 0.22)'; });
        photosBtn.addEventListener('mouseleave', () => { photosBtn.style.transform = 'none'; photosBtn.style.background = 'rgba(255, 255, 255, 0.12)'; });
        fontsBtn.addEventListener('mouseenter', () => { fontsBtn.style.transform = 'translateY(-2px)'; fontsBtn.style.background = 'rgba(255, 255, 255, 0.22)'; });
        fontsBtn.addEventListener('mouseleave', () => { fontsBtn.style.transform = 'none'; fontsBtn.style.background = 'rgba(255, 255, 255, 0.12)'; });
        toggleBtn.addEventListener('mouseenter', () => toggleBtn.style.transform = 'translateY(-2px)');
        toggleBtn.addEventListener('mouseleave', () => toggleBtn.style.transform = 'none');
        portalBtn.addEventListener('mouseenter', () => portalBtn.style.background = 'rgba(255, 255, 255, 0.2)');
        portalBtn.addEventListener('mouseleave', () => portalBtn.style.background = 'rgba(255, 255, 255, 0.1)');
        quickLogoutBtn.addEventListener('mouseenter', () => {
            quickLogoutBtn.style.background = 'rgba(179, 33, 43, 0.9)';
            quickLogoutBtn.style.color = 'white';
        });
        quickLogoutBtn.addEventListener('mouseleave', () => {
            quickLogoutBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            quickLogoutBtn.style.color = 'rgba(255, 255, 255, 0.8)';
        });

        saveGitBtn.addEventListener('click', () => triggerUniversalGitSync(saveGitBtn));

        bar.appendChild(saveGitBtn);
        bar.appendChild(addSectionBtn);
        bar.appendChild(newPageBtn);
        bar.appendChild(photosBtn);
        bar.appendChild(fontsBtn);
        bar.appendChild(toggleBtn);
        bar.appendChild(portalBtn);
        bar.appendChild(quickLogoutBtn);
        document.body.appendChild(bar);
        document.body.classList.add('admin-edit-mode');
        document.body.classList.add('has-admin-floating-bar');

        toggleBtn.addEventListener('click', () => {
            editModeActive = !editModeActive;
            
            if (editModeActive) {
                document.body.classList.add('admin-edit-mode');
                toggleBtn.style.background = 'rgba(46, 125, 50, 0.9)'; // Green
                toggleBtn.innerHTML = '⚡ Edit Mode: ON';
                
                getEditableElements().forEach(element => {
                    element.setAttribute('contenteditable', 'true');
                });
                document.querySelectorAll('.tag-new').forEach(tag => {
                    tag.setAttribute('contenteditable', 'true');
                });
                document.querySelectorAll('.roster-card.roster-card-draggable').forEach(card => {
                    card.setAttribute('draggable', 'true');
                });
                document.querySelectorAll('.apparatus-card-draggable').forEach(card => {
                    card.setAttribute('draggable', 'true');
                });
                document.querySelectorAll('.slider-card-admin-controls, .stat-row-remove-btn').forEach(el => {
                    el.style.display = 'flex';
                });
                document.querySelectorAll('.btn-apparatus-add, .apparatus-card-remove-btn, .apparatus-card-admin-header').forEach(el => {
                    el.style.display = 'inline-flex';
                });
                document.querySelectorAll('.section-admin-bar, .section-insert-divider, .section-card-add-btn, .card-admin-remove-btn').forEach(el => {
                    el.style.display = 'flex';
                });
                document.querySelectorAll('.section-item-upload-btn, .station-image-change-btn, .section-drag-handle').forEach(el => {
                    el.style.display = 'inline-flex';
                });
                setupAllSectionControls();
                setupUniversalImageEditors();
            } else {
                hideFontToolbar();
                document.body.classList.remove('admin-edit-mode');
                toggleBtn.style.background = 'rgba(179, 33, 43, 0.9)'; // Red for OFF
                toggleBtn.innerHTML = '⚡ Edit Mode: OFF';
                
                getEditableElements().forEach(element => {
                    element.setAttribute('contenteditable', 'false');
                });
                document.querySelectorAll('.tag-new').forEach(tag => {
                    tag.setAttribute('contenteditable', 'false');
                });
                document.querySelectorAll('.roster-card.roster-card-draggable').forEach(card => {
                    card.removeAttribute('draggable');
                });
                document.querySelectorAll('.apparatus-card-draggable').forEach(card => {
                    card.removeAttribute('draggable');
                });
                document.querySelectorAll('.slider-card-admin-controls, .stat-row-remove-btn').forEach(el => {
                    el.style.display = 'none';
                });
                document.querySelectorAll('.btn-apparatus-add, .apparatus-card-remove-btn, .apparatus-card-admin-header').forEach(el => {
                    el.style.display = 'none';
                });
                document.querySelectorAll('.section-admin-bar, .section-insert-divider, .section-card-add-btn, .card-admin-remove-btn, .section-item-upload-btn, .station-image-change-btn, .section-drag-handle').forEach(el => {
                    el.style.display = 'none';
                });
            }
        });

        quickLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('admin_logged_in');
            window.location.reload();
        });
    }

    // Connect Force Push button inside Admin Dashboard if present
    const forcePushBtn = document.getElementById('admin-force-git-push-btn');
    if (forcePushBtn) {
        forcePushBtn.addEventListener('click', () => {
            triggerUniversalGitSync(forcePushBtn);
        });
    }

    // 1. Admin Login & Session Handlers
    const loginForm = document.getElementById('admin-login-form');
    const loginView = document.getElementById('admin-login-view');
    const dashboardView = document.getElementById('admin-dashboard-view');
    const loginErrorMsg = document.getElementById('login-error-msg');
    const logoutBtn = document.getElementById('admin-logout-btn');

    function toggleAdminLayout(isLoggedIn) {
        const navbar = document.getElementById('admin-navbar');
        const hero = document.getElementById('admin-header-hero');
        const footer = document.getElementById('admin-footer');

        if (isLoggedIn) {
            document.body.classList.remove('plain-login-body');
            if (navbar) navbar.style.display = '';
            if (hero) hero.style.display = '';
            if (footer) footer.style.display = '';
        } else {
            document.body.classList.add('plain-login-body');
            if (navbar) navbar.style.display = '';
            if (hero) hero.style.display = 'none';
            if (footer) footer.style.display = '';
        }
    }

    function setupAdminWelcomeHeading() {
        const welcomeHeading = document.getElementById('admin-welcome-heading');
        const editHint = document.getElementById('admin-welcome-edit-hint');
        if (!welcomeHeading) return;

        // Restore saved greeting
        const saved = localStorage.getItem('station46_admin_welcome') || 
            (getStoredTextEdits() && getStoredTextEdits()['edit_v2_admin.html_#admin-welcome-heading']);
        if (saved) {
            welcomeHeading.innerHTML = saved;
        }

        welcomeHeading.setAttribute('contenteditable', 'true');
        welcomeHeading.setAttribute('spellcheck', 'false');

        if (editHint) {
            editHint.addEventListener('click', (e) => {
                e.preventDefault();
                welcomeHeading.focus();
                const range = document.createRange();
                range.selectNodeContents(welcomeHeading);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            });
        }

        welcomeHeading.addEventListener('input', () => {
            const val = welcomeHeading.innerHTML.trim();
            if (val) {
                localStorage.setItem('station46_admin_welcome', val);
                saveTextEdit('edit_v2_admin.html_#admin-welcome-heading', val);
            }
        });

        welcomeHeading.addEventListener('blur', () => {
            let val = welcomeHeading.innerHTML.trim();
            if (!val || val === '<br>') {
                val = 'Welcome, Administrator';
                welcomeHeading.innerHTML = val;
            }
            localStorage.setItem('station46_admin_welcome', val);
            saveTextEdit('edit_v2_admin.html_#admin-welcome-heading', val);
        });

        welcomeHeading.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                welcomeHeading.blur();
            }
        });
    }

    if (loginForm && loginView && dashboardView) {
        // Redirect to dashboard if session exists
        if (sessionStorage.getItem('admin_logged_in') === 'true') {
            loginView.style.display = 'none';
            dashboardView.style.display = 'block';
            toggleAdminLayout(true);
            setupAdminWelcomeHeading();
            renderAdminPosts();
            renderAdminPagesManager();
        } else {
            toggleAdminLayout(false);
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const u = document.getElementById('admin-username').value.trim();
            const p = document.getElementById('admin-password').value;
            const submitBtn = loginForm.querySelector('[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            try {
                // Credentials are verified server-side by the Cloudflare function (/api/github)
                const res = await fetch(GITHUB_PROXY, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'login', username: u, password: p })
                });
                const result = await res.json().catch(() => ({}));

                if (res.ok && result.ok) {
                    sessionStorage.setItem('admin_credentials', JSON.stringify({ username: u, password: p }));
                    sessionStorage.setItem('admin_logged_in', 'true');
                    if (loginErrorMsg) loginErrorMsg.style.display = 'none';
                    window.location.reload(); // Reload once to boot login state and enable visual editor
                    return;
                }

                if (loginErrorMsg) {
                    loginErrorMsg.textContent = res.status === 401
                        ? 'Incorrect username or password. Please try again.'
                        : `Login service unavailable (${result.error || res.status}).`;
                    loginErrorMsg.style.display = 'block';
                }
            } catch (err) {
                if (loginErrorMsg) {
                    loginErrorMsg.textContent = 'Could not reach the login service. Check your connection.';
                    loginErrorMsg.style.display = 'block';
                }
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    // Connect Page Creator triggers on admin dashboard
    const adminHeaderNewPageBtn = document.getElementById('admin-header-new-page-btn');
    if (adminHeaderNewPageBtn) {
        adminHeaderNewPageBtn.addEventListener('click', () => openCreatePageModal());
    }
    const adminAddNewPageBtn = document.getElementById('admin-add-new-page-btn');
    if (adminAddNewPageBtn) {
        adminAddNewPageBtn.addEventListener('click', () => openCreatePageModal());
    }

    if (logoutBtn && loginView && dashboardView) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('admin_logged_in');
            sessionStorage.removeItem('admin_credentials');
            window.location.reload(); // Reload once to flush session state and exit visual editor
        });
    }

    // 2. Image File Upload Preview (Inside dashboard)
    const imageInput = document.getElementById('post-image');
    const imagePreview = document.getElementById('post-image-preview');

    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', () => {
            const file = imageInput.files[0];
            if (file) {
                compressImage(file, (compressedBase64) => {
                    imagePreview.src = compressedBase64;
                    imagePreview.style.display = 'block';
                });
            } else {
                imagePreview.src = '#';
                imagePreview.style.display = 'none';
            }
        });
    }

    // 3. Publish Post Submission Form
    const publishForm = document.getElementById('admin-publish-form');
    const postSuccessMsg = document.getElementById('post-success-msg');
    const postErrorMsg = document.getElementById('post-error-msg');
    const postIsNewCb = document.getElementById('post-is-new');
    const postTagInputContainer = document.getElementById('post-tag-input-container');

    if (postIsNewCb && postTagInputContainer) {
        postIsNewCb.addEventListener('change', () => {
            postTagInputContainer.style.display = postIsNewCb.checked ? 'flex' : 'none';
        });
    }

    if (publishForm) {
        publishForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('post-title').value.trim();
            const category = document.getElementById('post-category').value;
            const hasTag = postIsNewCb?.checked || false;
            const tagTextInput = document.getElementById('post-tag-text');
            const tagText = hasTag ? ((tagTextInput && tagTextInput.value.trim()) ? tagTextInput.value.trim().toUpperCase() : 'NEW') : '';
            const text = document.getElementById('post-text').value.trim();
            const imageSrc = imagePreview && imagePreview.style.display === 'block' ? imagePreview.src : '';

            if (!title || !category || !text) {
                if (postErrorMsg) postErrorMsg.style.display = 'block';
                if (postSuccessMsg) postSuccessMsg.style.display = 'none';
                return;
            }

            const posts = getStoredPosts();
            const newPost = {
                id: Date.now(),
                title: title,
                category: category,
                isNew: hasTag,
                tagText: tagText,
                text: text,
                image: imageSrc,
                date: getFormattedDate()
            };

            posts.unshift(newPost);
            savePosts(posts);

            if (postSuccessMsg) {
                postSuccessMsg.style.display = 'block';
                setTimeout(() => {
                    if (postSuccessMsg) postSuccessMsg.style.display = 'none';
                }, 3000);
            }
            if (postErrorMsg) postErrorMsg.style.display = 'none';

            publishForm.reset();
            if (postTagInputContainer) postTagInputContainer.style.display = 'none';
            if (imagePreview) {
                imagePreview.src = '#';
                imagePreview.style.display = 'none';
            }

            renderAdminPosts();
        });
    }

    // 4. Render Admin Dashboard Post Manager
    function renderAdminPosts() {
        const container = document.getElementById('admin-posts-list-container');
        if (!container) return;

        let posts = [];
        try {
            posts = getStoredPosts();
        } catch (e) {
            console.error("Failed to read admin posts:", e);
        }

        // Clean out invalid entries if any
        posts = posts.filter(post => post && typeof post === 'object' && post.id);

        if (posts.length === 0) {
            container.innerHTML = `<p style="color: var(--text-secondary); text-align: center; margin-top: 2rem;" id="no-admin-posts">No updates published yet. Use the form to write one.</p>`;
            return;
        }

        let html = '';
        posts.forEach(post => {
            try {
                const title = escapeHtml(post.title || 'Untitled Update');
                const categoryLabel = post.category === 'news' ? 'News & Events' : 'Fire Calls';
                const date = escapeHtml(post.date || getFormattedDate());
                const rawTag = post.tagText || (post.isNew ? 'NEW' : '');
                const tagBadge = rawTag ? `<span class="tag-new" style="position: static; margin-left: 6px; font-size: 0.55rem; padding: 1px 5px; vertical-align: middle;">${escapeHtml(rawTag)}</span>` : '';
                const editTagBtnText = rawTag ? `🏷️ Tag: "${escapeHtml(rawTag)}"` : '+ Add Tag';
                const editTagBtnStyle = rawTag
                    ? 'border: 1px solid rgba(59, 130, 246, 0.4); background: rgba(59, 130, 246, 0.15); color: #93c5fd;'
                    : 'border: 1px dashed rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.12); color: #34d399;';

                html += `
                    <div class="admin-post-item">
                        <div class="admin-post-info">
                            <h4>${title}</h4>
                            <div class="admin-post-meta">
                                <span>Category:</span> ${categoryLabel} | <span>Date:</span> ${date} ${tagBadge}
                            </div>
                        </div>
                        <div class="admin-post-actions" style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
                            <button type="button" class="btn edit-tag-btn" data-id="${post.id}" style="padding: 6px 10px; font-size: 0.78rem; font-family: var(--font-heading); font-weight: 600; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; ${editTagBtnStyle}">${editTagBtnText}</button>
                            <button type="button" class="btn btn-danger delete-btn" data-id="${post.id}" style="padding: 6px 12px; font-size: 0.85rem; font-family: var(--font-heading); font-weight: 600; border-radius: 6px; border: none; cursor: pointer;">Delete</button>
                        </div>
                    </div>
                `;
            } catch (e) {
                console.error("Failed to render admin list item:", e);
            }
        });

        container.innerHTML = html;

        // Add Tag Edit Event Handlers
        container.querySelectorAll('.edit-tag-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.getAttribute('data-id'));
                let posts = getStoredPosts();
                const post = posts.find(p => p && p.id === id);
                if (!post) return;
                const currentTag = post.tagText || (post.isNew ? 'NEW' : '');
                const input = prompt(`Edit badge/tag for "${post.title}"\n(Enter new tag text, or leave blank to remove tag):`, currentTag);
                if (input === null) return;
                const cleanTag = input.trim().toUpperCase();
                if (cleanTag) {
                    post.isNew = true;
                    post.tagText = cleanTag;
                    showAdminToast(`✅ Updated tag to "${cleanTag}". Click '💾 Save & Push to Git' to publish.`);
                } else {
                    post.isNew = false;
                    post.tagText = '';
                    showAdminToast(`✅ Removed tag from update.`);
                }
                savePosts(posts);
                renderAdminPosts();
            });
        });

        // Add Delete Event Handlers
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.getAttribute('data-id'));
                let posts = getStoredPosts();
                posts = posts.filter(post => post && post.id !== id);
                localStorage.setItem('station46_posts', JSON.stringify(posts));
                renderAdminPosts();
                showAdminToast('⏳ Deleting post on GitHub...');
                const success = await syncToGitHub('data/posts.json', posts, 'Admin: Delete news post');
                if (success) {
                    showAdminToast('✅ Post deleted successfully from GitHub!');
                } else {
                    showAdminToast('❌ Failed to delete post on GitHub.', true);
                }
            });
        });
    }

    // 5. News Page Dynamic Renderer & Filter Integrations
    const newsGrid = document.getElementById('news-grid-container');
    const newsEmptyState = document.getElementById('news-feed-state');
    const adminBadge = document.getElementById('floating-admin-badge');

    // Show floating admin shortcut badge on news feed if logged in
    if (adminBadge && sessionStorage.getItem('admin_logged_in') === 'true') {
        adminBadge.style.display = 'flex';
    }

    function renderNewsFeed(filter = 'all') {
        if (!newsGrid || !newsEmptyState) return;

        let posts = [];
        try {
            posts = getStoredPosts();
        } catch (e) {
            console.error("Failed to read posts:", e);
        }

        // Clean out invalid entries if any
        posts = posts.filter(post => post && typeof post === 'object' && post.id);

        if (posts.length === 0) {
            newsGrid.style.display = 'none';
            newsEmptyState.style.display = 'flex';
            return;
        }

        // Apply dynamic filtering
        const filteredPosts = posts.filter(post => {
            if (filter === 'all') return true;
            return post.category === filter;
        });

        if (filteredPosts.length === 0) {
            newsGrid.style.display = 'none';
            newsEmptyState.style.display = 'flex';
            return;
        }

        newsGrid.style.display = 'grid';
        newsEmptyState.style.display = 'none';

        let html = '';
        filteredPosts.forEach(post => {
            try {
                const title = escapeHtml(post.title || 'Untitled Update');
                const text = escapeHtml(post.text || '');
                const date = escapeHtml(post.date || getFormattedDate());
                const category = post.category === 'news' ? 'news' : 'calls';
                const tagLabel = category === 'news' ? 'News & Events' : 'Fire Call';
                const rawTag = post.tagText || (post.isNew ? 'NEW' : '');
                const newTagBadge = rawTag ? `<span class="tag-new" style="position: static; margin-bottom: 0;">${escapeHtml(rawTag)}</span>` : '';
                const imageHtml = post.image ? `<div class="news-card-img" style="background-image: url('${escapeHtml(post.image)}');"></div>` : '';

                html += `
                    <div class="news-card glass-card fade-in visible" data-category="${category}">
                        ${imageHtml}
                        <div class="news-card-body">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.85rem; flex-wrap: wrap;">
                                <span class="news-card-tag tag-${category}" style="margin-bottom: 0;">
                                    ${tagLabel}
                                </span>
                                ${newTagBadge}
                            </div>
                            <div class="news-card-date">${date}</div>
                            <h3 class="news-card-title">${title}</h3>
                            <p class="news-card-text">${text}</p>
                        </div>
                    </div>
                `;
            } catch (cardError) {
                console.error("Error rendering news card:", cardError);
            }
        });

        newsGrid.innerHTML = html;
        if (isAdminLoggedIn) {
            initLiveEditor();
        }
    }

    // Initial feed render if on news page
    if (newsGrid && newsEmptyState) {
        renderNewsFeed();
    }

    // News Filter Tabs Interactive Handler
    const filterButtons = document.querySelectorAll('.filter-btn');
    const emptyTitle = document.getElementById('empty-title');
    const emptyDesc = document.getElementById('empty-desc');
    const emptyIconSvg = document.getElementById('empty-icon-svg');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Set active class
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Get filter type
                const filter = button.getAttribute('data-filter');

                // Soft fade transition effect
                const emptyStateContainer = document.getElementById('news-feed-state');
                const feedContainer = document.getElementById('news-grid-container');

                if (emptyStateContainer && emptyStateContainer.style.display !== 'none') {
                    emptyStateContainer.style.opacity = '0.5';
                    emptyStateContainer.style.transform = 'translateY(5px)';
                }
                if (feedContainer && feedContainer.style.display !== 'none') {
                    feedContainer.style.opacity = '0.5';
                    feedContainer.style.transform = 'translateY(5px)';
                }

                setTimeout(() => {
                    // Render/filter dynamic feed
                    renderNewsFeed(filter);

                    // If empty state is triggered, update empty text placeholders accordingly
                    if (filter === 'all') {
                        if (emptyTitle) emptyTitle.textContent = 'No Updates Posted Yet';
                        if (emptyDesc) emptyDesc.textContent = 'We are currently preparing our news feed. Check back soon for official updates, fire safety announcements, and recent incident logs.';
                        if (emptyIconSvg) emptyIconSvg.innerHTML = `
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        `;
                    } else if (filter === 'news') {
                        if (emptyTitle) emptyTitle.textContent = 'No News or Events Posted Yet';
                        if (emptyDesc) emptyDesc.textContent = 'There are currently no company news, fire safety bulletins, or community event announcements posted. Check back soon for updates!';
                        if (emptyIconSvg) emptyIconSvg.innerHTML = `
                            <path d="M12 19l-4-4H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l4-4v16z"></path>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        `;
                    } else if (filter === 'calls') {
                        if (emptyTitle) emptyTitle.textContent = 'No Fire Calls Logged Yet';
                        if (emptyDesc) emptyDesc.textContent = 'There are currently no recent fire calls or emergency incident reports logged here. Check back soon for post-incident summaries.';
                        if (emptyIconSvg) emptyIconSvg.innerHTML = `
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        `;
                    }

                    if (emptyStateContainer) {
                        emptyStateContainer.style.opacity = '1';
                        emptyStateContainer.style.transform = 'translateY(0)';
                    }
                    if (feedContainer) {
                        feedContainer.style.opacity = '1';
                        feedContainer.style.transform = 'translateY(0)';
                    }
                }, 200);
            });
        });
    }

    // 5b. Home Page: Render 3 Most Recent Calls & News Posts
    const homeRecentPostsList = document.getElementById('home-recent-posts-list');
    function renderHomeRecentPosts() {
        if (!homeRecentPostsList) return;

        let posts = [];
        try {
            posts = getStoredPosts();
        } catch (e) {
            console.error("Failed to read posts for home page:", e);
        }

        posts = posts.filter(post => post && typeof post === 'object' && post.id && !String(post.id).startsWith('default-'));

        // If no user-created posts exist yet, display clean empty state
        if (posts.length === 0) {
            homeRecentPostsList.innerHTML = `
                <div class="recent-posts-empty">
                    <p>No recent updates or incident logs posted yet.</p>
                    <a href="news.html" class="detail-link">View News &amp; Calls →</a>
                </div>
            `;
            return;
        }

        // Take the 3 most recent posts
        const topPosts = posts.slice(0, 3);

        let html = '';
        topPosts.forEach(post => {
            const title = escapeHtml(post.title || 'Station Update');
            const text = escapeHtml(post.text || '');
            const date = escapeHtml(post.date || getFormattedDate());
            const category = post.category === 'news' ? 'news' : 'calls';
            const tagLabel = category === 'news' ? 'News & Events' : 'Fire Call';
            const rawTag = post.tagText || (post.isNew ? 'NEW' : '');
            const newTagBadge = rawTag ? `<span class="tag-new" style="position: static; margin-left: 6px; font-size: 0.55rem; padding: 1px 5px; vertical-align: middle;">${escapeHtml(rawTag)}</span>` : '';

            html += `
                <a href="news.html" class="recent-post-item category-${category} fade-in visible">
                    <div class="recent-post-meta">
                        <span class="recent-post-tag tag-${category}">${tagLabel}</span>
                        <span class="recent-post-date">${date}</span>
                    </div>
                    <h4 class="recent-post-title">${title} ${newTagBadge}</h4>
                    <p class="recent-post-snippet">${text}</p>
                </a>
            `;
        });

        homeRecentPostsList.innerHTML = html;
        if (isAdminLoggedIn) {
            initLiveEditor();
        }
    }

    // Initial home recent posts render
    if (homeRecentPostsList) {
        renderHomeRecentPosts();
    }

    // Remote Sync on load across all devices
    async function syncFromRemoteDatabase() {
        // Sync news posts
        try {
            const remotePosts = await fetchRemoteData('data/posts.json');
            if (Array.isArray(remotePosts)) {
                localStorage.setItem('station46_posts', JSON.stringify(remotePosts));
                // Re-render feed if visible
                if (newsGrid && newsEmptyState) {
                    renderNewsFeed();
                }
                const adminContainer = document.getElementById('admin-posts-list-container');
                if (adminContainer) {
                    renderAdminPosts();
                }
                if (homeRecentPostsList) {
                    renderHomeRecentPosts();
                }
            }
        } catch (err) {
            console.warn("[Station 46] Could not sync remote posts:", err);
        }

        // Sync visual text edits
        try {
            const remoteEdits = await fetchRemoteData('data/edits.json');
            if (remoteEdits && typeof remoteEdits === 'object') {
                const localEdits = getStoredTextEdits();
                const mergedEdits = Object.assign({}, remoteEdits, localEdits);
                if (Object.keys(mergedEdits).length > 0) {
                    localStorage.setItem('station46_text_edits', JSON.stringify(mergedEdits));
                    applyTextEdits(mergedEdits);
                } else {
                    localStorage.removeItem('station46_text_edits');
                }
                if (isAdminLoggedIn) {
                    initLiveEditor();
                }
            }
        } catch (err) {
            console.warn("[Station 46] Could not sync remote text edits:", err);
        }
    }

    // Strip third-party widget branding from DOM
    function removeWidgetBranding() {
        const brandingSelectors = [
            'a[href*="powr.io"]',
            '[class*="powrBranding"]',
            '[class*="powr-branding"]',
            '[id*="powrBranding"]',
            '.powr-badge'
        ];
        brandingSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                try { el.remove(); } catch(e) {}
            });
        });
    }
    setInterval(removeWidgetBranding, 800);

    syncFromRemoteDatabase();
    setupAdminWelcomeHeading();
});

// ==========================================================================
// Blueprint Lightbox Modal Logic
// ==========================================================================
const blueprintData = [
    {
        thumb: 'blueprint-1.jpg',
        full: 'blueprint-p1.png',
        title: 'Sheet 1: Exterior Elevations & General Layout',
        desc: 'SVI Fire & Rescue Trucks • Kenworth T880 2-Door Chassis • 24\' Stainless Steel Body • 40\' 4½" OAL, 11\' 9½" OAH, 8\' 4" OAW • Tandem Rear Axles'
    },
    {
        thumb: 'blueprint-2.jpg',
        full: 'blueprint-p2.png',
        title: 'Sheet 2: Exterior Compartmentation & Equipment Trays',
        desc: '1,000# slide-out trays, 400# trays, 28" adjustable shelving, 140\' 2½" preconnect hose bed, dual 12V / 120-240V power management panels'
    },
    {
        thumb: 'blueprint-3.jpg',
        full: 'blueprint-p3.png',
        title: 'Sheet 3: Walk-In Interior & Upper Body Structure',
        desc: 'Interior walk-in command & crew area, 80¼" ceiling clearance, custom interior cabinetry and rear entry access'
    }
];

let currentBlueprintIndex = 0;

window.openBlueprintModal = function(index) {
    currentBlueprintIndex = index;
    window.updateBlueprintModal();
    const modal = document.getElementById('blueprint-modal');
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
};

window.closeBlueprintModal = function() {
    const modal = document.getElementById('blueprint-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
};

window.changeBlueprint = function(dir) {
    currentBlueprintIndex = (currentBlueprintIndex + dir + blueprintData.length) % blueprintData.length;
    window.updateBlueprintModal();
};

window.updateBlueprintModal = function() {
    const data = blueprintData[currentBlueprintIndex];
    if (!data) return;
    const img = document.getElementById('blueprint-modal-img');
    const title = document.getElementById('blueprint-modal-title');
    const desc = document.getElementById('blueprint-modal-desc');
    const fullLink = document.getElementById('blueprint-modal-full');
    
    if (img) {
        img.src = data.full;
        img.alt = data.title;
    }
    if (title) title.textContent = data.title;
    if (desc) desc.textContent = data.desc;
    if (fullLink) fullLink.href = data.full;
};

window.handleBlueprintBackdropClick = function(e) {
    if (e.target.id === 'blueprint-modal' || e.target.classList.contains('blueprint-modal-body')) {
        window.closeBlueprintModal();
    }
};

document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('blueprint-modal');
    if (modal && modal.classList.contains('active')) {
        if (e.key === 'Escape') window.closeBlueprintModal();
        if (e.key === 'ArrowLeft') window.changeBlueprint(-1);
        if (e.key === 'ArrowRight') window.changeBlueprint(1);
    }
});

// ==========================================================================
// Interactive Apparatus Lightbox & Technical Specs Modal Logic
// ==========================================================================
(function initApparatusModalSystem() {
    let apparatusList = [];
    let currentApparatusIndex = 0;
    let modalEl = null;

    function getOrCreateApparatusModal() {
        if (modalEl) return modalEl;
        modalEl = document.getElementById('apparatus-modal');
        if (modalEl) return modalEl;

        modalEl = document.createElement('div');
        modalEl.id = 'apparatus-modal';
        modalEl.className = 'apparatus-modal-backdrop';
        modalEl.setAttribute('role', 'dialog');
        modalEl.setAttribute('aria-modal', 'true');
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.innerHTML = `
            <div class="apparatus-modal-content">
                <button type="button" class="apparatus-modal-close" id="apparatus-modal-close" aria-label="Close dialog" title="Close (Esc)">✕</button>
                <button type="button" class="apparatus-modal-nav prev" id="apparatus-modal-prev" aria-label="Previous apparatus" title="Previous (Left Arrow)">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button type="button" class="apparatus-modal-nav next" id="apparatus-modal-next" aria-label="Next apparatus" title="Next (Right Arrow)">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                <div class="apparatus-modal-img-wrapper">
                    <img id="apparatus-modal-img" src="" alt="Apparatus photo">
                </div>
                <div class="apparatus-modal-details">
                    <div class="apparatus-modal-header">
                        <div>
                            <span class="apparatus-modal-badge" id="apparatus-modal-badge">STATION 46 APPARATUS</span>
                            <h3 class="apparatus-modal-title" id="apparatus-modal-title">Apparatus Name</h3>
                        </div>
                    </div>
                    <div>
                        <h4 class="apparatus-modal-specs-title">Technical Specifications & Equipment</h4>
                        <ul class="apparatus-modal-specs-list" id="apparatus-modal-specs"></ul>
                    </div>
                    <div class="apparatus-modal-footer-bar">
                        <span class="apparatus-modal-counter" id="apparatus-modal-counter">1 of 8</span>
                        <a id="apparatus-modal-full" href="#" target="_blank" class="apparatus-modal-full-btn" title="Open full-resolution photo in new tab">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            <span>View Full Resolution</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalEl);

        // Backdrop click to close
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) closeApparatusModal();
        });

        // Close button
        const closeBtn = modalEl.querySelector('#apparatus-modal-close');
        if (closeBtn) closeBtn.addEventListener('click', closeApparatusModal);

        // Prev & Next buttons
        const prevBtn = modalEl.querySelector('#apparatus-modal-prev');
        const nextBtn = modalEl.querySelector('#apparatus-modal-next');
        if (prevBtn) prevBtn.addEventListener('click', () => changeApparatus(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => changeApparatus(1));

        return modalEl;
    }

    function extractApparatusFromCards() {
        const activeSection = document.getElementById('active-fleet');
        const retiredSection = document.getElementById('retired-fleet');
        const cards = Array.from(document.querySelectorAll('#active-fleet .card, #retired-fleet .card, .cards-grid .card'));
        
        apparatusList = [];
        cards.forEach((card, index) => {
            const h3 = card.querySelector('h3');
            const title = h3 ? h3.textContent.trim() : 'Apparatus';
            
            // Extract image URL from placeholder background-image
            const placeholder = card.querySelector('.card-img-placeholder');
            let imgSrc = '';
            if (placeholder) {
                const bg = window.getComputedStyle(placeholder).backgroundImage || '';
                const match = bg.match(/url\(["']?([^"']+)["']?\)/i);
                if (match && match[1]) {
                    imgSrc = match[1];
                }
            }

            // Extract specs
            const specItems = Array.from(card.querySelectorAll('.tech-specs li')).map(li => li.innerHTML.trim());
            const isRetired = card.closest('#retired-fleet') !== null;
            const badge = isRetired ? 'RETIRED FLEET' : 'ACTIVE FLEET';

            apparatusList.push({
                index,
                title,
                imgSrc,
                badge,
                specs: specItems
            });

            card.setAttribute('data-apparatus-index', index);

            // Attach card click listener
            if (!card.dataset.modalBound) {
                card.dataset.modalBound = 'true';
                card.setAttribute('tabindex', '0');
                card.setAttribute('role', 'button');
                card.setAttribute('aria-label', `View photo and specs for ${title}`);
                
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.apparatus-card-remove-btn, .apparatus-card-admin-header, .apparatus-card-drag-handle, .apparatus-move-btn, .apparatus-img-upload-btn, .apparatus-img-upload-overlay')) return;
                    // Avoid opening when admin inline editing is active
                    if (document.body.classList.contains('admin-edit-mode') || e.target.isContentEditable || e.target.closest('[contenteditable="true"]')) {
                        return;
                    }
                    const dynamicIdx = parseInt(card.getAttribute('data-apparatus-index'), 10);
                    openApparatusModal(isNaN(dynamicIdx) ? 0 : dynamicIdx);
                });

                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        if (e.target.closest('.apparatus-card-remove-btn, .apparatus-card-admin-header, .apparatus-card-drag-handle, .apparatus-move-btn, .apparatus-img-upload-btn, .apparatus-img-upload-overlay')) return;
                        if (document.body.classList.contains('admin-edit-mode') || e.target.isContentEditable || e.target.closest('[contenteditable="true"]')) return;
                        e.preventDefault();
                        const dynamicIdx = parseInt(card.getAttribute('data-apparatus-index'), 10);
                        openApparatusModal(isNaN(dynamicIdx) ? 0 : dynamicIdx);
                    }
                });
            }
        });
    }

    function openApparatusModal(index) {
        if (!apparatusList.length) extractApparatusFromCards();
        if (index < 0 || index >= apparatusList.length) return;
        currentApparatusIndex = index;
        updateApparatusModalUI();
        const modal = getOrCreateApparatusModal();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeApparatusModal() {
        const modal = document.getElementById('apparatus-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    function changeApparatus(dir) {
        if (!apparatusList.length) return;
        currentApparatusIndex = (currentApparatusIndex + dir + apparatusList.length) % apparatusList.length;
        updateApparatusModalUI();
    }

    function updateApparatusModalUI() {
        const item = apparatusList[currentApparatusIndex];
        if (!item) return;

        const modal = getOrCreateApparatusModal();
        const imgEl = modal.querySelector('#apparatus-modal-img');
        const titleEl = modal.querySelector('#apparatus-modal-title');
        const badgeEl = modal.querySelector('#apparatus-modal-badge');
        const specsListEl = modal.querySelector('#apparatus-modal-specs');
        const fullLinkEl = modal.querySelector('#apparatus-modal-full');
        const counterEl = modal.querySelector('#apparatus-modal-counter');

        if (imgEl) {
            imgEl.style.opacity = '0.3';
            imgEl.src = item.imgSrc;
            imgEl.alt = `${item.title} photo`;
            imgEl.onload = () => { imgEl.style.opacity = '1'; };
        }
        if (titleEl) titleEl.textContent = item.title;
        if (badgeEl) badgeEl.textContent = item.badge;
        if (fullLinkEl) fullLinkEl.href = item.imgSrc;
        if (counterEl) counterEl.textContent = `${currentApparatusIndex + 1} of ${apparatusList.length}`;

        if (specsListEl) {
            specsListEl.innerHTML = '';
            item.specs.forEach(spec => {
                const li = document.createElement('li');
                li.innerHTML = spec;
                specsListEl.appendChild(li);
            });
        }
    }

    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('apparatus-modal');
        if (modal && modal.classList.contains('active')) {
            if (e.key === 'Escape') closeApparatusModal();
            if (e.key === 'ArrowLeft') changeApparatus(-1);
            if (e.key === 'ArrowRight') changeApparatus(1);
        }
    });

    window.refreshApparatusModalList = extractApparatusFromCards;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', extractApparatusFromCards);
    } else {
        extractApparatusFromCards();
    }
})();

/* ==========================================================================
   Station 46 Inclement Weather & Storm Mode System
   National Weather Service (NWS) API Integration (Somerset County NJZ010 / Station 46)
   ========================================================================== */

(function initStation46WeatherMode() {
    const NWS_CONFIG = {
        zone: 'NJZ010', // Somerset County, NJ
        point: '40.418,-74.708', // Station 46, Skillman, NJ
        forecastGrid: 'PHI/62,102',
        cacheKey: 'station46_nws_weather_cache',
        cacheTtlMs: 10 * 60 * 1000, // 10 minutes cache
        overrideKey: 'station46_storm_override',
        noticeKey: 'station46_storm_custom_notice',
        dismissKey: 'station46_storm_dismiss_timestamp',
        globalConfigKey: 'station46_global_storm_mode',
        remoteConfigPath: 'data/storm_mode.json'
    };

    // Pre-defined scenario content for community instructions
    const SCENARIOS = {
        flood: {
            id: 'flood',
            tabName: 'Flooding & Flash Floods',
            title: 'Flash Floods & Rising Water Safety',
            desc: 'Skillman and Montgomery Township feature several low-lying river and stream basins—particularly Bedens Brook, the Millstone River, and Pike Run. Flash flooding can develop rapidly during heavy rainfall.',
            dos: [
                '<strong>Turn Around, Don\'t Drown:</strong> Never drive through flooded roads. 6 inches of rushing water can stall cars or knock down adults; 12 inches can sweep away small SUVs.',
                '<strong>Move to Higher Ground:</strong> If rising water approaches your house, safely relocate to an upper floor. Bring phones, chargers, and flashlights.',
                '<strong>Shut off Utilities if Instructed:</strong> If you can do so safely before water reaches the basement, shut off the main electrical breaker.',
                '<strong>Monitor Local Road Closures:</strong> Check Montgomery Township Police and Somerset County alerts for road closures on Route 518, River Rd, and Griggstown causeway.'
            ],
            donts: [
                '<strong>Never drive around police road closed barricades.</strong> Barricades are placed because roads or bridge approaches are washed out or underwater.',
                '<strong>Do NOT enter a flooded basement with standing water</strong> if electricity is still on or outlets/appliances are submerged. Severe electrocution hazard!',
                '<strong>Never walk or swim in floodwater:</strong> Hidden open manholes, swift underwater currents, bacteria, and fallen power lines pose fatal threats.',
                '<strong>Do not park vehicles near stream banks</strong> or drainage culverts when flood watches are active.'
            ],
            localTip: '<strong>Montgomery High-Risk Flood Spots:</strong> Watch for sudden pooling on Route 518 near Bedens Brook, Belle Mead-Blawenburg Rd, River Rd near Millstone River, and Dead Tree Run Rd.'
        },
        tornado: {
            id: 'tornado',
            tabName: 'Tornadoes & High Winds',
            title: 'Tornado Warning & Damaging Wind Action',
            desc: 'Severe supercells can produce destructive straight-line winds (microbursts) or tornadoes in Central New Jersey. When a Tornado Warning is issued, you have only minutes to take shelter.',
            dos: [
                '<strong>Go to the Lowest Level:</strong> The safest place is a basement. If no basement exists, seek shelter in an interior hallway, bathroom, or closet on the ground floor.',
                '<strong>Put as Many Walls Between You and the Outside:</strong> Stay away from all windows, skylights, and exterior doors.',
                '<strong>Protect Your Head and Neck:</strong> Use thick blankets, pillows, mattresses, or bicycle/sports helmets to cushion against flying debris.',
                '<strong>Bring Pets on Leashes / in Carriers:</strong> Secure household pets in the shelter room before the storm hits.'
            ],
            donts: [
                '<strong>Do NOT open windows:</strong> Opening windows to "equalize pressure" is a dangerous myth that lets damaging wind inside your home.',
                '<strong>Never stay inside a vehicle, trailer, or shed:</strong> Automobiles and temporary outbuildings offer zero protection in tornadic winds. Seek sturdy building shelter immediately.',
                '<strong>Avoid rooms with large wide-span roofs</strong> like garages, school gymnasiums, or commercial barns.'
            ],
            localTip: '<strong>Immediate Action:</strong> If Montgomery Township outdoor sirens sound or your phone receives a WEA Tornado Warning, stop what you are doing and take shelter underground or in an interior room immediately.'
        },
        wires: {
            id: 'wires',
            tabName: 'Downed Wires & Trees',
            title: 'Downed Power Lines & Fallen Trees',
            desc: 'High winds, saturated soil, and heavy ice frequently topple mature trees across roadways and power lines in Somerset County. Fallen lines can remain energized and deadly.',
            dos: [
                '<strong>Always Assume Every Downed Wire is Energized:</strong> Power lines can look like harmless telephone or cable wires. Treat ALL lines as high-voltage and lethal.',
                '<strong>Keep a Minimum 30-Foot Perimeter:</strong> Stay at least 30 feet away (two full car lengths). Electricity can arc across ground, puddle water, and chain-link fences.',
                '<strong>If a Wire Falls on Your Vehicle:</strong> STAY INSIDE THE VEHICLE. Honk your horn, call 911, and wait for firefighters and utility crews to de-energize the line.',
                '<strong>Call 911 to Report Live Arcing Wires</strong>, and notify PSE&G (1-800-436-7734) or JCP&L (1-888-544-4877).'
            ],
            donts: [
                '<strong>Never attempt to touch or move branches</strong> that are resting on or near wires—wood conducts electricity when wet or at high voltages.',
                '<strong>Do not drive over downed wires:</strong> Tires can snag lines, pulling live poles and transformers down onto your vehicle.',
                '<strong>If your car is on fire and you MUST escape:</strong> Jump clear without touching the car and the ground at the same time. Land on both feet together and bunny-hop away.'
            ],
            localTip: '<strong>Utility Providers:</strong> Montgomery Township is served by PSE&G (Eastern/Central) and JCP&L (Western). Report outages to your utility first so restoration tickets are opened.'
        },
        thunderstorm: {
            id: 'thunderstorm',
            tabName: 'Severe Thunderstorms',
            title: 'Severe Thunderstorms, Lightning & Hail',
            desc: 'Severe thunderstorm watches and warnings indicate winds over 58 mph, dangerous cloud-to-ground lightning, and hail that can shatter windshields and damage property.',
            dos: [
                '<strong>"When Thunder Roars, Go Indoors":</strong> If you hear thunder, lightning is close enough to strike you. Safe shelter means an enclosed, substantial building.',
                '<strong>Unplug Expensive Electronics:</strong> Before the storm reaches your street, disconnect computers, televisions, and charging devices to prevent surge damage.',
                '<strong>Secure Outdoor Furniture:</strong> Patio umbrellas, trampolines, and trash cans must be brought indoors or tied down securely.',
                '<strong>Wait 30 Minutes After the Last Thunderclap</strong> before resuming outdoor activities or swimming.'
            ],
            donts: [
                '<strong>Never seek shelter under tall, isolated trees</strong>, picnic pavilions, baseball dugouts, or metal canopies.',
                '<strong>Avoid running water or plumbing:</strong> Do not shower, wash dishes, or handle corded landlines during active electrical storms; lightning travels through pipes.',
                '<strong>Do not leave pets outdoors:</strong> Dogs and cats frequently bolt when frightened by lightning and hail.'
            ],
            localTip: '<strong>Lightning Safety:</strong> Lightning can strike up to 10 miles away from where it is raining ("bolt from the blue"). Seek shelter as soon as dark storm clouds build.'
        },
        winter: {
            id: 'winter',
            tabName: 'Winter Weather & Ice',
            title: 'Blizzards, Snow & Freezing Rain',
            desc: 'Northeasters and winter ice storms bring heavy snow, sub-freezing temperatures, hazardous ice-coated roads, and potential multi-day power loss.',
            dos: [
                '<strong>Prevent Frozen & Burst Pipes:</strong> Let faucets drip slightly during severe sub-zero cold spells and keep under-sink cabinet doors open to warm air.',
                '<strong>Keep Fire Hydrants Clear:</strong> If you have a hydrant near your property, please shovel a 3-foot perimeter around it. This saves vital seconds for Station 46 crews.',
                '<strong>Stock Warm Essentials:</strong> Keep flashlights, extra warm blankets, rock salt, batteries, and non-perishable canned food ready.',
                '<strong>Check on Seniors and Neighbors:</strong> Verify vulnerable community members have working heat and adequate supplies.'
            ],
            donts: [
                '<strong>NEVER heat your home with a gas stove</strong>, oven, or outdoor charcoal grill. Deadly carbon monoxide builds up quickly.',
                '<strong>Avoid overexertion while shoveling:</strong> Cold weather constricts blood vessels while heavy snow increases cardiac strain. Take frequent breaks.',
                '<strong>Do not drive during active plowing operations</strong> unless in a dire emergency. Give snowplows and emergency apparatus at least 150 feet of following distance.'
            ],
            localTip: '<strong>Freezing Rain Danger:</strong> Even a quarter-inch of ice accretion weighs down tree limbs and snaps electrical wires throughout Somerset County.'
        },
        generator: {
            id: 'generator',
            tabName: 'Generator & CO Safety',
            title: 'Power Outages, Generator & Carbon Monoxide',
            desc: 'During power outages, improper use of portable generators and secondary heating sources is the leading cause of fatal carbon monoxide (CO) poisonings and structure fires.',
            dos: [
                '<strong>The 20-Foot Rule:</strong> Always operate portable generators OUTDOORS only, placed at least 20 feet away from any door, window, or air vent.',
                '<strong>Point the Exhaust Away:</strong> Ensure generator exhaust points away from your house and neighboring properties.',
                '<strong>Test Carbon Monoxide Alarms:</strong> Verify working CO alarms are installed on every floor and outside every bedroom.',
                '<strong>Food Safety:</strong> Keep refrigerator and freezer doors shut. An unopened refrigerator keeps food safe for 4 hours; a full freezer preserves food for 48 hours.'
            ],
            donts: [
                '<strong>NEVER run a generator inside a home, basement, crawlspace, or garage</strong>—even with doors or windows open! Carbon monoxide is invisible, odorless, and lethal within minutes.',
                '<strong>Never plug a generator into a regular wall outlet ("backfeeding"):</strong> This bypasses home circuit breakers and energizes power lines outside, which can electrocute utility linemen.',
                '<strong>Never refuel a hot generator:</strong> Turn the generator off and allow the engine to cool for at least 15 minutes before pouring gasoline to prevent vapor explosions.'
            ],
            localTip: '<strong>CO Poisoning Symptoms:</strong> Dizziness, headache, nausea, confusion, and shortness of breath. If your CO detector sounds, EVACUATE immediately and call 911 from outside.'
        },
        call911: {
            id: 'call911',
            tabName: 'When to Call 911',
            title: 'Emergency 911 vs. Non-Emergency Guidance',
            desc: 'During severe weather, dispatch centers experience high call volumes. Following this guidance helps Station 46 firefighters and first responders respond rapidly to life threats.',
            dos: [
                '<strong>DIAL 911 IMMEDIATELY FOR:</strong><br>• Life-threatening medical emergencies<br>• Structural fires, smoke, or flames<br>• Downed wires arcing, smoking, or sparking<br>• Motorists trapped in floodwaters<br>• Tree limbs that have collapsed into living spaces<br>• Odor of natural gas or sound of screaming Carbon Monoxide alarms',
                '<strong>CALL NON-EMERGENCY FOR:</strong><br>• Minor basement seepage with NO electrical danger: Call a licensed plumber<br>• Normal utility outage report: Call PSE&G or JCP&L directly<br>• Station 46 Non-Emergency questions: <strong>(609) 466-3926</strong><br>• Montgomery Police Non-Emergency: <strong>(908) 359-3222</strong>'
            ],
            donts: [
                '<strong>Do NOT call 911 to ask when your power or internet will be restored.</strong> Dispatchers do not have utility restoration schedules.',
                '<strong>Do not call 911 for general weather updates.</strong> Monitor National Weather Service or local news broadcasts instead.',
                '<strong>Do not hang up if you accidentally call 911.</strong> Stay on the line to confirm to the operator that you are safe so units aren\'t dispatched needlessly.'
            ],
            localTip: '<strong>Montgomery Emergency Dispatch:</strong> In an emergency, dial 911. If calling from a cell phone near township borders, clearly state you are in Montgomery Township, Somerset County.'
        }
    };

    // Simulation / Testing Presets
    const SIM_PRESETS = {
        tornado: {
            level: 'warning',
            event: 'Tornado Warning',
            headline: 'NWS Mount Holly: Tornado Warning for Somerset County including Montgomery Twp',
            description: 'The National Weather Service in Mount Holly has issued a Tornado Warning for Somerset County. Severe supercell thunderstorms capable of producing a tornado and quarter size hail are located near Skillman.',
            instruction: 'TAKE SHELTER NOW! Move to a basement or an interior room on the lowest floor of a sturdy building. Avoid windows. If in an automobile or outdoors, move to the closest substantial shelter.',
            expires: 'Expires in 45 minutes',
            activeScenario: 'tornado',
            temp: '74°F',
            winds: 'Gusts to 70 mph',
            radar: 'KDIX Mount Holly Radar Active'
        },
        flood: {
            level: 'watch',
            event: 'Flood Watch / Flash Flood Warning',
            headline: 'NWS Mount Holly: Flood Watch in Effect for Bedens Brook & Millstone Basins',
            description: 'Flooding caused by excessive rainfall is possible. Flash flooding of rivers, creeks, streams, and other low-lying and flood-prone locations is imminent or occurring across southern Somerset County.',
            instruction: 'Monitor local forecasts and be prepared to take action should Flash Flood Warnings be issued. Turn Around, Don\'t Drown. Avoid low spots on Route 518 and River Road.',
            expires: 'In effect until tomorrow 6:00 AM',
            activeScenario: 'flood',
            temp: '66°F',
            winds: 'NE 20 mph with heavy rain',
            radar: 'High precipitation core over Skillman'
        },
        thunderstorm: {
            level: 'watch',
            event: 'Severe Thunderstorm Watch',
            headline: 'NWS Storm Prediction Center: Severe Thunderstorm Watch #412 for Central New Jersey',
            description: 'Severe thunderstorms with damaging wind gusts to 65 mph, large hail, and frequent cloud-to-ground lightning are expected across Somerset County through this evening.',
            instruction: 'Persons in these areas should be on the lookout for threatening weather conditions and listen for later statements and possible warnings. Secure loose outdoor items.',
            expires: 'In effect until 10:00 PM EDT',
            activeScenario: 'thunderstorm',
            temp: '78°F',
            winds: 'W 25 mph, gusts to 60 mph',
            radar: 'Scattered squall line approaching'
        },
        winter: {
            level: 'watch',
            event: 'Winter Storm Watch',
            headline: 'NWS Mount Holly: Winter Storm & Freezing Rain Watch for Somerset County',
            description: 'Heavy snow and ice accumulation expected. Total snow accumulations of 6 to 10 inches and ice accretion up to one-tenth of an inch. Travel will become treacherous.',
            instruction: 'Prepare for hazardous road conditions and potential tree limb and power line outages. Ensure generator exhaust is kept 20ft outdoors and faucets are dripped to avoid pipe freeze.',
            expires: 'In effect tomorrow morning through Friday',
            activeScenario: 'winter',
            temp: '28°F',
            winds: 'NNE 20 mph, gusts to 35 mph',
            radar: 'Winter precipitation shield advancing'
        },
        wires: {
            level: 'advisory',
            event: 'High Wind Warning & Downed Wire Advisory',
            headline: 'NWS Mount Holly: High Wind Warning with Sustained 30-40 MPH & Gusts to 60 MPH',
            description: 'Damaging winds will blow down trees and power lines. Widespread power outages are expected across Montgomery, Belle Mead, and Rocky Hill.',
            instruction: 'Treat all fallen wires as live and dangerous. Keep at least 30 feet back. Report downed wires immediately to 911 and utility companies.',
            expires: 'In effect until 8:00 PM EDT',
            activeScenario: 'wires',
            temp: '58°F',
            winds: 'NW 35 mph, gusts to 60 mph',
            radar: 'Fast-moving dry cold front'
        },
        upcoming: {
            level: 'upcoming',
            event: 'Inclement Storm Expected in Forecast',
            headline: 'NWS Forecast: Strong to Severe Thunderstorms Approaching Skillman This Evening',
            description: 'The National Weather Service forecast predicts strong thunderstorms developing between 4 PM and 9 PM, bringing locally heavy rainfall, gusty winds, and localized lightning.',
            instruction: 'Review your storm safety plan. Make sure mobile devices are fully charged and loose outdoor patio items are secured before rain begins.',
            expires: 'Expected onset: 4:30 PM EDT',
            activeScenario: 'thunderstorm',
            temp: '72°F',
            winds: 'Increasing to 15-25 mph',
            radar: 'Storm cells developing west of Delaware River'
        }
    };

    let weatherState = {
        isActive: false,
        level: 'watch', // warning, watch, advisory, upcoming
        event: '',
        headline: '',
        description: '',
        instruction: '',
        expires: '',
        activeScenario: 'flood',
        temp: '',
        winds: '',
        radar: '',
        isSimulated: false,
        stationNotice: ''
    };

    // Helper: Determine scenario key from text
    function detectScenarioKey(text) {
        const lower = (text || '').toLowerCase();
        if (lower.includes('tornado')) return 'tornado';
        if (lower.includes('flood') || lower.includes('water') || lower.includes('rain')) return 'flood';
        if (lower.includes('wind') || lower.includes('wire') || lower.includes('power')) return 'wires';
        if (lower.includes('winter') || lower.includes('snow') || lower.includes('blizzard') || lower.includes('ice')) return 'winter';
        if (lower.includes('thunder') || lower.includes('lightning') || lower.includes('hail')) return 'thunderstorm';
        return 'flood';
    }

    // Helper: Read global admin storm mode configuration (from localStorage & synced file data/storm_mode.json)
    async function getGlobalStormConfig() {
        let localConfig = null;
        try {
            const raw = localStorage.getItem(NWS_CONFIG.globalConfigKey);
            if (raw) localConfig = JSON.parse(raw);
        } catch (e) {}

        try {
            let remoteConfig = null;
            if (window.fetchRemoteData) {
                remoteConfig = await window.fetchRemoteData(NWS_CONFIG.remoteConfigPath);
            } else {
                const res = await fetch(`${NWS_CONFIG.remoteConfigPath}?t=${Date.now()}`, { cache: 'no-store' });
                if (res.ok) remoteConfig = await res.json();
            }
            if (remoteConfig && typeof remoteConfig === 'object' && remoteConfig.status) {
                const remoteTime = remoteConfig.updatedAt ? new Date(remoteConfig.updatedAt).getTime() : 0;
                const localTime = (localConfig && localConfig.updatedAt) ? new Date(localConfig.updatedAt).getTime() : 0;

                // Remote must be strictly newer by at least 2000ms to override local changes
                if (!localConfig || (remoteTime > localTime + 2000)) {
                    localConfig = remoteConfig;
                    try { localStorage.setItem(NWS_CONFIG.globalConfigKey, JSON.stringify(remoteConfig)); } catch (e) {}
                }
            }
        } catch (e) {}

        return localConfig || { status: 'force_active', scenario: 'flood', customTitle: '', customNotice: '' };
    }

    // Helper: Fetch NWS live alerts and forecast with cache
    async function fetchNWSData() {
        // Check cache
        try {
            const cached = sessionStorage.getItem(NWS_CONFIG.cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < NWS_CONFIG.cacheTtlMs) {
                    return parsed.data;
                }
            }
        } catch (e) {}

        // Live fetch from api.weather.gov
        try {
            const headers = { 'Accept': 'application/geo+json' };
            
            // 1. Fetch active alerts for Somerset County (NJZ010)
            const alertsUrl = `https://api.weather.gov/alerts/active?zone=${NWS_CONFIG.zone}`;
            const alertsPromise = fetch(alertsUrl, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);

            // 2. Fetch forecast for PHI/62,102
            const forecastUrl = `https://api.weather.gov/gridpoints/${NWS_CONFIG.forecastGrid}/forecast`;
            const forecastPromise = fetch(forecastUrl, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);

            const [alertsData, forecastData] = await Promise.all([alertsPromise, forecastPromise]);

            const result = {
                alerts: alertsData?.features || [],
                periods: forecastData?.properties?.periods || [],
                timestamp: Date.now()
            };

            try {
                sessionStorage.setItem(NWS_CONFIG.cacheKey, JSON.stringify({ timestamp: Date.now(), data: result }));
            } catch (e) {}

            return result;
        } catch (err) {
            console.warn('[Station 46 Weather] Live NWS fetch error, using default calm state:', err);
            return { alerts: [], periods: [] };
        }
    }

    let weatherEvalCounter = 0;

    // Evaluate live, admin-activated, or simulated data into weatherState
    async function evaluateWeather() {
        const currentEval = ++weatherEvalCounter;

        // 1. Check for URL query simulation first: ?storm_mode=tornado, ?storm_mode=flood, etc.
        let queryMode = null;
        try {
            if (typeof URLSearchParams !== 'undefined' && window.location && window.location.search) {
                const urlParams = new URLSearchParams(window.location.search);
                queryMode = urlParams.get('storm_mode');
            } else if (window.location && window.location.search) {
                const match = window.location.search.match(/[?&]storm_mode=([^&]+)/);
                if (match) queryMode = decodeURIComponent(match[1]);
            }
        } catch (e) {}

        if (queryMode) {
            if (currentEval !== weatherEvalCounter) return;
            if (queryMode === 'clear' || queryMode === 'off') {
                weatherState.isActive = false;
                return;
            }
            if (SIM_PRESETS[queryMode]) {
                const preset = SIM_PRESETS[queryMode];
                weatherState = {
                    isActive: true,
                    level: preset.level,
                    event: preset.event,
                    headline: preset.headline,
                    description: preset.description,
                    instruction: preset.instruction,
                    expires: preset.expires,
                    activeScenario: preset.activeScenario,
                    temp: preset.temp,
                    winds: preset.winds,
                    radar: preset.radar,
                    isSimulated: true,
                    stationNotice: ''
                };
                loadCustomStationNotice();
                return;
            }
        }

        // 2. Check Global Admin Activation FIRST (before local simulator override or live NWS)
        const globalConfig = await getGlobalStormConfig();
        if (currentEval !== weatherEvalCounter) return;

        if (globalConfig && globalConfig.status === 'force_active') {
            const scKey = globalConfig.scenario || 'flood';
            const preset = SIM_PRESETS[scKey] || SIM_PRESETS.flood;
            const title = (globalConfig.customTitle && globalConfig.customTitle.trim()) ? globalConfig.customTitle.trim() : preset.headline;
            const notice = (globalConfig.customNotice && globalConfig.customNotice.trim()) ? globalConfig.customNotice.trim() : '';

            weatherState = {
                isActive: true,
                level: preset.level || 'watch',
                event: preset.event,
                headline: title,
                description: preset.description,
                instruction: preset.instruction,
                expires: 'Emergency Alert Issued by Montgomery Township Volunteer Fire Company #2',
                activeScenario: scKey,
                temp: preset.temp || 'Active Alert',
                winds: preset.winds || 'Hazardous',
                radar: preset.radar || 'Mount Holly KDIX Doppler Active',
                isSimulated: false,
                isGlobalForced: true,
                stationNotice: notice
            };
            return;
        } else if (globalConfig && globalConfig.status === 'force_inactive') {
            weatherState.isActive = false;
            return;
        }

        // 3. Check for local simulation override set by tester in modal simulator
        try {
            const storedOverride = localStorage.getItem(NWS_CONFIG.overrideKey);
            if (storedOverride) {
                if (storedOverride === 'clear') {
                    weatherState.isActive = false;
                    return;
                }
                if (SIM_PRESETS[storedOverride]) {
                    const preset = SIM_PRESETS[storedOverride];
                    weatherState = {
                        isActive: true,
                        level: preset.level,
                        event: preset.event,
                        headline: preset.headline,
                        description: preset.description,
                        instruction: preset.instruction,
                        expires: preset.expires,
                        activeScenario: preset.activeScenario,
                        temp: preset.temp,
                        winds: preset.winds,
                        radar: preset.radar,
                        isSimulated: true,
                        stationNotice: ''
                    };
                    loadCustomStationNotice();
                    return;
                }
            }
        } catch (e) {}

        // 4. Otherwise Auto Mode: Proceed with Live NWS API Check
        const raw = await fetchNWSData();
        if (currentEval !== weatherEvalCounter) return;

        // Live evaluation
        const alerts = raw?.alerts || [];
        const periods = raw?.periods || [];

        // Check active watches / warnings
        if (alerts.length > 0) {
            // Find most severe alert
            let topAlert = null;
            let highestSeverity = 0;

            alerts.forEach(feat => {
                const props = feat.properties || {};
                const eventName = (props.event || '').toLowerCase();
                // Filter out test messages
                if (eventName.includes('test') || props.status === 'Test') return;

                let score = 1;
                if (eventName.includes('warning')) score = 3;
                else if (eventName.includes('watch')) score = 2;
                else if (eventName.includes('advisory')) score = 1.5;

                if (score > highestSeverity) {
                    highestSeverity = score;
                    topAlert = props;
                }
            });

            if (topAlert) {
                let lvl = 'advisory';
                if (highestSeverity >= 3) lvl = 'warning';
                else if (highestSeverity >= 2) lvl = 'watch';

                const expiresDate = topAlert.expires ? new Date(topAlert.expires).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Until further notice';

                weatherState = {
                    isActive: true,
                    level: lvl,
                    event: topAlert.event || 'Severe Weather Alert',
                    headline: topAlert.headline || topAlert.event,
                    description: topAlert.description || 'Active alert issued by the National Weather Service.',
                    instruction: topAlert.instruction || 'Follow guidance from local Montgomery Township emergency management officials.',
                    expires: `Expires around ${expiresDate}`,
                    activeScenario: detectScenarioKey(topAlert.event + ' ' + (topAlert.description || '')),
                    temp: periods[0] ? `${periods[0].temperature}°${periods[0].temperatureUnit}` : '',
                    winds: periods[0] ? `${periods[0].windSpeed} ${periods[0].windDirection}` : '',
                    radar: 'NWS KDIX Mount Holly Radar',
                    isSimulated: false,
                    stationNotice: ''
                };
                loadCustomStationNotice();
                return;
            }
        }

        // If no active watch/warning, inspect upcoming forecast for storms
        if (periods.length > 0) {
            // Check next 2 periods (today & tonight or next 24-36h)
            const stormKeywords = ['thunderstorm', 'severe', 'tornado', 'flood', 'blizzard', 'heavy rain', 'damaging wind', 'hail', 'tropical storm'];
            let upcomingStormPeriod = null;

            for (let i = 0; i < Math.min(periods.length, 3); i++) {
                const p = periods[i];
                const text = ((p.shortForecast || '') + ' ' + (p.detailedForecast || '')).toLowerCase();
                const hasStorm = stormKeywords.some(kw => text.includes(kw));
                if (hasStorm) {
                    upcomingStormPeriod = p;
                    break;
                }
            }

            if (upcomingStormPeriod) {
                weatherState = {
                    isActive: true,
                    level: 'upcoming',
                    event: `${upcomingStormPeriod.name}: Storm in Forecast`,
                    headline: `Upcoming Storm Alert for Skillman / Montgomery: ${upcomingStormPeriod.shortForecast}`,
                    description: upcomingStormPeriod.detailedForecast || 'The National Weather Service forecast indicates storm conditions approaching our area.',
                    instruction: 'Stay alert to weather changes. Secure loose outdoor furniture and review family storm emergency plans.',
                    expires: `Forecast for ${upcomingStormPeriod.name}`,
                    activeScenario: detectScenarioKey(upcomingStormPeriod.shortForecast + ' ' + upcomingStormPeriod.detailedForecast),
                    temp: `${upcomingStormPeriod.temperature}°${upcomingStormPeriod.temperatureUnit}`,
                    winds: `${upcomingStormPeriod.windSpeed} ${upcomingStormPeriod.windDirection}`,
                    radar: 'NWS KDIX Mount Holly Radar',
                    isSimulated: false,
                    stationNotice: ''
                };
                loadCustomStationNotice();
                return;
            }
        }

        // Otherwise calm/clear
        weatherState.isActive = false;
        loadCustomStationNotice();
    }

    function loadCustomStationNotice() {
        try {
            const notice = localStorage.getItem(NWS_CONFIG.noticeKey);
            if (notice && notice.trim()) {
                weatherState.stationNotice = notice.trim();
            }
        } catch (e) {}
    }

    // Render Emergency Alert Banner at Top of Page (In-place updates to prevent screen jitter/flashing)
    function renderStormBanner() {
        let banner = document.getElementById('station46-storm-banner');
        const pill = document.getElementById('station46-storm-floating-pill');

        if (!weatherState.isActive) {
            document.body.classList.remove('storm-mode-active', 'storm-level-warning', 'storm-level-watch', 'storm-level-upcoming');
            if (banner) banner.remove();
            if (pill) pill.remove();
            return;
        }

        // Check if user dismissed banner for this session
        let isDismissed = false;
        try {
            const dismissedAt = sessionStorage.getItem(NWS_CONFIG.dismissKey);
            if (dismissedAt) isDismissed = true;
        } catch (e) {}

        // Add class to body for styling
        document.body.classList.add('storm-mode-active');
        document.body.classList.remove('storm-level-warning', 'storm-level-watch', 'storm-level-upcoming');
        document.body.classList.add(`storm-level-${weatherState.level}`);

        if (isDismissed) {
            if (banner) banner.remove();
            renderFloatingPill();
            return;
        }

        let levelTag = 'NWS WATCH';
        if (weatherState.level === 'warning') levelTag = 'CRITICAL WARNING';
        else if (weatherState.level === 'watch') levelTag = 'WEATHER WATCH';
        else if (weatherState.level === 'upcoming') levelTag = 'UPCOMING STORM';
        else levelTag = 'ADVISORY';

        const bannerHtml = `
            <div class="storm-banner-container">
                <div class="storm-banner-left">
                    <div class="storm-pulse-dot" aria-hidden="true"></div>
                    <span class="storm-banner-tag">${levelTag}</span>
                    <div class="storm-banner-text">
                        <span class="storm-banner-title">${escapeHtml(weatherState.event)}:</span>
                        <span>Somerset County / Montgomery Twp.</span>
                        <span class="storm-banner-timing">(${escapeHtml(weatherState.expires)})</span>
                    </div>
                </div>
                <div class="storm-banner-right">
                    <button type="button" class="storm-banner-btn" id="open-storm-hub-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <span>Weather Safety Guide</span>
                    </button>
                    <button type="button" class="storm-banner-dismiss" id="dismiss-storm-banner-btn" aria-label="Dismiss banner" title="Minimize alert banner">
                        &times;
                    </button>
                </div>
            </div>
        `;

        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'station46-storm-banner';
            banner.setAttribute('role', 'alert');
            banner.className = `storm-alert-banner storm-banner-${weatherState.level}`;
            banner.innerHTML = bannerHtml;
            document.body.prepend(banner);
        } else {
            banner.className = `storm-alert-banner storm-banner-${weatherState.level}`;
            banner.innerHTML = bannerHtml;
        }

        // Event listeners
        const openBtn = banner.querySelector('#open-storm-hub-btn');
        if (openBtn && !openBtn.dataset.bound) {
            openBtn.dataset.bound = 'true';
            openBtn.addEventListener('click', () => {
                openStormHubModal(weatherState.activeScenario);
            });
        }

        const dismissBtn = banner.querySelector('#dismiss-storm-banner-btn');
        if (dismissBtn && !dismissBtn.dataset.bound) {
            dismissBtn.dataset.bound = 'true';
            dismissBtn.addEventListener('click', () => {
                banner.remove();
                try {
                    sessionStorage.setItem(NWS_CONFIG.dismissKey, Date.now().toString());
                } catch (e) {}
                renderFloatingPill();
            });
        }

        renderFloatingPill();
    }

    // Floating Emergency Weather Pill (Bottom-Left)
    function renderFloatingPill() {
        let pill = document.getElementById('station46-storm-floating-pill');
        if (!pill) {
            pill = document.createElement('button');
            pill.id = 'station46-storm-floating-pill';
            pill.setAttribute('type', 'button');
            pill.setAttribute('aria-label', 'Open Station 46 Weather Safety Hub');
            document.body.appendChild(pill);
        }

        pill.className = `storm-floating-pill pill-${weatherState.level}`;
        pill.innerHTML = `
            <span class="storm-pulse-dot" aria-hidden="true"></span>
            <span>Severe Weather Safety Guide</span>
        `;

        if (!pill.dataset.bound) {
            pill.dataset.bound = 'true';
            pill.addEventListener('click', () => {
                openStormHubModal(weatherState.activeScenario);
            });
        }
    }

    // Render the Storm & Inclement Weather Safety Hub Modal
    function buildStormHubModal() {
        let modalBackdrop = document.getElementById('storm-hub-modal');
        if (modalBackdrop) return modalBackdrop;

        modalBackdrop = document.createElement('div');
        modalBackdrop.id = 'storm-hub-modal';
        modalBackdrop.className = 'storm-modal-backdrop';
        modalBackdrop.setAttribute('role', 'dialog');
        modalBackdrop.setAttribute('aria-modal', 'true');
        modalBackdrop.setAttribute('aria-hidden', 'true');

        modalBackdrop.innerHTML = `
            <div class="storm-modal-container">
                <!-- Header -->
                <div class="storm-modal-header">
                    <div class="storm-modal-title-wrap">
                        <div class="storm-modal-header-top">
                            <span class="storm-modal-badge badge-${weatherState.level}" id="storm-modal-level-badge">
                                ${weatherState.level === 'warning' ? 'CRITICAL WARNING' : (weatherState.level === 'watch' ? 'WEATHER WATCH' : 'UPCOMING STORM')}
                            </span>
                            <span class="storm-modal-office">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                                <span id="storm-modal-meta-office">NWS Mount Holly / PHI &bull; Somerset County Zone NJZ010</span>
                            </span>
                        </div>
                        <h2 class="storm-modal-title" id="storm-modal-title-text">${escapeHtml(weatherState.headline || 'Inclement Weather & Storm Emergency Center')}</h2>
                    </div>
                    <button type="button" class="storm-modal-close-btn" id="storm-modal-close-btn" aria-label="Close dialog">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <!-- Body -->
                <div class="storm-modal-body">
                    
                    <!-- Station Custom Notice (if active) -->
                    <div class="storm-station-notice" id="storm-station-notice-box" style="${weatherState.stationNotice ? '' : 'display: none;'}">
                        <div class="storm-notice-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        </div>
                        <div class="storm-notice-content">
                            <h4>Station 46 Community Notice</h4>
                            <p id="storm-station-notice-text">${escapeHtml(weatherState.stationNotice || '')}</p>
                        </div>
                    </div>

                    <!-- Direct Emergency One-Click Contact Grid -->
                    <div class="storm-contacts-grid">
                        <a href="tel:911" class="storm-contact-card emergency-card">
                            <div class="storm-contact-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            </div>
                            <div class="storm-contact-details">
                                <span class="storm-contact-label">Life Threat / Active Fire</span>
                                <span class="storm-contact-number">Dial 911</span>
                            </div>
                        </a>
                        <a href="tel:6094663926" class="storm-contact-card">
                            <div class="storm-contact-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                            </div>
                            <div class="storm-contact-details">
                                <span class="storm-contact-label">Station 46 Non-Emergency</span>
                                <span class="storm-contact-number">(609) 466-3926</span>
                            </div>
                        </a>
                        <a href="tel:9083593222" class="storm-contact-card">
                            <div class="storm-contact-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            </div>
                            <div class="storm-contact-details">
                                <span class="storm-contact-label">Montgomery Twp Police</span>
                                <span class="storm-contact-number">(908) 359-3222</span>
                            </div>
                        </a>
                        <a href="tel:18004367734" class="storm-contact-card">
                            <div class="storm-contact-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            </div>
                            <div class="storm-contact-details">
                                <span class="storm-contact-label">PSE&G Outage Line</span>
                                <span class="storm-contact-number">1-800-436-7734</span>
                            </div>
                        </a>
                        <a href="tel:18885444877" class="storm-contact-card">
                            <div class="storm-contact-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            </div>
                            <div class="storm-contact-details">
                                <span class="storm-contact-label">JCP&L Outage Line</span>
                                <span class="storm-contact-number">1-888-544-4877</span>
                            </div>
                        </a>
                    </div>

                    <!-- Live Weather & NWS Bulletin Details -->
                    <div class="storm-live-weather-card">
                        <div class="storm-live-header">
                            <div class="storm-live-title">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
                                <span>Current Weather & Live Alert Details</span>
                            </div>
                            <a href="https://radar.weather.gov/station/KDIX/standard" target="_blank" rel="noopener noreferrer" class="storm-radar-link">
                                <span>Live Mount Holly Doppler Radar &rarr;</span>
                            </a>
                        </div>
                        <div class="storm-live-stats">
                            <div class="storm-stat-item">
                                <span class="storm-stat-label">Area</span>
                                <span class="storm-stat-val">Skillman / Montgomery</span>
                            </div>
                            <div class="storm-stat-item">
                                <span class="storm-stat-label">Status</span>
                                <span class="storm-stat-val" id="storm-stat-event">${escapeHtml(weatherState.event || 'Calm / Standard')}</span>
                            </div>
                            <div class="storm-stat-item">
                                <span class="storm-stat-label">Timing</span>
                                <span class="storm-stat-val" id="storm-stat-timing">${escapeHtml(weatherState.expires || 'N/A')}</span>
                            </div>
                            <div class="storm-stat-item">
                                <span class="storm-stat-label">Wind / Gusts</span>
                                <span class="storm-stat-val" id="storm-stat-wind">${escapeHtml(weatherState.winds || 'Normal')}</span>
                            </div>
                        </div>
                        <div class="storm-nws-statement" id="storm-nws-statement-text">
                            <strong>Official Statement:</strong> ${escapeHtml(weatherState.description || 'No severe weather alerts are currently active for Montgomery Township. Stay prepared by reviewing the safety scenarios below.')}
                            ${weatherState.instruction ? `<br><br><strong>Instruction:</strong> ${escapeHtml(weatherState.instruction)}` : ''}
                        </div>
                    </div>

                    <!-- Interactive Scenario Action Guides -->
                    <div class="storm-scenarios-section">
                        <div class="storm-scenarios-header">
                            <h3>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                <span>Emergency Safety Protocols</span>
                            </h3>
                        </div>

                        <!-- Scenario Tabs -->
                        <div class="storm-tab-buttons" id="storm-tab-buttons" role="tablist">
                            ${Object.keys(SCENARIOS).map(key => {
                                const sc = SCENARIOS[key];
                                return `<button type="button" class="storm-tab-btn" data-scenario="${sc.id}" role="tab" aria-selected="false">${sc.tabName}</button>`;
                            }).join('')}
                        </div>

                        <!-- Tab Panels Container -->
                        <div id="storm-tab-panels-container">
                            ${Object.keys(SCENARIOS).map(key => {
                                const sc = SCENARIOS[key];
                                return `
                                    <div class="storm-tab-panel" id="panel-${sc.id}" role="tabpanel">
                                        <h4 class="scenario-panel-title">${sc.title}</h4>
                                        <p class="scenario-panel-desc">${sc.desc}</p>
                                        
                                        <div class="scenario-action-grid">
                                            <div class="action-column dos">
                                                <div class="action-column-header">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    <span>Actions To Take</span>
                                                </div>
                                                <ul class="action-list">
                                                    ${sc.dos.map(item => `<li>${item}</li>`).join('')}
                                                </ul>
                                            </div>
                                            <div class="action-column donts">
                                                <div class="action-column-header">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                    <span>Safety Hazards To Avoid</span>
                                                </div>
                                                <ul class="action-list">
                                                    ${sc.donts.map(item => `<li>${item}</li>`).join('')}
                                                </ul>
                                            </div>
                                        </div>

                                        <div class="scenario-local-tip">
                                            ${sc.localTip}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                </div>

                <!-- Footer -->
                <div class="storm-modal-footer">
                    <div class="storm-modal-source">
                        Official source: <strong>National Weather Service (NWS Mount Holly)</strong> &amp; Montgomery Township Volunteer Fire Company #2
                    </div>
                    <div class="storm-modal-footer-actions">
                        <button type="button" class="btn btn-secondary storm-modal-close-action" id="storm-modal-done-btn">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalBackdrop);

        // Bind Close
        modalBackdrop.querySelector('#storm-modal-close-btn').addEventListener('click', closeStormHubModal);
        modalBackdrop.querySelector('#storm-modal-done-btn').addEventListener('click', closeStormHubModal);
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeStormHubModal();
        });

        // Bind Scenario Tabs
        const tabBtns = modalBackdrop.querySelectorAll('.storm-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetScenario = btn.getAttribute('data-scenario');
                switchScenarioTab(targetScenario);
            });
        });

        // Bind Simulator dropdown
        const simSelect = modalBackdrop.querySelector('#storm-sim-select');
        if (simSelect) {
            // Set current selected value
            const currentOverride = localStorage.getItem(NWS_CONFIG.overrideKey) || 'auto';
            simSelect.value = currentOverride;

            simSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'auto') {
                    localStorage.removeItem(NWS_CONFIG.overrideKey);
                    sessionStorage.removeItem(NWS_CONFIG.cacheKey);
                } else {
                    localStorage.setItem(NWS_CONFIG.overrideKey, val);
                }
                // Re-evaluate and re-render
                evaluateWeather().then(() => {
                    updateModalContent();
                    renderStormBanner();
                    switchScenarioTab(weatherState.activeScenario || 'flood');
                });
            });
        }

        return modalBackdrop;
    }

    function switchScenarioTab(scenarioId) {
        const modalBackdrop = document.getElementById('storm-hub-modal');
        if (!modalBackdrop) return;

        const targetId = SCENARIOS[scenarioId] ? scenarioId : 'flood';

        modalBackdrop.querySelectorAll('.storm-tab-btn').forEach(b => {
            const isMatch = b.getAttribute('data-scenario') === targetId;
            b.classList.toggle('active', isMatch);
            b.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        });

        modalBackdrop.querySelectorAll('.storm-tab-panel').forEach(p => {
            p.classList.toggle('active', p.id === `panel-${targetId}`);
        });
    }

    function updateModalContent() {
        const modalBackdrop = document.getElementById('storm-hub-modal');
        if (!modalBackdrop) return;

        const badge = modalBackdrop.querySelector('#storm-modal-level-badge');
        if (badge) {
            badge.className = `storm-modal-badge badge-${weatherState.level}`;
            badge.textContent = weatherState.level === 'warning' ? 'CRITICAL WARNING' : (weatherState.level === 'watch' ? 'WEATHER WATCH' : (weatherState.level === 'upcoming' ? 'UPCOMING STORM' : 'WEATHER ADVISORY'));
        }

        const title = modalBackdrop.querySelector('#storm-modal-title-text');
        if (title) title.textContent = weatherState.headline || 'Inclement Weather & Storm Emergency Center';

        const statEvent = modalBackdrop.querySelector('#storm-stat-event');
        if (statEvent) statEvent.textContent = weatherState.event || 'Normal / Clear';

        const statTiming = modalBackdrop.querySelector('#storm-stat-timing');
        if (statTiming) statTiming.textContent = weatherState.expires || 'N/A';

        const statWind = modalBackdrop.querySelector('#storm-stat-wind');
        if (statWind) statWind.textContent = weatherState.winds || 'Normal';

        const stmt = modalBackdrop.querySelector('#storm-nws-statement-text');
        if (stmt) {
            stmt.innerHTML = `<strong>Official Statement:</strong> ${escapeHtml(weatherState.description || 'No severe weather alerts are currently active for Montgomery Township.')}` + 
                             (weatherState.instruction ? `<br><br><strong>Instruction:</strong> ${escapeHtml(weatherState.instruction)}` : '');
        }

        const noticeBox = modalBackdrop.querySelector('#storm-station-notice-box');
        const noticeText = modalBackdrop.querySelector('#storm-station-notice-text');
        if (noticeBox && noticeText) {
            if (weatherState.stationNotice) {
                noticeBox.style.display = 'flex';
                noticeText.textContent = weatherState.stationNotice;
            } else {
                noticeBox.style.display = 'none';
            }
        }
    }

    function openStormHubModal(preferredScenario) {
        let modalBackdrop = buildStormHubModal();
        updateModalContent();
        switchScenarioTab(preferredScenario || weatherState.activeScenario || 'flood');

        modalBackdrop.classList.add('active');
        modalBackdrop.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeStormHubModal() {
        const modalBackdrop = document.getElementById('storm-hub-modal');
        if (modalBackdrop) {
            modalBackdrop.classList.remove('active');
            modalBackdrop.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    // Global keyboard listener for escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('storm-hub-modal');
            if (modal && modal.classList.contains('active')) {
                closeStormHubModal();
            }
        }
    });

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function applyConfigToState(config) {
        if (!config || config.status === 'auto') {
            weatherState.isGlobalForced = false;
            return;
        }
        if (config.status === 'force_inactive') {
            weatherState.isActive = false;
            weatherState.isGlobalForced = true;
            return;
        }
        if (config.status === 'force_active') {
            const scKey = config.scenario || 'flood';
            const preset = SIM_PRESETS[scKey] || SIM_PRESETS.flood;
            const title = (config.customTitle && config.customTitle.trim()) ? config.customTitle.trim() : preset.headline;
            const notice = (config.customNotice && config.customNotice.trim()) ? config.customNotice.trim() : '';

            weatherState = {
                isActive: true,
                level: preset.level || 'watch',
                event: preset.event,
                headline: title,
                description: preset.description,
                instruction: preset.instruction,
                expires: 'Emergency Alert Issued by Montgomery Township Volunteer Fire Company #2',
                activeScenario: scKey,
                temp: preset.temp || 'Active Alert',
                winds: preset.winds || 'Hazardous',
                radar: preset.radar || 'Mount Holly KDIX Doppler Active',
                isSimulated: false,
                isGlobalForced: true,
                stationNotice: notice
            };
        }
    }

    // Public API on window
    window.Station46Weather = {
        getState: () => ({ ...weatherState }),
        getGlobalConfig: () => getGlobalStormConfig(),
        openHub: (scenario) => openStormHubModal(scenario),
        closeHub: () => closeStormHubModal(),
        
        // Admin Portal Activation: Activates Storm Mode globally for all website visitors
        activateGlobalMode: async (scenario, customTitle, customNotice) => {
            weatherEvalCounter++; // Invalidate any in-flight evaluateWeather calls!
            const scKey = scenario || 'flood';
            const preset = SIM_PRESETS[scKey] || SIM_PRESETS.flood;
            const config = {
                status: 'force_active',
                scenario: scKey,
                level: preset.level || 'watch',
                customTitle: customTitle || '',
                customNotice: customNotice || '',
                updatedAt: new Date().toISOString(),
                activatedBy: 'Montgomery Township Volunteer Fire Company #2'
            };
            try {
                localStorage.setItem(NWS_CONFIG.globalConfigKey, JSON.stringify(config));
                localStorage.removeItem(NWS_CONFIG.overrideKey); // clear local test override
                sessionStorage.removeItem(NWS_CONFIG.cacheKey);
                sessionStorage.removeItem(NWS_CONFIG.dismissKey); // Clear dismissal so alert banner ALWAYS pops up!
            } catch (e) {}

            applyConfigToState(config);
            renderStormBanner();
            updateModalContent();

            // Background non-blocking GitHub sync
            if (window.syncToGitHub) {
                window.syncToGitHub(NWS_CONFIG.remoteConfigPath, config, `Station 46: Activate Storm Mode (${scKey})`)
                    .then(ok => console.log('[Station 46] Storm Mode GitHub sync:', ok))
                    .catch(err => console.warn('[Station 46] Background GitHub sync error:', err));
            }

            return true;
        },

        // Admin Portal Deactivation: Forces Storm Mode off
        deactivateGlobalMode: async () => {
            weatherEvalCounter++;
            const config = {
                status: 'force_inactive',
                scenario: 'flood',
                customTitle: '',
                customNotice: '',
                updatedAt: new Date().toISOString(),
                activatedBy: 'Montgomery Township Volunteer Fire Company #2'
            };
            try {
                localStorage.setItem(NWS_CONFIG.globalConfigKey, JSON.stringify(config));
                localStorage.removeItem(NWS_CONFIG.overrideKey);
            } catch (e) {}

            applyConfigToState(config);
            renderStormBanner();
            updateModalContent();

            if (window.syncToGitHub) {
                window.syncToGitHub(NWS_CONFIG.remoteConfigPath, config, 'Station 46: Deactivate Storm Mode')
                    .then(ok => console.log('[Station 46] Storm Mode Deactivate sync:', ok))
                    .catch(err => console.warn('[Station 46] Background GitHub sync error:', err));
            }

            return true;
        },

        // Reset to Automatic NWS Detection
        resetGlobalToAuto: async () => {
            weatherEvalCounter++;
            const config = {
                status: 'auto',
                scenario: 'flood',
                customTitle: '',
                customNotice: '',
                updatedAt: new Date().toISOString(),
                activatedBy: 'Montgomery Township Volunteer Fire Company #2'
            };
            try {
                localStorage.setItem(NWS_CONFIG.globalConfigKey, JSON.stringify(config));
                localStorage.removeItem(NWS_CONFIG.overrideKey);
                sessionStorage.removeItem(NWS_CONFIG.cacheKey);
            } catch (e) {}

            weatherState.isGlobalForced = false;
            evaluateWeather().then(() => {
                renderStormBanner();
                updateModalContent();
            });

            if (window.syncToGitHub) {
                window.syncToGitHub(NWS_CONFIG.remoteConfigPath, config, 'Admin: Reset Storm Mode to Auto (NWS)')
                    .then(ok => console.log('[Station 46] Storm Mode Auto sync:', ok))
                    .catch(err => console.warn('[Station 46] Background GitHub sync error:', err));
            }

            return true;
        },

        // Local tester simulation override
        setSimulatorMode: (mode) => {
            if (mode === 'auto') {
                localStorage.removeItem(NWS_CONFIG.overrideKey);
                sessionStorage.removeItem(NWS_CONFIG.cacheKey);
            } else {
                localStorage.setItem(NWS_CONFIG.overrideKey, mode);
            }
            return evaluateWeather().then(() => {
                updateModalContent();
                renderStormBanner();
            });
        },

        setCustomNotice: (notice) => {
            if (notice && notice.trim()) {
                localStorage.setItem(NWS_CONFIG.noticeKey, notice.trim());
            } else {
                localStorage.removeItem(NWS_CONFIG.noticeKey);
            }
            return evaluateWeather().then(() => {
                updateModalContent();
                renderStormBanner();
            });
        },

        refresh: () => {
            sessionStorage.removeItem(NWS_CONFIG.cacheKey);
            return evaluateWeather().then(() => {
                updateModalContent();
                renderStormBanner();
            });
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            evaluateWeather().then(renderStormBanner);
            setupAdminWeatherIntegration();
        });
    } else {
        evaluateWeather().then(renderStormBanner);
        setupAdminWeatherIntegration();
    }

    // Admin Dashboard Weather Panel & Activation Command Center
    function setupAdminWeatherIntegration() {
        const loginStatusText = document.getElementById('login-weather-status-text');
        const loginOpenHubBtn = document.getElementById('login-open-hub-btn');
        if (loginOpenHubBtn && !loginOpenHubBtn.dataset.bound) {
            loginOpenHubBtn.dataset.bound = 'true';
            loginOpenHubBtn.addEventListener('click', () => {
                if (window.Station46Weather) window.Station46Weather.openHub();
            });
        }

        const headerHubBtn = document.getElementById('admin-header-storm-hub-btn');
        if (headerHubBtn && !headerHubBtn.dataset.bound) {
            headerHubBtn.dataset.bound = 'true';
            headerHubBtn.addEventListener('click', () => {
                if (window.Station46Weather) window.Station46Weather.openHub();
            });
        }

        // Shared helper to trigger mode switches from any toggle button
        async function switchWeatherMode(targetMode) {
            const scenarioSelect = document.getElementById('admin-storm-scenario-select');
            const titleInput = document.getElementById('admin-storm-title-input');
            const noticeInput = document.getElementById('admin-storm-notice-input');

            const sc = scenarioSelect ? scenarioSelect.value : (weatherState.activeScenario || 'flood');
            const title = titleInput ? titleInput.value.trim() : '';
            const notice = noticeInput ? noticeInput.value.trim() : '';

            if (targetMode === 'force_active') {
                await window.Station46Weather.activateGlobalMode(sc, title, notice);
                updateWeatherControlsUI({
                    status: 'force_active',
                    scenario: sc,
                    customTitle: title,
                    customNotice: notice,
                    updatedAt: new Date().toISOString()
                });
                if (window.showAdminToast) {
                    window.showAdminToast('🚨 Storm Mode ACTIVATED on Website!');
                }
            } else if (targetMode === 'auto') {
                await window.Station46Weather.resetGlobalToAuto();
                updateWeatherControlsUI({
                    status: 'auto',
                    scenario: sc,
                    customTitle: title,
                    customNotice: notice,
                    updatedAt: new Date().toISOString()
                });
                if (window.showAdminToast) {
                    window.showAdminToast('🟢 Website set to Automatic NWS Detection.');
                }
            } else if (targetMode === 'force_inactive') {
                await window.Station46Weather.deactivateGlobalMode();
                updateWeatherControlsUI({
                    status: 'force_inactive',
                    scenario: sc,
                    customTitle: title,
                    customNotice: notice,
                    updatedAt: new Date().toISOString()
                });
                if (window.showAdminToast) {
                    window.showAdminToast('⚪ Storm Mode deactivated.');
                }
            }
        }

        // Bind interactive toggle buttons in dashboard card (inside admin portal only)
        const adminToggleBtns = document.querySelectorAll('#admin-storm-toggle-group .storm-toggle-btn');
        adminToggleBtns.forEach(btn => {
            if (!btn.dataset.bound) {
                btn.dataset.bound = 'true';
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const mode = btn.getAttribute('data-mode');
                    switchWeatherMode(mode);
                });
            }
        });

        // Universal UI synchronizer for all status indicators and toggle buttons
        function updateWeatherControlsUI(cfg) {
            const status = cfg.status || 'auto';
            const scenario = cfg.scenario || 'flood';
            const customTitle = cfg.customTitle || '';
            const customNotice = cfg.customNotice || '';

            // 1. Update toggle buttons active class
            document.querySelectorAll('#login-storm-toggle-group .storm-toggle-btn, #admin-storm-toggle-group .storm-toggle-btn').forEach(b => {
                const bMode = b.getAttribute('data-mode');
                b.classList.toggle('active', bMode === status);
            });

            // 2. Update hidden or select input if present
            const statusSelect = document.getElementById('admin-storm-status-select');
            if (statusSelect) statusSelect.value = status;

            const scenarioSelect = document.getElementById('admin-storm-scenario-select');
            if (scenarioSelect && scenario) scenarioSelect.value = scenario;

            const titleInput = document.getElementById('admin-storm-title-input');
            if (titleInput && customTitle !== undefined) titleInput.value = customTitle;

            const noticeInput = document.getElementById('admin-storm-notice-input');
            if (noticeInput && customNotice !== undefined) noticeInput.value = customNotice;

            // 3. Update login card status text
            if (loginStatusText) {
                if (status === 'force_active') {
                    loginStatusText.innerHTML = '<span style="color: #b3212b;">🚨 Live Active on Website</span>';
                } else if (status === 'force_inactive') {
                    loginStatusText.innerHTML = '<span style="color: #64748b;">⚪ Standby / Deactivated</span>';
                } else {
                    loginStatusText.innerHTML = '<span style="color: #10b981;">🟢 Auto-Detect (NWS Active)</span>';
                }
            }

            // 4. Update dashboard card banner
            const bannerWrap = document.getElementById('admin-weather-status-banner-wrap');
            if (bannerWrap) {
                if (status === 'force_active') {
                    const scName = SCENARIOS[scenario]?.tabName || scenario;
                    bannerWrap.innerHTML = `
                        <div style="background: linear-gradient(90deg, #7a151d 0%, #b3212b 100%); color: #ffffff; padding: 12px 18px; border-radius: 6px; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; box-shadow: 0 4px 12px rgba(179, 33, 43, 0.25);">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 1.4rem;">🚨</span>
                                <div>
                                    <div style="font-weight: 800; font-size: 0.95rem; letter-spacing: 0.3px;">STORM MODE IS ACTIVATED ON THE WEBSITE (LIVE FOR ALL VISITORS)</div>
                                    <div style="font-size: 0.82rem; opacity: 0.92;">Active Scenario: <strong>${escapeHtml(scName)}</strong> • Issued by MTVFC #2</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button type="button" id="admin-quick-auto-btn" class="btn" style="background: #ffffff; color: #0f172a; font-weight: 700; padding: 6px 14px; font-size: 0.8rem; border-radius: 4px; border: none; cursor: pointer;">Switch to Auto</button>
                                <button type="button" id="admin-quick-deactivate-btn" class="btn" style="background: rgba(0,0,0,0.3); color: #ffffff; border: 1px solid rgba(255,255,255,0.4); font-weight: 600; padding: 6px 14px; font-size: 0.8rem; border-radius: 4px; cursor: pointer;">Deactivate</button>
                            </div>
                        </div>
                    `;
                    const qAuto = bannerWrap.querySelector('#admin-quick-auto-btn');
                    const qDeact = bannerWrap.querySelector('#admin-quick-deactivate-btn');
                    if (qAuto) qAuto.addEventListener('click', () => switchWeatherMode('auto'));
                    if (qDeact) qDeact.addEventListener('click', () => switchWeatherMode('force_inactive'));
                } else if (status === 'force_inactive') {
                    bannerWrap.innerHTML = `
                        <div class="admin-weather-status-inactive">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.1rem;">⚪</span>
                                <span><strong>Storm Mode Deactivated / Standby:</strong> The website is currently in standard calm mode.</span>
                            </div>
                            <button type="button" id="admin-quick-auto-btn" class="btn btn-admin-action" style="font-weight: 600; padding: 5px 12px; font-size: 0.8rem; height: auto;">Enable Auto-Detect</button>
                        </div>
                    `;
                    const qAuto = bannerWrap.querySelector('#admin-quick-auto-btn');
                    if (qAuto) qAuto.addEventListener('click', () => switchWeatherMode('auto'));
                } else {
                    bannerWrap.innerHTML = `
                        <div class="admin-weather-status-auto">
                            <span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981; display: inline-block; flex-shrink: 0;"></span>
                            <span><strong>🟢 Automatic NWS Detection Active:</strong> The website continuously monitors live National Weather Service watches, warnings, and upcoming forecasts for Somerset County (Zone NJZ010). It automatically activates whenever severe weather occurs.</span>
                        </div>
                    `;
                }
            }
        }

        // Read stored configuration immediately
        let initialConfig = null;
        try {
            const raw = localStorage.getItem(NWS_CONFIG.globalConfigKey);
            if (raw) initialConfig = JSON.parse(raw);
        } catch (e) {}
        const activeConfig = initialConfig || { status: 'force_active', scenario: 'flood', customTitle: '', customNotice: '' };
        updateWeatherControlsUI(activeConfig);

        // Background sync check
        getGlobalStormConfig().then(cfg => {
            if (cfg) updateWeatherControlsUI(cfg);
        }).catch(() => {});

        const weatherCard = document.getElementById('admin-weather-card');
        if (!weatherCard || weatherCard.dataset.listenersBound === 'true') return;
        weatherCard.dataset.listenersBound = 'true';

        // Action Buttons Bar listeners
        const activateBtn = document.getElementById('admin-save-activate-btn');
        const setAutoBtn = document.getElementById('admin-set-auto-btn');
        const deactivateBtn = document.getElementById('admin-deactivate-btn');
        const previewBtn = document.getElementById('admin-test-storm-hub-btn');

        if (activateBtn) {
            activateBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const origHtml = activateBtn.innerHTML;
                activateBtn.innerHTML = '<span>✅ ACTIVATED!</span>';
                activateBtn.style.background = '#15803d';

                await switchWeatherMode('force_active');

                setTimeout(() => {
                    activateBtn.innerHTML = origHtml;
                    activateBtn.style.background = '';
                }, 1600);
            });
        }

        if (setAutoBtn) {
            setAutoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                switchWeatherMode('auto');
            });
        }

        if (deactivateBtn) {
            deactivateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                switchWeatherMode('force_inactive');
            });
        }

        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const scenarioSelect = document.getElementById('admin-storm-scenario-select');
                const sc = scenarioSelect ? scenarioSelect.value : 'flood';
                window.Station46Weather.openHub(sc);
            });
        }
    }
})();



