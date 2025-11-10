import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Match /12345678 exactly (8 digits)
  const match = pathname.match(/^\/(\d{8})$/);
  if (match) {
    const ref = match[1];
    const url = request.nextUrl.clone();
    url.pathname = '/buy'; // redirect to homepage
    url.searchParams.set('ref', ref); // pass as query param
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};