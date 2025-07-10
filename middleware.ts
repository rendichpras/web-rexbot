import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Tentukan path yang memerlukan autentikasi
  const isPrivatePath = path.startsWith('/dasbor')

  // Periksa apakah pengguna sudah masuk
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Jika mengakses halaman private dan belum masuk
  if (isPrivatePath && !token) {
    // Redirect ke halaman masuk dengan callback URL
    const url = new URL('/masuk', request.url)
    url.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Konfigurasi path yang akan diproses oleh middleware
export const config = {
  matcher: ['/dasbor/:path*']
} 