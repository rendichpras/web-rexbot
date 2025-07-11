"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PhoneInput } from "@/components/phone-input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useState } from "react"
import { OTPDialog } from "@/components/otp-dialog"
import { ChangePasswordDialog } from "./change-password-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { forgotPasswordFormSchema, type ForgotPasswordFormValues } from "@/utils/validation-schemas"

export function FormLupaPassword({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isOTPDialogOpen, setIsOTPDialogOpen] = useState(false)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      phone: "",
    },
  })

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true)
    try {
      // Buka dialog OTP
      setIsOTPDialogOpen(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerified = () => {
    // Buka dialog ganti password
    setIsChangePasswordDialogOpen(true)
  }

  const handlePasswordChanged = () => {
    toast.success("Password berhasil diubah! Silakan masuk dengan password baru Anda.")
    // Redirect ke halaman login
    router.push("/masuk")
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Lupa Password</CardTitle>
          <CardDescription>
            Masukkan nomor telepon Anda untuk mereset password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Minta OTP"}
              </Button>

              <div className="mt-4 text-center text-sm">
                Ingat password?{" "}
                <a href="/masuk" className="underline text-primary">
                  Masuk di sini
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <OTPDialog
        open={isOTPDialogOpen}
        onOpenChange={setIsOTPDialogOpen}
        phoneNumber={form.getValues("phone")}
        onVerified={handleVerified}
        type="reset_password"
      />

      <ChangePasswordDialog
        open={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
        phoneNumber={form.getValues("phone")}
        onSuccess={handlePasswordChanged}
      />
    </div>
  )
}
