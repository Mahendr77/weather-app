const searchButton = document.getElementById("search-button");
const cityInput = document.getElementById("city-input");
const locationButton = document.getElementById("location-button");


// =====================================
// DISPLAY WEATHER DATA
// =====================================

function displayWeather(data) {

    if (data.error) {
        alert(data.error);
        return;
    }

    // Location name
    document.getElementById("city-name").textContent =
        `${data.city}, ${data.country}`;

    // Temperature
    document.getElementById("temperature").textContent =
        data.temperature + " °C";

    // Humidity
    document.getElementById("humidity").textContent =
        "💧 Humidity: " + data.humidity + "%";

    // Wind
    document.getElementById("wind").textContent =
        "💨 Wind: " + data.wind + " km/h";

    // Weather condition
    document.getElementById("condition").textContent =
        getWeatherDescription(data.weatherCode);

    // Weather icon
    document.getElementById("weather-icon").textContent =
        getWeatherIcon(data.weatherCode);

    // 5-day forecast
    displayForecast(data.forecast);

    // Weather tip
    displayWeatherTip(
        data.temperature,
        data.weatherCode,
        data.wind
    );

    // Weather alert
    displayWeatherAlert(
        data.temperature,
        data.wind,
        data.forecast
    );
}


// =====================================
// SEARCH CITY / VILLAGE
// =====================================

async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {

        alert(
            "Please enter a city or village name"
        );

        return;
    }

    try {

        console.log(
            "Searching weather for:",
            city
        );

        const response = await fetch(
            `http://localhost:3000/weather?city=${encodeURIComponent(city)}`
        );

        if (!response.ok) {

            throw new Error(
                "Server error: " + response.status
            );

        }

        const data =
            await response.json();

        console.log(
            "Weather data:",
            data
        );

        displayWeather(data);

    }

    catch (error) {

        console.error(
            "Error:",
            error
        );

        alert(
            "Unable to connect to weather server.\n\n" +
            "Make sure server.js is running."
        );

    }

}


// =====================================
// MY LOCATION
// =====================================

function getMyLocationWeather() {

    if (!navigator.geolocation) {

        alert(
            "Geolocation is not supported by your browser."
        );

        return;
    }

    locationButton.textContent =
        "📍 Getting Location...";


    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            console.log(
                "Latitude:",
                latitude
            );

            console.log(
                "Longitude:",
                longitude
            );


            try {

                const response = await fetch(
                    `http://localhost:3000/weather-by-location?latitude=${latitude}&longitude=${longitude}`
                );


                if (!response.ok) {

                    throw new Error(
                        "Location weather request failed"
                    );

                }


                const data =
                    await response.json();


                console.log(
                    "Location weather:",
                    data
                );


                displayWeather(data);

            }


            catch (error) {

                console.error(
                    "Location error:",
                    error
                );


                alert(
                    "Unable to get weather for your location."
                );

            }


            finally {

                locationButton.textContent =
                    "📍 My Location";

            }

        },


        function(error) {

            locationButton.textContent =
                "📍 My Location";


            if (error.code === 1) {

                alert(
                    "Location permission was denied."
                );

            }

            else {

                alert(
                    "Unable to get your location."
                );

            }

        }

    );

}


// =====================================
// WEATHER DESCRIPTION
// WeatherAPI condition codes
// =====================================

function getWeatherDescription(code) {

    // Sunny
    if (code === 1000) {
        return "Clear Sky ☀️";
    }

    // Cloudy
    if (
        code === 1003 ||
        code === 1006 ||
        code === 1009
    ) {
        return "Cloudy ☁️";
    }

    // Mist / Fog
    if (
        code === 1030 ||
        code === 1135 ||
        code === 1147
    ) {
        return "Fog 🌫️";
    }

    // Rain
    if (
        code >= 1063 &&
        code <= 1201
    ) {
        return "Rain 🌧️";
    }

    // Snow
    if (
        code >= 1066 &&
        code <= 1225
    ) {
        return "Snow ❄️";
    }

    // Thunderstorm
    if (
        code === 1087 ||
        code === 1273 ||
        code === 1276 ||
        code === 1279 ||
        code === 1282
    ) {
        return "Thunderstorm ⛈️";
    }

    // Heavy rain / showers
    if (
        code >= 1240 &&
        code <= 1246
    ) {
        return "Rain Showers 🌦️";
    }

    return "Weather";
}


// =====================================
// WEATHER ICON
// WeatherAPI condition codes
// =====================================

function getWeatherIcon(code) {

    // Sunny
    if (code === 1000) {
        return "☀️";
    }

    // Cloudy
    if (
        code === 1003 ||
        code === 1006 ||
        code === 1009
    ) {
        return "☁️";
    }

    // Fog
    if (
        code === 1030 ||
        code === 1135 ||
        code === 1147
    ) {
        return "🌫️";
    }

    // Rain
    if (
        code >= 1063 &&
        code <= 1201
    ) {
        return "🌧️";
    }

    // Snow
    if (
        code >= 1066 &&
        code <= 1225
    ) {
        return "❄️";
    }

    // Thunderstorm
    if (
        code === 1087 ||
        code === 1273 ||
        code === 1276 ||
        code === 1279 ||
        code === 1282
    ) {
        return "⛈️";
    }

    // Rain showers
    if (
        code >= 1240 &&
        code <= 1246
    ) {
        return "🌦️";
    }

    return "🌤️";
}


// =====================================
// 5-DAY FORECAST
// =====================================

function displayForecast(forecast) {

    const container =
        document.getElementById(
            "forecast-container"
        );


    container.innerHTML = "";


    if (
        !forecast ||
        forecast.length === 0
    ) {

        container.innerHTML =
            "<p>No forecast available.</p>";

        return;
    }


    forecast.forEach(
        function(day) {

            const card =
                document.createElement("div");


            card.className =
                "forecast-card";


            const date =
                new Date(day.date);


            const dayName =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "short"
                    }
                );


            const formattedDate =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "short"
                    }
                );


            card.innerHTML = `

                <h3>
                    ${dayName}
                </h3>

                <p class="forecast-date">
                    ${formattedDate}
                </p>

                <div class="forecast-icon">
                    ${getWeatherIcon(
                        day.weatherCode
                    )}
                </div>

                <p class="forecast-condition">
                    ${getWeatherDescription(
                        day.weatherCode
                    )}
                </p>

                <p>
                    🌡️ Max:
                    <strong>
                        ${day.maxTemp}°C
                    </strong>
                </p>

                <p>
                    🌡️ Min:
                    <strong>
                        ${day.minTemp}°C
                    </strong>
                </p>

                <p>
                    🌧️ Rain:
                    <strong>
                        ${day.rainChance}%
                    </strong>
                </p>

            `;


            container.appendChild(card);

        }
    );

}


// =====================================
// WEATHER TIP
// =====================================

function displayWeatherTip(
    temperature,
    weatherCode,
    wind
) {

    const tip =
        document.getElementById(
            "weather-tip"
        );


    if (temperature >= 35) {

        tip.textContent =
            "☀️ It is very hot. Stay hydrated and avoid direct sunlight.";

    }

    else if (
        weatherCode >= 1063 &&
        weatherCode <= 1246
    ) {

        tip.textContent =
            "🌧️ Rain is possible. Consider carrying an umbrella.";

    }

    else if (wind >= 30) {

        tip.textContent =
            "💨 Strong winds are expected. Be careful outdoors.";

    }

    else {

        tip.textContent =
            "😊 Weather looks comfortable. Have a great day!";

    }

}


// =====================================
// WEATHER ALERT
// =====================================

function displayWeatherAlert(
    temperature,
    wind,
    forecast
) {

    const alertBox =
        document.getElementById(
            "weather-alert-message"
        );


    let alertMessage =
        "✅ No major weather alerts.";


    if (temperature >= 40) {

        alertMessage =
            "🔥 Heat Alert: Very high temperature. Stay hydrated.";

    }

    else if (wind >= 50) {

        alertMessage =
            "🌪️ Wind Alert: Strong winds expected. Stay safe.";

    }

    else if (
        forecast &&
        forecast.some(
            function(day) {

                return day.rainChance >= 70;

            }
        )
    ) {

        alertMessage =
            "🌧️ Rain Alert: High chance of rain in the forecast.";

    }


    alertBox.textContent =
        alertMessage;

}


// =====================================
// BUTTON EVENTS
// =====================================

searchButton.addEventListener(
    "click",
    getWeather
);


locationButton.addEventListener(
    "click",
    getMyLocationWeather
);


// =====================================
// ENTER KEY
// =====================================

cityInput.addEventListener(
    "keypress",
    function(event) {

        if (event.key === "Enter") {

            getWeather();

        }

    }
);