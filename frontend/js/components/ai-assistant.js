// AI Assistant Component - Extended functionality
// Crop Disease Detection UI
function openCropDiseaseDetector() {
  const modal = document.getElementById('ai-modal');
  const messagesDiv = document.getElementById('ai-messages');
  modal.classList.remove('hidden');
  
  messagesDiv.innerHTML += `
    <div class="flex gap-3">
      <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0 flex items-center justify-center">
        <svg class="w-4 h-4 text-green-700 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/></svg>
      </div>
      <div class="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
        <p class="text-sm mb-2">Upload a photo of your crop for disease detection:</p>
        <label class="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg cursor-pointer hover:bg-green-800 text-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Upload Photo
          <input type="file" accept="image/*" class="hidden" onchange="analyzeCropImage(this)">
        </label>
      </div>
    </div>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function analyzeCropImage(input) {
  if (!input.files || !input.files[0]) return;
  
  const file = input.files[0];
  const messagesDiv = document.getElementById('ai-messages');
  
  // Show uploaded image
  const reader = new FileReader();
  reader.onload = (e) => {
    messagesDiv.innerHTML += `
      <div class="flex gap-3 justify-end">
        <div class="bg-green-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
          <img src="${e.target.result}" class="w-48 h-36 object-cover rounded-lg mb-2">
          <p class="text-sm">Analyzing crop image...</p>
        </div>
      </div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  };
  reader.readAsDataURL(file);

  // Send to API
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`${API_BASE}/ai/crop-disease`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken || ''}` },
      body: formData
    });
    const data = await res.json();
    
    if (data.success) {
      const result = data.data;
      const html = `
        <div class="flex gap-3">
          <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0 flex items-center justify-center">
            <svg class="w-4 h-4 text-green-700 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/></svg>
          </div>
          <div class="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
            <p class="font-semibold text-sm mb-2">Analysis Result:</p>
            <div class="space-y-1 text-sm">
              <p><strong>Disease:</strong> ${result.disease || 'Unknown'}</p>
              <p><strong>Severity:</strong> ${result.severity || 'N/A'}</p>
              <p><strong>Pesticides:</strong> ${Array.isArray(result.pesticides) ? result.pesticides.join(', ') : 'N/A'}</p>
              <p><strong>Fertilizers:</strong> ${Array.isArray(result.fertilizers) ? result.fertilizers.join(', ') : 'N/A'}</p>
              <p><strong>Treatment:</strong> ${Array.isArray(result.treatment) ? result.treatment.join(', ') : 'N/A'}</p>
            </div>
          </div>
        </div>`;
      messagesDiv.innerHTML += html;
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  } catch (e) {
    messagesDiv.innerHTML += `
      <div class="flex gap-3">
        <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0 flex items-center justify-center">
          <svg class="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/></svg>
        </div>
        <div class="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
          <p class="text-sm">Could not analyze image. Please try again or consult your local KVK.</p>
        </div>
      </div>`;
  }
}
