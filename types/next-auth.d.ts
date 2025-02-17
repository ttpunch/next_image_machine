import "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
   
      user: {
        id: string;
        username: string | null;
        email?: string | null;
        name?: string | null;
        image?: string | null;
        role: UserRole;
      };
    }
  
  interface User {
    id: string;
    username: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: UserRole;
  }
} 