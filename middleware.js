import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;
  
  // Check if the request is for the admin dashboard
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  
  // If trying to access admin routes without being authenticated, redirect to login
  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login?callbackUrl=/admin', req.url));
  }
  
  // If trying to access admin routes without admin role, redirect to home
  if (isAdminRoute && isAuthenticated && token.role !== 'admin' && token.role !== 'content_validator') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 