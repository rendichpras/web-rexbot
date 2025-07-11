import { signIn } from "next-auth/react"
import { toast } from "sonner"

export const handleLogin = async (phone: string, password: string) => {
  try {
    // Panggil API login
    const response = await fetch("/api/masuk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        password,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error)
    }

    // Jika berhasil, lakukan sign in dengan NextAuth
    const signInResult = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    })

    if (signInResult?.error) {
      throw new Error(signInResult.error)
    }

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("Terjadi kesalahan saat masuk")
  }
}

export const handleRegister = async (
  username: string,
  phone: string,
  password: string
) => {
  try {
    const response = await fetch("/api/daftar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        phoneNumber: phone,
        password,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Terjadi kesalahan saat mendaftar")
    }

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("Terjadi kesalahan saat mendaftar")
  }
}

export const handleChangePassword = async (phoneNumber: string, newPassword: string) => {
  try {
    const response = await fetch("/api/user/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        newPassword,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Terjadi kesalahan saat mengubah password")
    }

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("Terjadi kesalahan saat mengubah password")
  }
} 