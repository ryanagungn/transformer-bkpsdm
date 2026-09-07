import React, { useState, useEffect, useRef } from 'react';
import { SurveyData, ScoringResult } from '../types/survey';
import { MasterPegawai } from '../types/pegawai';
import { DEFAULT_MASTER_PEGAWAI, downloadPegawaiTemplate, parsePegawaiExcel } from '../data/defaultPegawai';
import {
  LayoutDashboard,
  Users,
  Database,
  Wand2,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  UploadCloud,
  RefreshCw,
  LogOut
} from 'lucide-react';

interface RespondentRecord {
  id: string;
  timestamp: string;
  data: SurveyData;
  score: ScoringResult;
}

interface AdminPortalProps {
  scriptUrl: string;
  onSaveScriptUrl: (url: string) => void;
  onClose: () => void;
  onLogout: () => void;
  masterPegawai: MasterPegawai[];
  onUpdateMasterPegawai: (data: MasterPegawai[]) => void;
  onLoadPresetToSurvey: (presetKey: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  scriptUrl,
  onSaveScriptUrl,
  onClose,
  onLogout,
  masterPegawai,
  onUpdateMasterPegawai,
  onLoadPresetToSurvey
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pegawai' | 'records' | 'settings' | 'testing'>('dashboard');
  const [urlInput, setUrlInput] = useState(scriptUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [records, setRecords] = useState<RespondentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPegawai, setSearchPegawai] = useState('');
  const [pegawaiPage, setPegawaiPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [testConnStatus, setTestConnStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ loading: boolean; message: string; isError: boolean } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bkpsdm_survey_records');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveRecords = (newRecords: RespondentRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('bkpsdm_survey_records', JSON.stringify(newRecords));
  };

  const handleSaveUrl = () => {
    onSaveScriptUrl(urlInput.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const [testSendStatus, setTestSendStatus] = useState<'idle' | 'sending' | 'success' | 'failed'>('idle');

  const handleTestConnection = async () => {
    if (!urlInput) {
      alert('Mohon masukkan URL Google Apps Script terlebih dahulu.');
      return;
    }
    setTestConnStatus('testing');
    try {
      await fetch(urlInput, { mode: 'no-cors' });
      setTestConnStatus('success');
    } catch (e) {
      console.error(e);
      setTestConnStatus('failed');
    }
  };

  const handleSendTestPayload = async () => {
    if (!urlInput) {
      alert('Mohon masukkan dan simpan URL Google Apps Script terlebih dahulu.');
      return;
    }
    setTestSendStatus('sending');
    try {
      const samplePayload = {
        nama: 'YUSANTO WIBOWO, S.IP., M.P.',
        nip: '196810091990031001',
        unitKerja: 'Sekretariat Daerah',
        jabatan: 'Asisten Pemerintahan dan Kesejahteraan Rakyat',
        tahunPensiun: '2028',
        usia: '58',
        pendidikan: 'Magister (S2)',
        domisili: 'Tetap di domisili saat ini',
        pengalamanUsaha: 'Pernah, tapi sudah berhenti',
        bidangPernahDijalankan: ['Pertanian & Hidroponik'],
        keterampilan: ['Manajemen Usaha / Operasional'],
        bidangDiminati: ['Pertanian & Hidroponik'],
        prioritasUtama: 'Pertanian & Hidroponik',
        alasanPrioritas: 'Memiliki lahan potensial prapensiun di Majalengka',
        keyakinanUsaha: 5,
        khususPertanian: ['Hortikultura & Sayuran (Cabai, Tomat, Bawang)'],
        asetTersedia: ['Lahan / Tanah sendiri'],
        kepemilikanLahan: 'Ya, milik sendiri',
        perkiraanLuasLahan: '500 - 1.000 m2',
        kendaraanTersedia: ['Mobil Pick-up'],
        modalPribadi: 'Rp50 - 100 juta',
        sumberModal: ['Tabungan pribadi'],
        tambahModal: 'Ya, jika ada prospek jelas',
        waktuHarian: '4 - 6 jam per hari',
        modelKeterlibatan: 'Kelola sendiri sepenuhnya (Operasional langsung)',
        kesediaanPelatihan: 5,
        topikPelatihan: ['Penyusunan Business Plan & Studi Kelayakan'],
        bentukPendampingan: ['Pelatihan teknis langsung di lokasi usaha (Field visit)'],
        kesediaanPendampingan: 'Ya, sangat bersedia',
        kendalaTerbesar: ['Pemasaran / Pembeli'],
        harapanBKPSDM: 'Bimbingan teknis dan kemitraan pasar yang berkelanjutan',
        scoring: {
          totalScore: 88,
          category: 'Sangat Siap',
          interpretation: 'Prioritas Inkubasi / Kemitraan Usaha',
          priorityLevel: 'Tinggi',
          recommendation: 'Direkomendasikan masuk Program Inkubasi Usaha Mandiri BKPSDM.'
        }
      };

      await fetch(urlInput, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(samplePayload)
      });

      setTestSendStatus('success');
      setTimeout(() => setTestSendStatus('idle'), 6000);
    } catch (e) {
      console.error(e);
      setTestSendStatus('failed');
    }
  };

  // Handler Upload Excel Master Pegawai
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setImportStatus({ loading: true, message: `Sedang memproses file ${file.name}...`, isError: false });

    try {
      const parsed = await parsePegawaiExcel(file);
      onUpdateMasterPegawai(parsed);
      setImportStatus({
        loading: false,
        message: `Berhasil mengimpor ${parsed.length} data pegawai ASN dari ${file.name}!`,
        isError: false
      });
    } catch (err: any) {
      setImportStatus({
        loading: false,
        message: `Gagal membaca Excel: ${err.message || 'Format tidak valid'}`,
        isError: true
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('Belum ada data responden untuk diekspor.');
      return;
    }

    const headers = [
      'Waktu',
      'Nama Lengkap',
      'NIP',
      'Unit Kerja',
      'Jabatan',
      'Tahun Pensiun',
      'Usia',
      'Peminatan Utama (MINAT_UTAMA)',
      'Modal Pribadi',
      'Total Skor (0-100)',
      'Kategori Kesiapan'
    ];

    const rows = records.map((r) => [
      `"${r.timestamp}"`,
      `"${r.data.nama || ''}"`,
      `"${r.data.nip || ''}"`,
      `"${r.data.unitKerja || ''}"`,
      `"${r.data.jabatan || ''}"`,
      `"${r.data.tahunPensiun || ''}"`,
      `"${r.data.usia || ''}"`,
      `"${r.data.prioritasUtama || ''}"`,
      `"${r.data.modalPribadi || ''}"`,
      r.score.totalScore,
      `"${r.score.category}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Survei_ASN_BKPSDM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrik KPI
  const totalResponden = records.length;
  const countMinat = (key: string) =>
    records.filter((r) => (r.data.prioritasUtama || '').toLowerCase().includes(key.toLowerCase())).length;
  const countKategori = (kat: string) =>
    records.filter((r) => (r.score.category || '').toLowerCase() === kat.toLowerCase()).length;

  const filteredRecords = records.filter((r) => {
    const matchQuery =
      (r.data.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.data.unitKerja || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.data.prioritasUtama || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'ALL') return matchQuery;
    return matchQuery && r.score.category === selectedFilter;
  });

  const filteredPegawai = masterPegawai.filter((p) => {
    return (
      p.nama.toLowerCase().includes(searchPegawai.toLowerCase()) ||
      p.nip.toLowerCase().includes(searchPegawai.toLowerCase()) ||
      p.unitKerja.toLowerCase().includes(searchPegawai.toLowerCase()) ||
      p.jabatan.toLowerCase().includes(searchPegawai.toLowerCase())
    );
  });

  const PEGAWAI_PAGE_SIZE = 50;
  const totalPegawaiPages = Math.ceil(filteredPegawai.length / PEGAWAI_PAGE_SIZE) || 1;
  const paginatedPegawai = filteredPegawai.slice(
    (pegawaiPage - 1) * PEGAWAI_PAGE_SIZE,
    pegawaiPage * PEGAWAI_PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      {/* HEADER PORTAL ADMIN */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase tracking-wider mb-2 border border-blue-200">
            <LayoutDashboard className="w-3.5 h-3.5 text-blue-700" />
            Panel Administrator BKPSDM
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Dashboard Pengelolaan & Master Data Pegawai
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Monitoring data responden, template KPI, dan pengelolaan Master Data NIP Pegawai.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition text-sm cursor-pointer"
          >
            Lihat Formulir
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 font-bold text-sm hover:bg-rose-100 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </div>

      {/* NAVIGASI TAB ADMIN */}
      <div className="flex flex-wrap gap-2 border-b-2 border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Ringkasan KPI
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pegawai')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
            activeTab === 'pegawai'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Master Data Pegawai ({masterPegawai.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
            activeTab === 'records'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Data Responden ({records.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Integrasi Google Sheets
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('testing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer ${
            activeTab === 'testing'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          Simulator
        </button>
      </div>

      {/* TAB 1: DASHBOARD KPI */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Responden</span>
              <span className="text-3xl sm:text-4xl font-black text-blue-950 mt-1 block">{totalResponden}</span>
              <span className="text-xs font-semibold text-emerald-700 mt-1 block">ASN Terdata</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Sangat Siap (80-100)</span>
              <span className="text-3xl sm:text-4xl font-black text-emerald-800 mt-1 block">
                {countKategori('Sangat Siap')}
              </span>
              <span className="text-xs font-semibold text-emerald-700 mt-1 block">Prioritas Inkubasi</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Siap (65-79)</span>
              <span className="text-3xl sm:text-4xl font-black text-blue-800 mt-1 block">
                {countKategori('Siap')}
              </span>
              <span className="text-xs font-semibold text-blue-700 mt-1 block">Penguatan Terarah</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Potensial (50-64)</span>
              <span className="text-3xl sm:text-4xl font-black text-amber-700 mt-1 block">
                {countKategori('Potensial')}
              </span>
              <span className="text-xs font-semibold text-amber-700 mt-1 block">Perlu Pembekalan</span>
            </div>
          </div>

          {/* Distribusi Peminatan */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-800" />
              Distribusi Peminatan Utama Usaha (Template Sheet 04)
            </h3>
            <div className="space-y-3 pt-2">
              {[
                { name: 'Pertanian & Hidroponik', count: countMinat('Pertanian'), icon: '🌾' },
                { name: 'Perikanan & Budidaya Ikan', count: countMinat('Perikanan'), icon: '🐟' },
                { name: 'Perkebunan', count: countMinat('Perkebunan'), icon: '🌴' },
                { name: 'Peternakan', count: countMinat('Peternakan'), icon: '🐄' },
                { name: 'Ekspedisi & Pengiriman', count: countMinat('Ekspedisi'), icon: '📦' },
                { name: 'Perdagangan Grosir Sembako', count: countMinat('Grosir'), icon: '🏪' },
                { name: 'Cuci Kendaraan', count: countMinat('Cuci'), icon: '🚗' },
                { name: 'Kuliner, Kos & Usaha Lainnya', count: totalResponden - (countMinat('Pertanian') + countMinat('Perikanan') + countMinat('Perkebunan') + countMinat('Peternakan') + countMinat('Ekspedisi') + countMinat('Grosir') + countMinat('Cuci')), icon: '🍽️' }
              ].map((item, i) => {
                const pct = totalResponden > 0 ? Math.round((Math.max(0, item.count) / totalResponden) * 100) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                      <span className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </span>
                      <span className="text-blue-900 font-extrabold">
                        {Math.max(0, item.count)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MASTER DATA PEGAWAI (IMPORT EXCEL) */}
      {activeTab === 'pegawai' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-800" />
                Master Data Pegawai ASN (Auto-Fill NIP)
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Data ini digunakan untuk mengisi otomatis <strong>Nama, Jabatan, dan OPD</strong> saat ASN menginput NIP pada formulir survei.
              </p>
            </div>

            {/* Tombol Unduh Template */}
            <button
              type="button"
              onClick={downloadPegawaiTemplate}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              Unduh Template Excel Pegawai
            </button>
          </div>

          {/* Kotak Upload Excel / CSV */}
          <div className="p-6 rounded-3xl border-2 border-dashed border-blue-300 bg-blue-50/50 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-900 text-amber-400 flex items-center justify-center shadow-md">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900">
                Upload File Excel Data Pegawai (.xlsx, .xls, .csv)
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-0.5">
                Sistem secara otomatis mendeteksi kolom NIP, Nama Lengkap, OPD/Unit Kerja, Jabatan, Tahun Pensiun, dan Usia.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-pegawai-upload"
            />
            <label
              htmlFor="excel-pegawai-upload"
              className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-sm shadow-md cursor-pointer transition inline-flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Pilih Berkas Excel dari Komputer
            </label>

            {importStatus && (
              <div
                className={`p-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 max-w-lg ${
                  importStatus.isError ? 'bg-rose-50 border border-rose-300 text-rose-900' : 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                }`}
              >
                {importStatus.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>

          {/* Tabel Master Pegawai */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari master pegawai berdasarkan NIP, Nama, OPD, Jabatan..."
                  value={searchPegawai}
                  onChange={(e) => {
                    setSearchPegawai(e.target.value);
                    setPegawaiPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-300 text-sm focus:border-blue-800 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                  Total: <strong>{masterPegawai.length.toLocaleString('id-ID')} ASN</strong> (Database Transformers 2026)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Kembalikan ke data pegawai bawaan Database Transformers 2026 (2.700 ASN)?')) {
                      onUpdateMasterPegawai(DEFAULT_MASTER_PEGAWAI);
                      setPegawaiPage(1);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset ke Bawaan ({DEFAULT_MASTER_PEGAWAI.length.toLocaleString('id-ID')})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-blue-950 text-white font-bold">
                  <tr>
                    <th className="p-3">NIP Pegawai</th>
                    <th className="p-3">Nama Lengkap & Gelar</th>
                    <th className="p-3">Perangkat Daerah / OPD</th>
                    <th className="p-3">Jabatan</th>
                    <th className="p-3">Pangkat / Golongan</th>
                    <th className="p-3 text-center">Rencana Pensiun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedPegawai.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                        Tidak ada data pegawai yang cocok dengan kata kunci &quot;{searchPegawai}&quot;.
                      </td>
                    </tr>
                  ) : (
                    paginatedPegawai.map((p, i) => (
                      <tr key={i} className="hover:bg-blue-50/50 transition">
                        <td className="p-3 font-mono font-bold text-blue-950">{p.nip}</td>
                        <td className="p-3 font-bold text-slate-900">{p.nama}</td>
                        <td className="p-3 text-slate-700">{p.unitKerja}</td>
                        <td className="p-3 text-slate-600">{p.jabatan}</td>
                        <td className="p-3 text-slate-600 text-xs">{p.pangkat || p.golongan || '-'}</td>
                        <td className="p-3 text-center font-bold text-slate-700">
                          {p.tahunPensiun ? `Tahun ${p.tahunPensiun}` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPegawaiPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-600">
                  Menampilkan <strong>{((pegawaiPage - 1) * PEGAWAI_PAGE_SIZE) + 1}</strong> -{' '}
                  <strong>{Math.min(pegawaiPage * PEGAWAI_PAGE_SIZE, filteredPegawai.length)}</strong> dari{' '}
                  <strong>{filteredPegawai.length.toLocaleString('id-ID')}</strong> pegawai
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pegawaiPage <= 1}
                    onClick={() => setPegawaiPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-xs font-bold text-blue-950 px-2">
                    Halaman {pegawaiPage} / {totalPegawaiPages}
                  </span>
                  <button
                    type="button"
                    disabled={pegawaiPage >= totalPegawaiPages}
                    onClick={() => setPegawaiPage((p) => Math.min(totalPegawaiPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DATA RESPONDEN */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">Daftar Responden Survei</h3>
              <p className="text-xs text-slate-500">Tabel data peserta yang telah menyelesaikan kuesioner</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" /> Unduh CSV
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Hapus seluruh rekap responden lokal?')) saveRecords([]);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Hapus Semua
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-blue-950 text-white font-bold">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Nama Lengkap & NIP</th>
                  <th className="p-3">Instansi / Dinas</th>
                  <th className="p-3">Peminatan Utama</th>
                  <th className="p-3 text-center">Skor</th>
                  <th className="p-3">Status Kesiapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                      Belum ada data responden.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-blue-50/50 transition">
                      <td className="p-3 text-slate-500 whitespace-nowrap">{r.timestamp}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{r.data.nama}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{r.data.nip || '-'}</span>
                      </td>
                      <td className="p-3 text-slate-700">
                        <span className="font-semibold block">{r.data.unitKerja}</span>
                        <span className="text-[11px] text-slate-500">{r.data.jabatan}</span>
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-100 text-blue-950 font-bold text-xs">
                          {r.data.prioritasUtama}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-black text-sm text-blue-950">{r.score.totalScore}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            r.score.category === 'Sangat Siap'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : r.score.category === 'Siap'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {r.score.category}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INTEGRASI GOOGLE SHEETS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-800" />
              Integrasi Google Sheets (Google Drive Database)
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Hubungkan formulir kuesioner dengan Google Spreadsheet di Google Drive akun BKPSDM Anda.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              URL Webhook Google Apps Script:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 font-mono text-sm focus:border-blue-700 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleSaveUrl}
                className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-sm shadow-xs transition cursor-pointer"
              >
                Simpan URL
              </button>
            </div>
            {saveSuccess && (
              <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> URL Webhook berhasil disimpan!
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testConnStatus === 'testing'}
              className="px-4 py-2.5 rounded-xl border-2 border-blue-800 text-blue-900 font-bold text-xs hover:bg-blue-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {testConnStatus === 'testing' ? 'Menguji Koneksi...' : '1. Uji Sambungan Webhook'}
            </button>

            <button
              type="button"
              onClick={handleSendTestPayload}
              disabled={testSendStatus === 'sending'}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              {testSendStatus === 'sending' ? 'Mengirim Data Contoh...' : '2. Kirim 1 Baris Data Contoh ke Spreadsheet'}
            </button>

            {testConnStatus === 'success' && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Endpoint Apps Script aktif!
              </span>
            )}
            {testConnStatus === 'failed' && (
              <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Gagal menghubungi endpoint. Pastikan izin 'Anyone'.
              </span>
            )}

            {testSendStatus === 'success' && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 flex items-center gap-1 w-full sm:w-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Data contoh terkirim! Silakan cek Google Spreadsheet Anda.
              </span>
            )}
            {testSendStatus === 'failed' && (
              <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-300 flex items-center gap-1 w-full sm:w-auto">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Gagal mengirim data contoh. Cek URL Webhook atau izin deployment.
              </span>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SIMULATOR */}
      {activeTab === 'testing' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-800" />
              Simulator Pengujian Formulir
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Muat profil preset ke formulir untuk menguji perhitungan skor kesiapan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-3">
              <span className="text-3xl block">🌾</span>
              <h4 className="font-bold text-slate-900 text-base">Profil Pertanian</h4>
              <p className="text-xs text-slate-600">Simulasi ASN peminat agribisnis (~88 pt).</p>
              <button
                type="button"
                onClick={() => {
                  onLoadPresetToSurvey('pertanian');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs shadow-xs hover:bg-blue-950 cursor-pointer"
              >
                Muat ke Formulir & Buka
              </button>
            </div>

            <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-3">
              <span className="text-3xl block">🛒</span>
              <h4 className="font-bold text-slate-900 text-base">Profil Grosir</h4>
              <p className="text-xs text-slate-600">Simulasi ASN peminat grosir sembako (~74 pt).</p>
              <button
                type="button"
                onClick={() => {
                  onLoadPresetToSurvey('grosir');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs shadow-xs hover:bg-blue-950 cursor-pointer"
              >
                Muat ke Formulir & Buka
              </button>
            </div>

            <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-3">
              <span className="text-3xl block">🚚</span>
              <h4 className="font-bold text-slate-900 text-base">Profil Ekspedisi</h4>
              <p className="text-xs text-slate-600">Simulasi ASN pemula logistik kurir (~60 pt).</p>
              <button
                type="button"
                onClick={() => {
                  onLoadPresetToSurvey('ekspedisi');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs shadow-xs hover:bg-blue-950 cursor-pointer"
              >
                Muat ke Formulir & Buka
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
