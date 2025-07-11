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
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
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
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TermsDialog } from "@/components/terms-dialog"
import { loginFormSchema, type LoginFormValues } from "@/utils/validation-schemas"
import { handleLogin } from "@/utils/auth"

export function FormMasuk({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const router = useRouter()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormValues) {
    try {
      setIsLoading(true)
      await handleLogin(data.phone, data.password)
      router.push("/dasbor")
      router.refresh()
      toast.success("Masuk berhasil!")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Terjadi kesalahan saat masuk")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Masuk ke Akun Anda</CardTitle>
          <CardDescription>
            Masukkan nomor telepon dan password untuk masuk
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <a
                        href="/lupa-password"
                        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                      >
                        Lupa password?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>

              <div className="mt-2 text-center text-sm">
                Belum punya akun?{" "}
                <a href="/daftar" className="underline text-primary">
                  Daftar di sini
                </a>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                Dengan masuk, Anda menyetujui{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-primary underline"
                >
                  syarat dan ketentuan
                </button>{" "}
                yang berlaku
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <TermsDialog 
        open={showTerms} 
        onOpenChange={setShowTerms}
        onAccept={() => setShowTerms(false)}
      />
    </div>
  )
}
