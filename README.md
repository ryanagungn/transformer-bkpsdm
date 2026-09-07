# Survei Peminatan & Potensi Usaha ASN Pra-Pensiun (BKPSDM)

Aplikasi web kuesioner interaktif modern untuk Badan Kepegawaian dan Pengembangan Sumber Daya Manusia (BKPSDM). Dirancang khusus dengan tampilan ramah ASN pra-pensiun, navigasi *smart branching* per bidang usaha, perhitungan skor kesiapan usaha *real-time*, serta penyimpanan otomatis ke **Google Sheets di Google Drive**.

---

## Fitur Utama

1. **Senior-Friendly UI**: Font terbaca jelas (*Plus Jakarta Sans*), tombol besar, navigasi bertahap (*multi-step wizard*).
2. **Percabangan Cerdas (*Smart Branching*)**: Ketika ASN memilih prioritas usaha (misal: *Pertanian*, *Ekspedisi*, *Grosir*, dll.), pertanyaan otomatis bercabang ke subsektor komoditas spesifik sesuai instrumen BKPSDM.
3. **Engine Skoring Real-Time**:
   - Menghitung 7 dimensi kesiapan (Minat 25%, Kompetensi 15%, Aset 15%, Modal 15%, Waktu 10%, Belajar 10%, Pendampingan 10%).
   - Langsung menampilkan klasifikasi (*Sangat Siap*, *Siap*, *Potensial*, *Belum Siap*) serta rekomendasi tindak lanjut bagi ASN.
   - Tombol Cetak / Simpan PDF kartu hasil asesmen.
4. **Database Google Sheets**:
   - Responden submit $\rightarrow$ data otomatis tersimpan rapi sebagai baris baru di Google Spreadsheet di Google Drive admin BKPSDM.

---

## Panduan Cepat Menjalankan di Komputer Lokal

```bash
# Masuk ke folder proyek
cd "C:\Users\IT DEV - FATH\.gemini\antigravity\scratch\survei-prapensiun-bkpsdm"

# Jalankan server pengembangan lokal
npm run dev
```
Buka browser di alamat yang tampil (biasanya `http://localhost:5173`).

---

## Panduan Deploy ke Vercel (Gratis & Cepat)

### Cara 1: Lewat Dashboard Vercel (Direkomendasikan)
1. Unggah (*push*) folder proyek ini ke repositori GitHub Anda.
2. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
3. Klik **"Add New..."** $\rightarrow$ **"Project"**.
4. Pilih repositori `survei-prapensiun-bkpsdm`.
5. Pada bagian konfigurasi build, biarkan default (Framework Preset: **Vite**).
6. Klik **"Deploy"**. Website langsung aktif dengan domain `.vercel.app`!

### Cara 2: Menggunakan Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## Panduan Integrasi Google Sheets (Google Drive)

1. Buka [Google Drive](https://drive.google.com).
2. Buat **Google Spreadsheet** baru (misal: `Database Survei Usaha ASN BKPSDM`).
3. Pada menu atas, klik **Extensions (Ekstensi)** $\rightarrow$ **Apps Script**.
4. Buka file `google-apps-script/Code.gs` yang ada di proyek ini, lalu salin seluruh kodenya dan tempel ke Apps Script editor.
5. Klik **Deploy (Terapkan)** $\rightarrow$ **New deployment (Penerapan baru)**.
6. Pilih jenis: **Web app**.
   - *Execute as*: **Me**
   - *Who has access*: **Anyone** (Siapa saja)
7. Klik **Deploy** dan berikan izin akses (*Authorize access*).
8. Salin **Web app URL** yang berakhiran `/exec`.
9. Buka website survei Anda, klik menu **"Konfigurasi Database GSheets"** di footer bawah, lalu tempel URL tersebut. Selesai! Data responden akan langsung masuk otomatis ke Google Sheets Anda.
