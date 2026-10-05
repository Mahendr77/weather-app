const express = require("express");

const app = express();

const PORT = 3000;

// =====================================
// OPENWEATHER API KEY
// =====================================

const API_KEY = "534d1f1a4df75a4e2e59a86bbe6c62df";


// =====================================
// CORS
// =====================================

app.use((req, res, next) => {

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    next();

});


// =====================================
// CHECK API KEY
// =====================================

function checkAPIKey() {

    if (
        !API_KEY ||
        API_KEY === "PASTE_YOUR_OPENWEATHER_API_KEY_HERE"
    ) {

        throw new Error(
            "OpenWeather API key is missing."
        );

    }

}


// =====================================
// GET WEATHER USING COORDINATES
// =====================================

async function getWeatherFromCoordinates(
    latitude,
    longitude
) {

    checkAPIKey();

    console.log(
        "Getting weather for:",
        latitude,
        longitude
    );


    // =====================================
    // CURRENT WEATHER
    // =====================================

    const currentURL =
        `https://api.openweathermap.org/data/2.5/weather` +
        `?lat=${latitude}` +
        `&lon=${longitude}` +
        `&appid=${API_KEY}` +
        `&units=metric`;


    const currentResponse =
        await fetch(currentURL);


    console.log(
        "Current weather status:",
        currentResponse.status
    );


    if (!currentResponse.ok) {

        const errorText =
            await currentResponse.text();

        console.log(
            "OpenWeather error:",
            errorText
        );

        throw new Error(
            "OpenWeather current weather request failed"
        );

    }


    const currentData =
        await currentResponse.json();


    // =====================================
    // 5-DAY FORECAST
    // =====================================

    const forecastURL =
        `https://api.openweathermap.org/data/2.5/forecast` +
        `?lat=${latitude}` +
        `&lon=${longitude}` +
        `&appid=${API_KEY}` +
        `&units=metric`;


    const forecastResponse =
        await fetch(forecastURL);


    console.log(
        "Forecast status:",
        forecastResponse.status
    );


    if (!forecastResponse.ok) {

        const errorText =
            await forecastResponse.text();

        console.log(
            "Forecast error:",
            errorText
        );

        throw new Error(
            "OpenWeather forecast request failed"
        );

    }


    const forecastData =
        await forecastResponse.json();


    // =====================================
    // LOCATION NAME
    // =====================================

    let cityName =
        currentData.name ||
        "Your Location";


    let country =
        currentData.sys &&
        currentData.sys.country
            ? currentData.sys.country
            : "India";


    // =====================================
    // CREATE DAILY FORECAST
    // =====================================

    const dailyForecast = {};

    forecastData.list.forEach(
        function(item) {

            const date =
                item.dt_txt.split(" ")[0];


            if (!dailyForecast[date]) {

                dailyForecast[date] = {

                    date: date,

                    maxTemp:
                        item.main.temp_max,

                    minTemp:
                        item.main.temp_min,

                    weatherCode:
                        item.weather[0].id,

                    rainChance:
                        Math.round(
                            (item.pop || 0) * 100
                        )

                };

            }

            else {

                // Maximum temperature
                if (
                    item.main.temp_max >
                    dailyForecast[date].maxTemp
                ) {

                    dailyForecast[date].maxTemp =
                        item.main.temp_max;

                }


                // Minimum temperature
                if (
                    item.main.temp_min <
                    dailyForecast[date].minTemp
                ) {

                    dailyForecast[date].minTemp =
                        item.main.temp_min;

                }


                // Highest rain probability
                const rainChance =
                    Math.round(
                        (item.pop || 0) * 100
                    );


                if (
                    rainChance >
                    dailyForecast[date].rainChance
                ) {

                    dailyForecast[date].rainChance =
                        rainChance;

                }

            }

        }
    );


    const forecast =
        Object.values(
            dailyForecast
        ).slice(0, 5);


    // =====================================
    // RETURN DATA
    // =====================================

    return {

        city:
            cityName,

        country:
            country,

        temperature:
            currentData.main.temp,

        humidity:
            currentData.main.humidity,

        wind:
            currentData.wind
                ? currentData.wind.speed * 3.6
                : 0,

        weatherCode:
            currentData.weather[0].id,

        forecast:
            forecast

    };

}


// =====================================
// SEARCH CITY / VILLAGE
// =====================================

app.get(
    "/weather",
    async function(req, res) {

        try {

            const city =
                req.query.city;


            if (!city) {

                return res.status(400).json({

                    error:
                        "Please enter a city or village name"

                });

            }


            checkAPIKey();


            console.log(
                "Searching:",
                city
            );


            // =====================================
            // OPENWEATHER GEOCODING
            // =====================================

            const geoURL =
                `https://api.openweathermap.org/geo/1.0/direct` +
                `?q=${encodeURIComponent(city)}` +
                `&limit=1` +
                `&appid=${API_KEY}`;


            const geoResponse =
                await fetch(geoURL);


            console.log(
                "Geocoding status:",
                geoResponse.status
            );


            if (!geoResponse.ok) {

                throw new Error(
                    "OpenWeather geocoding failed"
                );

            }


            const geoData =
                await geoResponse.json();


            if (
                !geoData ||
                geoData.length === 0
            ) {

                return res.status(404).json({

                    error:
                        "Location not found"

                });

            }


            const location =
                geoData[0];


            const latitude =
                location.lat;


            const longitude =
                location.lon;


            // =====================================
            // GET WEATHER
            // =====================================

            const result =
                await getWeatherFromCoordinates(
                    latitude,
                    longitude
                );


            // Use searched location name
            result.city =
                location.name ||
                result.city;


            result.country =
                location.country ||
                result.country;


            console.log(
                "Weather result:",
                result
            );


            res.json(result);

        }


        catch (error) {

            console.error(
                "City Weather Error:",
                error
            );


            res.status(500).json({

                error:
                    error.message

            });

        }

    }
);


// =====================================
// MY LOCATION
// =====================================

app.get(
    "/weather-by-location",
    async function(req, res) {

        try {

            const latitude =
                parseFloat(
                    req.query.latitude
                );


            const longitude =
                parseFloat(
                    req.query.longitude
                );


            // =====================================
            // CHECK COORDINATES
            // =====================================

            if (
                Number.isNaN(latitude) ||
                Number.isNaN(longitude)
            ) {

                return res.status(400).json({

                    error:
                        "Invalid location coordinates"

                });

            }


            console.log("");
            console.log(
                "=============================="
            );

            console.log(
                "MY LOCATION"
            );

            console.log(
                "Latitude:",
                latitude
            );

            console.log(
                "Longitude:",
                longitude
            );


            // =====================================
            // GET WEATHER
            // =====================================

            const result =
                await getWeatherFromCoordinates(
                    latitude,
                    longitude
                );


            // =====================================
            // RESULT
            // =====================================

            console.log(
                "Detected location:",
                result.city
            );

            console.log(
                "Country:",
                result.country
            );


            console.log(
                "=============================="
            );


            res.json(result);

        }


        catch (error) {

            console.error(
                "Location Weather Error:",
                error
            );


            res.status(500).json({

                error:
                    error.message

            });

        }

    }
);


// =====================================
// START SERVER
// =====================================

app.listen(
    PORT,
    function() {

        console.log("");
        console.log(
            "================================"
        );

        console.log(
            "🌦️ WEATHER SERVER"
        );

        console.log(
            "================================"
        );

        console.log(
            `Server running at http://localhost:${PORT}`
        );

        console.log(
            "================================"
        );

    }
);