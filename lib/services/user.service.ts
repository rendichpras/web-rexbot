import { prisma } from '@/lib/prisma'

export async function getUserByPhone(phoneNumber: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    })
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export async function getUserStats(phoneNumber: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
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
    return user
  } catch (error) {
    console.error('Error fetching user stats:', error)
    throw error
  }
}

export async function updateUserAfk(phoneNumber: string, afkData: { reason?: string; timestamp: number } | null) {
  try {
    const user = await prisma.user.update({
      where: { phoneNumber },
      data: { afk: afkData }
    })
    return user
  } catch (error) {
    console.error('Error updating user AFK status:', error)
    throw error
  }
}

export async function updateUserAutolevelup(phoneNumber: string, autolevelup: boolean) {
  try {
    const user = await prisma.user.update({
      where: { phoneNumber },
      data: { autolevelup }
    })
    return user
  } catch (error) {
    console.error('Error updating autolevelup:', error)
    throw error
  }
}

export async function updateLastClaim(
  phoneNumber: string,
  claimType: 'daily' | 'weekly' | 'monthly' | 'yearly',
  timestamp: number
) {
  try {
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    })

    const currentLastClaim = user?.lastClaim as Record<string, number> || {}
    const updatedLastClaim = {
      ...currentLastClaim,
      [claimType]: timestamp
    }

    const updatedUser = await prisma.user.update({
      where: { phoneNumber },
      data: {
        lastClaim: updatedLastClaim
      }
    })

    return updatedUser
  } catch (error) {
    console.error('Error updating last claim:', error)
    throw error
  }
} 