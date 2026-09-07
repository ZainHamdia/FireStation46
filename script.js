document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            mobileBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                mobileBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
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
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once animated to keep it visible
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });
    
    // Real form submission via FormSubmit.co (handles membership & recruitment forms)
    const membershipForms = document.querySelectorAll('.membership-application-form, #membership-application-form');
    membershipForms.forEach(form => {
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
            const typeEl = form.querySelector('[name="membership_type"]') || form.querySelector('#membership-type') || form.querySelector('.form-type');

            const name = nameEl ? nameEl.value : '';
            const email = emailEl ? emailEl.value : '';
            const phone = phoneEl ? phoneEl.value : '';
            const membershipType = typeEl ? typeEl.value : '';

            fetch("https://formsubmit.co/ajax/membership@mtvfc2.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone,
                    membership_type: membershipType,
                    _subject: "New Membership Application for Station 46"
                })
            })
            .then(response => response.json())
            .then(data => {
                btn.textContent = 'Application Sent!';
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
            toast.style.borderRadius = '8px';
            toast.style.fontSize = '0.95rem';
            toast.style.fontWeight = '600';
            toast.style.color = '#fff';
            toast.style.backdropFilter = 'blur(10px)';
            toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
            toast.style.transition = 'all 0.3s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.fontFamily = 'var(--font-heading, sans-serif)';
            document.body.appendChild(toast);
        }

        toast.innerHTML = message;
        toast.style.background = isError ? 'rgba(211, 47, 47, 0.95)' : 'rgba(46, 125, 50, 0.95)';
        toast.style.border = isError ? '1px solid rgba(255, 100, 100, 0.3)' : '1px solid rgba(100, 255, 100, 0.3)';
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

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

    // Comprehensive Editable Selectors (covering all pages: headings, body, subtitles, stats, roster, apparatus, santa, FAQs, etc.)
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
        '.footer-info p', '.footer-brand span'
    ].join(', ');

    // Helper: Check if element is allowed to be edited
    function isEditableElement(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;

        // Never edit internal admin controls, forms, toasts, navigation bars, chart rows, or external widgets
        if (element.closest('#admin-floating-bar') ||
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
            element.classList.contains('admin-link') ||
            element.classList.contains('search-clear-btn') ||
            element.classList.contains('empty-state-actions') ||
            element.classList.contains('tag-new') ||
            element.classList.contains('roster-card-remove-btn') ||
            element.classList.contains('roster-card-drag-handle') ||
            element.classList.contains('roster-drag-placeholder') ||
            element.classList.contains('btn-roster-add-member') ||
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
        const nestedChildSelectors = 'h1, h2, h3, h4, h5, h6, p, .stat-number, .stat-label, .rank-badge, .roster-name, .card-img-placeholder, .santa-badge, .date-card-title, .date-card-subtitle';
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
                let hasLegacy = false;
                for (const k in raw) {
                    if (k.match(/^edit_text_[a-zA-Z0-9_\-\.]+\.html_\d+$/)) {
                        hasLegacy = true;
                        break;
                    }
                }
                if (hasLegacy) {
                    localStorage.removeItem('station46_text_edits');
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

    function applyTextEdits(edits) {
        if (!edits || typeof edits !== 'object') return;
        const pageKey = getPageKey();
        const elements = getEditableElements();
        elements.forEach((element) => {
            const storageKey = `edit_v2_${pageKey}_${getElementSelectorPath(element)}`;
            if (edits[storageKey] !== undefined && edits[storageKey] !== null) {
                if (document.activeElement !== element) {
                    const val = edits[storageKey];
                    // Safety: Never inject full paragraphs or block tags into inline elements
                    if ((element.classList.contains('stat-number') || element.classList.contains('stat-label') || element.classList.contains('filter-count') || element.classList.contains('roster-avatar')) && (val.includes('<p') || val.length > 30)) {
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
            title: 'Fire Police & Associate Members',
            gridClass: 'roster-grid-modern',
            cardTier: '',
            avatarClass: 'avatar-police',
            defaultBadge: 'badge-police',
            ranks: ['Captain (Fire Police)', 'Sergeant (Fire Police)', 'Corporal (Fire Police)', 'Fire Police', 'Associate Member']
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
        // Remove admin-only controls, drag handles, modal, and placeholders
        clone.querySelectorAll('.roster-card-remove-btn, .btn-roster-add-member, .roster-modal-overlay, .roster-card-drag-handle, .roster-drag-placeholder').forEach(el => el.remove());
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
                    <div class="roster-modal-actions">
                        <button type="button" class="btn btn-roster-cancel" id="roster-modal-cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary glow" id="roster-modal-submit-btn">Add Member</button>
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
        const cancelBtn = overlay.querySelector('#roster-modal-cancel-btn');

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
                if (!name || !role) return;

                addMemberToSection(category, name, role, initials);
                overlay.classList.remove('active');
                form.reset();
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

        if (sectionLabel) sectionLabel.textContent = `Section: ${config.title}`;
        if (catInput) catInput.value = category;

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
            customOpt.textContent = 'Other / Custom Rank...';
            rankSelect.appendChild(customOpt);
        }

        if (customRankGroup) customRankGroup.style.display = 'none';
        if (nameInput) nameInput.value = '';
        if (initialsInput) initialsInput.value = '';
        overlay.classList.add('active');
        if (nameInput && typeof nameInput.focus === 'function') {
            setTimeout(() => nameInput.focus(), 50);
        }
    }

    function addMemberToSection(category, name, role, initials) {
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
            if (role.toLowerCase().includes('associate')) {
                badgeClass = 'badge-associate';
                avatarClass = 'avatar-associate';
            } else {
                badgeClass = 'badge-police';
                avatarClass = 'avatar-police';
            }
        }

        const card = document.createElement('div');
        card.className = `roster-card ${cardTier}`.trim();
        card.setAttribute('data-category', category);
        card.setAttribute('data-name', name);
        card.setAttribute('data-role', role);

        card.innerHTML = `
            <div class="roster-avatar ${avatarClass}">${escapeHtml(initials)}</div>
            <div class="roster-info">
                <h4 class="roster-name">${escapeHtml(name)}</h4>
                <span class="rank-badge ${badgeClass}">${escapeHtml(role)}</span>
            </div>
        `;

        grid.appendChild(card);
        attachRemoveButton(card);
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
                badgeClass = role.toLowerCase().includes('associate') ? 'badge-associate' : 'badge-police';
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
            });
            createAddMemberModal();
            initRosterDragAndDrop();
        }
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

                // Save on input (real-time typing)
                element.addEventListener('input', () => {
                    const currentText = element.innerHTML.trim();
                    saveTextEdit(storageKey, currentText);
                    if (element.closest('#roster-container')) {
                        saveRosterState();
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
                if (element.tagName.match(/^H[1-6]$/) || element.classList.contains('roster-avatar') || element.classList.contains('rank-badge')) {
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

        // 1. Collect all distinct HTML pages that have edits
        const editedPages = new Set();
        Object.keys(edits).forEach(key => {
            const match = key.match(/^edit_v2_([a-zA-Z0-9_\-\.]+\.html)_/);
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
                    const storageKey = `edit_v2_${pageName}_${getElementSelectorPath(element)}`;
                    if (edits[storageKey] !== undefined && edits[storageKey] !== null) {
                        const newContent = edits[storageKey].trim();
                        if (element.innerHTML.trim() !== newContent) {
                            element.innerHTML = newContent;
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
        bar.style.background = 'rgba(15, 17, 21, 0.95)';
        bar.style.padding = '8px 14px';
        bar.style.borderRadius = '40px';
        bar.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        bar.style.backdropFilter = 'blur(12px)';
        bar.style.boxShadow = '0 10px 35px rgba(0,0,0,0.7)';

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

        // 2. Toggle Edit Mode Button
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

        // 3. Admin Portal link button
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

        // 4. Quick Logout Button
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
                document.querySelectorAll('.roster-card.roster-card-draggable').forEach(card => {
                    card.setAttribute('draggable', 'true');
                });
            } else {
                document.body.classList.remove('admin-edit-mode');
                toggleBtn.style.background = 'rgba(211, 47, 47, 0.9)'; // Red for OFF
                toggleBtn.innerHTML = '⚡ Edit Mode: OFF';
                
                getEditableElements().forEach(element => {
                    element.setAttribute('contenteditable', 'false');
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
            if (footer) footer.style.display = 'none';
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

    if (publishForm) {
        publishForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('post-title').value.trim();
            const category = document.getElementById('post-category').value;
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

                html += `
                    <div class="admin-post-item">
                        <div class="admin-post-info">
                            <h4>${title}</h4>
                            <div class="admin-post-meta">
                                <span>Category:</span> ${categoryLabel} | <span>Date:</span> ${date}
                            </div>
                        </div>
                        <button class="btn btn-danger delete-btn" data-id="${post.id}" style="padding: 6px 12px; font-size: 0.85rem; font-family: var(--font-heading); font-weight: 600; border-radius: 6px; border: none; cursor: pointer;">Delete</button>
                    </div>
                `;
            } catch (e) {
                console.error("Failed to render admin list item:", e);
            }
        });

        container.innerHTML = html;

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
                const imageHtml = post.image ? `<div class="news-card-img" style="background-image: url('${post.image}');"></div>` : '';

                html += `
                    <div class="news-card glass-card fade-in visible" data-category="${category}">
                        ${imageHtml}
                        <div class="news-card-body">
                            <span class="news-card-tag tag-${category}">
                                ${tagLabel}
                            </span>
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
            const date = escapeHtml(post.date || 'Recent');
            const category = post.category === 'news' ? 'news' : 'calls';
            const tagLabel = category === 'news' ? 'News & Events' : 'Fire Call';

            html += `
                <a href="news.html" class="recent-post-item category-${category} fade-in visible">
                    <div class="recent-post-meta">
                        <span class="recent-post-tag tag-${category}">${tagLabel}</span>
                        <span class="recent-post-date">${date}</span>
                    </div>
                    <h4 class="recent-post-title">${title}</h4>
                    <p class="recent-post-snippet">${text}</p>
                </a>
            `;
        });

        homeRecentPostsList.innerHTML = html;
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

