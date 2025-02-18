import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { saltAndHashPassword } from "@/utils/password";
import { getUserFromDb } from "@/utils/db"; // Assuming you have a function to fetch user from the database

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const { email, password } = credentials;

        try {
          // Logic to salt and hash password
          const pwHash = saltAndHashPassword(password);

          // Logic to verify if the user exists
          const user = await getUserFromDb(email, pwHash);

          if (!user) {
            throw new Error("Invalid credentials");
          }

          // Return user object with their profile data
          return user;
        } catch (error) {
          console.error("Error during authorization:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  // Optional: Add session and JWT callbacks if needed
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
  // Optional: Add pages configuration if you want to customize the default pages
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // Optional: Add secret for encryption
  secret: process.env.NEXTAUTH_SECRET,
});