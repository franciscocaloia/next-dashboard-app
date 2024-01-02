import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLogedIn = !!auth?.user;
      const isOnDashboard = nextUrl?.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        return isLogedIn;
      } else if (isLogedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
