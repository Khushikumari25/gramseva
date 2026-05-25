// Marketplace Component
function getCategoryImage(category) {
  const images = {
    dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
    blankets: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=400&h=300&fit=crop',
    handicrafts: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop',
    homemade: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=300&fit=crop',
    organic: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop',
    farming: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop'
  };
  return images[category] || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop';
}

async function loadMarketplace() {
  const grid = document.getElementById('marketplace-grid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/marketplace?limit=4`);
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

function renderProducts(products, grid) {
  grid.innerHTML = products.map(product => {
    const name = currentLang === 'hi' && product.nameHi ? product.nameHi : product.name;
    const img = product.images?.[0] || getCategoryImage(product.category);
    return `
    <div class="product-card">
      <div class="relative h-48 overflow-hidden">
        <img src="${img}" alt="${escapeHtml(name)}" class="w-full h-full object-cover" loading="lazy">
        <span class="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-zinc-800/90 text-xs font-medium rounded-lg">${product.category}</span>
      </div>
      <div class="p-4">
        <h3 class="font-semibold mb-1 line-clamp-1">${escapeHtml(name)}</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-3">${product.location || ''}</p>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-green-700 dark:text-green-400">Rs ${product.price}/${product.unit || 'pc'}</span>
          <button class="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-sm rounded-lg transition-colors">${t('common.buy')}</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderFallbackProducts(grid) {
  const fallback = [
    { name: 'Fresh Cow Milk', nameHi: 'ताजा गाय का दूध', category: 'dairy', price: 60, unit: 'litre', location: 'Muzaffarpur, Bihar', images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop'] },
    { name: 'Handwoven Blanket', nameHi: 'हाथ से बुना कंबल', category: 'blankets', price: 1200, unit: 'piece', location: 'Muzaffarpur, Bihar', images: ['https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=400&h=300&fit=crop'] },
    { name: 'Organic Turmeric Powder', nameHi: 'जैविक हल्दी पाउडर', category: 'organic', price: 250, unit: 'kg', location: 'Patna, Bihar', images: ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop'] },
    { name: 'Homemade Mango Pickle', nameHi: 'घर का बना अचार (आम)', category: 'homemade', price: 180, unit: 'kg', location: 'Muzaffarpur, Bihar', images: ['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=300&fit=crop'] }
  ];
  renderProducts(fallback, grid);
}
