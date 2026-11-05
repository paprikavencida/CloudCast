
const $ = id => document.getElementById(id);

const grid = $("weather-grid");
const status = $("update-status");

const descriptions = {
    0: ["Céu limpo", "☀️"],
    1: ["Poucas nuvens", "🌤️"],
    2: ["Parcialmente nublado", "⛅"],
    3: ["Nublado", "☁️"],
    45: ["Neblina", "🌫️"],
    48: ["Neblina", "🌫️"],
    51: ["Garoa leve", "🌦️"],
    53: ["Garoa moderada", "🌦️"],
    55: ["Garoa intensa", "🌧️"],
    61: ["Chuva leve", "🌧️"],
    63: ["Chuva moderada", "🌧️"],
    65: ["Chuva forte", "🌧️"],
    71: ["Neve leve", "🌨️"],
    73: ["Neve moderada", "🌨️"],
    75: ["Neve forte", "❄️"],
    80: ["Pancadas de chuva", "🌦️"],
    81: ["Chuva moderada", "🌧️"],
    82: ["Chuva forte", "⛈️"],
    85: ["Pancadas de neve", "🌨️"],
    86: ["Neve forte", "❄️"],
    95: ["Trovoadas", "⛈️"],
    96: ["Trovoadas com granizo", "⛈️"],
    99: ["Tempestade forte", "⛈️"]
};

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function clock() {
    const now = new Date();

    if ($("date")) {
        $("date").textContent = now.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    if ($("time")) {
        $("time").textContent = now.toLocaleTimeString("pt-BR");
    }
}

async function fetchJSON(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
    }

    return response.json();
}

async function getCurrentLocation() {
    if (!navigator.geolocation) {
        throw new Error("Seu navegador não oferece geolocalização.");
    }

    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            resolve,
            error => {
                const messages = {
                    1: "Permita o acesso à localização no navegador.",
                    2: "Não foi possível identificar sua localização.",
                    3: "A localização demorou demais para responder."
                };

                reject(new Error(
                    messages[error.code] || "Erro ao obter localização."
                ));
            },
            {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 600000
            }
        );
    });

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const params = new URLSearchParams({
        latitude,
        longitude,
        localityLanguage: "pt"
    });

    const place = await fetchJSON(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`
    );

    const cityName =
        place.city ||
        place.locality ||
        place.principalSubdivision;

    if (!cityName || !place.countryCode) {
        throw new Error("Não foi possível identificar sua cidade.");
    }

    return {
        name: cityName,
        country_code: place.countryCode.toUpperCase(),
        latitude,
        longitude
    };
}

async function geocode(cityName, countryCode) {
    const params = new URLSearchParams({
        name: cityName,
        count: "1",
        language: "pt",
        format: "json",
        countryCode
    });

    const data = await fetchJSON(
        `https://geocoding-api.open-meteo.com/v1/search?${params}`
    );

    if (!data.results?.length) {
        throw new Error(`Cidade não encontrada: ${cityName}`);
    }

    return data.results[0];
}

async function getWeather(city) {
    const params = new URLSearchParams({
        latitude: city.latitude,
        longitude: city.longitude,
        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "weather_code",
            "wind_speed_10m"
        ].join(","),
        daily: [
            "sunrise",
            "sunset",
            "daylight_duration",
            "uv_index_max"
        ].join(","),
        timezone: "auto",
        forecast_days: "1"
    });

    return fetchJSON(
        `https://api.open-meteo.com/v1/forecast?${params}`
    );
}

function infoCard(number, title, message) {
    return `
        <article class="info-card">
            <div class="info-content">
                <span class="info-label">CARD ${number} / ${escapeHTML(title)}</span>
                <p>${escapeHTML(message)}</p>
            </div>
        </article>
    `;
}

function weatherCard(city, data, subtitle) {
    const current = data.current;

    const [description, icon] =
        descriptions[current.weather_code] ||
        ["Condição desconhecida", "🌡️"];

    return `
        <article class="weather-card">
            <div class="city-header">
                <div>
                    <h3>${escapeHTML(city.name)}</h3>
                    <p class="city-subtitle">${escapeHTML(subtitle)}</p>
                </div>
                <span class="weather-icon">${icon}</span>
            </div>

            <div class="temperature">
                ${Math.round(current.temperature_2m)}°
            </div>

            <p class="condition">${description}</p>

            <div class="weather-details">
                <div>
                    <span>Sensação</span>
                    <strong>${Math.round(current.apparent_temperature)}°C</strong>
                </div>

                <div>
                    <span>Umidade</span>
                    <strong>${current.relative_humidity_2m}%</strong>
                </div>

                <div>
                    <span>Vento</span>
                    <strong>${Math.round(current.wind_speed_10m)} km/h</strong>
                </div>
            </div>
        </article>
    `;
}

function atmosphericCard(data) {
    const daily = data.daily;

    const formatTime = value =>
        value?.split("T")[1] || "--:--";

    const seconds = daily.daylight_duration?.[0] || 0;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `
        <article class="weather-card atmospheric-card">
            <div class="city-header">
                <div>
                    <h3>Atmospheric Data</h3>
                    <p class="city-subtitle">CONDIÇÕES ATMOSFÉRICAS</p>
                </div>
                <span class="weather-icon">🌤️</span>
            </div>

            <div class="weather-details atmospheric-details">
                <div>
                    <span>Nascer do sol</span>
                    <strong>${formatTime(daily.sunrise?.[0])}</strong>
                </div>

                <div>
                    <span>Pôr do sol</span>
                    <strong>${formatTime(daily.sunset?.[0])}</strong>
                </div>

                <div>
                    <span>Índice UV</span>
                    <strong>${daily.uv_index_max?.[0]?.toFixed(1) ?? "--"}</strong>
                </div>

                <div>
                    <span>Luz do dia</span>
                    <strong>${hours}h ${minutes}m</strong>
                </div>
            </div>
        </article>
    `;
}

async function loadCity(cityName, countryCode, subtitle) {
    const city = await geocode(cityName, countryCode);
    const data = await getWeather(city);

    return weatherCard(city, data, subtitle);
}

async function load() {
    if (!grid) return;

    if (status) {
        status.textContent = "Atualizando dados...";
    }

    try {
        const current = await getCurrentLocation();
        const country = current.country_code;

        const currentData = await getWeather(current);

        const cards = [
            weatherCard(current, currentData, "LOCALIZAÇÃO ATUAL")
        ];

        const cities = CONFIG.countries[country];

        if (cities?.largest) {
            try {
                cards.push(await loadCity(
                    cities.largest,
                    country,
                    "MAIOR CIDADE DO PAÍS"
                ));
            } catch (error) {
                console.error("Erro na maior cidade:", error);
                cards.push(infoCard(
                    2,
                    "MAIOR CIDADE",
                    "Não foi possível carregar os dados."
                ));
            }
        } else {
            cards.push(infoCard(
                2,
                "MAIOR CIDADE",
                "País ainda não cadastrado."
            ));
        }

        if (cities?.capital) {
            try {
                cards.push(await loadCity(
                    cities.capital,
                    country,
                    "CAPITAL DO PAÍS"
                ));
            } catch (error) {
                console.error("Erro na capital:", error);
                cards.push(infoCard(
                    3,
                    "CAPITAL",
                    "Não foi possível carregar os dados."
                ));
            }
        } else {
            cards.push(infoCard(
                3,
                "CAPITAL",
                "País ainda não cadastrado."
            ));
        }

        cards.push(atmosphericCard(currentData));

        grid.innerHTML = cards.join("");

        if (status) {
            status.textContent =
                `Atualizado às ${new Date().toLocaleTimeString("pt-BR")}`;
        }

    } catch (error) {
        console.error("Cloudcast:", error);

        grid.innerHTML = `
            ${infoCard(1, "LOCALIZAÇÃO", error.message)}
            ${infoCard(2, "MAIOR CIDADE", "Aguardando identificação do país.")}
            ${infoCard(3, "CAPITAL", "Aguardando identificação do país.")}
            ${infoCard(4, "ATMOSPHERIC DATA", "Dados indisponíveis.")}
        `;

        if (status) {
            status.textContent = "Falha na atualização.";
        }
    }
}

function start() {
    if (typeof CONFIG === "undefined") {
        console.error("CONFIG não encontrado. Verifique config.js.");
        if (status) status.textContent = "Erro ao carregar configurações.";
        return;
    }

    if ($("version")) {
        $("version").textContent =
            `CLOUDCAST v${CONFIG.version}`;
    }

    clock();
    setInterval(clock, 1000);

    load();
    setInterval(load, CONFIG.refreshMinutes * 60000);
}

start();
