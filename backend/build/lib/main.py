import fastapi
import fastapi.middleware.cors
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from jose import jwt
import hashlib

app = fastapi.FastAPI(title="BriketChain API", version="1.0.0")

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security configuration
SECRET_KEY = "briketchain-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Simple password hashing using SHA256 for demo purposes
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

# ============ DATA MODELS ============

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    nama: Optional[str] = None
    role: Optional[str] = None
    token: Optional[str] = None

class BatchProcess(BaseModel):
    nama: str
    durasi: str
    status: str  # "done", "lulus", "gagal"

class BatchData(BaseModel):
    id: str
    produk: str
    tanggal: str
    berat: str
    status: str
    status_class: str  # "green", "amber", "red"
    petani: str
    lokasi: str
    panen: str
    bahan_baku: str
    kontrak: str
    suhu_iot: list[int]
    rata_suhu: float
    kadar_air: float
    proses: list[BatchProcess]
    importir: str
    tujuan: str
    kapal: str
    incoterm: str

class ScenarioData(BaseModel):
    reject: str
    reject_delta: str
    lead_time: str
    lead_delta: str
    queue: list[int]
    bottleneck: str
    yield_pct: int
    biaya: str

class BatchSummary(BaseModel):
    id: str
    tanggal: str
    berat: str
    status: str
    status_class: str

class RejectRequest(BaseModel):
    batch_id: str
    reason: str
    rejected_by: str

class AlertItem(BaseModel):
    id: str
    type: str  # "ok", "warn", "err"
    message: str
    time: str
    batch_id: Optional[str] = None

# ============ MOCK DATABASE ============

# Users database - passwords are hashed with SHA256
USERS_DB = {
    "manager@briket.co": {
        "password_hash": hash_password("briket2026"),
        "nama": "Budi Santoso",
        "role": "manager"
    },
    "employee@briket.co": {
        "password_hash": hash_password("briket2026"),
        "nama": "Dewi Lestari",
        "role": "employee"
    },
    "admin@briket.co": {
        "password_hash": hash_password("admin123"),
        "nama": "Admin System",
        "role": "admin"
    }
}

# Batch database with full traceability data
BATCHES_DB: dict[str, BatchData] = {
    "BRK-2604-031": BatchData(
        id="BRK-2604-031",
        produk="Briket Tempurung Kelapa Premium",
        tanggal="26 April 2024",
        berat="1,200 kg",
        status="QC Passed - Premium Export",
        status_class="green",
        petani="KT Sumber Makmur",
        lokasi="Kampar, Riau",
        panen="20 April 2024",
        bahan_baku="Tempurung Kelapa Grade A",
        kontrak="KTRACT-2024-0412",
        suhu_iot=[60, 61, 59, 60, 62, 60, 61, 59, 60, 61],
        rata_suhu=60.3,
        kadar_air=5.2,
        proses=[
            BatchProcess(nama="Grinding & Sizing", durasi="2j 15m", status="done"),
            BatchProcess(nama="Mixing & Binding", durasi="1j 30m", status="done"),
            BatchProcess(nama="Molding & Pressing", durasi="3j 00m", status="done"),
            BatchProcess(nama="Oven Drying (IoT)", durasi="3j 42m", status="done"),
            BatchProcess(nama="Quality Control", durasi="45m", status="lulus"),
            BatchProcess(nama="Packaging", durasi="1j 15m", status="done"),
        ],
        importir="Green Energy GmbH",
        tujuan="Hamburg, Jerman",
        kapal="MV Evergreen Fortune",
        incoterm="FOB Dumai"
    ),
    "BRK-2604-028": BatchData(
        id="BRK-2604-028",
        produk="Briket Tempurung Kelapa Standard",
        tanggal="24 April 2024",
        berat="980 kg",
        status="QC Hold - Kadar Air Tinggi",
        status_class="amber",
        petani="KT Sejahtera Bersama",
        lokasi="Bengkalis, Riau",
        panen="18 April 2024",
        bahan_baku="Tempurung Kelapa Grade B",
        kontrak="KTRACT-2024-0398",
        suhu_iot=[58, 62, 65, 59, 67, 63, 61, 64, 60, 62],
        rata_suhu=62.1,
        kadar_air=9.1,
        proses=[
            BatchProcess(nama="Grinding & Sizing", durasi="2j 30m", status="done"),
            BatchProcess(nama="Mixing & Binding", durasi="1j 45m", status="done"),
            BatchProcess(nama="Molding & Pressing", durasi="3j 15m", status="done"),
            BatchProcess(nama="Oven Drying (IoT)", durasi="4j 10m", status="done"),
            BatchProcess(nama="Quality Control", durasi="1j 00m", status="gagal"),
            BatchProcess(nama="Re-Drying Required", durasi="-", status="done"),
        ],
        importir="Pending Assignment",
        tujuan="Pending",
        kapal="-",
        incoterm="-"
    ),
    "BRK-2604-019": BatchData(
        id="BRK-2604-019",
        produk="Briket Tempurung Kelapa Premium",
        tanggal="19 April 2024",
        berat="1,450 kg",
        status="QC Passed - Shipped",
        status_class="green",
        petani="KT Mandiri Jaya",
        lokasi="Rokan Hilir, Riau",
        panen="14 April 2024",
        bahan_baku="Tempurung Kelapa Grade A+",
        kontrak="KTRACT-2024-0385",
        suhu_iot=[60, 60, 61, 59, 60, 60, 61, 60, 59, 60],
        rata_suhu=60.0,
        kadar_air=4.8,
        proses=[
            BatchProcess(nama="Grinding & Sizing", durasi="2j 10m", status="done"),
            BatchProcess(nama="Mixing & Binding", durasi="1j 25m", status="done"),
            BatchProcess(nama="Molding & Pressing", durasi="2j 55m", status="done"),
            BatchProcess(nama="Oven Drying (IoT)", durasi="3j 35m", status="done"),
            BatchProcess(nama="Quality Control", durasi="40m", status="lulus"),
            BatchProcess(nama="Packaging", durasi="1j 10m", status="done"),
        ],
        importir="EcoFuel Solutions Ltd",
        tujuan="Tokyo, Jepang",
        kapal="MV Pacific Star",
        incoterm="CIF Tokyo"
    ),
    "BRK-2604-015": BatchData(
        id="BRK-2604-015",
        produk="Briket Tempurung Kelapa Standard",
        tanggal="15 April 2024",
        berat="850 kg",
        status="Rejected - Contamination",
        status_class="red",
        petani="KT Harapan Baru",
        lokasi="Pelalawan, Riau",
        panen="10 April 2024",
        bahan_baku="Tempurung Kelapa Mixed",
        kontrak="KTRACT-2024-0372",
        suhu_iot=[55, 58, 70, 68, 72, 65, 60, 58, 55, 52],
        rata_suhu=61.3,
        kadar_air=12.5,
        proses=[
            BatchProcess(nama="Grinding & Sizing", durasi="2j 45m", status="done"),
            BatchProcess(nama="Mixing & Binding", durasi="2j 00m", status="done"),
            BatchProcess(nama="Molding & Pressing", durasi="3j 30m", status="done"),
            BatchProcess(nama="Oven Drying (IoT)", durasi="5j 20m", status="done"),
            BatchProcess(nama="Quality Control", durasi="1j 30m", status="gagal"),
            BatchProcess(nama="Disposal/Recycling", durasi="-", status="done"),
        ],
        importir="Rejected",
        tujuan="N/A",
        kapal="-",
        incoterm="-"
    ),
    "BRK-2604-025": BatchData(
        id="BRK-2604-025",
        produk="Briket Tempurung Kelapa Premium",
        tanggal="25 April 2024",
        berat="1,100 kg",
        status="In Production - Drying",
        status_class="amber",
        petani="KT Sumber Makmur",
        lokasi="Kampar, Riau",
        panen="22 April 2024",
        bahan_baku="Tempurung Kelapa Grade A",
        kontrak="KTRACT-2024-0420",
        suhu_iot=[60, 61, 60, 59, 60, 0, 0, 0, 0, 0],
        rata_suhu=60.0,
        kadar_air=8.5,
        proses=[
            BatchProcess(nama="Grinding & Sizing", durasi="2j 20m", status="done"),
            BatchProcess(nama="Mixing & Binding", durasi="1j 35m", status="done"),
            BatchProcess(nama="Molding & Pressing", durasi="3j 05m", status="done"),
            BatchProcess(nama="Oven Drying (IoT)", durasi="In Progress", status="done"),
            BatchProcess(nama="Quality Control", durasi="Pending", status="done"),
            BatchProcess(nama="Packaging", durasi="Pending", status="done"),
        ],
        importir="Reserved: BioBurn UK",
        tujuan="London, UK",
        kapal="TBD",
        incoterm="FOB Dumai"
    )
}

# Alerts database
ALERTS_DB: list[AlertItem] = [
    AlertItem(id="ALT-001", type="ok", message="Suhu Oven #1 stabil di 60°C", time="10:02", batch_id="BRK-2604-025"),
    AlertItem(id="ALT-002", type="warn", message="WIP Drying menumpuk — 28 jam", time="09:45", batch_id=None),
    AlertItem(id="ALT-003", type="ok", message="QC Batch BRK-2604-031 lulus", time="09:30", batch_id="BRK-2604-031"),
    AlertItem(id="ALT-004", type="err", message="Kadar air BRK-2604-028 tinggi: 9.1%", time="08:55", batch_id="BRK-2604-028"),
    AlertItem(id="ALT-005", type="ok", message="Batch BRK-2604-019 shipped to Japan", time="08:30", batch_id="BRK-2604-019"),
    AlertItem(id="ALT-006", type="warn", message="Supplier delivery delay - KT Harapan Baru", time="08:15", batch_id=None),
]

# Scenario data (Current State vs Future State with IoT)
SCENARIOS = {
    "current": ScenarioData(
        reject="9.9%",
        reject_delta="Baseline manual process",
        lead_time="10.5 Hari",
        lead_delta="Standard operation",
        queue=[12, 15, 18, 28, 10],  # Grinding, Mixing, Molding, Drying, Packing
        bottleneck="Bottleneck di Drying - perlu optimasi",
        yield_pct=90,
        biaya="Rp 820/kg - baseline"
    ),
    "future": ScenarioData(
        reject="4%",
        reject_delta="Turun 2% vs sebelumnya",
        lead_time="9 Hari",
        lead_delta="Hemat 1.5 hari",
        queue=[10, 12, 14, 18, 7],
        bottleneck="Bottleneck berkurang dengan IoT",
        yield_pct=96,
        biaya="Rp 772/kg - efisien"
    )
}

# KPI data
KPI_DATA = {
    "total_batches": 156,
    "total_production_kg": 187200,
    "avg_reject_rate": 4.2,
    "avg_lead_time_days": 9.1,
    "monthly_output_tons": 4.8,
    "cost_per_kg": 772,
    "suppliers_active": 12,
    "export_destinations": 8
}

# ============ HELPER FUNCTIONS ============

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ============ API ENDPOINTS ============

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "BriketChain API"}

# Authentication
@app.post("/login")
async def login(request: LoginRequest) -> LoginResponse:
    user = USERS_DB.get(request.username)
    if not user:
        return LoginResponse(success=False, message="Username tidak ditemukan")
    
    if not verify_password(request.password, user["password_hash"]):
        return LoginResponse(success=False, message="Password salah")
    
    access_token = create_access_token(
        data={"sub": request.username, "role": user["role"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return LoginResponse(
        success=True,
        message="Login berhasil",
        nama=user["nama"],
        role=user["role"],
        token=access_token
    )

# Batch verification (Public - for customers)
@app.get("/verify/{batch_id}")
async def verify_batch(batch_id: str) -> dict:
    batch_id_upper = batch_id.upper()
    batch = BATCHES_DB.get(batch_id_upper)
    if not batch:
        raise fastapi.HTTPException(status_code=404, detail="Batch tidak ditemukan")
    return {"success": True, "data": batch.model_dump()}

# Get all batches (Manager/Employee)
@app.get("/batches")
async def get_batches() -> list[BatchSummary]:
    return [
        BatchSummary(
            id=b.id,
            tanggal=b.tanggal,
            berat=b.berat,
            status=b.status,
            status_class=b.status_class
        )
        for b in BATCHES_DB.values()
    ]

# Get batch detail (Manager/Employee)
@app.get("/batches/{batch_id}")
async def get_batch_detail(batch_id: str) -> dict:
    batch_id_upper = batch_id.upper()
    batch = BATCHES_DB.get(batch_id_upper)
    if not batch:
        raise fastapi.HTTPException(status_code=404, detail="Batch tidak ditemukan")
    return {"success": True, "data": batch.model_dump()}

# Update batch status (Manager only)
@app.put("/batches/{batch_id}/status")
async def update_batch_status(batch_id: str, status: str, status_class: str) -> dict:
    batch_id_upper = batch_id.upper()
    if batch_id_upper not in BATCHES_DB:
        raise fastapi.HTTPException(status_code=404, detail="Batch tidak ditemukan")
    
    BATCHES_DB[batch_id_upper].status = status
    BATCHES_DB[batch_id_upper].status_class = status_class
    
    return {"success": True, "message": f"Status batch {batch_id_upper} diperbarui"}

# Reject batch (Manager/Employee)
@app.post("/batches/{batch_id}/reject")
async def reject_batch(batch_id: str, request: RejectRequest) -> dict:
    batch_id_upper = batch_id.upper()
    if batch_id_upper not in BATCHES_DB:
        raise fastapi.HTTPException(status_code=404, detail="Batch tidak ditemukan")
    
    batch = BATCHES_DB[batch_id_upper]
    batch.status = f"Rejected - {request.reason}"
    batch.status_class = "red"
    
    # Add alert
    new_alert = AlertItem(
        id=f"ALT-{len(ALERTS_DB)+1:03d}",
        type="err",
        message=f"Batch {batch_id_upper} ditolak: {request.reason}",
        time=datetime.now().strftime("%H:%M"),
        batch_id=batch_id_upper
    )
    ALERTS_DB.insert(0, new_alert)
    
    return {"success": True, "message": f"Batch {batch_id_upper} telah ditolak"}

# Approve batch (Manager only)
@app.post("/batches/{batch_id}/approve")
async def approve_batch(batch_id: str) -> dict:
    batch_id_upper = batch_id.upper()
    if batch_id_upper not in BATCHES_DB:
        raise fastapi.HTTPException(status_code=404, detail="Batch tidak ditemukan")
    
    batch = BATCHES_DB[batch_id_upper]
    batch.status = "QC Passed - Premium Export"
    batch.status_class = "green"
    
    # Add alert
    new_alert = AlertItem(
        id=f"ALT-{len(ALERTS_DB)+1:03d}",
        type="ok",
        message=f"Batch {batch_id_upper} disetujui untuk ekspor",
        time=datetime.now().strftime("%H:%M"),
        batch_id=batch_id_upper
    )
    ALERTS_DB.insert(0, new_alert)
    
    return {"success": True, "message": f"Batch {batch_id_upper} telah disetujui"}

# Get scenario data (Digital Twin)
@app.get("/scenario/{scenario_type}")
async def get_scenario(scenario_type: str) -> ScenarioData:
    if scenario_type not in SCENARIOS:
        raise fastapi.HTTPException(status_code=404, detail="Skenario tidak ditemukan")
    return SCENARIOS[scenario_type]

# Get alerts
@app.get("/alerts")
async def get_alerts() -> list[AlertItem]:
    return ALERTS_DB[:10]  # Return latest 10 alerts

# Get KPIs
@app.get("/kpis")
async def get_kpis() -> dict:
    return KPI_DATA

# Get IoT temperature data (simulated live data)
@app.get("/iot/temperature")
async def get_iot_temperature(scenario: str = "future") -> dict:
    import random
    
    if scenario == "future":
        # Stable temperature with IoT control
        temps = [59 + random.random() * 2 for _ in range(10)]
        status = "safe"
        message = "Safe Zone - IoT Controlled"
    else:
        # Variable temperature without IoT
        temps = [57 + random.random() * 8 for _ in range(10)]
        status = "warn" if max(temps) > 63 else "safe"
        message = "Over Temp Warning" if status == "warn" else "Manual Monitoring"
    
    return {
        "temperatures": temps,
        "current": round(temps[-1], 1),
        "average": round(sum(temps) / len(temps), 1),
        "status": status,
        "message": message,
        "timestamp": datetime.now().isoformat()
    }

# Get supplier network data
@app.get("/suppliers")
async def get_suppliers() -> list[dict]:
    return [
        {
            "id": "SUP-001",
            "name": "KT Sumber Makmur",
            "location": "Kampar, Riau",
            "distance_km": 42,
            "price_per_kg": 180,
            "grade": "A",
            "reliability_score": 95,
            "total_shipments": 45,
            "active": True
        },
        {
            "id": "SUP-002",
            "name": "KT Sejahtera Bersama",
            "location": "Bengkalis, Riau",
            "distance_km": 78,
            "price_per_kg": 175,
            "grade": "B",
            "reliability_score": 88,
            "total_shipments": 32,
            "active": True
        },
        {
            "id": "SUP-003",
            "name": "KT Mandiri Jaya",
            "location": "Rokan Hilir, Riau",
            "distance_km": 55,
            "price_per_kg": 185,
            "grade": "A+",
            "reliability_score": 98,
            "total_shipments": 52,
            "active": True
        },
        {
            "id": "SUP-004",
            "name": "KT Harapan Baru",
            "location": "Pelalawan, Riau",
            "distance_km": 35,
            "price_per_kg": 170,
            "grade": "B",
            "reliability_score": 75,
            "total_shipments": 28,
            "active": False
        }
    ]

# Comparison data (Current State vs Future State)
@app.get("/comparison")
async def get_comparison() -> list[dict]:
    return [
        {"metric": "Reject Rate", "current": "9.9%", "future": "4.0%", "change": "down"},
        {"metric": "Cycle Time Drying", "current": "4j 15m", "future": "3j 42m", "change": "down"},
        {"metric": "Lead Time", "current": "10.5 Hari", "future": "9.0 Hari", "change": "down"},
        {"metric": "Biaya Produksi", "current": "Rp 820/kg", "future": "Rp 772/kg", "change": "down"},
        {"metric": "Yield", "current": "90%", "future": "96%", "change": "up"},
    ]

# Production statistics
@app.get("/stats/production")
async def get_production_stats() -> dict:
    total = len(BATCHES_DB)
    passed = sum(1 for b in BATCHES_DB.values() if b.status_class == "green")
    hold = sum(1 for b in BATCHES_DB.values() if b.status_class == "amber")
    rejected = sum(1 for b in BATCHES_DB.values() if b.status_class == "red")
    
    return {
        "total_batches": total,
        "passed": passed,
        "hold": hold,
        "rejected": rejected,
        "pass_rate": round(passed / total * 100, 1) if total > 0 else 0,
        "reject_rate": round(rejected / total * 100, 1) if total > 0 else 0
    }
