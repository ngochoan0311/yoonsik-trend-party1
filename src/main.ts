type Participant = { name: string; gaNumber: number };

const API_URL = "/api/participants";
const GA_MIN = 100;
const GA_MAX = 500;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const modal = $<HTMLDivElement>("registerModal");
const form = $<HTMLFormElement>("registerForm");
const submitBtn = $<HTMLButtonElement>("submitBtn");
const gaInput = $<HTMLInputElement>("gaNumber");
const gaHint = $<HTMLParagraphElement>("gaHint");
const formError = $<HTMLParagraphElement>("formError");
const tbody = $<HTMLTableSectionElement>("participantTable");
const search = $<HTMLInputElement>("search");

let participants: Participant[] = [];
let takenNumbers = new Set<number>();

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToast(message: string) {
  const toast = $<HTMLDivElement>("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.setTimeout(() => toast.classList.add("hidden"), 3000);
}

function openModal() {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  $<HTMLInputElement>("name").focus();
}

function closeModal() {
  modal.classList.remove("flex");
  modal.classList.add("hidden");
  formError.classList.add("hidden");
}

function renderTable() {
  const query = search.value.trim().toLowerCase();
  const rows = participants
    .map((p, i) => ({ ...p, index: i + 1 }))
    .filter((p) => !query || p.name.toLowerCase().includes(query) || String(p.gaNumber).includes(query));

  if (participants.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-slate-400">Chưa có người tham gia nào. Hãy là người đầu tiên!</td></tr>`;
    return;
  }
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-slate-400">Không tìm thấy kết quả.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows
    .map(
      (p) => `
        <tr class="hover:bg-sky-50/50 transition">
          <td class="py-3 px-4 text-slate-500 font-medium">${p.index}</td>
          <td class="py-3 px-4 font-semibold text-slate-700">${escapeHtml(p.name)}</td>
          <td class="py-3 px-4 text-right font-bold text-sky-600">${p.gaNumber}</td>
        </tr>`,
    )
    .join("");
}

function renderStats() {
  const total = GA_MAX - GA_MIN + 1;
  $("totalCount").textContent = `${participants.length} người`;
  $("statJoined").textContent = String(participants.length);
  $("statLeft").textContent = String(total - takenNumbers.size);
}

async function loadParticipants() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    participants = await response.json();
    takenNumbers = new Set(participants.map((p) => p.gaNumber));
    renderStats();
    renderTable();
    updateGaHint();
  } catch (error) {
    console.error("Lỗi tải danh sách:", error);
    tbody.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-red-400">Không thể tải danh sách. Vui lòng thử lại sau.</td></tr>`;
  }
}

function updateGaHint() {
  const value = gaInput.value.trim();
  const n = Number(value);
  gaHint.className = "mt-1 text-xs min-h-4";
  if (!value) {
    gaHint.textContent = "";
  } else if (!Number.isInteger(n) || n < GA_MIN || n > GA_MAX) {
    gaHint.textContent = `Số phải nằm trong khoảng ${GA_MIN} – ${GA_MAX}.`;
    gaHint.classList.add("text-amber-600");
  } else if (takenNumbers.has(n)) {
    gaHint.textContent = `Số ${n} đã có người chọn.`;
    gaHint.classList.add("text-red-500");
  } else {
    gaHint.textContent = `Số ${n} còn trống ✓`;
    gaHint.classList.add("text-emerald-600");
  }
}

function pickRandomNumber() {
  const free: number[] = [];
  for (let n = GA_MIN; n <= GA_MAX; n++) if (!takenNumbers.has(n)) free.push(n);
  if (free.length === 0) {
    showToast("Đã hết số trống!");
    return;
  }
  gaInput.value = String(free[Math.floor(Math.random() * free.length)]);
  updateGaHint();
}

async function submitForm(event: SubmitEvent) {
  event.preventDefault();
  formError.classList.add("hidden");

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Đang gửi...";

  const formData = {
    name: $<HTMLInputElement>("name").value,
    twitter: $<HTMLInputElement>("twitter").value,
    instagram: $<HTMLInputElement>("instagram").value,
    gaNumber: Number(gaInput.value),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const result = await response.json();

    if (result.status === "success") {
      closeModal();
      form.reset();
      updateGaHint();
      showToast("Đăng ký thành công! 💙");
      loadParticipants();
    } else {
      formError.textContent = result.message ?? "Có lỗi xảy ra, vui lòng thử lại!";
      formError.classList.remove("hidden");
      if (response.status === 409) loadParticipants();
    }
  } catch (error) {
    console.error(error);
    formError.textContent = "Có lỗi xảy ra, vui lòng thử lại!";
    formError.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Gửi thông tin";
  }
}

$("openModalBtn").addEventListener("click", openModal);
$("cancelBtn").addEventListener("click", closeModal);
$("randomBtn").addEventListener("click", pickRandomNumber);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
});
gaInput.addEventListener("input", updateGaHint);
search.addEventListener("input", renderTable);
form.addEventListener("submit", submitForm);

loadParticipants();
