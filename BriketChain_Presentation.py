"""
BriketChain: Sistem Penelusuran (Traceability) Briket Tempurung Kelapa Berbasis IoT
================================================================================

Aplikasi ini adalah backend API yang dibangun menggunakan Python FastAPI. 
Sistem ini dirancang untuk mendemonstrasikan bagaimana teknologi Blockchain 
dan IoT dapat digunakan untuk melacak rantai pasok briket kelapa dari petani 
hingga ke tangan pembeli (ekspor).

Dosen: Anda dapat menjalankan file ini langsung menggunakan perintah:
    fastapi dev BriketChain_Presentation.py
"""

import fastapi
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import hashlib

# 1. Inisialisasi Aplikasi
app = fastapi.FastAPI(
    title="BriketChain API Presentation",
    description="Backend API untuk penelusuran rantai pasok briket kelapa",
    version="1.0.0"
)

# 2. Model Data (Skema untuk Validasi Input/Output)
class User(BaseModel):
    nama: str
    username: str
    role: str  # 'manager' atau 'employee'

class BatchProcess(BaseModel):
    nama: str
    durasi: str
    status: str

class BatchData(BaseModel):
    id: str
    produk: str
    tanggal: str
    berat: str
    status: str
    status_class: str  # 'green', 'amber', 'red'
    petani: str
    lokasi: str
    kadar_air: float
    rata_suhu_iot: float
    proses: List[BatchProcess]

# 3. Database Simulasi (In-Memory)
# Dalam produksi nyata, kita akan menggunakan PostgreSQL atau MongoDB
USERS_DB = {
    "admin@briket.co": {
        "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
        "nama": "Admin Briket",
        "role": "manager"
    }
}

BATCHES_DB = {
    "BRK-001": BatchData(
        id="BRK-001",
        produk="Briket Premium Export",
        tanggal="2024-05-07",
        berat="1200kg",
        status="Siap Ekspor",
        status_class="green",
        petani="KT Sumber Makmur",
        lokasi="Kampar, Riau",
        kadar_air=5.2,
        rata_suhu_iot=60.5,
        proses=[
            BatchProcess(nama="Grinding", durasi="2 jam", status="Selesai"),
            BatchProcess(nama="Oven Drying", durasi="4 jam", status="Selesai (IoT)")
        ]
    )
}

# 4. Fungsi Helper (Keamanan)
def verify_password(plain, hashed):
    return hashlib.sha256(plain.encode()).hexdigest() == hashed

# 5. Endpoint API (Logika Bisnis)

@app.get("/")
def home():
    """Endpoint selamat datang"""
    return {"message": "Selamat datang di BriketChain API Presentation"}

@app.post("/register")
def register(nama: str, username: str, password: str, role: str):
    """Fungsi Pendaftaran Akun Baru"""
    if username in USERS_DB:
        return {"success": False, "message": "User sudah ada"}
    
    USERS_DB[username] = {
        "password_hash": hashlib.sha256(password.encode()).hexdigest(),
        "nama": nama,
        "role": role
    }
    return {"success": True, "message": f"User {nama} berhasil didaftarkan"}

@app.post("/login")
def login(username: str, password: str):
    """Fungsi Autentikasi Pengguna"""
    user = USERS_DB.get(username)
    if not user or not verify_password(password, user["password_hash"]):
        return {"success": False, "message": "Email atau Password salah"}
    
    return {
        "success": True, 
        "nama": user["nama"], 
        "role": user["role"],
        "token": "presentation-token-123"
    }

@app.get("/batches")
def list_batches():
    """Mengambil semua data produksi briket"""
    return list(BATCHES_DB.values())

@app.get("/verify/{batch_id}")
def verify_batch(batch_id: str):
    """Fitur utama: Verifikasi Batch untuk pembeli/customer"""
    batch = BATCHES_DB.get(batch_id.upper())
    if not batch:
        raise fastapi.HTTPException(status_code=404, detail="Batch tidak ditemukan")
    return {"success": True, "data": batch}

# 6. Menjalankan Server
if __name__ == "__main__":
    import uvicorn
    print("Menjalankan server presentasi...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
