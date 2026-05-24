// Equipment Component
async function loadEquipment() {
  const grid = document.getElementById('equipment-grid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/equipment?limit=3`);
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

function renderEquipment(items, grid) {
  grid.innerHTML = items.map(item => {
    const name = currentLang === 'hi' && item.nameHi ? item.nameHi : item.name;
    const img = item.images?.[0] || getEquipmentImage(item.type);
    const bookUrl = item._id 
      ? `/pages/equipment-booking.html?id=${item._id}` 
      : `/pages/equipment-booking.html?name=${encodeURIComponent(item.name)}&price=${item.pricePerDay}&location=${encodeURIComponent(item.location)}&type=${item.type}`;
    return `
    <div class="equipment-card">
      <div class="relative h-48 overflow-hidden">
        <img src="${img}" alt="${escapeHtml(name)}" class="w-full h-full object-cover" loading="lazy">
        <span class="absolute top-3 right-3 px-2 py-1 ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'} text-white text-xs font-medium rounded-lg">
          ${item.isAvailable ? t('common.available') : t('common.booked')}
        </span>
      </div>
      <div class="p-4">
        <h3 class="font-semibold mb-1">${escapeHtml(name)}</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-2">${item.location || ''}</p>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-green-700 dark:text-green-400">Rs ${item.pricePerDay}${t('common.perDay')}</span>
          <a href="${bookUrl}" class="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-sm rounded-lg transition-colors inline-block">${t('common.book')}</a>
        </div>
      </div>
    </div>`;
  }).join('');
}

function getEquipmentImage(type) {
  const images = {
    tractor: '/assets/images/Tractor.jpg',
    pump_set: '/assets/images/Pump-set.jpg',
    harvester: '/assets/images/Harvestor.jpg',
    farming_machine: '/assets/images/Farming-Equipments.png'
  };
  return images[type] || images.tractor;
}

function renderFallbackEquipment(grid) {
  const fallback = [
    { name: 'Mahindra 575 DI Tractor', nameHi: 'महिंद्रा 575 DI ट्रैक्टर', type: 'tractor', pricePerDay: 1500, location: 'Karnal, Haryana', isAvailable: true, images: ['/assets/images/Tractor.jpg'] },
    { name: 'Submersible Pump Set', nameHi: 'सबमर्सिबल पंप सेट', type: 'pump_set', pricePerDay: 500, location: 'Karnal, Haryana', isAvailable: true, images: ['/assets/images/Pump-set.jpg'] },
    { name: 'Combined Harvester', nameHi: 'कंबाइन हार्वेस्टर', type: 'harvester', pricePerDay: 5000, location: 'Karnal, Haryana', isAvailable: true, images: ['/assets/images/Harvestor.jpg'] },
    { name: 'Rotavator', nameHi: 'रोटावेटर', type: 'farming_machine', pricePerDay: 800, location: 'Karnal, Haryana', isAvailable: true, images: ['/assets/images/Farming-Equipments.png'] }
  ];
  renderEquipment(fallback, grid);
}

function bookEquipment(id) {
  if (!authToken) { openAuthModal(); return; }
  alert('Booking feature - Please select dates for rental');
}
