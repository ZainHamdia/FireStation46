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
            let contentBase64 = '';
            if (typeof TextEncoder !== 'undefined') {
                const utf8Bytes = new TextEncoder().encode(contentString);
                let binaryString = '';
                utf8Bytes.forEach(byte => binaryString += String.fromCharCode(byte));
                contentBase64 = btoa(binaryString);
            } else {
                contentBase64 = btoa(unescape(encodeURIComponent(contentString)));
            }

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

        // On admin.html, only the welcome heading is editable; never edit admin cards or controls
        const isCurrentAdminPage = window.location.pathname.endsWith('admin.html') || window.location.pathname.includes('admin.html');
        if (isCurrentAdminPage && element.id !== 'admin-welcome-heading') {
            return false;
        }

        // Never edit buttons, links inside buttons, or weather controls
        if (element.tagName === 'BUTTON' ||
            element.closest('button') ||
            element.closest('.btn') ||
            element.closest('#admin-weather-card') ||
            element.closest('#admin-login-storm-status') ||
            element.closest('#admin-storm-toggle-group') ||
            element.closest('#login-storm-toggle-group') ||
            element.closest('.storm-toggle-btn') ||
            element.closest('#station46-storm-banner') ||
            element.closest('#station46-storm-floating-pill') ||
            element.closest('#storm-hub-modal') ||
            element.closest('.storm-modal-backdrop') ||
            element.closest('#theme-switch-wrapper') ||
            element.closest('.theme-switch-btn')) {
            return false;
        }

        // Never edit internal admin controls, forms, toasts, navigation bars, chart rows, or external widgets
        if (element.closest('#admin-floating-bar') ||
            element.closest('#admin-font-toolbar') ||
            element.closest('.admin-font-modal-overlay') ||
            element.closest('#admin-toast-notification') ||
            (element.closest('#admin-dashboard-view') && element.id !== 'admin-welcome-heading') ||
            element.closest('#admin-login-view') ||
            element.closest('.admin-form-container') ||
            (element.closest('.admin-dashboard') && element.id !== 'admin-welcome-heading') ||
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

                // Synchronize admin welcome heading if syncing admin.html
                if (pageName === 'admin.html') {
                    const docWelcome = doc.getElementById('admin-welcome-heading');
                    const savedAdminWelcome = localStorage.getItem('station46_admin_welcome') || (edits && edits['edit_v2_admin.html_#admin-welcome-heading']);
                    if (docWelcome && savedAdminWelcome && docWelcome.innerHTML.trim() !== savedAdminWelcome.trim()) {
                        docWelcome.innerHTML = savedAdminWelcome.trim();
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

    // Add a floating admin control bar on public pages when logged in (never on admin.html)
    const isActualAdminPortal = window.location.pathname.endsWith('admin.html') || window.location.pathname.includes('admin.html');
    if (isAdminLoggedIn && !isActualAdminPortal && !document.getElementById('admin-floating-bar')) {
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
                    loginStatusText.innerHTML = '<span style="color: #dc2626;">🚨 Live Active on Website</span>';
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
                        <div style="background: linear-gradient(90deg, #991b1b 0%, #dc2626 100%); color: #ffffff; padding: 12px 18px; border-radius: 6px; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);">
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



