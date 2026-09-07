import React from 'react';
import { SurveyData } from '../types/survey';
import { BIDANG_USAHA_LIST } from '../data/surveyQuestions';
import { Target, Check } from 'lucide-react';

interface Props {
  data: SurveyData;
  onChange: (fields: Partial<SurveyData>) => void;
}

const SECTOR_EMOJIS: Record<string, string> = {
  'Pertanian': '🌾',
  'Perikanan': '🐟',
  'Perkebunan': '🌴',
  'Peternakan': '🐄',
  'Ekspedisi/pengiriman barang': '📦',
  'Perdagangan grosir': '🏪',
  'Cuci kendaraan': '🚗',
  'Rental kendaraan': '🚘',
  'Kos/sewa properti': '🏠',
  'Laundry': '🧺',
  'Kuliner': '🍽️',
  'Perdagangan eceran': '🛒',
  'Usaha online/digital': '📱',
  'Jasa': '💼',
  'Lainnya': '✨'
};

const CONFIDENCE_LEVELS = [
  { val: 1, emoji: '😟', label: 'Belum Yakin / Ragu' },
  { val: 2, emoji: '🙁', label: 'Kurang Yakin' },
  { val: 3, emoji: '😐', label: 'Cukup Yakin' },
  { val: 4, emoji: '🙂', label: 'Yakin & Siap' },
  { val: 5, emoji: '🌟', label: 'Sangat Yakin & Mantap' }
];

export const StepInterest: React.FC<Props> = ({ data, onChange }) => {
  const toggleBidangDiminati = (item: string) => {
    const exists = data.bidangDiminati.includes(item);
    if (exists) {
      const updated = data.bidangDiminati.filter((i) => i !== item);
      const updatedPrioritas = data.prioritasUtama === item ? (updated[0] || '') : data.prioritasUtama;
      onChange({
        bidangDiminati: updated,
        prioritasUtama: updatedPrioritas
      });
    } else {
      if (data.bidangDiminati.length >= 3) {
        alert('Bapak/Ibu hanya dapat memilih maksimal 3 bidang usaha.');
        return;
      }
      const updated = [...data.bidangDiminati, item];
      onChange({
        bidangDiminati: updated,
        prioritasUtama: data.prioritasUtama || item
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Penjelasan Bagian C */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border-2 border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-blue-950">
              Bagian C: Peminatan Bidang Usaha
            </h2>
            <p className="text-sm sm:text-base text-blue-900/90 mt-1 leading-relaxed">
              Pilih bidang usaha yang paling menarik minat Bapak/Ibu. Silakan pilih <strong>maksimal 3 bidang</strong> dengan mengklik kotak di bawah ini.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Pilih Maksimal 3 Bidang Usaha */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="block text-base sm:text-lg font-bold text-slate-900">
            1. Pilih Maksimal 3 Bidang Usaha yang Paling Diminati <span className="text-rose-600 font-black">*</span>
          </label>
          <span className="text-sm font-extrabold px-3 py-1.5 rounded-xl bg-blue-100 text-blue-900 border border-blue-300 self-start sm:self-auto">
            Sudah Dipilih: {data.bidangDiminati.length} dari 3
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {BIDANG_USAHA_LIST.map((item) => {
            const isChecked = data.bidangDiminati.includes(item);
            const isDisabled = !isChecked && data.bidangDiminati.length >= 3;
            const emoji = SECTOR_EMOJIS[item] || '💼';

            return (
              <button
                type="button"
                key={item}
                onClick={() => toggleBidangDiminati(item)}
                disabled={isDisabled}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 text-left transition duration-150 cursor-pointer ${
                  isChecked
                    ? 'border-blue-800 bg-blue-800 text-white shadow-md ring-2 ring-blue-500/50'
                    : isDisabled
                    ? 'border-slate-200 bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'
                    : 'border-slate-200 hover:border-blue-500 bg-white text-slate-800 hover:bg-blue-50/50 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl shrink-0">{emoji}</span>
                  <span className="text-sm sm:text-base font-bold leading-snug">{item}</span>
                </div>
                {isChecked && (
                  <div className="w-6 h-6 rounded-full bg-white text-blue-900 flex items-center justify-center shrink-0 ml-2">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Pilih Prioritas Utama */}
      {data.bidangDiminati.length > 0 && (
        <div className="space-y-3 pt-4 border-t-2 border-slate-200">
          <label className="block text-base sm:text-lg font-bold text-slate-900">
            2. Jika Hanya Boleh Memilih 1, Manakah yang Menjadi{' '}
            <span className="text-blue-800 underline font-black">Prioritas Paling Utama</span> Bapak/Ibu? <span className="text-rose-600 font-black">*</span>
          </label>
          <p className="text-xs sm:text-sm text-slate-600">
            * Pilihan ini akan menentukan pertanyaan pendalaman jenis komoditas khusus pada langkah selanjutnya.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.bidangDiminati.map((item) => {
              const isSelected = data.prioritasUtama === item;
              const emoji = SECTOR_EMOJIS[item] || '💼';

              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => onChange({ prioritasUtama: item })}
                  className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 text-left transition duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-blue-800 bg-blue-50 text-blue-950 font-black shadow-sm ring-4 ring-blue-500/20'
                      : 'border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-base">{item}</span>
                  </div>
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
      )}

      {/* 3. Alasan Memilih Usaha */}
      <div className="space-y-2 pt-3 border-t-2 border-slate-200">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          3. Alasan Bapak/Ibu Memilih Bidang Usaha Tersebut: <span className="text-rose-600 font-black">*</span>
        </label>
        <textarea
          rows={3}
          required
          placeholder="Tuliskan alasan Bapak/Ibu di sini..."
          value={data.alasanPrioritas}
          onChange={(e) => onChange({ alasanPrioritas: e.target.value })}
          className="w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 border-slate-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-500/20 bg-white font-medium shadow-2xs"
        />
      </div>

      {/* 4. Tingkat Keyakinan Usaha */}
      <div className="space-y-3 pt-3 border-t-2 border-slate-200">
        <label className="block text-base sm:text-lg font-bold text-slate-900">
          4. Seberapa Yakin Bapak/Ibu Akan Berhasil Menjalankan Usaha Tersebut? <span className="text-rose-600 font-black">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {CONFIDENCE_LEVELS.map((item) => {
            const isSelected = data.keyakinanUsaha === item.val;
            return (
              <button
                type="button"
                key={item.val}
                onClick={() => onChange({ keyakinanUsaha: item.val })}
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
    </div>
  );
};
