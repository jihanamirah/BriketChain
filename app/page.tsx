'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Leaf, Search, Camera, X, QrCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { verifyBatch } from '@/lib/api'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function PublicPortal() {
  const router = useRouter()
  const [batchId, setBatchId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  // QR Scanner logic for landing page
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scanner.render(onScanSuccess, onScanFailure);
    }

    function onScanSuccess(decodedText: string) {
      setBatchId(decodedText);
      setShowScanner(false);
      if (scanner) {
        scanner.clear();
      }
      toast.success(`QR Scanned: ${decodedText}`);
      // Auto redirect after scan
      router.push(`/passport/${decodedText.toUpperCase()}`);
    }

    function onScanFailure(error: any) {
      // ignore
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [showScanner, router]);

  const handleVerify = async () => {
    if (!batchId.trim()) {
      toast.error('Please enter Batch ID first')
      return
    }

    setIsLoading(true)
    try {
      await verifyBatch(batchId)
      router.push(`/passport/${batchId.toUpperCase()}`)
    } catch {
      toast.error(`Batch ID not found: ${batchId.toUpperCase()}`)
    } finally {
      setIsLoading(false)
    }
  }

  const fillBatch = (id: string) => {
    setBatchId(id)
  }

  const sampleBatches = ['BRK-2604-031', 'BRK-2604-028', 'BRK-2604-019']

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-3.5 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-primary text-[15px]">BriketChain</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs font-semibold rounded-full px-4"
          onClick={() => router.push('/login')}
        >
          Login as Manager
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a4a30] via-[#2d7a4f] to-[#3d9162] px-6 py-12 pb-16">
        {/* Decorative backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(180,240,200,0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(100,200,140,0.08)_0%,transparent_50%)]" />
        
        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white/90 px-3.5 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4">
            <Leaf className="w-3 h-3" />
            Digital Twin — Agroindustry
          </div>
          
          <h1 className="text-white font-extrabold text-[clamp(26px,7vw,40px)] leading-tight text-balance">
            Shell to Global:<br/>
            The <span className="text-emerald-300">Digital Journey</span><br/>
            of Sustainable<br/>
            Briquettes
          </h1>
          
          <p className="text-white/75 text-[13px] font-light mt-2 max-w-[280px]">
            This system ensures transparency, traceability, and export-quality assurance.
          </p>
        </div>
      </div>

      {/* Verification Card */}
      <div className="px-5 -mt-6 relative z-10">
        <Card className="shadow-lg border-primary/10">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              Product Batch Verification
              <span className="flex-1 h-px bg-border" />
            </p>
            
            <Input
              value={batchId}
              onChange={(e) => setBatchId(e.target.value.toUpperCase())}
              placeholder="Enter Batch ID or Scan"
              className="font-medium h-12 text-lg"
            />
            
            <div className="flex gap-2.5 mt-3">
              <Button 
                onClick={handleVerify}
                disabled={isLoading}
                className="flex-1 h-12 shadow-md text-[13px] font-bold"
              >
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? 'Verifying...' : 'VERIFY BATCH'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`w-12 h-12 shrink-0 border-2 ${showScanner ? 'bg-primary text-primary-foreground border-primary' : 'border-primary/20 text-primary'}`}
                onClick={() => setShowScanner(!showScanner)}
              >
                {showScanner ? <X className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              </Button>
            </div>

            {/* QR Scanner Container */}
            {showScanner && (
              <div className="mt-4 rounded-2xl overflow-hidden border-2 border-primary/30 bg-muted relative">
                <div id="reader" className="w-full"></div>
                <div className="p-3 text-center bg-background/80 backdrop-blur-sm border-t border-border">
                  <p className="text-[10px] font-medium text-muted-foreground">Position QR code inside the box</p>
                </div>
              </div>
            )}

            {/* Sample batch chips */}
            {!showScanner && (
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-[10px] font-bold text-muted-foreground w-full mb-1">SAMPLE DATA:</span>
                {sampleBatches.map((id) => (
                  <button
                    key={id}
                    onClick={() => fillBatch(id)}
                    className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                  >
                    {id}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Impact Card */}
      <div className="px-5 mt-8">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 border-primary/20">
          <CardContent className="p-5">
            <h3 className="font-bold text-[13px] text-primary mb-3 flex items-center gap-1.5">
              <Leaf className="w-4 h-4" />
              Sustainability Impact
            </h3>
            
            <div className="space-y-2">
              <ImpactRow label="Est. carbon footprint:" value="1.2 kg CO2/kg briquette" />
              <ImpactRow label="Local raw materials:" value="100% Coconut Shell Riau" />
              <ImpactRow label="Certification:" value="SNI 01-6235-2000 + ISO 9001" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer info */}
      <div className="px-10 mt-10 text-center">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          BriketChain uses Digital Twin technology to ensure full transparency for every kg of briquettes we produce.
        </p>
      </div>
    </div>
  )
}

function ImpactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      <span>{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </div>
  )
}
