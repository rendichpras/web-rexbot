"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trophy,
  Crown,
  Timer,
  Calendar,
  Gift,
  Ban,
  Star,
  Gamepad2,
  Phone
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface LastClaim {
  daily?: number
  weekly?: number
  monthly?: number
  yearly?: number
}

interface AfkStatus {
  reason?: string
  timestamp: number
}

interface UserStats {
  phoneNumber: string
  username: string
  coin: number
  xp: number
  level: number
  winGame: number
  premium: boolean
  premiumExpiration?: Date
  banned: boolean
  autolevelup: boolean
  lastClaim?: LastClaim
  afk?: AfkStatus
  createdAt: Date
}

function formatTimeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} hari yang lalu`
  if (hours > 0) return `${hours} jam yang lalu`
  if (minutes > 0) return `${minutes} menit yang lalu`
  return `${seconds} detik yang lalu`
}

export function KontenDasbor({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!session?.user.phone) return

        const response = await fetch(`/api/user/stats?phone=${encodeURIComponent(session.user.phone)}`)
        if (!response.ok) {
          throw new Error("Gagal mengambil data user")
        }

        const data = await response.json()
        setUserData(data)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Gagal memuat data user")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [session])

  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: '/masuk',
      redirect: true 
    })
  }

  if (isLoading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-48 bg-muted rounded-md" />
          <div className="h-4 w-24 bg-muted rounded-md" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Header Profile */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex flex-wrap items-center gap-2 text-2xl">
                {userData.username}
                {userData.premium && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                    <Crown className="mr-1 h-4 w-4" />
                    Premium
                  </Badge>
                )}
                {userData.banned && (
                  <Badge variant="destructive">
                    <Ban className="mr-1 h-4 w-4" />
                    Banned
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  {userData.phoneNumber}
                </div>
                {userData.afk && (
                  <Badge variant="secondary" className="w-fit">
                    <Timer className="mr-1 h-3 w-3" />
                    AFK: {userData.afk.reason} - {formatTimeAgo(userData.afk.timestamp)}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Level & XP */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Level & XP
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Level</span>
              <span className="text-2xl font-bold">{userData.level}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total XP</span>
              <span className="text-xl font-semibold">{userData.xp}</span>
            </div>
          </CardContent>
        </Card>

        {/* Coin */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4 text-emerald-500" />
              Koin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Koin</span>
              <span className="text-2xl font-bold">{userData.coin}</span>
            </div>
          </CardContent>
        </Card>

        {/* Game Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-indigo-500" />
              Statistik Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Menang</span>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{userData.winGame}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Status Claim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
              <div 
                key={period}
                className="flex items-center gap-3 p-4 rounded-lg border bg-card/50"
              >
                <div className="flex-1">
                  <p className="font-medium capitalize mb-1">{period}</p>
                  {userData.lastClaim?.[period as keyof LastClaim] ? (
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(userData.lastClaim[period as keyof LastClaim]!)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Belum diklaim</p>
                  )}
                </div>
                <Badge variant={userData.lastClaim?.[period as keyof LastClaim] ? "secondary" : "outline"}>
                  {userData.lastClaim?.[period as keyof LastClaim] ? "Diklaim" : "Tersedia"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
