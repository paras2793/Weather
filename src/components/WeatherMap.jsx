import { useEffect, useRef, useState } from "react";
import {
  AttributionControl,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl,
} from "maplibre-gl";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";
import { formatCityName } from "../services/weatherApi";

setWorkerUrl(mapWorkerUrl);

const DEFAULT_MAP_STYLE =
  import.meta.env.VITE_MAP_STYLE ||
  "https://tiles.openfreemap.org/styles/liberty";

function makePopupContent(locationName, coordinates) {
  const wrapper = document.createElement("div");
  wrapper.className = "aether-map-popup-content";

  const name = document.createElement("strong");
  name.textContent = locationName;

  const coords = document.createElement("span");
  coords.textContent = `${coordinates[1].toFixed(4)}°, ${coordinates[0].toFixed(4)}°`;

  wrapper.append(name, coords);
  return wrapper;
}

export default function WeatherMap({ city }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const popupRef = useRef(null);
  const [mapError, setMapError] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const locationName = formatCityName(city);
  const coordinates = [Number(city.longitude), Number(city.latitude)];

  useEffect(() => {
    if (!containerRef.current) return undefined;

    let disposed = false;
    let map;

    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: DEFAULT_MAP_STYLE,
        center: coordinates,
        zoom: city.countryCode === "IN" ? 10 : 8.5,
        minZoom: 2,
        maxZoom: 17,
        attributionControl: false,
        cooperativeGestures: true,
      });

      mapRef.current = map;
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new AttributionControl({ compact: true, customAttribution: "" }), "bottom-right");

      const markerElement = document.createElement("div");
      markerElement.className = "aether-marker-element";
      markerElement.setAttribute("role", "img");
      markerElement.setAttribute("aria-label", `Selected location: ${locationName}`);
      markerElement.innerHTML = '<span class="aether-map-marker"><span class="aether-map-marker-pulse"></span><span class="aether-map-marker-core"></span></span>';

      const popup = new Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 22,
        className: "aether-map-popup",
      }).setDOMContent(makePopupContent(locationName, coordinates));

      const marker = new Marker({ element: markerElement, anchor: "center" })
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map);

      markerRef.current = marker;
      popupRef.current = popup;
      marker.togglePopup();

      map.on("load", () => {
        if (disposed) return;
        map.resize();
        setMapReady(true);
      });

      map.on("error", (event) => {
        if (disposed || !event?.error) return;

        if (!map.isStyleLoaded()) {
          console.error("AETHER map failed to load:", event.error);
          setMapError(
            "The map style could not load. Check your internet connection or whether your network blocks tiles.openfreemap.org."
          );
        } else {
          console.warn("AETHER map tile warning:", event.error);
        }
      });
    } catch (error) {
      setMapError(error.message || "The interactive map could not be started.");
    }

    return () => {
      disposed = true;
      markerRef.current?.remove();
      markerRef.current = null;
      popupRef.current?.remove();
      popupRef.current = null;
      map?.remove();
      mapRef.current = null;
    };
    // The map is created once; location changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    const popup = popupRef.current;
    if (!map || !marker) return;

    marker.setLngLat(coordinates);
    marker.getElement().setAttribute("aria-label", `Selected location: ${locationName}`);
    popup?.setDOMContent(makePopupContent(locationName, coordinates));
    map.flyTo({
      center: coordinates,
      zoom: city.countryCode === "IN" ? 10 : 8.5,
      speed: 1.15,
      curve: 1.35,
      essential: true,
    });
  }, [city.id, city.latitude, city.longitude, city.countryCode, locationName]);

  return (
    <section className="weather-map-section min-w-0" aria-label="Location map">
      <div className="mb-1 flex items-center justify-between gap-3 px-2">
        <div className="min-w-0">
          <p className="section-kicker">Explore the area</p>
          <h3 className="mt-1 flex items-center gap-2 truncate text-base font-semibold text-slate-800">
            <MapPin size={15} className="shrink-0 text-sky-600" />
            <span className="truncate">{locationName}</span>
          </h3>
        </div>
        <span className="shrink-0 text-[10px] text-slate-500">
          {mapReady ? "Live map" : mapError ? "Map unavailable" : "Loading map…"}
        </span>
      </div>

      <div className="weather-map-fade relative h-[260px] w-full sm:h-[300px] xl:h-[340px]">
        <div
          ref={containerRef}
          className="aether-map-canvas h-full w-full"
          role="application"
          aria-label={`Interactive map centered on ${locationName}`}
        />
        {!mapReady && !mapError && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-500">
            Preparing the map…
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-semibold text-slate-700">Map temporarily unavailable</p>
            <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">{mapError}</p>
          </div>
        )}
      </div>
    </section>
  );
}
