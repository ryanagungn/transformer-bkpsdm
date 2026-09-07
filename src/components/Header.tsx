import React from 'react';
import { Type, Shield, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  fontSize: 'normal' | 'large' | 'xlarge';
  onFontSizeChange: (size: 'normal' | 'large' | 'xlarge') => void;
  isCompleted?: boolean;
  isAdminView?: boolean;
  isWelcomeView?: boolean;
  onToggleAdminView?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  fontSize,
  onFontSizeChange,
  isCompleted = false,
  isAdminView = false,
  isWelcomeView = false,
  onToggleAdminView
}) => {
  // Hitung persentase: jika sudah selesai, kunci tepat di 100%
  const progressPercent = isCompleted ? 100 : Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <header className="bg-white border-b-2 border-blue-900/20 sticky top-0 z-30 shadow-md">
      {/* Top Banner: Logo BKPSDM & Transformers + Navy Blue & Amber Accent Palette */}
      <div className="bg-gradient-to-r from-blue-950 via-[#002060] to-slate-900 text-white px-4 py-3 sm:py-3.5 border-b-4 border-amber-500">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Sisi Kiri: Dua Logo Resmi & Identitas Instansi */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Logo Resmi BKPSDM Kabupaten Majalengka */}
            <div className="bg-white rounded-xl px-2.5 py-1.5 shadow-md flex items-center justify-center shrink-0 border border-slate-200">
              <img
                src="/logo_bkpsdm.png"
                alt="Logo BKPSDM Kab. Majalengka"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </div>

            {/* Logo Transformers */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 flex items-center justify-center p-1 backdrop-blur-xs border border-amber-400/60 shrink-0 shadow-inner">
              <img
                src="/logo_transformer.png"
                alt="Logo Transformers"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>

            {/* Teks Lembaga & Judul Program */}
            <div className="leading-tight">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                  Pemerintah Daerah Kabupaten Majalengka
                </span>
                <span className="text-[10px] sm:text-xs text-blue-200 font-bold hidden sm:inline">
                  • BKPSDM Kab. Majalengka
                </span>
              </div>
              <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white mt-0.5">
                {isAdminView
                  ? 'Portal Administrator BKPSDM Kab. Majalengka'
                  : 'Survei Peminatan & Potensi Usaha ASN Pra-Pensiun (Transformers 2026)'}
              </h1>
            </div>
          </div>

          {/* Sisi Kanan: Pengatur Ukuran Huruf & Tombol Beralih Mode Admin */}
          <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
            {/* Tombol Akses Admin */}
            {onToggleAdminView && (
              <button
                type="button"
                onClick={onToggleAdminView}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  isAdminView
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400 shadow-xs font-black'
                    : 'bg-white/10 hover:bg-white/20 text-blue-100 border-white/20'
                }`}
                title="Beralih antara Tampilan Responden & Portal Admin"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isAdminView ? 'Ke Formulir Survei' : 'Portal Admin'}</span>
              </button>
            )}

            {/* Pengatur Ukuran Huruf yang Bekerja Nyata Secara Global */}
            <div className="flex items-center gap-1.5 bg-blue-900/80 px-2.5 py-1.5 rounded-xl border border-blue-700/60 shrink-0">
              <span className="text-xs font-bold text-blue-200 hidden sm:flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-amber-300" /> Ukuran Teks:
              </span>
              <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-blue-800">
                <button
                  type="button"
                  onClick={() => onFontSizeChange('normal')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    fontSize === 'normal'
                      ? 'bg-blue-600 text-white shadow-xs font-black ring-1 ring-white/50'
                      : 'text-blue-200 hover:text-white'
                  }`}
                  title="Ukuran Tulisan Standar (100%)"
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => onFontSizeChange('large')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    fontSize === 'large'
                      ? 'bg-blue-600 text-white shadow-xs font-black ring-1 ring-amber-400'
                      : 'text-blue-200 hover:text-white'
                  }`}
                  title="Ukuran Tulisan Lebih Besar (+15%)"
                >
                  Besar
                </button>
                <button
                  type="button"
                  onClick={() => onFontSizeChange('xlarge')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    fontSize === 'xlarge'
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-black ring-1 ring-amber-300'
                      : 'text-amber-200 hover:text-white'
                  }`}
                  title="Ukuran Tulisan Ekstra Besar (+35% untuk kenyamanan membaca)"
                >
                  A++ Ekstra
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Step Indicator (Hanya muncul jika bukan mode Admin dan bukan Halaman Pengantar) */}
      {!isAdminView && !isWelcomeView && (
        <div className="max-w-5xl mx-auto px-4 py-3 bg-blue-50/60">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              {isCompleted ? (
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-base font-black shadow-xs">
                  ✓
                </span>
              ) : (
                <span className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm font-extrabold shadow-xs">
                  {currentStep}
                </span>
              )}
              <div>
                <span className="text-xs text-blue-800 font-bold uppercase tracking-wider block">
                  {isCompleted ? 'Survei Telah Selesai' : `Tahap ${currentStep} dari ${totalSteps}`}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {isCompleted ? 'Kartu Hasil Asesmen Mandiri' : stepTitles[currentStep - 1]}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs ${
                  isCompleted
                    ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                    : 'text-blue-950 bg-white border-blue-300'
                }`}
              >
                {progressPercent}% Selesai
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300/60">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full shadow-inner ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                  : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
};
