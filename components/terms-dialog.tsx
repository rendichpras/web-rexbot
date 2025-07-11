import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { useRef, useState, useEffect } from "react"

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
}

export function TermsDialog({ open, onOpenChange, onAccept }: TermsDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const atBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1;
    setShowScrollButton(!atBottom);
  };

  useEffect(() => {
    if (contentRef.current) {
      const hasOverflow = contentRef.current.scrollHeight > contentRef.current.clientHeight;
      setShowScrollIndicator(hasOverflow);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Syarat dan Ketentuan</DialogTitle>
        </DialogHeader>
        <div 
          ref={contentRef}
          className="space-y-4 py-4 text-sm overflow-y-auto relative"
          onScroll={handleScroll}
        >
          <p className="text-muted-foreground">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <div className="space-y-2">
            <h3 className="font-semibold">1. Penerimaan Syarat dan Ketentuan</h3>
            <p>
              Dengan mengakses dan menggunakan layanan Rexbot, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju dengan syarat dan ketentuan ini, mohon untuk tidak menggunakan layanan kami.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2. Pendaftaran Akun</h3>
            <p>
              Untuk menggunakan layanan ini, Anda harus:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Berusia minimal 17 tahun atau di bawah pengawasan orang tua/wali</li>
              <li>Memberikan informasi yang akurat dan lengkap saat pendaftaran</li>
              <li>Menjaga kerahasiaan kredensial akun Anda</li>
              <li>Bertanggung jawab atas semua aktivitas yang terjadi di akun Anda</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">3. Privasi dan Keamanan Data</h3>
            <p>
              Kami berkomitmen untuk melindungi privasi Anda. Pengumpulan dan penggunaan data pribadi Anda diatur dalam Kebijakan Privasi kami. Data yang kami kumpulkan meliputi:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Informasi profil (nama pengguna, nomor telepon)</li>
              <li>Data penggunaan layanan</li>
              <li>Informasi perangkat dan log aktivitas</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">4. Penggunaan Layanan</h3>
            <p>
              Dalam menggunakan layanan kami, Anda setuju untuk tidak:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Melanggar hukum atau peraturan yang berlaku</li>
              <li>Mengganggu atau merusak layanan</li>
              <li>Menyebarkan konten yang melanggar hukum atau tidak pantas</li>
              <li>Menggunakan layanan untuk tujuan spam atau penipuan</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">5. Pembatasan dan Penghentian</h3>
            <p>
              Kami berhak untuk:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Membatasi atau menghentikan akses Anda jika terjadi pelanggaran</li>
              <li>Memodifikasi atau menghentikan layanan tanpa pemberitahuan</li>
              <li>Menolak layanan kepada siapa pun dengan alasan apa pun</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">6. Perubahan Ketentuan</h3>
            <p>
              Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan efektif setelah diposting di situs web. Penggunaan berkelanjutan atas layanan kami setelah perubahan tersebut merupakan persetujuan Anda terhadap ketentuan yang diubah.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">7. Kontak</h3>
            <p>
              Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami melalui email support@rexbotx.biz.id
            </p>
          </div>

          {showScrollButton && (
            <div className="sticky bottom-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center gap-1 px-4 py-2 rounded-full hover:shadow-xl transition-all"
                onClick={scrollToBottom}
              >
                <span>Scroll ke Bawah</span>
                <ChevronDown className="h-4 w-4 animate-bounce" />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Batal
          </Button>
          <Button
            onClick={() => {
              onAccept?.();
            }}
          >
            Saya Setuju
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 