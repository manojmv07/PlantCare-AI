/// <reference types="@types/google.maps" />

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MapSearchCategory, RouteInfo } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Card from '../components/Card';

// Define search categories with textQuery for searchByText
const initialSearchCategories: MapSearchCategory[] = [
  { id: 'markets', translationKey: 'fcCategoryMarkets', defaultText: 'Markets', textQuery: 'agricultural market OR farmers market OR produce market' },
  { id: 'fertilizers', translationKey: 'fcCategoryFertilizers', defaultText: 'Fertilizer Shops', textQuery: 'fertilizer shop OR agricultural supplies OR pesticide shop' },
  { id: 'nurseries', translationKey: 'fcCategoryNurseries', defaultText: 'Plant Nurseries', textQuery: 'plant nursery OR garden center' },
  { id: 'equipment', translationKey: 'fcCategoryEquipment', defaultText: 'Agri Equipment', textQuery: 'agricultural equipment supplier OR tractor dealer OR farm machinery' },
  { id: 'cold_storage', translationKey: 'fcCategoryColdStorage', defaultText: 'Cold Storage', textQuery: 'cold storage facility OR refrigerated warehouse for produce' },
  { id: 'veterinary', translationKey: 'fcCategoryVeterinary', defaultText: 'Veterinary Services', textQuery: 'veterinary clinic OR animal hospital' },
  { id: 'agri_consultants', translationKey: 'fcCategoryAgriConsultants', defaultText: 'Agri Consultants', textQuery: 'agricultural consultant OR farm advisor' },
  { id: 'soil_testing', translationKey: 'fcCategorySoilTesting', defaultText: 'Soil Testing Labs', textQuery: 'soil testing laboratory OR soil analysis service' },
  { id: 'warehousing', translationKey: 'fcCategoryWarehousing', defaultText: 'Warehousing', textQuery: 'warehouse OR storage facility for agricultural produce' },
];

const MAP_DEFAULT_ZOOM = 12;
const SEARCH_RADIUS_METERS = 10000; // 10km
const MAP_DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 }; // Bangalore

// Add emoji icons for categories
const categoryIcons: Record<string, string> = {
  markets: '🛒',
  fertilizers: '🧪',
  nurseries: '🌱',
  equipment: '🚜',
  cold_storage: '❄️',
  veterinary: '🐄',
  agri_consultants: '👨‍🌾',
  soil_testing: '🧬',
  warehousing: '🏬',
};

const FarmerConnectPage: React.FC = () => {
  const { translate } = useLanguage();
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const placeMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const autocompleteInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral>(MAP_DEFAULT_LOCATION);
  const [isMapApiLoaded, setIsMapApiLoaded] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MapSearchCategory | null>(null);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [activeMarkerIndex, setActiveMarkerIndex] = useState<number | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);

  const clearMarkers = useCallback(() => {
    placeMarkersRef.current.forEach(marker => {
        marker.map = null;
    });
    placeMarkersRef.current = [];
  }, []);

  const clearDirections = useCallback(() => {
    directionsRendererRef.current?.setMap(null);
    setRouteInfo(null);
  }, []);

  const initMap = useCallback((location: google.maps.LatLngLiteral) => {
    if (mapDivRef.current && window.google?.maps?.Map && window.google?.maps?.marker?.AdvancedMarkerElement) {
      const commonMapOptions: google.maps.MapOptions = {
        center: location,
        zoom: MAP_DEFAULT_ZOOM,
        mapId: 'PLANTCARE_AI_MAP_ID',
        mapTypeControl: false,
        streetViewControl: false,
      };
      // Only create the map if it doesn't exist
      if (!mapInstanceRef.current) {
        const map = new window.google.maps.Map(mapDivRef.current, commonMapOptions);
        mapInstanceRef.current = map;
      }
      // Always update center
      mapInstanceRef.current.setCenter(location);
      // Add or update user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.position = location;
        userMarkerRef.current.map = mapInstanceRef.current;
      } else {
        const userPinElement = document.createElement('div');
        userPinElement.className = 'w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center';
        userPinElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-4 h-4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
        userMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
          position: location,
          map: mapInstanceRef.current,
          title: translate('yourLocation', { default: 'Your Location' }),
          content: userPinElement,
        });
      }
      // Directions services
      if (window.google.maps.DirectionsService && window.google.maps.DirectionsRenderer) {
        if (!directionsServiceRef.current) directionsServiceRef.current = new window.google.maps.DirectionsService();
        if (!directionsRendererRef.current) directionsRendererRef.current = new window.google.maps.DirectionsRenderer();
        directionsRendererRef.current.setMap(mapInstanceRef.current);
      }
      setLoadingLocation(false);
    } else {
      setError(translate('fcErrorNoGoogleMaps'));
      setLoadingLocation(false);
    }
  }, [translate]);

  useEffect(() => {
    const handleMapsApiLoaded = () => {
      setIsMapApiLoaded(true);
    };
    if (window.google && window.google.maps) {
      handleMapsApiLoaded();
    } else {
      window.addEventListener('google-maps-loaded', handleMapsApiLoaded);
    }
    return () => {
      window.removeEventListener('google-maps-loaded', handleMapsApiLoaded);
    };
  }, []);

  // Always initialize map with default location as soon as API is loaded
  useEffect(() => {
    if (isMapApiLoaded) {
      initMap(currentLocation);
    }
  }, [isMapApiLoaded, initMap, currentLocation]);

  // Try to get geolocation, but never block map rendering
  useEffect(() => {
    if (!isMapApiLoaded) return;
    if (!navigator.geolocation) {
      setError(translate('fcErrorLocation'));
      setLoadingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCurrentLocation(loc);
        initMap(loc);
        setLoadingLocation(false);
      },
      (err) => {
        setError(translate('fcErrorLocation') + ` (${err.message}) ` + translate('fcEnableHighAccuracy'));
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [isMapApiLoaded, initMap, translate]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isMapApiLoaded && autocompleteInputRef.current && window.google?.maps?.places?.Autocomplete) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'in' },
      });
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current!.getPlace();
        if (place.geometry && place.geometry.location) {
          const loc = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setCurrentLocation(loc);
          initMap(loc);
        }
      });
    }
  }, [isMapApiLoaded, initMap]);

  const fetchDirections = (destination: google.maps.LatLng | google.maps.LatLngLiteral) => {
    if (!currentLocation) {
        setError(translate('fcErrorLocation'));
        return;
    }
    if(!directionsServiceRef.current || !directionsRendererRef.current) {
        setError(translate('fcErrorDirectionsNotAvailable'));
        return;
    }

    setLoadingServices(true); 
    directionsServiceRef.current.route({
        origin: currentLocation,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
    }, (response, status) => {
        setLoadingServices(false);
        if (status === window.google.maps.DirectionsStatus.OK && response) {
            directionsRendererRef.current!.setDirections(response);
            const route = response.routes[0];
            if (route && route.legs && route.legs[0]) {
                setRouteInfo({
                    distance: route.legs[0].distance?.text || 'N/A',
                    duration: route.legs[0].duration?.text || 'N/A',
                });
            }
        } else {
            setError(translate('fcErrorRouteNotFound'));
            setRouteInfo(null);
        }
    });
  };

  const performSearch = useCallback(async (query: string, categoryDefaultText: string) => {
    if (!currentLocation || !mapInstanceRef.current || !window.google?.maps?.places?.PlacesService) {
      setError(currentLocation ? translate('fcErrorNoGoogleMaps') : translate('fcErrorLocation'));
      setLoadingServices(false);
      return;
    }
    setLoadingServices(true);
    setError(null);
    clearMarkers();
    clearDirections();
    setResults([]);
    setActiveMarkerIndex(null);

    const placesService = new window.google.maps.places.PlacesService(mapInstanceRef.current);
    const request: google.maps.places.TextSearchRequest = {
        query: query,
        location: currentLocation,
        radius: SEARCH_RADIUS_METERS,
        language: translate('languageCodeForAPI', {default: 'en'}),
        region: translate('regionCodeForAPI', {default: 'IN'}), 
    };

    try {
        placesService.textSearch(request, (results, status) => {
            setLoadingServices(false);
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                setResults(results);
                if (results.length > 0) {
                    results.forEach((p, idx) => {
                        if (p.geometry?.location) {
                            const marker = new window.google.maps.marker.AdvancedMarkerElement({
                                map: mapInstanceRef.current,
                                position: p.geometry.location,
                                title: p.name, 
                            });
                            placeMarkersRef.current.push(marker);
                            marker.addListener('click', () => {
                                setActiveMarkerIndex(idx);
                                if(infoWindowRef.current) infoWindowRef.current.close();
                                const infoWindowContent = document.createElement('div');
                                infoWindowContent.className = 'p-2 max-w-xs';
                                infoWindowContent.innerHTML = `
                                    <h3 class="font-semibold text-md text-green-700">${p.name || 'N/A'}</h3>
                                    <p class="text-sm text-gray-600">${p.formatted_address || translate('addressNotAvailable')}</p>
                                    ${p.rating ? `<p class="text-sm text-gray-600">${translate('rating')}: ${p.rating} (${p.user_ratings_total || 0} ${translate('reviews')})</p>` : ''}
                                    ${p.business_status ? `<p class="text-sm text-gray-600">${translate('status')}: ${p.business_status}</p>` : ''}
                                `;
                                if (directionsServiceRef.current && directionsRendererRef.current) {
                                    const directionsButton = document.createElement('button');
                                    directionsButton.className = "mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600";
                                    directionsButton.textContent = translate('fcShowRoute');
                                    directionsButton.onclick = () => fetchDirections(p.geometry!.location!);
                                    infoWindowContent.appendChild(directionsButton);
                                }
                                infoWindowRef.current = new window.google.maps.InfoWindow({ content: infoWindowContent });
                                infoWindowRef.current.open(mapInstanceRef.current!, marker);
                            });
                        }
                    });
                } else {
                    setError(translate('fcNoResults', { serviceName: categoryDefaultText }));
                }
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                 setError(translate('fcNoResults', { serviceName: categoryDefaultText }));
            } 
            else {
                console.error("Places API textSearch error status:", status);
                setError(`Places API Error: ${status}`);
            }
        });
    } catch (e) { 
        console.error("Places API textSearch initiation error:", e);
        setError(`Places API Error: ${e instanceof Error ? e.message : String(e)}`);
        setLoadingServices(false);
    }
  }, [currentLocation, clearMarkers, clearDirections, translate, fetchDirections]);

  const handleSearchCategory = (category: MapSearchCategory) => {
    setSelectedCategory(category);
    const categoryName = translate(category.translationKey, { default: category.defaultText });
    performSearch(category.textQuery, categoryName);
  };

  const handleCustomSearch = () => {
    if (!customSearchQuery.trim()) {
        setError(translate('fcErrorCustomSearchEmpty'));
        return;
    }
    const customCategory: MapSearchCategory = {
        id: 'custom',
        translationKey: 'fcCustomSearch', 
        defaultText: customSearchQuery,
        textQuery: customSearchQuery,
    };
    setSelectedCategory(customCategory);
    performSearch(customSearchQuery, customSearchQuery);
  };

  // Add a function to retry geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError(translate('fcErrorLocation'));
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCurrentLocation(loc);
        initMap(loc);
        setLoadingLocation(false);
      },
      (err) => {
        setError(translate('fcErrorLocation') + ` (${err.message}) ` + translate('fcEnableHighAccuracy'));
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Add a function to handle clicking a result in the list
  const handleResultClick = (idx: number) => {
    setActiveMarkerIndex(idx);
    setSelectedPlace(results[idx]);
    const marker = placeMarkersRef.current[idx];
    if (marker && marker.position && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(marker.position as google.maps.LatLng | google.maps.LatLngLiteral);
      google.maps.event.trigger(marker, 'click');
    }
  };

  const handleNavigate = (place: any) => {
    let lat, lng;
    if (place.geometry?.location) {
      lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat;
      lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  if (loadingLocation && !currentLocation && !isMapApiLoaded) { // Show initial loading only if map API and location are pending
    return <div className="flex justify-center items-center h-full"><LoadingSpinner text={translate('fcMapInitializing')} size="lg"/></div>;
  }
   if (loadingLocation && !currentLocation && isMapApiLoaded) { // Map API loaded, but location is still pending
    return <div className="flex justify-center items-center h-full"><LoadingSpinner text={translate('fcFetchingLocation')} size="lg"/></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col h-full">
      <h2 className="text-3xl font-bold text-green-700 mb-2 text-center capitalize">
        {translate('farmerConnectTitle')}
      </h2>
      <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
        {translate('farmerConnectDescription')}
      </p>
      {/* Location Search Box and Use My Location Button */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-4">
        <input
          ref={autocompleteInputRef}
          type="text"
          placeholder="Search or select your location..."
          className="w-full max-w-md p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        />
        <button
          onClick={handleUseMyLocation}
          className="px-4 py-3 bg-green-500 text-white font-semibold rounded-md shadow-md hover:bg-green-600 transition-colors"
        >
          📍 Use My Location
        </button>
      </div>
      {/* Category Filters with Icons */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {initialSearchCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleSearchCategory(cat)}
            disabled={loadingLocation || loadingServices || !currentLocation}
            className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-all truncate shadow-sm
              ${selectedCategory?.id === cat.id && selectedCategory.id !== 'custom' ?
                'bg-green-600 text-white ring-2 ring-green-700 ring-offset-2 scale-105' :
                'bg-green-100 text-green-700 hover:bg-green-200'}
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="text-xl">{categoryIcons[cat.id]}</span>
            {translate(cat.translationKey, { default: cat.defaultText })}
          </button>
        ))}
      </div>
      <Card className="mb-6">
        <h3 className="text-xl font-semibold text-green-700 mb-3 capitalize">
          {translate('searchFor')}:
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={customSearchQuery}
            onChange={(e) => setCustomSearchQuery(e.target.value)}
            placeholder={translate('fcCustomSearchPlaceholder')}
            className="flex-grow p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSearch()}
          />
          <button
            onClick={handleCustomSearch}
            disabled={loadingLocation || loadingServices || !customSearchQuery.trim() || !currentLocation}
            className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-md shadow-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {translate('fcCustomSearchButton')}
          </button>
        </div>
        {selectedCategory && (
          <p className="text-sm text-gray-500 italic">
            {translate('fcShowingResultsFor', {serviceName: translate(selectedCategory.translationKey, {default: selectedCategory.defaultText})})} - {translate('fcRadiusInfo', {radius: (SEARCH_RADIUS_METERS/1000).toString()})}
          </p>
        )}
      </Card>
      {loadingServices && <div className="my-2"><LoadingSpinner text={translate('fcSearchingServices', {serviceName: selectedCategory ? translate(selectedCategory.translationKey, {default:selectedCategory.defaultText}) : 'services'})} /></div>}
      {error && <div className="my-2"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
      {/* Map */}
      <div ref={mapDivRef} style={{ height: '50vh', minHeight: '400px', width: '100%' }} className="rounded-lg shadow-md bg-gray-200 mb-4 transition-all duration-500">
        {(!isMapApiLoaded || (loadingLocation && !currentLocation)) && (
          <div className="flex items-center justify-center h-full text-gray-500 p-4 animate-pulse">
            {translate('fcMapInitializing')} {translate('fcEnableHighAccuracy')}
          </div>
        )}
      </div>
      {/* Results List */}
      {results.length > 0 && (
        <Card className="mb-4 animate-fade-in">
          <h4 className="text-lg font-semibold text-green-700 mb-2">Nearby Results</h4>
          <ul className="divide-y divide-green-100 max-h-80 overflow-y-auto">
            {results.map((result, idx) => (
              <li
                key={result.place_id}
                className={`p-3 cursor-pointer transition-all rounded hover:bg-green-50 ${activeMarkerIndex === idx ? 'bg-green-100 scale-105' : ''}`}
                onClick={() => handleResultClick(idx)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categoryIcons[selectedCategory?.id || 'markets']}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-green-800">{result.name}</div>
                    <div className="text-sm text-gray-600">{result.formatted_address}</div>
                    {result.rating && (
                      <div className="text-xs text-yellow-600">⭐ {result.rating} ({result.user_ratings_total || 0} reviews)</div>
                    )}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleNavigate(result); }}
                    className="ml-auto px-4 py-2 bg-blue-600 text-white text-base rounded-lg shadow hover:bg-blue-700 transition-colors font-semibold"
                    style={{ minWidth: 120 }}
                  >
                    Navigate
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {routeInfo && (
        <Card className="mb-4">
          <div className="flex justify-between items-center">
            <p className="text-md font-semibold text-green-700">
              {translate('fcRouteInfo', {distance: routeInfo.distance, duration: routeInfo.duration})}
            </p>
            <button
              onClick={clearDirections}
              className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              {translate('fcClearRoute')}
            </button>
          </div>
        </Card>
      )}
      {/* Sticky mobile navigation button */}
      {selectedPlace && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-center items-center bg-white/95 border-t border-green-200 py-3 shadow-lg">
          <button
            onClick={() => handleNavigate(selectedPlace)}
            className="w-11/12 max-w-md mx-auto py-4 bg-blue-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
            style={{ fontSize: 22 }}
          >
            <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-9.456 3.181a1 1 0 00-.362 1.686l7.07 7.07a1 1 0 001.686-.362l3.181-9.456a1 1 0 00-1.119-1.119z" /></svg>
            Navigate with Google Maps
          </button>
        </div>
      )}
    </div>
  );
};

export default FarmerConnectPage;
