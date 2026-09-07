/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: CONNECTOR SURVEI ASN PRA-PENSIUN BKPSDM
 * =========================================================================
 * Panduan Pemasangan (Hanya 1 Menit):
 * 1. Buka Google Drive Anda (drive.google.com).
 * 2. Buat file baru: Google Spreadsheet (beri nama misal: "Database Survei Usaha ASN BKPSDM").
 * 3. Di menu atas, klik: Extensions (Ekstensi) > Apps Script.
 * 4. Hapus semua kode yang ada di editor Apps Script, lalu TEMPEL SELURUH KODE DI BAWAH INI.
 * 5. Klik ikon Simpan (Save/Disket).
 * 6. Klik tombol biru di kanan atas: "Deploy" (Terapkan) > "New deployment" (Penerapan baru).
 * 7. Pilih tipe: "Web app" (ikon roda gigi > Web app).
 * 8. Pada konfigurasi:
 *    - Description: "Survei BKPSDM Webhook"
 *    - Execute as: "Me" (email Anda)
 *    - Who has access: "Anyone" (Siapa saja - agar website Vercel bisa mengirim data tanpa login)
 * 9. Klik "Deploy". Jika diminta otorisasi, klik "Authorize access" > pilih akun Anda > "Advanced" > "Go to ... (unsafe)".
 * 10. Salin URL "Web app URL" yang muncul (berakhiran /exec).
 * 11. Masukkan URL tersebut ke konfigurasi website Vercel Anda!
 * =========================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Jika tombol "Jalankan" diklik manual di editor Apps Script tanpa payload
    if (!e || !e.postData || !e.postData.contents) {
      Logger.log("doPost dipanggil manual tanpa payload. Menjalankan testTulisKeSheet()...");
      return testTulisKeSheet();
    }

    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    simpanKeSheet(ss, data);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Data survei ASN berhasil disimpan ke Google Sheets." })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Fungsi pembantu penyimpanan ke Sheet Data_Responden
function simpanKeSheet(ss, data) {
  var sheet = ss.getSheetByName("Data_Responden");
  
  // Jika sheet belum ada, buat otomatis
  if (!sheet) {
    sheet = ss.insertSheet("Data_Responden");
  }

  // Header Kolom Lengkap sesuai Instrumen BKPSDM (37 Kolom)
  var headers = [
    "Waktu Submit",
    "Nama Lengkap",
    "NIP/NIK",
    "Perangkat Daerah / Unit Kerja",
    "Jabatan Terakhir",
    "Tahun Pensiun",
    "Usia",
    "Pendidikan Terakhir",
    "Rencana Domisili",
    "Pengalaman Usaha",
    "Bidang Usaha Pernah/Sedang",
    "Keterampilan Dimiliki",
    "3 Bidang Paling Diminati",
    "Prioritas Usaha Utama (MINAT_UTAMA)",
    "Alasan Memilih Prioritas",
    "Keyakinan Usaha (1-5)",
    "Detail Subsektor Pilihan",
    "Aset Tersedia",
    "Kepemilikan Lahan",
    "Perkiraan Luas Lahan",
    "Kendaraan Tersedia",
    "Modal Pribadi Siap Alokasi",
    "Sumber Modal Rencana",
    "Bersedia Tambah Modal",
    "Waktu Harian untuk Usaha",
    "Model Keterlibatan",
    "Kesediaan Pelatihan (1-5)",
    "Topik Pelatihan Dibutuhkan",
    "Bentuk Pendampingan Dibutuhkan",
    "Komitmen Pendampingan 6-12 Bln",
    "Kendala Terbesar",
    "Harapan terhadap BKPSDM",
    "TOTAL SKOR (0-100)",
    "Kategori Kesiapan",
    "Interpretasi Hasil",
    "Tingkat Prioritas",
    "Rekomendasi Program"
  ];

  // Jika sheet masih kosong, tulis header baris pertama
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#002060");
    headerRange.setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }

  // Ekstrak detail subsektor spesifik
  var detailSubsektor = [
    data.khususPertanian ? "Pertanian: " + data.khususPertanian.join(", ") : "",
    data.khususPerikanan ? "Perikanan: " + data.khususPerikanan.join(", ") : "",
    data.khususPerkebunan ? "Perkebunan: " + data.khususPerkebunan.join(", ") : "",
    data.khususPeternakan ? "Peternakan: " + data.khususPeternakan.join(", ") : "",
    data.khususEkspedisi ? "Ekspedisi: " + data.khususEkspedisi.join(", ") : "",
    data.khususGrosir ? "Grosir: " + data.khususGrosir.join(", ") : "",
    data.khususCuciKendaraan ? "Cuci: " + data.khususCuciKendaraan.join(", ") : "",
    data.khususLainnya ? "Lainnya: " + data.khususLainnya.join(", ") : ""
  ].filter(Boolean).join(" | ");

  // Susun baris data baru
  var row = [
    new Date(),
    data.nama || "-",
    data.nip || "-",
    data.unitKerja || "-",
    data.jabatan || "-",
    data.tahunPensiun || "-",
    data.usia || "-",
    data.pendidikan || "-",
    data.domisili || "-",
    data.pengalamanUsaha || "-",
    Array.isArray(data.bidangPernahDijalankan) ? data.bidangPernahDijalankan.join(", ") : "-",
    Array.isArray(data.keterampilan) ? data.keterampilan.join(", ") : "-",
    Array.isArray(data.bidangDiminati) ? data.bidangDiminati.join(", ") : "-",
    data.prioritasUtama || "-",
    data.alasanPrioritas || "-",
    data.keyakinanUsaha || "-",
    detailSubsektor || "-",
    Array.isArray(data.asetTersedia) ? data.asetTersedia.join(", ") : "-",
    data.kepemilikanLahan || "-",
    data.perkiraanLuasLahan || "-",
    Array.isArray(data.kendaraanTersedia) ? data.kendaraanTersedia.join(", ") : "-",
    data.modalPribadi || "-",
    Array.isArray(data.sumberModal) ? data.sumberModal.join(", ") : "-",
    data.tambahModal || "-",
    data.waktuHarian || "-",
    data.modelKeterlibatan || "-",
    data.kesediaanPelatihan || "-",
    Array.isArray(data.topikPelatihan) ? data.topikPelatihan.join(", ") : "-",
    Array.isArray(data.bentukPendampingan) ? data.bentukPendampingan.join(", ") : "-",
    data.kesediaanPendampingan || "-",
    Array.isArray(data.kendalaTerbesar) ? data.kendalaTerbesar.join(", ") : "-",
    data.harapanBKPSDM || "-",
    data.scoring ? data.scoring.totalScore : 0,
    data.scoring ? data.scoring.category : "-",
    data.scoring ? data.scoring.interpretation : "-",
    data.scoring ? data.scoring.priorityLevel : "-",
    data.scoring ? data.scoring.recommendation : "-"
  ];

  sheet.appendRow(row);
  Logger.log("✓ Berhasil menulis data ke Sheet Data_Responden.");
}

// Fungsi ini BISA diklik langsung lewat tombol "▷ Jalankan" di Google Apps Script editor
// untuk langsung membuat sheet dan menulis 1 baris data contoh ke Spreadsheet!
function testTulisKeSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var contohData = {
    nama: "YUSANTO WIBOWO, S.IP., M.P.",
    nip: "196810091990031001",
    unitKerja: "Sekretariat Daerah",
    jabatan: "Asisten Pemerintahan dan Kesejahteraan Rakyat",
    tahunPensiun: "2028",
    usia: "58",
    pendidikan: "Magister (S2)",
    domisili: "Tetap di domisili saat ini",
    pengalamanUsaha: "Pernah, tapi sudah berhenti",
    bidangPernahDijalankan: ["Pertanian & Hidroponik"],
    keterampilan: ["Manajemen Usaha / Operasional"],
    bidangDiminati: ["Pertanian & Hidroponik"],
    prioritasUtama: "Pertanian & Hidroponik",
    alasanPrioritas: "Memiliki potensi lahan prapensiun di Majalengka",
    keyakinanUsaha: 5,
    khususPertanian: ["Hortikultura & Sayuran (Cabai, Tomat, Bawang)"],
    asetTersedia: ["Lahan / Tanah sendiri"],
    kepemilikanLahan: "Ya, milik sendiri",
    perkiraanLuasLahan: "500 - 1.000 m2",
    kendaraanTersedia: ["Mobil Pick-up"],
    modalPribadi: "Rp50 - 100 juta",
    sumberModal: ["Tabungan pribadi"],
    tambahModal: "Ya, jika ada prospek jelas",
    waktuHarian: "4 - 6 jam per hari",
    modelKeterlibatan: "Kelola sendiri sepenuhnya (Operasional langsung)",
    kesediaanPelatihan: 5,
    topikPelatihan: ["Penyusunan Business Plan & Studi Kelayakan", "Teknik Budidaya & Produksi Efisien"],
    bentukPendampingan: ["Pelatihan teknis langsung di lokasi usaha (Field visit)"],
    kesediaanPendampingan: "Ya, sangat bersedia",
    kendalaTerbesar: ["Pemasaran / Pembeli"],
    harapanBKPSDM: "Bimbingan teknis dan kemitraan pasar yang berkelanjutan",
    scoring: {
      totalScore: 88,
      category: "Sangat Siap",
      interpretation: "Prioritas Inkubasi / Kemitraan Usaha",
      priorityLevel: "Tinggi",
      recommendation: "Direkomendasikan masuk Program Inkubasi Usaha Mandiri BKPSDM."
    }
  };

  simpanKeSheet(ss, contohData);

  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", message: "Data contoh uji coba berhasil ditulis ke Google Sheets." })
  ).setMimeType(ContentService.MimeType.JSON);
}

// Untuk tes akses via browser
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ready", message: "Endpoint Google Apps Script Survei BKPSDM Aktif." })
  ).setMimeType(ContentService.MimeType.JSON);
}
