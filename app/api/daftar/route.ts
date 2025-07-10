import { hash } from "bcrypt"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { username, phoneNumber, password } = await req.json()

    // Validasi input
    if (!username || !phoneNumber || !password) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      )
    }

    // Bersihkan nomor telepon (hapus +)
    const cleanPhoneNumber = phoneNumber.replace(/^\+/, '')

    // Tambahkan @ jika username belum memilikinya
    const formattedUsername = username.startsWith('@') ? username : `@${username}`

    // Cek user yang sudah ada di database
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhoneNumber },
      select: {
        registered: true,
        username: true
      }
    })

    // Jika user sudah terdaftar (registered true), tolak pendaftaran
    if (existingUser?.registered === true) {
      return NextResponse.json(
        { error: "Nomor telepon sudah terdaftar" },
        { status: 400 }
      )
    }

    // Cek apakah username sudah digunakan
    const existingUsername = await prisma.user.findUnique({
      where: { username: formattedUsername },
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    let user

    if (existingUser) {
      // Update data user yang sudah ada
      user = await prisma.user.update({
        where: { phoneNumber: cleanPhoneNumber },
        data: {
          username: formattedUsername,
          password: hashedPassword,
          registered: true,
          coin: 500,
        },
      })
    } else {
      // Buat user baru
      user = await prisma.user.create({
        data: {
          username: formattedUsername,
          phoneNumber: cleanPhoneNumber,
          password: hashedPassword,
          registered: true,
          coin: 500,
        },
      })
    }

    return NextResponse.json(
      {
        message: "Pendaftaran berhasil",
        user: {
          id: user.id,
          username: user.username,
          phoneNumber: user.phoneNumber,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftar" },
      { status: 500 }
    )
  }
} 