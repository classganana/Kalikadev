/**
 * NextAuth configuration.
 * Admin login via ADMIN_EMAIL + ADMIN_PASSWORD; customers via User model.
 */
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@kalika.dev";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.trim().toLowerCase();

        // Admin
        if (email === ADMIN_EMAIL && ADMIN_PASSWORD && credentials.password === ADMIN_PASSWORD) {
          return {
            id: "admin",
            email,
            name: "Admin",
            isAdmin: true,
          };
        }

        // Customer
        await connectDB();
        const user = await User.findOne({ email }).lean();
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return {
          id: String(user._id),
          email: user.email,
          name: user.name,
          isAdmin: false,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id: string; isAdmin?: boolean }).id = token.id as string;
        (session.user as { isAdmin?: boolean }).isAdmin = (token.isAdmin as boolean) ?? false;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};
