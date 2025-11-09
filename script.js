// 🔹 Replace with your real Google Apps Script API URL
const API_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjy6ww6NT42xWSS78jYeGP9_9LWyEwmaV0JipWnTqyvVRKq4uXYtVSGCU0fndAFgkAUlh34xzKrvmPTBuRMWjZwJ_s1DfVuhV6I5bybGyHVKjRWsfL13_5aH2kBYu4vqeyDPyQ9VNve8gMYNi7FOqWopb6Mdj5OJ6WFYtErDUX9fowqhyxVb9Ep-G5ZzrajGVTz2JywhDtxpCPnfh79z-NbKBYu4LddhzyXz81QpYRRhvA5gSuTvVgVM_0hqP1sx9cjizCcSqS2SsWxyiCBNtlm7mVUGw&lib=MGomoR7OA82DnxJG-b41jitkh30YExdAc';

let currentLang = 'en';
let allData = [];

const translations = {
  en: {
    title: "Company Directory",
    searchPlaceholder: "🔍 Search by name or focus area...",
    footer: 'Made with ❤️ by <a href="https://github.com/demanejar" target="_blank">Demanejar</a>',
    loading: "Loading...",
    fields: {
      employees: "Employees",
      hourlyRate: "Hourly rate",
      founded: "Founded year",
      location: "Location",
      focus: "Focus areas",
      website: "🌐 Website"
    },
    langButton: "🇺🇸 English",
    langSwitch: "🇻🇳 Vietnamese"
  },
  vi: {
    title: "Danh sách công ty",
    searchPlaceholder: "🔍 Tìm kiếm theo tên hoặc lĩnh vực...",
    footer: 'Tạo với ❤️ bởi <a href="https://github.com/demanejar" target="_blank">Demanejar</a>',
    loading: "Đang tải...",
    fields: {
      employees: "Nhân viên",
      hourlyRate: "Giá/giờ",
      founded: "Thành lập",
      location: "Vị trí",
      focus: "Lĩnh vực",
      website: "🌐 Trang web"
    },
    langButton: "🇻🇳 Tiếng Việt",
    langSwitch: "🇺🇸 English"
  }
};

// ------------------- UTILITY FUNCTIONS -------------------
function truncateText(text, maxLength = 150) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// ------------------- LOADING UTILITIES -------------------
function showLoading() {
  const loadingEl = document.getElementById('loading');
  const loadingText = loadingEl.querySelector('.loading-text');
  const t = translations[currentLang];
  loadingText.textContent = t.loading;
  loadingEl.style.display = 'flex';
  document.getElementById('company-list').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('company-list').style.display = 'grid';
}

// ------------------- FETCH DATA -------------------
async function fetchCompanies() {
  showLoading();
  try {
    const res = await fetch(API_URL);
    allData = await res.json();
    renderCompanies(allData);
    setupSearch();
  } catch (err) {
    document.getElementById('company-list').innerHTML =
      `<p style="color:red;text-align:center;">❌ Error loading data: ${err}</p>`;
  } finally {
    hideLoading();
  }
}

// ------------------- RENDER UI -------------------
function renderCompanies(data) {
  const t = translations[currentLang];
  const container = document.getElementById('company-list');
  container.innerHTML = '';

  if (!data || data.length === 0) {
    container.innerHTML = `<p style="text-align:center;">${
      currentLang === 'vi' ? 'Không có dữ liệu.' : 'No data found.'
    }</p>`;
    return;
  }

  data.forEach((c, index) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <h2>${c.Name || '(No name)'}</h2>
      <p><strong>${t.fields.employees}:</strong> ${c.Employees || 'N/A'}</p>
      <p><strong>${t.fields.hourlyRate}:</strong> ${c.HourlyRate ? c.HourlyRate : 'N/A'}</p>
      <p><strong>${t.fields.founded}:</strong> ${c.FoundedYear || 'N/A'}</p>
      <p><strong>${t.fields.location}:</strong> ${c.Location || 'N/A'}</p>
      <p><strong>${t.fields.focus}:</strong> ${c.FocusAreas || 'N/A'}</p>
      ${c.Description ? `<p class="description">${c.Description}</p>` : ''}
      <div class="card-footer">
        ${c.Website ? `<a href="${c.Website}" target="_blank" onclick="event.stopPropagation();">${t.fields.website}</a>` : '<span style="opacity: 0.5;">No website</span>'}
      </div>
    `;
    div.addEventListener('click', () => showModal(c));
    container.appendChild(div);
  });
}

// ------------------- SEARCH -------------------
function setupSearch() {
  const searchBox = document.getElementById('searchBox');
  searchBox.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    const filtered = allData.filter(c =>
      (c.Name || '').toLowerCase().includes(q) ||
      (c.FocusAreas || '').toLowerCase().includes(q)
    );
    renderCompanies(filtered);
  });
}

// ------------------- LANGUAGE TOGGLE -------------------
function setupLanguage() {
  const langBtn = document.getElementById('langToggle');
  const title = document.getElementById('page-title');
  const footer = document.getElementById('footer-text');
  const searchBox = document.getElementById('searchBox');

  function applyLang() {
    const t = translations[currentLang];
    title.textContent = t.title;
    footer.innerHTML = t.footer;
    searchBox.placeholder = t.searchPlaceholder;
    langBtn.textContent = t.langSwitch;
  }

  langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'vi' : 'en';
    applyLang();
    renderCompanies(allData);
  });

  applyLang();
}

// ------------------- MODAL POPUP -------------------
function showModal(company) {
  const t = translations[currentLang];
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  
  modalBody.innerHTML = `
    <h2>${company.Name || '(No name)'}</h2>
    <div class="modal-field">
      <strong>${t.fields.employees}:</strong> ${company.Employees || 'N/A'}
    </div>
    <div class="modal-field">
      <strong>${t.fields.hourlyRate}:</strong> ${company.HourlyRate ? company.HourlyRate : 'N/A'}
    </div>
    <div class="modal-field">
      <strong>${t.fields.founded}:</strong> ${company.FoundedYear || 'N/A'}
    </div>
    <div class="modal-field">
      <strong>${t.fields.location}:</strong> ${company.Location || 'N/A'}
    </div>
    <div class="modal-field">
      <strong>${t.fields.focus}:</strong> ${company.FocusAreas || 'N/A'}
    </div>
    ${company.Description ? `
      <div class="modal-description">
        <strong>Description:</strong>
        <p>${company.Description}</p>
      </div>
    ` : ''}
    ${company.Website ? `
      <div class="modal-website">
        <a href="${company.Website}" target="_blank">${t.fields.website}</a>
      </div>
    ` : ''}
  `;
  
  modal.style.display = 'block';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// Setup modal close handlers
function setupModal() {
  const modal = document.getElementById('modal');
  const closeBtn = document.querySelector('.close');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'block') {
      closeModal();
    }
  });
}

// ------------------- INIT -------------------
setupLanguage();
setupModal();
fetchCompanies();
