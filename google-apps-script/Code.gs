/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: CONNECTOR SURVEI ASN PRA-PENSIUN BKPSDM (VERSI REAL-TIME)
 * =========================================================================
 * Fitur:
 * 1. doPost : Menerima data kiriman survei dari responden dan mencatat ke Spreadsheet.
 * 2. doGet  : Mengirimkan seluruh data responden secara real-time ke Dashboard Admin.
 *
 * Panduan Update (Hanya 1 Menit):
 * 1. Buka file Google Spreadsheet Anda.
 * 2. Di menu atas, klik: Extensions (Ekstensi) > Apps Script.
 * 3. Hapus semua kode yang ada di editor Apps Script, lalu TEMPEL SELURUH KODE INI.
 * 4. Klik ikon Simpan (Save/Disket).
 * 5. Klik tombol biru di kanan atas: "Deploy" (Terapkan) > "Manage deployments" (Kelola penerapan).
 * 6. Klik ikon Pensil (Edit) di samping deployment aktif Anda:
 *    - Versi: Pilih "New version" (Versi baru).
 *    - Siapa yang memiliki akses (Who has access): "Anyone" (Siapa saja).
 * 7. Klik "Deploy" (Terapkan).
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

// SINKRONISASI REAL-TIME: Mengirim data seluruh baris Spreadsheet ke Dashboard Admin BKPSDM
function doGet(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Data_Responden");

    // Jika sheet belum ada atau hanya ada header (0 atau 1 baris)
    if (!sheet || sheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: "success",
          total: 0,
          records: [],
          message: "Sheet Data_Responden masih kosong atau hanya berisi baris header."
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var values = sheet.getDataRange().getValues();
    var records = [];

    // Mulai dari baris ke-2 (index 1) karena baris ke-1 adalah judul kolom
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (!row[1] && !row[2]) continue; // Lewati jika nama dan NIP kosong

      var timeStr = "";
      if (row[0] instanceof Date) {
        timeStr = Utilities.formatDate(row[0], "Asia/Jakarta", "dd/MM/yyyy, HH:mm:ss");
      } else {
        timeStr = String(row[0] || "-");
      }

      var totalScoreNum = Number(row[32]) || 0;
      var categoryStr = String(row[33] || "-");
      var colorStr = totalScoreNum >= 80 ? "emerald" : totalScoreNum >= 65 ? "blue" : totalScoreNum >= 50 ? "amber" : "slate";

      var record = {
        id: "GS-" + i,
        timestamp: timeStr,
        data: {
          nama: String(row[1] || "-"),
          nip: String(row[2] || "-"),
          unitKerja: String(row[3] || "-"),
          jabatan: String(row[4] || "-"),
          tahunPensiun: String(row[5] || "-"),
          usia: String(row[6] || "-"),
          pendidikan: String(row[7] || "-"),
          domisili: String(row[8] || "-"),
          pengalamanUsaha: String(row[9] || "-"),
          bidangPernahDijalankan: row[10] ? String(row[10]).split(", ") : [],
          keterampilan: row[11] ? String(row[11]).split(", ") : [],
          bidangDiminati: row[12] ? String(row[12]).split(", ") : [],
          prioritasUtama: String(row[13] || "-"),
          alasanPrioritas: String(row[14] || "-"),
          keyakinanUsaha: Number(row[15]) || 0,
          asetTersedia: row[17] ? String(row[17]).split(", ") : [],
          kepemilikanLahan: String(row[18] || "-"),
          perkiraanLuasLahan: String(row[19] || "-"),
          kendaraanTersedia: row[20] ? String(row[20]).split(", ") : [],
          modalPribadi: String(row[21] || "-"),
          sumberModal: row[22] ? String(row[22]).split(", ") : [],
          tambahModal: String(row[23] || "-"),
          waktuHarian: String(row[24] || "-"),
          modelKeterlibatan: String(row[25] || "-"),
          kesediaanPelatihan: Number(row[26]) || 0,
          topikPelatihan: row[27] ? String(row[27]).split(", ") : [],
          bentukPendampingan: row[28] ? String(row[28]).split(", ") : [],
          kesediaanPendampingan: String(row[29] || "-"),
          kendalaTerbesar: row[30] ? String(row[30]).split(", ") : [],
          harapanBKPSDM: String(row[31] || "-")
        },
        score: {
          totalScore: totalScoreNum,
          category: categoryStr,
          interpretation: String(row[34] || "-"),
          priorityLevel: String(row[35] || "Sedang"),
          recommendation: String(row[36] || "-"),
          color: colorStr,
          dimensions: []
        }
      };

      records.unshift(record); // Data submit terbaru tampil paling atas
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        total: records.length,
        records: records,
        lastUpdated: Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss")
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error doGet: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Fungsi pengujian manual
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
    topikPelatihan: ["Penyusunan Business Plan & Studi Kelayakan"],
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
