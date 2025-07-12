"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Home, Menu, LayoutDashboard, User, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSession } from "next-auth/react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Fungsi untuk mendapatkan inisial username
  const getInitials = (username: string) => {
    return username
      ? username.slice(0, 2).toUpperCase()
      : 'U'
  }

  // Sembunyikan navbar di halaman auth
  if (pathname === "/masuk" || pathname === "/daftar" || pathname === "/lupa-password") {
    return null
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background">
      <nav className="container flex h-14 max-w-7xl mx-auto items-center justify-between px-4">
        {/* Logo dan Title */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo-dark.webp"
            alt="Logo"
            width={28}
            height={28}
            className="rounded-full"
          />
          <Link href="/">
            <span className="text-base font-bold">Rexbot</span>
          </Link>
        </div>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" && "text-primary"
            )}
          >
            Beranda
          </Link>
        </div>

        {/* Avatar dan Auth Menu Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getInitials(session.user?.username || 'User')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex items-center gap-2" asChild>
                  <Link href="/dasbor">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dasbor</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-destructive focus:text-destructive" 
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link href="/masuk" className="w-full">
                    Masuk
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/daftar" className="w-full">
                    Daftar
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Menu Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs p-0">
              <SheetHeader className="border-b px-6 py-4">
                <SheetTitle>Menu Navigasi</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col h-full">
                <div className="flex-1">
                  <Link
                    href="/"
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors hover:bg-muted",
                      pathname === "/" && "bg-muted"
                    )}
                  >
                    <Home className="h-4 w-4" />
                    Beranda
                  </Link>
                  {session && (
                    <Link 
                      href="/dasbor"
                      className={cn(
                        "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors hover:bg-muted",
                        pathname === "/dasbor" && "bg-muted"
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dasbor
                    </Link>
                  )}
                </div>
                <div className="border-t">
                  <div className="grid gap-2 p-6">
                    {session ? (
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        size="sm"
                        onClick={() => signOut()}
                      >
                        Keluar
                      </Button>
                    ) : (
                      <>
                        <Link href="/daftar" className="w-full">
                          <Button variant="outline" className="w-full" size="sm">
                            Daftar
                          </Button>
                        </Link>
                        <Link href="/masuk" className="w-full">
                          <Button className="w-full" size="sm">
                            Masuk
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  )
} 