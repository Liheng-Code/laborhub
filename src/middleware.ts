import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth pages that don't require authentication
  const authPages = ['/auth/signin', '/auth/signup'];
  const isAuthPage = authPages.some((page) => pathname.startsWith(page));

  // Allow auth pages and public assets through
  if (isAuthPage || pathname.startsWith('/_next') || pathname.startsWith('/public')) {
    return NextResponse.next();
  }

  // For now, we'll let the client-side auth context handle redirection
  // This allows the AuthProvider to check session and redirect if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

