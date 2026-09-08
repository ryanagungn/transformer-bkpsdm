import React, { useState, useEffect, useRef } from 'react';
import { SurveyData, ScoringResult } from '../types/survey';
import { MasterPegawai } from '../types/pegawai';
import { DEFAULT_MASTER_PEGAWAI, downloadPegawaiTemplate, parsePegawaiExcel } from '../data/defaultPegawai';
import { DEFAULT_GAS_TOKEN } from '../config/constants';
import { downloadAllRecordsExcel, parseRespondentExcel, deduplicateRespondentRecords, downloadSingleSurveyExcel } from '../utils/excelBackup';
import {
  LayoutDashboard,
  Users,
  Database,
  Wand2,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  UploadCloud,
  RefreshCw,
  LogOut,
  Copy,
  Check,
  Radio,
  FileText,
  ChevronRight,
  ShieldCheck,
  Eye,
  X
} from 'lucide-react';

interface RespondentRecord {
  id: string;
  timestamp: string;
  data: SurveyData;
  score: ScoringResult;
}

interface AdminPortalProps {
  scriptUrl: string;
  onSaveScriptUrl: (url: string) => void;
  onClose: () => void;
  onLogout: () => void;
  masterPegawai: MasterPegawai[];
  onUpdateMasterPegawai: (data: MasterPegawai[]) => void;
  onLoadPresetToSurvey: (presetKey: string) => void;
}


const APPS_SCRIPT_SOURCE = `/**
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
  if (/^[=+\-@	
]/.test(trimmed)) {
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
`;

export const AdminPortal: React.FC<AdminPortalProps> = ({
  scriptUrl,
  onSaveScriptUrl,
  onClose,
  onLogout,
  masterPegawai,
  onUpdateMasterPegawai,
  onLoadPresetToSurvey
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pegawai' | 'records' | 'settings' | 'testing'>('dashboard');
  const [urlInput, setUrlInput] = useState(scriptUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [records, setRecords] = useState<RespondentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPegawai, setSearchPegawai] = useState('');
  const [pegawaiPage, setPegawaiPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [testConnStatus, setTestConnStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  // File upload ref Master Pegawai
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ loading: boolean; message: string; isError: boolean } | null>(null);

  // File upload ref Excel Responden
  const respondentFileInputRef = useRef<HTMLInputElement>(null);
  const [importRespondentStatus, setImportRespondentStatus] = useState<{ loading: boolean; message: string; isError: boolean } | null>(null);

  // Status Sinkronisasi Real-Time Online
  const [isSyncingRealtime, setIsSyncingRealtime] = useState<boolean>(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // Modal Peminatan (Menampilkan nama-nama yang memilih bidang tertentu)
  const [selectedMinatModal, setSelectedMinatModal] = useState<{
    name: string;
    icon: string;
    key: string;
    records: RespondentRecord[];
  } | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Modal Rincian Jawaban Lengkap Responden
  const [selectedRespondentDetail, setSelectedRespondentDetail] = useState<RespondentRecord | null>(null);

  // Fungsi Sinkronisasi Real-Time dari Google Spreadsheet
  const fetchRealtimeFromGoogleSheets = async (isManual: boolean = false) => {
    if (!urlInput || urlInput.trim() === '') return;

    setIsSyncingRealtime(true);
    setLastSyncStatus(null);

    try {
      const fetchUrl = urlInput.includes('?')
        ? `${urlInput}&token=${DEFAULT_GAS_TOKEN}`
        : `${urlInput}?token=${DEFAULT_GAS_TOKEN}`;
      const response = await fetch(fetchUrl, { method: 'GET' });
      const result = await response.json();

      if (result && result.status === 'success' && Array.isArray(result.records)) {
        const cleanRecords = deduplicateRespondentRecords(result.records);
        setRecords(cleanRecords);
        localStorage.setItem('bkpsdm_survey_records', JSON.stringify(cleanRecords));
        setLastSyncStatus(`✓ Terhubung Real-Time (Anti-Duplikasi Aktif): ${cleanRecords.length} responden unik berhasil disinkronkan (${result.lastUpdated || new Date().toLocaleTimeString('id-ID')}).`);
        if (isManual) {
          alert(`Berhasil! ${cleanRecords.length} data responden unik termutakhir telah ditarik dari Google Spreadsheet (duplikasi otomatis dibersihkan).`);
        }
      } else if (result && result.message) {
        setLastSyncStatus(`Info: ${result.message}`);
      }
    } catch (err: any) {
      console.warn('Sinkronisasi online:', err);
      setLastSyncStatus(`Koneksi offline atau script belum diperbarui. Menampilkan data cadangan browser (${records.length} responden).`);
    } finally {
      setIsSyncingRealtime(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('bkpsdm_survey_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const clean = deduplicateRespondentRecords(parsed);
        setRecords(clean);
      } catch (e) {
        console.error(e);
      }
    }

    // Otomatis tarik data terbaru dari Google Spreadsheet saat Admin dibuka
    fetchRealtimeFromGoogleSheets(false);
  }, [urlInput]);

  const saveRecords = (newRecords: RespondentRecord[]) => {
    const clean = deduplicateRespondentRecords(newRecords);
    setRecords(clean);
    localStorage.setItem('bkpsdm_survey_records', JSON.stringify(clean));
  };

  const handleCleanDuplicates = () => {
    const clean = deduplicateRespondentRecords(records);
    const diff = records.length - clean.length;
    saveRecords(clean);
    if (diff > 0) {
      alert(`Berhasil membersihkan ${diff} data duplikat! Sekarang terdapat ${clean.length} responden unik.`);
    } else {
      alert(`Data sudah bersih dan optimal! Seluruh ${clean.length} responden sudah unik (tidak ada duplikasi).`);
    }
  };

  const handleSaveUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed && !trimmed.startsWith('https://script.google.com/macros/s/')) {
      alert('Demi keamanan sistem, URL Webhook wajib menggunakan domain resmi Google Apps Script:\nhttps://script.google.com/macros/s/');
      return;
    }
    onSaveScriptUrl(trimmed);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const [testSendStatus, setTestSendStatus] = useState<'idle' | 'sending' | 'success' | 'failed'>('idle');

  // Sinkronisasi antrean offline ke Google Sheets
  const [syncQueueStatus, setSyncQueueStatus] = useState<{ running: boolean; current: number; total: number; successCount: number; errorCount: number } | null>(null);

  const handleSyncAllToGoogleSheets = async () => {
    if (!urlInput) {
      alert('Mohon simpan URL Webhook Google Apps Script terlebih dahulu di tab ini.');
      return;
    }
    if (records.length === 0) {
      alert('Tidak ada data responden lokal untuk dikirim.');
      return;
    }

    if (!confirm(`Kirim seluruh ${records.length} data responden lokal ke Google Spreadsheet sekarang?`)) {
      return;
    }

    setSyncQueueStatus({ running: true, current: 0, total: records.length, successCount: 0, errorCount: 0 });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      setSyncQueueStatus({ running: true, current: i + 1, total: records.length, successCount, errorCount });
      try {
        const payload = {
          ...r.data,
          scoring: r.score,
          submittedAt: r.timestamp
        };
        await fetch(urlInput, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        successCount++;
      } catch (err) {
        console.error('Sync failed for record', r.id, err);
        errorCount++;
      }
    }

    setSyncQueueStatus({ running: false, current: records.length, total: records.length, successCount, errorCount });
  };

  const handleTestConnection = async () => {
    if (!urlInput) {
      alert('Mohon masukkan URL Google Apps Script terlebih dahulu.');
      return;
    }
    setTestConnStatus('testing');
    try {
      await fetch(urlInput, { mode: 'no-cors' });
      setTestConnStatus('success');
    } catch (e) {
      console.error(e);
      setTestConnStatus('failed');
    }
  };

  const handleSendTestPayload = async () => {
    if (!urlInput) {
      alert('Mohon masukkan dan simpan URL Google Apps Script terlebih dahulu.');
      return;
    }
    setTestSendStatus('sending');
    try {
      const samplePayload = {
        nama: 'YUSANTO WIBOWO, S.IP., M.P.',
        nip: '196810091990031001',
        unitKerja: 'Sekretariat Daerah',
        jabatan: 'Asisten Pemerintahan dan Kesejahteraan Rakyat',
        tahunPensiun: '2028',
        usia: '58',
        pendidikan: 'Magister (S2)',
        domisili: 'Tetap di domisili saat ini',
        pengalamanUsaha: 'Pernah, tapi sudah berhenti',
        bidangPernahDijalankan: ['Pertanian & Hidroponik'],
        keterampilan: ['Manajemen Usaha / Operasional'],
        bidangDiminati: ['Pertanian & Hidroponik'],
        prioritasUtama: 'Pertanian & Hidroponik',
        alasanPrioritas: 'Memiliki lahan potensial prapensiun di Majalengka',
        keyakinanUsaha: 5,
        khususPertanian: ['Hortikultura & Sayuran (Cabai, Tomat, Bawang)'],
        asetTersedia: ['Lahan / Tanah sendiri'],
        kepemilikanLahan: 'Ya, milik sendiri',
        perkiraanLuasLahan: '500 - 1.000 m2',
        kendaraanTersedia: ['Mobil Pick-up'],
        modalPribadi: 'Rp50 - 100 juta',
        sumberModal: ['Tabungan pribadi'],
        tambahModal: 'Ya, jika ada prospek jelas',
        waktuHarian: '4 - 6 jam per hari',
        modelKeterlibatan: 'Kelola sendiri sepenuhnya (Operasional langsung)',
        kesediaanPelatihan: 5,
        topikPelatihan: ['Penyusunan Business Plan & Studi Kelayakan'],
        bentukPendampingan: ['Pelatihan teknis langsung di lokasi usaha (Field visit)'],
        kesediaanPendampingan: 'Ya, sangat bersedia',
        kendalaTerbesar: ['Pemasaran / Pembeli'],
        harapanBKPSDM: 'Bimbingan teknis dan kemitraan pasar yang berkelanjutan',
        scoring: {
          totalScore: 88,
          category: 'Sangat Siap',
          interpretation: 'Prioritas Inkubasi / Kemitraan Usaha',
          priorityLevel: 'Tinggi',
          recommendation: 'Direkomendasikan masuk Program Inkubasi Usaha Mandiri BKPSDM.'
        }
      };

      await fetch(urlInput, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(samplePayload)
      });

      setTestSendStatus('success');
      setTimeout(() => setTestSendStatus('idle'), 6000);
    } catch (e) {
      console.error(e);
      setTestSendStatus('failed');
    }
  };

  // Handler Upload Excel Master Pegawai
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setImportStatus({ loading: false, message: 'Ukuran file melebihi batas maksimal yang diizinkan (5 MB).', isError: true });
      return;
    }
    setImportStatus({ loading: true, message: `Sedang memproses file ${file.name}...`, isError: false });

    try {
      const parsed = await parsePegawaiExcel(file);
      onUpdateMasterPegawai(parsed);
      setImportStatus({
        loading: false,
        message: `Berhasil mengimpor ${parsed.length} data pegawai ASN dari ${file.name}!`,
        isError: false
      });
    } catch (err: any) {
      setImportStatus({
        loading: false,
        message: `Gagal membaca Excel: ${err.message || 'Format tidak valid'}`,
        isError: true
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handler Upload Excel Data Responden dari Google Spreadsheet
  const handleUploadRespondentExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setImportRespondentStatus({ loading: false, message: 'Ukuran berkas melebihi batas maksimal yang diizinkan (5 MB).', isError: true });
      return;
    }
    setImportRespondentStatus({ loading: true, message: `Sedang memproses berkas responden ${file.name}...`, isError: false });

    try {
      const parsed = await parseRespondentExcel(file);
      setRecords(parsed);
      localStorage.setItem('bkpsdm_survey_records', JSON.stringify(parsed));
      setImportRespondentStatus({
        loading: false,
        message: `Berhasil mengimpor ${parsed.length} data responden dari ${file.name}!`,
        isError: false
      });
    } catch (err: any) {
      setImportRespondentStatus({
        loading: false,
        message: `Gagal membaca Excel: ${err.message || 'Format tidak sesuai'}`,
        isError: true
      });
    } finally {
      if (respondentFileInputRef.current) {
        respondentFileInputRef.current.value = '';
      }
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('Belum ada data responden untuk diekspor.');
      return;
    }

    const headers = [
      'Waktu',
      'Nama Lengkap',
      'NIP',
      'Unit Kerja',
      'Jabatan',
      'Tahun Pensiun',
      'Usia',
      'Peminatan Utama (MINAT_UTAMA)',
      'Modal Pribadi',
      'Total Skor (0-100)',
      'Kategori Kesiapan'
    ];

    const cleanCsvCell = (val: any) => {
      let str = String(val ?? '').trim();
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = records.map((r) => [
      cleanCsvCell(r.timestamp),
      cleanCsvCell(r.data.nama),
      cleanCsvCell(r.data.nip),
      cleanCsvCell(r.data.unitKerja),
      cleanCsvCell(r.data.jabatan),
      cleanCsvCell(r.data.tahunPensiun),
      cleanCsvCell(r.data.usia),
      cleanCsvCell(r.data.prioritasUtama),
      cleanCsvCell(r.data.modalPribadi),
      r.score.totalScore,
      cleanCsvCell(r.score.category)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Survei_ASN_BKPSDM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrik KPI & Filter Peminatan Interaktif
  const totalResponden = records.length;
  const countKategori = (kat: string) =>
    records.filter((r) => (r.score.category || '').toLowerCase() === kat.toLowerCase()).length;

  const getRespondentsByMinat = (key: string): RespondentRecord[] => {
    if (key === 'Kuliner' || key === 'Lainnya') {
      const standardKeywords = ['pertanian', 'hidroponik', 'perikanan', 'ikan', 'perkebunan', 'peternakan', 'ekspedisi', 'pengiriman', 'grosir', 'sembako', 'cuci'];
      return records.filter((r) => {
        const p = (r.data?.prioritasUtama || '').toLowerCase();
        return !standardKeywords.some((sk) => p.includes(sk));
      });
    }
    const searchKeys = key.toLowerCase().split(/[&,/ ]+/).filter(Boolean);
    return records.filter((r) => {
      const p = (r.data?.prioritasUtama || '').toLowerCase();
      return searchKeys.some((sk) => p.includes(sk));
    });
  };

  const countMinat = (key: string) => getRespondentsByMinat(key).length;

  const filteredRecords = records.filter((r) => {
    const matchQuery =
      (r.data.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.data.unitKerja || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.data.prioritasUtama || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'ALL') return matchQuery;
    return matchQuery && r.score.category === selectedFilter;
  });

  const filteredPegawai = masterPegawai.filter((p) => {
    return (
      p.nama.toLowerCase().includes(searchPegawai.toLowerCase()) ||
      p.nip.toLowerCase().includes(searchPegawai.toLowerCase()) ||
      p.unitKerja.toLowerCase().includes(searchPegawai.toLowerCase()) ||
      p.jabatan.toLowerCase().includes(searchPegawai.toLowerCase())
    );
  });

  const PEGAWAI_PAGE_SIZE = 50;
  const totalPegawaiPages = Math.ceil(filteredPegawai.length / PEGAWAI_PAGE_SIZE) || 1;
  const paginatedPegawai = filteredPegawai.slice(
    (pegawaiPage - 1) * PEGAWAI_PAGE_SIZE,
    pegawaiPage * PEGAWAI_PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      {/* HEADER PORTAL ADMIN */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase tracking-wider mb-2 border border-blue-200">
            <LayoutDashboard className="w-3.5 h-3.5 text-blue-700" />
            Panel Administrator BKPSDM
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Dashboard Pengelolaan & Master Data Pegawai
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Monitoring data responden, template KPI, dan pengelolaan Master Data NIP Pegawai.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition text-sm cursor-pointer"
          >
            Lihat Formulir
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 font-bold text-sm hover:bg-rose-100 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </div>

      {/* NAVIGASI TAB ADMIN */}
      <div className="flex flex-wrap gap-2 border-b-2 border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Ringkasan KPI
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pegawai')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
            activeTab === 'pegawai'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Master Data Pegawai ({masterPegawai.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
            activeTab === 'records'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Data Responden ({records.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Integrasi Google Sheets
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('testing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
            activeTab === 'testing'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          Simulator
        </button>
      </div>

      {/* TAB 1: DASHBOARD KPI */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Responden</span>
              <span className="text-3xl sm:text-4xl font-black text-blue-950 mt-1 block">{totalResponden}</span>
              <span className="text-xs font-semibold text-emerald-700 mt-1 block">ASN Terdata</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Sangat Siap (80-100)</span>
              <span className="text-3xl sm:text-4xl font-black text-emerald-800 mt-1 block">
                {countKategori('Sangat Siap')}
              </span>
              <span className="text-xs font-semibold text-emerald-700 mt-1 block">Prioritas Inkubasi</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Siap (65-79)</span>
              <span className="text-3xl sm:text-4xl font-black text-blue-800 mt-1 block">
                {countKategori('Siap')}
              </span>
              <span className="text-xs font-semibold text-blue-700 mt-1 block">Penguatan Terarah</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Potensial (50-64)</span>
              <span className="text-3xl sm:text-4xl font-black text-amber-700 mt-1 block">
                {countKategori('Potensial')}
              </span>
              <span className="text-xs font-semibold text-amber-700 mt-1 block">Perlu Pembekalan</span>
            </div>
          </div>

          {/* Distribusi Peminatan Interaktif */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-800" />
                  Distribusi Peminatan Utama Usaha (Template Sheet 04)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  💡 <strong>Klik pada salah satu bidang usaha</strong> di bawah ini untuk melihat daftar nama ASN yang memilihnya.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 shrink-0 self-start sm:self-auto">
                <span>Interaktif: Klik Bidang untuk Rincian Nama</span>
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {[
                { name: 'Pertanian & Hidroponik', key: 'Pertanian', icon: '🌾' },
                { name: 'Perikanan & Budidaya Ikan', key: 'Perikanan', icon: '🐟' },
                { name: 'Perkebunan', key: 'Perkebunan', icon: '🌴' },
                { name: 'Peternakan', key: 'Peternakan', icon: '🐄' },
                { name: 'Ekspedisi & Pengiriman', key: 'Ekspedisi', icon: '📦' },
                { name: 'Perdagangan Grosir Sembako', key: 'Grosir', icon: '🏪' },
                { name: 'Cuci Kendaraan', key: 'Cuci', icon: '🚗' },
                { name: 'Kuliner, Kos & Usaha Lainnya', key: 'Kuliner', icon: '🍽️' }
              ].map((item, i) => {
                const pemilih = getRespondentsByMinat(item.key);
                const count = pemilih.length;
                const pct = totalResponden > 0 ? Math.round((count / totalResponden) * 100) : 0;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedMinatModal({
                        name: item.name,
                        icon: item.icon,
                        key: item.key,
                        records: pemilih
                      });
                      setModalSearchQuery('');
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-white hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer group"
                  >
                    <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                      <span className="flex items-center gap-2 group-hover:text-blue-900 transition">
                        <span className="text-lg p-1 rounded-lg bg-slate-50 group-hover:bg-blue-100 transition">{item.icon}</span>
                        <span className="font-extrabold">{item.name}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-blue-100/70 px-2 py-0.5 rounded-md">
                          <span>Lihat Nama</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-blue-950 font-black text-xs sm:text-sm bg-slate-100 group-hover:bg-blue-200/60 px-2.5 py-1 rounded-xl transition">
                          {count} ({pct}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mt-2">
                      <div
                        className="h-full bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MASTER DATA PEGAWAI (IMPORT EXCEL) */}
      {activeTab === 'pegawai' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-800" />
                Master Data Pegawai ASN (Auto-Fill NIP)
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Data ini digunakan untuk mengisi otomatis <strong>Nama, Jabatan, dan OPD</strong> saat ASN menginput NIP pada formulir survei.
              </p>
            </div>

            {/* Tombol Unduh Template */}
            <button
              type="button"
              onClick={downloadPegawaiTemplate}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              Unduh Template Excel Pegawai
            </button>
          </div>

          {/* Kotak Upload Excel / CSV */}
          <div className="p-6 rounded-3xl border-2 border-dashed border-blue-300 bg-blue-50/50 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-900 text-amber-400 flex items-center justify-center shadow-md">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900">
                Upload File Excel Data Pegawai (.xlsx, .xls, .csv)
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-0.5">
                Sistem secara otomatis mendeteksi kolom NIP, Nama Lengkap, OPD/Unit Kerja, Jabatan, Tahun Pensiun, dan Usia.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-pegawai-upload"
            />
            <label
              htmlFor="excel-pegawai-upload"
              className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-sm shadow-md cursor-pointer transition inline-flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Pilih Berkas Excel dari Komputer
            </label>

            {importStatus && (
              <div
                className={`p-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 max-w-lg ${
                  importStatus.isError ? 'bg-rose-50 border border-rose-300 text-rose-900' : 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                }`}
              >
                {importStatus.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>

          {/* Tabel Master Pegawai */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari master pegawai berdasarkan NIP, Nama, OPD, Jabatan..."
                  value={searchPegawai}
                  onChange={(e) => {
                    setSearchPegawai(e.target.value);
                    setPegawaiPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-300 text-sm focus:border-blue-800 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                  Total: <strong>{masterPegawai.length.toLocaleString('id-ID')} ASN</strong> (Database Transformers 2026)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Kembalikan ke data pegawai bawaan Database Transformers 2026 (2.700 ASN)?')) {
                      onUpdateMasterPegawai(DEFAULT_MASTER_PEGAWAI);
                      setPegawaiPage(1);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset ke Bawaan ({DEFAULT_MASTER_PEGAWAI.length.toLocaleString('id-ID')})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-blue-950 text-white font-bold">
                  <tr>
                    <th className="p-3">NIP Pegawai</th>
                    <th className="p-3">Nama Lengkap & Gelar</th>
                    <th className="p-3">Perangkat Daerah / OPD</th>
                    <th className="p-3">Jabatan</th>
                    <th className="p-3">Pangkat / Golongan</th>
                    <th className="p-3 text-center">Rencana Pensiun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedPegawai.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                        Tidak ada data pegawai yang cocok dengan kata kunci &quot;{searchPegawai}&quot;.
                      </td>
                    </tr>
                  ) : (
                    paginatedPegawai.map((p, i) => (
                      <tr key={i} className="hover:bg-blue-50/50 transition">
                        <td className="p-3 font-mono font-bold text-blue-950">{p.nip}</td>
                        <td className="p-3 font-bold text-slate-900">{p.nama}</td>
                        <td className="p-3 text-slate-700">{p.unitKerja}</td>
                        <td className="p-3 text-slate-600">{p.jabatan}</td>
                        <td className="p-3 text-slate-600 text-xs">{p.pangkat || p.golongan || '-'}</td>
                        <td className="p-3 text-center font-bold text-slate-700">
                          {p.tahunPensiun ? `Tahun ${p.tahunPensiun}` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPegawaiPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-600">
                  Menampilkan <strong>{((pegawaiPage - 1) * PEGAWAI_PAGE_SIZE) + 1}</strong> -{' '}
                  <strong>{Math.min(pegawaiPage * PEGAWAI_PAGE_SIZE, filteredPegawai.length)}</strong> dari{' '}
                  <strong>{filteredPegawai.length.toLocaleString('id-ID')}</strong> pegawai
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pegawaiPage <= 1}
                    onClick={() => setPegawaiPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-xs font-bold text-blue-950 px-2">
                    Halaman {pegawaiPage} / {totalPegawaiPages}
                  </span>
                  <button
                    type="button"
                    disabled={pegawaiPage >= totalPegawaiPages}
                    onClick={() => setPegawaiPage((p) => Math.min(totalPegawaiPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DATA RESPONDEN */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-5">
          {/* BANNER REAL-TIME SYNC STATUS DENGAN SPREADSHEET */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-white border-2 border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-950">
                    Sinkronisasi Real-Time Google Spreadsheet
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                    {records.length} Responden Terdata
                  </span>
                </div>
                <p className="text-xs text-blue-900/90 font-medium mt-0.5">
                  {lastSyncStatus || 'Tersambung ke Google Sheets. Klik tombol sinkronisasi untuk memuat data responden terbaru secara langsung.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isSyncingRealtime}
              onClick={() => fetchRealtimeFromGoogleSheets(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50 shrink-0"
              title="Tarik seluruh baris responden terbaru dari Google Spreadsheet ke tabel ini secara real-time"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRealtime ? 'animate-spin' : ''}`} />
              {isSyncingRealtime ? 'Menyinkronkan...' : 'Sinkronkan Real-Time Sekarang'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">Daftar Responden Survei ({records.length})</h3>
              <p className="text-xs text-slate-500">Tabel data peserta yang terintegrasi langsung dengan Google Spreadsheet</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Input file upload excel responden */}
              <input
                type="file"
                ref={respondentFileInputRef}
                accept=".xlsx, .xls, .csv"
                onChange={handleUploadRespondentExcel}
                className="hidden"
                id="excel-responden-upload"
              />
              <label
                htmlFor="excel-responden-upload"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-xs cursor-pointer border border-indigo-600"
                title="Impor file Excel (.xlsx) yang diunduh dari Google Spreadsheet ke tabel ini"
              >
                <UploadCloud className="w-4 h-4" /> Impor Excel Responden (.xlsx)
              </label>

              <button
                type="button"
                onClick={() => downloadAllRecordsExcel(records)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer border border-emerald-600"
                title="Unduh 37 kolom lengkap dalam format Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4" /> Unduh Cadangan Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" /> CSV
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Hapus seluruh rekap responden lokal? Pastikan Anda sudah mengunduh cadangan Excel terlebih dahulu.')) saveRecords([]);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Hapus Semua
              </button>
            </div>
          </div>

          {importRespondentStatus && (
            <div
              className={`p-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                importRespondentStatus.isError ? 'bg-rose-50 border border-rose-300 text-rose-900' : 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              }`}
            >
              {importRespondentStatus.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{importRespondentStatus.message}</span>
            </div>
          )}

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-blue-950 text-white font-bold">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Nama Lengkap & NIP</th>
                  <th className="p-3">Instansi / Dinas</th>
                  <th className="p-3">Peminatan Utama</th>
                  <th className="p-3 text-center">Skor</th>
                  <th className="p-3">Status Kesiapan</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                      Belum ada data responden.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-blue-50/50 transition">
                      <td className="p-3 text-slate-500 whitespace-nowrap">{r.timestamp}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{r.data.nama}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{r.data.nip || '-'}</span>
                      </td>
                      <td className="p-3 text-slate-700">
                        <span className="font-semibold block">{r.data.unitKerja}</span>
                        <span className="text-[11px] text-slate-500">{r.data.jabatan}</span>
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-100 text-blue-950 font-bold text-xs">
                          {r.data.prioritasUtama}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-black text-sm text-blue-950">{r.score.totalScore}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            r.score.category === 'Sangat Siap'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : r.score.category === 'Siap'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {r.score.category}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedRespondentDetail(r)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INTEGRASI GOOGLE SHEETS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-800" />
              Integrasi Google Sheets (Google Drive Database)
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Hubungkan formulir kuesioner dengan Google Spreadsheet di Google Drive akun BKPSDM Anda.
            </p>
          </div>

          {/* FITUR CADANGAN & SINKRONISASI ULANG */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-700" />
                  Cadangan Offline & Sinkronisasi Antrean ke Google Sheets
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Tersedia <strong>{records.length} responden</strong> tersimpan aman di memori lokal browser. Anda dapat mengunduhnya dalam format Excel (.xlsx) atau mengirimkan seluruhnya ke Google Sheets.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => downloadAllRecordsExcel(records)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Unduh .xlsx ({records.length})
                </button>
                <button
                  type="button"
                  onClick={handleSyncAllToGoogleSheets}
                  disabled={syncQueueStatus?.running || records.length === 0}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncQueueStatus?.running ? 'animate-spin' : ''}`} />
                  {syncQueueStatus?.running ? `Mengirim (${syncQueueStatus.current}/${syncQueueStatus.total})...` : 'Kirim Antrean ke Sheets'}
                </button>
              </div>
            </div>

            {syncQueueStatus && !syncQueueStatus.running && (
              <div className="text-xs font-bold text-emerald-900 bg-emerald-100 p-2.5 rounded-xl border border-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Proses sinkronisasi selesai: {syncQueueStatus.successCount} terkirim{syncQueueStatus.errorCount > 0 ? `, ${syncQueueStatus.errorCount} gagal` : ''}.</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              URL Webhook Google Apps Script:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 font-mono text-sm focus:border-blue-700 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleSaveUrl}
                className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-sm shadow-xs transition cursor-pointer"
              >
                Simpan URL
              </button>
            </div>
            {saveSuccess && (
              <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> URL Webhook berhasil disimpan!
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testConnStatus === 'testing'}
              className="px-4 py-2.5 rounded-xl border-2 border-blue-800 text-blue-900 font-bold text-xs hover:bg-blue-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {testConnStatus === 'testing' ? 'Menguji Koneksi...' : '1. Uji Sambungan Webhook'}
            </button>

            <button
              type="button"
              onClick={handleSendTestPayload}
              disabled={testSendStatus === 'sending'}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              {testSendStatus === 'sending' ? 'Mengirim Data Contoh...' : '2. Kirim 1 Baris Data Contoh ke Spreadsheet'}
            </button>

            {testConnStatus === 'success' && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Endpoint Apps Script aktif!
              </span>
            )}
            {testConnStatus === 'failed' && (
              <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Gagal menghubungi endpoint. Pastikan izin 'Anyone'.
              </span>
            )}

            {testSendStatus === 'success' && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 flex items-center gap-1 w-full sm:w-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Data contoh terkirim! Silakan cek Google Spreadsheet Anda.
              </span>
            )}
            {testSendStatus === 'failed' && (
              <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-300 flex items-center gap-1 w-full sm:w-auto">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Gagal mengirim data contoh. Cek URL Webhook atau izin deployment.
              </span>
            )}
          </div>

          {/* KOTAK KODE GOOGLE APPS SCRIPT VERSI REAL-TIME */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 border-2 border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider mb-1 border border-amber-500/30">
                  <RefreshCw className="w-3 h-3" /> Kode Apps Script Real-Time (Wajib Di-Deploy)
                </div>
                <h4 className="text-base sm:text-lg font-black text-white">
                  Update Script Google Spreadsheet untuk Integrasi Dua Arah
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Salin seluruh kode di bawah ini, tempel di Google Spreadsheet (<strong>Ekstensi &gt; Apps Script</strong>), lalu Deploy versi baru agar data spreadsheet terkirim real-time ke web ini.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(APPS_SCRIPT_SOURCE);
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 3000);
                }}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2 shrink-0"
              >
                {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedScript ? 'Tersalin ke Clipboard!' : 'Salin Kode Apps Script'}
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-blue-200 overflow-x-auto max-h-60 overflow-y-auto">
              <pre>{APPS_SCRIPT_SOURCE}</pre>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/80 text-xs text-blue-200 space-y-1">
              <span className="font-extrabold text-amber-300 block">Langkah Cepat Update (1 Menit):</span>
              <p>1. Klik tombol <strong>"Salin Kode Apps Script"</strong> di atas.</p>
              <p>2. Buka Spreadsheet Anda &gt; menu <strong>Ekstensi &gt; Apps Script</strong> &gt; hapus isi lama dan tempel kode baru.</p>
              <p>3. Klik ikon <strong>Simpan (Disket)</strong> &gt; klik <strong>Deploy &gt; Manage deployments</strong> &gt; klik ikon <strong>Pensil (Edit)</strong> &gt; pilih Version: <strong>New version</strong> &gt; klik <strong>Deploy</strong>.</p>
              <p>4. Kembali ke tab <strong>Data Responden</strong> dan klik <strong>"Sinkronkan Real-Time Sekarang"</strong>!</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SIMULATOR */}
      {activeTab === 'testing' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-800" />
              Simulator Pengujian Formulir
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Muat profil preset ke formulir untuk menguji perhitungan skor kesiapan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-3">
              <span className="text-3xl block">🌾</span>
              <h4 className="font-bold text-slate-900 text-base">Profil Pertanian</h4>
              <p className="text-xs text-slate-600">Simulasi ASN peminat agribisnis (~88 pt).</p>
              <button
                type="button"
                onClick={() => {
                  onLoadPresetToSurvey('pertanian');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs shadow-xs hover:bg-blue-950 cursor-pointer"
              >
                Muat ke Formulir & Buka
              </button>
            </div>

            <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-3">
              <span className="text-3xl block">🛒</span>
              <h4 className="font-bold text-slate-900 text-base">Profil Grosir</h4>
              <p className="text-xs text-slate-600">Simulasi ASN peminat grosir sembako (~74 pt).</p>
              <button
                type="button"
                onClick={() => {
                  onLoadPresetToSurvey('grosir');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs shadow-xs hover:bg-blue-950 cursor-pointer"
              >
                Muat ke Formulir & Buka
              </button>
            </div>

            <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-3">
              <span className="text-3xl block">🚚</span>
              <h4 className="font-bold text-slate-900 text-base">Profil Ekspedisi</h4>
              <p className="text-xs text-slate-600">Simulasi ASN pemula logistik kurir (~60 pt).</p>
              <button
                type="button"
                onClick={() => {
                  onLoadPresetToSurvey('ekspedisi');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs shadow-xs hover:bg-blue-950 cursor-pointer"
              >
                Muat ke Formulir & Buka
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: DAFTAR NAMA RESPONDEN PEMINAT BIDANG USAHA */}
      {selectedMinatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-950 to-indigo-950 text-white flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold border border-blue-400/30 mb-2">
                  <span>{selectedMinatModal.icon}</span>
                  <span>Bidang Usaha Pilihan</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{selectedMinatModal.icon}</span>
                  <span>{selectedMinatModal.name}</span>
                </h3>
                <p className="text-xs sm:text-sm text-blue-200 mt-1">
                  Daftar nama pegawai ASN yang memilih bidang ini sebagai prioritas utama (Total: <strong>{selectedMinatModal.records.length} Responden</strong>)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMinatModal(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter pencarian dalam modal */}
            {selectedMinatModal.records.length > 0 && (
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder="Cari nama, NIP, atau OPD pemilih di sini..."
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>
            )}

            {/* Konten daftar responden */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {selectedMinatModal.records.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <span className="text-3xl block mb-2">{selectedMinatModal.icon}</span>
                  <p className="font-bold text-slate-700">Belum ada ASN yang memilih bidang ini</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Data akan otomatis bertambah ketika ada responden yang memilih opsi ini pada instrumen survei.
                  </p>
                </div>
              ) : (
                (() => {
                  const filteredPemilih = selectedMinatModal.records.filter((r) => {
                    const q = modalSearchQuery.toLowerCase();
                    return (
                      (r.data.nama || '').toLowerCase().includes(q) ||
                      (r.data.nip || '').toLowerCase().includes(q) ||
                      (r.data.unitKerja || '').toLowerCase().includes(q) ||
                      (r.data.jabatan || '').toLowerCase().includes(q)
                    );
                  });

                  if (filteredPemilih.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-500 text-sm">
                        Tidak ditemukan responden yang cocok dengan pencarian "{modalSearchQuery}".
                      </div>
                    );
                  }

                  return (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                      {filteredPemilih.map((r, idx) => (
                        <div
                          key={r.id || idx}
                          className="p-4 bg-white hover:bg-blue-50/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-black text-slate-900 text-sm">{r.data.nama}</h4>
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                                  NIP: {r.data.nip || '-'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                {r.data.unitKerja} • <span className="text-slate-500">{r.data.jabatan}</span>
                              </p>
                              {r.data.alasanPrioritas && (
                                <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
                                  "{r.data.alasanPrioritas}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <span
                              className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                                r.score.category === 'Sangat Siap'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : r.score.category === 'Siap'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              Skor: {r.score.totalScore} ({r.score.category})
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRespondentDetail(r);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" /> Detail
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan {selectedMinatModal.records.length} ASN peminat {selectedMinatModal.name}
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedMinatModal.records.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const searchWord = selectedMinatModal.name.split(' ')[0] || '';
                      setSearchQuery(searchWord);
                      setActiveTab('records');
                      setSelectedMinatModal(null);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-950 font-bold text-xs transition cursor-pointer"
                  >
                    Buka di Tab Data Responden
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedMinatModal(null)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DETAIL JAWABAN LENGKAP RESPONDEN */}
      {selectedRespondentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Rekam Jawaban Survei ASN</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {selectedRespondentDetail.data.nama}
                </h3>
                <p className="text-xs sm:text-sm text-blue-200 mt-0.5">
                  NIP: <span className="font-mono font-bold text-amber-300">{selectedRespondentDetail.data.nip || '-'}</span> • {selectedRespondentDetail.data.unitKerja}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRespondentDetail(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              {/* Ringkasan Skor */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Hasil Asesmen Kesiapan</span>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-3xl font-black text-blue-950">{selectedRespondentDetail.score.totalScore}/100</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      selectedRespondentDetail.score.category === 'Sangat Siap'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : selectedRespondentDetail.score.category === 'Siap'
                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {selectedRespondentDetail.score.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Prioritas: <strong>{selectedRespondentDetail.score.priorityLevel}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Rekomendasi: <strong>{selectedRespondentDetail.score.recommendation}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadSingleSurveyExcel(selectedRespondentDetail.data, selectedRespondentDetail.score)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Unduh Berkas Excel (.xlsx)
                </button>
              </div>

              {/* Rincian Grid Jawaban */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Identitas */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2 bg-white">
                  <h5 className="font-black text-xs uppercase tracking-wider text-blue-950 border-b border-slate-100 pb-1">
                    A. Identitas & Profil Pegawai
                  </h5>
                  <div className="space-y-1 text-slate-700">
                    <p><strong>Jabatan:</strong> {selectedRespondentDetail.data.jabatan || '-'}</p>
                    <p><strong>Tahun Pensiun:</strong> {selectedRespondentDetail.data.tahunPensiun || '-'}</p>
                    <p><strong>Usia:</strong> {selectedRespondentDetail.data.usia || '-'} Tahun</p>
                    <p><strong>Pendidikan:</strong> {selectedRespondentDetail.data.pendidikan || '-'}</p>
                    <p><strong>Rencana Domisili:</strong> {selectedRespondentDetail.data.domisili || '-'}</p>
                    <p><strong>Waktu Submit:</strong> {selectedRespondentDetail.timestamp}</p>
                  </div>
                </div>

                {/* Peminatan & Keyakinan */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2 bg-white">
                  <h5 className="font-black text-xs uppercase tracking-wider text-blue-950 border-b border-slate-100 pb-1">
                    B. Peminatan & Pengalaman Usaha
                  </h5>
                  <div className="space-y-1 text-slate-700">
                    <p><strong>Peminatan Utama:</strong> <span className="font-bold text-blue-900">{selectedRespondentDetail.data.prioritasUtama || '-'}</span></p>
                    <p><strong>Alasan:</strong> {selectedRespondentDetail.data.alasanPrioritas || '-'}</p>
                    <p><strong>Tingkat Keyakinan:</strong> {selectedRespondentDetail.data.keyakinanUsaha}/5</p>
                    <p><strong>Pengalaman Usaha:</strong> {selectedRespondentDetail.data.pengalamanUsaha || '-'}</p>
                    <p><strong>Keterampilan:</strong> {Array.isArray(selectedRespondentDetail.data.keterampilan) ? selectedRespondentDetail.data.keterampilan.join(', ') : '-'}</p>
                  </div>
                </div>

                {/* Aset & Finansial */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2 bg-white">
                  <h5 className="font-black text-xs uppercase tracking-wider text-blue-950 border-b border-slate-100 pb-1">
                    C. Kesiapan Aset & Modal
                  </h5>
                  <div className="space-y-1 text-slate-700">
                    <p><strong>Aset Dimiliki:</strong> {Array.isArray(selectedRespondentDetail.data.asetTersedia) ? selectedRespondentDetail.data.asetTersedia.join(', ') : '-'}</p>
                    <p><strong>Kepemilikan Lahan:</strong> {selectedRespondentDetail.data.kepemilikanLahan || '-'}</p>
                    <p><strong>Luas Lahan:</strong> {selectedRespondentDetail.data.perkiraanLuasLahan || '-'}</p>
                    <p><strong>Kendaraan:</strong> {Array.isArray(selectedRespondentDetail.data.kendaraanTersedia) ? selectedRespondentDetail.data.kendaraanTersedia.join(', ') : '-'}</p>
                    <p><strong>Modal Pribadi Siap Alokasi:</strong> {selectedRespondentDetail.data.modalPribadi || '-'}</p>
                    <p><strong>Sumber Modal:</strong> {Array.isArray(selectedRespondentDetail.data.sumberModal) ? selectedRespondentDetail.data.sumberModal.join(', ') : '-'}</p>
                  </div>
                </div>

                {/* Waktu & Program BKPSDM */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2 bg-white">
                  <h5 className="font-black text-xs uppercase tracking-wider text-blue-950 border-b border-slate-100 pb-1">
                    D. Waktu & Harapan ke BKPSDM
                  </h5>
                  <div className="space-y-1 text-slate-700">
                    <p><strong>Waktu Harian:</strong> {selectedRespondentDetail.data.waktuHarian || '-'}</p>
                    <p><strong>Model Keterlibatan:</strong> {selectedRespondentDetail.data.modelKeterlibatan || '-'}</p>
                    <p><strong>Kesediaan Pelatihan:</strong> {selectedRespondentDetail.data.kesediaanPelatihan}/5</p>
                    <p><strong>Topik Pelatihan:</strong> {Array.isArray(selectedRespondentDetail.data.topikPelatihan) ? selectedRespondentDetail.data.topikPelatihan.join(', ') : '-'}</p>
                    <p><strong>Bentuk Pendampingan:</strong> {Array.isArray(selectedRespondentDetail.data.bentukPendampingan) ? selectedRespondentDetail.data.bentukPendampingan.join(', ') : '-'}</p>
                    <p><strong>Kendala Terbesar:</strong> {Array.isArray(selectedRespondentDetail.data.kendalaTerbesar) ? selectedRespondentDetail.data.kendalaTerbesar.join(', ') : '-'}</p>
                    <p><strong>Harapan ke BKPSDM:</strong> {selectedRespondentDetail.data.harapanBKPSDM || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRespondentDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
