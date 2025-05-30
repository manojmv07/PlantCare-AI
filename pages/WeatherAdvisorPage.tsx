/// <reference types="@types/google.maps" />

import React, { useState, useCallback, useEffect, useRef } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import Alert from '../components/Alert';
import { WeatherData, FarmingAdvice } from '../types';
import { fetchWeather } from '../services/weatherService';
import { getWeatherBasedAdvice } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import ErrorBoundary from '../components/ErrorBoundary';

const MAP_DEFAULT_ZOOM_WEATHER = 10;

// Add radar overlay URLs (RainViewer, IMD, or similar)
const RADAR_OVERLAY_URL = 'https://tilecache.rainviewer.com/v2/radar/{anim}/{z}/{x}/{y}.png'; // RainViewer animated tiles
const RADAR_ANIMATION_FRAME_COUNT = 6; // Number of frames in animation (RainViewer supports up to 12)
const RADAR_ANIMATION_INTERVAL = 500; // ms per frame

// Helper to create a detached DOM node for the city marker
function createCityMarkerNode() {
  const el = document.createElement('div');
  el.className = 'w-3 h-3 bg-red-600 rounded-full opacity-75';
  return el;
}

const WeatherAdvisorPage: React.FC = () => {
  const { translate } = useLanguage();
  const [city, setCity] = useState<string>('Tumkur'); // Default city
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [advice, setAdvice] = useState<FarmingAdvice | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [adviceError, setAdviceError] = useState<string | null>(null);
  const [cropContext, setCropContext] = useState<string>('tomato farmer'); // Default context

  // Suggested cities for mobile tap
  const suggestedCities: string[] = [
    'Bengaluru', 'Mysore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata', 'Chikkaballapur'
  ];

  const handleFetchWeatherAndAdvice = useCallback(async (targetCity?: string, targetContext?: string) => {
    const currentCity = targetCity || city;
    const currentContext = targetContext || cropContext;

    if (!currentCity.trim()) {
      setWeatherError(translate('errorEnterCityName', { default: "Please enter a city name." }));
      return;
    }

    setIsLoadingWeather(true);
    setWeatherError(null);
    setAdvice(null);
    setAdviceError(null);

    const weatherResult = await fetchWeather(currentCity);
    setIsLoadingWeather(false);

    if ('error' in weatherResult) {
      setWeatherError(weatherResult.error);
      setWeatherData(null);
      return;
    }
    setWeatherData(weatherResult);
    setIsLoadingAdvice(true);
    const weatherJson = JSON.stringify({
      temperature: weatherResult.temperature,
      humidity: weatherResult.humidity,
      description: weatherResult.description,
      rain_last_hour_mm: weatherResult.rain || 0,
    });
    const adviceResult = await getWeatherBasedAdvice(weatherJson, `${currentContext} in ${weatherResult.city}`);
    setIsLoadingAdvice(false);
    if (adviceResult.error) {
      setAdviceError(adviceResult.error);
    } else {
      setAdvice(adviceResult);
    }
  }, [city, cropContext, translate]);
  
  useEffect(() => {
    // Fetch for default city on initial load
    handleFetchWeatherAndAdvice(city, cropContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencies are stable, but explicitly list for clarity, or rely on ESLint if properly configured.

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-green-700 mb-6 text-center capitalize">{translate('navWeatherAdvisor')}</h2>
      <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
        {translate('weatherAdvisorDescription', { default: "Get live weather updates and AI-powered farming advice tailored to the conditions and your specified crop context. Weather visualization powered by Google Maps."})}
      </p>
      {/* Suggested cities for mobile users */}
      <div className="flex flex-wrap justify-center gap-2 mb-4 md:hidden">
        {suggestedCities.map((c) => (
          <button
            key={c}
            onClick={() => setCity(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm border border-green-200 bg-white text-green-700 hover:bg-green-100 transition-colors ${city === c ? 'bg-green-600 text-white' : ''}`}
            style={{ minWidth: 90 }}
          >
            {c}
          </button>
        ))}
      </div>

      {weatherError && <Alert type="error" message={weatherError} onClose={() => setWeatherError(null)} />}
      {adviceError && <Alert type="error" message={adviceError} onClose={() => setAdviceError(null)} />}

      <Card className="mb-8">
        <div className="grid md:grid-cols-3 gap-6 mb-6 items-end">
          <div>
            <label htmlFor="city-input" className="block text-sm font-medium text-gray-700 mb-1">
              {translate('cityNameLabel', { default: 'City Name' })}
            </label>
            <input
              id="city-input"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={translate('cityInputPlaceholder', { default: "E.g., Bengaluru, Mysore" })}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              autoCapitalize="off"
              autoCorrect="off"
              inputMode="text"
              autoComplete="off"
            />
          </div>
           <div>
            <label htmlFor="crop-context-input" className="block text-sm font-medium text-gray-700 mb-1">
              {translate('farmingContextLabel', { default: 'Farming Context' })}
            </label>
            <input
              id="crop-context-input"
              type="text"
              value={cropContext}
              onChange={(e) => setCropContext(e.target.value)}
              placeholder={translate('farmingContextPlaceholder', { default: "E.g., tomato farmer, general vegetable garden" })}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            onClick={() => handleFetchWeatherAndAdvice()}
            disabled={isLoadingWeather || isLoadingAdvice}
            className="w-full md:w-auto px-6 py-3 bg-green-500 text-white font-semibold rounded-md shadow-md hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {(isLoadingWeather || isLoadingAdvice) ? <LoadingSpinner size="sm" /> : translate('getWeatherAdviceButton', { default: 'Get Weather & Advice' })}
          </button>
        </div>
      </Card>
      
      {isLoadingWeather && !weatherData && <div className="my-4"><LoadingSpinner text={translate('fetchingWeather', { default: "Fetching weather data..." })} /></div>}
      
      {weatherData && (
        <Card title={translate('currentWeatherIn', { city: weatherData.city, default: `Current Weather in ${weatherData.city}`})} className="mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-center mb-6">
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-4xl font-bold text-green-600">{weatherData.temperature}°C</p>
              <p className="text-gray-600">{translate('temperature', { default: 'Temperature' })}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-4xl font-bold text-green-600">{weatherData.humidity}%</p>
              <p className="text-gray-600">{translate('humidity', { default: 'Humidity' })}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg flex flex-col items-center justify-center">
              {weatherData.iconUrl && <img src={weatherData.iconUrl} alt={weatherData.description} className="w-16 h-16" />}
              <p className="text-gray-600 capitalize mt-1">{weatherData.description}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-4xl font-bold text-green-600">{weatherData.rain ?? 0} mm</p>
              <p className="text-gray-600">{translate('rainLastHour', { default: 'Rain (last hour)' })}</p>
            </div>
          </div>
        </Card>
      )}

      {isLoadingAdvice && <div className="my-4"><LoadingSpinner text={translate('generatingAdvice', { default: "Generating farming advice..." })} /></div>}

      {advice && advice.advice && (
        <Card title={translate('aiFarmingAdviceTitle', { default: "AI Farming Advice" })}>
          <p className="text-gray-700 whitespace-pre-line">{advice.advice}</p>
        </Card>
      )}
       {advice && advice.error && <Alert type="error" message={`${translate('aiError', {default: "AI Error"})}: ${advice.error}`} />}
    </div>
  );
};

const WrappedWeatherAdvisorPage = () => (
  <ErrorBoundary>
    <WeatherAdvisorPage />
  </ErrorBoundary>
);

export default WrappedWeatherAdvisorPage;
