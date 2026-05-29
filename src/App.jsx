import { useState, useMemo } from "react";
import Map from "./components/Map";
import FilterBar from "./components/FilterBar";
import { locations } from "./data/locations";

export default function App() {
  const [activeGenres, setActiveGenres] = useState([]);
  const [activeAuthors, setActiveAuthors] = useState([]);
  const [activePlaceTypes, setActivePlaceTypes] = useState([]);
  const [showEmotions, setShowEmotions] = useState(false);
  const [showGenreColors, setShowGenreColors] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(() => {
    return locations.filter((l) => {
      if (l.place_type === "route") {
        if (activePlaceTypes.length && !activePlaceTypes.includes("route"))
          return false;
        if (activeGenres.length && !activeGenres.includes(l.genre))
          return false;
        if (activeAuthors.length && !activeAuthors.includes(l.author_surname))
          return false;
        return (
          l.lat_from !== null &&
          l.lng_from !== null &&
          l.lat_to !== null &&
          l.lng_to !== null
        );
      }
      if (l.place_setting === "synthetised") {
        if (activePlaceTypes.length && !activePlaceTypes.includes(l.place_type))
          return false;
        if (activeGenres.length && !activeGenres.includes(l.genre))
          return false;
        if (activeAuthors.length && !activeAuthors.includes(l.author_surname))
          return false;
        return (
          l.lat_from !== null &&
          l.lng_from !== null &&
          l.lat_to !== null &&
          l.lng_to !== null
        );
      }
      if (l.lat === null) return false;
      if (activeGenres.length && !activeGenres.includes(l.genre)) return false;
      if (activeAuthors.length && !activeAuthors.includes(l.author_surname))
        return false;
      if (activePlaceTypes.length && !activePlaceTypes.includes(l.place_type))
        return false;
      return true;
    });
  }, [activeGenres, activeAuthors, activePlaceTypes]);

  return (
    <div className="app">
      <nav className="navbar">
        <span className="navbar-title">Literary Maps of the Netherlands</span>
        <span className="navbar-count">{filtered.length} locations</span>
        <button className="hamburger" onClick={() => setSidebarOpen((v) => !v)}>
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <button
          className={`emotion-toggle ${showEmotions ? "emotion-toggle--active" : ""}`}
          onClick={() => setShowEmotions((v) => !v)}
        >
          {showEmotions ? "😄 emotions on" : "😐 emotions off"}
        </button>
        <button
          className={`emotion-toggle ${showGenreColors ? "emotion-toggle--active" : ""}`}
          onClick={() => setShowGenreColors((v) => !v)}
        >
          genre colors
        </button>
        <span className="navbar-tag">humour · crime</span>
      </nav>
      <FilterBar
        locations={locations}
        activeGenres={activeGenres}
        setActiveGenres={setActiveGenres}
        activeAuthors={activeAuthors}
        setActiveAuthors={setActiveAuthors}
        activePlaceTypes={activePlaceTypes}
        setActivePlaceTypes={setActivePlaceTypes}
        isOpen={sidebarOpen}
      />
      <Map
        locations={filtered}
        showEmotions={showEmotions}
        showGenreColors={showGenreColors}
      />
      <footer className="footer">
        {/* <span>2026</span>
        <span>© Taaltool | OpenStreetMap | CARTO</span> */}
      </footer>
    </div>
  );
}
