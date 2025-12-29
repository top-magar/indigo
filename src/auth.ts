import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { sudoDb as db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const email = credentials.email as string;
                const password = credentials.password as string;

                if (!email || !password) {
                    return null;
                }

                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1);

                if (!user) {
                    return null;
                }

                const passwordsMatch = await compare(password, user.password);

                if (!passwordsMatch) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenantId,
                };
            },
        }),
    ],
});
