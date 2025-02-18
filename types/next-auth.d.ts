import "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string | null;
      role: UserRole;
      active: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    email: string | null;
    role: UserRole;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    email: string | null;
    role: UserRole;
    active: boolean;
  }
}