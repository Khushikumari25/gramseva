const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'placeholder');

const SYSTEM_PROMPT = `You are GramSeva AI Assistant - a helpful farming and rural development assistant for Indian villages.
You help with:
- Farming advice (crops, pesticides, fertilizers, seasons)
- Government schemes information
- Equipment rental guidance
- Marketplace help
- Weather information
- Rural development queries

Always respond in the same language the user speaks (Hindi, English, Bhojpuri, Punjabi, Haryanvi).
Be concise, practical, and helpful. Give actionable advice suitable for Indian rural farmers.
If asked about something outside your scope, politely redirect to relevant rural topics.`;

exports.chatWithAssistant = async (req, res) => {
  try {
    const { message, language = 'hi', context = '' } = req.body;
    const msg = message.toLowerCase();

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder') {
      // Smart offline responses based on keywords
      const reply = getOfflineResponse(msg, language);
      return res.json({ success: true, data: { reply, language } });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `${SYSTEM_PROMPT}\n\nUser language: ${language}\nContext: ${context}\n\nUser: ${message}\n\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ success: true, data: { reply: response, language } });
  } catch (error) {
    const reply = getOfflineResponse(req.body.message || '', req.body.language || 'hi');
    res.json({ success: true, data: { reply, language: req.body.language } });
  }
};

function getOfflineResponse(msg, lang) {
  const m = msg.toLowerCase();
  const responses = {
    tractor: { hi: 'ट्रैक्टर किराये पर लेने के लिए Equipment Rental सेक्शन में जाएं। महिंद्रा 575 DI ट्रैक्टर Rs 1500/दिन पर उपलब्ध है। बुकिंग के लिए "Book Now" बटन दबाएं।', en: 'To rent a tractor, go to Equipment Rental section. Mahindra 575 DI Tractor is available at Rs 1500/day. Click "Book Now" to book.' },
    disease: { hi: 'फसल रोग पहचान के लिए Crop Scanner सेक्शन में जाएं। अपनी फसल की फोटो अपलोड करें, AI बीमारी बताएगा और दवाई सुझाएगा।', en: 'For crop disease detection, go to Crop Scanner section. Upload a photo of your crop and AI will identify the disease and suggest treatment.' },
    scheme: { hi: 'सरकारी योजनाओं के लिए Knowledge Hub में जाएं। PM-KISAN (Rs 6000/वर्ष), PM Fasal Bima Yojana, KCC (Rs 3 लाख लोन) जैसी 47+ योजनाएं उपलब्ध हैं।', en: 'For government schemes, visit Knowledge Hub. 47+ schemes available including PM-KISAN (Rs 6000/year), PM Fasal Bima Yojana, KCC (Rs 3 lakh loan).' },
    weather: { hi: 'मौसम जानकारी के लिए Weather सेक्शन में जाएं। अपना शहर डालें और मौसम देखें। आज का तापमान लगभग 32°C है।', en: 'For weather info, go to Weather section. Enter your city to check weather. Today temperature is around 32°C.' },
    equipment: { hi: 'उपकरण किराये पर लेने के लिए Equipment Rental में जाएं। ट्रैक्टर (Rs 1500/दिन), पंप सेट (Rs 500/दिन), हार्वेस्टर (Rs 5000/दिन) उपलब्ध हैं।', en: 'For equipment rental, visit Equipment section. Tractor (Rs 1500/day), Pump Set (Rs 500/day), Harvester (Rs 5000/day) available.' },
    mnrega: { hi: 'MNREGA में 100 दिन का रोजगार गारंटी है। Rs 247/दिन मजदूरी मिलती है। MNREGA Jobs सेक्शन में जाकर आवेदन करें।', en: 'MNREGA guarantees 100 days employment at Rs 247/day. Go to MNREGA Jobs section to apply.' },
    market: { hi: 'Marketplace में दूध, हल्दी, अचार, कंबल, हस्तशिल्प जैसे उत्पाद खरीद-बेच सकते हैं। Marketplace सेक्शन में जाएं।', en: 'In Marketplace you can buy/sell milk, turmeric, pickles, blankets, handicrafts. Visit Marketplace section.' },
    emergency: { hi: 'आपातकाल में: पुलिस 100, एम्बुलेंस 108, दमकल 101, महिला हेल्पलाइन 1091, किसान हेल्पलाइन 1551 पर कॉल करें।', en: 'In emergency: Police 100, Ambulance 108, Fire 101, Women Helpline 1091, Farmer Helpline 1551.' },
    hello: { hi: 'नमस्ते! मैं किसान मित्र हूं। खेती, उपकरण, योजनाओं, मौसम - किसी भी सवाल में मदद कर सकता हूं। पूछिए!', en: 'Hello! I am Kisan Mitra. I can help with farming, equipment, schemes, weather - ask me anything!' },
    default: { hi: 'मैं आपकी मदद कर सकता हूं: 1) सरकारी योजनाएं 2) उपकरण किराया 3) फसल रोग 4) मौसम 5) MNREGA 6) बाज़ार। क्या जानना चाहते हैं?', en: 'I can help with: 1) Govt Schemes 2) Equipment Rental 3) Crop Disease 4) Weather 5) MNREGA 6) Marketplace. What would you like to know?' }
  };

  let key = 'default';
  if (m.includes('tractor') || m.includes('ट्रैक्टर') || m.includes('किराय')) key = 'tractor';
  else if (m.includes('disease') || m.includes('रोग') || m.includes('बीमारी') || m.includes('crop')) key = 'disease';
  else if (m.includes('scheme') || m.includes('योजना') || m.includes('pm kisan') || m.includes('सरकार')) key = 'scheme';
  else if (m.includes('weather') || m.includes('मौसम') || m.includes('बारिश')) key = 'weather';
  else if (m.includes('equipment') || m.includes('उपकरण') || m.includes('pump') || m.includes('पंप') || m.includes('harvester')) key = 'equipment';
  else if (m.includes('mnrega') || m.includes('नरेगा') || m.includes('रोजगार') || m.includes('100 दिन')) key = 'mnrega';
  else if (m.includes('market') || m.includes('बाज़ार') || m.includes('बेच') || m.includes('खरीद')) key = 'market';
  else if (m.includes('emergency') || m.includes('आपातकाल') || m.includes('police') || m.includes('ambulance')) key = 'emergency';
  else if (m.includes('hello') || m.includes('hi') || m.includes('नमस्ते') || m.includes('हेलो')) key = 'hello';

  const r = responses[key];
  return (lang === 'en' ? r.en : r.hi) || r.hi;
}

exports.detectCropDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a crop image' });
    }

    const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this crop/plant image and provide:
1. Disease name (if any)
2. Severity level (Low/Medium/High/Critical)
3. Recommended pesticides
4. Recommended fertilizers
5. Treatment methods
6. Prevention tips

Respond in JSON format with keys: disease, severity, pesticides, fertilizers, treatment, prevention.
If the plant looks healthy, say so.
Respond in Hindi and English both.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
    ]);

    const response = result.response.text();
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch {
      parsed = { rawAnalysis: response };
    }

    res.json({ success: true, data: parsed, image: '/uploads/' + req.file.filename });
  } catch (error) {
    res.json({
      success: true,
      data: {
        disease: 'Analysis unavailable',
        severity: 'Unknown',
        pesticides: ['Please consult local agricultural officer'],
        fertilizers: ['Use balanced NPK fertilizer'],
        treatment: ['Consult KVK (Krishi Vigyan Kendra)'],
        prevention: ['Maintain proper irrigation', 'Use certified seeds']
      }
    });
  }
};

exports.getFarmingRecommendations = async (req, res) => {
  try {
    const { crop, season, state, soilType } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `As an Indian agricultural expert, provide farming recommendations:
Crop: ${crop || 'General'}
Season: ${season || 'Current'}
State: ${state || 'General India'}
Soil Type: ${soilType || 'Unknown'}

Provide in JSON format:
{
  "cropSuggestions": [],
  "pesticides": [],
  "fertilizers": [],
  "waterSchedule": "",
  "marketTrends": "",
  "tips": [],
  "warnings": []
}
Respond in Hindi.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch {
      parsed = { recommendations: response };
    }

    res.json({ success: true, data: parsed });
  } catch (error) {
    res.json({
      success: true,
      data: {
        cropSuggestions: ['गेहूं', 'धान', 'मक्का'],
        pesticides: ['नीम तेल', 'बायो-पेस्टिसाइड'],
        fertilizers: ['DAP', 'यूरिया', 'पोटाश'],
        waterSchedule: 'सप्ताह में 2-3 बार सिंचाई करें',
        tips: ['मिट्टी की जांच करवाएं', 'प्रमाणित बीज का उपयोग करें'],
        warnings: ['अत्यधिक रासायनिक उर्वरक से बचें']
      }
    });
  }
};
