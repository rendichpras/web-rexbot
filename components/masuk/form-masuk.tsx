"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { PhoneInput } from "@/components/phone-input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TermsDialog } from "@/components/terms-dialog"

const formSchema = z.object({
  phone: z
    .string()
    .min(10, "Nomor telepon tidak valid")
    .regex(/^\+?[1-9]\d{1,14}$/, "Format nomor telepon tidak valid"),
  password: z
    .string()
    .min(1, "Password harus diisi"),
})

type FormValues = z.infer<typeof formSchema>

export function FormMasuk({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true)
      
      // Panggil API login
      const response = await fetch("/api/masuk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: data.phone,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error)
        return
      }

      // Jika berhasil, lakukan sign in dengan NextAuth
      const signInResult = await signIn("credentials", {
        phone: data.phone,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        toast.error(signInResult.error)
        return
      }

      router.push("/dasbor")
      router.refresh()
      toast.success("Masuk berhasil!")
    } catch (error) {
      toast.error("Terjadi kesalahan saat masuk")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("container max-w-[400px] mx-auto py-10", className)} {...props}>
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center">Masuk ke Akun</CardTitle>
          <CardDescription className="text-center">
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
                        className="bg-background"
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
                        className="text-sm text-primary hover:underline"
                      >
                        Lupa password?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Masukkan password"
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
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex-col space-y-4 border-t pt-6">
          <div className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <a href="/daftar" className="font-medium text-primary hover:underline">
              Daftar di sini
            </a>
          </div>
        </CardFooter>
      </Card>

      <TermsDialog 
        open={showTerms} 
        onOpenChange={setShowTerms}
        onAccept={() => setShowTerms(false)}
      />
    </div>
  )
}
