import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && nextUrl.pathname === "/login") {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }
            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                token.role = (user as { role: string }).role;
                token.tenantId = (user as { tenantId: string }).tenantId;
            }
            return token;
        },
        session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.tenantId = token.tenantId as string;
            }
            return session;
        },
    },
    providers: [], // Providers added in auth.ts
    session: {
        strategy: "jwt",
    },
} satisfies NextAuthConfig;
