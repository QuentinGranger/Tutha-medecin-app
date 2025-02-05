import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Pages publiques
  if (pathname === '/' || pathname === '/inscription') {
    return NextResponse.next();
  }

  // Vérifier l'authentification
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Gérer les redirections basées sur l'état de l'onboarding
  const onboardingCompleted = token.onboarding_completed === true;
  const isOnboardingPage = pathname.startsWith('/onboarding') || pathname === '/choix-profil';
  const isDashboardPage = pathname === '/dashboard';

  if (onboardingCompleted) {
    // Si l'onboarding est terminé, rediriger des pages d'onboarding vers le dashboard
    if (isOnboardingPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else {
    // Si l'onboarding n'est pas terminé, rediriger du dashboard vers choix-profil
    if (isDashboardPage) {
      return NextResponse.redirect(new URL('/choix-profil', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)']
};
