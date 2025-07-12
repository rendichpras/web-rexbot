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

    // Dapatkan total user
    const totalUsers = await prisma.user.count()

    // Dapatkan peringkat user berdasarkan winGame
    const userRank = await prisma.user.count({
      where: {
        winGame: {
          gt: (
            await prisma.user.findUnique({
              where: { phoneNumber: cleanPhoneNumber },
              select: { winGame: true }
            })
          )?.winGame || 0
        }
      }
    })

    return NextResponse.json({
      rank: userRank + 1, // +1 karena count dimulai dari 0
      total: totalUsers
    })
  } catch (error) {
    console.error("Error fetching user rank:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 