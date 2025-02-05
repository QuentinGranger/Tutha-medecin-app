import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              password_hash: true,
              first_name: true,
              last_name: true,
              professional_type: true,
              speciality: true,
              avatar_url: true,
              onboarding_completed: true,
            }
          });

          if (!user || !user.password_hash) {
            throw new Error('Email ou mot de passe incorrect');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password_hash);

          if (!isValid) {
            throw new Error('Email ou mot de passe incorrect');
          }

          return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            professional_type: user.professional_type,
            speciality: user.speciality,
            avatar_url: user.avatar_url,
            onboarding_completed: user.onboarding_completed,
          };
        } catch (error) {
          console.error('Erreur d\'authentification:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.professional_type = user.professional_type;
        token.speciality = user.speciality;
        token.avatar_url = user.avatar_url;
        token.onboarding_completed = user.onboarding_completed;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.first_name = token.first_name;
        session.user.last_name = token.last_name;
        session.user.professional_type = token.professional_type;
        session.user.speciality = token.speciality;
        session.user.avatar_url = token.avatar_url;
        session.user.onboarding_completed = token.onboarding_completed;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
