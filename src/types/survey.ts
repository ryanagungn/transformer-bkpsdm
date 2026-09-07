export interface SurveyData {
  // Bagian A: Identitas
  nama: string;
  nip: string;
  unitKerja: string;
  jabatan: string;
  tahunPensiun: string;
  usia: string;
  pendidikan: string;
  domisili: string;

  // Bagian B: Pengalaman
  pengalamanUsaha: string;
  bidangPernahDijalankan: string[];
  keterampilan: string[];

  // Bagian C: Peminatan
  bidangDiminati: string[]; // Maksimal 3
  prioritasUtama: string;
  alasanPrioritas: string;
  keyakinanUsaha: number; // Skala 1-5

  // Bagian H-O: Pendalaman Sektor Khusus (Dynamic Branching)
  khususPertanian?: string[];
  khususPerikanan?: string[];
  khususPerkebunan?: string[];
  khususPeternakan?: string[];
  khususEkspedisi?: string[];
  khususGrosir?: string[];
  khususCuciKendaraan?: string[];
  khususLainnya?: string[];

  // Bagian D: Aset
  asetTersedia: string[];
  kepemilikanLahan: string;
  perkiraanLuasLahan: string;
  kendaraanTersedia: string[];

  // Bagian E: Modal
  modalPribadi: string;
  sumberModal: string[];
  tambahModal: string;

  // Bagian F: Waktu & Model Keterlibatan
  waktuHarian: string;
  modelKeterlibatan: string;

  // Bagian G: Kesiapan Belajar & Pendampingan
  kesediaanPelatihan: number; // Skala 1-5
  topikPelatihan: string[];
  bentukPendampingan: string[];
  kesediaanPendampingan: string; // Ya, Pertimbangkan, Tidak

  // Bagian P: Penutup
  kendalaTerbesar: string[];
  harapanBKPSDM: string;
}

export interface DimensionScore {
  name: string;
  score: number;
  maxScore: number;
  weightPercent: number;
  percentage: number;
  notes: string;
}

export interface ScoringResult {
  totalScore: number;
  category: string;
  interpretation: string;
  recommendation: string;
  priorityLevel: 'Tinggi' | 'Sedang' | 'Bimbingan Awal';
  color: string;
  dimensions: DimensionScore[];
}
