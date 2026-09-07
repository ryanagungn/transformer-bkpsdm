import React from 'react';
import { ScoringResult, SurveyData } from '../types/survey';
import {
  Printer,
  RotateCcw,
  Sparkles,
  Check,
  CheckCircle2,
  ThumbsUp,
  FileText
} from 'lucide-react';

interface Props {
  result: ScoringResult;
  data: SurveyData;
  syncStatus: 'idle' | 'saving' | 'synced' | 'local_only' | 'error';
  syncMessage: string;
  onReset: () => void;
}

export const ResultCard: React.FC<Props> = ({
  result,
  data,
  syncStatus,
  syncMessage,
  onReset
}) => {
  const handlePrint = () => {
    window.print();
  };

  const getScoreBadge = () => {
    switch (result.category) {
      case 'Sangat Siap':
        return {
          bg: 'bg-blue-100 border-blue-400 text-blue-950',
          badgeText: '🌟 SANGAT SIAP MEMULAI USAHA',
          tagline: 'Prioritas Utama Inkubasi Usaha & Fasilitasi Kemitraan'
        };
      case 'Siap':
        return {
          bg: 'bg-indigo-100 border-indigo-400 text-indigo-950',
          badgeText: '👍 SIAP MEMULAI USAHA',
          tagline: 'Perlu Penguatan Terarah pada Manajemen & Pemasaran'
        };
      case 'Potensial':
        return {
          bg: 'bg-amber-100 border-amber-400 text-amber-950',
          badgeText: '💡 POTENSIAL & BERPROSPEK',
          tagline: 'Perlu Pembekalan Wirausaha Intensif & Studi Kelayakan'
        };
      default:
        return {
          bg: 'bg-slate-100 border-slate-400 text-slate-900',
          badgeText: '🌱 TAHAP PERSIAPAN AWAL',
          tagline: 'Fokus Orientasi Motivasi & Pemantapan Rencana'
        };
    }
  };

  const badgeInfo = getScoreBadge();

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* KARTU RESMI HASIL ASESMEN */}
      <div className="bg-white rounded-3xl border-3 border-blue-900/30 overflow-hidden shadow-xl print:shadow-none print:border-2 print:border-slate-800">
        {/* Banner Kop Surat dengan Logo Transformer */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 text-center relative border-b-4 border-amber-400">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 p-1.5 backdrop-blur-xs border border-white/20 shadow-inner flex items-center justify-center">
              <img
                src="/logo_transformer.png"
                alt="Logo Transformer BKPSDM"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-amber-300 text-xs sm:text-sm font-extrabold tracking-wide mb-2 border border-white/20">
            <Sparkles className="w-4 h-4" />
            Laporan Hasil Asesmen Mandiri Kewirausahaan ASN
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Kartu Hasil Kesiapan Usaha Pra-Pensiun
          </h1>
          <p className="text-blue-200 text-sm sm:text-base mt-2 max-w-xl mx-auto font-medium">
            Badan Kepegawaian dan Pengembangan Sumber Daya Manusia (BKPSDM)
          </p>
        </div>

        {/* Ringkasan Identitas Pegawai */}
        <div className="px-6 sm:px-8 py-5 bg-blue-50/60 border-b-2 border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm sm:text-base">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Nama Lengkap:</span>
            <span className="font-extrabold text-slate-900 text-lg sm:text-xl block mt-0.5">{data.nama || '-'}</span>
            {data.nip && <span className="text-xs text-slate-600 font-mono">NIP: {data.nip}</span>}
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Unit Kerja / Instansi:</span>
            <span className="font-bold text-slate-900 text-base sm:text-lg block mt-0.5">{data.unitKerja || '-'}</span>
            <span className="text-xs text-slate-600">{data.jabatan}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Tahun Rencana Pensiun:</span>
            <span className="font-extrabold text-blue-900 text-lg sm:text-xl block mt-0.5">
              {data.tahunPensiun ? `Tahun ${data.tahunPensiun}` : '-'}
            </span>
            <span className="text-xs text-slate-600">Usia: {data.usia} Tahun</span>
          </div>
        </div>

        {/* Status Pengiriman Data (Bersih untuk Responden) */}
        <div className="px-6 sm:px-8 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-bold text-slate-800">Status Data:</span>
            <span className="inline-flex items-center gap-1 text-emerald-900 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-md">
              ✓ Data Survei Berhasil Diterima oleh Sistem BKPSDM
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Status: Selesai (100%)
          </span>
        </div>

        {/* BODY HASIL ASESMEN */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Kotak Nilai Skor Utama */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white border-2 border-blue-200 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* Lingkaran Skor dengan Warna Biru Logo */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center bg-white shadow-lg border-6 border-blue-800 text-blue-950 shrink-0">
                <span className="text-4xl sm:text-5xl font-black">{result.totalScore}</span>
                <span className="text-xs font-black text-slate-500 tracking-wider">DARI 100</span>
              </div>
              <div>
                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-black border-2 ${badgeInfo.bg}`}>
                  {badgeInfo.badgeText}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  {result.interpretation}
                </h2>
                <p className="text-base sm:text-lg text-blue-950 font-bold mt-1">
                  Bidang Usaha Pilihan: <span className="underline decoration-amber-500 decoration-4">{data.prioritasUtama || 'Umum'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Rekomendasi Program BKPSDM */}
          <div className="p-6 rounded-3xl bg-blue-900 text-white shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                <ThumbsUp className="w-4 h-4" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Rekomendasi Tindak Lanjut untuk Bapak/Ibu:
              </h3>
            </div>
            <p className="text-base sm:text-lg text-blue-100 leading-relaxed pl-10 font-medium">
              {result.recommendation}
            </p>
          </div>

          {/* Rincian 7 Dimensi Kesiapan */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-800" />
              Rincian Kesiapan per Aspek (7 Dimensi):
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.dimensions.map((dim, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-base text-slate-900">{dim.name}</span>
                    <span className="text-sm font-black text-blue-900 bg-blue-100 px-2.5 py-1 rounded-lg">
                      {dim.score} / {dim.maxScore} pts ({dim.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        dim.percentage >= 75
                          ? 'bg-blue-800'
                          : dim.percentage >= 50
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${dim.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Keterangan: {dim.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tombol Cetak / Selesai */}
        <div className="px-6 sm:px-8 py-6 bg-slate-100 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl border-2 border-slate-300 text-slate-800 font-bold hover:bg-slate-200 transition text-base cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-5 h-5" />
            Isi Formulir Baru
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-blue-950 hover:bg-blue-900 text-white font-extrabold transition text-base sm:text-lg shadow-lg cursor-pointer"
          >
            <Printer className="w-6 h-6 text-amber-300" />
            Cetak / Simpan Sebagai PDF
          </button>
        </div>
      </div>
    </div>
  );
};
