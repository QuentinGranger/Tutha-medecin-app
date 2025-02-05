import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';

// Pages publiques qui ne nécessitent pas d'authentification
const publicPages = ['/', '/auth/signin', '/auth/signup'];

// Pages d'onboarding qui nécessitent une authentification
const onboardingPages = [
  '/choix-profil',
  '/onboarding/professionnel',
  '/onboarding/pratique',
  '/onboarding/resume'
];

export default withAuth(
  async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const { pathname } = request.nextUrl;

    // Vérifier si c'est une page publique
    if (publicPages.includes(pathname)) {
      return NextResponse.next();
    }

    // Si l'utilisateur n'est pas connecté
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }

    // Si l'utilisateur est sur une page d'onboarding
    const isOnboardingPage = onboardingPages.some(page => pathname.startsWith(page));
    
    // Si l'utilisateur est sur la page de résumé et essaie d'accéder au dashboard
    if (pathname === '/onboarding/resume' && request.method === 'POST') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Si l'utilisateur essaie d'accéder au dashboard directement
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.next();
    }

    // Si l'utilisateur est authentifié et essaie d'accéder à la page de connexion
    if (request.nextUrl.pathname === '/' && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/'
    }
  }
);

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/choix-profil',
    '/((?!_next/static|_next/image|favicon.ico|public|auth/signin|auth/signup).*)',
    '/api/:path*'
  ],
};
