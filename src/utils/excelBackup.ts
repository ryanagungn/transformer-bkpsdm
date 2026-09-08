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

// 3. Parser Berkas Excel Responden (Impor dari Google Spreadsheet atau Cadangan .xlsx)
export async function parseRespondentExcel(file: File): Promise<RespondentRecord[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames.find((n) => n.toLowerCase().includes('responden')) || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (!rawRows || rawRows.length <= 1) {
    throw new Error('File Excel tidak berisi baris data responden.');
  }

  const records: RespondentRecord[] = [];
  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row[1] && !row[2]) continue;

    const totalScore = Number(row[32]) || 0;
    const category = String(row[33] || 'Potensial');
    const color = totalScore >= 80 ? 'emerald' : totalScore >= 65 ? 'blue' : totalScore >= 50 ? 'amber' : 'slate';

    records.push({
      id: `EXCEL-${Date.now()}-${i}`,
      timestamp: String(row[0] || new Date().toLocaleString('id-ID')),
      data: {
        nama: String(row[1] || '-'),
        nip: String(row[2] || '-'),
        unitKerja: String(row[3] || '-'),
        jabatan: String(row[4] || '-'),
        tahunPensiun: String(row[5] || '-'),
        usia: String(row[6] || '-'),
        pendidikan: String(row[7] || '-'),
        domisili: String(row[8] || '-'),
        pengalamanUsaha: String(row[9] || '-'),
        bidangPernahDijalankan: row[10] ? String(row[10]).split(', ') : [],
        keterampilan: row[11] ? String(row[11]).split(', ') : [],
        bidangDiminati: row[12] ? String(row[12]).split(', ') : [],
        prioritasUtama: String(row[13] || '-'),
        alasanPrioritas: String(row[14] || '-'),
        keyakinanUsaha: Number(row[15]) || 0,
        asetTersedia: row[17] ? String(row[17]).split(', ') : [],
        kepemilikanLahan: String(row[18] || '-'),
        perkiraanLuasLahan: String(row[19] || '-'),
        kendaraanTersedia: row[20] ? String(row[20]).split(', ') : [],
        modalPribadi: String(row[21] || '-'),
        sumberModal: row[22] ? String(row[22]).split(', ') : [],
        tambahModal: String(row[23] || '-'),
        waktuHarian: String(row[24] || '-'),
        modelKeterlibatan: String(row[25] || '-'),
        kesediaanPelatihan: Number(row[26]) || 0,
        topikPelatihan: row[27] ? String(row[27]).split(', ') : [],
        bentukPendampingan: row[28] ? String(row[28]).split(', ') : [],
        kesediaanPendampingan: String(row[29] || '-'),
        kendalaTerbesar: row[30] ? String(row[30]).split(', ') : [],
        harapanBKPSDM: String(row[31] || '-')
      },
      score: {
        totalScore,
        category,
        interpretation: String(row[34] || '-'),
        priorityLevel: (row[35] || 'Sedang') as any,
        recommendation: String(row[36] || '-'),
        color,
        dimensions: []
      }
    });
  }

  return records;
}
