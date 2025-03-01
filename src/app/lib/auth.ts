import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/app/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
   
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any> {
        try {
          if (!credentials?.username || !credentials?.password) {
            throw new Error("Missing credentials");
          }

          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
            select: {
              id: true,
              username: true,
              email: true,
              password: true,
              role: true
            }
          });

          if (!user) {
            throw new Error("User not found");
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          const { password, ...userWithoutPass } = user;
          return userWithoutPass;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      // Add Google OAuth tokens to JWT
      if (account && account.provider === 'google') {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = 'google';
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.username = token.username as string;
          session.user.role = token.role as string;
        }
        // Add Google OAuth tokens to session
        if (token.provider === 'google') {
          session.accessToken = token.accessToken as string;
          session.refreshToken = token.refreshToken as string;
          session.provider = token.provider;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-do-not-use-in-production",
  debug: process.env.NODE_ENV === 'development',
};

