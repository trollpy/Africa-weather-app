// API Key - Replace with your actual API key from OpenWeatherMap
const API_KEY = "9f54a155a95ea5362b7bb0ffb1bb525a";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// DOM Elements
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const cityElement = document.getElementById("city");
const countryElement = document.getElementById("country");
const temperatureElement = document.getElementById("temperature");
const tempHighElement = document.getElementById("temp-high");
const tempLowElement = document.getElementById("temp-low");
const weatherIconElement = document.getElementById("weather-icon");
const conditionElement = document.getElementById("condition");
const windSpeedElement = document.getElementById("wind-speed");
const humidityElement = document.getElementById("humidity");
const visibilityElement = document.getElementById("visibility");
const feelsLikeElement = document.getElementById("feels-like");
const forecastCardsContainer = document.getElementById("forecast-cards");
const currentYearElement = document.getElementById("current-year");

// Set current year in footer
currentYearElement.textContent = new Date().getFullYear();

// Weather icon mapping
const weatherIcons = {
    "01d": "clear-day.svg",
    "01n": "clear-night.svg",
    "02d": "partly-cloudy-day.svg",
    "02n": "partly-cloudy-night.svg",
    "03d": "cloudy.svg",
    "03n": "cloudy.svg",
    "04d": "overcast.svg",
    "04n": "overcast.svg",
    "09d": "rain.svg",
    "09n": "rain.svg",
    "10d": "partly-cloudy-day-rain.svg",
    "10n": "partly-cloudy-night-rain.svg",
    "11d": "thunderstorms.svg",
    "11n": "thunderstorms.svg",
    "13d": "snow.svg",
    "13n": "snow.svg",
    "50d": "mist.svg",
    "50n": "mist.svg"
};

// Function to get icon URL
// function getIconUrl(iconCode) {
//     return `icons/${weatherIcons[iconCode] || 'cloudy.svg'}`;
// }
function getIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// Format temperature
function formatTemperature(temp) {
    return Math.round(temp) + "°C";
}

// Get weather data for a city
async function getWeatherData(city) {
    try {
        const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) {
            throw new Error(" 😒City not found");
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Could not find weather data for this location. Please check the city name and try again.");
        return null;
    }
}

// Get forecast data for a city
async function getForecastData(city) {
    try {
        const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) {
            throw new Error("Forecast data not available");
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching forecast data:", error);
        return null;
    }
}

// Update current weather UI
function updateCurrentWeather(data) {
    if (!data) return;
    
    // Update location info
    cityElement.textContent = data.name;
    countryElement.textContent = data.sys.country;
    
    // Update temperature
    temperatureElement.textContent = formatTemperature(data.main.temp);
    tempHighElement.textContent = formatTemperature(data.main.temp_max);
    tempLowElement.textContent = formatTemperature(data.main.temp_min);
    
    // Update weather condition and icon
    conditionElement.textContent = data.weather[0].description;
    weatherIconElement.src = getIconUrl(data.weather[0].icon);
    
    // Update additional info
    windSpeedElement.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    humidityElement.textContent = `${data.main.humidity}%`;
    visibilityElement.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    feelsLikeElement.textContent = formatTemperature(data.main.feels_like);
}

// Update forecast UI
function updateForecast(data) {
    if (!data) return;
    
    forecastCardsContainer.innerHTML = "";
    
    // Process forecast data (every 8 items = 1 day as the API returns data in 3-hour intervals)
    const dailyForecasts = [];
    const dayMap = {};
    
    // Group forecasts by day
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });
        
        if (!dayMap[day] && dailyForecasts.length < 5) {
            dayMap[day] = true;
            dailyForecasts.push(item);
        }
    });
    
    // Create forecast cards
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });
        
        const forecastCard = document.createElement("div");
        forecastCard.classList.add("forecast-card");
        
        forecastCard.innerHTML = `
            <div class="day">${day}</div>
            <img class="icon-small" src="${getIconUrl(forecast.weather[0].icon)}" alt="${forecast.weather[0].description}">
            <div class="temp">${formatTemperature(forecast.main.temp)}</div>
            <div class="condition">${forecast.weather[0].description}</div>
        `;
        
        forecastCardsContainer.appendChild(forecastCard);
    });
}

// Search for weather data
async function searchWeather() {
    const city = searchInput.value.trim();
    
    if (!city) {
        alert("Please enter a city name");
        return;
    }
    
    const weatherData = await getWeatherData(city);
    if (weatherData) {
        updateCurrentWeather(weatherData);
        const forecastData = await getForecastData(city);
        updateForecast(forecastData);
    }
}

// Event listeners
searchButton.addEventListener("click", searchWeather);
searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        searchWeather();
    }
});

// Initialize with a default African city
window.addEventListener("load", () => {
    searchInput.value = "Nairobi";
    searchWeather();
});