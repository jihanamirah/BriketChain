// API client for BriketChain backend

const API_BASE = '/api'

// Types
export interface BatchProcess {
  nama: string
  durasi: string
  status: string
}

export interface BatchData {
  id: string
  produk: string
  tanggal: string
  berat: string
  status: string
  status_class: 'green' | 'amber' | 'red'
  petani: string
  lokasi: string
  panen: string
  bahan_baku: string
  kontrak: string
  suhu_iot: number[]
  rata_suhu: number
  kadar_air: number
  proses: BatchProcess[]
  importir: string
  tujuan: string
  kapal: string
  incoterm: string
}

export interface BatchSummary {
  id: string
  tanggal: string
  berat: string
  status: string
  status_class: 'green' | 'amber' | 'red'
}

export interface LoginResponse {
  success: boolean
  message: string
  nama?: string
  role?: string
  token?: string
}

export interface RegisterResponse {
  success: boolean
  message: string
}

export interface ScenarioData {
  reject: string
  reject_delta: string
  lead_time: string
  lead_delta: string
  queue: number[]
  bottleneck: string
  yield_pct: number
  biaya: string
}

export interface AlertItem {
  id: string
  type: 'ok' | 'warn' | 'err'
  message: string
  time: string
  batch_id?: string
}

export interface Supplier {
  id: string
  name: string
  location: string
  distance_km: number
  price_per_kg: number
  grade: string
  reliability_score: number
  total_shipments: number
  active: boolean
}

export interface IoTData {
  temperatures: number[]
  current: number
  average: number
  status: 'safe' | 'warn'
  message: string
  timestamp: string
}

export interface ProductionStats {
  total_batches: number
  passed: number
  hold: number
  rejected: number
  pass_rate: number
  reject_rate: number
}

export interface ComparisonItem {
  metric: string
  current: string
  future: string
  change: string
}

// ========== MOCK DATA (Fallback when backend is unavailable) ==========

const MOCK_BATCHES: Record<string, BatchData> = {
  "BRK-2604-031": {
    id: "BRK-2604-031",
    produk: "Premium Coconut Shell Charcoal Briquette",
    tanggal: "April 26, 2024",
    berat: "1,200 kg",
    status: "QC Passed - Premium Export Quality",
    status_class: "green",
    petani: "Sumber Makmur Farm Group",
    lokasi: "Kampar, Riau",
    panen: "April 20, 2024",
    bahan_baku: "Coconut Shell Grade A",
    kontrak: "KTRACT-2024-0412",
    suhu_iot: [60, 61, 59, 60, 62, 60, 61, 59, 60, 61],
    rata_suhu: 60.3,
    kadar_air: 5.2,
    proses: [
      { nama: "Grinding & Sizing", durasi: "2h 15m", status: "done" },
      { nama: "Mixing & Binding", durasi: "1h 30m", status: "done" },
      { nama: "Molding & Pressing", durasi: "3h 00m", status: "done" },
      { nama: "Oven Drying (IoT)", durasi: "3h 42m", status: "done" },
      { nama: "Quality Control", durasi: "45m", status: "lulus" },
      { nama: "Packaging", durasi: "1h 15m", status: "done" },
    ],
    importir: "Green Energy GmbH",
    tujuan: "Hamburg, Germany",
    kapal: "MV Evergreen Fortune",
    incoterm: "FOB Dumai"
  },
  "BRK-2604-028": {
    id: "BRK-2604-028",
    produk: "Standard Coconut Shell Charcoal Briquette",
    tanggal: "April 24, 2024",
    berat: "980 kg",
    status: "QC Hold - High Moisture Content",
    status_class: "amber",
    petani: "Sejahtera Bersama Farm Group",
    lokasi: "Bengkalis, Riau",
    panen: "April 18, 2024",
    bahan_baku: "Coconut Shell Grade B",
    kontrak: "KTRACT-2024-0398",
    suhu_iot: [58, 62, 65, 59, 67, 63, 61, 64, 60, 62],
    rata_suhu: 62.1,
    kadar_air: 9.1,
    proses: [
      { nama: "Grinding & Sizing", durasi: "2h 30m", status: "done" },
      { nama: "Mixing & Binding", durasi: "1h 45m", status: "done" },
      { nama: "Molding & Pressing", durasi: "3h 15m", status: "done" },
      { nama: "Oven Drying (IoT)", durasi: "4h 10m", status: "done" },
      { nama: "Quality Control", durasi: "1h 00m", status: "gagal" },
      { nama: "Re-Drying Required", durasi: "-", status: "done" },
    ],
    importir: "Pending Assignment",
    tujuan: "Pending",
    kapal: "-",
    incoterm: "-"
  },
  "BRK-2604-019": {
    id: "BRK-2604-019",
    produk: "Premium Coconut Shell Charcoal Briquette",
    tanggal: "April 19, 2024",
    berat: "1,450 kg",
    status: "QC Passed - Shipped",
    status_class: "green",
    petani: "Mandiri Jaya Farm Group",
    lokasi: "Rokan Hilir, Riau",
    panen: "April 14, 2024",
    bahan_baku: "Coconut Shell Grade A+",
    kontrak: "KTRACT-2024-0385",
    suhu_iot: [60, 60, 61, 59, 60, 60, 61, 60, 59, 60],
    rata_suhu: 60.0,
    kadar_air: 4.8,
    proses: [
      { nama: "Grinding & Sizing", durasi: "2h 10m", status: "done" },
      { nama: "Mixing & Binding", durasi: "1h 25m", status: "done" },
      { nama: "Molding & Pressing", durasi: "2j 55m", status: "done" },
      { nama: "Oven Drying (IoT)", durasi: "3h 35m", status: "done" },
      { nama: "Quality Control", durasi: "40m", status: "lulus" },
      { nama: "Packaging", durasi: "1h 10m", status: "done" },
    ],
    importir: "EcoFuel Solutions Ltd",
    tujuan: "Tokyo, Japan",
    kapal: "MV Pacific Star",
    incoterm: "CIF Tokyo"
  },
  "BRK-2604-015": {
    id: "BRK-2604-015",
    produk: "Standard Coconut Shell Charcoal Briquette",
    tanggal: "April 15, 2024",
    berat: "850 kg",
    status: "Rejected - Contamination",
    status_class: "red",
    petani: "Harapan Baru Farm Group",
    lokasi: "Pelalawan, Riau",
    panen: "April 10, 2024",
    bahan_baku: "Coconut Shell Mixed",
    kontrak: "KTRACT-2024-0372",
    suhu_iot: [55, 58, 70, 68, 72, 65, 60, 58, 55, 52],
    rata_suhu: 61.3,
    kadar_air: 12.5,
    proses: [
      { nama: "Grinding & Sizing", durasi: "2h 45m", status: "done" },
      { nama: "Mixing & Binding", durasi: "2h 00m", status: "done" },
      { nama: "Molding & Pressing", durasi: "3h 30m", status: "done" },
      { nama: "Oven Drying (IoT)", durasi: "5h 20m", status: "done" },
      { nama: "Quality Control", durasi: "1h 30m", status: "gagal" },
      { nama: "Disposal/Recycling", durasi: "-", status: "done" },
    ],
    importir: "Rejected",
    tujuan: "N/A",
    kapal: "-",
    incoterm: "-"
  },
  "BRK-2604-025": {
    id: "BRK-2604-025",
    produk: "Premium Coconut Shell Charcoal Briquette",
    tanggal: "April 25, 2024",
    berat: "1,100 kg",
    status: "In Production - Drying",
    status_class: "amber",
    petani: "Sumber Makmur Farm Group",
    lokasi: "Kampar, Riau",
    panen: "April 22, 2024",
    bahan_baku: "Coconut Shell Grade A",
    kontrak: "KTRACT-2024-0420",
    suhu_iot: [60, 61, 60, 59, 60, 0, 0, 0, 0, 0],
    rata_suhu: 60.0,
    kadar_air: 8.5,
    proses: [
      { nama: "Grinding & Sizing", durasi: "2h 20m", status: "done" },
      { nama: "Mixing & Binding", durasi: "1h 35m", status: "done" },
      { nama: "Molding & Pressing", durasi: "3h 05m", status: "done" },
      { nama: "Oven Drying (IoT)", durasi: "In Progress", status: "done" },
      { nama: "Quality Control", durasi: "Pending", status: "done" },
      { nama: "Packaging", durasi: "Pending", status: "done" },
    ],
    importir: "Reserved: BioBurn UK",
    tujuan: "London, UK",
    kapal: "TBD",
    incoterm: "FOB Dumai"
  }
}

const MOCK_SCENARIOS: Record<string, ScenarioData> = {
  "current": {
    reject: "9.9%",
    reject_delta: "Baseline manual process",
    lead_time: "10.5 Days",
    lead_delta: "Standard operation",
    queue: [12, 45, 18, 22, 10], // Grinding, Drying, Carbonizing, Pressing, Packing
    bottleneck: "Main bottleneck at Drying (45h queue)",
    yield_pct: 80,
    biaya: "Rp 820/kg - baseline"
  },
  "future": {
    reject: "4%",
    reject_delta: "Reduced 5.9% vs CS",
    lead_time: "9 Days",
    lead_delta: "Saved 1.5 days",
    queue: [10, 15, 12, 14, 7],
    bottleneck: "Smoother production flow with IoT",
    yield_pct: 89.9,
    biaya: "Rp 772/kg - efficient"
  }
}

const MOCK_ALERTS: AlertItem[] = [
  { id: "ALT-001", type: "ok", message: "Oven #1 temperature stable at 60°C", time: "10:02", batch_id: "BRK-2604-025" },
  { id: "ALT-002", type: "warn", message: "WIP Drying backlog — 28 hours", time: "09:45" },
  { id: "ALT-003", type: "ok", message: "QC Batch BRK-2604-031 passed", time: "09:30", batch_id: "BRK-2604-031" },
  { id: "ALT-004", type: "err", message: "Moisture content BRK-2604-028 high: 9.1%", time: "08:55", batch_id: "BRK-2604-028" },
  { id: "ALT-005", type: "ok", message: "Batch BRK-2604-019 shipped to Japan", time: "08:30", batch_id: "BRK-2604-019" },
  { id: "ALT-006", type: "warn", message: "Supplier delivery delay - Harapan Baru Farm Group", time: "08:15" },
]

const MOCK_SUPPLIERS: Supplier[] = [
  { id: "SUP-001", name: "Sumber Makmur Farm Group", location: "Kampar, Riau", distance_km: 42, price_per_kg: 180, grade: "A", reliability_score: 95, total_shipments: 45, active: true },
  { id: "SUP-002", name: "Sejahtera Bersama Farm Group", location: "Bengkalis, Riau", distance_km: 78, price_per_kg: 175, grade: "B", reliability_score: 88, total_shipments: 32, active: true },
  { id: "SUP-003", name: "Mandiri Jaya Farm Group", location: "Rokan Hilir, Riau", distance_km: 55, price_per_kg: 185, grade: "A+", reliability_score: 98, total_shipments: 52, active: true },
  { id: "SUP-004", name: "Harapan Baru Farm Group", location: "Pelalawan, Riau", distance_km: 35, price_per_kg: 170, grade: "B", reliability_score: 75, total_shipments: 28, active: false },
]

const MOCK_COMPARISON: ComparisonItem[] = [
  { metric: "Reject Rate", current: "9.9%", future: "4.0%", change: "down" },
  { metric: "Cycle Time Drying", current: "4h 15m", future: "3h 42m", change: "down" },
  { metric: "Lead Time", current: "10.5 Days", future: "9.0 Days", change: "down" },
  { metric: "Production Cost", current: "Rp 820/kg", future: "Rp 772/kg", change: "down" },
  { metric: "Yield", current: "90%", future: "96%", change: "up" },
]

// Helper to try API first, then fallback to mock
async function fetchWithFallback<T>(apiCall: () => Promise<T>, mockData: T): Promise<T> {
  try {
    return await apiCall()
  } catch {
    console.log('[v0] API unavailable, using mock data')
    return mockData
  }
}

// ========== API Functions ==========

export async function verifyBatch(batchId: string): Promise<BatchData> {
  const upperBatchId = batchId.toUpperCase()
  try {
    const res = await fetch(`${API_BASE}/verify/${upperBatchId}`)
    if (!res.ok) throw new Error('Batch not found')
    const json = await res.json()
    return json.data
  } catch {
    const batch = MOCK_BATCHES[upperBatchId]
    if (!batch) throw new Error('Batch not found')
    return batch
  }
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    return await res.json()
  } catch {
    // Mock login for demo
    if ((username === 'manager@briket.co' || username === 'employee@briket.co') && password === 'briket2026') {
      return {
        success: true,
        message: 'Login successful (Demo Mode)',
        nama: username === 'manager@briket.co' ? 'Budi Santoso' : 'Dewi Lestari',
        role: username === 'manager@briket.co' ? 'manager' : 'employee',
        token: 'mock-token-' + Date.now()
      }
    }
    return { success: false, message: 'Invalid username or password' }
  }
}

export async function register(nama: string, username: string, password: string, role: string): Promise<RegisterResponse> {
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, username, password, role })
    })
    return await res.json()
  } catch {
    // Mock register for demo
    return { 
      success: true, 
      message: 'Registration successful (Demo Mode)' 
    }
  }
}

export async function getBatches(): Promise<BatchSummary[]> {
  return fetchWithFallback(
    async () => {
      const res = await fetch(`${API_BASE}/batches`)
      if (!res.ok) throw new Error()
      return res.json()
    },
    Object.values(MOCK_BATCHES).map(b => ({
      id: b.id,
      tanggal: b.tanggal,
      berat: b.berat,
      status: b.status,
      status_class: b.status_class
    }))
  )
}

export async function getBatchDetail(batchId: string): Promise<BatchData> {
  const upperBatchId = batchId.toUpperCase()
  try {
    const res = await fetch(`${API_BASE}/batches/${upperBatchId}`)
    if (!res.ok) throw new Error('Batch not found')
    const json = await res.json()
    return json.data
  } catch {
    const batch = MOCK_BATCHES[upperBatchId]
    if (!batch) throw new Error('Batch not found')
    return batch
  }
}

export async function rejectBatch(batchId: string, reason: string, rejectedBy: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/batches/${batchId.toUpperCase()}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch_id: batchId, reason, rejected_by: rejectedBy })
    })
    return await res.json()
  } catch {
    return { success: true, message: `Batch ${batchId} rejected (Demo Mode)` }
  }
}

export async function approveBatch(batchId: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/batches/${batchId.toUpperCase()}/approve`, { method: 'POST' })
    return await res.json()
  } catch {
    return { success: true, message: `Batch ${batchId} approved (Demo Mode)` }
  }
}

export async function getScenario(scenarioType: 'current' | 'future'): Promise<ScenarioData> {
  return fetchWithFallback(
    async () => {
      const res = await fetch(`${API_BASE}/scenario/${scenarioType}`)
      if (!res.ok) throw new Error()
      return res.json()
    },
    MOCK_SCENARIOS[scenarioType]
  )
}

export async function getAlerts(): Promise<AlertItem[]> {
  return fetchWithFallback(
    async () => {
      const res = await fetch(`${API_BASE}/alerts`)
      if (!res.ok) throw new Error()
      return res.json()
    },
    MOCK_ALERTS
  )
}

export async function getKPIs(): Promise<Record<string, number>> {
  return fetchWithFallback(
    async () => {
      const res = await fetch(`${API_BASE}/kpis`)
      if (!res.ok) throw new Error()
      return res.json()
    },
    {
      total_batches: 156,
      total_production_kg: 187200,
      avg_reject_rate: 9.9,
      avg_lead_time_days: 9.1,
      monthly_output_tons: 4.8,
      cost_per_kg: 772,
      yield_pct: 89.9,
      reorder_point: 17250
    }
  )
}

export async function getIoTTemperature(scenario: 'current' | 'future' = 'future'): Promise<IoTData> {
  return fetchWithFallback(
    async () => {
      const res = await fetch(`${API_BASE}/iot/temperature?scenario=${scenario}`)
      if (!res.ok) throw new Error()
      return res.json()
    },
    {
      temperatures: scenario === 'future' 
        ? [59.2, 60.1, 59.8, 60.3, 59.9, 60.0, 59.7, 60.2, 59.5, 60.1]
        : [57.5, 62.3, 65.1, 59.2, 67.8, 63.4, 61.2, 64.5, 60.3, 62.8],
      current: scenario === 'future' ? 60.1 : 62.8,
      average: scenario === 'future' ? 59.9 : 62.4,
      status: scenario === 'future' ? 'safe' : 'warn',
      message: scenario === 'future' ? 'Safe Zone - IoT Controlled' : 'Over Temp Warning',
      timestamp: new Date().toISOString()
    }
  )
}

export async function getSuppliers(): Promise<Supplier[]> {
  return fetchWithFallback(
    async () => {
      const res = await fetch(`${API_BASE}/suppliers`)
      if (!res.ok) throw new Error()
      return res.json()
    },
    MOCK_SUPPLIERS
  )
}

export async function getComparison(): Promise<ComparisonItem[]> {
  return fetchWithFallback(
    async () => {
      const res = await fetch(`${API_BASE}/comparison`)
      if (!res.ok) throw new Error()
      return res.json()
    },
    MOCK_COMPARISON
  )
}

export async function getProductionStats(): Promise<ProductionStats> {
  return fetchWithFallback(
    async () => {
      const res = await fetch(`${API_BASE}/stats/production`)
      if (!res.ok) throw new Error()
      return res.json()
    },
    {
      total_batches: 5,
      passed: 2,
      hold: 2,
      rejected: 1,
      pass_rate: 40.0,
      reject_rate: 20.0
    }
  )
}
