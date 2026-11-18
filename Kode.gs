const SPREADSHEET_ID = '1FugttF04yAl55Ljp0V7oX1VoGfFXFrUf4RpEQ7ZUTBg';

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Logistics & SLA Performance Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getDashboardData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    // Mengambil sheet pertama. Ubah ke ss.getSheetByName("NamaSheet") jika spesifik
    const sheet = ss.getSheets()[0]; 
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { error: "Data pada spreadsheet kosong." };
    }

    const headers = data[0].map(h => String(h).trim());
    const rows = data.slice(1);

    // Mapping indeks kolom berdasarkan header
    const colIdx = {
      tglKedatangan: headers.indexOf('Tanggal Kedatangan'),
      resiTugas: headers.indexOf('Resi Tugas'),
      namaTugas: headers.indexOf('Nama Tugas'),
      rute: headers.indexOf('Rute'),
      wilayahTujuan: headers.indexOf('Wilayah Tujuan'),
      lokasiTujuan: headers.indexOf('Lokasi Tujuan'),
      namaDriver: headers.indexOf('Nama Driver'),
      durasiSla: headers.indexOf('Durasi SLA'),
      aktualSla: headers.indexOf('Aktual SLA Perjalanan'),
      selisihWaktu: headers.indexOf('Selisih Waktu Perjalanan'),
      slaTercapai: headers.indexOf('SLA Tercapai'),
      kategoriDenda: headers.indexOf('Kategori Denda'),
      waktuBerangkat: headers.indexOf('Waktu Keberangkatan'),
      waktuDatang: headers.indexOf('Waktu Kedatangan'),
      nopol: headers.indexOf('Nopol'),
      jenisKendaraan: headers.indexOf('Jenis Kendaraan'),
      vendor: headers.indexOf('Vendor'),
      statusDriver: headers.indexOf('Status Driver'),
      statusKendaraan: headers.indexOf('Status Kendaraan')
    };

    const records = rows.map(row => {
      // Format tanggal menjadi YYYY-MM-DD agar mudah difilter di frontend
      let rawDate = row[colIdx.tglKedatangan];
      let formattedDate = '';
      if (rawDate instanceof Date && !isNaN(rawDate)) {
        formattedDate = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else if (rawDate) {
        formattedDate = String(rawDate).trim();
      }

      // Format timestamp keberangkatan & kedatangan
      const formatTime = (val) => {
        if (val instanceof Date && !isNaN(val)) {
          return Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
        }
        return String(val || '-');
      };

      return {
        tanggal: formattedDate,
        resi: String(row[colIdx.resiTugas] || '-'),
        namaTugas: String(row[colIdx.namaTugas] || '-'),
        rute: String(row[colIdx.rute] || 'Tidak Diketahui').trim(),
        wilayah: String(row[colIdx.wilayahTujuan] || 'Lainnya').trim(),
        lokasi: String(row[colIdx.lokasiTujuan] || 'Tidak Diketahui').trim(),
        driver: String(row[colIdx.namaDriver] || '-'),
        durasiSla: String(row[colIdx.durasiSla] || '-'),
        aktualSla: String(row[colIdx.aktualSla] || '-'),
        selisihWaktu: String(row[colIdx.selisihWaktu] || '-'),
        slaTercapai: String(row[colIdx.slaTercapai] || '').trim(),
        kategoriDenda: String(row[colIdx.kategoriDenda] || '-'),
        waktuBerangkat: formatTime(row[colIdx.waktuBerangkat]),
        waktuDatang: formatTime(row[colIdx.waktuDatang]),
        nopol: String(row[colIdx.nopol] || '-'),
        jenisKendaraan: String(row[colIdx.jenisKendaraan] || '-'),
        vendor: String(row[colIdx.vendor] || 'Tidak Diketahui').trim(),
        statusDriver: String(row[colIdx.statusDriver] || '-'),
        statusKendaraan: String(row[colIdx.statusKendaraan] || 'Tidak Diketahui').trim()
      };
    });

    return { records: records };
  } catch (e) {
    return { error: e.toString() };
  }
}