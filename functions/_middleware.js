// Cloudflare Pages Middleware:
// 1. Canonical domain redirect (www.mtvfc2.com -> mtvfc2.com)
// 2. Site-wide Cloudflare Turnstile Visitor Verification Gate before allowing access to website HTML pages

import {
    parseCookieHeader,
    verifySignedVerificationToken
} from './api/turnstile-verify.js';

const DEFAULT_TURNSTILE_SITE_KEY = '0x4AAAAAAGLOv_ROsLMsMTqY';

const STATIC_ASSET_EXT_RE = /\.(?:css|js|mjs|png|jpe?g|gif|webp|svg|ico|json|txt|xml|woff2?|ttf|eot|otf|map|pdf|mp4|webm|avif)$/i;

function isHtmlPageRequest(request, url) {
    if (request.method !== 'GET') return false;
    const pathname = url.pathname || '/';
    if (pathname.startsWith('/api/')) return false;
    if (STATIC_ASSET_EXT_RE.test(pathname)) return false;
    if (pathname === '/' || pathname.toLowerCase().endsWith('.html')) return true;
    const accept = (request.headers.get('Accept') || '').toLowerCase();
    return accept.includes('text/html');
}

function buildEdgeTurnstileGateHtml(siteKey) {
    const safeSiteKey = String(siteKey || DEFAULT_TURNSTILE_SITE_KEY).replace(/[^a-zA-Z0-9_-]/g, '');
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="robots" content="noindex, nofollow">
    <title>Security Verification | MTVFC #2 — Station 46</title>
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
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
            } catch (e) {}
        })();
    </script>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
    <style>
        :root {
            --gate-bg: #f8fafc;
            --gate-card-bg: #ffffff;
            --gate-text: #0f172a;
            --gate-muted: #475569;
            --gate-border: #e2e8f0;
            --gate-red: #9b1b24;
            --gate-red-dark: #7c131a;
            --gate-navy: #0f1e36;
            --gate-shadow: 0 22px 50px -12px rgba(15, 23, 42, 0.16);
            --gate-box-bg: #f1f5f9;
        }
        html[data-theme="dark"] {
            --gate-bg: #080f1d;
            --gate-card-bg: #111c30;
            --gate-text: #f8fafc;
            --gate-muted: #94a3b8;
            --gate-border: #1e293b;
            --gate-box-bg: #0b1424;
            --gate-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.65);
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--gate-bg);
            color: var(--gate-text);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .gate-emergency-bar {
            background: var(--gate-navy);
            color: #ffffff;
            padding: 10px 16px;
            font-size: 0.82rem;
            font-weight: 600;
            text-align: center;
            border-bottom: 3px solid var(--gate-red);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px 18px;
        }
        .gate-emergency-badge {
            background: var(--gate-red);
            color: #ffffff;
            padding: 2px 7px;
            border-radius: 3px;
            font-weight: 700;
            font-size: 0.68rem;
            letter-spacing: 0.4px;
            display: inline-flex;
            align-items: center;
            white-space: nowrap;
        }
        .gate-main {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
        }
        .gate-card {
            width: 100%;
            max-width: 460px;
            background: var(--gate-card-bg);
            border: 1px solid var(--gate-border);
            border-top: 4px solid var(--gate-red);
            border-radius: 6px;
            padding: 32px 28px 26px;
            box-shadow: var(--gate-shadow);
            text-align: center;
        }
        .gate-logo {
            width: 78px;
            height: 78px;
            object-fit: contain;
            margin: 0 auto 14px;
            display: block;
            filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.14));
        }
        .gate-station-tag {
            display: inline-block;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #ffffff;
            background: var(--gate-red);
            padding: 3px 9px;
            border-radius: 3px;
            margin-bottom: 10px;
        }
        html[data-theme="dark"] .gate-station-tag {
            color: #ffffff;
            background: var(--gate-red);
        }
        .gate-title {
            font-size: 1.32rem;
            font-weight: 800;
            line-height: 1.25;
            margin-bottom: 8px;
            color: var(--gate-text);
        }
        .gate-subtitle {
            font-size: 0.9rem;
            line-height: 1.5;
            color: var(--gate-muted);
            margin-bottom: 22px;
        }
        .gate-widget-box {
            background: var(--gate-box-bg);
            border: 1px solid var(--gate-border);
            border-radius: 4px;
            padding: 18px 12px;
            min-height: 104px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 16px;
        }
        .gate-status {
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--gate-muted);
            min-height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .gate-status.is-error {
            color: #dc2626;
        }
        html[data-theme="dark"] .gate-status.is-error {
            color: #f87171;
        }
        .gate-status.is-success {
            color: #16a34a;
            font-weight: 700;
        }
        html[data-theme="dark"] .gate-status.is-success {
            color: #4ade80;
        }
        .gate-retry-btn {
            display: none;
            margin: 10px auto 0;
            padding: 8px 16px;
            background: var(--gate-red);
            color: #ffffff;
            border: none;
            border-radius: 4px;
            font-size: 0.84rem;
            font-weight: 600;
            cursor: pointer;
        }
        .gate-retry-btn:hover {
            background: var(--gate-red-dark);
        }
        .gate-footer {
            margin-top: 18px;
            padding-top: 14px;
            border-top: 1px solid var(--gate-border);
            font-size: 0.76rem;
            color: var(--gate-muted);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .gate-spinner {
            width: 15px;
            height: 15px;
            border: 2px solid currentColor;
            border-right-color: transparent;
            border-radius: 50%;
            display: inline-block;
            animation: gateSpin 0.75s linear infinite;
        }
        @keyframes gateSpin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="gate-emergency-bar">
        <span class="gate-emergency-badge">EMERGENCY: DIAL 911</span>
        <span>Montgomery Township Volunteer Fire Company #2 (Station 46)</span>
        <span>Station: (609) 466-3926 • 529 Route 518, Skillman, NJ</span>
    </div>
    <main class="gate-main">
        <section class="gate-card" aria-labelledby="gate-heading">
            <img src="/logo.png" alt="MTVFC #2 Station 46 Logo" class="gate-logo">
            <span class="gate-station-tag">Station 46 • Skillman, NJ</span>
            <h1 id="gate-heading" class="gate-title">Security Verification Required</h1>
            <p class="gate-subtitle">
                Please complete the verification below to confirm you are human.
            </p>
            <div class="gate-widget-box">
                <div id="turnstile-gate-widget" data-sitekey="${safeSiteKey}"></div>
            </div>
            <div id="turnstile-gate-status" class="gate-status" role="status" aria-live="polite">
                <span class="gate-spinner"></span>
                <span>Loading Cloudflare security challenge...</span>
            </div>
            <button type="button" id="turnstile-gate-retry" class="gate-retry-btn">Try Verification Again</button>
            <div class="gate-footer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Protected by Cloudflare Turnstile • MTVFC #2</span>
            </div>
        </section>
    </main>
    <script>
        (function() {
            var siteKey = ${JSON.stringify(safeSiteKey)};
            var widgetContainer = document.getElementById('turnstile-gate-widget');
            var statusEl = document.getElementById('turnstile-gate-status');
            var retryBtn = document.getElementById('turnstile-gate-retry');
            var widgetId = null;
            var verifying = false;

            function getTheme() {
                var attr = document.documentElement.getAttribute('data-theme');
                if (attr === 'dark' || attr === 'light') return attr;
                return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
            }

            function setStatus(text, type, showSpinner) {
                if (!statusEl) return;
                statusEl.className = 'gate-status' + (type ? ' is-' + type : '');
                statusEl.innerHTML = (showSpinner ? '<span class="gate-spinner"></span>' : '') + '<span>' + text + '</span>';
            }

            async function verifyToken(token) {
                if (verifying || !token) return;
                verifying = true;
                retryBtn.style.display = 'none';
                setStatus('Verifying your security check with Cloudflare...', '', true);

                try {
                    var res = await fetch('/api/turnstile-verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        credentials: 'same-origin',
                        body: JSON.stringify({ token: token })
                    });
                    var data = await res.json().catch(function() { return {}; });
                    if (res.ok && data && data.ok && data.verified) {
                        var exp = data.expiresAt || (Date.now() + 14400000);
                        try {
                            sessionStorage.setItem('station46_visitor_verified', String(exp));
                            if (data.proof) sessionStorage.setItem('station46_visitor_proof', String(data.proof));
                        } catch (e) {}
                        try {
                            document.cookie = 'station46_visitor_verified=' + encodeURIComponent(String(exp)) + '; path=/; max-age=14400; SameSite=Lax';
                        } catch (e) {}
                        setStatus('Verification complete! Entering Station 46...', 'success', false);
                        setTimeout(function() {
                            if (document.cookie.indexOf('station46_visitor_verified=') !== -1) {
                                window.location.reload();
                            } else if (data.proof) {
                                var nextUrl = new URL(window.location.href);
                                nextUrl.searchParams.set('__cf_verified', data.proof);
                                window.location.replace(nextUrl.toString());
                            } else {
                                window.location.reload();
                            }
                        }, 300);
                        return;
                    }
                    throw new Error((data && data.error) || 'Verification rejected. Please try again.');
                } catch (err) {
                    verifying = false;
                    setStatus(err && err.message ? err.message : 'Verification failed. Please try again.', 'error', false);
                    retryBtn.style.display = 'inline-block';
                    if (widgetId !== null && window.turnstile && typeof window.turnstile.reset === 'function') {
                        try { window.turnstile.reset(widgetId); } catch (e) {}
                    }
                }
            }

            function renderGateWidget() {
                if (!window.turnstile || typeof window.turnstile.render !== 'function') return false;
                if (widgetId !== null) return true;
                setStatus('Please complete the verification box above to continue.', '', false);
                widgetId = window.turnstile.render(widgetContainer, {
                    sitekey: siteKey,
                    theme: getTheme(),
                    appearance: 'always',
                    callback: function(token) {
                        verifyToken(token);
                    },
                    'expired-callback': function() {
                        verifying = false;
                        setStatus('Verification expired. Please check the box again.', 'error', false);
                        retryBtn.style.display = 'inline-block';
                    },
                    'error-callback': function() {
                        verifying = false;
                        setStatus('Unable to load security challenge. Click below to retry.', 'error', false);
                        retryBtn.style.display = 'inline-block';
                    }
                });
                return true;
            }

            retryBtn.addEventListener('click', function() {
                retryBtn.style.display = 'none';
                verifying = false;
                if (widgetId !== null && window.turnstile && typeof window.turnstile.reset === 'function') {
                    setStatus('Please complete the verification box above to continue.', '', false);
                    try { window.turnstile.reset(widgetId); } catch (e) {}
                } else {
                    renderGateWidget();
                }
            });

            var started = Date.now();
            var timer = setInterval(function() {
                if (renderGateWidget()) {
                    clearInterval(timer);
                } else if (Date.now() - started > 12000) {
                    clearInterval(timer);
                    setStatus('Security challenge timed out loading. Please refresh the page.', 'error', false);
                    retryBtn.style.display = 'inline-block';
                }
            }, 80);
        })();
    </script>
</body>
</html>`;
}

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const method = request.method;

    // 1. Canonical domain redirect (www.mtvfc2.com -> mtvfc2.com)
    if (
        url.hostname.toLowerCase() === 'www.mtvfc2.com' &&
        (method === 'GET' || method === 'HEAD')
    ) {
        url.hostname = 'mtvfc2.com';
        url.protocol = 'https:';
        return Response.redirect(url.toString(), 301);
    }

    // 2. Cloudflare Turnstile visitor verification gate (temporarily commented out)
    /*
    if (isHtmlPageRequest(request, url)) {
        const cookies = parseCookieHeader(request.headers.get('Cookie') || '');
        const remoteIp = request.headers.get('CF-Connecting-IP') || '';
        const cookieToken = cookies.station46_cf_verified || '';
        const queryProof = url.searchParams.get('__cf_verified') || '';

        const isCookieValid = cookieToken
            ? await verifySignedVerificationToken(env, cookieToken, remoteIp)
            : false;
        const isQueryValid = !isCookieValid && queryProof
            ? await verifySignedVerificationToken(env, queryProof, remoteIp)
            : false;

        if (!isCookieValid && !isQueryValid) {
            const siteKey = String((env && env.TURNSTILE_SITE_KEY) || DEFAULT_TURNSTILE_SITE_KEY).trim();
            return new Response(buildEdgeTurnstileGateHtml(siteKey), {
                status: 200,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'X-Frame-Options': 'DENY'
                }
            });
        }
    }
    */

    return context.next();
}
