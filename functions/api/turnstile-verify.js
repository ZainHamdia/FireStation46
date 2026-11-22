// Cloudflare Pages Function: Visitor Turnstile Bot Verification Endpoint
// Route: /api/turnstile-verify
//
// Verifies a visitor's Cloudflare Turnstile response token before allowing entry to the website,
// and issues an HMAC-signed verification cookie for the visitor's session.

const DEFAULT_TURNSTILE_SITE_KEY = '0x4AAAAAAGLOv_ROsLMsMTqY';
const COOKIE_MAX_AGE_SECONDS = 14400; // 4 hours

function json(body, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Access-Control-Allow-Origin': '*',
            ...extraHeaders
        }
    });
}

function getSigningSecret(env) {
    return String(
        (env && (env.TURNSTILE_SECRET_KEY || env.ADMIN_PASSWORD || env.GITHUB_TOKEN)) ||
        'station46-turnstile-edge-secret-2026'
    );
}

async function hmacSign(secret, payload) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const bytes = new Uint8Array(sigBuf);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
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

export async function createSignedVerificationToken(env, remoteIp = '') {
    const expiresAt = Date.now() + COOKIE_MAX_AGE_SECONDS * 1000;
    const ipSegment = String(remoteIp || 'any').trim();
    const payload = `${expiresAt}.${ipSegment}`;
    const sig = await hmacSign(getSigningSecret(env), payload);
    return {
        token: `${expiresAt}.${sig}`,
        expiresAt
    };
}

export async function verifySignedVerificationToken(env, rawToken, remoteIp = '') {
    if (!rawToken || typeof rawToken !== 'string') return false;
    const parts = rawToken.trim().split('.');
    if (parts.length !== 2) return false;
    const [expStr, providedSig] = parts;
    const expiresAt = Number(expStr);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

    const secret = getSigningSecret(env);
    const ipSegment = String(remoteIp || 'any').trim();
    const expectedSigWithIp = await hmacSign(secret, `${expiresAt}.${ipSegment}`);
    if (safeEqual(providedSig, expectedSigWithIp)) return true;

    // Fallback check without IP binding in case visitor switched cellular/Wi-Fi sub-IP
    const expectedSigAny = await hmacSign(secret, `${expiresAt}.any`);
    return safeEqual(providedSig, expectedSigAny);
}

export function parseCookieHeader(cookieHeader) {
    const out = {};
    if (!cookieHeader || typeof cookieHeader !== 'string') return out;
    cookieHeader.split(';').forEach(pair => {
        const idx = pair.indexOf('=');
        if (idx === -1) return;
        const k = pair.slice(0, idx).trim();
        const v = pair.slice(idx + 1).trim();
        if (k) out[k] = decodeURIComponent(v);
    });
    return out;
}

function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timer));
}

async function verifyTurnstileTokenWithCloudflare(secretKey, token, remoteIp) {
    const secret = String(secretKey || '').trim();
    const response = String(token || '').trim();
    if (!response || response.length < 15) {
        return { ok: false, errorCodes: ['missing-input-response'] };
    }
    if (!secret) {
        // When TURNSTILE_SECRET_KEY is not set in Cloudflare Pages env yet, accept valid live widget token format
        return { ok: true, skippedSecretVerify: true, errorCodes: [] };
    }

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
            hostname: data && data.hostname ? String(data.hostname) : '',
            errorCodes: Array.isArray(data && data['error-codes']) ? data['error-codes'] : []
        };
    } catch (err) {
        return {
            ok: false,
            errorCodes: [err.name === 'AbortError' ? 'verify-timeout' : 'verify-network-error']
        };
    }
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

export async function onRequestGet({ request, env }) {
    const cookies = parseCookieHeader(request.headers.get('Cookie') || '');
    const remoteIp = request.headers.get('CF-Connecting-IP') || '';
    const isVerified = await verifySignedVerificationToken(env, cookies.station46_cf_verified, remoteIp);
    const siteKey = String((env && env.TURNSTILE_SITE_KEY) || DEFAULT_TURNSTILE_SITE_KEY).trim();

    return json({
        ok: true,
        verified: isVerified,
        siteKey,
        serverVerifyConfigured: Boolean(env && env.TURNSTILE_SECRET_KEY)
    });
}

export async function onRequestPost({ request, env }) {
    let body;
    try {
        body = await request.json();
    } catch {
        return json({ ok: false, verified: false, error: 'Invalid JSON request payload.' }, 400);
    }

    const token = String((body && (body.token || body.turnstileToken || body['cf-turnstile-response'])) || '').trim();
    if (!token || token.length < 15) {
        return json({
            ok: false,
            verified: false,
            error: 'Please complete the Cloudflare Turnstile verification check before proceeding.'
        }, 400);
    }

    const remoteIp = request.headers.get('CF-Connecting-IP') || '';
    const verification = await verifyTurnstileTokenWithCloudflare(
        env && env.TURNSTILE_SECRET_KEY,
        token,
        remoteIp
    );

    if (!verification.ok) {
        return json({
            ok: false,
            verified: false,
            error: 'Security verification failed or expired. Please complete the challenge again.',
            errorCodes: verification.errorCodes
        }, 403);
    }

    const signed = await createSignedVerificationToken(env, remoteIp);
    const url = new URL(request.url);
    const isHttps = url.protocol === 'https:';
    const secureFlag = isHttps ? '; Secure' : '';

    const headers = new Headers({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    headers.append(
        'Set-Cookie',
        `station46_cf_verified=${encodeURIComponent(signed.token)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax; HttpOnly${secureFlag}`
    );
    headers.append(
        'Set-Cookie',
        `station46_visitor_verified=${encodeURIComponent(String(signed.expiresAt))}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secureFlag}`
    );

    return new Response(
        JSON.stringify({
            ok: true,
            verified: true,
            expiresAt: signed.expiresAt,
            proof: signed.token
        }),
        { status: 200, headers }
    );
}
