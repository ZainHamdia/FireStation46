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

    // Helper: Get posts from localStorage
    function getStoredPosts() {
        const posts = localStorage.getItem('station46_posts');
        return posts ? JSON.parse(posts) : [];
    }

    // Helper: Save posts to localStorage
    function savePosts(posts) {
        localStorage.setItem('station46_posts', JSON.stringify(posts));
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

    // Helper: Check if element is allowed to be edited
    function isEditableElement(element) {
        if (element.closest('.navbar') || 
            element.closest('#admin-navbar') || 
            element.closest('footer') || 
            element.closest('#admin-footer') || 
            element.closest('.admin-dashboard') || 
            element.closest('.admin-form-container') || 
            element.closest('form') ||
            element.closest('.news-filter-bar') ||
            element.classList.contains('empty-state-title') ||
            element.classList.contains('empty-state-desc')) {
            return false;
        }
        return true;
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
    const editableSelectors = 'h1, h2, h3, h4, h5, h6, p, li, .section-subtitle, .hero-subtitle, .donation-amount';

    document.querySelectorAll(editableSelectors).forEach((element, index) => {
        if (!isEditableElement(element)) return;

        // Generate a unique storage key for this specific text element on this page
        const storageKey = `edit_text_${window.location.pathname}_${index}`;
        
        // Restore saved text if it exists
        const savedText = localStorage.getItem(storageKey);
        if (savedText) {
            element.innerHTML = savedText;
        }

        // If admin is logged in, enable editing
        if (isAdminLoggedIn) {
            element.setAttribute('contenteditable', 'true');
            
            // Add listeners to save updates on blur
            element.addEventListener('blur', () => {
                const currentText = element.innerHTML.trim();
                localStorage.setItem(storageKey, currentText);
            });
            
            // Handle Enter key for title lines to blur instead of inserting line break (optional)
            if (element.tagName.match(/^H[1-6]$/)) {
                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        element.blur();
                    }
                });
            }
        }
    });

    // Add a floating admin control bar on all pages when logged in
    if (isAdminLoggedIn && !document.getElementById('admin-floating-bar')) {
        const bar = document.createElement('div');
        bar.id = 'admin-floating-bar';
        bar.style.position = 'fixed';
        bar.style.bottom = '2rem';
        bar.style.left = '2rem';
        bar.style.display = 'flex';
        bar.style.gap = '0.5rem';
        bar.style.zIndex = '9999';
        bar.style.background = 'rgba(15, 17, 21, 0.85)';
        bar.style.padding = '6px';
        bar.style.borderRadius = '40px';
        bar.style.border = '1px solid rgba(255,255,255,0.08)';
        bar.style.backdropFilter = 'blur(10px)';
        bar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';

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
        toggleBtn.style.transition = 'all var(--transition-fast)';
        toggleBtn.style.fontFamily = 'var(--font-heading)';
        toggleBtn.innerHTML = '⚡ Edit Mode: ON';

        const quickLogoutBtn = document.createElement('button');
        quickLogoutBtn.id = 'admin-quick-logout-btn';
        quickLogoutBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        quickLogoutBtn.style.color = 'rgba(255, 255, 255, 0.8)';
        quickLogoutBtn.style.padding = '10px 18px';
        quickLogoutBtn.style.borderRadius = '30px';
        quickLogoutBtn.style.fontSize = '0.85rem';
        quickLogoutBtn.style.fontWeight = '700';
        quickLogoutBtn.style.border = 'none';
        quickLogoutBtn.style.cursor = 'pointer';
        quickLogoutBtn.style.transition = 'all var(--transition-fast)';
        quickLogoutBtn.style.fontFamily = 'var(--font-heading)';
        quickLogoutBtn.innerHTML = 'Log Out';

        // Hover animations
        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.transform = 'translateY(-1px)';
        });
        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.transform = 'none';
        });
        quickLogoutBtn.addEventListener('mouseenter', () => {
            quickLogoutBtn.style.background = 'rgba(211, 47, 47, 0.9)'; // Turn red on hover
            quickLogoutBtn.style.color = 'white';
            quickLogoutBtn.style.transform = 'translateY(-1px)';
        });
        quickLogoutBtn.addEventListener('mouseleave', () => {
            quickLogoutBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            quickLogoutBtn.style.color = 'rgba(255, 255, 255, 0.8)';
            quickLogoutBtn.style.transform = 'none';
        });

        bar.appendChild(toggleBtn);
        bar.appendChild(quickLogoutBtn);
        document.body.appendChild(bar);
        document.body.classList.add('admin-edit-mode');

        let editModeActive = true;

        toggleBtn.addEventListener('click', () => {
            editModeActive = !editModeActive;
            
            if (editModeActive) {
                document.body.classList.add('admin-edit-mode');
                toggleBtn.style.background = 'rgba(46, 125, 50, 0.9)'; // Green
                toggleBtn.innerHTML = '⚡ Edit Mode: ON';
                
                document.querySelectorAll(editableSelectors).forEach(element => {
                    if (isEditableElement(element)) {
                        element.setAttribute('contenteditable', 'true');
                    }
                });
            } else {
                document.body.classList.remove('admin-edit-mode');
                toggleBtn.style.background = 'rgba(211, 47, 47, 0.9)'; // Red for OFF
                toggleBtn.innerHTML = '⚡ Edit Mode: OFF';
                
                document.querySelectorAll(editableSelectors).forEach(element => {
                    if (isEditableElement(element)) {
                        element.setAttribute('contenteditable', 'false');
                    }
                });
            }
        });

        quickLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('admin_logged_in');
            window.location.reload();
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
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                let posts = getStoredPosts();
                posts = posts.filter(post => post.id !== id);
                savePosts(posts);
                renderAdminPosts();
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
});

