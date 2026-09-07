import React, { useState, useEffect } from 'react';
import { SurveyData } from '../types/survey';
import { MasterPegawai } from '../types/pegawai';
import { OPD_LIST, TAHUN_PENSIUN_LIST, PENDIDIKAN_LIST, DOMISILI_LIST } from '../data/surveyQuestions';
import { User, Check, Sparkles, CheckCircle2, Search, Lock } from 'lucide-react';

interface Props {
  data: SurveyData;
  onChange: (fields: Partial<SurveyData>) => void;
  masterPegawai?: MasterPegawai[];
}

export const StepIdentity: React.FC<Props> = ({ data, onChange, masterPegawai = [] }) => {
  const [nipSearch, setNipSearch] = useState(data.nip || '');
  const [matchFound, setMatchFound] = useState<MasterPegawai | null>(null);
  const [notFoundNotice, setNotFoundNotice] = useState(false);

  // Verifikasi KETAT: Hanya cocokkan jika 18 DIGIT NIP LENGKAP dimasukkan (Exact Match)
  // Tidak ada dropdown / saran nama orang lain agar kerahasiaan data terjaga 100%
  useEffect(() => {
    const clean = nipSearch.replace(/\D/g, '').trim();
    if (clean.length === 18) {
      const found = masterPegawai.find((p) => p.nip.replace(/\D/g, '') === clean);
      if (found) {
        setMatchFound(found);
        setNotFoundNotice(false);
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
        setNotFoundNotice(true);
      }
    } else {
      setMatchFound(null);
      setNotFoundNotice(false);
    }
  }, [nipSearch, masterPegawai]);

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
              maxLength={18}
              placeholder="Masukkan 18 digit NIP Anda (Contoh: 197108142014062001)..."
              value={nipSearch}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ''); // Hanya terima angka
                setNipSearch(val);
                onChange({ nip: val });
              }}
              className="w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 border-slate-300 focus:border-blue-800 focus:ring-4 focus:ring-blue-500/20 bg-white font-mono font-bold text-blue-950 shadow-2xs tracking-wider"
            />
            {matchFound && (
              <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-lg text-xs font-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>NIP Terverifikasi</span>
              </div>
            )}
          </div>

          {/* Notifikasi Ramah jika 18 digit terisi tapi tidak ada di database */}
          {notFoundNotice && nipSearch.length === 18 && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
              <span>NIP tidak terdaftar di database Transformers 2026. Bapak/Ibu dapat mengisi Nama dan Perangkat Daerah secara manual di bawah ini.</span>
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

        {/* Nama Lengkap (Terkunci jika auto-fill dari NIP aktif) */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="block text-base font-bold text-slate-900">
              2. Nama Lengkap & Gelar <span className="text-rose-600 font-black">*</span>
            </label>
            {matchFound && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" /> Terkunci otomatis dari NIP
              </span>
            )}
          </div>
          <input
            type="text"
            required
            disabled={!!matchFound}
            placeholder="Contoh: Drs. H. Ahmad Sudirman, M.Si."
            value={data.nama}
            onChange={(e) => onChange({ nama: e.target.value })}
            className={`w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 font-medium shadow-2xs transition ${
              matchFound
                ? 'bg-slate-100 border-slate-300 text-slate-700 font-bold cursor-not-allowed select-none'
                : 'bg-white border-slate-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-500/20 text-slate-900'
            }`}
          />
        </div>

        {/* Instansi / Unit Kerja (Terkunci jika auto-fill dari NIP aktif) */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="block text-base font-bold text-slate-900">
              3. Perangkat Daerah / Instansi / Unit Kerja (OPD) <span className="text-rose-600 font-black">*</span>
            </label>
            {matchFound && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" /> Terkunci otomatis dari NIP
              </span>
            )}
          </div>
          <select
            disabled={!!matchFound}
            value={data.unitKerja}
            onChange={(e) => onChange({ unitKerja: e.target.value })}
            className={`w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 font-semibold shadow-2xs transition ${
              matchFound
                ? 'bg-slate-100 border-slate-300 text-slate-700 font-bold cursor-not-allowed opacity-90'
                : 'bg-white border-slate-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-500/20 text-slate-800 cursor-pointer'
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

        {/* Jabatan Terakhir (Terkunci jika auto-fill dari NIP aktif) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-base font-bold text-slate-900">
              4. Jabatan Terakhir <span className="text-rose-600 font-black">*</span>
            </label>
            {matchFound && (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" /> Terkunci
              </span>
            )}
          </div>
          <input
            type="text"
            disabled={!!matchFound}
            placeholder="Contoh: Kepala Bidang / Guru Madya / Staf"
            value={data.jabatan}
            onChange={(e) => onChange({ jabatan: e.target.value })}
            className={`w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 font-medium shadow-2xs transition ${
              matchFound
                ? 'bg-slate-100 border-slate-300 text-slate-700 font-bold cursor-not-allowed select-none'
                : 'bg-white border-slate-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-500/20 text-slate-900'
            }`}
          />
        </div>

        {/* Usia (Terkunci jika auto-fill dari NIP aktif) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-base font-bold text-slate-900">
              5. Usia Saat Ini (Tahun) <span className="text-rose-600 font-black">*</span>
            </label>
            {matchFound && (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" /> Terkunci
              </span>
            )}
          </div>
          <input
            type="number"
            min="40"
            max="75"
            disabled={!!matchFound}
            placeholder="Contoh: 57"
            value={data.usia}
            onChange={(e) => onChange({ usia: e.target.value })}
            className={`w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 font-medium shadow-2xs transition ${
              matchFound
                ? 'bg-slate-100 border-slate-300 text-slate-700 font-bold cursor-not-allowed select-none'
                : 'bg-white border-slate-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-500/20 text-slate-900'
            }`}
          />
        </div>

        {/* Tahun Pensiun (Terkunci jika auto-fill dari NIP aktif) */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="block text-base font-bold text-slate-900">
              6. Tahun Perkiraan Mulai Purna Tugas <span className="text-rose-600 font-black">*</span>
            </label>
            {matchFound && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" /> Terkunci otomatis dari NIP
              </span>
            )}
          </div>
          <select
            disabled={!!matchFound}
            value={data.tahunPensiun}
            onChange={(e) => onChange({ tahunPensiun: e.target.value })}
            className={`w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 font-semibold shadow-2xs transition ${
              matchFound
                ? 'bg-slate-100 border-slate-300 text-slate-700 font-bold cursor-not-allowed opacity-90'
                : 'bg-white border-slate-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-500/20 text-slate-800 cursor-pointer'
            }`}
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
