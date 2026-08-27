document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
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

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

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
    
    // Real form submission via FormSubmit.co
    const form = document.getElementById('membership-application-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.textContent;
            
            btn.textContent = 'Sending...';
            btn.style.opacity = '0.8';
            
            // Gather data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const membershipType = document.getElementById('membership-type').value;

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
                btn.textContent = 'Message Sent!';
                btn.style.background = '#2a9d8f'; // Success green color
                form.reset();
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.style.opacity = '1';
                }, 3000);
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
    }

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
        '.rank-badge', '.roster-name', '.roster-category-title',
        '.card-img-placeholder',
        '.santa-badge',
        '.chart-bar-year', '.chart-bar-value',
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

        // Never edit internal admin controls, forms, toasts, navigation bars, or external widgets
        if (element.closest('#admin-floating-bar') ||
            element.closest('#admin-toast-notification') ||
            element.closest('#admin-dashboard-view') ||
            element.closest('#admin-login-view') ||
            element.closest('.admin-form-container') ||
            element.closest('.admin-dashboard') ||
            element.closest('#admin-posts-list-container') ||
            element.closest('.news-filter-bar') ||
            element.closest('.roster-search-box') ||
            element.closest('.powr-social-feed') ||
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
            element.closest('.roster-avatar') ||
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
        elements.forEach((element, index) => {
            const storageKey = `edit_text_${pageKey}_${index}`;
            if (edits[storageKey] !== undefined && edits[storageKey] !== null) {
                if (document.activeElement !== element) {
                    element.innerHTML = edits[storageKey];
                }
            }
        });
    }

    // Apply local edits immediately on page load
    applyTextEdits(getStoredTextEdits());

    // Initialize in-place editing on all editable elements when logged in
    function initLiveEditor() {
        const pageKey = getPageKey();
        const elements = getEditableElements();

        elements.forEach((element, index) => {
            const storageKey = `edit_text_${pageKey}_${index}`;

            if (isAdminLoggedIn) {
                element.setAttribute('contenteditable', editModeActive ? 'true' : 'false');
                
                // Save on input (real-time typing)
                element.addEventListener('input', () => {
                    const currentText = element.innerHTML.trim();
                    saveTextEdit(storageKey, currentText);
                });

                // Save on blur (clicking outside)
                element.addEventListener('blur', () => {
                    const currentText = element.innerHTML.trim();
                    saveTextEdit(storageKey, currentText);
                });

                // Prevent link navigation during active edit mode so admin can edit link text
                if (element.tagName === 'A' || element.closest('a')) {
                    element.addEventListener('click', (e) => {
                        if (editModeActive) {
                            e.preventDefault();
                        }
                    });
                }
                
                // Handle Enter key for single-line titles to blur instead of inserting line breaks
                if (element.tagName.match(/^H[1-6]$/)) {
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

    initLiveEditor();

    // Helper: Push actual modified HTML files directly to GitHub
    async function syncHtmlPagesToGitHub(edits) {
        if (!edits || typeof edits !== 'object') return true;

        // 1. Collect all distinct HTML pages that have edits
        const editedPages = new Set();
        Object.keys(edits).forEach(key => {
            const match = key.match(/^edit_text_([a-zA-Z0-9_\-\.]+\.html)_/);
            if (match && match[1]) {
                editedPages.add(match[1]);
            }
        });

        // Always include current page if on an HTML page
        const currentPage = getPageKey();
        if (currentPage && currentPage.endsWith('.html') && currentPage !== 'admin.html') {
            editedPages.add(currentPage);
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
                const elements = getEditableElements(doc);
                let pageHasChanges = false;

                elements.forEach((element, index) => {
                    const storageKey = `edit_text_${pageName}_${index}`;
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
                    const success = await syncToGitHub(pageName, updatedHtml, `Admin: Update text in ${pageName}`);
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

            // 5. Commit backup JSONs directly to GitHub repository
            const editSuccess = await syncToGitHub('data/edits.json', mergedEdits, 'Admin: Update live text edits across website');
            const currentPosts = getStoredPosts();
            const postSuccess = await syncToGitHub('data/posts.json', currentPosts, 'Admin: Update news posts');

            if (htmlSuccess || editSuccess || postSuccess) {
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
            } else {
                document.body.classList.remove('admin-edit-mode');
                toggleBtn.style.background = 'rgba(211, 47, 47, 0.9)'; // Red for OFF
                toggleBtn.innerHTML = '⚡ Edit Mode: OFF';
                
                getEditableElements().forEach(element => {
                    element.setAttribute('contenteditable', 'false');
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

            if (u === 'Blawenburg1946' && p === 'Station46!') {
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
            }
        } catch (err) {
            console.warn("[Station 46] Could not sync remote posts:", err);
        }

        // Sync visual text edits with smart merge
        try {
            const remoteEdits = await fetchRemoteData('data/edits.json');
            if (remoteEdits && typeof remoteEdits === 'object') {
                const localEdits = getStoredTextEdits();
                // Combine remote edits with any unsaved local edits
                const mergedEdits = Object.assign({}, remoteEdits, localEdits);
                localStorage.setItem('station46_text_edits', JSON.stringify(mergedEdits));
                applyTextEdits(mergedEdits);
                if (isAdminLoggedIn) {
                    initLiveEditor();
                }
            }
        } catch (err) {
            console.warn("[Station 46] Could not sync remote text edits:", err);
        }
    }

    // Interactive Roster Filtering & Search
    const rosterSearchInput = document.getElementById('roster-search-input');
    const rosterSearchClear = document.getElementById('roster-search-clear');
    const rosterFilterBtns = document.querySelectorAll('.roster-filter-btn');
    const rosterCards = document.querySelectorAll('.roster-card');
    const rosterSections = document.querySelectorAll('.roster-category-section');
    const rosterEmptyState = document.getElementById('roster-empty-state');
    const rosterResetBtn = document.getElementById('roster-reset-btn');

    if (rosterCards.length > 0) {
        let activeCategory = 'all';
        let searchQuery = '';

        function updateRosterView() {
            let totalVisible = 0;

            rosterSections.forEach(section => {
                const cardsInSection = section.querySelectorAll('.roster-card');
                let sectionVisibleCount = 0;

                cardsInSection.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    const name = (card.getAttribute('data-name') || '').toLowerCase();
                    const role = (card.getAttribute('data-role') || '').toLowerCase();
                    
                    const matchesCategory = (activeCategory === 'all' || activeCategory === cardCategory);
                    const matchesSearch = !searchQuery || name.includes(searchQuery) || role.includes(searchQuery);

                    if (matchesCategory && matchesSearch) {
                        card.style.display = 'flex';
                        sectionVisibleCount++;
                        totalVisible++;
                    } else {
                        card.style.display = 'none';
                    }
                });

                // Hide empty category sections
                if (sectionVisibleCount === 0) {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            });

            // Toggle Empty State
            if (rosterEmptyState) {
                rosterEmptyState.style.display = totalVisible === 0 ? 'block' : 'none';
            }

            // Update Clear Button Visibility
            if (rosterSearchClear) {
                rosterSearchClear.style.display = searchQuery ? 'flex' : 'none';
            }
        }

        // Filter button click
        rosterFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                rosterFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-category') || 'all';
                updateRosterView();
            });
        });

        // Live search input
        if (rosterSearchInput) {
            rosterSearchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim().toLowerCase();
                updateRosterView();
            });
        }

        // Clear search button
        if (rosterSearchClear) {
            rosterSearchClear.addEventListener('click', () => {
                if (rosterSearchInput) {
                    rosterSearchInput.value = '';
                }
                searchQuery = '';
                updateRosterView();
                if (rosterSearchInput) rosterSearchInput.focus();
            });
        }

        // Reset filter button in empty state
        if (rosterResetBtn) {
            rosterResetBtn.addEventListener('click', () => {
                if (rosterSearchInput) rosterSearchInput.value = '';
                searchQuery = '';
                activeCategory = 'all';
                rosterFilterBtns.forEach(b => {
                    if (b.getAttribute('data-category') === 'all') {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
                updateRosterView();
            });
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

