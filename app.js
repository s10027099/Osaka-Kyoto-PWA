// ==============================================
// ⚠️ 必填資訊：請替換成您自己的 OpenWeatherMap API Key
// ==============================================
const OPEN_WEATHER_API_KEY = "2606725991726d660a5bff34c8c58ee7"; // 沿用您提供的 Key

// 📍 京都、大阪的城市 ID (使用 city ID 更穩定，取代經緯度)
const CITIES = {
    "Kyoto": 1857910, // 京都 City ID
    "Osaka": 1853909  // 大阪 City ID
};

// 輔助函數：將 OpenWeatherMap 的天氣 ID 轉換為易讀的表情符號
function getWeatherIcon(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return '⛈️'; // 雷雨
    if (weatherId >= 300 && weatherId < 500) return '🌦️'; // 毛毛雨
    if (weatherId >= 500 && weatherId < 600) return '🌧️'; // 下雨
    if (weatherId >= 600 && weatherId < 700) return '❄️'; // 下雪
    if (weatherId >= 700 && weatherId < 800) return '🌫️'; // 霧/沙/煙
    if (weatherId === 800) return '☀️'; // 晴天
    if (weatherId > 800) return '☁️'; // 多雲/陰天
    return '❓';
}

// 核心函數：從 API 獲取天氣資料並更新 HTML (使用 /forecast 免費端點)
async function fetchAndRenderWeather(city, cityId) {
    // 使用 5 day / 3 hour forecast 端點
    const url = `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${OPEN_WEATHER_API_KEY}&units=metric&lang=zh_tw`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API 請求失敗: ${response.statusText}`);
        }
        const data = await response.json();
        const forecastElements = document.querySelectorAll(`[data-city="${city}"] .weather-day-card`);
        
        // --- 處理 3 天預報邏輯：從 3 小時資料中提取每天中午的預報 ---
        
        const dailyForecasts = [];
        let previousDay = null;

        // 遍歷 5天/3小時資料
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const currentDay = date.getDate();
            const hour = date.getHours();

            // 確保只取每天的預報 (每天只取一次，最好是接近中午的時段)
            if (currentDay !== previousDay) {
                // 如果是第一天，確保是取當前時間後的第一個預報
                if (dailyForecasts.length < 3) {
                    dailyForecasts.push({
                        dt: item.dt,
                        temp: item.main.temp,
                        temp_min: item.main.temp_min,
                        temp_max: item.main.temp_max,
                        weatherId: item.weather[0].id
                    });
                    previousDay = currentDay;
                }
            }
        });
        
        // --- 渲染數據到 HTML ---

        dailyForecasts.slice(0, 3).forEach((dayData, index) => {
            const date = new Date(dayData.dt * 1000);
            const dayElement = forecastElements[index];

            if (dayElement) {
                const icon = getWeatherIcon(dayData.weatherId);
                const tempMin = Math.round(dayData.temp_min);
                const tempMax = Math.round(dayData.temp_max);

                let dateLabel = '';
                if (index === 0) dateLabel = '今日';
                else if (index === 1) dateLabel = '明日';
                else if (index === 2) dateLabel = '後日';
                
                dayElement.querySelector('h4').textContent = `${dateLabel} (${date.getMonth() + 1}/${date.getDate()})`;
                dayElement.querySelector('.weather-icon').textContent = icon;
                dayElement.querySelector('.temp').textContent = `${tempMin}°C / ${tempMax}°C`;
            }
        });
        
        // 更新標題
        const titleElement = document.querySelector(`[data-city="${city}"] .forecast-title span`);
        if (titleElement) {
             titleElement.innerHTML = `✅ **${city} 3天預報 (來源: OpenWeatherMap 5-Day Forecast)**`;
        }

    } catch (error) {
        console.error(`無法獲取 ${city} 的天氣:`, error);
        document.querySelectorAll(`[data-city="${city}"] .forecast-title span`).forEach(el => {
            el.innerHTML = `❌ **天氣獲取失敗，Key 無效或 API 不支援**`;
        });
    }
}

// 主初始化函數
function initWeather() {
    // 執行天氣查詢
    fetchAndRenderWeather('Kyoto', CITIES.Kyoto);
    fetchAndRenderWeather('Osaka', CITIES.Osaka); 
}

// 確保在文件加載完成後執行
document.addEventListener('DOMContentLoaded', initWeather);