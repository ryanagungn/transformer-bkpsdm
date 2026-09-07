import * as XLSX from 'xlsx';
import { SurveyData, ScoringResult } from '../types/survey';

export interface RespondentRecord {
  id: string;
  timestamp: string;
  data: SurveyData;
  score: ScoringResult;
  syncedToGoogleSheets?: boolean;
}

export const EXCEL_SURVEY_HEADERS = [
  'Waktu Submit',
  'Nama Lengkap',
  'NIP/NIK',
  'Perangkat Daerah / Unit Kerja',
  'Jabatan Terakhir',
  'Tahun Pensiun',
  'Usia',
  'Pendidikan Terakhir',
  'Rencana Domisili',
  'Pengalaman Usaha',
  'Bidang Usaha Pernah/Sedang',
  'Keterampilan Dimiliki',
  '3 Bidang Paling Diminati',
  'Prioritas Usaha Utama (MINAT_UTAMA)',
  'Alasan Memilih Prioritas',
  'Keyakinan Usaha (1-5)',
  'Detail Subsektor Pilihan',
  'Aset Tersedia',
  'Kepemilikan Lahan',
  'Perkiraan Luas Lahan',
  'Kendaraan Tersedia',
  'Modal Pribadi Siap Alokasi',
  'Sumber Modal Rencana',
  'Bersedia Tambah Modal',
  'Waktu Harian untuk Usaha',
  'Model Keterlibatan',
  'Kesediaan Pelatihan (1-5)',
  'Topik Pelatihan Dibutuhkan',
  'Bentuk Pendampingan Dibutuhkan',
  'Komitmen Pendampingan 6-12 Bln',
  'Kendala Terbesar',
  'Harapan terhadap BKPSDM',
  'TOTAL SKOR (0-100)',
  'Kategori Kesiapan',
  'Interpretasi Hasil',
  'Tingkat Prioritas',
  'Rekomendasi Program'
];

export function formatSurveyRow(data: SurveyData, score: ScoringResult, timestamp: string = new Date().toLocaleString('id-ID')): any[] {
  const detailSubsektor = [
    data.khususPertanian && data.khususPertanian.length > 0 ? `Pertanian: ${data.khususPertanian.join(', ')}` : '',
    data.khususPerikanan && data.khususPerikanan.length > 0 ? `Perikanan: ${data.khususPerikanan.join(', ')}` : '',
    data.khususPerkebunan && data.khususPerkebunan.length > 0 ? `Perkebunan: ${data.khususPerkebunan.join(', ')}` : '',
    data.khususPeternakan && data.khususPeternakan.length > 0 ? `Peternakan: ${data.khususPeternakan.join(', ')}` : '',
    data.khususEkspedisi && data.khususEkspedisi.length > 0 ? `Ekspedisi: ${data.khususEkspedisi.join(', ')}` : '',
    data.khususGrosir && data.khususGrosir.length > 0 ? `Grosir: ${data.khususGrosir.join(', ')}` : '',
    data.khususCuciKendaraan && data.khususCuciKendaraan.length > 0 ? `Cuci: ${data.khususCuciKendaraan.join(', ')}` : '',
    data.khususLainnya && data.khususLainnya.length > 0 ? `Lainnya: ${data.khususLainnya.join(', ')}` : ''
  ].filter(Boolean).join(' | ');

  return [
    timestamp,
    data.nama || '-',
    data.nip || '-',
    data.unitKerja || '-',
    data.jabatan || '-',
    data.tahunPensiun || '-',
    data.usia || '-',
    data.pendidikan || '-',
    data.domisili || '-',
    data.pengalamanUsaha || '-',
    Array.isArray(data.bidangPernahDijalankan) ? data.bidangPernahDijalankan.join(', ') : '-',
    Array.isArray(data.keterampilan) ? data.keterampilan.join(', ') : '-',
    Array.isArray(data.bidangDiminati) ? data.bidangDiminati.join(', ') : '-',
    data.prioritasUtama || '-',
    data.alasanPrioritas || '-',
    data.keyakinanUsaha || '-',
    detailSubsektor || '-',
    Array.isArray(data.asetTersedia) ? data.asetTersedia.join(', ') : '-',
    data.kepemilikanLahan || '-',
    data.perkiraanLuasLahan || '-',
    Array.isArray(data.kendaraanTersedia) ? data.kendaraanTersedia.join(', ') : '-',
    data.modalPribadi || '-',
    Array.isArray(data.sumberModal) ? data.sumberModal.join(', ') : '-',
    data.tambahModal || '-',
    data.waktuHarian || '-',
    data.modelKeterlibatan || '-',
    data.kesediaanPelatihan || '-',
    Array.isArray(data.topikPelatihan) ? data.topikPelatihan.join(', ') : '-',
    Array.isArray(data.bentukPendampingan) ? data.bentukPendampingan.join(', ') : '-',
    data.kesediaanPendampingan || '-',
    Array.isArray(data.kendalaTerbesar) ? data.kendalaTerbesar.join(', ') : '-',
    data.harapanBKPSDM || '-',
    score ? score.totalScore : 0,
    score ? score.category : '-',
    score ? score.interpretation : '-',
    score ? score.priorityLevel : '-',
    score ? score.recommendation : '-'
  ];
}

// 1. Ekspor Cadangan Seluruh Responden (Admin)
export function downloadAllRecordsExcel(records: RespondentRecord[]) {
  if (!records || records.length === 0) {
    alert('Belum ada data responden untuk diekspor.');
    return;
  }

  const rows = records.map((r) => formatSurveyRow(r.data, r.score, r.timestamp));
  const ws = XLSX.utils.aoa_to_sheet([EXCEL_SURVEY_HEADERS, ...rows]);

  ws['!cols'] = EXCEL_SURVEY_HEADERS.map((_, i) => ({
    wch: i === 1 ? 30 : i === 3 ? 35 : i === 4 ? 30 : i === 14 ? 35 : i === 16 ? 40 : 20
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data_Responden');
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Cadangan_Database_Responden_BKPSDM_${dateStr}.xlsx`);
}

// 2. Ekspor Hasil Mandiri untuk Responden (ResultCard)
export function downloadSingleSurveyExcel(data: SurveyData, score: ScoringResult) {
  const row = formatSurveyRow(data, score);
  const ws = XLSX.utils.aoa_to_sheet([EXCEL_SURVEY_HEADERS, row]);

  ws['!cols'] = EXCEL_SURVEY_HEADERS.map((_, i) => ({
    wch: i === 1 ? 30 : i === 3 ? 35 : i === 4 ? 30 : i === 14 ? 35 : i === 16 ? 40 : 20
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Hasil_Asesmen');
  const cleanNip = (data.nip || 'ASN').replace(/\s+/g, '');
  XLSX.writeFile(wb, `Hasil_Survei_Prapensiun_${cleanNip}.xlsx`);
}
