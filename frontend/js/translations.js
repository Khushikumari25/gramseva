// GramSeva Translations
const translations = {
  en: {
    nav: { home: 'Home', schemes: 'Schemes', marketplace: 'Marketplace', equipment: 'Equipment', tourism: 'Tourism', emergency: 'Emergency', login: 'Login', logout: 'Logout' },
    hero: { badge: 'AI-Powered Rural Platform', title: 'GramSeva', subtitle: 'One Village At A Time', description: 'Empowering farmers, villagers, and rural communities with AI-powered services, government schemes, marketplace, and emergency support.', explore: 'Explore Schemes', askAI: 'Ask AI Assistant', farmers: 'Farmers', schemes: 'Schemes', states: 'States', verified: 'Verified Schemes' },
    features: { title: 'Our Services', subtitle: 'Complete rural ecosystem powered by AI technology', schemes: 'Government Schemes', schemesDesc: 'Access 200+ government schemes for Bihar, Haryana, UP, Punjab, Jharkhand', marketplace: 'Marketplace', marketplaceDesc: 'Buy and sell dairy, handicrafts, organic products, and more', equipment: 'Equipment Rental', equipmentDesc: 'Rent tractors, harvesters, pump sets and farming machines', ai: 'AI Assistant', aiDesc: 'Multilingual voice AI for farming guidance and scheme help', disease: 'Crop Disease Detection', diseaseDesc: 'Upload crop photos for AI-powered disease detection and treatment', emergency: 'Emergency Services', emergencyDesc: 'One-click emergency calls for ambulance, police, fire brigade' },
    schemes: { title: 'Government Schemes', subtitle: 'Latest schemes for farmers and rural communities' },
    marketplace: { title: 'Marketplace', subtitle: 'Fresh products from rural entrepreneurs' },
    equipment: { title: 'Equipment Rental', subtitle: 'Rent farming equipment at affordable prices' },
    tourism: { title: 'Village Tourism', subtitle: 'Discover the beauty of rural India' },
    emergency: { title: 'Emergency Services', subtitle: 'Quick access to emergency helplines' },
    ai: { title: 'GramSeva AI', subtitle: 'Your farming assistant', welcome: 'Hello! I am GramSeva AI. Ask me about farming, schemes, weather, or equipment.', placeholder: 'Type your question...' },
    auth: { login: 'Login', register: 'Register', otp: 'OTP', loginSubtitle: 'Access your GramSeva account', sendOtp: 'Send OTP' },
    common: { viewAll: 'View All', perDay: '/day', book: 'Book Now', buy: 'Buy Now', available: 'Available', booked: 'Booked' },
    footer: { description: 'Empowering rural India with technology, one village at a time.', services: 'Services', support: 'Support', connect: 'Connect', help: 'Help Center', contact: 'Contact Us' }
  },
  hi: {
    nav: { home: 'होम', schemes: 'योजनाएं', marketplace: 'बाज़ार', equipment: 'उपकरण', tourism: 'पर्यटन', emergency: 'आपातकाल', login: 'लॉगिन', logout: 'लॉगआउट' },
    hero: { badge: 'AI-संचालित ग्रामीण मंच', title: 'ग्रामसेवा', subtitle: 'एक गांव एक समय', description: 'AI-संचालित सेवाओं, सरकारी योजनाओं, बाज़ार और आपातकालीन सहायता के साथ किसानों, ग्रामीणों और ग्रामीण समुदायों को सशक्त बनाना।', explore: 'योजनाएं देखें', askAI: 'AI से पूछें', farmers: 'किसान', schemes: 'योजनाएं', states: 'राज्य', verified: 'सत्यापित योजनाएं' },
    features: { title: 'हमारी सेवाएं', subtitle: 'AI तकनीक द्वारा संचालित संपूर्ण ग्रामीण पारिस्थितिकी तंत्र', schemes: 'सरकारी योजनाएं', schemesDesc: 'बिहार, हरियाणा, यूपी, पंजाब, झारखंड की 200+ सरकारी योजनाएं', marketplace: 'बाज़ार', marketplaceDesc: 'डेयरी, हस्तशिल्प, जैविक उत्पाद और बहुत कुछ खरीदें और बेचें', equipment: 'उपकरण किराया', equipmentDesc: 'ट्रैक्टर, हार्वेस्टर, पंप सेट और कृषि मशीनें किराये पर लें', ai: 'AI सहायक', aiDesc: 'खेती मार्गदर्शन और योजना सहायता के लिए बहुभाषी वॉइस AI', disease: 'फसल रोग पहचान', diseaseDesc: 'AI-संचालित रोग पहचान के लिए फसल की तस्वीरें अपलोड करें', emergency: 'आपातकालीन सेवाएं', emergencyDesc: 'एम्बुलेंस, पुलिस, दमकल के लिए एक-क्लिक कॉल' },
    schemes: { title: 'सरकारी योजनाएं', subtitle: 'किसानों और ग्रामीण समुदायों के लिए नवीनतम योजनाएं' },
    marketplace: { title: 'बाज़ार', subtitle: 'ग्रामीण उद्यमियों से ताज़ा उत्पाद' },
    equipment: { title: 'उपकरण किराया', subtitle: 'किफायती दामों पर कृषि उपकरण किराये पर लें' },
    tourism: { title: 'ग्राम पर्यटन', subtitle: 'ग्रामीण भारत की सुंदरता खोजें' },
    emergency: { title: 'आपातकालीन सेवाएं', subtitle: 'आपातकालीन हेल्पलाइन तक त्वरित पहुंच' },
    ai: { title: 'ग्रामसेवा AI', subtitle: 'आपका कृषि सहायक', welcome: 'नमस्ते! मैं ग्रामसेवा AI हूं। मुझसे खेती, योजनाओं, मौसम या उपकरण के बारे में पूछें।', placeholder: 'अपना सवाल लिखें...' },
    auth: { login: 'लॉगिन', register: 'रजिस्टर', otp: 'OTP', loginSubtitle: 'अपने ग्रामसेवा खाते में प्रवेश करें', sendOtp: 'OTP भेजें' },
    common: { viewAll: 'सभी देखें', perDay: '/दिन', book: 'बुक करें', buy: 'खरीदें', available: 'उपलब्ध', booked: 'बुक हो चुका' },
    footer: { description: 'तकनीक के साथ ग्रामीण भारत को सशक्त बनाना, एक गांव एक समय।', services: 'सेवाएं', support: 'सहायता', connect: 'संपर्क', help: 'सहायता केंद्र', contact: 'संपर्क करें' }
  },
  bho: {
    nav: { home: 'होम', schemes: 'योजना', marketplace: 'बजार', equipment: 'औजार', tourism: 'घूमे के जगह', emergency: 'आपातकाल', login: 'लॉगिन', logout: 'लॉगआउट' },
    hero: { badge: 'AI से चले वाला ग्रामीण मंच', title: 'ग्रामसेवा', subtitle: 'एक गांव एक बेर', description: 'AI सेवा, सरकारी योजना, बजार आ आपातकालीन मदद से किसान आ गांव के लोगन के ताकत देवे वाला।', explore: 'योजना देखीं', askAI: 'AI से पूछीं', farmers: 'किसान', schemes: 'योजना', states: 'राज्य', verified: 'जांचल योजना' },
    features: { title: 'हमार सेवा', subtitle: 'AI तकनीक से चले वाला पूरा ग्रामीण व्यवस्था', schemes: 'सरकारी योजना', schemesDesc: 'बिहार, हरियाणा, यूपी, पंजाब, झारखंड के 200+ सरकारी योजना', marketplace: 'बजार', marketplaceDesc: 'दूध, हस्तशिल्प, जैविक सामान खरीदीं आ बेचीं', equipment: 'औजार किराया', equipmentDesc: 'ट्रैक्टर, हार्वेस्टर, पंप सेट किराया पर लीं', ai: 'AI सहायक', aiDesc: 'खेती मार्गदर्शन खातिर बहुभाषी AI', disease: 'फसल रोग पहचान', diseaseDesc: 'फसल के फोटो डालीं, AI बीमारी बताई', emergency: 'आपातकालीन सेवा', emergencyDesc: 'एम्बुलेंस, पुलिस, दमकल खातिर एक क्लिक' },
    schemes: { title: 'सरकारी योजना', subtitle: 'किसान आ गांव के लोगन खातिर नया योजना' },
    marketplace: { title: 'बजार', subtitle: 'गांव के उद्यमी से ताजा सामान' },
    equipment: { title: 'औजार किराया', subtitle: 'सस्ता दाम पर खेती के औजार किराया पर' },
    tourism: { title: 'गांव पर्यटन', subtitle: 'गांव के सुंदरता देखीं' },
    emergency: { title: 'आपातकालीन सेवा', subtitle: 'जल्दी मदद खातिर हेल्पलाइन' },
    ai: { title: 'ग्रामसेवा AI', subtitle: 'रउआ खेती सहायक', welcome: 'प्रणाम! हम ग्रामसेवा AI हईं। हमसे खेती, योजना, मौसम भा औजार के बारे में पूछीं।', placeholder: 'अपना सवाल लिखीं...' },
    auth: { login: 'लॉगिन', register: 'रजिस्टर', otp: 'OTP', loginSubtitle: 'अपना ग्रामसेवा खाता में जाईं', sendOtp: 'OTP भेजीं' },
    common: { viewAll: 'सब देखीं', perDay: '/दिन', book: 'बुक करीं', buy: 'खरीदीं', available: 'उपलब्ध', booked: 'बुक भइल' },
    footer: { description: 'तकनीक से गांव के ताकत देवे वाला, एक गांव एक बेर।', services: 'सेवा', support: 'मदद', connect: 'संपर्क', help: 'मदद केंद्र', contact: 'संपर्क करीं' }
  },
  pa: {
    nav: { home: 'ਹੋਮ', schemes: 'ਯੋਜਨਾਵਾਂ', marketplace: 'ਬਾਜ਼ਾਰ', equipment: 'ਸਾਜ਼ੋ-ਸਾਮਾਨ', tourism: 'ਸੈਰ-ਸਪਾਟਾ', emergency: 'ਐਮਰਜੈਂਸੀ', login: 'ਲੌਗਇਨ', logout: 'ਲੌਗਆਊਟ' },
    hero: { badge: 'AI-ਸੰਚਾਲਿਤ ਪੇਂਡੂ ਪਲੇਟਫਾਰਮ', title: 'ਗ੍ਰਾਮਸੇਵਾ', subtitle: 'ਇੱਕ ਪਿੰਡ ਇੱਕ ਸਮੇਂ', description: 'AI ਸੇਵਾਵਾਂ, ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ, ਬਾਜ਼ਾਰ ਅਤੇ ਐਮਰਜੈਂਸੀ ਸਹਾਇਤਾ ਨਾਲ ਕਿਸਾਨਾਂ ਨੂੰ ਸ਼ਕਤੀ ਦੇਣਾ।', explore: 'ਯੋਜਨਾਵਾਂ ਦੇਖੋ', askAI: 'AI ਤੋਂ ਪੁੱਛੋ', farmers: 'ਕਿਸਾਨ', schemes: 'ਯੋਜਨਾਵਾਂ', states: 'ਰਾਜ', verified: 'ਪ੍ਰਮਾਣਿਤ ਯੋਜਨਾਵਾਂ' },
    features: { title: 'ਸਾਡੀਆਂ ਸੇਵਾਵਾਂ', subtitle: 'AI ਤਕਨਾਲੋਜੀ ਨਾਲ ਸੰਚਾਲਿਤ ਪੂਰਾ ਪੇਂਡੂ ਈਕੋਸਿਸਟਮ', schemes: 'ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ', schemesDesc: '200+ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ', marketplace: 'ਬਾਜ਼ਾਰ', marketplaceDesc: 'ਡੇਅਰੀ, ਹਸਤਸ਼ਿਲਪ, ਜੈਵਿਕ ਉਤਪਾਦ ਖਰੀਦੋ ਅਤੇ ਵੇਚੋ', equipment: 'ਸਾਜ਼ੋ-ਸਾਮਾਨ ਕਿਰਾਇਆ', equipmentDesc: 'ਟਰੈਕਟਰ, ਹਾਰਵੈਸਟਰ ਕਿਰਾਏ ਤੇ ਲਓ', ai: 'AI ਸਹਾਇਕ', aiDesc: 'ਖੇਤੀ ਮਾਰਗਦਰਸ਼ਨ ਲਈ ਬਹੁਭਾਸ਼ੀ AI', disease: 'ਫਸਲ ਰੋਗ ਪਛਾਣ', diseaseDesc: 'ਫਸਲ ਦੀਆਂ ਫੋਟੋਆਂ ਅਪਲੋਡ ਕਰੋ', emergency: 'ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ', emergencyDesc: 'ਐਂਬੂਲੈਂਸ, ਪੁਲਿਸ ਲਈ ਇੱਕ-ਕਲਿੱਕ ਕਾਲ' },
    schemes: { title: 'ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ', subtitle: 'ਕਿਸਾਨਾਂ ਲਈ ਨਵੀਆਂ ਯੋਜਨਾਵਾਂ' },
    marketplace: { title: 'ਬਾਜ਼ਾਰ', subtitle: 'ਪੇਂਡੂ ਉੱਦਮੀਆਂ ਤੋਂ ਤਾਜ਼ੇ ਉਤਪਾਦ' },
    equipment: { title: 'ਸਾਜ਼ੋ-ਸਾਮਾਨ ਕਿਰਾਇਆ', subtitle: 'ਸਸਤੇ ਦਾਮਾਂ ਤੇ ਖੇਤੀ ਸਾਜ਼ੋ-ਸਾਮਾਨ' },
    tourism: { title: 'ਪਿੰਡ ਸੈਰ-ਸਪਾਟਾ', subtitle: 'ਪੇਂਡੂ ਭਾਰਤ ਦੀ ਸੁੰਦਰਤਾ ਖੋਜੋ' },
    emergency: { title: 'ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ', subtitle: 'ਹੈਲਪਲਾਈਨ ਤੱਕ ਤੇਜ਼ ਪਹੁੰਚ' },
    ai: { title: 'ਗ੍ਰਾਮਸੇਵਾ AI', subtitle: 'ਤੁਹਾਡਾ ਖੇਤੀ ਸਹਾਇਕ', welcome: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਗ੍ਰਾਮਸੇਵਾ AI ਹਾਂ। ਮੈਨੂੰ ਖੇਤੀ, ਯੋਜਨਾਵਾਂ, ਮੌਸਮ ਬਾਰੇ ਪੁੱਛੋ।', placeholder: 'ਆਪਣਾ ਸਵਾਲ ਲਿਖੋ...' },
    auth: { login: 'ਲੌਗਇਨ', register: 'ਰਜਿਸਟਰ', otp: 'OTP', loginSubtitle: 'ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਜਾਓ', sendOtp: 'OTP ਭੇਜੋ' },
    common: { viewAll: 'ਸਭ ਦੇਖੋ', perDay: '/ਦਿਨ', book: 'ਬੁੱਕ ਕਰੋ', buy: 'ਖਰੀਦੋ', available: 'ਉਪਲਬਧ', booked: 'ਬੁੱਕ ਹੋਇਆ' },
    footer: { description: 'ਤਕਨਾਲੋਜੀ ਨਾਲ ਪੇਂਡੂ ਭਾਰਤ ਨੂੰ ਸ਼ਕਤੀ ਦੇਣਾ।', services: 'ਸੇਵਾਵਾਂ', support: 'ਸਹਾਇਤਾ', connect: 'ਸੰਪਰਕ', help: 'ਮਦਦ ਕੇਂਦਰ', contact: 'ਸੰਪਰਕ ਕਰੋ' }
  },
  hne: {
    nav: { home: 'होम', schemes: 'योजना', marketplace: 'बाजार', equipment: 'औजार', tourism: 'घूमण जोग जगहां', emergency: 'आपातकाल', login: 'लॉगिन', logout: 'लॉगआउट' },
    hero: { badge: 'AI आळा गांव का मंच', title: 'ग्रामसेवा', subtitle: 'एक गांव एक बार', description: 'AI सेवा, सरकारी योजना, बाजार अर आपातकालीन मदद तै किसान अर गांव के लोगां नै ताकत देणा।', explore: 'योजना देखो', askAI: 'AI तै पूछो', farmers: 'किसान', schemes: 'योजना', states: 'राज्य', verified: 'जांची योजना' },
    features: { title: 'म्हारी सेवा', subtitle: 'AI तकनीक तै चालू पूरा गांव का सिस्टम', schemes: 'सरकारी योजना', schemesDesc: '200+ सरकारी योजना', marketplace: 'बाजार', marketplaceDesc: 'दूध, हस्तशिल्प, जैविक सामान खरीदो अर बेचो', equipment: 'औजार किराया', equipmentDesc: 'ट्रैक्टर, हार्वेस्टर किराये पै लो', ai: 'AI सहायक', aiDesc: 'खेती मार्गदर्शन खातर AI', disease: 'फसल रोग पहचान', diseaseDesc: 'फसल की फोटो डालो, AI बीमारी बतावैगा', emergency: 'आपातकालीन सेवा', emergencyDesc: 'एम्बुलेंस, पुलिस खातर एक क्लिक' },
    schemes: { title: 'सरकारी योजना', subtitle: 'किसान खातर नई योजना' },
    marketplace: { title: 'बाजार', subtitle: 'गांव के लोगां तै ताजा सामान' },
    equipment: { title: 'औजार किराया', subtitle: 'सस्ते दाम पै खेती के औजार' },
    tourism: { title: 'गांव पर्यटन', subtitle: 'गांव की सुंदरता देखो' },
    emergency: { title: 'आपातकालीन सेवा', subtitle: 'जल्दी मदद खातर हेल्पलाइन' },
    ai: { title: 'ग्रामसेवा AI', subtitle: 'थारा खेती सहायक', welcome: 'राम राम! मैं ग्रामसेवा AI हूं। मेरतै खेती, योजना, मौसम के बारै में पूछो।', placeholder: 'अपणा सवाल लिखो...' },
    auth: { login: 'लॉगिन', register: 'रजिस्टर', otp: 'OTP', loginSubtitle: 'अपणे खाते में जाओ', sendOtp: 'OTP भेजो' },
    common: { viewAll: 'सब देखो', perDay: '/दिन', book: 'बुक करो', buy: 'खरीदो', available: 'उपलब्ध', booked: 'बुक हो ग्या' },
    footer: { description: 'तकनीक तै गांव नै ताकत देणा।', services: 'सेवा', support: 'मदद', connect: 'संपर्क', help: 'मदद केंद्र', contact: 'संपर्क करो' }
  }
};
