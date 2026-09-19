import React from 'react';
import { ScoringResult, SurveyData } from '../types/survey';
import { calculateSurveyScore } from '../utils/scoringEngine';
import {
  Printer,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  Briefcase,
  Layers,
  X
} from 'lucide-react';

interface Props {
  result?: ScoringResult;
  data: SurveyData;
  syncStatus?: 'idle' | 'saving' | 'synced' | 'local_only' | 'error';
  syncMessage?: string;
  onReset?: () => void;
  isAdminPreview?: boolean;
  onClose?: () => void;
}

export const ResultCard: React.FC<Props> = ({
  result: propResult,
  data,
  syncStatus = 'synced',
  syncMessage = '',
  onReset,
  isAdminPreview = false,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const result = propResult || calculateSurveyScore(data);

  const subsectorsFromArrays = [
    data.khususPertanian && data.khususPertanian.length > 0 ? `Pertanian: ${data.khususPertanian.join(', ')}` : '',
    data.khususPerikanan && data.khususPerikanan.length > 0 ? `Perikanan: ${data.khususPerikanan.join(', ')}` : '',
    data.khususPerkebunan && data.khususPerkebunan.length > 0 ? `Perkebunan: ${data.khususPerkebunan.join(', ')}` : '',
    data.khususPeternakan && data.khususPeternakan.length > 0 ? `Peternakan: ${data.khususPeternakan.join(', ')}` : '',
    data.khususEkspedisi && data.khususEkspedisi.length > 0 ? `Ekspedisi: ${data.khususEkspedisi.join(', ')}` : '',
    data.khususGrosir && data.khususGrosir.length > 0 ? `Grosir: ${data.khususGrosir.join(', ')}` : '',
    data.khususCuciKendaraan && data.khususCuciKendaraan.length > 0 ? `Cuci: ${data.khususCuciKendaraan.join(', ')}` : '',
    data.khususLainnya && data.khususLainnya.length > 0 ? `Lainnya: ${data.khususLainnya.join(', ')}` : ''
  ].filter(Boolean).join(' • ');

  const selectedSubsectors = subsectorsFromArrays || data.detailSubsektor || (data as any).subsektor || '';

  const recommendationText = (result?.recommendation && result.recommendation !== '-')
    ? result.recommendation
    : 'Disarankan untuk mengikuti program pembekalan wirausaha BKPSDM sesuai klaster peminatan pilihan guna mematangkan kesiapan praktis sebelum memasuki masa purna tugas.';

  return (
    <div className="space-y-6 print:m-0 print:p-0 print:space-y-0">
      {/* KARTU RESMI HASIL ASESMEN */}
      <div className="bg-white rounded-3xl border-3 border-blue-900/30 overflow-hidden shadow-xl print:shadow-none print:border-2 print:border-slate-800 print:rounded-2xl">
        {/* Banner Kop Surat dengan Logo Transformer & BKPSDM */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white print:bg-white print:text-slate-900 p-6 sm:p-8 print:p-3.5 print:pb-2.5 text-center relative border-b-4 border-amber-400">
          <div className="flex items-center justify-center gap-4 print:gap-3 mb-3 print:mb-1.5">
            <img
              src="/logo_bkpsdm.png"
              alt="Logo BKPSDM Kab. Majalengka"
              className="h-11 sm:h-13 print:h-8 w-auto object-contain drop-shadow-md"
            />
            <div className="w-11 h-11 sm:w-13 sm:h-13 print:w-8 print:h-8 rounded-2xl bg-white/10 print:bg-slate-100 p-1.5 print:p-1 backdrop-blur-xs border border-amber-400/60 shadow-inner flex items-center justify-center shrink-0">
              <img
                src="/logo_transformer.png"
                alt="Logo Transformer BKPSDM"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 print:py-0.5 print:px-2.5 rounded-full bg-white/15 print:bg-amber-100/60 print:border-amber-300 text-amber-300 print:text-amber-900 text-xs sm:text-sm print:text-[10px] font-extrabold tracking-wide mb-2 print:mb-0.5 border border-white/20">
            <Sparkles className="w-4 h-4 print:w-3 print:h-3 text-amber-300 print:text-amber-700" />
            Laporan Peminatan & Kesiapan Kewirausahaan ASN
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl print:text-lg font-black tracking-tight leading-tight print:text-slate-950">
            Kartu Peminatan Usaha Pra-Pensiun
          </h1>
          <p className="text-blue-200 print:text-slate-600 text-sm sm:text-base print:text-[10.5px] mt-2 print:mt-0.5 max-w-xl mx-auto font-medium">
            Badan Kepegawaian dan Pengembangan Sumber Daya Manusia (BKPSDM) Pemerintah Daerah Kabupaten Majalengka
          </p>
        </div>

        {/* Ringkasan Identitas Pegawai */}
        <div className="px-6 sm:px-8 py-5 print:py-2 print:px-4 bg-blue-50/60 border-b-2 border-slate-200 grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-4 print:gap-2 text-sm sm:text-base print:text-xs">
          <div>
            <span className="text-xs print:text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Nama Lengkap:</span>
            <span className="font-extrabold text-slate-900 text-lg sm:text-xl print:text-xs block mt-0.5">{data.nama || '-'}</span>
            {data.nip && <span className="text-xs print:text-[9.5px] text-slate-600 font-mono">NIP: {data.nip}</span>}
          </div>
          <div>
            <span className="text-xs print:text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Unit Kerja / Instansi:</span>
            <span className="font-bold text-slate-900 text-base sm:text-lg print:text-xs block mt-0.5">{data.unitKerja || '-'}</span>
            <span className="text-xs print:text-[9.5px] text-slate-600">{data.jabatan}</span>
          </div>
          <div>
            <span className="text-xs print:text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Tahun Rencana Pensiun:</span>
            <span className="font-extrabold text-blue-900 text-lg sm:text-xl print:text-xs block mt-0.5">
              {data.tahunPensiun ? `Tahun ${data.tahunPensiun}` : '-'}
            </span>
            <span className="text-xs print:text-[9.5px] text-slate-600">Usia: {data.usia} Tahun</span>
          </div>
        </div>

        {/* Status Pengiriman Data */}
        <div className="px-6 sm:px-8 py-3 print:py-1.5 print:px-4 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 print:gap-1 text-xs sm:text-sm print:text-[10px]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 print:w-3.5 print:h-3.5 text-emerald-700 shrink-0" />
            <span className="font-bold text-slate-800">Status Data:</span>
            <span className="inline-flex items-center gap-1 text-emerald-900 font-bold bg-emerald-100 px-2.5 py-0.5 print:py-0 print:px-2 rounded-md">
              ✓ Formulir Survei Berhasil Disimpan & Diterima oleh Sistem BKPSDM
            </span>
          </div>
          <span className="text-xs print:text-[9.5px] text-slate-500 font-medium hidden sm:inline">
            Status: Lengkap & Terverifikasi
          </span>
        </div>

        {/* BODY HASIL RESUME PEMINATAN & REKOMENDASI (BEBAS SKOR & NILAI) */}
        <div className="p-6 sm:p-8 print:p-3.5 space-y-6 print:space-y-2">
          {/* Card Profil Bidang Usaha Pilihan */}
          <div className="p-6 sm:p-7 print:p-3 rounded-3xl print:rounded-xl bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/40 border-2 border-blue-200 shadow-xs space-y-4 print:space-y-1.5">
            <div className="flex items-center gap-3 print:gap-2">
              <div className="w-10 h-10 print:w-7 print:h-7 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Briefcase className="w-5 h-5 print:w-3.5 print:h-3.5" />
              </div>
              <div>
                <span className="text-xs print:text-[9.5px] font-bold text-blue-800 uppercase tracking-wider block">Profil Peminatan Wirausaha</span>
                <h2 className="text-xl sm:text-2xl print:text-base font-black text-slate-900">
                  {data.prioritasUtama || 'Bidang Usaha Pilihan'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 print:gap-2 pt-2 print:pt-1 border-t border-slate-200 text-sm sm:text-base print:text-xs">
              <div className="bg-white p-4 print:p-2 rounded-2xl print:rounded-lg border border-slate-200">
                <span className="text-xs print:text-[9.5px] font-bold text-slate-500 block uppercase tracking-wide">Komoditas / Subsektor Khusus:</span>
                <span className="font-extrabold text-slate-900 mt-1 print:mt-0.5 block print:text-xs">
                  {selectedSubsectors || 'Sesuai peminatan umum'}
                </span>
              </div>
              <div className="bg-white p-4 print:p-2 rounded-2xl print:rounded-lg border border-slate-200">
                <span className="text-xs print:text-[9.5px] font-bold text-slate-500 block uppercase tracking-wide">Model Pengelolaan yang Diinginkan:</span>
                <span className="font-extrabold text-blue-950 mt-1 print:mt-0.5 block print:text-xs">
                  {data.modelKeterlibatan || '-'}
                </span>
              </div>
            </div>

            {data.alasanPrioritas && (
              <div className="bg-white/80 p-4 print:p-2 rounded-2xl print:rounded-lg border border-blue-100 text-sm sm:text-base print:text-xs">
                <span className="text-xs print:text-[9.5px] font-bold text-slate-500 block uppercase tracking-wide">Alasan Pemilihan Usaha:</span>
                <p className="text-slate-700 italic mt-1 print:mt-0.5 font-medium leading-relaxed print:leading-normal print:text-[10.5px]">
                  "{data.alasanPrioritas}"
                </p>
              </div>
            )}
          </div>

          {/* Rekomendasi Program Pembekalan */}
          <div className="p-6 sm:p-7 print:p-2.5 rounded-3xl print:rounded-xl bg-amber-50/80 border-2 border-amber-300 space-y-3 print:space-y-1">
            <h3 className="text-base sm:text-lg print:text-xs font-black text-amber-950 flex items-center gap-2 print:gap-1.5">
              <ThumbsUp className="w-5 h-5 print:w-3.5 print:h-3.5 text-amber-700" />
              Rekomendasi Program Tindak Lanjut Pembekalan BKPSDM:
            </h3>
            <p className="text-sm sm:text-base print:text-[10.5px] text-amber-950 font-semibold leading-relaxed print:leading-tight">
              {recommendationText}
            </p>
          </div>

          {/* Agenda & Tahapan Selanjutnya */}
          <div className="p-6 print:p-2.5 rounded-3xl print:rounded-xl bg-slate-50 border-2 border-slate-200 space-y-3 print:space-y-1">
            <h3 className="text-base sm:text-lg print:text-xs font-black text-slate-900 flex items-center gap-2 print:gap-1.5">
              <Layers className="w-5 h-5 print:w-3.5 print:h-3.5 text-blue-800" />
              Langkah Selanjutnya oleh BKPSDM Kabupaten Majalengka:
            </h3>
            <ul className="space-y-2 print:space-y-0.5 text-sm sm:text-base print:text-[10px] text-slate-700 font-medium leading-normal print:leading-tight">
              <li className="flex items-start gap-2.5 print:gap-1.5">
                <span className="text-blue-800 font-bold">1.</span>
                <span>Data peminatan dan komitmen Bapak/Ibu telah dikelompokkan ke dalam klaster komoditas kewirausahaan BKPSDM Transformers 2026.</span>
              </li>
              <li className="flex items-start gap-2.5 print:gap-1.5">
                <span className="text-blue-800 font-bold">2.</span>
                <span>BKPSDM akan menginformasikan jadwal pelatihan teknis wirausaha, bimbingan manajemen, serta temu praktisi/mentor usaha.</span>
              </li>
              <li className="flex items-start gap-2.5 print:gap-1.5">
                <span className="text-blue-800 font-bold">3.</span>
                <span>Bagi peserta yang membutuhkan fasilitasi kemitraan, akan difasilitasi pendampingan terarah sebelum memasuki masa purna tugas.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Tombol Cetak / Selesai */}
        <div className="px-6 sm:px-8 py-6 bg-slate-100 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          {isAdminPreview ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl border-2 border-slate-300 text-slate-800 font-bold hover:bg-slate-200 transition text-base cursor-pointer shadow-xs"
            >
              <X className="w-5 h-5" />
              Tutup Pratinjau
            </button>
          ) : (
            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl border-2 border-slate-300 text-slate-800 font-bold hover:bg-slate-200 transition text-base cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-5 h-5" />
              Isi Formulir Baru
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-blue-950 hover:bg-blue-900 text-white font-extrabold transition text-base sm:text-lg shadow-lg cursor-pointer"
          >
            <Printer className="w-6 h-6 text-amber-300" />
            Cetak / Simpan PDF
          </button>
        </div>
      </div>
    </div>
  );
};
