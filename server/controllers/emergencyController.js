const emergencyContacts = {
  national: [
    { name: 'Police', nameHi: 'पुलिस', number: '100', icon: 'shield' },
    { name: 'Ambulance', nameHi: 'एम्बुलेंस', number: '108', icon: 'ambulance' },
    { name: 'Fire Brigade', nameHi: 'दमकल', number: '101', icon: 'fire' },
    { name: 'Women Helpline', nameHi: 'महिला हेल्पलाइन', number: '1091', icon: 'female' },
    { name: 'Farmer Helpline', nameHi: 'किसान हेल्पलाइन', number: '1551', icon: 'farmer' },
    { name: 'Child Helpline', nameHi: 'बाल हेल्पलाइन', number: '1098', icon: 'child' },
    { name: 'Disaster Management', nameHi: 'आपदा प्रबंधन', number: '1078', icon: 'disaster' },
    { name: 'Kisan Call Center', nameHi: 'किसान कॉल सेंटर', number: '1800-180-1551', icon: 'phone' }
  ],
  states: {
    Bihar: [
      { name: 'Bihar Police', number: '100', icon: 'shield' },
      { name: 'Bihar Ambulance', number: '102', icon: 'ambulance' }
    ],
    Haryana: [
      { name: 'Haryana Police', number: '100', icon: 'shield' },
      { name: 'Haryana Women Helpline', number: '1091', icon: 'female' }
    ],
    'Uttar Pradesh': [
      { name: 'UP Police', number: '112', icon: 'shield' },
      { name: 'UP Women Helpline', number: '1090', icon: 'female' }
    ],
    Punjab: [
      { name: 'Punjab Police', number: '100', icon: 'shield' },
      { name: 'Punjab Helpline', number: '181', icon: 'phone' }
    ],
    Jharkhand: [
      { name: 'Jharkhand Police', number: '100', icon: 'shield' },
      { name: 'Jharkhand Helpline', number: '181', icon: 'phone' }
    ]
  }
};

exports.getEmergencyContacts = async (req, res) => {
  try {
    const { state } = req.query;
    const contacts = {
      national: emergencyContacts.national,
      state: state ? emergencyContacts.states[state] || [] : []
    };
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.reportEmergency = async (req, res) => {
  try {
    const { type, location, description, coordinates } = req.body;
    // In production, this would trigger alerts to relevant authorities
    console.log('Emergency reported:', { type, location, description, coordinates });
    res.json({ success: true, message: 'Emergency reported. Help is on the way.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
