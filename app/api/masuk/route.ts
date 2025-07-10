import { prisma } from "@/lib/prisma"
import { compare } from "bcrypt"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json()

    // Validasi input
    if (!phone || !password) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      )
    }

    // Bersihkan nomor telepon (hapus +)
    const cleanPhoneNumber = phone.replace(/^\+/, '')

    // Cari user berdasarkan nomor telepon
    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhoneNumber },
      select: {
        id: true,
        username: true,
        password: true,
        registered: true,
        banned: true,
      },
    })

    // Jika user tidak ditemukan
    if (!user) {
      return NextResponse.json(
        { error: "Nomor telepon atau password salah" },
        { status: 400 }
      )
    }

    // Cek status banned
    if (user.banned) {
      return NextResponse.json(
        { error: "Akun Anda telah dibanned" },
        { status: 400 }
      )
    }

    // Cek status registered
    if (!user.registered) {
      return NextResponse.json(
        { error: "Akun belum terdaftar, silahkan daftar terlebih dahulu" },
        { status: 400 }
      )
    }

    // Verifikasi password
    const passwordMatch = await compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Nomor telepon atau password salah" },
        { status: 400 }
      )
    }

    // Jika berhasil, kirim data user (tanpa password)
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
      },
    })

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat masuk" },
      { status: 500 }
    )
  }
} 