// Tourism Component
async function loadTourism() {
  const grid = document.getElementById('tourism-grid');
  if (!grid) return;
  try {
    const res = await fetch(`${API_BASE}/tourism?limit=6`);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      renderTourism(data.data, grid);
    } else {
      renderFallbackTourism(grid);
    }
  } catch (e) {
    renderFallbackTourism(grid);
  }
}

function renderTourism(places, grid) {
  grid.innerHTML = places.map(place => {
    const name = currentLang === 'hi' && place.nameHi ? place.nameHi : place.name;
    const desc = currentLang === 'hi' && place.descriptionHi ? place.descriptionHi : place.description;
    const img = place.images?.[0] || getTourismImage(place.category);
    return `
    <div class="tourism-card">
      <div class="relative h-52 overflow-hidden">
        <img src="${img}" alt="${escapeHtml(name)}" class="w-full h-full object-cover" loading="lazy">
        <span class="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-zinc-800/90 text-xs font-medium rounded-lg capitalize">${place.category}</span>
        <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p class="text-white text-sm">${place.location}</p>
        </div>
      </div>
      <div class="p-5">
        <h3 class="font-semibold text-lg mb-2">${escapeHtml(name)}</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">${escapeHtml(desc)}</p>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">${place.bestTimeToVisit || 'Year round'}</span>
          <button class="text-green-700 dark:text-green-400 text-sm font-medium hover:underline">View Details</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function getTourismImage(category) {
  const images = {
    heritage: '/assets/images/Nalanada.jpg',
    nature: '/assets/images/chitrakoot.png',
    cultural: '/assets/images/surajkund-mela.jpg',
    religious: '/assets/images/chitrakoot.png',
    adventure: '/assets/images/chitrakoot.png',
    village_life: '/assets/images/surajkund-mela.jpg'
  };
  return images[category] || images.heritage;
}

function renderFallbackTourism(grid) {
  const fallback = [
    { name: 'Nalanda University Ruins', nameHi: 'नालंदा विश्वविद्यालय खंडहर', description: 'Ancient ruins of the world-famous Nalanda University, a UNESCO World Heritage Site.', descriptionHi: 'विश्व प्रसिद्ध नालंदा विश्वविद्यालय के प्राचीन खंडहर, यूनेस्को विश्व धरोहर स्थल।', category: 'heritage', location: 'Nalanda, Bihar', bestTimeToVisit: 'Oct-Mar', images: [] },
    { name: 'Surajkund Village Fair', nameHi: 'सूरजकुंड ग्राम मेला', description: 'Annual cultural fair showcasing rural crafts, food, and traditions from across India.', descriptionHi: 'पूरे भारत से ग्रामीण शिल्प, भोजन और परंपराओं को प्रदर्शित करने वाला वार्षिक सांस्कृतिक मेला।', category: 'cultural', location: 'Faridabad, Haryana', bestTimeToVisit: 'February', images: [] },
    { name: 'Chitrakoot Dham', nameHi: 'चित्रकूट धाम', description: 'Sacred pilgrimage site associated with Lord Rama. Beautiful natural surroundings.', descriptionHi: 'भगवान राम से जुड़ा पवित्र तीर्थ स्थल। सुंदर प्राकृतिक परिवेश।', category: 'religious', location: 'Chitrakoot, UP', bestTimeToVisit: 'Oct-Mar', images: [] }
  ];
  renderTourism(fallback, grid);
}

// Load tourism on page load
document.addEventListener('DOMContentLoaded', () => { loadTourism(); });
