import pandas as pd
import random
from datetime import datetime, timedelta

# Daftar nama dan instansi ASN realistis
NAMA_LIST = [
    ("Drs. H. Bambang Sutrisno, M.Si.", "L", "Dinas Pertanian dan Ketahanan Pangan", "Kepala Bidang Prasarana", 57, "2027", "Pertanian"),
    ("Hj. Siti Rahmawati, S.E.", "P", "Dinas Koperasi, Usaha Kecil Menengah dan Perdagangan", "Analis Perdagangan Ahli Madya", 56, "2028", "Perdagangan grosir"),
    ("Ir. Hendra Gunawan", "L", "Dinas Perhubungan", "Kepala Seksi Angkutan Jalan", 58, "2026", "Ekspedisi/pengiriman barang"),
    ("Dra. Nurul Hidayati, M.Pd.", "P", "Dinas Pendidikan", "Pengawas Sekolah Ahli Madya", 57, "2027", "Kuliner"),
    ("dr. H. Agus Prasetyo, Sp.A.", "L", "RSUD", "Dokter Spesialis Madya", 58, "2026", "Perikanan"),
    ("H. Ahmad Zaelani, S.Sos.", "L", "Kecamatan / Kelurahan", "Sekretaris Kecamatan", 56, "2028", "Peternakan"),
    ("Sri Wahyuni, S.AP.", "P", "Badan Kepegawaian dan Pengembangan SDM (BKPSDM)", "Analis Kepegawaian", 55, "2029", "Kos/sewa properti"),
    ("Ir. Dedi Kusnadi", "L", "Dinas Perkebunan dan Peternakan", "Analis Komoditas Perkebunan", 57, "2027", "Perkebunan"),
    ("Endang Sulastri, S.Pd.", "P", "Dinas Pendidikan", "Guru Madya", 58, "2026", "Laundry"),
    ("Budi Hartono, S.T.", "L", "Dinas Pekerjaan Umum dan Penataan Ruang (PUPR)", "Penata Kelola Jalan & Jembatan", 57, "2027", "Cuci kendaraan"),
    ("H. Mansyur, S.IP.", "L", "Satuan Polisi Pamong Praja (Satpol PP)", "Kepala Seksi Ketertiban", 56, "2028", "Pertanian"),
    ("Ratna Dewi, S.E., M.M.", "P", "Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD)", "Analis Perbendaharaan", 56, "2028", "Perdagangan grosir"),
    ("Drs. Mulyadi", "L", "Inspektorat Daerah", "Auditor Ahli Madya", 58, "2026", "Perikanan"),
    ("Eka Safitri, S.Kom.", "P", "Dinas Komunikasi dan Informatika", "Pranata Komputer Madya", 55, "2029", "Usaha online/digital"),
    ("H. Suwandi, S.Pt.", "L", "Dinas Perkebunan dan Peternakan", "Pengawas Bibit Ternak", 57, "2027", "Peternakan"),
    ("Yuliana, S.H.", "P", "Sekretariat Daerah", "Analis Hukum Ahli Madya", 57, "2027", "Rental kendaraan"),
    ("drh. Rudi Kurniawan", "L", "Dinas Perkebunan dan Peternakan", "Medik Veteriner", 56, "2028", "Peternakan"),
    ("Neneng Hasanah, S.Sos.", "P", "Dinas Sosial", "Penyuluh Sosial Madya", 57, "2027", "Kuliner"),
    ("Drs. Taufik Hidayat", "L", "Badan Perencanaan Pembangunan Daerah (Bappeda)", "Perencana Ahli Madya", 58, "2026", "Pertanian"),
    ("Agus Supriyadi, S.H.", "L", "Dinas Lingkungan Hidup", "Pengawas Lingkungan Hidup", 56, "2028", "Perikanan")
]

rows = []
base_time = datetime.now() - timedelta(days=5)

for i, (nama, jk, opd, jabatan, usia, th_pensiun, prioritas) in enumerate(NAMA_LIST):
    nip = f"19{68 + random.randint(0,4)}{random.randint(1,12):02d}{random.randint(1,28):02d}199{random.randint(1,9)}0{1 if jk=='L' else 2}00{random.randint(1,9)}"
    submit_time = base_time + timedelta(hours=i * 6, minutes=random.randint(5, 50))
    
    # Kategori peminatan
    yakin = random.choices([3, 4, 5], weights=[0.2, 0.5, 0.3])[0]
    pengalaman = random.choices(["Masih menjalankan usaha aktif", "Masih menjalankan usaha kecil", "Pernah tetapi berhenti", "Belum pernah"], weights=[0.3, 0.3, 0.25, 0.15])[0]
    
    lahan = random.choices(["Ya, milik sendiri", "Ya, milik keluarga", "Berpotensi menyewa", "Tidak memiliki lahan"], weights=[0.5, 0.25, 0.15, 0.1])[0]
    modal = random.choices(["Rp100 - 250 juta", "Rp50 - 100 juta", "Rp25 - 50 juta", "Rp10 - 25 juta"], weights=[0.25, 0.45, 0.2, 0.1])[0]
    waktu = random.choices(["6 - 8 jam per hari (penuh)", "4 - 6 jam per hari", "Fleksibel sesuai kebutuhan usaha"], weights=[0.4, 0.4, 0.2])[0]
    pelatihan = random.choices([4, 5], weights=[0.4, 0.6])[0]
    pendampingan = random.choices(["Ya, sangat bersedia", "Mempertimbangkan waktu & materi"], weights=[0.75, 0.25])[0]
    
    # Hitung skor
    score_minat = 10 + (yakin / 5) * 15
    score_komp = 9 if "aktif" in pengalaman else (7 if "kecil" in pengalaman else (4 if "berhenti" in pengalaman else 1))
    score_komp += random.choice([3, 4.5, 6])
    score_aset = (6 if "sendiri" in lahan else 4) + random.choice([3, 4.5, 6]) + random.choice([1.5, 3])
    score_modal = (9 if "100" in modal else (7.5 if "50" in modal else 6)) + random.choice([2.5, 4])
    score_waktu = (5.5 if "6 - 8" in waktu else 4.5) + random.choice([3, 4])
    score_latih = (pelatihan / 5) * 10
    score_damp = 10 if "sangat" in pendampingan else 6.5
    
    total_score = min(100, int(round(score_minat + score_komp + score_aset + score_modal + score_waktu + score_latih + score_damp)))
    
    if total_score >= 80:
        kategori = "Sangat Siap"
        interpretasi = "Prioritas Inkubasi & Kemitraan Strategis"
        prioritas_level = "Tinggi"
    elif total_score >= 65:
        kategori = "Siap"
        interpretasi = "Perlu Penguatan Terarah"
        prioritas_level = "Tinggi"
    elif total_score >= 50:
        kategori = "Potensial"
        interpretasi = "Perlu Pembekalan Intensif"
        prioritas_level = "Sedang"
    else:
        kategori = "Belum Siap"
        interpretasi = "Fokus Orientasi & Asesmen Lanjutan"
        prioritas_level = "Bimbingan Awal"
        
    rows.append({
        "Timestamp": submit_time.strftime("%Y-%m-%d %H:%M:%S"),
        "Nama Lengkap": nama,
        "NIP": nip,
        "Perangkat Daerah": opd,
        "Jabatan Terakhir": jabatan,
        "Tahun Pensiun": th_pensiun,
        "Usia": usia,
        "Pendidikan": "Sarjana (S1)",
        "Rencana Domisili": "Tetap di domisili saat ini",
        "Pengalaman Usaha": pengalaman,
        "MINAT_UTAMA": prioritas,
        "Keyakinan Usaha (1-5)": yakin,
        "Kepemilikan Lahan": lahan,
        "Modal Pribadi": modal,
        "Waktu Harian": waktu,
        "Komitmen Pelatihan (1-5)": pelatihan,
        "Komitmen Pendampingan": pendampingan,
        "TOTAL SKOR (0-100)": total_score,
        "Kategori Kesiapan": kategori,
        "Interpretasi BKPSDM": interpretasi,
        "Tingkat Prioritas": prioritas_level
    })

df = pd.DataFrame(rows)
output_path = r"C:\Users\IT DEV - FATH\.gemini\antigravity\scratch\survei-prapensiun-bkpsdm\Data_Simulasi_Responden_ASN_BKPSDM.xlsx"
df.to_excel(output_path, index=False, sheet_name="Data_Responden_Simulasi")
print("SUCCESS: 20 Baris Data Simulasi berhasil dibuat di", output_path)
