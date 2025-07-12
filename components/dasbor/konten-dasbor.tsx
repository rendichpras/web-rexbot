"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { 
  Trophy,
  Crown,
  Coins,
  Target,
  User,
  Phone,
  Calendar,
  Clock,
  Timer,
  Medal,
  Sun,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Loader2
} from "lucide-react"
import { useEffect, useState } from "react"

interface ClaimStatus {
  date: string
  reward: number
}

interface LastClaim {
  daily?: number
  weekly?: number
  monthly?: number
  yearly?: number
}

interface AFKStatus {
  reason: string
  timestamp: number
}

interface UserStats {
  username: string | null
  phoneNumber: string
  coin: number
  xp: number
  level: number
  winGame: number
  premium: boolean
  premiumExpiration: string | null
  banned: boolean
  autolevelup: boolean
  lastClaim: LastClaim | null
  afk: AFKStatus | null
  createdAt: string
}

interface RankInfo {
  rank: number
  total: number
}

export function KontenDasbor() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [rankInfo, setRankInfo] = useState<RankInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session?.user?.phone) return
        
        // Fetch user stats dan rank secara parallel
        const [statsResponse, rankResponse] = await Promise.all([
          fetch(`/api/user/stats?phone=${encodeURIComponent(session.user.phone)}`),
          fetch(`/api/user/rank?phone=${encodeURIComponent(session.user.phone)}`)
        ])

        // Handle stats response
        if (!statsResponse.ok) {
          const statsError = await statsResponse.json()
          throw new Error(statsError.error || "Gagal mengambil data statistik")
        }
        const statsData = await statsResponse.json()
        setStats(statsData)

        // Handle rank response
        if (rankResponse.ok) {
          const rankData = await rankResponse.json()
          setRankInfo(rankData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session])

  const calculateNextLevelXP = (level: number) => {
    return level * 1000
  }

  const calculateXPPercentage = () => {
    if (!stats) return 0
    const currentLevelXP = (stats.level - 1) * 1000
    const nextLevelXP = stats.level * 1000
    const currentXP = stats.xp - currentLevelXP
    const neededXP = nextLevelXP - currentLevelXP
    return (currentXP / neededXP) * 100
  }

  const formatDate = (date: string) => {
    if (!date) return "Belum ada"
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTimeLeft = (expirationDate: string | null) => {
    if (!expirationDate) return "Tidak aktif"
    
    const now = new Date()
    const expiration = new Date(expirationDate)
    const diff = expiration.getTime() - now.getTime()
    
    if (diff <= 0) return "Kadaluarsa"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return `${days} hari ${hours} jam`
    }
    return `${hours} jam`
  }

  const formatClaimDate = (timestamp: number | undefined) => {
    if (!timestamp) return "Belum pernah"
    const claimDate = new Date(timestamp)
    const now = new Date()
    
    // Jika tanggal klaim hari ini
    if (claimDate.toDateString() === now.toDateString()) {
      return claimDate.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // Jika tanggal klaim kemarin
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (claimDate.toDateString() === yesterday.toDateString()) {
      return "Kemarin"
    }
    
    // Format tanggal lengkap untuk tanggal lainnya
    return claimDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getNextClaimTime = (timestamp: number | undefined, type: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    if (!timestamp) return "Dapat diklaim"
    
    const claimDate = new Date(timestamp)
    const now = new Date()
    let nextClaim = new Date(claimDate)
    
    switch (type) {
      case 'daily':
        nextClaim.setDate(nextClaim.getDate() + 1)
        break
      case 'weekly':
        nextClaim.setDate(nextClaim.getDate() + 7)
        break
      case 'monthly':
        nextClaim.setMonth(nextClaim.getMonth() + 1)
        break
      case 'yearly':
        nextClaim.setFullYear(nextClaim.getFullYear() + 1)
        break
    }
    
    if (now >= nextClaim) return "Dapat diklaim"
    
    const diff = nextClaim.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}j ${minutes}m`
  }

  const handleAutoLevelUpChange = async (checked: boolean) => {
    if (!stats || isUpdating) return

    const autoLevelUpSwitch = document.querySelector('button[role="switch"]') as HTMLButtonElement
    if (autoLevelUpSwitch) {
      autoLevelUpSwitch.disabled = true
    }

    try {
      const response = await fetch('/api/user/autolevelup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: stats.phoneNumber,
          autolevelup: checked
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error)
      }

      // Update local state
      setStats(prev => prev ? {
        ...prev,
        autolevelup: checked
      } : null)

      toast.success(checked ? 'Auto level up diaktifkan' : 'Auto level up dinonaktifkan')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
      // Revert switch state
      setStats(prev => prev)
    } finally {
      if (autoLevelUpSwitch) {
        autoLevelUpSwitch.disabled = false
      }
    }
  }

  const formatAFKTime = (timestamp: number) => {
    const afkDate = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - afkDate.getTime()
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days} hari ${hours} jam yang lalu`
    }
    if (hours > 0) {
      return `${hours} jam ${minutes} menit yang lalu`
    }
    return `${minutes} menit yang lalu`
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading || !stats) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <Skeleton className="h-6 w-[100px]" />
        </div>

        {/* Statistik Utama Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[80px] mb-2" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-4 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status Klaim Skeleton */}
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="h-6 w-[150px]" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-[60px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-[70px]" />
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Informasi Akun Skeleton */}
        <Card className="bg-card/80">
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0 space-y-1">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Skeleton className="h-5 w-[100px] mb-4" />
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-6 w-[50px]" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-[60px]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dasbor</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Selamat datang kembali, {stats?.username || "Pengguna"}!
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Badge variant={stats?.premium ? "default" : "secondary"} className={stats?.premium ? "bg-yellow-500" : ""}>
            <Crown className="w-3 h-3 mr-1" />
            {stats?.premium ? "Premium" : "Free"}
          </Badge>
        </div>
      </div>

      {/* Statistik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.level}</div>
            <div className="mt-2">
              <Progress value={(stats?.xp ?? 0) % 100} max={100} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                {(stats?.xp ?? 0) % 100} / 100 XP
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Koin</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.coin?.toLocaleString('id-ID')}
            </div>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Saldo koin Anda</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kemenangan</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats?.winGame || 0}</div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Total menang</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">#{rankInfo?.rank || "-"}</span>
                  <Medal className={`h-4 w-4 ${
                    rankInfo?.rank === 1 ? "text-yellow-500" :
                    rankInfo?.rank === 2 ? "text-gray-400" :
                    rankInfo?.rank === 3 ? "text-amber-600" :
                    "text-muted-foreground"
                  }`} />
                </div>
                <span className="text-xs text-muted-foreground">
                  dari {rankInfo?.total || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTimeLeft(stats?.premiumExpiration)}
            </div>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Waktu premium tersisa</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Klaim */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-medium">Status Klaim</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Harian</CardTitle>
              <Sun className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Terakhir</span>
                  <span className="text-sm font-medium">
                    {formatClaimDate(stats?.lastClaim?.daily)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Selanjutnya</span>
                  <Badge variant="outline">
                    {getNextClaimTime(stats?.lastClaim?.daily, 'daily')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mingguan</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Terakhir</span>
                  <span className="text-sm font-medium">
                    {formatClaimDate(stats?.lastClaim?.weekly)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Selanjutnya</span>
                  <Badge variant="outline">
                    {getNextClaimTime(stats?.lastClaim?.weekly, 'weekly')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bulanan</CardTitle>
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Terakhir</span>
                  <span className="text-sm font-medium">
                    {formatClaimDate(stats?.lastClaim?.monthly)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Selanjutnya</span>
                  <Badge variant="outline">
                    {getNextClaimTime(stats?.lastClaim?.monthly, 'monthly')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tahunan</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Terakhir</span>
                  <span className="text-sm font-medium">
                    {formatClaimDate(stats?.lastClaim?.yearly)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Selanjutnya</span>
                  <Badge variant="outline">
                    {getNextClaimTime(stats?.lastClaim?.yearly, 'yearly')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Informasi Akun */}
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Username</p>
                <p className="text-sm text-muted-foreground truncate">
                  {stats?.username || "Belum diatur"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Nomor Telepon</p>
                <p className="text-sm text-muted-foreground truncate">
                  {stats?.phoneNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Tanggal Bergabung</p>
                <p className="text-sm text-muted-foreground truncate">
                  {formatDate(stats?.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Klaim Terakhir</p>
                <p className="text-sm text-muted-foreground truncate">
                  {formatClaimDate(stats?.lastClaim?.daily)}
                </p>
              </div>
            </div>
          </div>

          {/* Pengaturan */}
          <div>
            <h3 className="text-sm font-medium mb-4">Pengaturan</h3>
            <div className="space-y-4">
              <div className="flex flex-row items-center justify-between gap-8">
                <div className="text-sm font-medium">Notifikasi Level Up</div>
                <div className="flex items-center space-x-2">
                  {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Switch
                    checked={stats?.autolevelup}
                    onCheckedChange={handleAutoLevelUpChange}
                    disabled={isUpdating}
                  />
                </div>
              </div>
              <div className="flex flex-row items-center justify-between gap-8">
                <div className="space-y-0.5 flex flex-row sm:flex-col items-center sm:items-start gap-2">
                  <div>
                    <div className="text-sm font-medium">Status AFK</div>
                    {stats?.afk ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          "{stats.afk.reason}"
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatAFKTime(stats.afk.timestamp)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Online
                      </div>
                    )}
                  </div>
                </div>
                <Badge 
                  variant={stats?.afk ? "secondary" : "default"} 
                  className={`self-end sm:self-start ${stats?.afk ? "bg-yellow-500/10 text-yellow-500" : ""}`}
                >
                  {stats?.afk ? "AFK" : "Online"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
