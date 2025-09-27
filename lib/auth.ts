// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ADMIN_EMAILS } from "@/lib/env";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Email only",
      credentials: { email: { label: "Email", type: "text" } },
      async authorize(credentials) {
        const email = (credentials?.email || "").toString().trim();
        if (!email) return null;
        // Minimal dev/staging identity: email doubles as id/name
        return { id: email, name: email, email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    // Ensure unauth guests trying to hit /admin get sent here
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Keep your id behavior
      if (user?.id) token.id = user.id;

      // First login has `user`; later refreshes do not.
      // Quick RBAC: superadmins come from ADMIN_EMAILS.
      if (user?.email) {
        const email = user.email.toLowerCase();
        token.role = ADMIN_EMAILS.includes(email)
          ? "superadmin"
          : (token.role as any) ?? "user";
      } else {
        // No new user info—preserve existing or default
        token.role = (token.role as any) ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure user object exists and include id + role
      if (!session.user) session.user = { id: "demo" } as any;
      (session.user as any).id =
        (token.id as string) || session.user.email || "demo";
      (session.user as any).role = (token.role as any) ?? "user";
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
