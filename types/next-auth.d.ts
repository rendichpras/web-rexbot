import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      phone: string
      username: string
    }
  }

  interface User {
    id: string
    phone: string
    username: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    phone: string
    username: string
  }
} 