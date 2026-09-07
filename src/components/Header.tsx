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
      {/* Top Banner: Logo Transformer + Navy Blue & Amber Accent Palette */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white px-4 py-3 sm:py-3.5 border-b-4 border-amber-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Judul Resmi */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center p-1.5 backdrop-blur-xs border border-white/20 shrink-0 shadow-inner">
              <img
                src="/logo_transformer.png"
                alt="Logo Transformer BKPSDM"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                  BKPSDM Portal
                </span>
                <span className="text-xs text-blue-200 hidden sm:inline font-medium">Pemerintah Daerah</span>
              </div>
              <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white leading-snug">
                {isAdminView ? 'Portal Administrator BKPSDM' : 'Survei Peminatan & Potensi Usaha ASN Pra-Pensiun'}
              </h1>
            </div>
          </div>

          {/* Sisi Kanan: Pengatur Huruf & Tombol Beralih Mode Admin */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Tombol Akses Admin */}
            {onToggleAdminView && (
              <button
                type="button"
                onClick={onToggleAdminView}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  isAdminView
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400 shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-blue-100 border-white/20'
                }`}
                title="Beralih antara Tampilan Responden & Portal Admin"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isAdminView ? 'Ke Formulir Survei' : 'Portal Admin'}</span>
              </button>
            )}

            {/* Pengatur Ukuran Huruf */}
            <div className="flex items-center gap-1.5 bg-blue-900/60 px-2.5 py-1.5 rounded-xl border border-blue-700/50 shrink-0">
              <span className="text-xs font-semibold text-blue-200 hidden sm:flex items-center gap-1">
                <Type className="w-3.5 h-3.5" /> Huruf:
              </span>
              <div className="flex items-center gap-1 bg-black/30 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => onFontSizeChange('normal')}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition cursor-pointer ${
                    fontSize === 'normal'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-200 hover:text-white'
                  }`}
                  title="Ukuran Tulisan Standar"
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => onFontSizeChange('large')}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition cursor-pointer ${
                    fontSize === 'large'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-200 hover:text-white'
                  }`}
                  title="Ukuran Tulisan Besar"
                >
                  Besar
                </button>
                <button
                  type="button"
                  onClick={() => onFontSizeChange('xlarge')}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition cursor-pointer ${
                    fontSize === 'xlarge'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-blue-200 hover:text-white'
                  }`}
                  title="Ukuran Tulisan Sangat Besar"
                >
                  A++
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

          {/* Progress Bar Tepat 100% saat selesai */}
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
