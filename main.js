// Configuración básica
const API_KEY = "33911ea4c2075ba643aa1de60870e461";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_URL = "https://api.openweathermap.org/geo/1.0";

// Elementos del DOM almacenados en un objeto para fácil acceso
const DOM = {
  cityInput: document.querySelector(".city-input"),
  searchBtn: document.querySelector(".search-btn"),
  locationBtn: document.querySelector(".location-btn"),
  weatherInfo: document.querySelector(".weather-info"),
  notFound: document.querySelector(".not-found"),
  searchCity: document.querySelector(".search-city"),
  countryTxt: document.querySelector(".country-txt"),
  tempTxt: document.querySelector(".temp-txt"),
  conditionTxt: document.querySelector(".condition-txt"),
  humidityValueTxt: document.querySelector(".humidity-value-txt"),
  windValueTxt: document.querySelector(".wind-value-txt"),
  weatherSummaryImg: document.querySelector(".weather-summary-img"),
  currentDateTxt: document.querySelector(".current-date-txt"),
  forecastContainer: document.querySelector(".forecast-items-container"),
};

// Event Listeners
DOM.searchBtn.addEventListener("click", handleSearch);
DOM.cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});
DOM.locationBtn.addEventListener("click", handleLocation);

// Función manejadora para la búsqueda de clima
async function handleSearch() {
  const ciudad = DOM.cityInput.value.trim();
  if (!ciudad) return;

  try {
    const [clima, pronostico] = await Promise.all([
      obtenerDatos(`${BASE_URL}/weather?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`),
      obtenerDatos(`${BASE_URL}/forecast?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`),
    ]);

    mostrarClima(clima);
    mostrarPronostico(pronostico);
    mostrarSeccion(DOM.weatherInfo);

    DOM.cityInput.value = "";
    DOM.cityInput.blur();
  } catch {
    mostrarSeccion(DOM.notFound);
  }
}

// Función principal para obtener datos de la API
async function obtenerDatos(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error("Error en la petición");
  return respuesta.json();
}

// Función para mostrar la información del clima actual
function mostrarClima(datos) {
  const { name, main, weather, wind } = datos;
  DOM.countryTxt.textContent = name;
  DOM.tempTxt.textContent = `${Math.round(main.temp)} °C`;
  DOM.conditionTxt.textContent = capitalizeFirstLetter(weather[0].description);
  DOM.humidityValueTxt.textContent = `${main.humidity}%`;
  DOM.windValueTxt.textContent = `${wind.speed} m/s`;
  DOM.weatherSummaryImg.src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  DOM.currentDateTxt.textContent = new Date().toLocaleDateString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

// Función para mostrar el pronóstico del clima
function mostrarPronostico(datos) {
  const pronosticos = datos.list
    .filter((item) => item.dt_txt.includes("12:00:00"))
    .slice(0, 5)
    .map(
      (item) => `
      <div class="forecast-item">
        <h5 class="forecast-item-date regular-txt">
          ${new Date(item.dt_txt).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
          })}
        </h5>
        <img 
          src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" 
          class="forecast-item-img" 
          alt="Clima"
        />
        <h5 class="forecast-item-temp">${Math.round(item.main.temp)} °C</h5>
      </div>`
    )
    .join("");

  DOM.forecastContainer.innerHTML = pronosticos;
}

// Función manejadora para obtener el clima basado en la ubicación del usuario
async function handleLocation() {
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización");
    return;
  }

  try {
    const position = await obtenerPosicion();
    const { latitude, longitude } = position.coords;

    const respuesta = await fetch(
      `${GEO_URL}/reverse?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&limit=1`
    );

    const datos = await respuesta.json();
    if (datos[0]?.name) {
      handleSearchByCity(datos[0].name);
    } else {
      throw new Error("No se pudo determinar la ciudad desde la ubicación");
    }
  } catch {
    alert("No se pudo obtener tu ubicación");
  }
}

// Función para obtener la posición del usuario
function obtenerPosicion() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

// Función para buscar clima por ciudad obtenida de la ubicación
async function handleSearchByCity(ciudad) {
  try {
    const [clima, pronostico] = await Promise.all([
      obtenerDatos(`${BASE_URL}/weather?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`),
      obtenerDatos(`${BASE_URL}/forecast?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`),
    ]);

    mostrarClima(clima);
    mostrarPronostico(pronostico);
    mostrarSeccion(DOM.weatherInfo);
  } catch {
    mostrarSeccion(DOM.notFound);
  }
}

// Función para mostrar una sección específica y ocultar las demás
function mostrarSeccion(seccion) {
  Object.values(DOM)
    .filter((element) => ["weatherInfo", "searchCity", "notFound"].includes(element.className))
    .forEach((element) => (element.style.display = "none"));

  seccion.style.display = "flex";
}

// Función auxiliar para capitalizar la primera letra
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}