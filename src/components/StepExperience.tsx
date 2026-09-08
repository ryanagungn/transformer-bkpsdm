import React from 'react';
import { SurveyData } from '../types/survey';
import { PENGALAMAN_USAHA_LIST, BIDANG_USAHA_LIST, KETERAMPILAN_LIST } from '../data/surveyQuestions';
import { Award, Check, Lightbulb } from 'lucide-react';

interface Props {
  data: SurveyData;
  onChange: (fields: Partial<SurveyData>) => void;
}

export const StepExperience: React.FC<Props> = ({ data, onChange }) => {
  const toggleCheckbox = (list: string[], item: string): string[] => {
    if (list.includes(item)) {
      return list.filter((i) => i !== item);
    } else {
      return [...list, item];
    }
  };

  const getExperienceIcon = (item: string) => {
    if (item.includes('aktif')) return '🏢';
    if (item.includes('kecil')) return '🏪';
    if (item.includes('berhenti')) return '⏸️';
    return '🌱';
  };

  return (
    <div className="space-y-6">
      {/* Banner Penjelasan Bagian B */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border-2 border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-blue-950">
              Bagian B: Riwayat Pengalaman & Keterampilan
            </h2>
            <p className="text-sm sm:text-base text-blue-900/90 mt-1 leading-relaxed">
              Pengalaman dan keterampilan yang Bapak/Ibu miliki menjadi dasar penting dalam menentukan arah pendampingan usaha yang tepat.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Pengalaman Usaha */}
      <div className="space-y-3">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          1. Apakah Bapak/Ibu pernah atau sedang menjalankan usaha sendiri? <span className="text-rose-600 font-black">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PENGALAMAN_USAHA_LIST.map((item) => {
            const isSelected = data.pengalamanUsaha === item;
            return (
              <button
                type="button"
                key={item}
                onClick={() => onChange({ pengalamanUsaha: item })}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 text-left transition duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-blue-700 bg-blue-50/90 text-blue-950 font-extrabold shadow-sm ring-2 ring-blue-500/40'
                    : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getExperienceIcon(item)}</span>
                  <span className="text-sm sm:text-base">{item}</span>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 ml-2">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Bidang Pernah Dijalankan */}
      {data.pengalamanUsaha && data.pengalamanUsaha !== 'Belum pernah' && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <label className="block text-base sm:text-lg font-bold text-slate-900">
            2. Bidang usaha apa yang pernah atau sedang ditekuni?
            <span className="text-xs font-normal text-slate-500 block sm:inline sm:ml-2">
              (Boleh pilih lebih dari satu)
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {BIDANG_USAHA_LIST.map((item) => {
              const isChecked = data.bidangPernahDijalankan.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    onChange({
                      bidangPernahDijalankan: toggleCheckbox(data.bidangPernahDijalankan, item)
                    })
                  }
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition duration-150 cursor-pointer text-sm sm:text-base ${
                    isChecked
                      ? 'border-blue-700 bg-blue-700 text-white font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700 font-medium'
                  }`}
                >
                  <span className="leading-tight">{item}</span>
                  {isChecked && <Check className="w-4 h-4 shrink-0 ml-1 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Keterampilan yang Dimiliki */}
      <div className="space-y-3 pt-3 border-t border-slate-200">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          {data.pengalamanUsaha === 'Belum pernah' ? '2.' : '3.'} Keterampilan atau Keahlian yang Bapak/Ibu Miliki Saat Ini: <span className="text-rose-600 font-black">*</span>
          <span className="text-xs font-normal text-slate-500 block sm:inline sm:ml-2">
            (Pilih keterampilan yang dikuasai)
          </span>
        </label>
        
        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-center gap-2 font-medium">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Bapak/Ibu dapat memilih lebih dari satu keterampilan di bawah ini:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {KETERAMPILAN_LIST.map((item) => {
            const isChecked = data.keterampilan.includes(item);
            return (
              <button
                type="button"
                key={item}
                onClick={() =>
                  onChange({
                    keterampilan: toggleCheckbox(data.keterampilan, item)
                  })
                }
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition duration-150 cursor-pointer text-sm sm:text-base ${
                  isChecked
                    ? 'border-blue-700 bg-blue-700 text-white font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700 font-medium'
                }`}
              >
                <span className="leading-tight">{item}</span>
                {isChecked && <Check className="w-4 h-4 shrink-0 ml-1 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
