import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token)
  if (!decoded || !decoded.exp) return true
  
  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie?.value;
  const isAuthenticated = !!token && !isTokenExpired(token)

  const { pathname } = request.nextUrl;

  const isPublicPath = pathname.startsWith('/auth/');

  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isPublicPath) {
    const from = request.nextUrl.searchParams.get('from') || '/';
    return NextResponse.redirect(new URL(from, request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|assets).*)',
  ],
};