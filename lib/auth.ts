import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcrypt"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Nomor telepon dan password diperlukan")
        }

        const user = await prisma.user.findUnique({
          where: {
            phoneNumber: credentials.phone.replace(/^\+/, '')
          },
          select: {
            id: true,
            username: true,
            password: true,
            registered: true,
            banned: true,
          }
        })

        if (!user) {
          throw new Error("Nomor telepon atau password salah")
        }

        if (user.banned) {
          throw new Error("Akun Anda telah dibanned")
        }

        if (!user.registered) {
          throw new Error("Akun belum terdaftar")
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Nomor telepon atau password salah")
        }

        return {
          id: String(user.id),
          username: user.username,
          phone: credentials.phone
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        // Cek status banned setiap kali session divalidasi
        const user = await prisma.user.findUnique({
          where: { id: Number(token.sub) },
          select: { banned: true }
        })

        // Jika user dibanned, destroy session
        if (user?.banned) {
          throw new Error("Akun Anda telah dibanned")
        }

        session.user = {
          id: token.sub as string,
          username: token.username as string,
          phone: token.phone as string
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.username = user.username
        token.phone = user.phone
      }
      return token
    }
  },
  pages: {
    signIn: "/masuk",
    error: "/masuk"
  },
  session: {
    strategy: "jwt"
  }
} 