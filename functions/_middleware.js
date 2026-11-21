// Cloudflare Pages Middleware: Canonical domain redirect (www.mtvfc2.com -> mtvfc2.com)
// Ensures visitors always submit forms from the canonical https://mtvfc2.com origin
// so domain-bound email relays (like FormSubmit) never reject submissions due to www mismatch.

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const method = context.request.method;

    if (
        url.hostname.toLowerCase() === 'www.mtvfc2.com' &&
        (method === 'GET' || method === 'HEAD')
    ) {
        url.hostname = 'mtvfc2.com';
        url.protocol = 'https:';
        return Response.redirect(url.toString(), 301);
    }

    return context.next();
}
