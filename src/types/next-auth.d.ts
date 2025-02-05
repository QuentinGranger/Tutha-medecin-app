import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    professional_type?: string | null;
    onboarding_completed: boolean;
    avatar_url?: string | null;
    role: string;
  }

  interface Session {
    user: User & {
      id: string;
      email?: string | null;
      first_name?: string | null;
      last_name?: string | null;
      professional_type?: string | null;
      onboarding_completed: boolean;
      avatar_url?: string | null;
      role: string;
    };
  }
}
