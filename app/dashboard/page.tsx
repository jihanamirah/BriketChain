'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  LogOut, TrendingDown, TrendingUp, Thermometer, 
  CheckCircle2, AlertTriangle, XCircle, ChevronRight,
  Link2, Activity, Zap, Factory, ShoppingCart, ShieldCheck,
  Package, Calculator, Info, Play, BarChart3, Globe, Users, Scale
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { 
  getScenario, getBatches, getAlerts, getComparison, getSuppliers, getIoTTemperature,
  getKPIs,
  type ScenarioData, type BatchSummary, type AlertItem, type ComparisonItem, type Supplier, type IoTData
} from '@/lib/api'
import { cn } from '@/lib/utils'

type ScenarioType = 'current' | 'future'

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [scenarioData, setScenarioData] = useState<ScenarioData | null>(null)
  const [batches, setBatches] = useState<BatchSummary[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [comparison, setComparison] = useState<ComparisonItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [iotData, setIotData] = useState<IoTData | null>(null)
  const [realTimeTemps, setRealTimeTemps] = useState<number[]>([60, 60.2, 59.8, 60.1, 59.9, 60.3, 60, 59.7, 60.1, 60.2])
  const [kpis, setKpis] = useState<Record<string, number>>({})

  // Inventory States
  const [stockLevel, setStockLevel] = useState(25000)
  const [demand, setDemand] = useState(50000)
  const [orderCost, setOrderCost] = useState(150000)
  const [holdCost, setHoldCost] = useState(5000)

  
  // Manager Only: Optimization States
  const [optDistance, setOptDistance] = useState(50)
  const [optTransCost, setOptTransCost] = useState(2000)
  const [optSourceCost, setOptSourceCost] = useState(5000)
  const [optMargin, setOptMargin] = useState(25)

  useEffect(() => {
    // Check auth
    const auth = sessionStorage.getItem('auth')
    if (!auth) {
      router.push('/login')
      return
    }
    const { nama, role } = JSON.parse(auth)
    setUserName(nama)
    setUserRole(role)
    
    // Load initial data
    loadData()
  }, [router])

  const loadData = useCallback(async () => {
    try {
      const [scenarioRes, batchesRes, alertsRes, comparisonRes, suppliersRes, kpiRes] = await Promise.all([
        getScenario('future'),
        getBatches(),
        getAlerts(),
        getComparison(),
        getSuppliers(),
        getKPIs()
      ])
      setScenarioData(scenarioRes)
      setBatches(batchesRes)
      setAlerts(alertsRes)
      setComparison(comparisonRes)
      setSuppliers(suppliersRes)
      setKpis(kpiRes)
    } catch {
      toast.error('Failed to load data')
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // IoT data polling with rolling effect
  useEffect(() => {
    const fetchIoT = async () => {
      try {
        const data = await getIoTTemperature('future')
        setIotData(data)
        
        // Add new value and keep last 20 points for scrolling effect
        setRealTimeTemps(prev => {
          const newVal = 60 + (Math.random() * 0.8 - 0.4) // Simulating fluctuations around 60
          const updated = [...prev, newVal]
          return updated.slice(-20) // Fixed window of 20 points
        })
      } catch {
        // Silent fail for IoT
      }
    }
    fetchIoT()
    const interval = setInterval(fetchIoT, 1000)
    return () => clearInterval(interval)
  }, [])


  const handleLogout = () => {
    sessionStorage.removeItem('auth')
    toast.success('Logout successful')
    setTimeout(() => router.push('/'), 500)
  }

  const handleViewBatch = (batchId: string) => {
    router.push(`/passport/${batchId}`)
  }

  // EOQ Calculation
  const eoqResult = useMemo(() => {
    if (holdCost === 0) return 0
    return Math.sqrt((2 * demand * orderCost) / holdCost).toFixed(2)
  }, [demand, orderCost, holdCost])

  // Optimization Calculations
  const inventoryCost = Number(eoqResult) * 0.1 // Simplified inventory cost
  const transportCost = optDistance * optTransCost
  const sourcingCost = optSourceCost * 1000 // assuming 1000kg
  const totalCost = inventoryCost + transportCost + sourcingCost
  const sellingPrice = totalCost * (1 + optMargin / 100)

  const reOrderPoint = 17250
  const isLowStock = stockLevel < reOrderPoint
  const isManager = userRole === 'manager'

  // ESG Data
  const esgSuppliers = [
    { name: 'Sumber Makmur Farm Group', env: 85, soc: 90, gov: 95 },
    { name: 'Harapan Baru Farm Group', env: 70, soc: 75, gov: 80 },
    { name: 'Berkah Alam Farm Group', env: 92, soc: 88, gov: 90 }
  ].map(s => ({ ...s, total: ((s.env + s.soc + s.gov) / 3).toFixed(1) }))

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-5 py-3.5 bg-card border-b border-border shadow-sm">
        <div className="font-bold text-[15px] text-primary">
          Ops <span className="font-normal text-muted-foreground text-[13px]">| Control Tower</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] font-black text-primary leading-none uppercase">{userName}</p>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{userRole}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="text-xs hover:text-destructive hover:border-destructive rounded-full"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ops" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-card px-5 h-auto py-0 gap-1 overflow-x-auto no-scrollbar">
          <TabsTrigger value="ops" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4 font-bold text-xs uppercase tracking-wider">
            Operational
          </TabsTrigger>
          <TabsTrigger value="strategic" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4 font-bold text-xs uppercase tracking-wider">
            Strategic
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4 font-bold text-xs uppercase tracking-wider">
            Inventory
          </TabsTrigger>
          
          {/* Manager Only Tabs */}
          {isManager && (
            <>
              <TabsTrigger value="optimization" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4 font-bold text-xs uppercase tracking-wider text-amber-600">
                Optimization
              </TabsTrigger>
              <TabsTrigger value="esg" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4 font-bold text-xs uppercase tracking-wider text-amber-600">
                ESG
              </TabsTrigger>
            </>
          )}

          <TabsTrigger value="internal" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4 font-bold text-xs uppercase tracking-wider">
            Logistics
          </TabsTrigger>
        </TabsList>

        {/* Operational Tab */}
        <TabsContent value="ops" className="m-0">
          {/* Main KPIs Row */}
          <div className="grid grid-cols-2 gap-3 p-5 pb-0">
            <KPICard
              icon={<Zap className="w-4 h-4" />}
              label="Yield"
              value={`${kpis.yield_pct || 89.9}%`}
              delta="+9.9% optimization"
              isGood={true}
            />
            <KPICard
              icon={<XCircle className="w-4 h-4" />}
              label="Reject"
              value={`${kpis.avg_reject_rate || 9.9}%`}
              delta="-5.9% vs manual"
              isGood={true}
            />
            <KPICard
              icon={<Factory className="w-4 h-4" />}
              label="Production Cost"
              value={`Rp ${kpis.cost_per_kg || 772}/kg`}
              delta="-6.1% efficient"
              isGood={true}
            />
            <KPICard
              icon={<ShoppingCart className="w-4 h-4" />}
              label="Re-Order Point"
              value={`${(kpis.reorder_point || 17250).toLocaleString()} kg`}
              delta="Safety Stock"
              isGood={true}
            />
          </div>

          {/* IoT Monitor */}
          <div className="px-5 mt-8">
            <SectionTitle>
              <Activity className="w-3.5 h-3.5 text-primary" />
              Live Temperature Monitoring (Oven Drying)
            </SectionTitle>
            <Card className="shadow-lg border-primary/10 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Thermometer className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">Oven #01-A</h3>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Real-time IoT Feed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-primary leading-none">{iotData?.current || '-'}°C</div>
                    <div className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block border",
                      iotData?.status === 'safe' 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    )}>
                      {iotData?.message || 'Connecting...'}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <LiveLineChart data={realTimeTemps} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottleneck Visualization */}
          <div className="px-5 mt-6 pb-10">
            <SectionTitle>
              <Factory className="w-3.5 h-3.5 text-primary" />
              Bottleneck Visualization (Stage Queue)
            </SectionTitle>
            <Card className="shadow-lg border-primary/10">
              <CardContent className="p-5">
                <QueueChart 
                  data={scenarioData?.queue || []} 
                  labels={['Grinding', 'Drying', 'Carbonizing', 'Pressing', 'Packing']}
                  scenario="future"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Strategic Tab */}
        <TabsContent value="strategic" className="m-0 p-5 space-y-5">
          <SectionTitle>Automated QC System (No Manual Intervention)</SectionTitle>
          {/* Alerts */}
          <div className="space-y-2">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>

          {/* Comparison Table */}
          <Card className="shadow-md overflow-hidden border-primary/10">
            <CardHeader className="py-3 px-4 bg-primary text-primary-foreground">
              <CardTitle className="text-[11px] font-bold uppercase tracking-widest">
                Impact Comparison: CS vs FS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {comparison.map((item, i) => (
                <div 
                  key={i} 
                  className="flex justify-between items-center px-4 py-3 border-b last:border-0 text-[11px]"
                >
                  <span className="text-muted-foreground font-medium">{item.metric}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-600 font-bold opacity-50 line-through">{item.current}</span>
                    <span className="text-primary font-black bg-primary/10 px-2 py-0.5 rounded">{item.future}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="m-0 p-5 space-y-6">
          <SectionTitle>
            <Package className="w-3.5 h-3.5 text-primary" />
            Inventory & Stock
          </SectionTitle>
          <Card className="shadow-lg border-primary/10">
            <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-end">
                  <h3 className={cn("text-3xl font-black", isLowStock ? "text-destructive" : "text-primary")}>
                    {stockLevel.toLocaleString()} <span className="text-sm font-bold text-muted-foreground">/ 50,000 kg</span>
                  </h3>
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border", isLowStock ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/10 text-primary border-primary/20")}>
                    {isLowStock ? "RESTOCK NEEDED" : "STOCK SECURE"}
                  </span>
                </div>
              <Slider value={[stockLevel]} max={50000} step={100} onValueChange={(val) => setStockLevel(val[0])} />
              <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                <span>0 kg</span>
                <span className="text-destructive">ROP: 17,250 kg</span>
                <span>Max: 50,000 kg</span>
              </div>
              {isLowStock && (
                <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 text-xs font-bold text-destructive">
                  WARNING: Stock below Re-Order Point (17,250 kg)!
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/10">
            <CardHeader><CardTitle className="text-xs font-bold uppercase tracking-widest">EOQ Calculator</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Demand (D)</p>
                  <Input type="number" value={demand} onChange={e => setDemand(Number(e.target.value))} className="h-8 text-xs font-bold" />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Ordering (S)</p>
                  <Input type="number" value={orderCost} onChange={e => setOrderCost(Number(e.target.value))} className="h-8 text-xs font-bold" />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Holding (H)</p>
                  <Input type="number" value={holdCost} onChange={e => setHoldCost(Number(e.target.value))} className="h-8 text-xs font-bold" />
                </div>
              </div>
              <div className="p-4 bg-primary/5 rounded-xl text-center border border-primary/10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Optimal Order Quantity</p>
                <p className="text-2xl font-black text-primary">{eoqResult} kg</p>
                <div className="mt-3 flex items-start gap-2 text-[10px] text-muted-foreground text-left">
                  <Info className="w-3 h-3 text-primary mt-0.5" />
                  <p>EOQ determines optimal order quantity to minimize total cost.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manager Only: Optimization Tab */}
        {isManager && (
          <TabsContent value="optimization" className="m-0 p-5 space-y-6">
            <SectionTitle>
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              Cost Optimization Module
            </SectionTitle>
            <Card className="shadow-lg border-amber-600/10">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <OptInput label="Distance (km)" value={optDistance} onChange={setOptDistance} />
                  <OptInput label="Trans Cost (Rp/km)" value={optTransCost} onChange={setOptTransCost} />
                  <OptInput label="Source Cost (Rp/kg)" value={optSourceCost} onChange={setOptSourceCost} />
                  <OptInput label="Target Margin (%)" value={optMargin} onChange={setOptMargin} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <CostRow label="Inventory Cost" value={inventoryCost} />
                  <CostRow label="Transport Cost" value={transportCost} />
                  <CostRow label="Sourcing Cost" value={sourcingCost} />
                  <CostRow label="Total Cost" value={totalCost} isTotal />
                </div>

                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Recommended Selling Price</p>
                  <p className="text-3xl font-black text-emerald-600">Rp {sellingPrice.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-emerald-700/60 uppercase mt-2">Optimization Result: Best Decision</p>
                </div>

                {/* Comparison Bar Chart */}
                <div className="pt-4">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Cost Comparison: Current vs Optimized</p>
                  <div className="flex gap-8 items-end h-24 px-10">
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-amber-200 rounded-t-lg transition-all h-[90%]" />
                      <span className="text-[8px] font-bold uppercase">Current</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-emerald-500 rounded-t-lg transition-all h-[70%]" />
                      <span className="text-[8px] font-bold uppercase">Optimized</span>
                    </div>
                  </div>
                  <p className="text-[8px] text-emerald-600 font-bold text-center mt-3 animate-pulse">Potential Savings: 22.4%</p>
                </div>

                <div className="mt-4 p-3 bg-secondary rounded-xl text-[10px] text-muted-foreground flex gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <p>This module integrates multiple cost drivers for optimal decision-making across the entire supply chain.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Manager Only: ESG Tab */}
        {isManager && (
          <TabsContent value="esg" className="m-0 p-5 space-y-6 pb-12">
            <SectionTitle>
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              ESG Sourcing Performance
            </SectionTitle>
            <Card className="shadow-lg border-emerald-600/10 overflow-hidden">
              <CardContent className="p-0">
                <table className="w-full text-[10px]">
                  <thead className="bg-secondary/50 border-b">
                    <tr className="text-muted-foreground font-bold uppercase tracking-tighter">
                      <th className="p-3 text-left">Supplier</th>
                      <th className="p-3 text-center">Env</th>
                      <th className="p-3 text-center">Soc</th>
                      <th className="p-3 text-center">Gov</th>
                      <th className="p-3 text-center text-primary">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {esgSuppliers.map((s, i) => (
                      <tr key={i} className={cn("hover:bg-muted/50", i === 2 && "bg-emerald-500/5")}>
                        <td className="p-3 font-bold">{s.name} {i === 2 && "⭐"}</td>
                        <td className="p-3 text-center">{s.env}</td>
                        <td className="p-3 text-center">{s.soc}</td>
                        <td className="p-3 text-center">{s.gov}</td>
                        <td className="p-3 text-center font-black text-primary">{s.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 bg-emerald-500/5 border-t">
                  <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    RECOMMENDATION: Berkah Alam Farm Group (Best ESG Performer)
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
                    ESG ensures sustainable and compliant sourcing decisions by evaluating environmental impact, worker welfare, and legal transparency.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="pt-6">
              <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[2px] mb-8">ESG Score Comparison</p>
              <div className="flex gap-4 items-end h-32 px-2">
                {esgSuppliers.map((s, i) => {
                  const isWinner = i === 2
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                      <div className="relative w-full flex flex-col items-center">
                        {isWinner && (
                          <div className="absolute -top-7 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce uppercase">
                            Best Performance
                          </div>
                        )}
                        <div 
                          className={cn(
                            "w-full rounded-t-2xl transition-all duration-500 shadow-md", 
                            isWinner 
                              ? "bg-gradient-to-t from-emerald-600 to-emerald-400 ring-4 ring-emerald-500/10" 
                              : "bg-emerald-100 hover:bg-emerald-200"
                          )} 
                          style={{ height: `${s.total}%` }} 
                        />
                      </div>
                      <span className={cn(
                        "text-[11px] font-black text-center leading-tight transition-colors",
                        isWinner ? "text-emerald-700" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {s.name.replace(' Farm Group', '')}
                      </span>
                      <div className={cn(
                        "text-[13px] font-black",
                        isWinner ? "text-emerald-600" : "text-muted-foreground"
                      )}>
                        {s.total}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ESG Definitions */}
              <div className="mt-10 space-y-4 p-5 bg-secondary/30 rounded-3xl border border-border/50">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <p className="text-[10px] leading-relaxed">
                      <span className="font-black text-emerald-700 uppercase">Environmental:</span> Carbon emissions, energy efficiency, and waste management.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <p className="text-[10px] leading-relaxed">
                      <span className="font-black text-blue-700 uppercase">Social:</span> Worker welfare, occupational safety, and farmer relations.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                    <p className="text-[10px] leading-relaxed">
                      <span className="font-black text-purple-700 uppercase">Governance:</span> Legal compliance, transparency, and corporate management.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground italic leading-relaxed text-center">
                    "Total ESG score is used to select the most sustainable and reliable suppliers in the supply chain."
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        )}

        {/* Logistics Tab */}
        <TabsContent value="internal" className="m-0 p-5 space-y-6 pb-12">
          <SectionTitle>
            <Link2 className="w-3.5 h-3.5 text-primary" />
            Live Batch Traceability Log
          </SectionTitle>
          
          <Card className="shadow-lg border-primary/10 overflow-hidden">
            <CardContent className="p-0">
              <table className="w-full text-[12px]">
                <thead className="bg-[#005f6b] text-white">
                  <tr className="uppercase font-bold tracking-wider">
                    <th className="p-3 text-left border-r border-white/10">ID Batch</th>
                    <th className="p-3 text-center border-r border-white/10">Stage</th>
                    <th className="p-3 text-center border-r border-white/10">Avg Temp</th>
                    <th className="p-3 text-center">QC Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <TraceRow id="BRK-2604-031" stage="Completed" temp="60.3°C" status="PASSED" color="green" />
                  <TraceRow id="BRK-2604-019" stage="Shipped" temp="60.0°C" status="PASSED" color="green" />
                  <TraceRow id="BRK-2604-028" stage="QC Hold" temp="62.1°C" status="HOLD" color="amber" />
                  <TraceRow id="BRK-2604-025" stage="Drying" temp="60.0°C" status="IN PROGRESS" color="amber" />
                  <TraceRow id="BRK-2604-015" stage="Rejected" temp="61.3°C" status="REJECTED" color="red" />
                </tbody>
              </table>
            </CardContent>
          </Card>

          <SectionTitle>Real-time Batch Status (Automated)</SectionTitle>
          <div className="space-y-3">
            {batches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} onView={handleViewBatch} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function KPICard({ icon, label, value, delta, isGood }: { icon: React.ReactNode, label: string, value: string, delta: string, isGood: boolean }) {
  return (
    <Card className="shadow-sm border-primary/5 hover:border-primary/20 transition-all group">
      <CardContent className="p-4">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary mb-2.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{icon}</div>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-foreground tracking-tight">{value}</p>
        <p className={cn("text-[9px] font-bold mt-1.5 flex items-center gap-1", isGood ? "text-primary" : "text-amber-600")}>
          {isGood ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
          {delta}
        </p>
      </CardContent>
    </Card>
  )
}


function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-3 flex items-center gap-2">{children}</p>
  )
}

function OptInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{label}</p>
      <Input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className="h-8 text-xs font-bold" />
    </div>
  )
}

function CostRow({ label, value, isTotal }: { label: string, value: number, isTotal?: boolean }) {
  return (
    <div className={cn("flex justify-between items-center py-1.5 px-3 rounded-lg", isTotal ? "bg-primary text-primary-foreground" : "bg-secondary/50")}>
      <span className={cn("text-[10px]", isTotal ? "font-black" : "font-medium text-muted-foreground")}>{label}</span>
      <span className={cn("text-xs font-bold", isTotal ? "" : "text-foreground")}>Rp {value.toLocaleString()}</span>
    </div>
  )
}

function LiveLineChart({ data }: { data: number[] }) {
  if (data.length === 0) return <div className="h-24 bg-muted animate-pulse rounded-xl" />
  const min = 55, max = 70, range = max - min, width = 1000, height = 120
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  }).join(' ')
  return (
    <div className="relative h-24 w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="currentColor" className="text-border" strokeDasharray="4 4" />
        <polyline fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" className="text-primary transition-all duration-300" points={points} />
        <polyline fill="none" stroke="currentColor" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" className="text-primary/20 blur-sm" points={points} />
        {data.length > 0 && <circle cx={width} cy={height - ((data[data.length-1] - min) / range) * height} r="12" className="fill-primary animate-pulse" />}
      </svg>
    </div>
  )
}

function QueueChart({ data, labels }: { data: number[], labels: string[], scenario?: string }) {
  const maxValue = Math.max(...data, 1)
  return (
    <div className="flex gap-3 items-end h-32 pt-6">
      {data.map((value, i) => {
        const isDrying = labels[i] === 'Drying'
        const heightPercent = (value / maxValue) * 100
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative w-full flex flex-col items-center group">
              <span className={cn("text-[10px] font-black mb-1", isDrying ? "text-amber-600" : "text-primary")}>{value.toFixed(0)}h</span>
              <div className={cn("w-full rounded-t-xl transition-all duration-700 ease-out shadow-sm", isDrying ? "bg-gradient-to-t from-amber-500 to-amber-300 border-t-2 border-amber-600" : "bg-gradient-to-t from-primary to-emerald-300 border-t-2 border-emerald-500")} style={{ height: `${heightPercent}%`, minHeight: '8px' }} />
            </div>
            <span className={cn("text-[8px] font-black uppercase tracking-tighter text-center h-4", isDrying ? "text-amber-700" : "text-muted-foreground")}>{labels[i]}</span>
          </div>
        )
      })}
    </div>
  )
}

function TraceRow({ id, stage, temp, status, color }: { id: string, stage: string, temp: string, status: string, color: 'green' | 'amber' | 'red' }) {
  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="p-3 font-bold border-r">{id}</td>
      <td className="p-3 text-center border-r">{stage}</td>
      <td className="p-3 text-center border-r">{temp}</td>
      <td className={cn(
        "p-3 text-center font-black",
        color === 'green' ? "bg-emerald-500/20 text-emerald-700" : 
        color === 'amber' ? "bg-amber-500/20 text-amber-700" : 
        "bg-destructive/20 text-destructive"
      )}>
        {status}
      </td>
    </tr>
  )
}

function AlertCard({ alert }: { alert: AlertItem }) {
  return (
    <Card className={cn("shadow-sm border-l-[4px] hover:translate-x-1 transition-transform", alert.type === 'ok' ? "border-l-primary bg-emerald-50/50 dark:bg-emerald-950/10" : alert.type === 'warn' ? "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/10" : "border-l-destructive bg-red-50/50 dark:bg-red-950/10")}>
      <CardContent className="p-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {alert.type === 'ok' ? <CheckCircle2 className="w-4 h-4 text-primary" /> : alert.type === 'warn' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <XCircle className="w-4 h-4 text-destructive" />}
          <span className="text-[11px] font-bold text-foreground">{alert.message}</span>
        </div>
        <span className="text-[9px] text-muted-foreground font-black bg-muted px-2 py-1 rounded uppercase">{alert.time}</span>
      </CardContent>
    </Card>
  )
}

function BatchCard({ batch, onView }: { batch: BatchSummary, onView: (id: string) => void }) {
  const isRejected = batch.status_class === 'red'
  return (
    <Card className={cn("shadow-sm border-l-[4px] hover:shadow-md transition-all", batch.status_class === 'green' ? "border-l-primary" : batch.status_class === 'amber' ? "border-l-amber-500" : "border-l-destructive")}>
      <CardContent className="p-3.5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">{batch.id}</span>
              <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{batch.berat}</span>
              {isRejected && <div className="flex items-center gap-1 text-[8px] font-black bg-destructive/10 text-destructive px-2 py-0.5 rounded-full border border-destructive/20 uppercase tracking-tighter"><ShieldCheck className="w-2.5 h-2.5" />LOCKED</div>}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1.5 uppercase tracking-tighter">{batch.tanggal} • <span className={cn(batch.status_class === 'green' ? "text-primary" : batch.status_class === 'amber' ? "text-amber-600" : "text-destructive")}>{batch.status}</span></p>
          </div>
          <button onClick={() => onView(batch.id)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </CardContent>
    </Card>
  )
}
