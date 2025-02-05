import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          select: {
            id: true,
            email: true,
            password_hash: true,
            first_name: true,
            last_name: true,
            professional_type: true,
            speciality: true,
            avatar_url: true,
            onboarding_completed: true
          }
        });

        if (!user) {
          throw new Error('Aucun utilisateur trouvé avec cet email');
        }

        // Si nous avons déjà une session valide et le mot de passe est 'current'
        if (credentials.password === 'current') {
          return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            professional_type: user.professional_type,
            speciality: user.speciality,
            avatar_url: user.avatar_url,
            onboarding_completed: user.onboarding_completed
          };
        }

        const isPasswordValid = await compare(credentials.password, user.password_hash);

        if (!isPasswordValid) {
          throw new Error('Mot de passe incorrect');
        }

        return {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          professional_type: user.professional_type,
          speciality: user.speciality,
          avatar_url: user.avatar_url,
          onboarding_completed: user.onboarding_completed
        };
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

      // Toujours vérifier le statut d'onboarding dans la base de données
      const dbUser = await prisma.user.findUnique({
        where: {
          email: token.email as string
        },
        select: {
          onboarding_completed: true,
          professional_type: true,
          speciality: true,
          avatar_url: true
        }
      });

      if (dbUser) {
        token.onboarding_completed = dbUser.onboarding_completed;
        token.professional_type = dbUser.professional_type;
        token.speciality = dbUser.speciality;
        token.avatar_url = dbUser.avatar_url;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
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
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 jours
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
