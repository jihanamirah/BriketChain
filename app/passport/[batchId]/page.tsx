'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Leaf, ArrowLeft, CheckCircle2, AlertTriangle, XCircle,
  FileText, MapPin, Ship, QrCode,
  Award, CheckCircle, FlaskConical, ShieldCheck, Globe, Camera, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { verifyBatch, type BatchData } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { QRCodeSVG } from 'qrcode.react'

export default function PassportPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params.batchId as string
  const [batch, setBatch] = useState<BatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    async function loadBatch() {
      try {
        const data = await verifyBatch(batchId)
        setBatch(data)
      } catch {
        toast.error('Batch not found')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    loadBatch()
  }, [batchId, router])

  // QR Scanner logic for re-verification or scanning another product
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner(
        "reader-passport",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scanner.render(onScanSuccess, onScanFailure);
    }

    function onScanSuccess(decodedText: string) {
      setShowScanner(false);
      if (scanner) {
        scanner.clear();
      }
      toast.success(`Scanning successful: ${decodedText}`);
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

  if (loading) {
    return <PassportSkeleton />
  }

  if (!batch) {
    return null
  }

  const isGreen = batch.status_class === 'green'
  const isAmber = batch.status_class === 'amber'
  const isRejected = batch.status_class === 'red'

  // Block access to rejected batches for customers
  if (isRejected) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 text-center">
        <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-black text-destructive uppercase tracking-tight mb-2">Access Denied</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Batch <span className="font-bold text-foreground">{batch.id}</span> has been recalled from circulation because it does not meet quality standards (Automated Rejection). 
          This product is not allowed for consumption or sale.
        </p>
        <Button onClick={() => router.push('/')} className="rounded-full px-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background animate-fade-up">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-3.5 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-primary text-[15px]">BriketChain</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/')}
          className="text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </nav>

      {/* Status Header */}
      <div className={cn(
        "px-5 py-5 border-b",
        isGreen ? "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30" :
        isAmber ? "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30" :
        "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30"
      )}>
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-2",
          isGreen ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700" :
          isAmber ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700" :
          "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700"
        )}>
          {isGreen ? <CheckCircle2 className="w-4 h-4" /> : 
           isAmber ? <AlertTriangle className="w-4 h-4" /> : 
           <XCircle className="w-4 h-4" />}
          {isGreen ? 'QC PASSED — Premium Export Standard' : 
           isAmber ? 'QC HOLD — Review Required' : 
           'REJECTED — Below Standards'}
        </div>
        <p className="text-[11px] font-medium text-muted-foreground">Batch ID: {batch.id}</p>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-5 pb-16">
        
        {/* Fitur Kode QR - ONLY LEGAL DOCUMENTS */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" />
            QR Code Features
          </h2>
          <Card className="bg-card/50 border-border/50 group">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <QRCodeSVG value={`https://briketchain.co/legal/${batch.id}`} size={60} />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-primary">Legal Documents</h3>
                <p className="text-[10px] text-muted-foreground">Official Certificate & Permit for Batch {batch.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Information */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Legal Information
          </h2>
          <Card className="border-border/50 overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-border/50 text-[11px]">
              <LegalItem icon={<Award className="text-amber-500 w-4 h-4" />} title="Halal Certificate" status="Verified" id="ID001100002" />
              <LegalItem icon={<FileText className="text-blue-500 w-4 h-4" />} title="Business License (NIB)" status="Active" id="91200012345" />
              <LegalItem icon={<Globe className="text-emerald-500 w-4 h-4" />} title="Export Certification" status="Ready" id="EXP-2024-88" />
              <LegalItem icon={<FlaskConical className="text-purple-500 w-4 h-4" />} title="Lab Test Results" status="Grade A" id="LAB-BC-2024" />
            </div>
          </Card>
        </div>

        {/* Product Identity */}
        <PassportSection 
          icon={<FileText className="w-4 h-4" />} 
          title="Product Identity"
        >
          <InfoRow label="Batch ID" value={batch.id} />
          <InfoRow label="Product" value={batch.produk} />
          <InfoRow label="Production Date" value={batch.tanggal} />
          <InfoRow label="Batch Weight" value={batch.berat} />
          <InfoRow 
            label="QC Status" 
            value={batch.status} 
            valueClass={cn(
              isGreen ? "text-emerald-600 dark:text-emerald-400" : 
              isAmber ? "text-amber-600 dark:text-amber-400" : 
              "text-red-600 dark:text-red-400"
            )}
          />
        </PassportSection>

        {/* Export Information - INTEGRATED CAMERA SCANNER */}
        <PassportSection 
          icon={<Ship className="w-4 h-4" />} 
          title="Export Information"
        >
          <div className="p-4">
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Importer: <span className="text-foreground font-semibold">{batch.importir}</span></p>
              <p>Destination: <span className="text-foreground font-semibold">{batch.tujuan}</span> • Vessel: <span className="text-foreground font-semibold">{batch.kapal}</span></p>
              <p>Incoterm: <span className="text-foreground font-semibold">{batch.incoterm}</span></p>
            </div>
            
            <div className="mt-5 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-primary">Product Authenticity Verification</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Scan the QR code on the packaging to ensure it is an authentic BriketChain product</p>
              </div>
              <Button 
                onClick={() => setShowScanner(!showScanner)} 
                variant={showScanner ? "destructive" : "default"}
                size="sm"
                className="rounded-full px-6 h-9 font-bold"
              >
                {showScanner ? <X className="w-4 h-4 mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                {showScanner ? 'Close Scanner' : 'SCAN VERIFICATION'}
              </Button>

              {showScanner && (
                <div className="mt-2 w-full rounded-lg overflow-hidden border-2 border-primary">
                  <div id="reader-passport" className="w-full"></div>
                </div>
              )}
            </div>
          </div>
        </PassportSection>

        {/* Raw Material Origin */}
        <PassportSection 
          icon={<MapPin className="w-4 h-4" />} 
          title="Raw Material Origin"
        >
          <InfoRow label="Farm Group" value={batch.petani} />
          <InfoRow label="Location" value={batch.lokasi} />
          <InfoRow label="Harvest Date" value={batch.panen} />
          <InfoRow label="Raw Material" value={batch.bahan_baku} />
          <InfoRow 
            label="Contract" 
            value={batch.kontrak} 
            valueClass="text-amber-600 dark:text-amber-400"
          />
        </PassportSection>
      </div>
    </div>
  )
}

function LegalItem({ icon, title, status, id }: { icon: React.ReactNode, title: string, status: string, id: string }) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-[11px] font-bold text-foreground">{title}</h4>
        <p className="text-[9px] text-muted-foreground font-mono">{id}</p>
      </div>
      <div className="text-right">
        <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[8px] font-bold">
          <CheckCircle className="w-2.5 h-2.5" />
          {status}
        </div>
      </div>
    </div>
  )
}

function PassportSection({ 
  icon, 
  title, 
  children 
}: { 
  icon: React.ReactNode
  title: string
  children: React.ReactNode 
}) {
  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="py-2.5 px-4 bg-secondary/50 border-b">
        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  )
}

function InfoRow({ 
  label, 
  value, 
  valueClass 
}: { 
  label: string
  value: string
  valueClass?: string 
}) {
  return (
    <div className="flex justify-between items-start gap-3 px-4 py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={cn("text-xs font-semibold text-right", valueClass)}>{value}</span>
    </div>
  )
}

function PassportSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-3.5 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-24 h-5" />
        </div>
        <Skeleton className="w-20 h-8" />
      </nav>
      
      <div className="px-5 py-5 bg-secondary/50">
        <Skeleton className="w-48 h-8 rounded-full mb-2" />
        <Skeleton className="w-32 h-4" />
      </div>
      
      <div className="px-5 py-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="py-3 px-4 bg-secondary/50 border-b">
              <Skeleton className="w-32 h-4" />
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-3/4 h-4" />
              <Skeleton className="w-1/2 h-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
