import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const phone = searchParams.get("phone")

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
    }

    // Bersihkan nomor telepon (hapus +)
    const cleanPhoneNumber = phone.replace(/^\+/, '')

    // Verifikasi bahwa user yang request adalah pemilik data
    if (session.user.phone.replace(/^\+/, '') !== cleanPhoneNumber) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhoneNumber },
      select: {
        username: true,
        phoneNumber: true,
        coin: true,
        xp: true,
        level: true,
        winGame: true,
        premium: true,
        premiumExpiration: true,
        banned: true,
        autolevelup: true,
        lastClaim: true,
        afk: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 