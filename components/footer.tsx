"use client"

import { usePathname } from "next/navigation"

export function Footer() {

    const pathname = usePathname()
    // Sembunyikan navbar di halaman auth
    if (pathname === "/masuk" || pathname === "/daftar" || pathname === "/lupa-password") {
        return null
    }

    return (
        <footer className="w-full border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto py-4 px-6">
                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} Rexbot. Seluruh hak cipta dilindungi.
                    </p>
                </div>
            </div>
        </footer>
    );
} 