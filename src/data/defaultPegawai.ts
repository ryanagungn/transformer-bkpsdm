import { MasterPegawai } from '../types/pegawai';
import * as XLSX from 'xlsx';
import databaseTransformers from './databaseTransformers.json';

// Menggunakan data riil 2.700 ASN pra-pensiun dari DATABASE TRANSFORMERS 2026.xlsx
export const DEFAULT_MASTER_PEGAWAI: MasterPegawai[] = databaseTransformers as MasterPegawai[];

function mapEducation(val: any): string {
  if (!val) return '';
  const s = String(val).toUpperCase().trim();
  if (s.includes('S 3') || s.includes('S3') || s.includes('DOKTOR')) return 'Doktor (S3)';
  if (s.includes('S 2') || s.includes('S2') || s.includes('MAGISTER')) return 'Magister (S2)';
  if (s.includes('S 1') || s.includes('S1') || s.includes('SARJANA')) return 'Sarjana (S1)';
  if (['D IV', 'D4', 'D III', 'D3', 'D II', 'D2', 'D I', 'D1', 'DIPLOMA'].some((d) => s.includes(d))) return 'Diploma (D1/D2/D3/D4)';
  if (['SLTA', 'SMA', 'SMK', 'SPK', 'PGA', 'MA'].some((x) => s.includes(x))) return 'SMA / SMK Sederajat';
  return 'Lainnya';
}

// Helper untuk mengunduh Template Excel Pegawai Resmi (Format Standar BKPSDM Transformers 2026)
export function downloadPegawaiTemplate() {
  const headers = [
    'NIP Baru',
    'Nama Pegawai (Gelar)',
    'Organisasi Perangkat Daerah',
    'Fungsional / Jabatan',
    'TMT BUP (Tahun Pensiun)',
    'Tanggal Lahir',
    'Tingkat Pendidikan',
    'Nama Pangkat',
    'Gol. Akhir',
    'No HP',
    'Email Pribadi',
    'Alamat Lengkap'
  ];

  const sampleData = [
    [
      '196810091990031001',
      'YUSANTO WIBOWO, S.IP., M.P.',
      'Sekretariat Daerah',
      'Asisten Pemerintahan dan Kesejahteraan Rakyat',
      '2028-11-01',
      '1968-10-09',
      'S 2',
      'Pembina Utama Muda',
      'IV/c',
      '081312402844',
      'yusantowibowo09@gmail.com',
      'LINGK. PUSPA INDAH III NO. 33 RT. 022 RW. 002 KELURAHAN CIGASONG KEC. CIGASONG, KAB. MAJALENGKA, JAWA BARAT'
    ],
    [
      '197209132009011001',
      'NANANG DJUHANA, S.IP',
      'Sekretariat Daerah',
      'Pelaksana - Bagian Pemerintahan',
      '2030-10-01',
      '1972-09-13',
      'S 1',
      'Penata Muda Tingkat I',
      'III/b',
      '081337107192',
      'lindatresnawati78@gmail.com',
      'LINGKUNGAN MEKARGUNA NO. 01 RT. 016 RW. 006 KELURAHAN TONJONG KEC. MAJALENGKA, KAB. MAJALENGKA, JAWA BARAT'
    ],
    [
      '197210062010011002',
      'NANDA ROSYANDA, S.M.',
      'Inspektorat',
      'Pengawas Penyelenggaraan Urusan Pemerintahan Daerah Ahli Pertama',
      '2030-11-01',
      '1972-10-06',
      'S 1',
      'Penata Muda',
      'III/a',
      '082116057311',
      'nandarosyanda@yahoo.co.id',
      'JL AMBIA LINGK. GANDASARI RT. 003 RW. 003 KELURAHAN CIKASARUNG KEC. MAJALENGKA, KAB. MAJALENGKA, JAWA BARAT'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

  // Styling lebar kolom
  ws['!cols'] = [
    { wch: 22 }, // NIP Baru
    { wch: 35 }, // Nama Pegawai
    { wch: 45 }, // OPD
    { wch: 40 }, // Jabatan
    { wch: 22 }, // TMT BUP
    { wch: 15 }, // Tanggal Lahir
    { wch: 18 }, // Tingkat Pendidikan
    { wch: 25 }, // Pangkat
    { wch: 12 }, // Golongan
    { wch: 18 }, // No HP
    { wch: 28 }, // Email
    { wch: 50 }  // Alamat Lengkap
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Master_Data_Pegawai');
  XLSX.writeFile(wb, 'Template_DATABASE_TRANSFORMERS_2026.xlsx');
}

// Parser Cerdas File Excel / CSV dengan Deteksi Otomatis Format Resmi & Sederhana
export async function parsePegawaiExcel(file: File): Promise<MasterPegawai[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('File Excel tidak berisi data.');
  }

  // Deteksi kolom secara cerdas berdasarkan kecocokan pola
  const sample = rawRows[0];
  const keys = Object.keys(sample);

  const findKeyPrecise = (patterns: string[]): string | undefined => {
    // 1. Exact match (case & non-alphanumeric insensitive)
    for (const p of patterns) {
      const found = keys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === p);
      if (found) return found;
    }
    // 2. StartsWith
    for (const p of patterns) {
      const found = keys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(p));
      if (found) return found;
    }
    // 3. Includes (hanya jika panjang pola >= 4 untuk mencegah false match)
    for (const p of patterns) {
      if (p.length >= 4) {
        const found = keys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(p));
        if (found) return found;
      }
    }
    return undefined;
  };

  const nipKey = findKeyPrecise(['nipbaru', 'nip', 'nomorindukpegawai', 'noindukpegawai', 'nomorinduk']) || keys[0];
  const namaKey = findKeyPrecise(['namapegawaigelar', 'namalengkapgelar', 'namapegawai', 'namalengkap', 'nama']) || keys[1];
  const opdKey = findKeyPrecise(['organisasiperangkatdaerah', 'perangkatdaerah', 'opd', 'unitkerja', 'skpd', 'instansi']) || keys[2];

  const fungsionalKey = findKeyPrecise(['fungsional']);
  const satkerKey = findKeyPrecise(['satuankerja', 'satker']);
  const unorKey = findKeyPrecise(['unitorganisasi', 'unor']);
  const jenisJabatanKey = findKeyPrecise(['jenisjabatan']);
  const generalJabatanKey = findKeyPrecise(['jabatanterakhir', 'jabatan', 'posisi']);

  const tmtBupKey = findKeyPrecise(['tmtbup']);
  const tahunKey = findKeyPrecise(['tahunpensiun', 'thpensiun', 'pensiun']);
  const tglLahirKey = findKeyPrecise(['tanggallahir', 'tgllahir']);
  const usiaKey = findKeyPrecise(['usia', 'umur']);
  const pendKey = findKeyPrecise(['tingkatpendidikan', 'jenjangpendidikan', 'pendidikanterakhir', 'pendidikan']);
  const pangkatKey = findKeyPrecise(['namapangkat', 'pangkat']);
  const golKey = findKeyPrecise(['golakhir', 'golonganakhir', 'golongan']);
  const jkKey = findKeyPrecise(['jeniskelamin', 'kelamin', 'gender']);
  const hpKey = findKeyPrecise(['nohp', 'nomorhp', 'handphone', 'notelp', 'telepon', 'whatsapp']);
  const emailKey = findKeyPrecise(['emailpribadi', 'email', 'surel']);
  const alamatKey = findKeyPrecise(['alamatlengkap', 'alamat', 'domisili']);

  const parsed: MasterPegawai[] = [];
  const currentYear = 2026;

  for (const row of rawRows) {
    const rawNip = String(row[nipKey] || '').trim().replace(/['"]/g, '');
    const nama = String(row[namaKey] || '').trim();

    if (!rawNip && !nama) continue;

    // Menentukan jabatan secara bertingkat
    const fungsional = fungsionalKey ? String(row[fungsionalKey] || '').trim() : '';
    const satker = satkerKey ? String(row[satkerKey] || '').trim() : '';
    const unor = unorKey ? String(row[unorKey] || '').trim() : '';
    const jenisJabatan = jenisJabatanKey ? String(row[jenisJabatanKey] || '').trim() : '';
    const genJabatan = generalJabatanKey ? String(row[generalJabatanKey] || '').trim() : '';

    let jabatan = '';
    if (fungsional && fungsional !== 'None') {
      jabatan = fungsional;
    } else if (satker && satker !== 'None') {
      if (jenisJabatan && !['None', 'Struktural'].includes(jenisJabatan)) {
        jabatan = `${jenisJabatan} - ${satker}`;
      } else {
        jabatan = satker;
      }
    } else if (unor && unor !== 'None') {
      jabatan = unor;
    } else if (genJabatan) {
      jabatan = genJabatan;
    } else if (jenisJabatan) {
      jabatan = jenisJabatan;
    } else {
      jabatan = '-';
    }

    // Menentukan tahun pensiun
    let tahunPensiun = '';
    if (tmtBupKey && row[tmtBupKey]) {
      const m = String(row[tmtBupKey]).match(/20\d{2}/);
      if (m) tahunPensiun = m[0];
    }
    if (!tahunPensiun && tahunKey && row[tahunKey]) {
      const m = String(row[tahunKey]).match(/20\d{2}/);
      if (m) tahunPensiun = m[0];
    }

    // Menentukan usia
    let usia = '';
    if (tglLahirKey && row[tglLahirKey]) {
      const m = String(row[tglLahirKey]).match(/(19\d{2}|20\d{2})/);
      if (m) usia = String(currentYear - parseInt(m[0], 10));
    }
    if (!usia && usiaKey && row[usiaKey]) {
      usia = String(row[usiaKey]).trim();
    }

    const pangkat = pangkatKey && row[pangkatKey] ? String(row[pangkatKey]).trim() : '';
    const gol = golKey && row[golKey] ? String(row[golKey]).trim() : '';
    const pangkatGol = pangkat && gol ? `${pangkat} (${gol})` : (pangkat || gol);

    parsed.push({
      nip: rawNip,
      nama,
      unitKerja: opdKey ? String(row[opdKey] || '').trim() : '',
      jabatan,
      tahunPensiun: tahunPensiun || undefined,
      usia: usia || undefined,
      pendidikan: pendKey ? mapEducation(row[pendKey]) : undefined,
      pangkat: pangkatGol || undefined,
      golongan: gol || undefined,
      jenisKelamin: jkKey ? String(row[jkKey] || '').trim() : undefined,
      noHp: hpKey ? String(row[hpKey] || '').trim() : undefined,
      email: emailKey ? String(row[emailKey] || '').trim() : undefined,
      alamat: alamatKey ? String(row[alamatKey] || '').trim() : undefined
    });
  }

  return parsed;
}
