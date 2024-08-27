const apiKey = "33911ea4c2075ba643aa1de60870e461";
const lang = "es";
const units = "metric";

const elements = {
  cityInput: document.querySelector(".city-input"),
  searchBtn: document.querySelector(".search-btn"),
  locationBtn: document.querySelector(".location-btn"),
  weatherInfoSection: document.querySelector(".weather-info"),
  notFoundSection: document.querySelector(".not-found"),
  searchCitySection: document.querySelector(".search-city"),
  countryTxt: document.querySelector(".country-txt"),
  tempTxt: document.querySelector(".temp-txt"),
  conditionTxt: document.querySelector(".condition-txt"),
  humidityValueTxt: document.querySelector(".humidity-value-txt"),
  windValueTxt: document.querySelector(".wind-value-txt"),
  weatherSummaryImg: document.querySelector(".weather-summary-img"),
  currentDateTxt: document.querySelector(".current-date-txt"),
  forecastItemsContainer: document.querySelector(".forecast-items-container"),
};

elements.searchBtn.addEventListener("click", () =>
  handleSearch(elements.cityInput.value.trim())
);
elements.cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleSearch(elements.cityInput.value.trim());
});
elements.locationBtn.addEventListener("click", handleLocation);

async function fetchWeatherData(endpoint, city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=${units}&lang=${lang}`
    );
    if (!response.ok) throw new Error(`Error en ${endpoint}`);
    return response.json();
  } catch (error) {
    console.error(`Error en fetchWeatherData (${endpoint}):`, error);
    alert("Error al obtener los datos del clima.");
  }
}

function displayWeather({ name, main, weather, wind }) {
  elements.countryTxt.textContent = name;
  elements.tempTxt.textContent = `${Math.round(main.temp)} °C`;
  elements.conditionTxt.textContent = weather[0].description;
  elements.humidityValueTxt.textContent = `${main.humidity}%`;
  elements.windValueTxt.textContent = `${wind.speed} m/s`;
  elements.weatherSummaryImg.src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  elements.currentDateTxt.textContent = new Date().toLocaleDateString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

async function updateWeatherInfo(city) {
  const weatherData = await fetchWeatherData("weather", city);
  if (weatherData.cod === 200) {
    displayWeather(weatherData);
    await updateForecastsInfo(city);
    showSection(elements.weatherInfoSection);
  } else {
    showSection(elements.notFoundSection);
  }
}

async function updateForecastsInfo(city) {
  const forecastData = await fetchWeatherData("forecast", city);
  elements.forecastItemsContainer.innerHTML =
    forecastData.list
      .filter(
        ({ dt_txt }) =>
          dt_txt.includes("12:00:00") &&
          !dt_txt.includes(new Date().toISOString().split("T")[0])
      )
      .map(
        ({ dt_txt, weather, main }) => `
      <div class="forecast-item">
        <h5 class="forecast-item-date regular-txt">${new Date(
          dt_txt
        ).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}</h5>
        <img src="https://openweathermap.org/img/wn/${
          weather[0].icon
        }@2x.png" class="forecast-item-img" />
        <h5 class="forecast-item-temp">${Math.round(main.temp)} °C</h5>
      </div>
    `
      )
      .join("") || "<p>Error al cargar pronósticos.</p>";
}

async function handleSearch(city) {
  if (city) {
    await updateWeatherInfo(city);
    elements.cityInput.value = "";
    elements.cityInput.blur();
  }
}

async function getCityFromCoordinates(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}&lang=${lang}`
    );
    if (!response.ok) throw new Error(`Error en reverse geocoding`);

    const data = await response.json();
    if (data.length === 0 || !data[0].name) {
      throw new Error("No se pudo obtener la ciudad.");
    }

    return data[0].name;
  } catch (error) {
    console.error("Error en getCityFromCoordinates:", error);
    alert(`No se pudo obtener la ciudad. Detalles: ${error.message}`);
  }
}


async function handleLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        const city = await getCityFromCoordinates(latitude, longitude);
        if (city) await updateWeatherInfo(city);
      },
      (error) => {
        console.error("Error al obtener la ubicación:", error);
        alert("No se pudo obtener la ubicación.");
      }
    );
  } else {
    alert("La geolocalización no está soportada en este navegador.");
  }
}

function showSection(section) {
  [
    elements.weatherInfoSection,
    elements.searchCitySection,
    elements.notFoundSection,
  ].forEach((sec) => (sec.style.display = "none"));
  section.style.display = "flex";
}
