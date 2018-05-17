// The lookup tables below are used for mapping the condition code returned by OpenWeatherMap to the icons we're using.
let owmConditions = ["01d", "02d", "03d", "04d", "09d", "10d", "11d", "13d", "50d", "01n", "02n", "03n", "04n", "09n", "10n", "11n", "13n", "50n"];
let icons = ["wi-day-sunny", "wi-day-sunny-overcast", "wi-day-cloudy", "wi-day-sunny-overcast", "wi-day-showers", "wi-day-rain", "wi-day-thunderstorm", "wi-day-snow", "wi-day-fog", "wi-night-clear", "wi-night-partly-cloudy", "wi-night-cloudy", "wi-night-partly-cloudy", "wi-night-showers", "wi-night-rain", "wi-night-thunderstorm", "wi-night-snow", "wi-night-fog"];

let minMax;
let currentTemp;
let currentImage;

// Updates the weather display using OpenWeatherMap.
function updateWeather() {
    let req = new XMLHttpRequest();
    // The city code below is OpenWeatherMap's unique identifier for Wellesley. It shouldn't ever change.
    req.open("GET", "https://api.openweathermap.org/data/2.5/weather?id=4954738&units=imperial&appid=a55ffcf3f9495731e0224158eb59cfe2", true);
    req.send();

    req.onreadystatechange = processRequest;

    // We use a callback to process the request so that script execution doesn't hang.
    function processRequest() {
        if (req.readyState === 4 && req.status === 200) {
            let response = JSON.parse(req.responseText);

            minMax.innerHTML =  Math.round(response.main.temp_min) + "&deg; / " + Math.round(response.main.temp_max) + "&deg;";

            currentTemp.innerHTML = Math.round(response.main.temp) + "&deg;";

            currentImage.className = "wi " + icons[owmConditions.indexOf(response.weather[0].icon)];
        }
    }
}

// Can only call into the dom once the window is actually loaded.
window.addEventListener("load",function() {
    minMax = document.getElementById("minmax");
    currentTemp = document.getElementById("currenttemp");
    currentImage = document.getElementById("currentimage");

    updateWeather();
    setInterval(updateWeather, 60 * 1000);
});