// Cloudflare Worker: serves the static site and a secure GitHub proxy for the Station 46 admin editor.
// Route: /api/github  (all other paths are served from static assets, see wrangler.jsonc)
//
// Required Cloudflare secrets (Workers & Pages → firestation46 → Settings → Variables and Secrets):
//   GITHUB_TOKEN    Fine-grained token scoped to ZainHamdia/FireStation46 with "Contents: Read and write"
//   ADMIN_PASSWORD  Password admins type on admin.html
// Optional:
//   ADMIN_USERNAME  Defaults to "blawenburg1946"
//   GITHUB_REPO     Defaults to "ZainHamdia/FireStation46"
//   GITHUB_BRANCH   Defaults to "main"
//
// The token never leaves Cloudflare; browsers only ever see this endpoint.

const DEFAULT_REPO = 'ZainHamdia/FireStation46';
const DEFAULT_USER = 'blawenburg1946';

// Only allow writing top-level HTML pages and JSON files in /data
const ALLOWED_PATH = /^(?:[a-z0-9_-]+\.html|data\/[a-z0-9_-]+\.json)$/i;

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
}

// Constant-time string comparison to avoid timing leaks
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
    if (!env.ADMIN_PASSWORD) return false;
    const expectedUser = (env.ADMIN_USERNAME || DEFAULT_USER).toLowerCase();
    return safeEqual(String(username || '').trim().toLowerCase(), expectedUser)
        && safeEqual(password, env.ADMIN_PASSWORD);
}

function ghHeaders(env) {
    return {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'station46-admin',
        'X-GitHub-Api-Version': '2022-11-28'
    };
}

function contentsUrl(env, path) {
    const repo = env.GITHUB_REPO || DEFAULT_REPO;
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

async function getFile(env, path) {
    const branch = env.GITHUB_BRANCH || 'main';
    const res = await fetch(`${contentsUrl(env, path)}?ref=${encodeURIComponent(branch)}`, {
        headers: ghHeaders(env)
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status} ${await res.text()}`);
    return res.json();
}

// Error for a missing secret; lists visible setting NAMES only (never values) to help spot typos
function missingSecret(env, name) {
    const visible = Object.keys(env || {}).filter(k => k !== 'ASSETS');
    return json({
        error: `Server missing ${name}`,
        visibleSettings: visible.length ? visible : '(none)'
    }, 500);
}

// GET /api/github?path=data/posts.json  → { content: "<raw text>" }
async function handleGet({ request, env }) {
    const path = new URL(request.url).searchParams.get('path') || '';
    if (!ALLOWED_PATH.test(path)) return json({ error: 'Path not allowed' }, 400);
    if (!env.GITHUB_TOKEN) return missingSecret(env, 'GITHUB_TOKEN');

    try {
        const file = await getFile(env, path);
        if (!file) return json({ error: 'Not found' }, 404);
        return json({ content: base64ToUtf8(file.content) });
    } catch (err) {
        return json({ error: String(err.message || err) }, 502);
    }
}

// POST /api/github
//   { action: "login", username, password }
//   { action: "save",  username, password, path, content, message }
async function handlePost({ request, env }) {
    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Invalid JSON' }, 400);
    }

    if (!env.ADMIN_PASSWORD) return missingSecret(env, 'ADMIN_PASSWORD');
    if (!isAuthorized(env, body.username, body.password)) {
        return json({ error: 'Invalid username or password' }, 401);
    }

    if (body.action === 'login') return json({ ok: true });

    if (body.action !== 'save') return json({ error: 'Unknown action' }, 400);
    if (!env.GITHUB_TOKEN) return missingSecret(env, 'GITHUB_TOKEN');

    const { path, content, message } = body;
    if (!ALLOWED_PATH.test(path || '')) return json({ error: 'Path not allowed' }, 400);
    if (typeof content !== 'string') return json({ error: 'Content must be a string' }, 400);

    const newB64 = utf8ToBase64(content);

    // Retry once on SHA conflict (another save landed in between)
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const existing = await getFile(env, path);
            if (existing && String(existing.content || '').replace(/\s/g, '') === newB64) {
                return json({ ok: true, unchanged: true });
            }

            const payload = {
                message: String(message || `Update ${path}`).slice(0, 200),
                content: newB64,
                branch: env.GITHUB_BRANCH || 'main'
            };
            if (existing) payload.sha = existing.sha;

            const putRes = await fetch(contentsUrl(env, path), {
                method: 'PUT',
                headers: { ...ghHeaders(env), 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (putRes.ok) return json({ ok: true });
            if ((putRes.status === 409 || putRes.status === 422) && attempt === 0) continue;

            return json({ error: `GitHub rejected the update (${putRes.status})`, details: await putRes.text() }, 502);
        } catch (err) {
            if (attempt === 1) return json({ error: String(err.message || err) }, 502);
        }
    }
    return json({ error: 'Unable to save after retry' }, 502);
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/api/github') {
            if (request.method === 'GET') return handleGet({ request, env });
            if (request.method === 'POST') return handlePost({ request, env });
            return json({ error: 'Method not allowed' }, 405);
        }

        // Everything else is the static website
        return env.ASSETS.fetch(request);
    }
};
