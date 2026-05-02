import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Rate limiting store (in-memory, resets on cold start) ──────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false; // not limited
  }

  entry.count++;
  if (entry.count > limit) return true; // limited
  return false;
}

// ── SQL injection patterns ─────────────────────────────────────────
const SQL_INJECTION = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE|SCRIPT|DECLARE)\b)|(-{2})|(\bOR\b\s+\d+=\d+)|(\bAND\b\s+\d+=\d+)|(\/\*[\s\S]*?\*\/)/gi;

// ── XSS patterns ──────────────────────────────────────────────────
const XSS_PATTERNS = /<script[\s\S]*?>[\s\S]*?<\/script>|javascript:|on\w+\s*=|<iframe|<object|<embed|<link\s+rel/gi;

// ── Path traversal ────────────────────────────────────────────────
const PATH_TRAVERSAL = /\.\.[\/\\]|%2e%2e[\/\\]|%252e%252e/gi;

// ── Known bad bots / scanners ─────────────────────────────────────
const BAD_BOTS = /sqlmap|nikto|nmap|masscan|zgrab|dirbuster|gobuster|wfuzz|hydra|medusa|burpsuite|acunetix|nessus|openvas/i;

function isMalicious(value: string): boolean {
  return SQL_INJECTION.test(value) || XSS_PATTERNS.test(value) || PATH_TRAVERSAL.test(value);
}

function securityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy — disable unnecessary browser features
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=()');
  // HSTS — force HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js needs unsafe-inline
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.openstreetmap.org",
      "connect-src 'self' https://*.neon.tech https://api.flutterwave.com https://overpass-api.de",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  return response;
}

function blocked(reason: string, status = 403): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: 'Request blocked', reason }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const ip = getIP(request);
  const ua = request.headers.get('user-agent') || '';
  const method = request.method;

  // ── 1. Block known malicious bots / scanners ───────────────────
  if (BAD_BOTS.test(ua)) {
    return blocked('Automated scanner detected');
  }

  // ── 2. Block empty user agents on API routes ───────────────────
  if (pathname.startsWith('/api/') && !ua && method !== 'GET') {
    return blocked('Missing user agent');
  }

  // ── 3. Rate limiting ───────────────────────────────────────────
  // Auth endpoints: 10 requests per minute
  if (pathname.startsWith('/api/auth') || pathname === '/admin-login') {
    if (rateLimit(`auth:${ip}`, 10, 60_000)) {
      return blocked('Too many authentication attempts. Try again in 1 minute.', 429);
    }
  }

  // Business creation: 5 per hour
  if (pathname === '/api/businesses/create' && method === 'POST') {
    if (rateLimit(`create:${ip}`, 5, 3_600_000)) {
      return blocked('Too many business registrations from this IP.', 429);
    }
  }

  // General API: 200 requests per minute
  if (pathname.startsWith('/api/')) {
    if (rateLimit(`api:${ip}`, 200, 60_000)) {
      return blocked('Rate limit exceeded. Slow down.', 429);
    }
  }

  // ── 4. Block path traversal attempts ──────────────────────────
  if (PATH_TRAVERSAL.test(pathname)) {
    return blocked('Path traversal detected');
  }

  // ── 5. Scan query parameters for injection attacks ─────────────
  if (pathname.startsWith('/api/')) {
    for (const [, value] of searchParams.entries()) {
      if (isMalicious(value)) {
        return blocked('Malicious input detected in query parameters');
      }
    }
  }

  // ── 6. Block oversized requests ───────────────────────────────
  const contentLength = parseInt(request.headers.get('content-length') || '0');
  if (contentLength > 10 * 1024 * 1024) { // 10MB limit
    return blocked('Request too large', 413);
  }

  // ── 7. Admin routes — extra protection ────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
    // Block direct access attempts with no referer (bot scanning)
    const referer = request.headers.get('referer') || '';
    const host = request.headers.get('host') || '';
    if (!referer && !request.cookies.has('next-auth.session-token') &&
        !request.cookies.has('__Secure-next-auth.session-token')) {
      // Allow but don't block — auth check happens in the page itself
    }
  }

  // ── 8. Apply security headers to all responses ────────────────
  const response = NextResponse.next();
  return securityHeaders(response);
}

export const config = {
  matcher: [
    // Apply to all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|logo.png|manifest.json|icons/).*)',
  ],
};
