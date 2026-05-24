// Weather Component
async function loadWeather() {
  try {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const res = await fetch(`${API_BASE}/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const data = await res.json();
        if (data.success) updateWeatherUI(data.data);
      }, async () => {
        // Fallback to default city
        const res = await fetch(`${API_BASE}/weather?city=Patna`);
        const data = await res.json();
        if (data.success) updateWeatherUI(data.data);
      });
    } else {
      const res = await fetch(`${API_BASE}/weather?city=Patna`);
      const data = await res.json();
      if (data.success) updateWeatherUI(data.data);
    }
  } catch (e) {
    // Use fallback data
    updateWeatherUI({
      temperature: 32,
      humidity: 65,
      windSpeed: 3.5,
      description: 'Clear sky',
      city: 'Your Area'
    });
  }
}

function updateWeatherUI(data) {
  const tempEl = document.getElementById('weather-temp');
  const humEl = document.getElementById('weather-humidity');
  const windEl = document.getElementById('weather-wind');
  const descEl = document.getElementById('weather-desc');
  if (tempEl) tempEl.textContent = `${Math.round(data.temperature)} C`;
  if (humEl) humEl.textContent = `${data.humidity}%`;
  if (windEl) windEl.textContent = `${data.windSpeed} km/h`;
  if (descEl) descEl.textContent = data.description || 'Clear';
}

// Filter functions for sections
function filterSchemes() {
  const state = document.getElementById('scheme-state-filter')?.value || '';
  const search = document.getElementById('scheme-search')?.value || '';
  loadSchemes(state, search);
}

function filterProducts() {
  const category = document.getElementById('product-category-filter')?.value || '';
  loadMarketplaceFiltered(category);
}

function filterEquipment() {
  const type = document.getElementById('equip-type-filter')?.value || '';
  loadEquipmentFiltered(type);
}

// Extended load functions with filters
async function loadMarketplaceFiltered(category) {
  const grid = document.getElementById('marketplace-grid');
  if (!grid) return;
  try {
    const url = category ? `${API_BASE}/marketplace?category=${category}&limit=8` : `${API_BASE}/marketplace?limit=8`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      renderProducts(data.data, grid);
    } else {
      renderFallbackProducts(grid);
    }
  } catch (e) {
    renderFallbackProducts(grid);
  }
}

async function loadEquipmentFiltered(type) {
  const grid = document.getElementById('equipment-grid');
  if (!grid) return;
  try {
    const url = type ? `${API_BASE}/equipment?type=${type}&limit=6` : `${API_BASE}/equipment?limit=6`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      renderEquipment(data.data, grid);
    } else {
      renderFallbackEquipment(grid);
    }
  } catch (e) {
    renderFallbackEquipment(grid);
  }
}

// Load weather on page load
document.addEventListener('DOMContentLoaded', () => { loadWeather(); });
