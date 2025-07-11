"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "sonner"

// Ganti dengan URL API dan key yang sebenarnya
const API_URL = process.env.NEXT_PUBLIC_OTP_API_URL || "https://api.rexbot.com"
const API_KEY = process.env.NEXT_PUBLIC_OTP_API_KEY || "your-api-key"

interface OTPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phoneNumber: string
  onVerified: () => void
  type: "registration" | "reset_password"
}

export function OTPDialog({ open, onOpenChange, phoneNumber, onVerified, type }: OTPDialogProps) {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(180) // 3 menit dalam detik
  const [canResend, setCanResend] = useState(false)

  // Bersihkan nomor telepon (hapus +)
  const cleanPhoneNumber = phoneNumber.replace(/^\+/, '')
  
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (open && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [open, timeLeft])

  useEffect(() => {
    if (open) {
      requestOTP()
    } else {
      setOtp("")
      setTimeLeft(180)
      setCanResend(false)
    }
  }, [open])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const requestOTP = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/otp/request`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: cleanPhoneNumber,
          type: type,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setTimeLeft(180)
      setCanResend(false)
      toast.success("Kode OTP telah dikirim!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengirim OTP")
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (otp.length !== 6) return

    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/otp/verify`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: cleanPhoneNumber,
          code: otp,
          type: type,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      toast.success("Verifikasi OTP berhasil!")
      onVerified()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verifikasi OTP gagal")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verifikasi OTP</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Masukkan kode OTP yang telah dikirim ke nomor {phoneNumber}
          </p>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <div className="flex flex-col items-center gap-2 text-sm">
            <p className="text-muted-foreground">
              Waktu tersisa: {formatTime(timeLeft)}
            </p>
            {canResend && (
              <Button
                variant="ghost"
                disabled={isLoading}
                onClick={requestOTP}
                className="h-auto p-0 text-primary"
              >
                Kirim ulang kode
              </Button>
            )}
          </div>

          <div className="flex w-full justify-end gap-2">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              disabled={isLoading || otp.length !== 6}
              onClick={verifyOTP}
            >
              {isLoading ? "Memverifikasi..." : "Verifikasi"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 