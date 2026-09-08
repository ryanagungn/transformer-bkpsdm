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

          <div className="relative z-10 space-y-6">
            {/* Header Instansi & Logo Berdampingan */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-blue-800/80">
              <div className="flex flex-wrap items-center gap-4">
                {/* Logo BKPSDM Majalengka (Tanpa Box Putih) */}
                <div className="flex items-center justify-center shrink-0">
                  <img
                    src="/logo_bkpsdm.png"
                    alt="Logo BKPSDM Kab. Majalengka"
                    className="h-12 sm:h-14 w-auto object-contain drop-shadow-lg"
                  />
                </div>

                {/* Logo Transformers */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 p-2 backdrop-blur-md border-2 border-amber-400/80 shadow-xl flex items-center justify-center shrink-0">
                  <img
                    src="/logo_transformer.png"
                    alt="Logo Transformers BKPSDM"
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
              </div>

              {/* Lencana Identitas Pemkab Majalengka */}
              <div className="text-left sm:text-right">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 block">
                  Pemerintah Daerah Kabupaten Majalengka
                </span>
                <span className="text-xs text-blue-200 font-bold block mt-0.5">
                  BKPSDM Kab. Majalengka
                </span>
              </div>
            </div>

            {/* Judul Utama */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> Program Transformers 2026
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Survei Peminatan & Kesiapan Berwirausaha ASN Pra-Pensiun
              </h1>
              <p className="text-sm sm:text-base text-blue-100 font-medium max-w-3xl">
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
              Tentang Survei & Program Pembekalan Wirausaha
            </h2>
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed">
              Survei ini diselenggarakan oleh <strong>BKPSDM Kab. Majalengka - Pemerintah Daerah Kabupaten Majalengka</strong> dalam rangka memetakan aspirasi, potensi keahlian, dan kesiapan berwirausaha bagi Bapak/Ibu ASN yang memasuki masa purna tugas.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Hasil asesmen ini akan menjadi dasar penyusunan <strong>Program Inkubasi, Pelatihan Teknis Praktis, serta Fasilitasi Akses Permodalan & Kemitraan Usaha</strong> yang terarah dan berkelanjutan bagi ASN Kabupaten Majalengka.
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
                  Cukup ketikkan NIP Bapak/Ibu di Tahap 1, kolom Nama, OPD, Jabatan, dan Rencana Pensiun otomatis terisi ({totalPegawai.toLocaleString('id-ID')} data terintegrasi).
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
                  Informasi bersifat kedinasan dan terproteksi, semata-mata digunakan untuk perencanaan program pembekalan BKPSDM Kab. Majalengka.
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
              Terhubung dengan Database Transformers 2026 BKPSDM Kab. Majalengka
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
