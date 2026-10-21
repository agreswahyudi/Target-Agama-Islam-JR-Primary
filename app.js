/* JR Primary Islamic Learning Progress
 * Preview mode uses fictional sample data only.
 * Do not put student records or access codes in this file.
 * Set API_URL only after deploying and testing a secure backend.
 */
const API_URL = ""; // Google Apps Script web-app URL (configure only after backend setup)

const demoReport = {
  student: { id: "DEMO01", name: "Contoh Ananda", className: "Primary 1" },
  progress: [
    { category: "Surah", target: "Al-Fatihah", status: "Sudah Hafal", date: "20 Okt 2026" },
    { category: "Surah", target: "An-Nas", status: "Sedang Dipelajari", date: "20 Okt 2026" },
    { category: "Surah", target: "Al-Falaq", status: "Belum", date: "—" },
    { category: "Doa", target: "Doa sebelum makan", status: "Sudah Hafal", date: "19 Okt 2026" },
    { category: "Doa", target: "Doa sesudah makan", status: "Sedang Dipelajari", date: "19 Okt 2026" },
    { category: "Lainnya", target: "Rukun Iman", status: "Sudah Hafal", date: "18 Okt 2026" },
    { category: "Lainnya", target: "Rukun Islam", status: "Belum", date: "—" }
  ],
  reading: { title: "Iqra Jilid 2", position: "Halaman 10", status: "Sedang Berjalan", date: "21 Okt 2026", note: "Ananda sudah menunjukkan usaha yang baik. Terus berlatih membaca dengan tenang dan teliti." }
};

const $ = (selector) => document.querySelector(selector);
$("#year").textContent = new Date().getFullYear();

$("#demoButton").addEventListener("click", () => renderReport(demoReport));

$("#lookupForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const studentName = $("#studentNameInput").value.trim();
  if (!API_URL) {
    $("#formMessage").textContent = "Website belum terhubung ke data sekolah. Gunakan “Lihat contoh laporan” untuk mencoba tampilan.";
    $("#formMessage").style.color = "#a66b16";
    return;
  }
  $("#formMessage").textContent = "Memeriksa data siswa…";
  $("#formMessage").style.color = "#6e7e96";
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "getReport", studentName })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || "Nama tidak ditemukan atau perlu diperjelas.");
    renderReport(result.data);
    $("#formMessage").textContent = "Laporan berhasil dimuat.";
    $("#formMessage").style.color = "#168466";
  } catch (error) {
    $("#formMessage").textContent = error.message || "Belum dapat menghubungkan ke server. Silakan coba lagi.";
    $("#formMessage").style.color = "#b54747";
  }
});

$("#categoryFilter").addEventListener("change", () => {
  if (window.currentReport) renderTargetRows(window.currentReport.progress);
});

function renderReport(data) {
  window.currentReport = data;
  const student = data.student || {};
  const progress = Array.isArray(data.progress) ? data.progress : [];
  const reading = data.reading || {};
  $("#studentName").textContent = student.name || "Siswa";
  $("#studentMeta").textContent = `${student.className || "Kelas belum diisi"} • Laporan perkembangan belajar`;
  const done = progress.filter(item => normalizeStatus(item.status) === "done").length;
  const learning = progress.filter(item => normalizeStatus(item.status) === "learning").length;
  const total = progress.length;
  const percent = total ? Math.round(done / total * 100) : 0;
  $("#doneCount").textContent = done;
  $("#learningCount").textContent = learning;
  $("#overallPercent").textContent = `${percent}%`;
  $("#overallText").textContent = `${done} dari ${total} target selesai`;
  $("#overallBar").style.width = `${percent}%`;
  $("#readingShort").textContent = reading.title || "Belum ada";
  $("#readingDate").textContent = reading.date ? `Update ${reading.date}` : "Belum ada pembaruan";
  $("#readingTitle").textContent = reading.title || "Belum ada data bacaan";
  $("#readingPosition").textContent = reading.position || "Posisi bacaan belum diisi.";
  $("#readingStatus").textContent = reading.status || "—";
  $("#readingUpdated").textContent = reading.date || "—";
  $("#readingNote").textContent = reading.note || "Semoga ananda terus bersemangat dalam belajar.";
  renderGroups(progress);
  renderTargetRows(progress);
  $("#report").classList.remove("hidden");
  $("#report").scrollIntoView({ behavior: "smooth", block: "start" });
}
function normalizeStatus(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("hafal") || s.includes("selesai") || s.includes("tercapai")) return "done";
  if (s.includes("sedang")) return "learning";
  return "not-yet";
}
function renderGroups(progress) {
  const categories = ["Surah", "Doa", "Lainnya"];
  $("#targetGroups").innerHTML = categories.map(category => {
    const items = progress.filter(item => item.category === category);
    const done = items.filter(item => normalizeStatus(item.status) === "done").length;
    const pct = items.length ? Math.round(done / items.length * 100) : 0;
    return `<div><div class="group-heading"><span>${escapeHtml(category)}</span><span>${done}/${items.length} selesai</span></div><div class="mini-track"><div class="mini-fill" style="width:${pct}%"></div></div></div>`;
  }).join("");
}
function renderTargetRows(progress) {
  const filter = $("#categoryFilter").value;
  const filtered = filter === "Semua" ? progress : progress.filter(item => item.category === filter);
  $("#targetRows").innerHTML = filtered.map(item => {
    const state = normalizeStatus(item.status);
    const className = state === "done" ? "done" : state === "learning" ? "learning" : "not-yet";
    return `<tr><td><span class="category-chip">${escapeHtml(item.category || "Lainnya")}</span></td><td><strong>${escapeHtml(item.target || "—")}</strong></td><td><span class="status-chip ${className}">${escapeHtml(item.status || "Belum")}</span></td><td>${escapeHtml(item.date || "—")}</td></tr>`;
  }).join("");
  $("#emptyRows").classList.toggle("hidden", filtered.length > 0);
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}