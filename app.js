// ==============================================
// ⚠️ 必填資訊：請替換成您自己的 OpenWeatherMap API Key
// ==============================================
const OPEN_WEATHER_API_KEY = "2606725991726d660a5bff34c8c58ee7"; 
// 範例 Key: "123456789abcdefgh" (請務必換成您真實的 Key)

// 📍 京都、大阪的經緯度 (用於精確查詢)
const LOCATIONS = {
    "Kyoto": { lat: 35.0116, lon: 135.7681 },
    "Osaka": { lat: 34.6937, lon: 135.5023 }
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

// 核心函數：從 API 獲取天氣資料並更新 HTML
async function fetchAndRenderWeather(city, location) {
    const { lat, lon } = location;
    // 使用 One Call API 獲取未來 7 天預報 (Daily)
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${OPEN_WEATHER_API_KEY}&units=metric&lang=zh_tw`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API 請求失敗: ${response.statusText}`);
        }
        const data = await response.json();
        const forecastElements = document.querySelectorAll(`[data-city="${city}"] .weather-day-card`);
        
        // 只取未來 3 天的資料 (API 回傳的 daily[0] 是今天)
        const threeDayData = data.daily.slice(0, 3); 

        threeDayData.forEach((dayData, index) => {
            const date = new Date(dayData.dt * 1000); // 轉換為毫秒
            const dayElement = forecastElements[index];

            if (dayElement) {
                const icon = getWeatherIcon(dayData.weather[0].id);
                const tempMin = Math.round(dayData.temp.min);
                const tempMax = Math.round(dayData.temp.max);

                // 更新日期顯示 (使用 '今日', '明日', '後日')
                let dateLabel = '';
                if (index === 0) dateLabel = '今日';
                else if (index === 1) dateLabel = '明日';
                else if (index === 2) dateLabel = '後日';
                
                // 動態更新卡片內容
                dayElement.querySelector('h4').textContent = `${dateLabel} (${date.getMonth() + 1}/${date.getDate()})`;
                dayElement.querySelector('.weather-icon').textContent = icon;
                dayElement.querySelector('.temp').textContent = `${tempMin}°C / ${tempMax}°C`;
            }
        });
        
        // 更新標題的 Placeholder
        const titleElement = document.querySelector(`[data-city="${city}"] .forecast-title span`);
        if (titleElement) {
             titleElement.innerHTML = `✅ **${city} 3天預報 (數據更新於 ${new Date().toLocaleTimeString('zh-TW')})**`;
        }

    } catch (error) {
        console.error(`無法獲取 ${city} 的天氣:`, error);
        document.querySelectorAll(`[data-city="${city}"] .forecast-title span`).forEach(el => {
            el.innerHTML = `❌ **天氣獲取失敗，請檢查 API Key**`;
        });
    }
}

// 主初始化函數
function initWeather() {
    // 檢查 API Key 是否已替換
    if (OPEN_WEATHER_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
        document.querySelectorAll('.forecast-title span').forEach(el => {
            el.innerHTML = `⚠️ **請先在 app.js 中設定您的 OpenWeatherMap API Key**`;
        });
        return;
    }

    // 針對京都和大阪的區域進行天氣查詢
    // 預設 Day 1, Day 2 在京都
    fetchAndRenderWeather('Kyoto', LOCATIONS.Kyoto);
    
    // 預設 Day 3, Day 4, Day 5 在大阪
    fetchAndRenderWeather('Osaka', LOCATIONS.Osaka); 
}

// 確保在文件加載完成後執行
document.addEventListener('DOMContentLoaded', initWeather);

// (此處省略記帳功能的 JS 程式碼，假設它在 index.html 內部或另一個 JS 檔案)