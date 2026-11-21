// Cloudflare Pages Function: Contact & Membership Application Handler
// Route: /api/contact
//
// 1. Attempts email delivery via configured providers in priority order:
//    - Client-side Web3Forms / FormSubmit (when already delivered by the browser)
//    - Cloudflare native EMAIL binding (env.EMAIL)
//    - Resend API (env.RESEND_API_KEY)
//    - Brevo API (env.BREVO_API_KEY)
//    - Custom Mail Webhook / Google Apps Script (env.MAIL_WEBHOOK_URL or data/email_config.json webhookUrl)
//    - Web3Forms API (ONLY when a real Web3Forms UUID key is configured)
//    - FormSubmit.co fallback (using activated token for mtvfc2.com)
// 2. Always saves a backup copy of the inquiry to `data/inquiries.json` on GitHub (via GITHUB_TOKEN)
//    so no inquiry is ever lost and admins can view/resend inquiries from `admin.html`.
// 3. Supports GET status check + authenticated admin actions (`list`, `delete`, `save_email_config`, `resend`, `test`).

const DEFAULT_RECIPIENT = 'membership@mtvfc2.com';
const DEFAULT_FORMSUBMIT_TOKEN = '37b00baefbf5e196fca875307c200558';
const DEFAULT_REPO = 'ZainHamdia/FireStation46';
const DEFAULT_USER = 'blawenburg1946';
const INQUIRIES_PATH = 'data/inquiries.json';
const EMAIL_CONFIG_PATH = 'data/email_config.json';
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX32_RE = /^[a-f0-9]{32}$/i;
const HTTPS_URL_RE = /^https:\/\/[^\s]+$/i;

function classifyRelayKey(raw) {
    const val = String(raw || '').trim();
    if (!val) return null;
    if (UUID_RE.test(val)) return 'web3forms';
    if (HEX32_RE.test(val)) return 'formsubmit';
    if (HTTPS_URL_RE.test(val)) return 'webhook';
    return null;
}

function defaultEmailConfig() {
    return {
        recipientEmail: DEFAULT_RECIPIENT,
        formsubmitToken: DEFAULT_FORMSUBMIT_TOKEN,
        web3formsKey: '',
        webhookUrl: ''
    };
}

function normalizeEmailConfig(raw) {
    const base = defaultEmailConfig();
    if (!raw || typeof raw !== 'object') return base;

    const cfg = {
        recipientEmail: String(raw.recipientEmail || DEFAULT_RECIPIENT).trim() || DEFAULT_RECIPIENT,
        formsubmitToken: DEFAULT_FORMSUBMIT_TOKEN,
        web3formsKey: '',
        webhookUrl: ''
    };

    const candidates = [raw.formsubmitToken, raw.web3formsKey, raw.webhookUrl];
    for (const c of candidates) {
        const val = String(c || '').trim();
        const kind = classifyRelayKey(val);
        if (kind === 'formsubmit') cfg.formsubmitToken = val;
        else if (kind === 'web3forms') cfg.web3formsKey = val;
        else if (kind === 'webhook') cfg.webhookUrl = val;
    }

    return cfg;
}

function getConfiguredServerProviders(env, cfg) {
    const providers = [];
    if (env && env.EMAIL && typeof env.EMAIL.send === 'function') providers.push('cloudflare-email');
    if (env && env.RESEND_API_KEY) providers.push('resend');
    if (env && env.BREVO_API_KEY) providers.push('brevo');
    if ((env && env.MAIL_WEBHOOK_URL && HTTPS_URL_RE.test(String(env.MAIL_WEBHOOK_URL).trim())) || (cfg && cfg.webhookUrl && HTTPS_URL_RE.test(cfg.webhookUrl))) {
        providers.push('webhook');
    }
    if (env && env.WEB3FORMS_KEY && UUID_RE.test(String(env.WEB3FORMS_KEY).trim())) {
        providers.push('web3forms-env');
    }
    return providers;
}

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function safeEqual(a, b) {
    a = String(a || '');
    b = String(b || '');
    let diff = a.length ^ b.length;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    return diff === 0;
}

function isAuthorized(env, username, password) {
    if (!env || !env.ADMIN_PASSWORD) return false;
    const expectedUser = (env.ADMIN_USERNAME || DEFAULT_USER).toLowerCase();
    return safeEqual(String(username || '').trim().toLowerCase(), expectedUser)
        && safeEqual(password, env.ADMIN_PASSWORD);
}

function ghHeaders(env) {
    return {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'station46-contact',
        'X-GitHub-Api-Version': '2022-11-28'
    };
}

function contentsUrl(env, path) {
    const repo = (env && env.GITHUB_REPO) || DEFAULT_REPO;
    return `https://api.github.com/repos/${repo}/contents/${path}`;
}

function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
}

function base64ToUtf8(b64) {
    const bin = atob(String(b64 || '').replace(/\s/g, ''));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
}

async function getJsonFileFromGitHub(env, path, defaultVal) {
    if (!env || !env.GITHUB_TOKEN) return { data: defaultVal, sha: null };
    const branch = env.GITHUB_BRANCH || 'main';
    const res = await fetch(`${contentsUrl(env, path)}?ref=${encodeURIComponent(branch)}`, {
        headers: ghHeaders(env)
    });
    if (res.status === 404) return { data: defaultVal, sha: null };
    if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status}`);
    const file = await res.json();
    let data = defaultVal;
    try {
        const parsed = JSON.parse(base64ToUtf8(file.content));
        if (parsed !== null && typeof parsed === 'object') data = parsed;
    } catch (e) {}
    return { data, sha: file.sha };
}

async function saveJsonFileToGitHub(env, path, data, sha, commitMessage) {
    if (!env || !env.GITHUB_TOKEN) return false;
    const branch = env.GITHUB_BRANCH || 'main';
    const contentB64 = utf8ToBase64(JSON.stringify(data, null, 2) + '\n');
    const payload = {
        message: commitMessage || `Update ${path}`,
        content: contentB64,
        branch
    };
    if (sha) payload.sha = sha;

    const putRes = await fetch(contentsUrl(env, path), {
        method: 'PUT',
        headers: { ...ghHeaders(env), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return putRes.ok;
}

async function getInquiriesFile(env) {
    const res = await getJsonFileFromGitHub(env, INQUIRIES_PATH, []);
    return { list: Array.isArray(res.data) ? res.data : [], sha: res.sha };
}

async function saveInquiriesFile(env, list, sha, commitMessage) {
    return saveJsonFileToGitHub(env, INQUIRIES_PATH, list, sha, commitMessage || 'Update inquiries log');
}

async function appendInquiryToGitHub(env, entry) {
    if (!env || !env.GITHUB_TOKEN) return false;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const current = await getInquiriesFile(env);
            if (!current) return false;
            const updated = [entry, ...current.list].slice(0, 250);
            const ok = await saveInquiriesFile(
                env,
                updated,
                current.sha,
                `New website inquiry from ${entry.name} (${entry.topic})`
            );
            if (ok) return true;
        } catch (e) {
            if (attempt === 1) return false;
        }
    }
    return false;
}

function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timer));
}

async function verifyTurnstileToken(secretKey, token, remoteIp) {
    const secret = String(secretKey || '').trim();
    const response = String(token || '').trim();
    if (!secret) return { ok: true, skipped: true, errorCodes: [] };
    if (!response) return { ok: false, errorCodes: ['missing-input-response'] };

    try {
        const params = new URLSearchParams();
        params.set('secret', secret);
        params.set('response', response);
        if (remoteIp) params.set('remoteip', String(remoteIp).trim());

        const res = await fetchWithTimeout('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        }, 8000);

        const data = await res.json().catch(() => ({}));
        return {
            ok: Boolean(res.ok && data && data.success),
            errorCodes: Array.isArray(data && data['error-codes']) ? data['error-codes'] : []
        };
    } catch (err) {
        return {
            ok: false,
            errorCodes: [err.name === 'AbortError' ? 'verify-timeout' : 'verify-network-error']
        };
    }
}

function buildEmailContent({ name, email, phone, topic, message, subject, page, timestamp }) {
    const plainText = [
        `New Inquiry / Application — Montgomery Township Volunteer Fire Company #2 (Station 46)`,
        `--------------------------------------------------------------------------------`,
        `Name:      ${name}`,
        `Email:     ${email}`,
        `Phone:     ${phone || 'Not provided'}`,
        `Topic:     ${topic}`,
        message ? `\nMessage:\n${message}\n` : '',
        `--------------------------------------------------------------------------------`,
        `Submitted: ${timestamp}${page ? ` (${page})` : ''}`
    ].filter(Boolean).join('\n');

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: #9b1b24; color: #ffffff; padding: 16px 24px;">
                <h2 style="margin: 0; font-size: 18px;">Station 46 Website Inquiry</h2>
                <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Montgomery Township Volunteer Fire Company #2</p>
            </div>
            <div style="padding: 24px; background: #ffffff; color: #1e293b;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; width: 110px; color: #475569;">Name:</td>
                        <td style="padding: 8px 0;">${escapeHtml(name)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email:</td>
                        <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #475569;">Phone:</td>
                        <td style="padding: 8px 0;">${escapeHtml(phone || 'Not provided')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #475569;">Topic / Role:</td>
                        <td style="padding: 8px 0;"><strong>${escapeHtml(topic)}</strong></td>
                    </tr>
                </table>
                ${message ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                    <div style="font-weight: bold; color: #475569; font-size: 13px; margin-bottom: 6px;">Message / Inquiry:</div>
                    <div style="white-space: pre-wrap; background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 14px; line-height: 1.5;">${escapeHtml(message)}</div>
                </div>` : ''}
            </div>
            <div style="background: #f1f5f9; padding: 12px 24px; font-size: 12px; color: #64748b;">
                Submitted on ${escapeHtml(timestamp)}${page ? ` from ${escapeHtml(page)}` : ''}
            </div>
        </div>
    `;

    return { plainText, htmlBody };
}

async function deliverEmailServerSide(env, cfg, details, options = {}) {
    const recipient = (env && env.CONTACT_EMAIL) || (cfg && cfg.recipientEmail) || DEFAULT_RECIPIENT;
    const { name, email, phone, topic, message, subject, page, timestamp } = details;
    const { plainText, htmlBody } = buildEmailContent(details);

    const errors = [];
    let emailDelivered = false;
    let emailProvider = null;

    // 1. Try Cloudflare Native Email Binding (if configured on the Pages project)
    if (!emailDelivered && env && env.EMAIL && typeof env.EMAIL.send === 'function') {
        try {
            await env.EMAIL.send({
                from: (env && env.EMAIL_FROM) || 'noreply@mtvfc2.com',
                to: recipient,
                replyTo: email,
                subject,
                text: plainText,
                html: htmlBody
            });
            emailDelivered = true;
            emailProvider = 'cloudflare-email';
        } catch (err) {
            errors.push(`cloudflare-email: ${String(err.message || err).slice(0, 140)}`);
        }
    }

    // 2. Try Resend API (if RESEND_API_KEY is configured in Cloudflare environment variables)
    if (!emailDelivered && env && env.RESEND_API_KEY) {
        const configuredFrom = env.RESEND_FROM && String(env.RESEND_FROM).trim();
        const fromCandidates = configuredFrom
            ? [configuredFrom]
            : ['Station 46 Website <noreply@mtvfc2.com>', 'Station 46 Website <onboarding@resend.dev>'];

        for (const fromAddr of fromCandidates) {
            try {
                const res = await fetchWithTimeout('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: fromAddr,
                        to: [recipient],
                        reply_to: email,
                        subject,
                        text: plainText,
                        html: htmlBody
                    })
                }, 8000);

                if (res.ok) {
                    emailDelivered = true;
                    emailProvider = 'resend';
                    break;
                } else {
                    const errData = await res.json().catch(() => ({}));
                    const errDetail = errData.message || errData.name || '';
                    errors.push(`resend (${fromAddr.includes('onboarding@resend.dev') ? 'sandbox' : 'domain'}): HTTP ${res.status} ${errDetail}`.trim().slice(0, 160));
                    // Only fall through to onboarding@resend.dev if domain wasn't verified (403/422)
                    if (res.status !== 403 && res.status !== 422) break;
                }
            } catch (err) {
                errors.push(`resend: ${err.name === 'AbortError' ? 'timeout' : String(err.message || err).slice(0, 140)}`);
                break;
            }
        }
    }

    // 3. Try Brevo Transactional Email API (if BREVO_API_KEY is configured in Cloudflare env vars)
    if (!emailDelivered && env && env.BREVO_API_KEY) {
        try {
            const senderEmail = (env.BREVO_FROM_EMAIL && String(env.BREVO_FROM_EMAIL).trim()) || recipient;
            const res = await fetchWithTimeout('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'api-key': env.BREVO_API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: 'Station 46 Website', email: senderEmail },
                    to: [{ email: recipient, name: 'MTVFC #2 Membership' }],
                    replyTo: { email, name },
                    subject,
                    textContent: plainText,
                    htmlContent: htmlBody
                })
            }, 8000);

            if (res.ok) {
                emailDelivered = true;
                emailProvider = 'brevo';
            } else {
                const errData = await res.json().catch(() => ({}));
                errors.push(`brevo: HTTP ${res.status} ${errData.message || ''}`.trim().slice(0, 160));
            }
        } catch (err) {
            errors.push(`brevo: ${err.name === 'AbortError' ? 'timeout' : String(err.message || err).slice(0, 140)}`);
        }
    }

    // 4. Try Custom Mail Webhook / Google Apps Script Web App (env.MAIL_WEBHOOK_URL or data/email_config.json webhookUrl)
    const webhookUrl = String((env && env.MAIL_WEBHOOK_URL) || (cfg && cfg.webhookUrl) || '').trim();
    if (!emailDelivered && webhookUrl && HTTPS_URL_RE.test(webhookUrl)) {
        try {
            const res = await fetchWithTimeout(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    to: recipient,
                    replyTo: email,
                    name,
                    email,
                    phone: phone || 'Not provided',
                    topic,
                    message: message || '',
                    subject,
                    text: plainText,
                    html: htmlBody,
                    page: page || '',
                    timestamp
                })
            }, 10000);

            const data = await res.json().catch(() => ({}));
            if (res.ok && data.ok !== false && data.success !== false && data.success !== 'false') {
                emailDelivered = true;
                emailProvider = 'webhook';
            } else {
                errors.push(`webhook: HTTP ${res.status} ${data.error || data.message || ''}`.trim().slice(0, 160));
            }
        } catch (err) {
            errors.push(`webhook: ${err.name === 'AbortError' ? 'timeout' : String(err.message || err).slice(0, 140)}`);
        }
    }

    // 5. Try Web3Forms API ONLY when a real Web3Forms UUID key is configured (never with a 32-char FormSubmit hex token)
    const envW3 = String((env && env.WEB3FORMS_KEY) || '').trim();
    const cfgW3 = String((cfg && cfg.web3formsKey) || '').trim();
    const bodyW3 = String(options.web3formsKey || '').trim();
    const web3formsUuid = UUID_RE.test(envW3) ? envW3 : (UUID_RE.test(cfgW3) ? cfgW3 : (UUID_RE.test(bodyW3) ? bodyW3 : ''));

    if (!emailDelivered && web3formsUuid) {
        try {
            const res = await fetchWithTimeout('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': BROWSER_UA,
                    'Origin': 'https://mtvfc2.com',
                    'Referer': 'https://mtvfc2.com/'
                },
                body: JSON.stringify({
                    access_key: web3formsUuid,
                    subject,
                    from_name: 'Station 46 Website',
                    name,
                    email,
                    replyto: email,
                    phone: phone || 'Not provided',
                    topic,
                    message: message || '(No additional message provided)'
                })
            }, 8000);

            const data = await res.json().catch(() => ({}));
            if (res.ok && data && data.success) {
                emailDelivered = true;
                emailProvider = 'web3forms';
            } else {
                errors.push(`web3forms: HTTP ${res.status} ${data.message || ''}`.trim().slice(0, 160));
            }
        } catch (err) {
            errors.push(`web3forms: ${err.name === 'AbortError' ? 'timeout' : String(err.message || err).slice(0, 140)}`);
        }
    }

    // 6. Fallback: FormSubmit.co using activated token for mtvfc2.com (unless caller asked to skip)
    if (!emailDelivered && !options.skipFormSubmit) {
        const fsToken = (cfg && HEX32_RE.test(cfg.formsubmitToken))
            ? cfg.formsubmitToken
            : DEFAULT_FORMSUBMIT_TOKEN;
        try {
            const params = new URLSearchParams();
            params.set('name', name);
            params.set('email', email);
            params.set('phone', phone || 'Not provided');
            params.set('topic', topic);
            params.set('_subject', subject);
            params.set('_replyto', email);
            params.set('_template', 'table');
            params.set('_captcha', 'false');
            params.set('_url', 'https://mtvfc2.com/membership');
            if (message) params.set('message', message);

            const res = await fetchWithTimeout(`https://formsubmit.co/ajax/${encodeURIComponent(fsToken)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'User-Agent': BROWSER_UA,
                    'Origin': 'https://mtvfc2.com',
                    'Referer': 'https://mtvfc2.com/'
                },
                body: params.toString()
            }, 10000);

            const text = await res.text().catch(() => '');
            let data = {};
            try { data = JSON.parse(text); } catch (e) {}

            if (res.ok && (data.success === 'true' || data.success === true)) {
                emailDelivered = true;
                emailProvider = 'formsubmit';
            } else {
                const snippet = data.message || (text.includes('<!DOCTYPE') ? 'blocked/HTML response' : text.slice(0, 80));
                errors.push(`formsubmit: HTTP ${res.status} ${snippet}`.trim().slice(0, 160));
            }
        } catch (err) {
            errors.push(`formsubmit: ${err.name === 'AbortError' ? 'timeout' : String(err.message || err).slice(0, 140)}`);
        }
    }

    return { emailDelivered, emailProvider, errors };
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept',
            'Access-Control-Max-Age': '86400'
        }
    });
}

// Public non-sensitive status check so the frontend knows whether a reliable server-side relay is configured
export async function onRequestGet({ env }) {
    const cfgFile = await getJsonFileFromGitHub(env, EMAIL_CONFIG_PATH, defaultEmailConfig())
        .catch(() => ({ data: defaultEmailConfig() }));
    const cfg = normalizeEmailConfig(cfgFile.data);
    const providers = getConfiguredServerProviders(env, cfg);
    const turnstileSiteKey = String((env && env.TURNSTILE_SITE_KEY) || '').trim();
    const turnstileEnabled = Boolean(turnstileSiteKey && env && env.TURNSTILE_SECRET_KEY);

    return json({
        ok: true,
        recipient: (env && env.CONTACT_EMAIL) || cfg.recipientEmail || DEFAULT_RECIPIENT,
        serverEmailConfigured: providers.length > 0,
        providers,
        web3formsConfigured: Boolean(cfg.web3formsKey),
        turnstileSiteKey,
        turnstileEnabled
    });
}

export async function onRequestPost({ request, env }) {
    let body;
    try {
        body = await request.json();
    } catch {
        return json({ ok: false, error: 'Invalid JSON payload' }, 400);
    }

    // Admin actions: list, delete, save_email_config, resend, test
    if (body && ['list', 'delete', 'save_email_config', 'resend', 'test'].includes(body.action)) {
        if (!isAuthorized(env, body.username, body.password)) {
            return json({ ok: false, error: 'Unauthorized' }, 401);
        }
        try {
            const cfgFile = await getJsonFileFromGitHub(env, EMAIL_CONFIG_PATH, defaultEmailConfig())
                .catch(() => ({ data: defaultEmailConfig(), sha: null }));
            const currentCfg = normalizeEmailConfig(cfgFile.data);

            if (body.action === 'save_email_config') {
                const rawKey = String(body.relayKey || body.web3formsKey || '').trim();
                const kind = classifyRelayKey(rawKey);
                const newCfg = { ...currentCfg, recipientEmail: DEFAULT_RECIPIENT };

                if (!rawKey) {
                    newCfg.web3formsKey = '';
                    newCfg.webhookUrl = '';
                } else if (kind === 'web3forms') {
                    newCfg.web3formsKey = rawKey;
                } else if (kind === 'formsubmit') {
                    newCfg.formsubmitToken = rawKey;
                } else if (kind === 'webhook') {
                    newCfg.webhookUrl = rawKey;
                } else {
                    return json({
                        ok: false,
                        error: 'Unrecognized key format. Paste a Web3Forms UUID key, a FormSubmit 32-character token, or an https:// webhook URL.'
                    }, 400);
                }

                const saved = await saveJsonFileToGitHub(env, EMAIL_CONFIG_PATH, newCfg, cfgFile.sha, 'Admin: Update email delivery configuration');
                const serverProviders = getConfiguredServerProviders(env, newCfg);
                return json({
                    ok: saved,
                    keyType: kind || 'cleared',
                    emailConfig: newCfg,
                    serverProviders,
                    serverEmailConfigured: serverProviders.length > 0
                });
            }

            if (body.action === 'test') {
                const details = {
                    name: 'Station 46 Admin Test',
                    email: DEFAULT_RECIPIENT,
                    phone: '(609) 466-3926',
                    topic: 'Email Relay Verification',
                    message: 'This is an automated test confirming that Station 46 website forms deliver directly to membership@mtvfc2.com.',
                    subject: 'Station 46 Website — Test Email Delivery',
                    page: '/admin.html',
                    timestamp: new Date().toISOString()
                };
                const result = await deliverEmailServerSide(env, currentCfg, details, {
                    web3formsKey: body.web3formsKey
                });
                const serverProviders = getConfiguredServerProviders(env, currentCfg);
                return json({
                    ok: result.emailDelivered,
                    emailDelivered: result.emailDelivered,
                    provider: result.emailProvider,
                    errors: result.errors,
                    serverProviders
                }, result.emailDelivered ? 200 : 502);
            }

            const current = await getInquiriesFile(env);
            const serverProviders = getConfiguredServerProviders(env, currentCfg);

            if (body.action === 'list') {
                return json({
                    ok: true,
                    inquiries: current ? current.list : [],
                    emailConfig: currentCfg,
                    serverProviders,
                    serverEmailConfigured: serverProviders.length > 0
                });
            }

            if (body.action === 'delete' && body.id) {
                const filtered = (current ? current.list : []).filter(item => String(item.id) !== String(body.id));
                await saveInquiriesFile(env, filtered, current ? current.sha : null, `Admin: Delete inquiry ${body.id}`);
                return json({ ok: true, inquiries: filtered });
            }

            if (body.action === 'resend' && body.id) {
                const list = current ? [...current.list] : [];
                const idx = list.findIndex(item => String(item.id) === String(body.id));
                if (idx === -1) return json({ ok: false, error: 'Inquiry not found' }, 404);

                const item = list[idx];
                let emailDelivered = Boolean(body.clientEmailDelivered);
                let emailProvider = emailDelivered ? (body.clientProvider || 'client-resend') : null;
                let errors = [];

                if (!emailDelivered) {
                    const result = await deliverEmailServerSide(env, currentCfg, {
                        name: item.name || 'Applicant',
                        email: item.email || DEFAULT_RECIPIENT,
                        phone: item.phone || '',
                        topic: item.topic || 'General Inquiry',
                        message: item.message || '',
                        subject: item.subject || `MTVFC #2 Inquiry: ${item.topic || 'General'}`,
                        page: item.page || '/membership',
                        timestamp: item.createdAt || new Date().toISOString()
                    });
                    emailDelivered = result.emailDelivered;
                    emailProvider = result.emailProvider;
                    errors = result.errors;
                }

                if (emailDelivered) {
                    list[idx] = {
                        ...item,
                        emailDelivered: true,
                        emailProvider: emailProvider || 'resent',
                        resentAt: new Date().toISOString()
                    };
                    delete list[idx].deliveryErrors;
                    await saveInquiriesFile(env, list, current ? current.sha : null, `Admin: Resent inquiry email for ${item.name}`);
                }

                return json({
                    ok: emailDelivered,
                    emailDelivered,
                    provider: emailProvider,
                    errors,
                    inquiries: list
                }, emailDelivered ? 200 : 502);
            }
        } catch (err) {
            return json({ ok: false, error: String(err.message || err) }, 502);
        }
    }

    // Public Contact / Membership Form Submission
    const name = String(body.name || '').trim().slice(0, 200);
    const email = String(body.email || '').trim().slice(0, 200);
    const phone = String(body.phone || '').trim().slice(0, 100);
    const topic = String(body.topic || body.membership_type || 'General Inquiry').trim().slice(0, 200);
    const message = String(body.message || '').trim().slice(0, 5000);
    const subject = String(body._subject || `MTVFC #2 Inquiry: ${topic}`).trim().slice(0, 250);
    const page = String(body.page || '').trim().slice(0, 100);

    if (!name || !email) {
        return json({ ok: false, error: 'Name and email are required.' }, 400);
    }

    // Verify Cloudflare Turnstile CAPTCHA when TURNSTILE_SECRET_KEY is configured
    let captchaVerified = false;
    if (env && env.TURNSTILE_SECRET_KEY) {
        const turnstileToken = String(body.turnstileToken || body['cf-turnstile-response'] || '').trim();
        if (!turnstileToken) {
            return json({
                ok: false,
                captchaFailed: true,
                error: 'Please complete the CAPTCHA verification before submitting.'
            }, 400);
        }
        const remoteIp = request.headers.get('CF-Connecting-IP') || '';
        const verification = await verifyTurnstileToken(env.TURNSTILE_SECRET_KEY, turnstileToken, remoteIp);
        if (!verification.ok) {
            return json({
                ok: false,
                captchaFailed: true,
                error: 'CAPTCHA verification failed or expired. Please complete the check again.',
                errorCodes: verification.errorCodes
            }, 403);
        }
        captchaVerified = true;
    }

    const timestamp = new Date().toISOString();
    const clientErrors = Array.isArray(body.clientErrors)
        ? body.clientErrors.map(e => String(e || '').slice(0, 160)).filter(Boolean).slice(0, 3)
        : [];

    let emailDelivered = Boolean(body.clientEmailDelivered);
    let emailProvider = emailDelivered ? (body.clientProvider || 'client') : null;
    const errors = [...clientErrors];

    let cfg = defaultEmailConfig();
    if (!emailDelivered) {
        try {
            const cfgFile = await getJsonFileFromGitHub(env, EMAIL_CONFIG_PATH, defaultEmailConfig());
            cfg = normalizeEmailConfig(cfgFile.data);
        } catch (e) {}

        const result = await deliverEmailServerSide(env, cfg, {
            name, email, phone, topic, message, subject, page, timestamp
        }, {
            web3formsKey: body.web3formsKey,
            skipFormSubmit: Boolean(body.skipFormSubmit)
        });

        emailDelivered = result.emailDelivered;
        emailProvider = result.emailProvider;
        errors.push(...result.errors);
    }

    // Always record the inquiry to data/inquiries.json via GitHub API so it is never lost
    const inquiryEntry = {
        id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        name,
        email,
        phone: phone || '',
        topic,
        message: message || '',
        subject,
        page: page || 'index.html',
        createdAt: timestamp,
        emailDelivered
    };
    if (emailProvider) inquiryEntry.emailProvider = emailProvider;
    if (!emailDelivered && errors.length) inquiryEntry.deliveryErrors = errors.slice(0, 4);

    const savedToStore = await appendInquiryToGitHub(env, inquiryEntry);

    return json({
        ok: emailDelivered || savedToStore,
        captchaVerified,
        emailDelivered,
        savedToStore,
        provider: emailProvider || (savedToStore ? 'github-store' : null),
        errors
    }, (emailDelivered || savedToStore) ? 200 : 502);
}
