// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Minimal Credentials provider:
 * - No email codes, no OAuth
 * - Any email signs in; id = email
 * - Good for staging/dev
 */
export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Email only",
      credentials: { email: { label: "Email", type: "text" } },
      async authorize(credentials) {
        const email = (credentials?.email || "").toString().trim();
        if (!email) return null;
        return { id: email, name: email, email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (!session.user) session.user = { id: "demo" };
      (session.user as any).id = (token.id as string) || session.user.email || "demo";
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
