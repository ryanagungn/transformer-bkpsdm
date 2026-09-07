import React, { useState } from 'react';
import { Lock, ArrowLeft, ShieldAlert, KeyRound } from 'lucide-react';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ryanagung123') {
      setError(false);
      sessionStorage.setItem('bkpsdm_admin_auth', 'true');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl max-w-md w-full p-6 sm:p-8 space-y-6">
        {/* Logo & Judul */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-950 p-2 mx-auto flex items-center justify-center shadow-md border-2 border-amber-400">
            <img src="/logo_transformer.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Portal Administrator</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Badan Kepegawaian dan Pengembangan SDM (BKPSDM)
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs sm:text-sm font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Kata sandi tidak sesuai. Silakan coba lagi.</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-800">
              Kata Sandi Administrator:
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className="w-full px-4 py-3 text-base rounded-xl border-2 border-slate-300 focus:border-blue-800 focus:ring-4 focus:ring-blue-500/20 font-medium"
              />
              <KeyRound className="w-5 h-5 absolute right-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-black text-base shadow-md transition duration-150 cursor-pointer border-t-2 border-amber-400"
          >
            Masuk ke Panel Admin
          </button>
        </form>

        <div className="pt-3 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Formulir Survei
          </button>
        </div>
      </div>
    </div>
  );
};
