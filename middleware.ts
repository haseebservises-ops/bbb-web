// middleware.ts
import { withAuth } from "next-auth/middleware";

/**
 * Protect /admin and /superadmin. We read role from the JWT.
 * - /superadmin → role === "superadmin"
 * - /admin      → role === "admin" or "superadmin"
 * Anyone else gets sent to /auth/signin.
 */
export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;

      // public auth routes are always allowed
      if (path.startsWith("/auth")) return true;

      const role = (token?.role as string) ?? "user";

      if (path.startsWith("/superadmin")) return role === "superadmin";
      if (path.startsWith("/admin")) return role === "admin" || role === "superadmin";

      // everything else public
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*"],
};
