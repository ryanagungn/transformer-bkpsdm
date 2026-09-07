import { SurveyData, ScoringResult, DimensionScore } from '../types/survey';

export function calculateSurveyScore(data: SurveyData): ScoringResult {
  // 1. DIMENSI MINAT USAHA (Bobot 25%)
  // Komponen: Pilihan prioritas utama (+10) + Keyakinan usaha 1-5 (+3 per skala, maks 15)
  let scoreMinat = 0;
  if (data.prioritasUtama && data.prioritasUtama.trim() !== '') {
    scoreMinat += 10;
  }
  const yakin = Number(data.keyakinanUsaha) || 3;
  scoreMinat += (yakin / 5) * 15;
  scoreMinat = Math.min(25, Math.round(scoreMinat * 10) / 10);

  // 2. DIMENSI KOMPETENSI / PENGALAMAN (Bobot 15%)
  // Komponen: Pengalaman usaha (0-9) + Jumlah keterampilan relevan (0-6)
  let scoreKompetensi = 0;
  if (data.pengalamanUsaha.includes('aktif')) {
    scoreKompetensi += 9;
  } else if (data.pengalamanUsaha.includes('kecil')) {
    scoreKompetensi += 7;
  } else if (data.pengalamanUsaha.includes('berhenti')) {
    scoreKompetensi += 4;
  } else {
    scoreKompetensi += 1;
  }
  const skillCount = data.keterampilan ? data.keterampilan.length : 0;
  scoreKompetensi += Math.min(6, skillCount * 1.5);
  scoreKompetensi = Math.min(15, Math.round(scoreKompetensi * 10) / 10);

  // 3. DIMENSI ASET (Bobot 15%)
  // Komponen: Lahan (0-6) + Aset produktif (0-6) + Kendaraan (0-3)
  let scoreAset = 0;
  if (data.kepemilikanLahan.includes('sendiri')) {
    scoreAset += 6;
  } else if (data.kepemilikanLahan.includes('keluarga')) {
    scoreAset += 4;
  } else if (data.kepemilikanLahan.includes('menyewa')) {
    scoreAset += 3;
  } else {
    scoreAset += 1;
  }

  const validAset = (data.asetTersedia || []).filter(
    (a) => !a.toLowerCase().includes('tidak ada')
  );
  scoreAset += Math.min(6, validAset.length * 1.5);

  const validKendaraan = (data.kendaraanTersedia || []).filter(
    (k) => !k.toLowerCase().includes('tidak ada')
  );
  scoreAset += Math.min(3, validKendaraan.length * 1.5);
  scoreAset = Math.min(15, Math.round(scoreAset * 10) / 10);

  // 4. DIMENSI MODAL (Bobot 15%)
  // Komponen: Kisaran modal (0-11) + Kesediaan tambah modal (0-4)
  let scoreModal = 0;
  if (data.modalPribadi.includes('> Rp500')) {
    scoreModal += 11;
  } else if (data.modalPribadi.includes('250 - 500')) {
    scoreModal += 10;
  } else if (data.modalPribadi.includes('100 - 250')) {
    scoreModal += 9;
  } else if (data.modalPribadi.includes('50 - 100')) {
    scoreModal += 7.5;
  } else if (data.modalPribadi.includes('25 - 50')) {
    scoreModal += 6;
  } else if (data.modalPribadi.includes('10 - 25')) {
    scoreModal += 4.5;
  } else if (data.modalPribadi.includes('< Rp10')) {
    scoreModal += 3;
  } else {
    scoreModal += 2;
  }

  if (data.tambahModal.includes('Ya')) {
    scoreModal += 4;
  } else if (data.tambahModal.includes('Tergantung')) {
    scoreModal += 2.5;
  } else {
    scoreModal += 1;
  }
  scoreModal = Math.min(15, Math.round(scoreModal * 10) / 10);

  // 5. DIMENSI WAKTU & MODEL KETERLIBATAN (Bobot 10%)
  // Komponen: Waktu harian (0-6) + Model keterlibatan (0-4)
  let scoreWaktu = 0;
  if (data.waktuHarian.includes('> 8') || data.waktuHarian.includes('Fleksibel')) {
    scoreWaktu += 6;
  } else if (data.waktuHarian.includes('6 - 8')) {
    scoreWaktu += 5.5;
  } else if (data.waktuHarian.includes('4 - 6')) {
    scoreWaktu += 4.5;
  } else if (data.waktuHarian.includes('2 - 4')) {
    scoreWaktu += 3.5;
  } else {
    scoreWaktu += 2;
  }

  if (
    data.modelKeterlibatan.includes('sendiri') ||
    data.modelKeterlibatan.includes('keluarga') ||
    data.modelKeterlibatan.includes('pasangan')
  ) {
    scoreWaktu += 4;
  } else if (data.modelKeterlibatan.includes('karyawan') || data.modelKeterlibatan.includes('Bermitra')) {
    scoreWaktu += 3;
  } else {
    scoreWaktu += 1.5;
  }
  scoreWaktu = Math.min(10, Math.round(scoreWaktu * 10) / 10);

  // 6. DIMENSI KESIAPAN BELAJAR / PELATIHAN (Bobot 10%)
  const latih = Number(data.kesediaanPelatihan) || 3;
  let scoreBelajar = (latih / 5) * 10;
  scoreBelajar = Math.min(10, Math.round(scoreBelajar * 10) / 10);

  // 7. DIMENSI KESIAPAN PENDAMPINGAN (Bobot 10%)
  let scorePendampingan = 0;
  if (data.kesediaanPendampingan.includes('sangat bersedia') || data.kesediaanPendampingan === 'Ya') {
    scorePendampingan = 10;
  } else if (data.kesediaanPendampingan.includes('Mempertimbangkan') || data.kesediaanPendampingan.includes('Pertimbangkan')) {
    scorePendampingan = 6.5;
  } else {
    scorePendampingan = 2;
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
      notes: `${data.pengalamanUsaha} (${skillCount} keahlian relevan)`
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
      notes: `Alokasi: ${data.modalPribadi}`
    },
    {
      name: 'Alokasi Waktu & Pengelolaan',
      score: scoreWaktu,
      maxScore: 10,
      weightPercent: 10,
      percentage: Math.round((scoreWaktu / 10) * 100),
      notes: `${data.waktuHarian}, ${data.modelKeterlibatan}`
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
      notes: data.kesediaanPendampingan
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
      'Bapak/Ibu memiliki profil kesiapan wirausaha yang matang, baik dari sisi minat, permodalan, aset, maupun komitmen. BKPSDM merekomendasikan Anda untuk langsung masuk ke kelompok inkubasi percepatan usaha dan fasilitasi kemitraan pasar/investasi.';
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
