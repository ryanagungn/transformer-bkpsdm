import React from 'react';
import { SurveyData } from '../types/survey';
import { SEKTOR_KHUSUS } from '../data/surveyQuestions';
import { Compass, Check } from 'lucide-react';

interface Props {
  data: SurveyData;
  onChange: (fields: Partial<SurveyData>) => void;
}

export const StepSectorDetail: React.FC<Props> = ({ data, onChange }) => {
  const prioritas = data.prioritasUtama || '';

  let activeSectorKey: keyof typeof SEKTOR_KHUSUS = 'lainnya';
  let activeField: keyof SurveyData = 'khususLainnya';

  if (prioritas.includes('Pertanian')) {
    activeSectorKey = 'pertanian';
    activeField = 'khususPertanian';
  } else if (prioritas.includes('Perikanan')) {
    activeSectorKey = 'perikanan';
    activeField = 'khususPerikanan';
  } else if (prioritas.includes('Perkebunan')) {
    activeSectorKey = 'perkebunan';
    activeField = 'khususPerkebunan';
  } else if (prioritas.includes('Peternakan')) {
    activeSectorKey = 'peternakan';
    activeField = 'khususPeternakan';
  } else if (prioritas.includes('Ekspedisi')) {
    activeSectorKey = 'ekspedisi';
    activeField = 'khususEkspedisi';
  } else if (prioritas.includes('Grosir')) {
    activeSectorKey = 'grosir';
    activeField = 'khususGrosir';
  } else if (prioritas.includes('Cuci')) {
    activeSectorKey = 'cuciKendaraan';
    activeField = 'khususCuciKendaraan';
  } else {
    activeSectorKey = 'lainnya';
    activeField = 'khususLainnya';
  }

  const sectorConfig = SEKTOR_KHUSUS[activeSectorKey];
  const selectedValues = (data[activeField] as string[]) || [];

  const toggleOption = (option: string) => {
    let updated: string[];
    if (selectedValues.includes(option)) {
      updated = selectedValues.filter((item) => item !== option);
    } else {
      updated = [...selectedValues, option];
    }
    onChange({ [activeField]: updated });
  };

  return (
    <div className="space-y-6">
      {/* Banner Penjelasan Bagian Khusus */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border-2 border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
              Pendalaman Khusus Bidang Pilihan:
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-blue-950 mt-0.5">
              {sectorConfig.title}
            </h2>
            <p className="text-sm sm:text-base text-blue-900/90 mt-1 leading-relaxed">
              {sectorConfig.desc} Silakan klik pada jenis komoditas atau layanan yang paling diminati.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-base sm:text-lg font-bold text-slate-900">
            Pilihan Spesifik Subsektor / Komoditas: <span className="text-rose-600 font-black">*</span>
          </label>
          <span className="text-xs sm:text-sm font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
            Boleh pilih lebih dari satu
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {sectorConfig.options.map((option) => {
            const isChecked = selectedValues.includes(option);
            return (
              <button
                type="button"
                key={option}
                onClick={() => toggleOption(option)}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 text-left transition duration-150 cursor-pointer ${
                  isChecked
                    ? 'border-blue-800 bg-blue-50 text-blue-950 font-extrabold shadow-sm ring-2 ring-blue-500/30'
                    : 'border-slate-200 hover:border-slate-400 bg-white text-slate-800 font-semibold'
                }`}
              >
                <span className="text-sm sm:text-base pr-2 leading-snug">{option}</span>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition ${
                    isChecked
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'border-2 border-slate-300 bg-slate-50'
                  }`}
                >
                  {isChecked && <Check className="w-5 h-5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
