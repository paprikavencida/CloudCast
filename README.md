# Cloudcast

**A simple weather dashboard.**

Cloudcast is a lightweight weather dashboard designed to display current weather conditions, compare different cities, and provide atmospheric information through a clean and minimal interface.

## Features

- **Current Location:** Automatically detects the user's location through browser geolocation.
- **Largest City:** Displays weather information for the largest registered city in the detected country.
- **Country Capital:** Displays current weather conditions in the country's capital.
- **Atmospheric Data:** Shows sunrise, sunset, maximum UV index, and daylight duration.
- **Live Clock:** Displays the current date and time.
- **Automatic Updates:** Refreshes weather information every 10 minutes.

## Technologies

- HTML5
- CSS3
- JavaScript
- [Open-Meteo API](https://open-meteo.com/)
- [BigDataCloud Reverse Geocoding API](https://www.bigdatacloud.com/)

## Project Structure

```text
Cloudcast/
├── index.html
├── config.js
├── style.css
└── script.js
```

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/YOUR-USERNAME/Cloudcast.git
   ```

2. Open the project folder.

3. Open `index.html` in your browser or run the project through a local web server.

4. Allow location access when requested by the browser.

**Note:** Browser geolocation generally requires a secure context, such as HTTPS or localhost. Directly opening the HTML file may not work in every browser.

## Configuration

The `config.js` file contains the project's main settings, including:

- Project name
- Current version
- Automatic refresh interval
- Registered countries, largest cities, and capitals

Countries not registered in the configuration may display limited information.

## APIs

Cloudcast uses external services to retrieve weather and location information:

- **Open-Meteo:** Weather forecasts, current conditions, and geocoding.
- **BigDataCloud:** Reverse geocoding to identify the user's city and country.

No API key is currently required for the services used by this project.

## Version

**Current version:** 1.0.0

## License

This project is open source. A license has not yet been specified.

---

CloudCast
Part of the Chroma Flower creative ecosystem.
