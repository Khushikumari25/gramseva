// Crop Disease Detection Component
let cropFile = null;

function handleCropUpload(input) {
  if (!input.files || !input.files[0]) return;
  cropFile = input.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('crop-preview-img').src = e.target.result;
    document.getElementById('crop-preview').classList.remove('hidden');
    document.getElementById('crop-upload-area').classList.add('hidden');
    document.getElementById('crop-results').classList.add('hidden');
  };
  reader.readAsDataURL(cropFile);
}

async function analyzeCrop() {
  if (!cropFile) return;
  document.getElementById('crop-loading').classList.remove('hidden');
  document.getElementById('crop-results').classList.add('hidden');

  const formData = new FormData();
  formData.append('image', cropFile);

  try {
    const res = await fetch(`${API_BASE}/ai/crop-disease`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken || ''}` },
      body: formData
    });
    const data = await res.json();
    document.getElementById('crop-loading').classList.add('hidden');

    if (data.success && data.data) {
      const r = data.data;
      document.getElementById('crop-disease-name').textContent = r.disease || 'Analysis Complete';
      document.getElementById('crop-severity').textContent = r.severity || 'N/A';
      document.getElementById('crop-pesticides').innerHTML = (r.pesticides || ['Consult local KVK']).map(p => `<li>- ${p}</li>`).join('');
      document.getElementById('crop-fertilizers').innerHTML = (r.fertilizers || ['Balanced NPK']).map(f => `<li>- ${f}</li>`).join('');
      document.getElementById('crop-treatment').innerHTML = (r.treatment || ['Consult agricultural officer']).map(t => `<li>- ${t}</li>`).join('');
      document.getElementById('crop-results').classList.remove('hidden');
    }
  } catch (e) {
    document.getElementById('crop-loading').classList.add('hidden');
    // Show fallback results
    document.getElementById('crop-disease-name').textContent = 'Unable to analyze (offline)';
    document.getElementById('crop-severity').textContent = 'N/A';
    document.getElementById('crop-pesticides').innerHTML = '<li>- Please consult local agricultural officer</li><li>- Visit nearest KVK center</li>';
    document.getElementById('crop-fertilizers').innerHTML = '<li>- Use balanced NPK fertilizer</li><li>- Add organic compost</li>';
    document.getElementById('crop-treatment').innerHTML = '<li>- Remove affected leaves</li><li>- Ensure proper drainage</li><li>- Use neem oil spray</li>';
    document.getElementById('crop-results').classList.remove('hidden');
  }
}

// Drag and drop support
document.addEventListener('DOMContentLoaded', () => {
  const area = document.getElementById('crop-upload-area');
  if (!area) return;
  area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('border-green-500'); });
  area.addEventListener('dragleave', () => area.classList.remove('border-green-500'));
  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('border-green-500');
    if (e.dataTransfer.files[0]) {
      document.getElementById('crop-file-input').files = e.dataTransfer.files;
      handleCropUpload(document.getElementById('crop-file-input'));
    }
  });
});
