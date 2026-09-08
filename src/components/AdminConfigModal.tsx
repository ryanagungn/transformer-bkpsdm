import React, { useState } from 'react';
import { X, Database } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scriptUrl: string;
  onSaveScriptUrl: (url: string) => void;
}

export const AdminConfigModal: React.FC<Props> = ({
  isOpen,
  onClose,
  scriptUrl,
  onSaveScriptUrl
}) => {
  const [urlInput, setUrlInput] = useState(scriptUrl);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = urlInput.trim();
    if (trimmed && !trimmed.startsWith('https://script.google.com/macros/s/')) {
      alert('Demi keamanan sistem, URL Webhook wajib menggunakan domain resmi Google Apps Script:\nhttps://script.google.com/macros/s/');
      return;
    }
    onSaveScriptUrl(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center shadow-xs">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Integrasi Google Sheets (Google Drive)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Pengaturan Webhook Apps Script untuk database respon survei
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-600">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
            <span className="font-extrabold text-blue-950 block">Langkah Pemasangan:</span>
            <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-blue-900">
              <li>Buka Google Spreadsheet di Google Drive Anda.</li>
              <li>Klik menu <strong>Extensions &gt; Apps Script</strong>.</li>
              <li>Salin kode dari file <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono font-bold">google-apps-script/Code.gs</code>.</li>
              <li>Klik <strong>Deploy &gt; New deployment &gt; Web app</strong>.</li>
              <li>Pilih Who has access: <strong>Anyone</strong>, lalu Deploy.</li>
              <li>Tempel URL Web app tersebut pada input di bawah ini.</li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-800">
              URL Webhook Google Apps Script:
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border-2 border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-700 font-mono"
            />
            <p className="text-xs text-slate-500 font-medium">
              * Jika dibiarkan kosong, formulir tetap berjalan normal dalam mode simulasi browser.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition text-sm cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-extrabold transition text-sm shadow-md cursor-pointer"
            >
              Simpan Konfigurasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
