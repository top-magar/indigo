import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnStorefront = nextUrl.pathname.startsWith("/storefront");
            const isAuthPage = nextUrl.pathname === "/login" || nextUrl.pathname === "/signup" || nextUrl.pathname === "/register";
            
            // Allow auth pages without any redirects
            if (isAuthPage) {
                return true;
            }
            
            // Protect dashboard and storefront
            if (isOnDashboard || isOnStorefront) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
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
