# Laporan Pengembangan Project: BricketChain
**Sistem Penelusuran (Traceability) Briket Tempurung Kelapa Berbasis IoT**

Dokumen ini berisi ringkasan teknis dan proses pengembangan aplikasi BricketChain untuk keperluan presentasi kepada dosen.

---

## 1. Ikhtisar Project (Project Overview)
BricketChain adalah platform digital yang dirancang untuk meningkatkan transparansi dan kepercayaan dalam rantai pasok briket tempurung kelapa. Masalah utama yang diselesaikan adalah sulitnya verifikasi kualitas dan asal-usul produk bagi pembeli luar negeri (ekspor). Aplikasi ini memungkinkan pelacakan data dari level petani hingga hasil uji lab (IoT).

## 2. Arsitektur Teknologi (Tech Stack)
Aplikasi ini menggunakan arsitektur **Decoupled (Terpisah)** antara Frontend dan Backend:

*   **Frontend**: 
    *   **Framework**: Next.js (React) - Untuk performa cepat dan SEO-friendly.
    *   **Styling**: Tailwind CSS - Memberikan tampilan premium dan responsif.
    *   **State Management**: React Hooks & SessionStorage.
    *   **Icons**: Lucide React.
*   **Backend**:
    *   **Language**: Python 3.
    *   **Framework**: FastAPI - Dipilih karena kinerjanya yang tinggi dan validasi data otomatis menggunakan Pydantic.
    *   **Security**: SHA-256 Hashing & JWT Token (Simulasi).

## 3. Fitur Utama (Core Features)
3.  **Inventory Management**: Modul khusus untuk memantau stok bahan baku dengan fitur **Re-Order Point (ROP)** otomatis yang memberikan peringatan jika stok di bawah 17,250 kg.
4.  **EOQ Calculator**: Kalkulator *Economic Order Quantity* terintegrasi untuk menentukan jumlah pemesanan optimal guna meminimalkan total biaya inventaris.
5.  **Simulation Module (Manager Only)**: Fitur simulasi permintaan (demand) untuk memprediksi potensi *bottleneck* pada lini produksi sebelum benar-benar terjadi.
6.  **Cost Optimization (Manager Only)**: Integrasi berbagai pendorong biaya (Transport, Sourcing, Inventory) untuk menghitung harga jual optimal dan efisiensi total biaya.
7.  **ESG Scorecard (Manager Only)**: Sistem penilaian keberlanjutan pemasok berdasarkan aspek Lingkungan (Environmental), Sosial (Social), dan Tata Kelola (Governance) untuk keputusan pengadaan yang etis.
8.  **Live IoT Monitoring**: Grafik garis dinamis (real-time 1s polling) untuk pemantauan suhu oven yang sangat responsif.
4.  **Fitur QR & Kamera**: Integrasi `html5-qrcode` untuk pemindaian Batch ID secara langsung menggunakan kamera smartphone/laptop.
5.  **Legalitas & Sertifikasi (Halaman Detail)**: Bagian khusus pada halaman detail batch yang menampilkan Sertifikat Halal, NIB, Sertifikat Ekspor, dan Hasil Lab.
6.  **Verifikasi Keaslian QR**: Integrasi kamera di dalam modul Ekspor untuk memverifikasi keaslian produk secara langsung.

## 4. Proses Pengembangan (Development Journey)

### Tahap 1: Perancangan Backend (FastAPI)
*   Membuat model data menggunakan **Pydantic** untuk memastikan setiap input (seperti berat briket atau suhu) memiliki tipe data yang benar.
*   Membangun endpoint REST API untuk proses Login, Register, dan pengambilan data Batch.
*   Implementasi keamanan dengan hashing password agar data pengguna terlindungi.

### Tahap 2: Desain UI/UX Frontend (Next.js)
*   Mengimplementasikan desain "Rich Aesthetics" dengan skema warna Emerald (mewakili produk ramah lingkungan).
*   Membangun halaman Login dan Dashboard yang intuitif.
*   Menambahkan notifikasi menggunakan **Sonner** untuk memberikan feedback interaktif kepada pengguna (misal: "Login Berhasil").

### Tahap 3: Integrasi & Debugging
*   Menghubungkan Frontend ke Backend menggunakan fitur **Rewrites** di Next.js untuk menghindari masalah CORS.
*   Menangani skenario kegagalan koneksi (Error Handling) dengan menambahkan logika **Fallback/Demo Mode** agar aplikasi tetap bisa didemonstrasikan meskipun server sedang offline.
*   Menambahkan fitur **Sign Up** yang sebelumnya belum tersedia untuk melengkapi siklus penggunaan aplikasi.
*   **Integrasi Kamera & QR**: Menginstalasi library `html5-qrcode` dan `qrcode.react` untuk mewujudkan fitur "Scan to Trace" yang diminta untuk standar industri modern.
*   **Modul Legalitas**: Menyusun layout dokumen legalitas (Halal, NIB, dll) untuk meningkatkan nilai jual produk briket di pasar global.

## 5. Kesimpulan teknis
Project ini menunjukkan integrasi yang kuat antara Python (Backend) yang handal dalam pengolahan data dan React (Frontend) yang unggul dalam sisi pengalaman pengguna. Sistem ini siap dikembangkan lebih lanjut dengan integrasi database nyata (PostgreSQL) dan perangkat keras IoT yang sesungguhnya.

---
*Dibuat untuk keperluan akademik - 2024*
