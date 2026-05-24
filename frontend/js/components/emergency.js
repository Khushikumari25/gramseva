// Emergency Component
async function loadEmergencyContacts() {
  const grid = document.getElementById('emergency-grid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/emergency`);
    const data = await res.json();
    if (data.success) {
      renderEmergency(data.data.national, grid);
    } else {
      renderFallbackEmergency(grid);
    }
  } catch (e) {
    renderFallbackEmergency(grid);
  }
}

function renderEmergency(contacts, grid) {
  const icons = {
    shield: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
    ambulance: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
    fire: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>',
    female: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
    farmer: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>',
    child: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    disaster: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
    phone: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>'
  };

  grid.innerHTML = contacts.slice(0, 8).map(contact => {
    const name = currentLang === 'hi' && contact.nameHi ? contact.nameHi : contact.name;
    return `
    <a href="tel:${contact.number}" class="emergency-card flex flex-col items-center gap-3 hover:border-red-500">
      <div class="text-red-600 dark:text-red-400">${icons[contact.icon] || icons.phone}</div>
      <h4 class="font-medium text-sm text-center">${escapeHtml(name)}</h4>
      <span class="text-2xl font-bold text-red-700 dark:text-red-400">${contact.number}</span>
    </a>`;
  }).join('');
}

function renderFallbackEmergency(grid) {
  const contacts = [
    { name: 'Police', nameHi: 'पुलिस', number: '100', icon: 'shield' },
    { name: 'Ambulance', nameHi: 'एम्बुलेंस', number: '108', icon: 'ambulance' },
    { name: 'Fire Brigade', nameHi: 'दमकल', number: '101', icon: 'fire' },
    { name: 'Women Helpline', nameHi: 'महिला हेल्पलाइन', number: '1091', icon: 'female' },
    { name: 'Farmer Helpline', nameHi: 'किसान हेल्पलाइन', number: '1551', icon: 'farmer' },
    { name: 'Child Helpline', nameHi: 'बाल हेल्पलाइन', number: '1098', icon: 'child' },
    { name: 'Disaster Mgmt', nameHi: 'आपदा प्रबंधन', number: '1078', icon: 'disaster' },
    { name: 'Kisan Call Center', nameHi: 'किसान कॉल सेंटर', number: '1800-180-1551', icon: 'phone' }
  ];
  renderEmergency(contacts, grid);
}
