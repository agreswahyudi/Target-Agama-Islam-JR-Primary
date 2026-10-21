/**
 * JR Primary - Google Apps Script starter backend
 * Sheet tabs expected: SISWA, TARGET SURAH, TARGET DOA, TARGET LAINNYA,
 * PROGRESS, BACAAN AL-QURAN.
 *
 * Before testing:
 * 1) Ensure SISWA has columns "ID Siswa" (or "ID"), "Nama", "Kelas", "Status".
 * 2) Ensure BACAAN AL-QURAN column "ID Siswa" contains the same internal student ID.
 * 3) Set SPREADSHEET_ID below.
 *
 * PRIVACY NOTE: name-only lookup is not authentication. Anyone who knows a child's name may be able to request the report. Use only with school approval and show only information approved for this access model. Exact duplicate names are rejected as ambiguous.
 */
const SPREADSHEET_ID = "PASTE_GOOGLE_SHEETS_ID_HERE";

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (payload.action !== "getReport") return json({ ok: false, message: "Permintaan tidak dikenali." });
    const studentName = String(payload.studentName || "").trim().toLocaleLowerCase();
    if (!studentName) return json({ ok: false, message: "Nama lengkap wajib diisi." });

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const students = readRows(ss, "SISWA");
    const matches = students.filter(row =>
      String(row["Nama"] || "").trim().toLocaleLowerCase() === studentName &&
      String(row["Status"] || "Aktif").toLowerCase() === "aktif"
    );
    if (matches.length > 1) return json({ ok: false, message: "Ada lebih dari satu siswa dengan nama yang sama. Hubungi sekolah untuk mendapatkan bantuan." });
    const student = matches[0];
    if (!student) return json({ ok: false, message: "Nama siswa tidak ditemukan. Periksa ejaan nama sesuai data sekolah." });

    const sid = String(student["ID Siswa"] || student["ID"] || "").trim();
    const progressRows = readRows(ss, "PROGRESS").filter(row => String(row["ID Siswa"] || "").trim() === sid);
    const targetMaps = [
      ["TARGET SURAH", "Surah", "Nama Surah"],
      ["TARGET DOA", "Doa", "Nama Doa"],
      ["TARGET LAINNYA", "Lainnya", "Nama Target"]
    ];
    const targets = {};
    targetMaps.forEach(([sheetName, category, nameColumn]) => {
      targets[category] = readRows(ss, sheetName);
      targets[category].forEach(target => targets[category][targets[category].indexOf(target)] = {
        id: String(target["ID Target"] || ""),
        name: String(target[nameColumn] || "")
      });
    });
    const progress = progressRows.map(row => {
      let found = { category: "Lainnya", target: String(row["ID Target"] || "") };
      targetMaps.forEach(([sheetName, category]) => {
        const target = readRows(ss, sheetName).find(item => String(item["ID Target"] || "").trim() === String(row["ID Target"] || "").trim());
        if (target) {
          const nameColumn = category === "Surah" ? "Nama Surah" : category === "Doa" ? "Nama Doa" : "Nama Target";
          found = { category, target: String(target[nameColumn] || "") };
        }
      });
      return { ...found, status: String(row["Status"] || "Belum"), date: formatDate(row["Tanggal Setoran"]) };
    });

    const readingRow = readRows(ss, "BACAAN AL-QURAN").find(row => String(row["ID Siswa"] || "").trim() === sid) || {};
    const readingTitle = String(readingRow["Jenis Bacaan"] || "");
    const isIqra = readingTitle.toLowerCase().includes("iqra") || readingTitle.toLowerCase().includes("iqro");
    const reading = {
      title: isIqra ? `${readingTitle}${readingRow["Jilid Iqra"] ? " " + readingRow["Jilid Iqra"] : ""}` : (readingRow["Surah"] || readingTitle || "Belum ada data"),
      position: readingRow["Posisi Terakhir"] ? (isIqra ? `Halaman ${readingRow["Posisi Terakhir"]}` : `Ayat ${readingRow["Posisi Terakhir"]}`) : "",
      status: String(readingRow["Status"] || "Belum ada data"),
      date: formatDate(readingRow["Tanggal Update"]),
      note: String(readingRow["Catatan"] || "")
    };
    return json({ ok: true, data: {
      student: { id: sid, name: String(student["Nama"] || ""), className: String(student["Kelas"] || "") },
      progress, reading
    }});
  } catch (err) {
    console.error(err);
    return json({ ok: false, message: "Terjadi kendala saat membaca data. Hubungi administrator sekolah." });
  }
}

function readRows(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map(value => String(value).trim());
  return values.filter(row => row.some(value => value !== "" && value !== null))
    .map(row => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
}
function formatDate(value) {
  if (!value) return "";
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value)) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "dd MMM yyyy");
  }
  return String(value);
}
function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}