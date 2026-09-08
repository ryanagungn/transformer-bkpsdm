import { SurveyData, ScoringResult, DimensionScore } from '../types/survey';

export function calculateSurveyScore(data: SurveyData): ScoringResult {
  // 1. DIMENSI MINAT USAHA (Bobot 25%)
  let scoreMinat = 0;
  if (data.prioritasUtama && data.prioritasUtama.trim() !== '') {
    scoreMinat += 10;
  }
  const yakin = Number(data.keyakinanUsaha) || 3;
  scoreMinat += (yakin / 5) * 15;
  scoreMinat = Math.min(25, Math.round(scoreMinat * 10) / 10);

  // 2. DIMENSI KOMPETENSI / PENGALAMAN (Bobot 15%)
  let scoreKompetensi = 0;
  const peng = data.pengalamanUsaha || '';
  if (peng.includes('aktif')) {
    scoreKompetensi += 9;
  } else if (peng.includes('kecil')) {
    scoreKompetensi += 7;
  } else if (peng.includes('berhenti')) {
    scoreKompetensi += 4;
  } else {
    scoreKompetensi += 2;
  }
  const skillCount = data.keterampilan ? data.keterampilan.length : 0;
  scoreKompetensi += Math.min(6, skillCount * 1.5);
  scoreKompetensi = Math.min(15, Math.round(scoreKompetensi * 10) / 10);

  // 3. DIMENSI ASET & LAHAN (Bobot 15%)
  let scoreAset = 0;
  const lahan = data.kepemilikanLahan || '';
  if (lahan.includes('sendiri')) {
    scoreAset += 8;
  } else if (lahan.includes('keluarga')) {
    scoreAset += 6;
  } else if (lahan.includes('menyewa')) {
    scoreAset += 4;
  } else {
    scoreAset += 2;
  }

  const validAset = (data.asetTersedia || []).filter(
    (a) => !a.toLowerCase().includes('tidak ada')
  );
  scoreAset += Math.min(7, validAset.length * 2.5);
  scoreAset = Math.min(15, Math.round(scoreAset * 10) / 10);

  // 4. DIMENSI MODAL (Bobot 15%)
  // Karena pertanyaan modal dihapus dari form isian responden, dialokasikan skor kesiapan standar (12/15)
  // yang diakomodasi melalui fasilitas Tabungan Hari Tua (THT)/Taspen dan program fasilitasi BKPSDM.
  const scoreModal = 12;

  // 5. DIMENSI ALOKASI WAKTU & MODEL PENGELOLAAN (Bobot 10%)
  let scoreWaktu = 0;
  const model = data.modelKeterlibatan || '';
  if (
    model.includes('sendiri') ||
    model.includes('keluarga') ||
    model.includes('pasangan')
  ) {
    scoreWaktu += 10;
  } else if (model.includes('karyawan') || model.includes('Bermitra')) {
    scoreWaktu += 8;
  } else if (model) {
    scoreWaktu += 6;
  } else {
    scoreWaktu += 5;
  }
  scoreWaktu = Math.min(10, Math.round(scoreWaktu * 10) / 10);

  // 6. DIMENSI KESIAPAN BELAJAR / PELATIHAN (Bobot 10%)
  const latih = Number(data.kesediaanPelatihan) || 3;
  let scoreBelajar = (latih / 5) * 10;
  scoreBelajar = Math.min(10, Math.round(scoreBelajar * 10) / 10);

  // 7. DIMENSI KESIAPAN PENDAMPINGAN (Bobot 10%)
  let scorePendampingan = 0;
  const damping = data.kesediaanPendampingan || '';
  if (damping.includes('sangat bersedia') || damping === 'Ya') {
    scorePendampingan = 10;
  } else if (damping.includes('Mempertimbangkan') || damping.includes('Pertimbangkan')) {
    scorePendampingan = 6.5;
  } else {
    scorePendampingan = 3;
  }

  // TOTAL SCORE
  const totalScore = Math.round(
    scoreMinat +
    scoreKompetensi +
    scoreAset +
    scoreModal +
    scoreWaktu +
    scoreBelajar +
    scorePendampingan
  );

  const dimensions: DimensionScore[] = [
    {
      name: 'Minat & Keyakinan Usaha',
      score: scoreMinat,
      maxScore: 25,
      weightPercent: 25,
      percentage: Math.round((scoreMinat / 25) * 100),
      notes: `${data.prioritasUtama || 'Belum dipilih'} (Keyakinan: ${yakin}/5)`
    },
    {
      name: 'Kompetensi & Pengalaman',
      score: scoreKompetensi,
      maxScore: 15,
      weightPercent: 15,
      percentage: Math.round((scoreKompetensi / 15) * 100),
      notes: `${data.pengalamanUsaha || '-'} (${skillCount} keahlian relevan)`
    },
    {
      name: 'Ketersediaan Aset & Lahan',
      score: scoreAset,
      maxScore: 15,
      weightPercent: 15,
      percentage: Math.round((scoreAset / 15) * 100),
      notes: `Lahan: ${data.kepemilikanLahan || '-'}, ${validAset.length} aset produktif`
    },
    {
      name: 'Kapasitas Modal Finansial',
      score: scoreModal,
      maxScore: 15,
      weightPercent: 15,
      percentage: Math.round((scoreModal / 15) * 100),
      notes: `Standar alokasi prapensiun & fasilitas BKPSDM`
    },
    {
      name: 'Alokasi Waktu & Pengelolaan',
      score: scoreWaktu,
      maxScore: 10,
      weightPercent: 10,
      percentage: Math.round((scoreWaktu / 10) * 100),
      notes: `${data.modelKeterlibatan || 'Pengelolaan mandiri'}`
    },
    {
      name: 'Kesiapan Belajar / Pelatihan',
      score: scoreBelajar,
      maxScore: 10,
      weightPercent: 10,
      percentage: Math.round((scoreBelajar / 10) * 100),
      notes: `Komitmen pelatihan: ${latih}/5`
    },
    {
      name: 'Kesiapan Pendampingan',
      score: scorePendampingan,
      maxScore: 10,
      weightPercent: 10,
      percentage: Math.round((scorePendampingan / 10) * 100),
      notes: data.kesediaanPendampingan || '-'
    }
  ];

  let category = '';
  let interpretation = '';
  let recommendation = '';
  let priorityLevel: 'Tinggi' | 'Sedang' | 'Bimbingan Awal' = 'Sedang';
  let color = 'emerald';

  if (totalScore >= 80) {
    category = 'Sangat Siap';
    interpretation = 'Prioritas Inkubasi & Kemitraan Strategis';
    recommendation =
      'Bapak/Ibu memiliki profil kesiapan wirausaha yang matang, baik dari sisi minat, kesiapan aset, maupun komitmen pendampingan. BKPSDM merekomendasikan Anda untuk langsung masuk ke kelompok inkubasi percepatan usaha dan fasilitasi kemitraan pasar/investasi.';
    priorityLevel = 'Tinggi';
    color = 'emerald';
  } else if (totalScore >= 65) {
    category = 'Siap';
    interpretation = 'Perlu Penguatan Terarah';
    recommendation =
      'Bapak/Ibu telah memiliki dasar yang solid untuk memulai usaha. Program yang disarankan adalah penguatan terarah pada aspek teknis komoditas pilihan dan strategi manajemen keuangan/pemasaran sebelum resmi purna tugas.';
    priorityLevel = 'Tinggi';
    color = 'blue';
  } else if (totalScore >= 50) {
    category = 'Potensial';
    interpretation = 'Perlu Pembekalan Intensif';
    recommendation =
      'Bapak/Ibu memiliki potensi dan minat yang baik, namun membutuhkan bimbingan teknis, penyusunan rencana bisnis (business plan), serta pemantapan model keterlibatan agar terhindar dari risiko spekulatif.';
    priorityLevel = 'Sedang';
    color = 'amber';
  } else {
    category = 'Belum Siap';
    interpretation = 'Fokus Orientasi & Asesmen Lanjutan';
    recommendation =
      'Bapak/Ibu disarankan untuk mengikuti seminar motivasi dan wawasan kewirausahaan terlebih dahulu untuk membangun keyakinan serta menemukan model usaha yang paling realistis sesuai kapasitas pribadi.';
    priorityLevel = 'Bimbingan Awal';
    color = 'slate';
  }

  return {
    totalScore,
    category,
    interpretation,
    recommendation,
    priorityLevel,
    color,
    dimensions
  };
}
