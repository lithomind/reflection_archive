
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const P2PQUAKE_API = 'https://api.p2pquake.net/v2/history?codes=551&limit=5';

export async function fetchEarthquakeInfo() {
  try {
    const res = await fetch(P2PQUAKE_API);
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch earthquake info', e);
    return null;
  }
}

export async function fetchWeatherInfo(lat: number, lon: number) {
  try {
    const res = await fetch(`${WEATHER_API}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FTokyo`);
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch weather info', e);
    return null;
  }
}

export function formatIntensity(scale: number): string {
  if (scale <= 0) return '-';
  if (scale < 10) return '1未満';
  if (scale < 20) return '1';
  if (scale < 30) return '2';
  if (scale < 40) return '3';
  if (scale < 45) return '4';
  if (scale < 50) return '5弱';
  if (scale < 55) return '5強';
  if (scale < 60) return '6弱';
  if (scale < 70) return '6強';
  return '7';
}

export function getWeatherIcon(code: number) {
  if (code === 0) return '☀️ 晴れ';
  if (code <= 3) return '🌤️ 晴れ/曇り';
  if (code <= 48) return '🌫️ 霧';
  if (code <= 67) return '🌧️ 雨';
  if (code <= 77) return '❄️ 雪';
  if (code <= 82) return '🚿 俄か雨';
  if (code <= 99) return '⛈️ 雷雨';
  return '☁️ 曇り';
}
