import NextAuth, { type NextAuthOptions, type DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id?: string;
    } & DefaultSession['user'];
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Demo credentials for testing
        if (
          credentials.email === 'demo@example.com' &&
          credentials.password === 'password123'
        ) {
          return {
            id: '1',
            email: credentials.email,
            name: 'Demo User',
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production',
});

export { handler as GET, handler as POST };
