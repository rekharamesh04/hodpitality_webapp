import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isKnownRole } from '@/constants/roles';

// Routes that don't require authentication
const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/verify-otp'];

/**
 * Reads the Cognito ID token's payload (no signature check — the API Gateway authorizer does
 * that on every request). Used only to turn away cookies that are not a real staff session:
 * leftover mock tokens, garbage, or a login whose role the backend would refuse anyway.
 */
function readSession(token: string | undefined): { valid: boolean; expired: boolean } {
  if (!token) return { valid: false, expired: false };
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false, expired: false };
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
    if (!isKnownRole(payload['custom:role'])) return { valid: false, expired: false };
    const exp = typeof payload.exp === 'number' ? payload.exp * 1000 : 0;
    return { valid: true, expired: exp <= Date.now() };
  } catch {
    return { valid: false, expired: false };
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/images/')
  ) {
    return NextResponse.next();
  }
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Get auth token from cookie
  const token = request.cookies.get('auth_token')?.value;
  const session = readSession(token);

  // Already signed in with a live session → skip the login page. An expired one stays on the
  // login page so the user is never bounced between /login and /dashboard.
  if (isPublicRoute && session.valid && !session.expired) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protected pages need a real staff session. An expired-but-valid token is let through: the
  // app silently refreshes it on load (lib/axios.ts), and logs out if the refresh fails.
  if (!isPublicRoute && !session.valid && pathname !== '/') {
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (token) response.cookies.delete('auth_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
