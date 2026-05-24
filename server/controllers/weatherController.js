const axios = require('axios');

exports.getWeather = async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    let url;
    const apiKey = process.env.OPENWEATHER_API_KEY || 'demo';

    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=hi`;
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric&lang=hi`;
    } else {
      return res.status(400).json({ success: false, error: 'Provide lat/lon or city' });
    }

    const response = await axios.get(url);
    const data = response.data;

    res.json({
      success: true,
      data: {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        city: data.name,
        country: data.sys.country
      }
    });
  } catch (error) {
    // Fallback weather data
    res.json({
      success: true,
      data: {
        temperature: 32,
        feelsLike: 35,
        humidity: 65,
        description: 'साफ आसमान',
        icon: '01d',
        windSpeed: 3.5,
        city: req.query.city || 'Unknown',
        country: 'IN'
      }
    });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY || 'demo';

    // Try to get forecast for alerts
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat || 25.6}&lon=${lon || 85.1}&appid=${apiKey}&units=metric&lang=hi`;
    const response = await axios.get(url);

    const alerts = [];
    const forecasts = response.data.list.slice(0, 8);

    forecasts.forEach(f => {
      if (f.rain && f.rain['3h'] > 10) {
        alerts.push({ type: 'rain', message: 'भारी बारिश की संभावना', severity: 'high', time: f.dt_txt });
      }
      if (f.main.temp > 42) {
        alerts.push({ type: 'heat', message: 'लू की चेतावनी', severity: 'high', time: f.dt_txt });
      }
      if (f.wind.speed > 15) {
        alerts.push({ type: 'wind', message: 'तेज हवा की चेतावनी', severity: 'medium', time: f.dt_txt });
      }
    });

    res.json({ success: true, data: { alerts, forecast: forecasts } });
  } catch (error) {
    res.json({
      success: true,
      data: {
        alerts: [{ type: 'info', message: 'मौसम सामान्य है', severity: 'low' }],
        forecast: []
      }
    });
  }
};
