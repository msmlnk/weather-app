let now = new Date();

let h1 = document.querySelector("h1");

let date = now.getDate();
let minutes = String(now.getMinutes()).padStart(2, "0");
let hours = String(now.getHours()).padStart(2, "0");

let months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

let month = months[now.getMonth()];
let day = days[now.getDay()];

h1.innerHTML = `${day}, ${month} ${date} </br> ${hours}:${minutes}`;

const apiKey = "5354b60afda2b7800186c06153932396";

function displayWeather(response) {
  console.log(response.data);

  document.querySelector("#city").innerHTML = response.data.name;

  document.querySelector("#description").innerHTML =
    response.data.weather[0].description;

  document.querySelector("#temperature").innerHTML = Math.round(
    response.data.main.temp
  );

  document.querySelector("#humidity").innerHTML =
    response.data.main.humidity;

  document.querySelector("#wind").innerHTML = Math.round(
    response.data.wind.speed
  );

  let iconElement = document.querySelector("#icon");

  iconElement.setAttribute(
    "src",
    `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`
  );

  iconElement.setAttribute(
    "alt",
    response.data.weather[0].description
  );

  // Get the forecast for the same location
  if (response.data.coord) {
    getForecast(
      response.data.coord.lat,
      response.data.coord.lon
    );
  }
}

function getForecast(lat, lon) {
  let apiUrl =
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}` +
    `&lon=${lon}&appid=${apiKey}&units=metric`;

  axios
    .get(apiUrl)
    .then(displayForecast)
    .catch(function (error) {
      console.log("Forecast error:", error);
    });
}

function displayForecast(response) {
  let forecast = response.data.list;

  let daysByDate = {};

  // OpenWeather gives us weather every 3 hours.
  // Group the forecasts by date.
  forecast.forEach(function (item) {
    let date = item.dt_txt.split(" ")[0];

    if (!daysByDate[date]) {
      daysByDate[date] = [];
    }

    daysByDate[date].push(item);
  });

  let forecastDays = Object.entries(daysByDate)
    .slice(0, 6)
    .map(function ([date, items]) {
      let temperatures = items.map(function (item) {
        return item.main.temp;
      });

      // Find the forecast closest to noon
      let midday = items.reduce(function (closest, item) {
        let hour = Number(item.dt_txt.slice(11, 13));
        let distance = Math.abs(hour - 12);

        if (!closest || distance < closest.distance) {
          return {
            item: item,
            distance: distance,
          };
        }

        return closest;
      }, null);

      return {
        date: date,
        max: Math.round(Math.max(...temperatures)),
        min: Math.round(Math.min(...temperatures)),
        icon: midday.item.weather[0].icon,
        description: midday.item.weather[0].description,
      };
    });

  // Today is already shown in the large weather card.
  // Show the next five days.
  let nextFiveDays = forecastDays.slice(1, 6);

  let forecastElement =
    document.querySelector("#weather-forecast");

  forecastElement.innerHTML = nextFiveDays
    .map(function (day) {
      return `
        <div class="col">
          <div class="WeatherForecastPreview">

            <div class="forecast-time">
              ${formatWeekday(day.date)}
            </div>

            <i
              class="fa-solid ${getForecastIcon(day.icon)} forecast-icon"
              title="${day.description}"
            ></i>

            <div class="forecast-temperature">

              <span class="forecast-temperature-max">
                ${day.max}° |
              </span>

              <span class="forecast-temperature-min">
                ${day.min}°
              </span>

            </div>

          </div>
        </div>
      `;
    })
    .join("");
}

function formatWeekday(dateString) {
  let parts = dateString.split("-");

  let year = Number(parts[0]);
  let month = Number(parts[1]);
  let day = Number(parts[2]);

  let date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
  });
}

function getForecastIcon(iconCode) {
  let iconMap = {
    "01d": "fa-sun",
    "01n": "fa-moon",

    "02d": "fa-cloud-sun",
    "02n": "fa-cloud-moon",

    "03d": "fa-cloud",
    "03n": "fa-cloud",

    "04d": "fa-cloud",
    "04n": "fa-cloud",

    "09d": "fa-cloud-showers-heavy",
    "09n": "fa-cloud-showers-heavy",

    "10d": "fa-cloud-sun-rain",
    "10n": "fa-cloud-moon-rain",

    "11d": "fa-bolt",
    "11n": "fa-bolt",

    "13d": "fa-snowflake",
    "13n": "fa-snowflake",

    "50d": "fa-smog",
    "50n": "fa-smog",
  };

  return iconMap[iconCode] || "fa-cloud";
}

function searchLocation(position) {
  let apiUrl =
    `https://api.openweathermap.org/data/2.5/weather?lat=` +
    `${position.coords.latitude}&lon=${position.coords.longitude}` +
    `&appid=${apiKey}&units=metric`;

  axios.get(apiUrl).then(displayWeather);
}

function getCurrentLocation(event) {
  event.preventDefault();

  navigator.geolocation.getCurrentPosition(searchLocation);
}

function search(event) {
  event.preventDefault();

  let city = document
    .querySelector("#city-input")
    .value
    .trim();

  if (city) {
    searchCity(city);
  }
}

function searchCity(city) {
  let apiUrl =
    `https://api.openweathermap.org/data/2.5/weather?q=` +
    `${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  axios.get(apiUrl).then(displayWeather);
}


// Default city
searchCity("Tbilisi");


// Search form
let searchForm = document.querySelector("#searchform");

searchForm.addEventListener("submit", search);


// Current location
let currentLocationButton =
  document.querySelector("#current-location-button");

currentLocationButton.addEventListener(
  "click",
  getCurrentLocation
);


// Get user's location on page load
getCurrentLocation({
  preventDefault: function () {},
});
