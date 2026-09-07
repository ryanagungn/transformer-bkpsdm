import React, { useState, useEffect } from 'react';
import { SurveyData } from '../types/survey';
import { MasterPegawai } from '../types/pegawai';
import { PENDIDIKAN_LIST, DOMISILI_LIST } from '../data/surveyQuestions';
import { User, Check, Sparkles, CheckCircle2, Lock, AlertCircle, ShieldAlert } from 'lucide-react';

interface Props {
  data: SurveyData;
  onChange: (fields: Partial<SurveyData>) => void;
  masterPegawai?: MasterPegawai[];
}

export const StepIdentity: React.FC<Props> = ({ data, onChange, masterPegawai = [] }) => {
  const [nipSearch, setNipSearch] = useState(data.nip || '');
  const [matchFound, setMatchFound] = useState<MasterPegawai | null>(null);
  const [notFoundNotice, setNotFoundNotice] = useState(false);

  const cleanNip = nipSearch.replace(/\D/g, '').trim();

  // VERIFIKASI MUTLAK:
  // Data nomor 2 s.d 6 HANYA BISA TERISI OTOMATIS dari NIP yang terdaftar di Database Transformers 2026.
  // Sama sekali tidak ada mode manual.
  useEffect(() => {
    if (cleanNip.length === 18) {
      const found = masterPegawai.find((p) => p.nip.replace(/\D/g, '') === cleanNip);
      if (found) {
        setMatchFound(found);
        setNotFoundNotice(false);
        onChange({
          nip: found.nip,
          nama: found.nama,
          unitKerja: found.unitKerja,
          jabatan: found.jabatan,
          tahunPensiun: found.tahunPensiun || '2026',
          usia: found.usia || '56',
          pendidikan: found.pendidikan || data.pendidikan
        });
      } else {
        setMatchFound(null);
        setNotFoundNotice(true);
        onChange({
          nama: '',
          unitKerja: '',
          jabatan: '',
          usia: '',
          tahunPensiun: ''
        });
      }
    } else {
      setMatchFound(null);
      setNotFoundNotice(false);
      onChange({
        nama: '',
        unitKerja: '',
        jabatan: '',
        usia: '',
        tahunPensiun: ''
      });
    }
  }, [cleanNip, masterPegawai]);

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
              Bagian A: Identitas Pegawai (Khusus ASN Terdaftar)
            </h2>
            <p className="text-sm sm:text-base text-blue-900/90 mt-1 leading-relaxed">
              Survei ini <strong>hanya dapat diisi oleh ASN yang terdaftar dalam Database Transformers 2026 BKPSDM Kab. Majalengka</strong>. Cukup masukkan 18 digit NIP Anda pada kolom nomor 1. Seluruh data resmi akan otomatis terverifikasi dan terkunci. Pengisian manual tidak diizinkan.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. NIP TERLETAK PALING ATAS */}
        <div className="space-y-2 md:col-span-2 relative">
          <div className="flex items-center justify-between">
            <label className="block text-base font-bold text-slate-900 flex items-center gap-2">
              <span>1. NIP (Nomor Induk Pegawai)</span>
              <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" /> Kunci Verifikasi Resmi
              </span>
            </label>
            <span className="text-xs text-slate-500 font-medium">
              Wajib 18 digit NIP terdaftar
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              maxLength={18}
              placeholder="Masukkan 18 digit NIP Anda (Contoh: 197108142014062001)..."
              value={nipSearch}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setNipSearch(val);
                onChange({ nip: val });
              }}
              className="w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 border-slate-300 focus:border-blue-800 focus:ring-4 focus:ring-blue-500/20 bg-white font-mono font-bold text-blue-950 shadow-2xs tracking-wider"
            />
            {matchFound && (
              <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-lg text-xs font-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>NIP Terverifikasi Resmi</span>
              </div>
            )}
          </div>

          {/* Peringatan jika NIP 18 digit tidak terdaftar */}
          {notFoundNotice && cleanNip.length === 18 && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 text-xs sm:text-sm font-bold flex items-start gap-3 animate-in fade-in duration-200">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-black text-rose-900 block">
                  NIP Tidak Terdaftar di Database Transformers 2026
                </span>
                <p className="font-normal text-xs text-rose-800 mt-1 leading-relaxed">
                  Mohon maaf, survei ini tertutup dan <strong>hanya dapat diisi oleh ASN yang terdaftar resmi</strong> dalam program pembekalan pra-pensiun BKPSDM Kab. Majalengka. Pengisian manual tidak diizinkan. Silakan periksa kembali 18 digit NIP Anda atau hubungi pihak BKPSDM.
                </p>
              </div>
            </div>
          )}

          {/* Konfirmasi Data ASN Ditemukan */}
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

        {/* 2. Nama Lengkap (HANYA OTOMATIS) */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="block text-base font-bold text-slate-900">
              2. Nama Lengkap & Gelar <span className="text-rose-600 font-black">*</span>
            </label>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
              matchFound
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}>
              <Lock className="w-3 h-3 text-slate-500" />
              {matchFound ? 'Terisi otomatis dari database' : 'Hanya otomatis dari database NIP'}
            </span>
          </div>
          <input
            type="text"
            required
            disabled={true}
            readOnly={true}
            placeholder={
              matchFound
                ? ""
                : "Hanya terisi otomatis saat NIP terdaftar di database BKPSDM..."
            }
            value={data.nama}
            className={`w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 shadow-2xs cursor-not-allowed select-none font-bold ${
              matchFound
                ? 'bg-slate-100 border-slate-300 text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-400 placeholder:text-slate-400'
            }`}
          />
        </div>

        {/* 3. Instansi / Unit Kerja (HANYA OTOMATIS) */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="block text-base font-bold text-slate-900">
              3. Perangkat Daerah / Instansi / Unit Kerja (OPD) <span className="text-rose-600 font-black">*</span>
            </label>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
              matchFound
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}>
              <Lock className="w-3 h-3 text-slate-500" />
              {matchFound ? 'Terisi otomatis dari database' : 'Hanya otomatis dari database NIP'}
            </span>
          </div>
          <input
            type="text"
            required
            disabled={true}
            readOnly={true}
            placeholder={
              matchFound
                ? ""
                : "Hanya terisi otomatis saat NIP terdaftar di database BKPSDM..."
            }
            value={data.unitKerja}
            className={`w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 shadow-2xs cursor-not-allowed select-none font-bold ${
              matchFound
                ? 'bg-slate-100 border-slate-300 text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-400 placeholder:text-slate-400'
            }`}
          />
        </div>

        {/* 4. Jabatan Terakhir (HANYA OTOMATIS) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-base font-bold text-slate-900">
              4. Jabatan Terakhir <span className="text-rose-600 font-black">*</span>
            </label>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> Otomatis
            </span>
          </div>
          <input
            type="text"
            disabled={true}
            readOnly={true}
            placeholder={matchFound ? "" : "Hanya otomatis dari database..."}
            value={data.jabatan}
            className={`w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 shadow-2xs cursor-not-allowed select-none font-bold ${
              matchFound
                ? 'bg-slate-100 border-slate-300 text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-400 placeholder:text-slate-400'
            }`}
          />
        </div>

        {/* 5. Usia (HANYA OTOMATIS) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-base font-bold text-slate-900">
              5. Usia Saat Ini (Tahun) <span className="text-rose-600 font-black">*</span>
            </label>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> Otomatis
            </span>
          </div>
          <input
            type="text"
            disabled={true}
            readOnly={true}
            placeholder={matchFound ? "" : "Otomatis..."}
            value={data.usia ? `${data.usia} Tahun` : ''}
            className={`w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 shadow-2xs cursor-not-allowed select-none font-bold ${
              matchFound
                ? 'bg-slate-100 border-slate-300 text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-400 placeholder:text-slate-400'
            }`}
          />
        </div>

        {/* 6. Tahun Pensiun (HANYA OTOMATIS) */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="block text-base font-bold text-slate-900">
              6. Tahun Perkiraan Mulai Purna Tugas <span className="text-rose-600 font-black">*</span>
            </label>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
              matchFound
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}>
              <Lock className="w-3 h-3 text-slate-500" />
              {matchFound ? 'Terisi otomatis dari database' : 'Hanya otomatis dari database NIP'}
            </span>
          </div>
          <input
            type="text"
            disabled={true}
            readOnly={true}
            placeholder={matchFound ? "" : "Hanya terisi otomatis saat NIP terdaftar di database BKPSDM..."}
            value={data.tahunPensiun ? `Tahun ${data.tahunPensiun}` : ''}
            className={`w-full px-4 py-3.5 text-base sm:text-lg rounded-xl border-2 shadow-2xs cursor-not-allowed select-none font-bold ${
              matchFound
                ? 'bg-slate-100 border-slate-300 text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-400 placeholder:text-slate-400'
            }`}
          />
        </div>

        {/* 7. Pendidikan Terakhir */}
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

        {/* 8. Domisili Purna Tugas */}
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
