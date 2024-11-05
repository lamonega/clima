// Configuración básica
const API_KEY = "33911ea4c2075ba643aa1de60870e461";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Elementos del DOM
const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");
const locationBtn = document.querySelector(".location-btn");
const weatherInfo = document.querySelector(".weather-info");
const notFound = document.querySelector(".not-found");
const searchCity = document.querySelector(".search-city");

// Event Listeners
searchBtn.addEventListener("click", () => buscarClima(cityInput.value.trim()));
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") buscarClima(cityInput.value.trim());
});
locationBtn.addEventListener("click", usarUbicacion);

// Función principal para buscar el clima
async function buscarClima(ciudad) {
  if (!ciudad) return;

  try {
    const clima = await obtenerDatos(`${BASE_URL}/weather?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`);
    const pronostico = await obtenerDatos(`${BASE_URL}/forecast?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`);
    
    mostrarClima(clima);
    mostrarPronostico(pronostico);
    mostrarSeccion(weatherInfo);
    
    cityInput.value = "";
    cityInput.blur();
  } catch {
    mostrarSeccion(notFound);
  }
}

// Funciones auxiliares
async function obtenerDatos(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error("Error en la petición");
  return respuesta.json();
}

function mostrarClima(datos) {
  document.querySelector(".country-txt").textContent = datos.name;
  document.querySelector(".temp-txt").textContent = `${Math.round(datos.main.temp)} °C`;
  document.querySelector(".condition-txt").textContent = datos.weather[0].description;
  document.querySelector(".humidity-value-txt").textContent = `${datos.main.humidity}%`;
  document.querySelector(".wind-value-txt").textContent = `${datos.wind.speed} m/s`;
  document.querySelector(".weather-summary-img").src = 
    `https://openweathermap.org/img/wn/${datos.weather[0].icon}@2x.png`;
  document.querySelector(".current-date-txt").textContent = 
    new Date().toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short" });
}

function mostrarPronostico(datos) {
  const pronosticos = datos.list
    .filter(item => item.dt_txt.includes("12:00:00"))
    .slice(0, 5)
    .map(item => `
      <div class="forecast-item">
        <h5 class="forecast-item-date regular-txt">
          ${new Date(item.dt_txt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
        </h5>
        <img 
          src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" 
          class="forecast-item-img" 
          alt="Clima"
        />
        <h5 class="forecast-item-temp">${Math.round(item.main.temp)} °C</h5>
      </div>
    `).join("");

  document.querySelector(".forecast-items-container").innerHTML = pronosticos;
}

async function usarUbicacion() {
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización");
    return;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;
    const respuesta = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
    );
    
    const datos = await respuesta.json();
    if (datos[0]?.name) {
      buscarClima(datos[0].name);
    }
  } catch {
    alert("No se pudo obtener tu ubicación");
  }
}

function mostrarSeccion(seccion) {
  [weatherInfo, searchCity, notFound].forEach(s => s.style.display = "none");
  seccion.style.display = "flex";
}