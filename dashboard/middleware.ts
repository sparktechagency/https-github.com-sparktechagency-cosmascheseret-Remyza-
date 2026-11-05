import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if trying to access dashboard without authentication
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('chesera_admin_access')?.value;
    
    if (!token) {
      // Check localStorage equivalent - we'll check if auth token exists
      // For middleware, we need to check cookies instead
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from login/auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/forgot-password') || 
      pathname.startsWith('/verify-otp') || pathname.startsWith('/reset-password')) {
    const token = request.cookies.get('chesera_admin_access')?.value;
    
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/forgot-password', '/verify-otp', '/reset-password'],
};
