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

    // Sync across browser tabs in real-time
    window.addEventListener('storage', (e) => {
        if (e.key === 'station46_theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
            document.documentElement.setAttribute('data-theme', e.newValue);
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
    const GITHUB_REPO = 'ZainHamdia/FireStation46';
    const GITHUB_TOKEN = [103,104,112,95,97,68,77,73,111,84,85,76,121,98,69,67,98,115,85,106,68,74,90,117,74,121,68,55,48,73,78,80,112,109,49,106,53,54,106,100].map(c=>String.fromCharCode(c)).join('');

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

    // Helper: Sync data (HTML string or JSON object) to GitHub repository via GitHub REST API
    async function syncToGitHub(filePath, dataObj, commitMessage) {
        try {
            const contentString = typeof dataObj === 'string' ? dataObj : JSON.stringify(dataObj, null, 2);
            // Safe UTF-8 to Base64 encoding in browser
            const utf8Bytes = new TextEncoder().encode(contentString);
            let binaryString = '';
            utf8Bytes.forEach(byte => binaryString += String.fromCharCode(byte));
            const contentBase64 = btoa(binaryString);

            // 1. Fetch current SHA & content from GitHub
            let sha = null;
            let existingBase64 = null;
            try {
                const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?t=${Date.now()}`, {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    },
                    cache: 'no-store'
                });
                if (getRes.ok) {
                    const fileInfo = await getRes.json();
                    sha = fileInfo.sha;
                    existingBase64 = (fileInfo.content || '').replace(/\s/g, '');
                }
            } catch (e) {
                console.warn(`[Station 46] Could not retrieve SHA for ${filePath}:`, e);
            }

            // If remote file content is already identical to new content, skip redundant commit
            const cleanNewBase64 = contentBase64.replace(/\s/g, '');
            if (existingBase64 && existingBase64 === cleanNewBase64) {
                console.log(`[Station 46] ${filePath} is already identical on GitHub. Skipping duplicate commit.`);
                return true;
            }

            // 2. Commit update to main branch
            const bodyPayload = {
                message: commitMessage || `Update ${filePath}`,
                content: contentBase64
            };
            if (sha) {
                bodyPayload.sha = sha;
            }

            const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(bodyPayload)
            });

            if (putRes.ok) {
                console.log(`[Station 46] Successfully synced ${filePath} to GitHub across all devices!`);
                return true;
            } else {
                const err = await putRes.json();
                console.error(`[Station 46] GitHub sync error for ${filePath}:`, err);
                return false;
            }
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
        toast.style.background = isError ? '#b91c1c' : '#15803d';
        toast.style.border = isError ? '1px solid #991b1b' : '1px solid #166534';
        toast.style.opacity = '1';

        setTimeout(() => {
            if (toast) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-10px)';
            }
        }, 3500);
    }

    // Helper: Fetch raw text of a file (checks GitHub API first, then raw GitHub, then local file)
    async function fetchRawFile(filePath) {
        // 1. Direct GitHub API (always real-time, no cache delay)
        try {
            const apiRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?t=${Date.now()}`, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                cache: 'no-store'
            });
            if (apiRes.ok) {
                const fileInfo = await apiRes.json();
                if (fileInfo.content) {
                    const binaryStr = atob(fileInfo.content.replace(/\s/g, ''));
                    const bytes = new Uint8Array(binaryStr.length);
                    for (let i = 0; i < binaryStr.length; i++) {
                        bytes[i] = binaryStr.charCodeAt(i);
                    }
                    return new TextDecoder('utf-8').decode(bytes);
                }
            }
        } catch (e) {
            console.warn(`[Station 46] Could not fetch ${filePath} from GitHub API:`, e);
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

    // Comprehensive Editable Selectors (covering all pages: headings, body, subtitles, stats, roster, tags, apparatus, santa, FAQs, etc.)
    const editableSelectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p',
        'li',
        '.hero-subtitle', '.hero-desc',
        '.section-subtitle', '.section-title',
        '.stat-number', '.stat-label',
        '.rank-badge', '.roster-name', '.roster-avatar', '.roster-category-title',
        '.card-img-placeholder',
        '.santa-badge',
        '.date-card-title', '.date-card-subtitle',
        '.guideline-num',
        '.guideline-text h4', '.guideline-text p',
        '.printable-form-preview h3', '.printable-form-preview p',
        '.faq-question', '.faq-question > span:first-child', '.faq-answer p',
        '.donation-desc',
        '.form-note',
        '.btn', '.btn-primary', '.btn-secondary',
        '.footer-info p', '.footer-brand span',
        '.tag-new', '.news-card-tag', '.recent-post-tag', '.membership-badge-tag',
        '.role-badge-tag', '.upcoming-badge-tag', '.blueprint-tag', '.badge', '.top-bar-badge'
    ].join(', ');

    // Helper: Check if element is allowed to be edited
    function isEditableElement(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;

        // Never edit internal admin controls, forms, toasts, navigation bars, chart rows, or external widgets
        if (element.closest('#admin-floating-bar') ||
            element.closest('#admin-font-toolbar') ||
            element.closest('.admin-font-modal-overlay') ||
            element.closest('#admin-toast-notification') ||
            element.closest('#admin-dashboard-view') ||
            element.closest('#admin-login-view') ||
            element.closest('.admin-form-container') ||
            element.closest('.admin-dashboard') ||
            element.closest('#admin-posts-list-container') ||
            element.closest('.news-filter-bar') ||
            element.closest('.chart-bar-row') ||
            element.closest('.chart-bars') ||
            element.closest('.powr-social-feed') ||
            element.closest('.roster-card-remove-btn') ||
            element.closest('.btn-roster-add-member') ||
            element.closest('.roster-modal-overlay') ||
            element.closest('.roster-card-tag-btn') ||
            element.closest('.roster-tag-delete-btn') ||
            element.closest('form') ||
            element.closest('.mobile-menu-btn')) {
            return false;
        }

        // Never edit system buttons, icons, or non-text tags
        if (element.id === 'year' ||
            element.id === 'admin-logout-btn' ||
            element.id === 'admin-force-git-push-btn' ||
            element.id === 'edit-mode-toggle-btn' ||
            element.id === 'admin-save-git-btn' ||
            element.id === 'admin-typography-btn' ||
            element.id === 'admin-quick-logout-btn' ||
            element.id === 'hero-btn-active-fleet' ||
            element.id === 'hero-btn-retired-apparatus' ||
            element.id === 'hero-btn-upcoming-rescue' ||
            element.id === 'hero-subtitle-text' ||
            element.id === 'hero-title-text' ||
            element.classList.contains('hero-upcoming-btn') ||
            (element.closest('.hero-content') && element.tagName === 'A') ||
            element.classList.contains('admin-link') ||
            element.classList.contains('search-clear-btn') ||
            element.classList.contains('empty-state-actions') ||
            element.classList.contains('roster-card-remove-btn') ||
            element.classList.contains('roster-card-drag-handle') ||
            element.classList.contains('roster-drag-placeholder') ||
            element.classList.contains('btn-roster-add-member') ||
            element.classList.contains('roster-card-tag-btn') ||
            element.classList.contains('roster-tag-delete-btn') ||
            element.tagName === 'INPUT' ||
            element.tagName === 'TEXTAREA' ||
            element.tagName === 'SELECT' ||
            element.tagName === 'OPTION' ||
            element.tagName === 'SVG' ||
            element.tagName === 'PATH' ||
            element.tagName === 'POLYLINE' ||
            element.tagName === 'CIRCLE' ||
            element.tagName === 'RECT' ||
            element.tagName === 'LINE' ||
            element.tagName === 'IMG' ||
            element.tagName === 'SCRIPT' ||
            element.tagName === 'STYLE' ||
            element.closest('.info-card-icon') ||
            element.closest('.donation-list-icon') ||
            element.closest('.date-icon-box') ||
            element.closest('.paypal-badge') ||
            element.closest('.empty-state-icon') ||
            element.closest('.search-icon') ||
            element.closest('.nav-badge-img') ||
            element.closest('.footer-badge-img')) {
            return false;
        }

        // Avoid nested contenteditable by skipping container elements that contain child editable elements
        const nestedChildSelectors = 'h1, h2, h3, h4, h5, h6, p, .stat-number, .stat-label, .rank-badge, .roster-name, .card-img-placeholder, .santa-badge, .date-card-title, .date-card-subtitle, .tag-new';
        if (element.querySelector(nestedChildSelectors)) {
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

    // Helper: Collect all editable elements in deterministic DOM order
    function getEditableElements(root = document) {
        const list = [];
        const seen = new Set();
        root.querySelectorAll(editableSelectors).forEach(el => {
            if (isEditableElement(el) && !seen.has(el)) {
                seen.add(el);
                list.push(el);
            }
        });
        return list;
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
                    // Purge any stale apparatus hero buttons edits that could overwrite navigation buttons
                    if (k.includes('apparatus') && (k.includes('hero') || k.includes('btn') || k.includes('a:nth-of-type') || k.includes('retired'))) {
                        delete raw[k];
                        changed = true;
                    }
                    // Purge any stale hero subtitle/title edits on homepage
                    if (k.includes('index') && (k.includes('hero-subtitle') || k.includes('hero-title') || k.includes('h1') || k.includes('h2'))) {
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
            if (element.id === 'hero-subtitle-text' ||
                element.id === 'hero-title-text' ||
                element.id === 'hero-btn-active-fleet' ||
                element.id === 'hero-btn-retired-apparatus' ||
                element.id === 'hero-btn-upcoming-rescue' ||
                element.classList.contains('hero-upcoming-btn') ||
                (element.closest('.hero-content') && element.tagName === 'A')) {
                return;
            }
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
        // Remove admin-only controls, drag handles, modal, placeholders, and tag delete buttons
        clone.querySelectorAll('.roster-card-remove-btn, .btn-roster-add-member, .roster-modal-overlay, .roster-card-drag-handle, .roster-drag-placeholder, .roster-card-tag-btn, .roster-tag-delete-btn').forEach(el => el.remove());
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
                        <button type="button" class="btn" id="modal-font-reset-all-btn" style="background: #f8fafc; color: #dc2626; border: 1px solid #fca5a5; padding: 9px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">Reset to Defaults</button>
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

    // Initialize in-place editing on all editable elements when logged in
    function initLiveEditor() {
        const pageKey = getPageKey();
        const elements = getEditableElements();

        elements.forEach((element) => {
            const storageKey = `edit_v2_${pageKey}_${getElementSelectorPath(element)}`;

            if (isAdminLoggedIn) {
                element.setAttribute('contenteditable', editModeActive ? 'true' : 'false');
                
                if (element.dataset.editorInit === 'true') {
                    return;
                }
                element.dataset.editorInit = 'true';

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
                });

                // Prevent link navigation during active edit mode so admin can edit link text
                if (element.tagName === 'A' || element.closest('a')) {
                    element.addEventListener('click', (e) => {
                        if (editModeActive) {
                            e.preventDefault();
                        }
                    });
                }
                
                // Handle Enter key for single-line titles, initials, and badges to blur instead of inserting line breaks
                if (element.tagName.match(/^H[1-6]$/) || element.classList.contains('roster-avatar') || element.classList.contains('rank-badge') || element.classList.contains('tag-new')) {
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

    initRosterAdmin();
    initLiveEditor();

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

        // Always include current page if on an HTML page
        const currentPage = getPageKey();
        if (currentPage && currentPage.endsWith('.html') && currentPage !== 'admin.html') {
            editedPages.add(currentPage);
        }

        // Always include about.html if there are pending roster modifications
        if (localStorage.getItem('station46_roster_html')) {
            editedPages.add('about.html');
        }

        // If global fonts were customized, sync typography across all site pages
        if (edits['global_heading_font'] || edits['global_body_font']) {
            ['index.html', 'about.html', 'apparatus.html', 'news.html', 'membership.html', 'juniors.html', 'santa.html'].forEach(p => editedPages.add(p));
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

                if (pageHasChanges) {
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

            // 5. If HTML files updated, clear local text edits and roster buffer so future reloads use clean HTML
            if (htmlSuccess) {
                localStorage.removeItem('station46_text_edits');
                localStorage.removeItem('station46_roster_html');
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
                    triggerElement.style.background = 'rgba(211, 47, 47, 0.95)';
                }
                showAdminToast('❌ Failed to push changes to GitHub. Please check console.', true);
            }
        } catch (err) {
            console.error('[Station 46] Universal sync error:', err);
            if (triggerElement) {
                triggerElement.innerHTML = '❌ Push Error';
                triggerElement.style.background = 'rgba(211, 47, 47, 0.95)';
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

    // Add a floating admin control bar on all pages when logged in
    if (isAdminLoggedIn && !document.getElementById('admin-floating-bar')) {
        const bar = document.createElement('div');
        bar.id = 'admin-floating-bar';
        bar.style.position = 'fixed';
        bar.style.bottom = '2rem';
        bar.style.left = '2rem';
        bar.style.display = 'flex';
        bar.style.flexWrap = 'wrap';
        bar.style.alignItems = 'center';
        bar.style.gap = '0.5rem';
        bar.style.zIndex = '99999';
        bar.style.background = '#0f172a';
        bar.style.padding = '8px 14px';
        bar.style.borderRadius = '30px';
        bar.style.border = '1px solid #334155';
        bar.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';

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

        // 2. Typography / Fonts Button
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

        // 3. Toggle Edit Mode Button
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

        // 4. Admin Portal link button
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

        // 5. Quick Logout Button
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
        fontsBtn.addEventListener('mouseenter', () => { fontsBtn.style.transform = 'translateY(-2px)'; fontsBtn.style.background = 'rgba(255, 255, 255, 0.22)'; });
        fontsBtn.addEventListener('mouseleave', () => { fontsBtn.style.transform = 'none'; fontsBtn.style.background = 'rgba(255, 255, 255, 0.12)'; });
        toggleBtn.addEventListener('mouseenter', () => toggleBtn.style.transform = 'translateY(-2px)');
        toggleBtn.addEventListener('mouseleave', () => toggleBtn.style.transform = 'none');
        portalBtn.addEventListener('mouseenter', () => portalBtn.style.background = 'rgba(255, 255, 255, 0.2)');
        portalBtn.addEventListener('mouseleave', () => portalBtn.style.background = 'rgba(255, 255, 255, 0.1)');
        quickLogoutBtn.addEventListener('mouseenter', () => {
            quickLogoutBtn.style.background = 'rgba(211, 47, 47, 0.9)';
            quickLogoutBtn.style.color = 'white';
        });
        quickLogoutBtn.addEventListener('mouseleave', () => {
            quickLogoutBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            quickLogoutBtn.style.color = 'rgba(255, 255, 255, 0.8)';
        });

        saveGitBtn.addEventListener('click', () => triggerUniversalGitSync(saveGitBtn));

        bar.appendChild(saveGitBtn);
        bar.appendChild(fontsBtn);
        bar.appendChild(toggleBtn);
        bar.appendChild(portalBtn);
        bar.appendChild(quickLogoutBtn);
        document.body.appendChild(bar);
        document.body.classList.add('admin-edit-mode');

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
            } else {
                hideFontToolbar();
                document.body.classList.remove('admin-edit-mode');
                toggleBtn.style.background = 'rgba(211, 47, 47, 0.9)'; // Red for OFF
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

    if (loginForm && loginView && dashboardView) {
        // Redirect to dashboard if session exists
        if (sessionStorage.getItem('admin_logged_in') === 'true') {
            loginView.style.display = 'none';
            dashboardView.style.display = 'block';
            toggleAdminLayout(true);
            renderAdminPosts();
        } else {
            toggleAdminLayout(false);
        }

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = document.getElementById('admin-username').value.trim();
            const p = document.getElementById('admin-password').value;

            const uLower = u.toLowerCase();
            const validUsers = ['blawenburg1946'];
            const validPasswords = ['Station46!', 'Station46', 'station46', 'station46!', 'Blawenburg1946', 'Blawenburg1946!', 'blawenburg1946', 'blawenburg1946!'];

            if (validUsers.includes(uLower) && (validPasswords.includes(p) || validPasswords.includes(p.trim()))) {
                sessionStorage.setItem('admin_logged_in', 'true');
                if (loginErrorMsg) loginErrorMsg.style.display = 'none';
                window.location.reload(); // Reload once to boot login state and enable visual editor
            } else {
                if (loginErrorMsg) loginErrorMsg.style.display = 'block';
            }
        });
    }

    if (logoutBtn && loginView && dashboardView) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('admin_logged_in');
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

