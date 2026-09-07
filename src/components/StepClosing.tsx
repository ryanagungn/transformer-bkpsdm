import React from 'react';
import { SurveyData } from '../types/survey';
import { KENDALA_LIST } from '../data/surveyQuestions';
import { HeartHandshake, Check, ShieldCheck } from 'lucide-react';

interface Props {
  data: SurveyData;
  onChange: (fields: Partial<SurveyData>) => void;
}

export const StepClosing: React.FC<Props> = ({ data, onChange }) => {
  const toggleKendala = (item: string) => {
    if (data.kendalaTerbesar.includes(item)) {
      onChange({ kendalaTerbesar: data.kendalaTerbesar.filter((i) => i !== item) });
    } else {
      onChange({ kendalaTerbesar: [...data.kendalaTerbesar, item] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Penjelasan Bagian Penutup */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border-2 border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-blue-950">
              Bagian P: Kendala & Harapan Program
            </h2>
            <p className="text-sm sm:text-base text-blue-900/90 mt-1 leading-relaxed">
              Tahap terakhir formulir. Sampaikan kendala yang diperkirakan dan harapan Bapak/Ibu agar program pembekalan BKPSDM benar-benar tepat sasaran.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Kendala Terbesar */}
      <div className="space-y-3">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          1. Kendala Terbesar yang Diperkirakan: <span className="text-rose-600 font-black">*</span>
          <span className="text-xs font-normal text-slate-500 block sm:inline sm:ml-2">
            (Pilih semua kendala yang dikhawatirkan)
          </span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {KENDALA_LIST.map((item) => {
            const isChecked = data.kendalaTerbesar.includes(item);
            return (
              <button
                type="button"
                key={item}
                onClick={() => toggleKendala(item)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition duration-150 cursor-pointer text-sm sm:text-base ${
                  isChecked
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold shadow-xs ring-1 ring-amber-500/30'
                    : 'border-slate-200 hover:border-slate-400 bg-white text-slate-800 font-medium'
                }`}
              >
                <span className="leading-snug">{item}</span>
                {isChecked && <Check className="w-4 h-4 text-amber-700 shrink-0 ml-1 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Harapan terhadap BKPSDM */}
      <div className="space-y-3 pt-3 border-t-2 border-slate-200">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          2. Harapan & Masukan Terhadap Program BKPSDM: <span className="text-rose-600 font-black">*</span>
        </label>
        <textarea
          rows={4}
          required
          placeholder="Tuliskan harapan Bapak/Ibu di sini..."
          value={data.harapanBKPSDM}
          onChange={(e) => onChange({ harapanBKPSDM: e.target.value })}
          className="w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 border-slate-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-500/20 bg-white font-medium shadow-2xs"
        />
      </div>

      {/* Pernyataan Pengiriman Data */}
      <div className="p-5 rounded-2xl bg-blue-50/80 border-2 border-blue-300 flex items-start gap-3.5 shadow-2xs">
        <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-sm sm:text-base text-blue-950">
          <span className="font-extrabold block">Pengiriman Data:</span>
          <p className="mt-1 leading-relaxed text-blue-900">
            Setelah menekan tombol <strong>"Kirim Survei & Lihat Hasil Asesmen"</strong>, data akan otomatis disimpan ke database BKPSDM dan sistem akan langsung menampilkan kartu hasil asesmen kesiapan usaha Bapak/Ibu.
          </p>
        </div>
      </div>
    </div>
  );
};
