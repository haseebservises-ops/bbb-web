// types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "user" | "admin" | "superadmin";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "user" | "admin" | "superadmin";
  }
}
