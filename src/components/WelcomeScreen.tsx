import React from 'react';
import { ArrowRight, Clock, ShieldCheck, Sparkles, Award, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  onStart: () => void;
  totalPegawai?: number;
}

export const WelcomeScreen: React.FC<Props> = ({ onStart, totalPegawai = 2700 }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* CARD UTAMA HERO / PENGANTAR */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
        {/* Banner Atas Warna Navy Blue */}
        <div className="bg-gradient-to-r from-blue-950 via-[#002060] to-blue-900 p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {/* Logo Transformers */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white/10 p-3 backdrop-blur-md border-2 border-amber-400/80 shadow-2xl flex items-center justify-center shrink-0">
              <img
                src="/logo_transformer.png"
                alt="Logo Transformers BKPSDM"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> Program Transformers 2026
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Survei Peminatan & Kesiapan Berwirausaha ASN Pra-Pensiun
              </h1>
              <p className="text-sm sm:text-base text-blue-100 font-medium max-w-2xl">
                Badan Kepegawaian dan Pengembangan Sumber Daya Manusia (BKPSDM) Kabupaten Majalengka
              </p>
            </div>
          </div>
        </div>

        {/* Konten Penjelasan & Panduan */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Latar Belakang & Tujuan */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-blue-950 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Tentang Survei & Program Pendampingan
            </h2>
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed">
              Survei ini diselenggarakan oleh <strong>BKPSDM Kabupaten Majalengka</strong> dalam rangka memetakan aspirasi, potensi keahlian, dan kesiapan berwirausaha bagi Bapak/Ibu ASN yang memasuki masa purna tugas.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Hasil asesmen ini akan menjadi dasar penyusunan <strong>Program Inkubasi, Pelatihan Teknis Praktis, serta Fasilitasi Akses Permodalan & Kemitraan Usaha</strong> yang terarah dan berkelanjutan.
            </p>
          </div>

          {/* 4 Poin Penting Pengisian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/60 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">Waktu Pengisian Singkat</h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Hanya membutuhkan waktu sekitar <strong>5 – 7 menit</strong> untuk menyelesaikan seluruh bagian instrumen.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/60 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">Auto-Fill NIP Cerdas</h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Cukup ketikkan NIP Bapak/Ibu di Tahap 1, kolom Nama, OPD, Jabatan, dan Rencana Pensiun otomatis terisi.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">Hasil Asesmen Instan</h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Di akhir survei, Bapak/Ibu langsung mendapatkan <strong>Kartu Skor Kesiapan (0-100)</strong> beserta rekomendasi tindak lanjut.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">Data Terlindungi & Resmi</h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Informasi bersifat kedinasan dan terproteksi, semata-mata digunakan untuk perencanaan program pembekalan.
                </p>
              </div>
            </div>
          </div>

          {/* Tombol Mulai Pengisian Survei */}
          <div className="pt-4 border-t-2 border-slate-100 flex flex-col items-center justify-center text-center space-y-3">
            <button
              type="button"
              onClick={onStart}
              className="w-full sm:w-auto min-w-[320px] px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-900 via-[#002060] to-blue-950 hover:from-blue-950 hover:to-slate-950 text-white font-black text-lg sm:text-xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-3 border border-blue-700/50"
            >
              <span>Mulai Pengisian Survei</span>
              <ArrowRight className="w-6 h-6 text-amber-400" />
            </button>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Terhubung dengan Database Transformers 2026 BKPSDM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
