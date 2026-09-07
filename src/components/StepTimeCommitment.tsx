import React from 'react';
import { SurveyData } from '../types/survey';
import {
  WAKTU_HARIAN_LIST,
  MODEL_KETERLIBATAN_LIST,
  TOPIK_PELATIHAN_LIST,
  BENTUK_PENDAMPINGAN_LIST,
  PENDAMPINGAN_KOMITMEN_LIST
} from '../data/surveyQuestions';
import { Clock, Check } from 'lucide-react';

interface Props {
  data: SurveyData;
  onChange: (fields: Partial<SurveyData>) => void;
}

const TRAINING_LEVELS = [
  { val: 1, emoji: '✋', label: 'Belum Bersedia / Sibuk' },
  { val: 2, emoji: '🙁', label: 'Agak Kurang Bersedia' },
  { val: 3, emoji: '😐', label: 'Bersedia Bila Waktu Cocok' },
  { val: 4, emoji: '🙂', label: 'Cukup Bersedia Ikut' },
  { val: 5, emoji: '🚀', label: 'Sangat Antusias & Bersedia' }
];

export const StepTimeCommitment: React.FC<Props> = ({ data, onChange }) => {
  const toggleArrayItem = (list: string[], item: string): string[] => {
    if (list.includes(item)) {
      return list.filter((i) => i !== item);
    } else {
      return [...list, item];
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Penjelasan Bagian F & G */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border-2 border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-blue-950">
              Bagian F & G: Waktu Usaha & Kebutuhan Pembekalan
            </h2>
            <p className="text-sm sm:text-base text-blue-900/90 mt-1 leading-relaxed">
              BKPSDM ingin memastikan materi pelatihan disesuaikan dengan topik yang benar-benar Bapak/Ibu butuhkan dan waktu luang yang tersedia.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Waktu Harian */}
      <div className="space-y-3">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          1. Waktu Luang per Hari yang Siap Dialokasikan untuk Usaha: <span className="text-rose-600 font-black">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {WAKTU_HARIAN_LIST.map((item) => {
            const isSelected = data.waktuHarian === item;
            return (
              <button
                type="button"
                key={item}
                onClick={() => onChange({ waktuHarian: item })}
                className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-blue-800 bg-blue-50 text-blue-950 font-black shadow-sm ring-2 ring-blue-500/30'
                    : 'border-slate-200 hover:border-slate-400 bg-white text-slate-800 font-medium'
                }`}
              >
                <span className="text-sm sm:text-base">{item}</span>
                {isSelected && <Check className="w-4 h-4 text-blue-800 ml-1 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Model Keterlibatan */}
      <div className="space-y-3 pt-3 border-t-2 border-slate-200">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          2. Model Pengelolaan Usaha yang Diinginkan: <span className="text-rose-600 font-black">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODEL_KETERLIBATAN_LIST.map((item) => {
            const isSelected = data.modelKeterlibatan === item;
            return (
              <button
                type="button"
                key={item}
                onClick={() => onChange({ modelKeterlibatan: item })}
                className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-blue-800 bg-blue-50 text-blue-950 font-black shadow-sm ring-2 ring-blue-500/30'
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

      {/* 3. Kesediaan Pelatihan */}
      <div className="space-y-3 pt-3 border-t-2 border-slate-200">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          3. Tingkat Kesediaan Mengikuti Program Pelatihan Wirausaha BKPSDM: <span className="text-rose-600 font-black">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {TRAINING_LEVELS.map((item) => {
            const isSelected = data.kesediaanPelatihan === item.val;
            return (
              <button
                type="button"
                key={item.val}
                onClick={() => onChange({ kesediaanPelatihan: item.val })}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-blue-800 bg-blue-800 text-white shadow-md ring-4 ring-blue-500/30'
                    : 'border-slate-200 hover:border-blue-400 bg-white text-slate-700 hover:bg-blue-50/40'
                }`}
              >
                <span className="text-3xl sm:text-4xl mb-1">{item.emoji}</span>
                <span className="text-lg font-black">{item.val}</span>
                <span className={`text-xs mt-0.5 leading-tight font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Topik Pelatihan */}
      <div className="space-y-3 pt-3 border-t-2 border-slate-200">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          4. Topik Pelatihan yang Paling Bapak/Ibu Butuhkan: <span className="text-rose-600 font-black">*</span>
          <span className="text-xs font-normal text-slate-500 block sm:inline sm:ml-2">
            (Pilih materi yang ingin dipelajari)
          </span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TOPIK_PELATIHAN_LIST.map((item) => {
            const isChecked = data.topikPelatihan.includes(item);
            return (
              <button
                type="button"
                key={item}
                onClick={() =>
                  onChange({
                    topikPelatihan: toggleArrayItem(data.topikPelatihan, item)
                  })
                }
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition duration-150 cursor-pointer text-sm sm:text-base ${
                  isChecked
                    ? 'border-blue-800 bg-blue-800 text-white font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-400 bg-white text-slate-800 font-medium'
                }`}
              >
                <span className="leading-snug">{item}</span>
                {isChecked && <Check className="w-4 h-4 shrink-0 ml-1 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Bentuk Pendampingan */}
      <div className="space-y-3 pt-3 border-t-2 border-slate-200">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          5. Bentuk Pendampingan yang Paling Diharapkan: <span className="text-rose-600 font-black">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BENTUK_PENDAMPINGAN_LIST.map((item) => {
            const isChecked = data.bentukPendampingan.includes(item);
            return (
              <button
                type="button"
                key={item}
                onClick={() =>
                  onChange({
                    bentukPendampingan: toggleArrayItem(data.bentukPendampingan, item)
                  })
                }
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition duration-150 cursor-pointer text-sm sm:text-base ${
                  isChecked
                    ? 'border-blue-800 bg-blue-800 text-white font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-400 bg-white text-slate-800 font-medium'
                }`}
              >
                <span className="leading-snug">{item}</span>
                {isChecked && <Check className="w-4 h-4 shrink-0 ml-1 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Komitmen Pendampingan 6-12 Bulan */}
      <div className="space-y-3 pt-3 border-t-2 border-slate-200">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          6. Apakah Bersedia Didampingi Mentor Usaha Selama 6 – 12 Bulan? <span className="text-rose-600 font-black">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PENDAMPINGAN_KOMITMEN_LIST.map((item) => {
            const isSelected = data.kesediaanPendampingan === item;
            return (
              <button
                type="button"
                key={item}
                onClick={() => onChange({ kesediaanPendampingan: item })}
                className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-blue-800 bg-blue-50 text-blue-950 font-black shadow-sm ring-2 ring-blue-500/30'
                    : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700 font-medium'
                }`}
              >
                <span className="text-sm sm:text-base">{item}</span>
                {isSelected && <Check className="w-4 h-4 text-blue-800 shrink-0 ml-1 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
