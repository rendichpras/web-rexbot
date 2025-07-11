import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { z } from "zod"

const changePasswordSchema = z.object({
  phoneNumber: z.string(),
  newPassword: z.string().min(6, "Password minimal 6 karakter"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phoneNumber, newPassword } = changePasswordSchema.parse(body)

    // Bersihkan nomor telepon (hapus +)
    const cleanPhoneNumber = phoneNumber.replace(/^\+/, '')
    
    console.log('Original phone number:', phoneNumber)
    console.log('Clean phone number:', cleanPhoneNumber)

    // Cari user berdasarkan nomor telepon
    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhoneNumber },
    })

    console.log('User found:', user)

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      )
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password user
    await prisma.user.update({
      where: { phoneNumber: cleanPhoneNumber },
      data: { password: hashedPassword },
    })

    return NextResponse.json(
      { message: "Password berhasil diubah" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error("Error changing password:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengubah password" },
      { status: 500 }
    )
  }
} 