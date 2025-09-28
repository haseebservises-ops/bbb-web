// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { ADMIN_EMAILS } from "@/lib/env";

const providers: NextAuthOptions["providers"] = [
  // Minimal email-only credentials for preview/dev
  Credentials({
    name: "Email only",
    credentials: { email: { label: "Email", type: "text" } },
    async authorize(credentials) {
      const email = (credentials?.email || "").toString().trim();
      if (!email) return null;
      return { id: email, name: email, email };
    },
  }),
];

// Add Google only if configured (so preview still builds without it)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;

      if (user?.email) {
        const email = user.email.toLowerCase();
        token.role = ADMIN_EMAILS.includes(email)
          ? "superadmin"
          : (token.role as any) ?? "user";
      } else {
        token.role = (token.role as any) ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) session.user = { id: "demo" } as any;
      (session.user as any).id =
        (token.id as string) || session.user.email || "demo";
      (session.user as any).role = (token.role as any) ?? "user";
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
