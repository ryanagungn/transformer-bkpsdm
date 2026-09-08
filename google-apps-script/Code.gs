/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: CONNECTOR SURVEI ASN PRA-PENSIUN BKPSDM
 * (VERSI TERPROTEKSI: ANTI-DUPLIKASI, TOKEN AUTORISASI & ANTI-FORMULA INJECTION)
 * =========================================================================
 * Fitur Keamanan:
 * 1. Token Otorisasi: doGet mewajibkan token rahasia agar data responden tidak bisa di-scrape publik.
 * 2. Anti-Formula Injection: Menangkal eksploitasi rumus Excel (=, +, -, @) dari input pengguna.
 * 3. Anti-Duplikasi: Otomatis memperbarui (update) jika NIP sudah ada di Spreadsheet.
 *
 * Panduan Update (1 Menit):
 * 1. Buka Google Spreadsheet Anda > menu Ekstensi > Apps Script.
 * 2. Hapus semua kode lama, lalu TEMPEL SELURUH KODE INI.
 * 3. Klik ikon Simpan (Disket).
 * 4. Klik Deploy > Manage deployments > Edit (Pensil) > Version: New version > Deploy.
 * =========================================================================
 */

var SECURE_TOKEN = "BKPSDM_TRANSFORMERS_2026_SECURE_TOKEN";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!e || !e.postData || !e.postData.contents) {
      Logger.log("doPost dipanggil manual tanpa payload. Menjalankan testTulisKeSheet()...");
      return testTulisKeSheet();
    }

    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    simpanKeSheet(ss, data);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Data survei ASN berhasil disimpan ke Google Sheets (Tervalidasi Aman)." })
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

// Sanitasi untuk menangkal Spreadsheet Formula Injection (CWE-1236)
function bersihkanFormula(val) {
  if (typeof val !== "string") return val;
  var trimmed = val.trim();
  if (/^[=+\-@	]/.test(trimmed)) {
    return "'" + trimmed;
  }
  return trimmed;
}

// Fungsi pembantu penyimpanan ke Sheet Data_Responden (Proteksi Anti-Duplikasi & Formula Injection)
function simpanKeSheet(ss, data) {
  var sheet = ss.getSheetByName("Data_Responden");
  
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

  // Susun baris data baru dengan pembersihan sanitasi
  var rawRow = [
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

  var row = rawRow.map(function(item) {
    return bersihkanFormula(item);
  });

  // ANTI-DUPLIKASI: Cek keberadaan NIP di Sheet
  var nipTarget = String(data.nip || "").trim().replace(/[\s\.\-]/g, "");
  var existingRowIndex = -1;

  if (nipTarget && nipTarget !== "-" && nipTarget !== "0") {
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var nipValues = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
      for (var r = 0; r < nipValues.length; r++) {
        var existingNip = String(nipValues[r][0] || "").trim().replace(/[\s\.\-]/g, "");
        if (existingNip === nipTarget) {
          existingRowIndex = r + 2;
          break;
        }
      }
    }
  }

  if (existingRowIndex > 0) {
    sheet.getRange(existingRowIndex, 1, 1, row.length).setValues([row]);
    Logger.log("✓ Data NIP " + nipTarget + " ditemukan di baris " + existingRowIndex + ". Data diperbarui (Anti-Duplikasi).");
  } else {
    sheet.appendRow(row);
    Logger.log("✓ Berhasil menulis data baru ke Sheet Data_Responden.");
  }
}

// SINKRONISASI REAL-TIME TERPROTEKSI: Mengirim data unik ke Dashboard Admin (Wajib Token)
function doGet(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // 1. Otorisasi Keamanan: Periksa apakah token rahasia valid
    var clientToken = e && e.parameter ? (e.parameter.token || e.parameter.apiKey || "") : "";
    if (clientToken !== SECURE_TOKEN) {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: "error",
          message: "Akses ditolak (403 Forbidden): Token autentikasi tidak valid atau tidak disertakan."
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Data_Responden");

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
    var seenKeys = {};

    // Scan dari baris paling bawah ke atas (data submit paling baru diperiksa lebih awal)
    for (var i = values.length - 1; i >= 1; i--) {
      var row = values[i];
      if (!row[1] && !row[2]) continue;

      var nipKey = String(row[2] || "").trim().replace(/[\s\.\-]/g, "");
      var nameKey = String(row[1] || "").trim().toLowerCase();
      var uniqueKey = nipKey && nipKey !== "-" && nipKey !== "0" ? "nip:" + nipKey : "name:" + nameKey;

      if (seenKeys[uniqueKey]) {
        continue;
      }
      seenKeys[uniqueKey] = true;

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

      records.push(record);
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        total: records.length,
        records: records,
        antiDuplication: true,
        authenticated: true,
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

// Fungsi Opsional: Hapus baris lama yang duplikat langsung di Sheet Spreadsheet
function bersihkanDuplikasiDiSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Data_Responden");
  if (!sheet || sheet.getLastRow() <= 2) return;

  var values = sheet.getDataRange().getValues();
  var seenKeys = {};
  var rowsToDelete = [];

  for (var i = values.length - 1; i >= 1; i--) {
    var nip = String(values[i][2] || "").trim().replace(/[\s\.\-]/g, "");
    var name = String(values[i][1] || "").trim().toLowerCase();
    var key = nip && nip !== "-" && nip !== "0" ? "nip:" + nip : "name:" + name;

    if (seenKeys[key]) {
      rowsToDelete.push(i + 1);
    } else {
      seenKeys[key] = true;
    }
  }

  for (var d = 0; d < rowsToDelete.length; d++) {
    sheet.deleteRow(rowsToDelete[d]);
  }

  Logger.log("Selesai. Telah menghapus " + rowsToDelete.length + " baris duplikasi lama.");
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
    perkiraanLuasLahan: "1.000 - 5.000 m²",
    kendaraanTersedia: ["Mobil Pribadi / Niaga (Pick up/Blind van)"],
    modalPribadi: "Rp 50 Juta - Rp 100 Juta",
    sumberModal: ["Tabungan Pribadi"],
    tambahModal: "Ya, siap menambah jika prospek jelas",
    waktuHarian: "Penuh Waktu (Full-time > 6 jam/hari)",
    modelKeterlibatan: "Pemilik & Pengelola Langsung (Hands-on)",
    kesediaanPelatihan: 5,
    topikPelatihan: ["Teknis Budidaya Terstandar"],
    bentukPendampingan: ["Bimbingan Teknis Lapangan Intensif"],
    kesediaanPendampingan: "Ya, sangat bersedia",
    kendalaTerbesar: ["Pemasaran dan Penjualan"],
    harapanBKPSDM: "Fasilitasi kemitraan pasar dan pendampingan lapangan.",
    scoring: {
      totalScore: 82,
      category: "Sangat Siap",
      interpretation: "Tingkat kesiapan prapensiun optimal untuk inkubasi usaha.",
      priorityLevel: "Tinggi",
      recommendation: "Direkomendasikan masuk Inkubator Usaha Prioritas BKPSDM."
    }
  };

  simpanKeSheet(ss, contohData);
  return ContentService.createTextOutput("Uji coba simpanKeSheet berhasil dijalankan.").setMimeType(ContentService.MimeType.TEXT);
}
