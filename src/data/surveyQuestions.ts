export const OPD_LIST = [
  "Badan Kepegawaian dan Pengembangan Sumber Daya Manusia",
  "Badan Kesatuan Bangsa dan Politik",
  "Badan Keuangan dan Aset Daerah",
  "Badan Penanggulangan Bencana Daerah Kabupaten Majalengka",
  "Badan Pendapatan Daerah",
  "Badan Perencanaan Pembangunan Daerah, Penelitian dan Pengembangan",
  "Dinas Arsip dan Perpustakaan Daerah",
  "Dinas Kependudukan dan Pencatatan Sipil",
  "Dinas Kesehatan",
  "Dinas Ketahanan Pangan, Pertanian dan Perikanan",
  "Dinas Ketenagakerjaan, Koperasi dan Usaha Kecil Menengah",
  "Dinas Komunikasi dan Informatika",
  "Dinas Lingkungan Hidup",
  "Dinas Pariwisata dan Kebudayaan",
  "Dinas Pekerjaan Umum dan Tata Ruang",
  "Dinas Pemberdayaan Masyarakat dan Desa",
  "Dinas Pemberdayaan Perempuan, Perlindungan Anak dan Keluarga Berencana",
  "Dinas Pemuda dan Olahraga",
  "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu",
  "Dinas Pendidikan",
  "Dinas Perdagangan dan Perindustrian",
  "Dinas Perhubungan",
  "Dinas Perumahan, Kawasan Permukiman dan Pertanahan",
  "Dinas Sosial",
  "Inspektorat",
  "Kecamatan Argapura",
  "Kecamatan Banjaran",
  "Kecamatan Bantarujeg",
  "Kecamatan Cigasong",
  "Kecamatan Cikijing",
  "Kecamatan Cingambul",
  "Kecamatan Dawuan",
  "Kecamatan Jatitujuh",
  "Kecamatan Jatiwangi",
  "Kecamatan Kadipaten",
  "Kecamatan Kasokandel",
  "Kecamatan Kertajati",
  "Kecamatan Lemahsugih",
  "Kecamatan Leuwimunding",
  "Kecamatan Ligung",
  "Kecamatan Maja",
  "Kecamatan Majalengka",
  "Kecamatan Malausma",
  "Kecamatan Palasah",
  "Kecamatan Panyingkiran",
  "Kecamatan Rajagaluh",
  "Kecamatan Sindang",
  "Kecamatan Sindangwangi",
  "Kecamatan Sukahaji",
  "Kecamatan Sumberjaya",
  "Kecamatan Talaga",
  "Rumah Sakit Umum Daerah Cideres",
  "Rumah Sakit Umum Daerah Majalengka",
  "Rumah Sakit Umum Daerah Majalengka (Tipe B)",
  "Rumah Sakit Umum Daerah Talaga",
  "Satuan Polisi Pamong Praja dan Pemadam Kebakaran",
  "Sekretariat DPRD",
  "Sekretariat Daerah",
  "Staf Ahli Bupati Bidang Ekonomi, Pembangunan dan Keuangan",
  "Staf Ahli Bupati Bidang Kemasyarakatan dan Sumber Daya Manusia",
  "Lainnya / Unit Kerja Lain"
];

export const TAHUN_PENSIUN_LIST = [
  "2026",
  "2027",
  "2028",
  "2029",
  "2030",
  "2031",
  "2032",
  "2033",
  "2034",
  "2035 ke atas"
];

export const PENDIDIKAN_LIST = [
  "SMA / SMK Sederajat",
  "Diploma (D1/D2/D3/D4)",
  "Sarjana (S1)",
  "Magister (S2)",
  "Doktor (S3)",
  "Lainnya"
];

export const DOMISILI_LIST = [
  "Tetap di domisili saat ini",
  "Kembali ke kampung halaman",
  "Pindah daerah lain",
  "Belum menentukan"
];

export const PENGALAMAN_USAHA_LIST = [
  "Belum pernah",
  "Pernah tetapi berhenti",
  "Masih menjalankan usaha kecil",
  "Masih menjalankan usaha aktif"
];

export const BIDANG_USAHA_LIST = [
  "Pertanian",
  "Perikanan",
  "Perkebunan",
  "Peternakan",
  "Ekspedisi/pengiriman barang",
  "Perdagangan grosir",
  "Cuci kendaraan",
  "Rental kendaraan",
  "Kos/sewa properti",
  "Laundry",
  "Kuliner",
  "Perdagangan eceran",
  "Usaha online/digital",
  "Jasa",
  "Lainnya"
];

export const KETERAMPILAN_LIST = [
  "Budidaya tanaman",
  "Budidaya ikan",
  "Peternakan",
  "Pengolahan hasil",
  "Perdagangan",
  "Mengemudi",
  "Mekanik",
  "Keuangan",
  "Administrasi",
  "Pemasaran",
  "Digital marketing",
  "Marketplace",
  "Manajemen usaha",
  "Kuliner",
  "Lainnya"
];

export const SEKTOR_KHUSUS = {
  pertanian: {
    title: "Subsektor Pertanian yang Diminati",
    desc: "Khusus peminat sektor pertanian, tentukan fokus budidaya yang Anda inginkan:",
    options: [
      "Tanaman pangan (Padi, Jagung, dll.)",
      "Hortikultura & Sayuran",
      "Buah-buahan",
      "Tanaman hias",
      "Hidroponik / Urban farming",
      "Pembibitan tanaman",
      "Pertanian organik",
      "Pengolahan hasil pertanian",
      "Penyediaan saprodi/pupuk",
      "Lainnya"
    ]
  },
  perikanan: {
    title: "Jenis Usaha Perikanan yang Diminati",
    desc: "Khusus peminat perikanan, tentukan komoditas atau segmen budidaya:",
    options: [
      "Budidaya Ikan Lele",
      "Budidaya Ikan Nila",
      "Budidaya Ikan Gurame",
      "Budidaya Ikan Mas",
      "Budidaya Ikan Patin",
      "Pembenihan / Bibit Ikan",
      "Pembesaran Ikan",
      "Pengolahan hasil perikanan (Frozen, Asap, Keripik)",
      "Perdagangan & Distribusi Ikan",
      "Penyedia pakan & peralatan perikanan",
      "Lainnya"
    ]
  },
  perkebunan: {
    title: "Komoditas Perkebunan yang Diminati",
    desc: "Pilih komoditas perkebunan yang menjadi minat utama Anda:",
    options: [
      "Kopi",
      "Kakao / Cokelat",
      "Kelapa",
      "Kelapa Sawit",
      "Karet",
      "Cengkeh",
      "Pala",
      "Durian Unggul",
      "Mangga",
      "Alpukat",
      "Lainnya"
    ]
  },
  peternakan: {
    title: "Jenis Usaha Peternakan yang Diminati",
    desc: "Tentukan jenis ternak atau fokus usaha peternakan:",
    options: [
      "Ayam kampung",
      "Ayam petelur",
      "Ayam pedaging (Broiler)",
      "Bebek / Itik (Telur / Pedaging)",
      "Kambing",
      "Domba",
      "Sapi potong / Penggemukan",
      "Burung Puyuh",
      "Budidaya Lebah & Madu",
      "Pembibitan ternak",
      "Pengolahan hasil peternakan (Susu/Daging)",
      "Perdagangan ternak & pakan",
      "Lainnya"
    ]
  },
  ekspedisi: {
    title: "Model Usaha Ekspedisi & Logistik",
    desc: "Pilih model logistik/pengiriman barang yang ingin dijalankan:",
    options: [
      "Kurir & Pengiriman lokal dalam kota",
      "Layanan ekspedisi antarkecamatan",
      "Ekspedisi antarkota / antarprovinsi",
      "Angkutan barang / armada sewa",
      "Keagenan / Drop Point ekspedisi ternama",
      "Sewa kendaraan distribusi",
      "Distribusi hasil pertanian / perikanan",
      "Lainnya"
    ]
  },
  grosir: {
    title: "Jenis Perdagangan Grosir yang Diminati",
    desc: "Pilih komoditas grosir yang ingin Anda pasarkan:",
    options: [
      "Sembako / Kebutuhan Pokok",
      "Grosir hasil pertanian",
      "Grosir hasil perkebunan",
      "Grosir hasil peternakan",
      "Grosir hasil perikanan",
      "Pupuk & sarana produksi pertanian",
      "Pakan ternak & unggas",
      "Material & bahan bangunan",
      "Produk rumah tangga & plastik",
      "Makanan ringan & minuman kemasan",
      "Produk UMKM daerah",
      "Lainnya"
    ]
  },
  cuciKendaraan: {
    title: "Layanan Cuci Kendaraan yang Diminati",
    desc: "Pilih ragam layanan cuci kendaraan yang ingin disediakan:",
    options: [
      "Cuci Sepeda Motor",
      "Cuci Mobil Reguler",
      "Cuci Kendaraan Besar (Truk / Bus)",
      "Detailing & Coating Cat",
      "Poles bodi kendaraan",
      "Salon kendaraan lengkap",
      "Pembersihan Interior (Steam & Vakum)",
      "Layanan Cuci Panggilan / Mobile",
      "Lainnya"
    ]
  },
  lainnya: {
    title: "Bidang Usaha Lainnya yang Diminati",
    desc: "Pilih jenis usaha riil yang ingin Anda rintis:",
    options: [
      "Rental Mobil",
      "Rental Sepeda Motor",
      "Usaha Rumah Kos",
      "Rumah Kontrakan",
      "Laundry Kiloan / Koin",
      "Warung Kopi / Angkringan",
      "Restoran / Rumah Makan",
      "Toko Kelontong / Minimarket",
      "Bengkel Motor / Mobil",
      "Toko Online / Reseller Digital",
      "Kemitraan Waralaba / Franchise",
      "Lembaga Kursus / Bimbingan Belajar",
      "Konsultan / Jasa Keahlian Profesional",
      "Lainnya"
    ]
  }
};

export const ASET_LIST = [
  "Tanah kosong",
  "Sawah",
  "Kebun",
  "Kolam ikan",
  "Kandang ternak",
  "Rumah tinggal yang bisa dimanfaatkan",
  "Ruko / Kios",
  "Garasi / Halaman luas",
  "Kendaraan operasional",
  "Gudang penyimpanan",
  "Peralatan usaha",
  "Tidak ada aset khusus",
  "Lainnya"
];

export const KEPEMILIKAN_LAHAN_LIST = [
  "Ya, milik sendiri",
  "Ya, milik keluarga",
  "Berpotensi menyewa",
  "Tidak memiliki lahan"
];

export const LUAS_LAHAN_LIST = [
  "< 500 m2",
  "500 - 1.000 m2",
  "1.000 - 5.000 m2",
  "0,5 - 1 Hektar",
  "> 1 Hektar",
  "Tidak memiliki lahan"
];

export const KENDARAAN_LIST = [
  "Sepeda motor",
  "Mobil pribadi",
  "Mobil Pickup",
  "Truk barang",
  "Tidak ada"
];

export const MODAL_LIST = [
  "< Rp10 juta",
  "Rp10 - 25 juta",
  "Rp25 - 50 juta",
  "Rp50 - 100 juta",
  "Rp100 - 250 juta",
  "Rp250 - 500 juta",
  "> Rp500 juta",
  "Belum menentukan nominal"
];

export const SUMBER_MODAL_LIST = [
  "Tabungan pribadi",
  "THT / Uang Pesangon Pensiun",
  "Penjualan aset non-produktif",
  "Bantuan / dukungan keluarga",
  "Mitra usaha / patungan",
  "Koperasi pegawai",
  "Bank / Lembaga Keuangan Formal",
  "Investor eksternal",
  "Belum menentukan"
];

export const TAMBAH_MODAL_LIST = [
  "Ya, bersedia",
  "Tidak bersedia",
  "Tergantung hasil kajian kelayakan usaha"
];

export const WAKTU_HARIAN_LIST = [
  "< 2 jam per hari",
  "2 - 4 jam per hari",
  "4 - 6 jam per hari",
  "6 - 8 jam per hari (penuh)",
  "> 8 jam per hari",
  "Fleksibel sesuai kebutuhan usaha"
];

export const MODEL_KETERLIBATAN_LIST = [
  "Kelola sendiri sepenuhnya (Operasional langsung)",
  "Dikelola bersama pasangan (Suami/Istri)",
  "Dikelola bersama keluarga / anak",
  "Mempekerjakan karyawan (Pengawasan saja)",
  "Bermitra dengan pihak ketiga (Bagi hasil)",
  "Hanya sebagai investor modal",
  "Belum menentukan model"
];

export const TOPIK_PELATIHAN_LIST = [
  "Penyusunan Business Plan & Studi Kelayakan",
  "Manajemen Keuangan & Pembukuan Sederhana",
  "Pemasaran Digital & Media Sosial",
  "Penggunaan Marketplace & Toko Online",
  "Manajemen Operasional & SDM Usaha",
  "Teknis Budidaya Pertanian Modern",
  "Teknis Budidaya Perikanan",
  "Teknis Budidaya Peternakan",
  "Teknis Pengolahan Komoditas Perkebunan",
  "Manajemen Ekspedisi & Logistik",
  "Manajemen Toko Grosir & Ritel",
  "Manajemen Cuci & Perawatan Kendaraan",
  "Bisnis Properti / Kos-Kosan",
  "Legalitas Usaha, NIB & Perizinan",
  "Perpajakan Usaha Mikro & Kecil",
  "Akses Pembiayaan & Kemitraan Perbankan",
  "Manajemen Risiko Usaha Purna Tugas",
  "Lainnya"
];

export const BENTUK_PENDAMPINGAN_LIST = [
  "Konsultasi penentuan jenis usaha yang cocok",
  "Penyusunan studi kelayakan usaha",
  "Bimbingan pembuatan rencana bisnis (Business Plan)",
  "Pendampingan mentor wirausaha berpengalaman (1-on-1)",
  "Pelatihan teknis langsung di lokasi usaha (Field visit)",
  "Fasilitasi akses modal perbankan / KUR",
  "Bantuan perolehan peralatan usaha",
  "Fasilitasi akses pasar & pembeli (Offtaker)",
  "Pencarian mitra usaha strategis",
  "Pendampingan pemasaran digital",
  "Bantuan pengurusan legalitas & sertifikasi (NIB, PIRT, Halal)",
  "Pendampingan pasca-mulai usaha (Monitoring 6 bulan)"
];

export const PENDAMPINGAN_KOMITMEN_LIST = [
  "Ya, sangat bersedia",
  "Mempertimbangkan waktu & materi",
  "Tidak bersedia"
];

export const KENDALA_LIST = [
  "Keterbatasan Modal Awal",
  "Ketiadaan Lahan / Lokasi Usaha Strategis",
  "Kurangnya Keterampilan Teknis",
  "Belum Memiliki Pengalaman Usaha",
  "Kekhawatiran Mencari Tenaga Kerja Jujur",
  "Kekhawatiran Pemasaran / Pembeli",
  "Takut Menghadapi Risiko Kerugian",
  "Kesulitan Menemukan Mitra Terpercaya",
  "Keterbatasan Waktu & Fisik",
  "Kendala Izin Usaha / Regulasi",
  "Lainnya"
];
