"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { PhoneInput } from "@/components/phone-input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useState, useEffect } from "react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

// Schema untuk form nomor telepon
const phoneFormSchema = z.object({
  phone: z
    .string()
    .min(10, "Nomor telepon tidak valid")
    .regex(/^\+?[1-9]\d{1,14}$/, "Format nomor telepon tidak valid"),
})

// Schema untuk form password baru
const passwordFormSchema = z.object({
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf besar")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung karakter khusus"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak sama",
  path: ["confirmPassword"],
})

type PhoneFormValues = z.infer<typeof phoneFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>

type Step = "phone" | "otp" | "password"

const API_URL = process.env.NEXT_PUBLIC_OTP_API_URL || "https://api.rexbot.com"
const API_KEY = process.env.NEXT_PUBLIC_OTP_API_KEY || "your-api-key"

export function FormLupaPassword() {
  const [step, setStep] = useState<Step>("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [timeLeft, setTimeLeft] = useState(180)
  const [canResend, setCanResend] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phone: "",
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Effect untuk timer OTP
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === "otp" && timeLeft > 0) {
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
  }, [step, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const requestOTP = async (phone: string) => {
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement
    if (submitButton) {
      submitButton.disabled = true
      submitButton.textContent = "Memproses..."
    }

    try {
      const cleanPhoneNumber = phone.replace(/^\+/, '')
      
      const response = await fetch(`${API_URL}/api/otp/request`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: cleanPhoneNumber,
          type: "reset_password",
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setTimeLeft(180)
      setCanResend(false)
      setPhoneNumber(phone)
      setStep("otp")
      toast.success("Kode OTP telah dikirim!")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = "Lanjutkan"
      }
    }
  }

  const verifyOTP = async () => {
    if (otp.length !== 6) return

    const verifyButton = document.querySelector('button:not([type])') as HTMLButtonElement
    if (verifyButton) {
      verifyButton.disabled = true
      verifyButton.textContent = "Memverifikasi..."
    }

    try {
      const cleanPhoneNumber = phoneNumber.replace(/^\+/, '')
      
      const response = await fetch(`${API_URL}/api/otp/verify`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: cleanPhoneNumber,
          code: otp,
          type: "reset_password",
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      toast.success("Verifikasi OTP berhasil!")
      setStep("password")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      if (verifyButton) {
        verifyButton.disabled = false
        verifyButton.textContent = "Verifikasi"
      }
    }
  }

  const onSubmitPhone = async (values: PhoneFormValues) => {
    await requestOTP(values.phone)
  }

  const onSubmitPassword = async (values: PasswordFormValues) => {
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement
    if (submitButton) {
      submitButton.disabled = true
      submitButton.textContent = "Menyimpan..."
    }

    try {
      const cleanPhoneNumber = phoneNumber.replace(/^\+/, '')
      
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: cleanPhoneNumber,
          newPassword: values.password,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      toast.success("Password berhasil diubah! Silakan masuk dengan password baru Anda.")
      router.push("/masuk")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = "Simpan Password Baru"
      }
    }
  }

  return (
    <div className="container max-w-[400px] mx-auto py-10">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center">Lupa Password</CardTitle>
          <CardDescription className="text-center">
            {step === "phone" && "Masukkan nomor telepon Anda untuk mereset password"}
            {step === "otp" && "Masukkan kode OTP yang telah dikirim ke nomor " + phoneNumber}
            {step === "password" && "Buat password baru untuk akun Anda"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "phone" && (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onSubmitPhone)} className="space-y-6">
              <FormField
                  control={phoneForm.control}
                name="phone"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <PhoneInput
                        {...field}
                        defaultCountry="ID"
                        international
                        onChange={(value) => onChange(value || "")}
                          className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                  Lanjutkan
                </Button>
              </form>
            </Form>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  className="gap-2"
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
              </div>

              <div className="flex flex-col items-center gap-2 text-sm">
                {canResend ? (
                  <Button
                    variant="link"
                    onClick={() => requestOTP(phoneNumber)}
                    className="h-auto p-0"
                  >
                    Kirim ulang kode OTP
              </Button>
                ) : (
                  <p className="text-muted-foreground">
                    Kirim ulang dalam ({formatTime(timeLeft)})
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  disabled={otp.length !== 6}
                  onClick={verifyOTP}
                >
                  Verifikasi
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("phone")}
                  className="gap-2"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </Button>
              </div>
            </div>
          )}

          {step === "password" && (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Baru</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan password baru"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Konfirmasi password baru"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-2">
                  <Button type="submit">
                    Simpan Password Baru
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("otp")}
                    className="gap-2"
                  >
                    <ArrowLeft size={16} />
                    Kembali
                  </Button>
              </div>
            </form>
          </Form>
          )}
        </CardContent>

        <CardFooter className="flex-col space-y-2 border-t pt-6">
          <div className="text-center text-sm text-muted-foreground">
            Ingat password?{" "}
            <a href="/masuk" className="font-medium text-primary hover:underline">
              Masuk di sini
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
