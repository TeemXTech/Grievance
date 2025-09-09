// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    accessToken: string;
    language_pref: string;
    role: {
      name: string;
    };
  }

  interface Session {
    user: User;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    accessToken: string;
    phone: string;
    language_pref: string;
  }
}
