import React, { useState, useEffect } from 'react';
import { SurveyData, ScoringResult } from './types/survey';
import { MasterPegawai } from './types/pegawai';
import { DEFAULT_MASTER_PEGAWAI } from './data/defaultPegawai';
import { DEFAULT_GAS_URL } from './config/constants';
import { calculateSurveyScore } from './utils/scoringEngine';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { StepIdentity } from './components/StepIdentity';
import { StepExperience } from './components/StepExperience';
import { StepInterest } from './components/StepInterest';
import { StepSectorDetail } from './components/StepSectorDetail';
import { StepAssetsCapital } from './components/StepAssetsCapital';
import { StepTimeCommitment } from './components/StepTimeCommitment';
import { StepClosing } from './components/StepClosing';
import { ResultCard } from './components/ResultCard';
import { AdminPortal } from './components/AdminPortal';
import { AdminLogin } from './components/AdminLogin';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Lock,
  CheckCircle2
} from 'lucide-react';

const INITIAL_DATA: SurveyData = {
  nama: '',
  nip: '',
  unitKerja: '',
  jabatan: '',
  tahunPensiun: '2026',
  usia: '56',
  pendidikan: 'Sarjana (S1)',
  domisili: 'Tetap di domisili saat ini',
  pengalamanUsaha: 'Belum pernah',
  bidangPernahDijalankan: [],
  keterampilan: ['Budidaya tanaman'],
  bidangDiminati: ['Pertanian'],
  prioritasUtama: 'Pertanian',
  alasanPrioritas: '',
  keyakinanUsaha: 4,
  khususPertanian: ['Hortikultura & Sayuran'],
  khususPerikanan: [],
  khususPerkebunan: [],
  khususPeternakan: [],
  khususEkspedisi: [],
  khususGrosir: [],
  khususCuciKendaraan: [],
  khususLainnya: [],
  asetTersedia: ['Tanah kosong'],
  kepemilikanLahan: 'Ya, milik sendiri',
  perkiraanLuasLahan: '500 - 1.000 m2',
  kendaraanTersedia: ['Sepeda motor'],
  modalPribadi: 'Rp50 - 100 juta',
  sumberModal: ['Tabungan pribadi'],
  tambahModal: 'Tergantung hasil kajian kelayakan usaha',
  waktuHarian: '4 - 6 jam per hari',
  modelKeterlibatan: 'Kelola sendiri sepenuhnya (Operasional langsung)',
  kesediaanPelatihan: 5,
  topikPelatihan: ['Penyusunan Business Plan & Studi Kelayakan'],
  bentukPendampingan: ['Pelatihan teknis langsung di lokasi usaha (Field visit)'],
  kesediaanPendampingan: 'Ya, sangat bersedia',
  kendalaTerbesar: ['Pemasaran / Pembeli'],
  harapanBKPSDM: ''
};

const STEP_TITLES = [
  'Identitas Bapak/Ibu (A)',
  'Pengalaman & Keahlian (B)',
  'Peminatan Bidang Usaha (C)',
  'Pendalaman Komoditas Pilihan',
  'Kesiapan Aset & Finansial (D & E)',
  'Waktu & Kebutuhan Pembekalan (F & G)',
  'Penutup & Komitmen (P)'
];

export function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<SurveyData>(INITIAL_DATA);
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Layar Pengantar (Welcome Screen) & Proteksi Bot Honeypot
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [honeypot, setHoneypot] = useState<string>('');

  // Routing Admin (/admin atau #admin) & Autentikasi Sandi (ryanagung123)
  const [isAdminPath, setIsAdminPath] = useState<boolean>(() => {
    return window.location.pathname.includes('/admin') || window.location.hash === '#admin';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('bkpsdm_admin_auth') === 'true';
  });

  // Master Data Pegawai ASN (Untuk auto-fill NIP dari Database Transformers 2026)
  const [masterPegawai, setMasterPegawai] = useState<MasterPegawai[]>(() => {
    const saved = localStorage.getItem('bkpsdm_master_pegawai');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 50) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_MASTER_PEGAWAI;
  });

  // Webhook Google Sheets (Mengambil dari LocalStorage jika ada, atau DEFAULT_GAS_URL resmi)
  const [scriptUrl, setScriptUrl] = useState<string>(() => {
    const saved = localStorage.getItem('bkpsdm_gas_url');
    if (saved && saved.trim() !== '') {
      return saved;
    }
    return DEFAULT_GAS_URL;
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'synced' | 'local_only' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');

  // Sinkronisasi navigasi browser (popstate / hashchange)
  useEffect(() => {
    const checkRoute = () => {
      const isAdmin = window.location.pathname.includes('/admin') || window.location.hash === '#admin';
      setIsAdminPath(isAdmin);
    };

    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, isSubmitted, isAdminPath, isStarted]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const updateFormData = (fields: Partial<SurveyData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setErrorMessage('');
  };

  const handleSaveScriptUrl = (url: string) => {
    setScriptUrl(url);
    localStorage.setItem('bkpsdm_gas_url', url);
  };

  const handleUpdateMasterPegawai = (data: MasterPegawai[]) => {
    setMasterPegawai(data);
    localStorage.setItem('bkpsdm_master_pegawai', JSON.stringify(data));
    showToast(`Master data berhasil diperbarui (${data.length} pegawai).`);
  };

  const navigateToAdmin = () => {
    window.location.hash = '#admin';
    setIsAdminPath(true);
  };

  const navigateToSurvey = () => {
    window.location.hash = '';
    if (window.location.pathname.includes('/admin')) {
      window.history.pushState(null, '', '/');
    }
    setIsAdminPath(false);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('bkpsdm_admin_auth');
    setIsAdminAuthenticated(false);
    navigateToSurvey();
  };

  const validateCurrentStep = (): boolean => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!formData.nip || formData.nip.length !== 18) {
        setErrorMessage('Mohon masukkan 18 digit NIP Bapak/Ibu yang terdaftar pada kolom nomor 1.');
        return false;
      }
      if (!formData.nama.trim()) {
        setErrorMessage('NIP tidak terdaftar dalam Database Transformers 2026 BKPSDM. Survei ini hanya dapat diisi oleh ASN yang terdaftar.');
        return false;
      }
    } else if (currentStep === 2) {
      if (formData.keterampilan.length === 0) {
        setErrorMessage('Mohon pilih minimal 1 keterampilan yang Bapak/Ibu kuasai.');
        return false;
      }
    } else if (currentStep === 3) {
      if (formData.bidangDiminati.length === 0) {
        setErrorMessage('Mohon pilih minimal 1 bidang usaha yang Bapak/Ibu minati.');
        return false;
      }
      if (!formData.prioritasUtama) {
        setErrorMessage('Mohon tentukan 1 bidang usaha yang menjadi prioritas utama Bapak/Ibu.');
        return false;
      }
      if (!formData.alasanPrioritas.trim()) {
        setErrorMessage('Mohon ceritakan sedikit alasan Bapak/Ibu memilih bidang usaha tersebut.');
        return false;
      }
    } else if (currentStep === 4) {
      const prioritas = formData.prioritasUtama;
      let count = 0;
      if (prioritas.includes('Pertanian')) count = (formData.khususPertanian || []).length;
      else if (prioritas.includes('Perikanan')) count = (formData.khususPerikanan || []).length;
      else if (prioritas.includes('Perkebunan')) count = (formData.khususPerkebunan || []).length;
      else if (prioritas.includes('Peternakan')) count = (formData.khususPeternakan || []).length;
      else if (prioritas.includes('Ekspedisi')) count = (formData.khususEkspedisi || []).length;
      else if (prioritas.includes('Grosir')) count = (formData.khususGrosir || []).length;
      else if (prioritas.includes('Cuci')) count = (formData.khususCuciKendaraan || []).length;
      else count = (formData.khususLainnya || []).length;

      if (count === 0) {
        setErrorMessage('Mohon pilih minimal salah satu opsi spesifik subsektor pilihan Bapak/Ibu.');
        return false;
      }
    } else if (currentStep === 5) {
      if (formData.asetTersedia.length === 0) {
        setErrorMessage('Mohon pilih ketersediaan aset Bapak/Ibu (atau pilih opsi Tidak Ada).');
        return false;
      }
      if (formData.sumberModal.length === 0) {
        setErrorMessage('Mohon pilih rencana sumber modal Bapak/Ibu.');
        return false;
      }
    } else if (currentStep === 6) {
      if (formData.topikPelatihan.length === 0) {
        setErrorMessage('Mohon pilih materi pelatihan yang Bapak/Ibu butuhkan.');
        return false;
      }
      if (formData.bentukPendampingan.length === 0) {
        setErrorMessage('Mohon pilih bentuk pendampingan yang Bapak/Ibu harapkan.');
        return false;
      }
    } else if (currentStep === 7) {
      if (formData.kendalaTerbesar.length === 0) {
        setErrorMessage('Mohon pilih kendala terbesar yang Bapak/Ibu khawatirkan.');
        return false;
      }
      if (!formData.harapanBKPSDM.trim()) {
        setErrorMessage('Mohon sampaikan harapan atau masukan Bapak/Ibu untuk BKPSDM.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEP_TITLES.length));
    }
  };

  const handlePrev = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // 1. Proteksi Anti-Bot Honeypot
    if (honeypot && honeypot.trim() !== '') {
      console.warn('Bot submission blocked via honeypot.');
      setIsSubmitting(false);
      return;
    }

    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    // 2. Sanitasi Input Teks dari Potensi XSS
    const sanitizeText = (str: string) => (str ? str.replace(/[<>]/g, '').trim() : '');
    const sanitizedData: SurveyData = {
      ...formData,
      nama: sanitizeText(formData.nama),
      jabatan: sanitizeText(formData.jabatan),
      alasanPrioritas: sanitizeText(formData.alasanPrioritas),
      harapanBKPSDM: sanitizeText(formData.harapanBKPSDM)
    };

    const scoreResult = calculateSurveyScore(sanitizedData);
    setScoringResult(scoreResult);

    const newRecord = {
      id: `RESP-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID'),
      data: sanitizedData,
      score: scoreResult
    };

    try {
      const existing = JSON.parse(localStorage.getItem('bkpsdm_survey_records') || '[]');
      existing.unshift(newRecord);
      localStorage.setItem('bkpsdm_survey_records', JSON.stringify(existing));
    } catch (e) {
      console.error(e);
    }

    const payload = {
      ...sanitizedData,
      scoring: scoreResult,
      submittedAt: new Date().toISOString()
    };

    if (scriptUrl && scriptUrl.trim() !== '') {
      setSyncStatus('saving');
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setSyncStatus('synced');
        setSyncMessage('Data berhasil dikirim ke Google Sheets.');
      } catch (err: any) {
        console.error('Sync error:', err);
        setSyncStatus('error');
        setSyncMessage('Gagal mengirim ke Google Sheets, namun data lokal tetap aman.');
      }
    } else {
      setSyncStatus('local_only');
      setSyncMessage('Data tersimpan secara lokal di browser.');
    }

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData(INITIAL_DATA);
    setScoringResult(null);
    setIsSubmitted(false);
    setIsStarted(false);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/90 text-slate-900 text-sm sm:text-base">
      {/* HEADER RESMI: Dilengkapi Logo BKPSDM Majalengka & Transformers */}
      <Header
        currentStep={currentStep}
        totalSteps={STEP_TITLES.length}
        stepTitles={STEP_TITLES}
        isCompleted={isSubmitted}
        isAdminView={isAdminPath}
        isWelcomeView={!isAdminPath && !isStarted}
        onToggleAdminView={isAdminPath ? navigateToSurvey : undefined}
      />

      {/* NOTIFIKASI TOAST */}
      {toastMessage && (
        <div className="fixed top-28 right-4 z-50 bg-blue-950 text-white text-sm sm:text-base font-bold px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KONTEN UTAMA */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ========================================================================= */}
        {/* 1. JALUR /ADMIN DENGAN PROTEKSI KATA SANDI (ryanagung123)                 */}
        {/* ========================================================================= */}
        {isAdminPath ? (
          isAdminAuthenticated ? (
            <AdminPortal
              scriptUrl={scriptUrl}
              onSaveScriptUrl={handleSaveScriptUrl}
              onClose={navigateToSurvey}
              onLogout={handleAdminLogout}
              masterPegawai={masterPegawai}
              onUpdateMasterPegawai={handleUpdateMasterPegawai}
              onLoadPresetToSurvey={(presetKey) => {
                const found = masterPegawai.find((p) => p.nip.includes(presetKey) || p.unitKerja.toLowerCase().includes(presetKey));
                if (found) {
                  updateFormData({
                    nip: found.nip,
                    nama: found.nama,
                    unitKerja: found.unitKerja,
                    jabatan: found.jabatan
                  });
                }
                setIsStarted(true);
                navigateToSurvey();
              }}
            />
          ) : (
            <AdminLogin
              onSuccess={() => setIsAdminAuthenticated(true)}
              onCancel={navigateToSurvey}
            />
          )
        ) : !isStarted ? (
          /* ========================================================================= */
          /* 2. HALAMAN PENGANTAR (WELCOME SCREEN) RESMI TRANSFORMERS 2026            */
          /* ========================================================================= */
          <WelcomeScreen onStart={() => setIsStarted(true)} />
        ) : isSubmitted && scoringResult ? (
          /* ========================================================================= */
          /* 3. HASIL ASESMEN RESPONDEN (SELESAI 100%)                                 */
          /* ========================================================================= */
          <ResultCard
            result={scoringResult}
            data={formData}
            syncStatus={syncStatus}
            syncMessage={syncMessage}
            onReset={handleReset}
          />
        ) : (
          /* ========================================================================= */
          /* 4. FORMULIR KUESIONER BERSIH UNTUK RESPONDEN DENGAN AUTO-FILL NIP         */
          /* ========================================================================= */
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
            {/* Perangkap Bot Tersembunyi (Anti-Bot Honeypot) */}
            <div className="opacity-0 absolute -z-50 select-none pointer-events-none h-0 w-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="user_system_code">Verification Code</label>
              <input
                id="user_system_code"
                type="text"
                name="user_system_code"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Pesan Kesalahan Validasi */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-sm sm:text-base font-bold flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORM PER TAHAP */}
            {currentStep === 1 && (
              <StepIdentity
                data={formData}
                onChange={updateFormData}
                masterPegawai={masterPegawai}
              />
            )}
            {currentStep === 2 && <StepExperience data={formData} onChange={updateFormData} />}
            {currentStep === 3 && <StepInterest data={formData} onChange={updateFormData} />}
            {currentStep === 4 && <StepSectorDetail data={formData} onChange={updateFormData} />}
            {currentStep === 5 && <StepAssetsCapital data={formData} onChange={updateFormData} />}
            {currentStep === 6 && <StepTimeCommitment data={formData} onChange={updateFormData} />}
            {currentStep === 7 && <StepClosing data={formData} onChange={updateFormData} />}

            {/* NAVIGASI LANGKAH */}
            <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl border-2 font-bold transition text-base cursor-pointer shadow-xs ${
                  currentStep === 1
                    ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                    : 'border-slate-300 text-slate-800 bg-white hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Langkah Sebelumnya
              </button>

              <div className="w-full sm:w-auto flex items-center gap-3">
                {currentStep < STEP_TITLES.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-blue-900 hover:bg-blue-950 text-white font-black text-base sm:text-lg shadow-md transition duration-150 cursor-pointer"
                  >
                    Lanjut ke Tahap Berikutnya
                    <ChevronRight className="w-5 h-5 stroke-[3]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-9 py-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-950 hover:to-slate-900 text-white font-black text-base sm:text-lg shadow-lg transition duration-150 cursor-pointer border-t-2 border-amber-400"
                  >
                    {isSubmitting ? (
                      'Sedang Mengolah Skor...'
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Kirim Survei & Lihat Hasil Asesmen
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER RESMI DUA LOGO & IDENTITAS MAJALENGKA */}
      <footer className="bg-white border-t-2 border-slate-200 py-5 px-6 text-xs sm:text-sm text-slate-600 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
            <div className="bg-white rounded-lg p-1 border border-slate-200 shadow-2xs">
              <img src="/logo_bkpsdm.png" alt="BKPSDM Kab. Majalengka" className="h-6 sm:h-7 w-auto object-contain" />
            </div>
            <div className="h-5 w-px bg-slate-300 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <img src="/logo_transformer.png" alt="Logo Transformers" className="w-5 h-5 object-contain" />
              <span className="font-extrabold text-blue-950">Transformers 2026</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="font-bold text-slate-800 block text-xs">BKPSDM Kab. Majalengka</span>
              <span className="text-[11px] text-slate-500">Pemerintah Daerah Kabupaten Majalengka</span>
            </div>
          </div>

          {/* Tautan Discreet ke /admin dengan Password */}
          <button
            type="button"
            onClick={navigateToAdmin}
            className="text-slate-400 hover:text-blue-900 font-semibold inline-flex items-center gap-1.5 cursor-pointer text-xs transition self-center sm:self-auto"
            title="Khusus Pengelola BKPSDM Kab. Majalengka"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Portal Admin</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
