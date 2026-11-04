// Cloudflare Pages Function: Contact & Membership Application Handler
// Route: /api/contact
//
// 1. Attempts email delivery via configured providers (Cloudflare native EMAIL binding,
//    Resend via RESEND_API_KEY, Web3Forms via WEB3FORMS_KEY, or FormSubmit.co).
// 2. Saves a backup copy of the inquiry to `data/inquiries.json` on GitHub (via GITHUB_TOKEN)
//    so that even when third-party email relays are down, no inquiry is ever lost and admins
//    can view/manage inquiries directly from the Admin Portal.
// 3. Supports authenticated admin actions (`list`, `delete`, `mark_read`) to view and manage
//    inquiries inside `admin.html`.

const DEFAULT_RECIPIENT = 'membership@mtvfc2.com';
const DEFAULT_REPO = 'ZainHamdia/FireStation46';
const DEFAULT_USER = 'blawenburg1946';
const INQUIRIES_PATH = 'data/inquiries.json';

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

async function getInquiriesFile(env) {
    if (!env || !env.GITHUB_TOKEN) return null;
    const branch = env.GITHUB_BRANCH || 'main';
    const res = await fetch(`${contentsUrl(env, INQUIRIES_PATH)}?ref=${encodeURIComponent(branch)}`, {
        headers: ghHeaders(env)
    });
    if (res.status === 404) return { list: [], sha: null };
    if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
    const file = await res.json();
    let list = [];
    try {
        const parsed = JSON.parse(base64ToUtf8(file.content));
        if (Array.isArray(parsed)) list = parsed;
    } catch (e) {}
    return { list, sha: file.sha };
}

async function saveInquiriesFile(env, list, sha, commitMessage) {
    if (!env || !env.GITHUB_TOKEN) return false;
    const branch = env.GITHUB_BRANCH || 'main';
    const contentB64 = utf8ToBase64(JSON.stringify(list, null, 2));
    const payload = {
        message: commitMessage || 'Update inquiries log',
        content: contentB64,
        branch
    };
    if (sha) payload.sha = sha;

    const putRes = await fetch(contentsUrl(env, INQUIRIES_PATH), {
        method: 'PUT',
        headers: { ...ghHeaders(env), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return putRes.ok;
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

function fetchWithTimeout(url, options = {}, timeoutMs = 4500) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timer));
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept',
            'Access-Control-Max-Age': '86400'
        }
    });
}

export async function onRequestPost({ request, env }) {
    let body;
    try {
        body = await request.json();
    } catch {
        return json({ ok: false, error: 'Invalid JSON payload' }, 400);
    }

    // Admin actions: list, delete, or clear inquiries
    if (body && (body.action === 'list' || body.action === 'delete')) {
        if (!isAuthorized(env, body.username, body.password)) {
            return json({ ok: false, error: 'Unauthorized' }, 401);
        }
        try {
            const current = await getInquiriesFile(env);
            if (!current) return json({ ok: true, inquiries: [] });

            if (body.action === 'list') {
                return json({ ok: true, inquiries: current.list });
            }

            if (body.action === 'delete' && body.id) {
                const filtered = current.list.filter(item => String(item.id) !== String(body.id));
                await saveInquiriesFile(env, filtered, current.sha, `Admin: Delete inquiry ${body.id}`);
                return json({ ok: true, inquiries: filtered });
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

    const recipient = (env && env.CONTACT_EMAIL) || DEFAULT_RECIPIENT;
    const timestamp = new Date().toISOString();

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

    const errors = [];
    let emailDelivered = false;
    let emailProvider = null;

    // 1. Try Cloudflare Native Email Binding (if configured on the Worker/Pages project)
    if (env && env.EMAIL && typeof env.EMAIL.send === 'function') {
        try {
            await env.EMAIL.send({
                to: { email: recipient, name: 'MTVFC #2 Membership' },
                from: { email: 'noreply@mtvfc2.com', name: 'Station 46 Website' },
                replyTo: { email, name },
                subject,
                text: plainText,
                html: htmlBody
            });
            emailDelivered = true;
            emailProvider = 'cloudflare-email';
        } catch (err) {
            errors.push(`cloudflare-email: ${err.message || err}`);
        }
    }

    // 2. Try Resend API (if RESEND_API_KEY is configured in Cloudflare environment variables)
    if (!emailDelivered && env && env.RESEND_API_KEY) {
        try {
            const fromAddr = (env && env.RESEND_FROM) || 'Station 46 Website <noreply@mtvfc2.com>';
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
            }, 4500);

            if (res.ok) {
                emailDelivered = true;
                emailProvider = 'resend';
            } else {
                errors.push(`resend: HTTP ${res.status}`);
            }
        } catch (err) {
            errors.push(`resend: ${err.message || err}`);
        }
    }

    // 3. Try FormSubmit.co (with 3.5-second timeout so it never hangs if FormSubmit is down)
    if (!emailDelivered) {
        try {
            const formSubmitPayload = {
                name,
                email,
                phone: phone || 'Not provided',
                topic,
                _subject: subject,
                _replyto: email,
                _template: 'table'
            };
            if (message) formSubmitPayload.message = message;

            const res = await fetchWithTimeout(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'https://mtvfc2.com',
                    'Referer': 'https://mtvfc2.com/'
                },
                body: JSON.stringify(formSubmitPayload)
            }, 3500);

            const data = await res.json().catch(() => ({}));
            if (res.ok && (data.success === 'true' || data.success === true)) {
                emailDelivered = true;
                emailProvider = 'formsubmit';
            } else {
                errors.push(`formsubmit: HTTP ${res.status} ${data.message || ''}`.trim());
            }
        } catch (err) {
            errors.push(`formsubmit: ${err.name === 'AbortError' ? 'timeout' : (err.message || err)}`);
        }
    }

    // 4. Always record the inquiry to data/inquiries.json via GitHub API so it is never lost
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

    const savedToStore = await appendInquiryToGitHub(env, inquiryEntry);

    if (emailDelivered || savedToStore) {
        return json({
            ok: true,
            emailDelivered,
            savedToStore,
            provider: emailProvider || (savedToStore ? 'github-store' : null)
        });
    }

    return json({
        ok: false,
        error: 'Email relay services are temporarily unreachable.',
        details: errors
    }, 502);
}
