import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, KeyRound, Lock, AlertTriangle } from 'lucide-react';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 menit

export const AdminLogin: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState<number>(() => {
    return parseInt(localStorage.getItem('bkpsdm_login_attempts') || '0', 10);
  });
  const [lockoutTime, setLockoutTime] = useState<number>(() => {
    return parseInt(localStorage.getItem('bkpsdm_lockout_until') || '0', 10);
  });
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Timer countdown lockout
  useEffect(() => {
    const checkLockout = () => {
      const now = Date.now();
      if (lockoutTime > now) {
        setRemainingSeconds(Math.ceil((lockoutTime - now) / 1000));
      } else {
        setRemainingSeconds(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutTime]);

  const isLocked = remainingSeconds > 0;

  const hashPassword = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    // Hash SHA-256 satu arah (one-way cryptographic hash) untuk melindungi sandi admin
    const ADMIN_HASH = 'f0ce9f208012ce77d84bcc139f507d5e31acce4d1d23e0481704269791b692a4';
    const inputHash = await hashPassword(password);

    if (inputHash === ADMIN_HASH) {
      setError(false);
      localStorage.removeItem('bkpsdm_login_attempts');
      localStorage.removeItem('bkpsdm_lockout_until');
      sessionStorage.setItem('bkpsdm_admin_auth', 'true');
      onSuccess();
    } else {
      setPassword('');
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('bkpsdm_login_attempts', newAttempts.toString());
      setError(true);

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
        setLockoutTime(lockoutUntil);
        localStorage.setItem('bkpsdm_lockout_until', lockoutUntil.toString());
        setAttempts(0);
        localStorage.setItem('bkpsdm_login_attempts', '0');
      }
    }
  };

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins} menit ${s < 10 ? '0' : ''}${s} detik`;
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl max-w-md w-full p-6 sm:p-8 space-y-6">
        {/* Logo & Judul */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center justify-center shrink-0">
              <img src="/logo_bkpsdm.png" alt="Logo BKPSDM Kab. Majalengka" className="h-8 w-auto object-contain drop-shadow-sm" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-950 p-1.5 flex items-center justify-center shadow-md border-2 border-amber-400">
              <img src="/logo_transformer.png" alt="Logo Transformers" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 block">
              Pemerintah Daerah Kabupaten Majalengka
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Portal Administrator</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              BKPSDM Kab. Majalengka • Program Transformers 2026
            </p>
          </div>
        </div>

        {/* Notifikasi Terkunci (Brute-force Protection) */}
        {isLocked ? (
          <div className="p-4 rounded-2xl bg-rose-100 border-2 border-rose-400 text-rose-950 space-y-2 text-center animate-pulse">
            <div className="flex items-center justify-center gap-2 font-black text-sm">
              <Lock className="w-4 h-4 text-rose-700" />
              <span>Akses Sementara Ditangguhkan</span>
            </div>
            <p className="text-xs font-semibold">
              Terlalu banyak percobaan sandi yang keliru ({MAX_ATTEMPTS}x). Silakan tunggu:
            </p>
            <div className="font-mono font-black text-base text-rose-900 bg-white/70 py-1.5 px-3 rounded-lg border border-rose-300 inline-block">
              {formatCountdown(remainingSeconds)}
            </div>
          </div>
        ) : error ? (
          <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs sm:text-sm font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <span>Kata sandi tidak sesuai.</span>
              <span className="block text-[11px] font-semibold text-rose-700 mt-0.5">
                Sisa kesempatan: {MAX_ATTEMPTS - attempts} kali percobaan.
              </span>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-800">
              Kata Sandi Administrator:
            </label>
            <div className="relative">
              <input
                type="password"
                required
                disabled={isLocked}
                autoFocus
                placeholder={isLocked ? "Terkunci sementara..." : "Masukkan kata sandi..."}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`w-full px-4 py-3 text-base rounded-xl border-2 font-medium transition ${
                  isLocked
                    ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                    : 'border-slate-300 focus:border-blue-800 focus:ring-4 focus:ring-blue-500/20'
                }`}
              />
              <KeyRound className="w-5 h-5 absolute right-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked}
            className={`w-full py-3.5 rounded-xl font-black text-base shadow-md transition duration-150 border-t-2 ${
              isLocked
                ? 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'
                : 'bg-blue-900 hover:bg-blue-950 text-white border-amber-400 cursor-pointer'
            }`}
          >
            {isLocked ? 'Tunggu Hitungan Mundur' : 'Masuk ke Panel Admin'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Halaman Depan
          </button>
        </div>
      </div>
    </div>
  );
};
