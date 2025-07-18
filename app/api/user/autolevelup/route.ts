import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { phone, autolevelup } = body

    if (typeof phone !== 'string' || typeof autolevelup !== 'boolean') {
      return NextResponse.json(
        { error: "Invalid request body" },
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

    // Update status auto levelup
    const user = await prisma.user.update({
      where: { phoneNumber: cleanPhoneNumber },
      data: { autolevelup },
      select: { autolevelup: true }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating auto levelup:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 