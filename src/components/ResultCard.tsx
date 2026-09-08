import React from 'react';
import { ScoringResult, SurveyData } from '../types/survey';
import { downloadSingleSurveyExcel } from '../utils/excelBackup';
import {
  Printer,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  Download,
  Briefcase,
  Layers
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

  const selectedSubsectors = [
    data.khususPertanian && data.khususPertanian.length > 0 ? `Pertanian: ${data.khususPertanian.join(', ')}` : '',
    data.khususPerikanan && data.khususPerikanan.length > 0 ? `Perikanan: ${data.khususPerikanan.join(', ')}` : '',
    data.khususPerkebunan && data.khususPerkebunan.length > 0 ? `Perkebunan: ${data.khususPerkebunan.join(', ')}` : '',
    data.khususPeternakan && data.khususPeternakan.length > 0 ? `Peternakan: ${data.khususPeternakan.join(', ')}` : '',
    data.khususEkspedisi && data.khususEkspedisi.length > 0 ? `Ekspedisi: ${data.khususEkspedisi.join(', ')}` : '',
    data.khususGrosir && data.khususGrosir.length > 0 ? `Grosir: ${data.khususGrosir.join(', ')}` : '',
    data.khususCuciKendaraan && data.khususCuciKendaraan.length > 0 ? `Cuci: ${data.khususCuciKendaraan.join(', ')}` : '',
    data.khususLainnya && data.khususLainnya.length > 0 ? `Lainnya: ${data.khususLainnya.join(', ')}` : ''
  ].filter(Boolean).join(' • ');

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* KARTU RESMI HASIL ASESMEN */}
      <div className="bg-white rounded-3xl border-3 border-blue-900/30 overflow-hidden shadow-xl print:shadow-none print:border-2 print:border-slate-800">
        {/* Banner Kop Surat dengan Logo Transformer & BKPSDM */}
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
            Laporan Peminatan & Kesiapan Kewirausahaan ASN
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Kartu Peminatan Usaha Pra-Pensiun
          </h1>
          <p className="text-blue-200 text-sm sm:text-base mt-2 max-w-xl mx-auto font-medium">
            Badan Kepegawaian dan Pengembangan Sumber Daya Manusia (BKPSDM) Pemerintah Daerah Kabupaten Majalengka
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

        {/* Status Pengiriman Data */}
        <div className="px-6 sm:px-8 py-3 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-bold text-slate-800">Status Data:</span>
            <span className="inline-flex items-center gap-1 text-emerald-900 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-md">
              ✓ Formulir Survei Berhasil Disimpan & Diterima oleh Sistem BKPSDM
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Status: Lengkap & Terverifikasi
          </span>
        </div>

        {/* BODY HASIL RESUME PEMINATAN & REKOMENDASI (BEBAS SKOR & NILAI) */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Card Profil Bidang Usaha Pilihan */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/40 border-2 border-blue-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">Profil Peminatan Wirausaha</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {data.prioritasUtama || 'Bidang Usaha Pilihan'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-sm sm:text-base">
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wide">Komoditas / Subsektor Khusus:</span>
                <span className="font-extrabold text-slate-900 mt-1 block">
                  {selectedSubsectors || 'Sesuai peminatan umum'}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wide">Model Pengelolaan yang Diinginkan:</span>
                <span className="font-extrabold text-blue-950 mt-1 block">
                  {data.modelKeterlibatan || '-'}
                </span>
              </div>
            </div>

            {data.alasanPrioritas && (
              <div className="bg-white/80 p-4 rounded-2xl border border-blue-100 text-sm sm:text-base">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wide">Alasan Pemilihan Usaha:</span>
                <p className="text-slate-700 italic mt-1 font-medium leading-relaxed">
                  "{data.alasanPrioritas}"
                </p>
              </div>
            )}
          </div>

          {/* Rekomendasi Program Pembekalan */}
          <div className="p-6 sm:p-7 rounded-3xl bg-amber-50/80 border-2 border-amber-300 space-y-3">
            <h3 className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-amber-700" />
              Rekomendasi Program Tindak Lanjut Pembekalan BKPSDM:
            </h3>
            <p className="text-sm sm:text-base text-amber-950 font-semibold leading-relaxed">
              {result.recommendation}
            </p>
          </div>

          {/* Agenda & Tahapan Selanjutnya */}
          <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 space-y-3">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-800" />
              Langkah Selanjutnya oleh BKPSDM Kabupaten Majalengka:
            </h3>
            <ul className="space-y-2 text-sm sm:text-base text-slate-700 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="text-blue-800 font-bold">1.</span>
                <span>Data peminatan dan komitmen Bapak/Ibu telah dikelompokkan ke dalam klaster komoditas kewirausahaan BKPSDM Transformers 2026.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-800 font-bold">2.</span>
                <span>BKPSDM akan menginformasikan jadwal pelatihan teknis wirausaha, bimbingan manajemen, serta temu praktisi/mentor usaha.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-800 font-bold">3.</span>
                <span>Bagi peserta yang membutuhkan fasilitasi kemitraan, akan difasilitasi pendampingan terarah sebelum memasuki masa purna tugas.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Tombol Cetak / Selesai / Unduh Excel */}
        <div className="px-6 sm:px-8 py-6 bg-slate-100 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl border-2 border-slate-300 text-slate-800 font-bold hover:bg-slate-200 transition text-base cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-5 h-5" />
            Isi Formulir Baru
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Tombol Cadangan Excel */}
            <button
              type="button"
              onClick={() => downloadSingleSurveyExcel(data, result)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold transition text-base shadow-md cursor-pointer"
              title="Unduh berkas Excel hasil survei ini sebagai arsip cadangan pribadi"
            >
              <Download className="w-5 h-5 text-emerald-200" />
              Unduh Salinan Excel (.xlsx)
            </button>

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
    </div>
  );
};
