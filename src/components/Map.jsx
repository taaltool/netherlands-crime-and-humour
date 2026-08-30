import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet.geodesic";
import "leaflet/dist/leaflet.css";

const authorColors = {
  "van Erne": "#D46A2A",
  Jícha: "#A02010",
  Boček: "#8A7200",
  Janečková: "#1A5090",
  Klevisová: "#1A7A60",
  Schrevel: "#6A3A8A",
  Kager: "#9A2A6A",
};

const genreColors = {
  "humorous fiction": "#FF69B4",
  "crime fiction": "#1A3A8A",
};

const emotionEmoji = { 1: "😄", 2: "🙂", 3: "😐", 4: "😟", 5: "😱" };

const cartoKey = import.meta.env.VITE_CARTO_KEY;

function getColor(loc, showGenreColors) {
  if (showGenreColors) return genreColors[loc.genre] || "#999";
  return authorColors[loc.author_surname] || "#999";
}

function countPages(place_pp) {
  if (!place_pp || place_pp.length === 0) return 0;
  return place_pp.reduce((total, entry) => {
    const parts = entry.trim().split("-");
    if (parts.length === 2) {
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      if (!isNaN(start) && !isNaN(end)) return total + (end - start + 1);
    }
    return total + 1;
  }, 0);
}

function getRadius(place_pp) {
  if (!place_pp || place_pp.length === 0) return 5;
  const pages = countPages(place_pp);
  const occurrences = place_pp.length;
  const score = Math.sqrt(pages) * 1.4 + occurrences * 1.2;
  return Math.max(5, Math.min(22, 4 + score));
}

function getRouteStyle(vehicle) {
  switch (vehicle) {
    case "car":
      return { dashArray: "6, 6", weight: 2, opacity: 0.5 };
    case "coach":
      return { dashArray: "8, 4", weight: 2.5, opacity: 0.5 };
    case "bike":
      return { dashArray: "3, 4", weight: 1.5, opacity: 0.5 };
    case "on foot":
      return { dashArray: "2, 4", weight: 1, opacity: 0.5 };
    case "ferry":
      return { dashArray: "4, 6", weight: 2, opacity: 0.5 };
    default:
      return { dashArray: "6, 6", weight: 2, opacity: 0.5 };
  }
}

function cloudIcon(color, isVague) {
  const fillOpacity = isVague ? 0.2 : 0.85;
  const strokeColor = isVague ? color : "white";
  const strokeWidth = isVague ? 1.5 : 2;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" viewBox="0 0 28 20">
      <circle cx="9"  cy="13" r="6" fill="${color}" fill-opacity="${fillOpacity}"
        stroke="${strokeColor}" stroke-width="${strokeWidth}" paint-order="stroke fill"/>
      <circle cx="16" cy="10" r="7" fill="${color}" fill-opacity="${fillOpacity}"
        stroke="${strokeColor}" stroke-width="${strokeWidth}" paint-order="stroke fill"/>
      <circle cx="22" cy="13" r="5" fill="${color}" fill-opacity="${fillOpacity}"
        stroke="${strokeColor}" stroke-width="${strokeWidth}" paint-order="stroke fill"/>
      <rect x="4" y="13" width="20" height="7" fill="${color}" fill-opacity="${fillOpacity}"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 20],
    iconAnchor: [14, 10],
    popupAnchor: [0, -10],
  });
}

function zoneIcon(color, radius) {
  const size = radius * 2;
  const r = radius - 2;
  const id = `hatch-${Math.random().toString(36).substr(2, 9)}`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <pattern id="${id}" patternUnits="userSpaceOnUse" width="5" height="5">
          <path d="M0,5 L5,0" stroke="${color}" stroke-width="0.8" opacity="0.5"/>
        </pattern>
      </defs>
      <circle cx="${radius}" cy="${radius}" r="${r}"
        fill="${color}" fill-opacity="0.15" stroke="none"/>
      <circle cx="${radius}" cy="${radius}" r="${r}"
        fill="url(#${id})" stroke="none"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [radius, radius],
    popupAnchor: [0, -radius],
  });
}

function markerIcon(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
      <line x1="1" y1="1" x2="11" y2="11" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      <line x1="11" y1="1" x2="1" y2="11" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6],
  });
}

function transformedIcon(color, isVague) {
  const fillOpacity = isVague ? 0.1 : 0.2;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 36 24">
      <ellipse cx="18" cy="12" rx="17" ry="11"
        fill="${color}" fill-opacity="${fillOpacity}"
        stroke="${color}" stroke-width="1.5" stroke-dasharray="4,3"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [36, 24],
    iconAnchor: [18, 12],
    popupAnchor: [0, -12],
  });
}

function emojiIcon(emotion, relevance) {
  const emoji = emotionEmoji[emotion] || "😐";
  const size = relevance ? 12 + relevance * 4 : 18;
  const html = `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${emoji}</div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}

function GeodesicLine({ from, to, color }) {
  const map = useMap();
  useEffect(() => {
    if (!from || !to) return;
    const line = L.geodesic([[from, to]], {
      weight: 1.5,
      opacity: 0.4,
      color: color,
      dashArray: "2, 10",
      steps: 50,
    }).addTo(map);
    return () => map.removeLayer(line);
  }, [map, from, to, color]);
  return null;
}

function SynthesisedZone({ from, to, color, loc }) {
  const map = useMap();
  useEffect(() => {
    if (!from || !to || isNaN(from[0]) || isNaN(to[0])) return;

    const midLat = (from[0] + to[0]) / 2;
    const midLng = (from[1] + to[1]) / 2;

    const dLat = (to[0] - from[0]) / 2;
    const dLng = (to[1] - from[1]) / 2;
    const rx = Math.sqrt(dLat * dLat + dLng * dLng) + 0.08;
    const ry = rx * 0.4;

    const angle = Math.atan2(to[0] - from[0], to[1] - from[1]);

    const points = [];
    for (let t = 0; t < 2 * Math.PI; t += 0.12) {
      const x = rx * Math.cos(t);
      const y = ry * Math.sin(t);
      const rotX = x * Math.cos(angle) - y * Math.sin(angle);
      const rotY = x * Math.sin(angle) + y * Math.cos(angle);
      points.push([midLat + rotY, midLng + rotX]);
    }

    const polygon = L.polygon(points, {
      color: color,
      weight: 1.5,
      dashArray: "4, 3",
      fillColor: color,
      fillOpacity: 0.15,
    }).addTo(map);

    polygon.bindPopup(
      `<b>${loc.place}</b><br>${loc.author_surname} · ${loc.book_title}<br>pp. ${(loc.place_pp || []).join("; ")}`,
    );

    return () => map.removeLayer(polygon);
  }, [map, from, to, color, loc]);
  return null;
}

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.fitBounds([
        [50.72, 3.15],
        [53.7, 7.3],
      ]);
      map.setMinZoom(7);
    }, 100);
  }, [map]);
  return null;
}

const PopupContent = ({ loc }) => (
  <Popup className="custom-popup">
    <p className="popup-place">{loc.place}</p>
    <p className="popup-meta">
      {loc.author_surname} · <em>{loc.book_title}</em>
    </p>
    {loc.place_pp.length > 0 && (
      <p className="popup-pp">pp. {loc.place_pp.join(", ")}</p>
    )}
    {loc.location && <p className="popup-note">{loc.location}</p>}
  </Popup>
);

export default function Map({ locations, showEmotions, showGenreColors }) {
  return (
    <MapContainer
      center={[52.3, 5.0]}
      zoom={8}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
      maxBounds={[
        [49.5, 1.5],
        [55.0, 9.5],
      ]}
      maxBoundsViscosity={0.8}
    >
      <FitBounds />
      <TileLayer
        url={`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${cartoKey ? `?key=${cartoKey}` : ""}`}
        attribution="© OpenStreetMap © CARTO"
        subdomains="abcd"
      />
      {locations.map((loc, i) => {
        const color = getColor(loc, showGenreColors);
        const isVague = loc.place_setting === "vague";

        // Route
        if (loc.place_type === "route") {
          if (!loc.lat_from || !loc.lng_from || !loc.lat_to || !loc.lng_to)
            return null;
          const from = [Number(loc.lat_from), Number(loc.lng_from)];
          const to = [Number(loc.lat_to), Number(loc.lng_to)];
          if (isNaN(from[0]) || isNaN(to[0])) return null;

          if (loc.place_route === "airplane") {
            return <GeodesicLine key={i} from={from} to={to} color={color} />;
          }

          const style = getRouteStyle(loc.place_route);
          return (
            <Polyline
              key={i}
              positions={[from, to]}
              pathOptions={{ color, ...style }}
            >
              <PopupContent loc={loc} />
            </Polyline>
          );
        }

        // Synthetised zone — ovál mezi dvěma body
        if (loc.place_setting === "synthetised") {
          if (!loc.lat_from || !loc.lng_from || !loc.lat_to || !loc.lng_to)
            return null;
          const from = [Number(loc.lat_from), Number(loc.lng_from)];
          const to = [Number(loc.lat_to), Number(loc.lng_to)];
          if (isNaN(from[0]) || isNaN(to[0])) return null;
          return (
            <SynthesisedZone
              key={i}
              from={from}
              to={to}
              color={color}
              loc={loc}
            />
          );
        }

        // Emotions mode
        if (showEmotions && loc.emotions !== null) {
          return (
            <Marker
              key={i}
              position={[loc.lat, loc.lng]}
              icon={emojiIcon(loc.emotions, loc.relevance)}
            >
              <PopupContent loc={loc} />
            </Marker>
          );
        }

        // Projected space
        if (loc.place_type === "projected space") {
          return (
            <Marker
              key={i}
              position={[loc.lat, loc.lng]}
              icon={cloudIcon(color, isVague)}
            >
              <PopupContent loc={loc} />
            </Marker>
          );
        }

        // Marker
        if (loc.place_type === "marker") {
          return (
            <Marker
              key={i}
              position={[loc.lat, loc.lng]}
              icon={markerIcon(color)}
            >
              <PopupContent loc={loc} />
            </Marker>
          );
        }

        // Zone of action
        if (loc.place_type === "zone of action") {
          const r = Math.round(getRadius(loc.place_pp) * 1.8);
          return (
            <Marker
              key={i}
              position={[loc.lat, loc.lng]}
              icon={zoneIcon(color, r)}
            >
              <PopupContent loc={loc} />
            </Marker>
          );
        }

        // Transformed
        if (loc.place_refscale === "transformed") {
          return (
            <Marker
              key={i}
              position={[loc.lat, loc.lng]}
              icon={transformedIcon(color, isVague)}
            >
              <PopupContent loc={loc} />
            </Marker>
          );
        }

        // Setting (default)
        return (
          <CircleMarker
            key={i}
            center={[loc.lat, loc.lng]}
            radius={getRadius(loc.place_pp)}
            pathOptions={{
              fillColor: color,
              fillOpacity: isVague ? 0.25 : 0.85,
              color: isVague ? color : "#fff",
              weight: isVague ? 2.5 : 1.5,
            }}
          >
            <PopupContent loc={loc} />
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
