import React, { useState, useEffect } from 'react';
import { SurveyData } from '../types/survey';
import { MasterPegawai } from '../types/pegawai';
import { OPD_LIST, TAHUN_PENSIUN_LIST, PENDIDIKAN_LIST, DOMISILI_LIST } from '../data/surveyQuestions';
import { User, Check, Sparkles, CheckCircle2, Search } from 'lucide-react';

interface Props {
  data: SurveyData;
  onChange: (fields: Partial<SurveyData>) => void;
  masterPegawai?: MasterPegawai[];
}

export const StepIdentity: React.FC<Props> = ({ data, onChange, masterPegawai = [] }) => {
  const [nipSearch, setNipSearch] = useState(data.nip || '');
  const [matchFound, setMatchFound] = useState<MasterPegawai | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Cari di database master pegawai saat NIP berubah
  useEffect(() => {
    const clean = nipSearch.trim();
    if (clean.length >= 8) {
      const found = masterPegawai.find((p) => p.nip.replace(/\s+/g, '') === clean.replace(/\s+/g, ''));
      if (found) {
        setMatchFound(found);
        onChange({
          nip: found.nip,
          nama: found.nama,
          unitKerja: found.unitKerja,
          jabatan: found.jabatan,
          tahunPensiun: found.tahunPensiun || data.tahunPensiun,
          usia: found.usia || data.usia,
          pendidikan: found.pendidikan || data.pendidikan
        });
      } else {
        setMatchFound(null);
      }
    } else {
      setMatchFound(null);
    }
  }, [nipSearch, masterPegawai]);

  const handleSelectPegawai = (pegawai: MasterPegawai) => {
    setNipSearch(pegawai.nip);
    setMatchFound(pegawai);
    setShowSuggestions(false);
    onChange({
      nip: pegawai.nip,
      nama: pegawai.nama,
      unitKerja: pegawai.unitKerja,
      jabatan: pegawai.jabatan,
      tahunPensiun: pegawai.tahunPensiun || data.tahunPensiun,
      usia: pegawai.usia || data.usia,
      pendidikan: pegawai.pendidikan || data.pendidikan
    });
  };

  const suggestions = nipSearch.trim()
    ? masterPegawai
        .filter(
          (p) =>
            p.nip.includes(nipSearch.trim()) ||
            p.nama.toLowerCase().includes(nipSearch.trim().toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      {/* Banner Penjelasan Bagian A */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border-2 border-blue-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-blue-950">
              Bagian A: Identitas Pegawai
            </h2>
            <p className="text-sm sm:text-base text-blue-900/90 mt-1 leading-relaxed">
              Masukkan <strong>NIP Bapak/Ibu</strong> pada kolom pertama di bawah. Sistem akan <strong>secara otomatis mengisi Nama, Jabatan, OPD, dan Rencana Pensiun</strong> dari Database Transformers 2026 BKPSDM.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NIP TERLETAK PALING ATAS DENGAN AUTO-FILL DETECTION */}
        <div className="space-y-2 md:col-span-2 relative">
          <div className="flex items-center justify-between">
            <label className="block text-base font-bold text-slate-900 flex items-center gap-2">
              <span>1. NIP (Nomor Induk Pegawai)</span>
              <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" /> Auto-Fill Otomatis
              </span>
            </label>
            <span className="text-xs text-slate-500 font-medium">
              Ketik 18 digit NIP Anda
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Ketik NIP Bapak/Ibu di sini (Contoh: 196810091990031001)..."
              value={nipSearch}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setNipSearch(e.target.value);
                onChange({ nip: e.target.value });
              }}
              className="w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 border-slate-300 focus:border-blue-800 focus:ring-4 focus:ring-blue-500/20 bg-white font-mono font-bold text-blue-950 shadow-2xs"
            />
            {matchFound && (
              <div className="absolute right-3.5 top-3.5 flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg text-xs font-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Terverifikasi</span>
              </div>
            )}
          </div>

          {/* Rekomendasi / Saran NIP jika belum hafal 18 digit penuh */}
          {showSuggestions && suggestions.length > 0 && !matchFound && (
            <div className="absolute z-20 w-full mt-1 bg-white border-2 border-blue-300 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100">
              <div className="px-4 py-2 bg-blue-50 text-xs font-bold text-blue-950 flex items-center justify-between">
                <span>Pilih Pegawai yang Cocok (Klik untuk Auto-Fill):</span>
                <span className="text-slate-500 font-normal">Database Transformers 2026</span>
              </div>
              {suggestions.map((pegawai) => (
                <button
                  type="button"
                  key={pegawai.nip}
                  onClick={() => handleSelectPegawai(pegawai)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50/80 transition flex items-center justify-between text-xs sm:text-sm cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{pegawai.nama}</span>
                    <span className="font-mono text-xs text-blue-900">{pegawai.nip}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-700 block max-w-[240px] truncate">{pegawai.unitKerja}</span>
                    <span className="text-xs text-slate-500 block max-w-[240px] truncate">{pegawai.jabatan}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Notifikasi Data Ditemukan */}
          {matchFound && (
            <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs sm:text-sm space-y-1">
              <div className="flex items-center gap-2 font-black text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Data Pegawai Terverifikasi di Database Transformers 2026:</span>
              </div>
              <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-700 text-xs">
                <div><strong>Nama:</strong> {matchFound.nama}</div>
                <div><strong>OPD:</strong> {matchFound.unitKerja}</div>
                <div><strong>Jabatan:</strong> {matchFound.jabatan}</div>
                {matchFound.pangkat && <div><strong>Pangkat/Gol:</strong> {matchFound.pangkat}</div>}
                {matchFound.tahunPensiun && <div><strong>Rencana Pensiun:</strong> Tahun {matchFound.tahunPensiun}</div>}
                {matchFound.usia && <div><strong>Usia Saat Ini:</strong> {matchFound.usia} Tahun</div>}
              </div>
            </div>
          )}
        </div>

        {/* Nama Lengkap */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-base font-bold text-slate-900">
            2. Nama Lengkap & Gelar <span className="text-rose-600 font-black">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Drs. H. Ahmad Sudirman, M.Si."
            value={data.nama}
            onChange={(e) => onChange({ nama: e.target.value })}
            className={`w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 border-slate-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-500/20 font-medium shadow-2xs ${
              matchFound ? 'bg-emerald-50/40 border-emerald-300' : 'bg-white'
            }`}
          />
        </div>

        {/* Instansi / Unit Kerja */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-base font-bold text-slate-900">
            3. Perangkat Daerah / Instansi / Unit Kerja (OPD) <span className="text-rose-600 font-black">*</span>
          </label>
          <select
            value={data.unitKerja}
            onChange={(e) => onChange({ unitKerja: e.target.value })}
            className={`w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 border-slate-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-500/20 font-semibold text-slate-800 shadow-2xs cursor-pointer ${
              matchFound ? 'bg-emerald-50/40 border-emerald-300' : 'bg-white'
            }`}
          >
            <option value="">-- Pilih Perangkat Daerah / Unit Kerja --</option>
            {OPD_LIST.map((opd) => (
              <option key={opd} value={opd}>
                {opd}
              </option>
            ))}
          </select>
        </div>

        {/* Jabatan Terakhir */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-slate-900">
            4. Jabatan Terakhir <span className="text-rose-600 font-black">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Kepala Bidang / Guru Madya / Staf"
            value={data.jabatan}
            onChange={(e) => onChange({ jabatan: e.target.value })}
            className={`w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 border-slate-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-500/20 font-medium shadow-2xs ${
              matchFound ? 'bg-emerald-50/40 border-emerald-300' : 'bg-white'
            }`}
          />
        </div>

        {/* Usia */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-slate-900">
            5. Usia Saat Ini (Tahun) <span className="text-rose-600 font-black">*</span>
          </label>
          <input
            type="number"
            min="40"
            max="75"
            placeholder="Contoh: 57"
            value={data.usia}
            onChange={(e) => onChange({ usia: e.target.value })}
            className="w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 border-slate-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-500/20 bg-white font-medium shadow-2xs"
          />
        </div>

        {/* Tahun Pensiun */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-base font-bold text-slate-900">
            6. Tahun Perkiraan Mulai Purna Tugas <span className="text-rose-600 font-black">*</span>
          </label>
          <select
            value={data.tahunPensiun}
            onChange={(e) => onChange({ tahunPensiun: e.target.value })}
            className="w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 border-slate-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-500/20 bg-white font-semibold text-slate-800 shadow-2xs cursor-pointer"
          >
            <option value="">-- Pilih Tahun Pensiun --</option>
            {TAHUN_PENSIUN_LIST.map((th) => (
              <option key={th} value={th}>
                Tahun {th}
              </option>
            ))}
          </select>
        </div>

        {/* Pendidikan Terakhir */}
        <div className="space-y-3 md:col-span-2 pt-2 border-t border-slate-200">
          <label className="block text-base font-bold text-slate-900">
            7. Pendidikan Terakhir <span className="text-rose-600 font-black">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PENDIDIKAN_LIST.map((item) => {
              const isSelected = data.pendidikan === item;
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => onChange({ pendidikan: item })}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-blue-700 bg-blue-50 text-blue-950 font-extrabold shadow-sm ring-2 ring-blue-500/30'
                      : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700 font-medium'
                  }`}
                >
                  <span className="text-sm sm:text-base">{item}</span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 ml-1">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Domisili Purna Tugas */}
        <div className="space-y-3 md:col-span-2 pt-2 border-t border-slate-200">
          <label className="block text-base font-bold text-slate-900">
            8. Rencana Tempat Tinggal (Domisili) Setelah Purna Tugas <span className="text-rose-600 font-black">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOMISILI_LIST.map((item) => {
              const isSelected = data.domisili === item;
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => onChange({ domisili: item })}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-blue-700 bg-blue-50 text-blue-950 font-extrabold shadow-sm ring-2 ring-blue-500/30'
                      : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700 font-medium'
                  }`}
                >
                  <span className="text-sm sm:text-base">{item}</span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 ml-1">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
