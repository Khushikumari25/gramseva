require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Scheme = require('../models/Scheme');
const Product = require('../models/Product');
const Equipment = require('../models/Equipment');
const Tourism = require('../models/Tourism');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gramseva');
  console.log('MongoDB connected for seeding');
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Scheme.deleteMany({}),
      Product.deleteMany({}),
      Equipment.deleteMany({}),
      Tourism.deleteMany({})
    ]);

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gramseva.in',
      phone: '9999999999',
      password: 'admin123',
      role: 'admin',
      state: 'Bihar',
      isVerified: true
    });

    // Create sample users
    const farmer = await User.create({
      name: 'Ramesh Kumar',
      email: 'ramesh@example.com',
      phone: '9876543210',
      password: 'farmer123',
      role: 'farmer',
      state: 'Bihar',
      district: 'Patna',
      village: 'Danapur',
      isVerified: true
    });

    const seller = await User.create({
      name: 'Sunita Devi',
      email: 'sunita@example.com',
      phone: '9876543211',
      password: 'seller123',
      role: 'seller',
      state: 'Bihar',
      district: 'Muzaffarpur',
      isVerified: true
    });

    const equipOwner = await User.create({
      name: 'Manoj Singh',
      email: 'manoj@example.com',
      phone: '9876543212',
      password: 'owner123',
      role: 'equipment_owner',
      state: 'Haryana',
      district: 'Karnal',
      isVerified: true
    });

    // Seed Government Schemes
    const schemes = await Scheme.insertMany([
      {
        title: 'PM Kisan Samman Nidhi',
        titleHi: 'पीएम किसान सम्मान निधि',
        description: 'Direct income support of Rs 6000 per year to farmer families with cultivable land.',
        descriptionHi: 'खेती योग्य भूमि वाले किसान परिवारों को प्रति वर्ष 6000 रुपये की प्रत्यक्ष आय सहायता।',
        state: 'All',
        category: 'agriculture',
        eligibility: 'All farmer families with cultivable land holding',
        eligibilityHi: 'खेती योग्य भूमि वाले सभी किसान परिवार',
        requiredDocuments: ['Aadhaar Card', 'Land Records', 'Bank Account'],
        benefits: 'Rs 6000 per year in 3 installments',
        benefitsHi: '3 किस्तों में प्रति वर्ष 6000 रुपये',
        applicationUrl: 'https://pmkisan.gov.in',
        isActive: true,
        createdBy: admin._id
      },
      {
        title: 'Bihar Krishi Input Subsidy',
        titleHi: 'बिहार कृषि इनपुट अनुदान',
        description: 'Subsidy for agricultural inputs for farmers affected by natural calamities.',
        descriptionHi: 'प्राकृतिक आपदाओं से प्रभावित किसानों के लिए कृषि इनपुट पर अनुदान।',
        state: 'Bihar',
        category: 'agriculture',
        eligibility: 'Farmers affected by flood, drought or other natural calamities in Bihar',
        eligibilityHi: 'बिहार में बाढ़, सूखा या अन्य प्राकृतिक आपदाओं से प्रभावित किसान',
        requiredDocuments: ['Aadhaar Card', 'Land Records', 'Bank Account', 'Damage Certificate'],
        benefits: 'Up to Rs 13500 per hectare',
        benefitsHi: 'प्रति हेक्टेयर 13500 रुपये तक',
        applicationUrl: 'https://dbtagriculture.bihar.gov.in',
        isActive: true,
        createdBy: admin._id
      },
      {
        title: 'Haryana Meri Fasal Mera Byora',
        titleHi: 'हरियाणा मेरी फसल मेरा ब्यौरा',
        description: 'Crop registration portal for MSP procurement and insurance benefits.',
        descriptionHi: 'MSP खरीद और बीमा लाभ के लिए फसल पंजीकरण पोर्टल।',
        state: 'Haryana',
        category: 'agriculture',
        eligibility: 'All farmers in Haryana',
        eligibilityHi: 'हरियाणा के सभी किसान',
        requiredDocuments: ['Aadhaar Card', 'Land Records', 'Bank Account', 'Mobile Number'],
        benefits: 'MSP procurement guarantee and crop insurance',
        benefitsHi: 'MSP खरीद गारंटी और फसल बीमा',
        applicationUrl: 'https://fasal.haryana.gov.in',
        isActive: true,
        createdBy: admin._id
      },
      {
        title: 'UP Kisan Uday Yojana',
        titleHi: 'यूपी किसान उदय योजना',
        description: 'Free solar pump distribution to farmers for irrigation.',
        descriptionHi: 'सिंचाई के लिए किसानों को मुफ्त सोलर पंप वितरण।',
        state: 'Uttar Pradesh',
        category: 'agriculture',
        eligibility: 'Small and marginal farmers in UP',
        eligibilityHi: 'यूपी के छोटे और सीमांत किसान',
        requiredDocuments: ['Aadhaar Card', 'Land Records', 'Income Certificate'],
        benefits: 'Free solar pump for irrigation',
        benefitsHi: 'सिंचाई के लिए मुफ्त सोलर पंप',
        applicationUrl: 'https://agriculture.up.gov.in',
        isActive: true,
        createdBy: admin._id
      },
      {
        title: 'Punjab Paani Bachao Paise Kamao',
        titleHi: 'पंजाब पानी बचाओ पैसे कमाओ',
        description: 'Incentive scheme for farmers who save electricity in paddy cultivation.',
        descriptionHi: 'धान की खेती में बिजली बचाने वाले किसानों के लिए प्रोत्साहन योजना।',
        state: 'Punjab',
        category: 'agriculture',
        eligibility: 'Paddy farmers in Punjab with electric tube wells',
        eligibilityHi: 'बिजली ट्यूबवेल वाले पंजाब के धान किसान',
        requiredDocuments: ['Aadhaar Card', 'Electricity Bill', 'Land Records'],
        benefits: 'Rs 4 per unit of electricity saved',
        benefitsHi: 'बचाई गई प्रति यूनिट बिजली पर 4 रुपये',
        applicationUrl: 'https://agri.punjab.gov.in',
        isActive: true,
        createdBy: admin._id
      },
      {
        title: 'Jharkhand Mukhyamantri Krishi Ashirwad Yojana',
        titleHi: 'झारखंड मुख्यमंत्री कृषि आशीर्वाद योजना',
        description: 'Financial assistance to small and marginal farmers for Kharif crops.',
        descriptionHi: 'खरीफ फसलों के लिए छोटे और सीमांत किसानों को वित्तीय सहायता।',
        state: 'Jharkhand',
        category: 'agriculture',
        eligibility: 'Farmers with up to 5 acres of land in Jharkhand',
        eligibilityHi: 'झारखंड में 5 एकड़ तक भूमि वाले किसान',
        requiredDocuments: ['Aadhaar Card', 'Land Records', 'Bank Account'],
        benefits: 'Rs 5000 per acre per year',
        benefitsHi: 'प्रति एकड़ प्रति वर्ष 5000 रुपये',
        applicationUrl: 'https://mmkay.jharkhand.gov.in',
        isActive: true,
        createdBy: admin._id
      }
    ]);

    // Seed Products
    await Product.insertMany([
      {
        name: 'Fresh Cow Milk',
        nameHi: 'ताजा गाय का दूध',
        description: 'Pure organic cow milk from local farm. Fresh daily delivery available.',
        descriptionHi: 'स्थानीय फार्म से शुद्ध जैविक गाय का दूध। दैनिक ताजा डिलीवरी उपलब्ध।',
        category: 'dairy',
        price: 60,
        unit: 'litre',
        seller: seller._id,
        stock: 50,
        location: 'Muzaffarpur, Bihar',
        images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop']
      },
      {
        name: 'Handwoven Blanket',
        nameHi: 'हाथ से बुना कंबल',
        description: 'Traditional handwoven woolen blanket made by local artisans.',
        descriptionHi: 'स्थानीय कारीगरों द्वारा बनाया गया पारंपरिक हाथ से बुना ऊनी कंबल।',
        category: 'blankets',
        price: 1200,
        unit: 'piece',
        seller: seller._id,
        stock: 20,
        location: 'Muzaffarpur, Bihar',
        images: ['https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=400&h=300&fit=crop']
      },
      {
        name: 'Madhubani Painting',
        nameHi: 'मधुबनी पेंटिंग',
        description: 'Authentic Madhubani painting on handmade paper by local women artists.',
        descriptionHi: 'स्थानीय महिला कलाकारों द्वारा हस्तनिर्मित कागज पर प्रामाणिक मधुबनी पेंटिंग।',
        category: 'handicrafts',
        price: 800,
        unit: 'piece',
        seller: seller._id,
        stock: 15,
        location: 'Madhubani, Bihar',
        images: ['https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop']
      },
      {
        name: 'Organic Turmeric Powder',
        nameHi: 'जैविक हल्दी पाउडर',
        description: 'Pure organic turmeric powder from village farms. No chemicals used.',
        descriptionHi: 'गांव के खेतों से शुद्ध जैविक हल्दी पाउडर। कोई रसायन नहीं।',
        category: 'organic',
        price: 250,
        unit: 'kg',
        seller: seller._id,
        stock: 100,
        location: 'Patna, Bihar',
        images: ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop']
      },
      {
        name: 'Homemade Pickle (Mango)',
        nameHi: 'घर का बना अचार (आम)',
        description: 'Traditional homemade mango pickle with authentic village taste.',
        descriptionHi: 'प्रामाणिक गांव के स्वाद के साथ पारंपरिक घर का बना आम का अचार।',
        category: 'homemade',
        price: 180,
        unit: 'kg',
        seller: seller._id,
        stock: 30,
        location: 'Muzaffarpur, Bihar',
        images: ['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=300&fit=crop']
      }
    ]);

    // Seed Equipment
    await Equipment.insertMany([
      {
        name: 'Mahindra 575 DI Tractor',
        nameHi: 'महिंद्रा 575 DI ट्रैक्टर',
        type: 'tractor',
        description: '45 HP tractor suitable for all farming operations. Well maintained.',
        descriptionHi: 'सभी कृषि कार्यों के लिए उपयुक्त 45 HP ट्रैक्टर। अच्छी तरह से रखरखाव किया गया।',
        owner: equipOwner._id,
        pricePerDay: 1500,
        pricePerHour: 250,
        location: 'Karnal, Haryana',
        condition: 'excellent',
        isAvailable: true
      },
      {
        name: 'Submersible Pump Set',
        nameHi: 'सबमर्सिबल पंप सेट',
        type: 'pump_set',
        description: '5 HP submersible pump for irrigation. Includes pipes and fittings.',
        descriptionHi: 'सिंचाई के लिए 5 HP सबमर्सिबल पंप। पाइप और फिटिंग शामिल।',
        owner: equipOwner._id,
        pricePerDay: 500,
        pricePerHour: 100,
        location: 'Karnal, Haryana',
        condition: 'good',
        isAvailable: true
      },
      {
        name: 'Combined Harvester',
        nameHi: 'कंबाइन हार्वेस्टर',
        type: 'harvester',
        description: 'Modern combined harvester for wheat and paddy. Efficient and fast.',
        descriptionHi: 'गेहूं और धान के लिए आधुनिक कंबाइन हार्वेस्टर। कुशल और तेज।',
        owner: equipOwner._id,
        pricePerDay: 5000,
        pricePerHour: 800,
        location: 'Karnal, Haryana',
        condition: 'excellent',
        isAvailable: true
      },
      {
        name: 'Rotavator',
        nameHi: 'रोटावेटर',
        type: 'farming_machine',
        description: 'Heavy duty rotavator for soil preparation. Compatible with most tractors.',
        descriptionHi: 'मिट्टी की तैयारी के लिए हैवी ड्यूटी रोटावेटर। अधिकांश ट्रैक्टरों के साथ संगत।',
        owner: equipOwner._id,
        pricePerDay: 800,
        pricePerHour: 150,
        location: 'Karnal, Haryana',
        condition: 'good',
        isAvailable: true
      }
    ]);

    // Seed Tourism
    await Tourism.insertMany([
      {
        name: 'Nalanda University Ruins',
        nameHi: 'नालंदा विश्वविद्यालय खंडहर',
        description: 'Ancient ruins of the world-famous Nalanda University, a UNESCO World Heritage Site.',
        descriptionHi: 'विश्व प्रसिद्ध नालंदा विश्वविद्यालय के प्राचीन खंडहर, यूनेस्को विश्व धरोहर स्थल।',
        category: 'heritage',
        location: 'Nalanda, Bihar',
        state: 'Bihar',
        coordinates: { lat: 25.1357, lng: 85.4427 },
        bestTimeToVisit: 'October to March',
        facilities: ['Parking', 'Guide', 'Museum', 'Restrooms'],
        isApproved: true,
        createdBy: admin._id
      },
      {
        name: 'Surajkund Village Fair',
        nameHi: 'सूरजकुंड ग्राम मेला',
        description: 'Annual cultural fair showcasing rural crafts, food, and traditions from across India.',
        descriptionHi: 'पूरे भारत से ग्रामीण शिल्प, भोजन और परंपराओं को प्रदर्शित करने वाला वार्षिक सांस्कृतिक मेला।',
        category: 'cultural',
        location: 'Faridabad, Haryana',
        state: 'Haryana',
        coordinates: { lat: 28.3929, lng: 77.2910 },
        bestTimeToVisit: 'February',
        facilities: ['Food Stalls', 'Parking', 'Cultural Shows', 'Shopping'],
        isApproved: true,
        createdBy: admin._id
      },
      {
        name: 'Chitrakoot Dham',
        nameHi: 'चित्रकूट धाम',
        description: 'Sacred pilgrimage site associated with Lord Rama. Beautiful natural surroundings.',
        descriptionHi: 'भगवान राम से जुड़ा पवित्र तीर्थ स्थल। सुंदर प्राकृतिक परिवेश।',
        category: 'religious',
        location: 'Chitrakoot, Uttar Pradesh',
        state: 'Uttar Pradesh',
        coordinates: { lat: 25.2048, lng: 80.8847 },
        bestTimeToVisit: 'October to March',
        facilities: ['Temple', 'Dharamshala', 'Boat Ride', 'Parking'],
        isApproved: true,
        createdBy: admin._id
      }
    ]);

    console.log('Seed data inserted successfully');
    console.log('Admin login: admin@gramseva.in / admin123');
    console.log('Farmer login: ramesh@example.com / farmer123');
    console.log('Seller login: sunita@example.com / seller123');
    console.log('Equipment Owner login: manoj@example.com / owner123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
