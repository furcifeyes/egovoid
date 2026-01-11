import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth pages - sempre accessibili
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }

  // Check se ha session nel localStorage tramite cookie
  const userId = request.cookies.get('egovoid_userId')?.value;

  // Se non ha userId e cerca di accedere a pagina protetta, reindirizza a login
  if (!userId && pathname !== '/' && !pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
