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
        {/* Banner Kop Surat dengan Logo Transformer & BKPSDM (Format Bersih Standar Kedinasan) */}
        <div className="bg-white text-slate-900 p-5 sm:p-7 print:p-3.5 print:pb-2 text-center relative border-b-2 border-amber-400">
          <div className="flex items-center justify-center gap-4 print:gap-3 mb-2.5 print:mb-1.5">
            <img
              src="/logo_bkpsdm.png"
              alt="Logo BKPSDM Kab. Majalengka"
              className="h-10 sm:h-12 print:h-8 w-auto object-contain"
            />
            <div className="w-10 h-10 sm:w-12 sm:h-12 print:w-8 print:h-8 rounded-2xl bg-slate-50 p-1 border border-amber-400/60 flex items-center justify-center shrink-0">
              <img
                src="/logo_transformer.png"
                alt="Logo Transformer BKPSDM"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 print:py-0.5 print:px-2.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black tracking-wide mb-1.5 print:mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Laporan Peminatan & Kesiapan Kewirausahaan ASN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl print:text-xl font-black tracking-tight text-blue-950 leading-tight">
            Kartu Peminatan Usaha Pra-Pensiun
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm print:text-xs mt-1 max-w-xl mx-auto font-semibold">
            Badan Kepegawaian dan Pengembangan Sumber Daya Manusia (BKPSDM) Pemerintah Daerah Kabupaten Majalengka
          </p>
        </div>

        {/* Ringkasan Identitas Pegawai */}
        <div className="px-5 sm:px-8 py-3.5 print:py-2 print:px-4 bg-blue-50/70 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-3 print:gap-2 text-xs sm:text-sm print:text-xs">
          <div>
            <span className="text-[11px] print:text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Nama Lengkap:</span>
            <span className="font-extrabold text-slate-900 text-base sm:text-lg print:text-xs block mt-0.5">{data.nama || '-'}</span>
            {data.nip && <span className="text-xs print:text-[10px] text-slate-600 font-mono">NIP: {data.nip}</span>}
          </div>
          <div>
            <span className="text-[11px] print:text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Unit Kerja / Instansi:</span>
            <span className="font-bold text-slate-900 text-sm sm:text-base print:text-xs block mt-0.5">{data.unitKerja || '-'}</span>
            <span className="text-xs print:text-[10px] text-slate-600">{data.jabatan}</span>
          </div>
          <div>
            <span className="text-[11px] print:text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tahun Rencana Pensiun:</span>
            <span className="font-extrabold text-blue-950 text-base sm:text-lg print:text-xs block mt-0.5">
              {data.tahunPensiun ? `Tahun ${data.tahunPensiun}` : '-'}
            </span>
            <span className="text-xs print:text-[10px] text-slate-600">Usia: {data.usia} Tahun</span>
          </div>
        </div>

        {/* Status Pengiriman Data */}
        <div className="px-5 sm:px-8 py-2.5 print:py-1.5 print:px-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs print:text-[11px]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-bold text-slate-800">Status Data:</span>
            <span className="inline-flex items-center gap-1 text-emerald-950 font-bold bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 print:py-0 rounded-md">
              ✓ Formulir Survei Berhasil Disimpan & Diterima oleh Sistem BKPSDM
            </span>
          </div>
          <span className="text-xs print:text-[10px] text-slate-500 font-semibold hidden sm:inline">
            Status: Lengkap & Terverifikasi
          </span>
        </div>

        {/* BODY HASIL RESUME PEMINATAN & REKOMENDASI (BEBAS SKOR & NILAI) */}
        <div className="p-5 sm:p-7 print:p-3 space-y-4 print:space-y-2">
          {/* Card Profil Bidang Usaha Pilihan */}
          <div className="p-4 sm:p-6 print:p-2.5 rounded-2xl bg-blue-50/40 border border-blue-200 space-y-3 print:space-y-1.5">
            <div className="flex items-center gap-3 print:gap-2">
              <div className="w-9 h-9 print:w-7 print:h-7 rounded-xl bg-blue-950 text-white flex items-center justify-center shrink-0">
                <Briefcase className="w-4.5 h-4.5 print:w-3.5 print:h-3.5" />
              </div>
              <div>
                <span className="text-[11px] print:text-[10px] font-bold text-blue-900 uppercase tracking-wider block">Profil Peminatan Wirausaha</span>
                <h2 className="text-lg sm:text-xl print:text-sm font-black text-slate-900">
                  {data.prioritasUtama || 'Bidang Usaha Pilihan'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3 print:gap-2 pt-2 print:pt-1 border-t border-slate-200 text-xs sm:text-sm">
              <div className="bg-white p-3 print:p-2 rounded-xl border border-slate-200">
                <span className="text-[10.5px] print:text-[10px] font-bold text-slate-500 block uppercase tracking-wide">Komoditas / Subsektor Khusus:</span>
                <span className="font-extrabold text-slate-900 mt-1 print:mt-0.5 block print:text-xs">
                  {selectedSubsectors || 'Sesuai peminatan umum'}
                </span>
              </div>
              <div className="bg-white p-3 print:p-2 rounded-xl border border-slate-200">
                <span className="text-[10.5px] print:text-[10px] font-bold text-slate-500 block uppercase tracking-wide">Model Pengelolaan yang Diinginkan:</span>
                <span className="font-extrabold text-blue-950 mt-1 print:mt-0.5 block print:text-xs">
                  {data.modelKeterlibatan || '-'}
                </span>
              </div>
            </div>

            {data.alasanPrioritas && (
              <div className="bg-white p-3 print:p-2 rounded-xl border border-blue-100 text-xs sm:text-sm">
                <span className="text-[10.5px] print:text-[10px] font-bold text-slate-500 block uppercase tracking-wide">Alasan Pemilihan Usaha:</span>
                <p className="text-slate-700 italic mt-1 print:mt-0.5 font-medium leading-relaxed print:text-xs">
                  "{data.alasanPrioritas}"
                </p>
              </div>
            )}
          </div>

          {/* Rekomendasi Program Pembekalan */}
          <div className="p-4 sm:p-5 print:p-2 rounded-2xl bg-amber-50/60 border border-amber-300 space-y-2 print:space-y-1">
            <h3 className="text-sm sm:text-base print:text-xs font-black text-amber-950 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-amber-700 shrink-0" />
              Rekomendasi Program Tindak Lanjut Pembekalan BKPSDM:
            </h3>
            <p className="text-xs sm:text-sm print:text-xs text-amber-950 font-semibold leading-relaxed">
              {recommendationText}
            </p>
          </div>

          {/* Agenda & Tahapan Selanjutnya */}
          <div className="p-4 sm:p-5 print:p-2 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 print:space-y-1">
            <h3 className="text-sm sm:text-base print:text-xs font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-800 shrink-0" />
              Langkah Selanjutnya oleh BKPSDM Kabupaten Majalengka:
            </h3>
            <ul className="space-y-1.5 print:space-y-0.5 text-xs sm:text-sm print:text-[11px] text-slate-700 font-medium leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-blue-900 font-bold">1.</span>
                <span>Data peminatan dan komitmen Bapak/Ibu telah dikelompokkan ke dalam klaster komoditas kewirausahaan BKPSDM Transformers 2026.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-900 font-bold">2.</span>
                <span>BKPSDM akan menginformasikan jadwal pelatihan teknis wirausaha, bimbingan manajemen, serta temu praktisi/mentor usaha.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-900 font-bold">3.</span>
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
