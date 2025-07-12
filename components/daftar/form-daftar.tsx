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
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TermsDialog } from "@/components/terms-dialog"
import { OTPDialog } from "@/components/otp-dialog"

const formSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(/^[a-z0-9_]+$/, "Username hanya boleh berisi huruf kecil, angka, dan underscore"),
  phone: z
    .string()
    .min(10, "Nomor telepon tidak valid")
    .regex(/^\+?[1-9]\d{1,14}$/, "Format nomor telepon tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf besar")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung karakter khusus"),
  confirmPassword: z.string(),
  terms: z.boolean().refine((value) => value === true, {
    message: "Anda harus menyetujui syarat dan ketentuan",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
})

type FormValues = z.infer<typeof formSchema>

export function FormDaftar() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [formData, setFormData] = useState<FormValues | null>(null)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  async function onSubmit(data: FormValues) {
    setFormData(data)
    setShowOTP(true)
  }

  const handleVerified = async () => {
    if (!formData) return

    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement
    if (submitButton) {
      submitButton.disabled = true
      submitButton.textContent = "Memproses..."
    }

    try {
      const response = await fetch("/api/daftar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          phoneNumber: formData.phone,
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error)
      }

      toast.success(result.message)
      router.push("/masuk")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = "Daftar"
      }
    }
  }

  return (
    <div className="container max-w-[400px] mx-auto py-10">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center">Daftar Akun Baru</CardTitle>
          <CardDescription className="text-center">
            Silakan isi data diri Anda untuk membuat akun baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <div className="flex items-center justify-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                          @
                        </div>
                        <Input
                          {...field}
                          className="rounded-l-none lowercase"
                          placeholder="username"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    <FormLabel>Password</FormLabel>
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Konfirmasi password"
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

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            field.onChange(checked);
                          }
                          setShowTerms(true);
                        }}
                      />
                    </FormControl>
                    <div className="text-sm leading-none">
                      Saya menyetujui{" "}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="font-medium text-primary hover:underline"
                      >
                        syarat dan ketentuan
                      </button>{" "}
                      yang berlaku
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={!form.getValues("terms")}
              >
                Daftar
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex-col space-y-2 border-t pt-6">
          <div className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <a href="/masuk" className="font-medium text-primary hover:underline">
              Masuk di sini
            </a>
          </div>
        </CardFooter>
      </Card>

      <TermsDialog 
        open={showTerms} 
        onOpenChange={(open) => {
          setShowTerms(open);
          if (!open) {
            form.setValue("terms", false);
          }
        }}
        onAccept={() => {
          form.setValue("terms", true);
          setShowTerms(false);
        }}
      />

      {formData && (
        <OTPDialog
          open={showOTP}
          onOpenChange={setShowOTP}
          phoneNumber={formData.phone}
          onVerified={handleVerified}
          type="registration"
        />
      )}
    </div>
  )
}
