import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, MessageSquare, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center py-10 px-4 md:py-16">
      <div className="w-full max-w-[800px] mx-auto">
        <div className="flex flex-col items-center justify-center gap-8 md:gap-10">
          {/* Heading Section */}
          <div className="text-center space-y-4 md:space-y-6 w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Bot WhatsApp Pintar untuk Bisnis Anda
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-[600px] mx-auto">
              Otomatisasi layanan pelanggan Anda dengan bot WhatsApp yang cerdas. 
              Hemat waktu dan tingkatkan efisiensi bisnis.
            </p>
          </div>

          {/* Button Group */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-[180px] md:w-[200px]"
            >
              Mulai Sekarang
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-[180px] md:w-[200px]"
            >
              Pelajari Lebih
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
