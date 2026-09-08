import React from 'react';
import { SurveyData } from '../types/survey';
import {
  ASET_LIST,
  KEPEMILIKAN_LAHAN_LIST,
  LUAS_LAHAN_LIST
} from '../data/surveyQuestions';
import { Landmark, Check } from 'lucide-react';

interface Props {
  data: SurveyData;
  onChange: (fields: Partial<SurveyData>) => void;
}

export const StepAssetsCapital: React.FC<Props> = ({ data, onChange }) => {
  const toggleArrayItem = (list: string[], item: string): string[] => {
    if (item === 'Tidak ada' || item === 'Tidak ada aset khusus') {
      return [item];
    }
    const cleanList = list.filter((i) => !i.toLowerCase().includes('tidak ada'));
    if (cleanList.includes(item)) {
      return cleanList.filter((i) => i !== item);
    } else {
      return [...cleanList, item];
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Penjelasan Bagian D */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border-2 border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-blue-950">
              Bagian D: Kesiapan Aset & Lahan Usaha
            </h2>
            <p className="text-sm sm:text-base text-blue-900/90 mt-1 leading-relaxed">
              Informasi aset dan lahan yang dimiliki akan menjadi acuan BKPSDM dalam memetakan potensi dan skala usaha yang paling realistis.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Aset Tersedia */}
      <div className="space-y-3">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          1. Aset yang Bapak/Ibu Miliki dan Berpotensi Digunakan: <span className="text-rose-600 font-black">*</span>
          <span className="text-xs font-normal text-slate-500 block sm:inline sm:ml-2">
            (Pilih semua yang dimiliki)
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ASET_LIST.map((item) => {
            const isChecked = data.asetTersedia.includes(item);
            return (
              <button
                type="button"
                key={item}
                onClick={() =>
                  onChange({
                    asetTersedia: toggleArrayItem(data.asetTersedia, item)
                  })
                }
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition duration-150 cursor-pointer text-sm sm:text-base ${
                  isChecked
                    ? 'border-blue-800 bg-blue-800 text-white font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-400 bg-white text-slate-800 font-medium'
                }`}
              >
                <span className="leading-tight">{item}</span>
                {isChecked && <Check className="w-4 h-4 shrink-0 ml-1 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Kepemilikan Lahan */}
      <div className="space-y-3 pt-3 border-t-2 border-slate-200">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          2. Apakah Bapak/Ibu Memiliki Lahan untuk Tempat Usaha? <span className="text-rose-600 font-black">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {KEPEMILIKAN_LAHAN_LIST.map((item) => {
            const isSelected = data.kepemilikanLahan === item;
            return (
              <button
                type="button"
                key={item}
                onClick={() => onChange({ kepemilikanLahan: item })}
                className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-blue-800 bg-blue-50 text-blue-950 font-extrabold shadow-sm ring-2 ring-blue-500/30'
                    : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700 font-medium'
                }`}
              >
                <span className="text-sm sm:text-base">{item}</span>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-blue-800 text-white flex items-center justify-center shrink-0 ml-1">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Luas Lahan */}
      {data.kepemilikanLahan && data.kepemilikanLahan !== 'Tidak memiliki lahan' && (
        <div className="space-y-3 pt-3 border-t-2 border-slate-200">
          <label className="block text-base sm:text-lg font-bold text-slate-900">
            3. Perkiraan Luas Lahan yang Dapat Digunakan:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {LUAS_LAHAN_LIST.filter(i => i !== 'Tidak memiliki lahan').map((item) => {
              const isSelected = data.perkiraanLuasLahan === item;
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => onChange({ perkiraanLuasLahan: item })}
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-blue-800 bg-blue-50 text-blue-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700'
                  }`}
                >
                  <span className="text-sm sm:text-base">{item}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-800 ml-1 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
