// Schemes Component
async function loadSchemes(state, search) {
  const grid = document.getElementById('schemes-grid');
  if (!grid) return;

  try {
    let url = `${API_BASE}/schemes?limit=6`;
    if (state) url += `&state=${state}`;
    if (search) url += `&search=${search}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      renderSchemes(data.data, grid);
    } else {
      renderFallbackSchemes(grid);
    }
  } catch (e) {
    renderFallbackSchemes(grid);
  }
}

function renderSchemes(schemes, grid) {
  grid.innerHTML = schemes.map(scheme => {
    const title = currentLang === 'hi' && scheme.titleHi ? scheme.titleHi : scheme.title;
    const desc = currentLang === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.description;
    return `
    <div class="scheme-card">
      <div class="p-6">
        <div class="flex items-center gap-2 mb-3">
          <span class="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">${scheme.state}</span>
          <span class="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-xs font-medium rounded-full">${scheme.category}</span>
        </div>
        <h3 class="font-semibold text-lg mb-2 line-clamp-2">${escapeHtml(title)}</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">${escapeHtml(desc)}</p>
        <div class="flex items-center justify-between">
          <a href="${scheme.applicationUrl || '#'}" target="_blank" class="text-green-700 dark:text-green-400 text-sm font-medium hover:underline">Apply Now</a>
          <button onclick="bookmarkScheme('${scheme._id}')" class="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderFallbackSchemes(grid) {
  const fallback = [
    { title: 'PM Kisan Samman Nidhi', titleHi: 'पीएम किसान सम्मान निधि', state: 'All', category: 'agriculture', description: 'Direct income support of Rs 6000 per year to farmer families.', descriptionHi: 'किसान परिवारों को प्रति वर्ष 6000 रुपये की प्रत्यक्ष आय सहायता।' },
    { title: 'Bihar Krishi Input Subsidy', titleHi: 'बिहार कृषि इनपुट अनुदान', state: 'Bihar', category: 'agriculture', description: 'Subsidy for agricultural inputs for affected farmers.', descriptionHi: 'प्रभावित किसानों के लिए कृषि इनपुट पर अनुदान।' },
    { title: 'Haryana Meri Fasal Mera Byora', titleHi: 'हरियाणा मेरी फसल मेरा ब्यौरा', state: 'Haryana', category: 'agriculture', description: 'Crop registration for MSP procurement and insurance.', descriptionHi: 'MSP खरीद और बीमा के लिए फसल पंजीकरण।' }
  ];
  renderSchemes(fallback, grid);
}

async function bookmarkScheme(id) {
  if (!authToken) { openAuthModal(); return; }
  try {
    await fetch(`${API_BASE}/schemes/${id}/bookmark`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
  } catch (e) {}
}
