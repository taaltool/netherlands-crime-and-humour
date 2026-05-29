import { useMemo } from 'react'

const toggle = (value, active, setActive) =>
  setActive(prev => prev.includes(value)
    ? prev.filter(v => v !== value)
    : [...prev, value]
  )

export default function FilterBar({
  locations,
  activeGenres, setActiveGenres,
  activeAuthors, setActiveAuthors,
  activePlaceTypes, setActivePlaceTypes,
}) {
  const genres     = useMemo(() => [...new Set(locations.map(l => l.genre).filter(Boolean))], [locations])
  const authors    = useMemo(() => [...new Set(locations.map(l => l.author_surname).filter(Boolean))], [locations])
  const placeTypes = useMemo(() => [...new Set(locations.map(l => l.place_type).filter(Boolean))], [locations])

  const hasFilter = activeGenres.length || activeAuthors.length || activePlaceTypes.length

  return (
    <aside className="sidebar">
      <div className="filter-section">
        <div className="filter-label">Genre</div>
        <div className="pills">
          {genres.map(g => (
            <button key={g}
              className={`pill ${activeGenres.includes(g) ? 'pill--active' : ''}`}
              onClick={() => toggle(g, activeGenres, setActiveGenres)}
            >{g}</button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-label">Author</div>
        <div className="pills">
          {authors.map(a => (
            <button key={a}
              className={`pill ${activeAuthors.includes(a) ? 'pill--active' : ''}`}
              onClick={() => toggle(a, activeAuthors, setActiveAuthors)}
            >{a}</button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-label">Place type</div>
        <div className="pills">
          {placeTypes.map(t => (
            <button key={t}
              className={`pill ${activePlaceTypes.includes(t) ? 'pill--active' : ''}`}
              onClick={() => toggle(t, activePlaceTypes, setActivePlaceTypes)}
            >{t}</button>
          ))}
        </div>
      </div>

      {hasFilter && (
        <button className="clear" onClick={() => {
          setActiveGenres([]); setActiveAuthors([]); setActivePlaceTypes([])
        }}>Clear all</button>
      )}

      <div className="sidebar-legend">
        <div className="filter-label">Legend</div>

        <div className="leg-section-title">Place types</div>

        <div className="leg-row">
          <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="#555" fillOpacity="0.85" stroke="white" strokeWidth="1.5"/></svg>
          <span>Setting (precise)</span>
        </div>
        <div className="leg-row">
          <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="#555" fillOpacity="0.2" stroke="#555" strokeWidth="1.5"/></svg>
          <span>Setting (vague)</span>
        </div>
        <div className="leg-row">
          <svg width="18" height="12" viewBox="0 0 18 12">
            <circle cx="9" cy="6" r="7" fill="#555" fillOpacity="0.15"/>
            <line x1="0" y1="12" x2="12" y2="0" stroke="#555" strokeWidth="0.8" opacity="0.5"/>
            <line x1="6" y1="12" x2="18" y2="0" stroke="#555" strokeWidth="0.8" opacity="0.5"/>
          </svg>
          <span>Zone of action</span>
        </div>
        <div className="leg-row">
          <svg width="24" height="12" viewBox="0 0 24 12">
            <circle cx="4" cy="9" r="3.5" fill="#555" fillOpacity="0.75" stroke="white" strokeWidth="1" paintOrder="stroke fill"/>
            <circle cx="11" cy="6" r="4.5" fill="#555" fillOpacity="0.75" stroke="white" strokeWidth="1" paintOrder="stroke fill"/>
            <circle cx="19" cy="9" r="3" fill="#555" fillOpacity="0.75" stroke="white" strokeWidth="1" paintOrder="stroke fill"/>
            <rect x="1" y="9" width="19" height="3" fill="#555" fillOpacity="0.75"/>
          </svg>
          <span>Projected space</span>
        </div>
        <div className="leg-row">
          <svg width="12" height="12">
            <line x1="1" y1="1" x2="11" y2="11" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
            <line x1="11" y1="1" x2="1" y2="11" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Marker</span>
        </div>
        <div className="leg-row">
          <svg width="24" height="14" viewBox="0 0 24 14">
            <ellipse cx="12" cy="7" rx="11" ry="6" fill="#555" fillOpacity="0.15" stroke="#555" strokeWidth="1.5" strokeDasharray="4,3"/>
          </svg>
          <span>Transformed / synthesised</span>
        </div>

        <div className="leg-section-title" style={{marginTop:'10px'}}>Routes</div>

        <div className="leg-row">
          <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="#555" strokeWidth="2" strokeDasharray="6,6"/></svg>
          <span>Car</span>
        </div>
        <div className="leg-row">
          <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="#555" strokeWidth="2.5" strokeDasharray="8,4"/></svg>
          <span>Coach</span>
        </div>
        <div className="leg-row">
          <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="#555" strokeWidth="1.5" strokeDasharray="3,4"/></svg>
          <span>Bike</span>
        </div>
        <div className="leg-row">
          <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="#555" strokeWidth="1" strokeDasharray="2,4"/></svg>
          <span>On foot</span>
        </div>
        <div className="leg-row">
          <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="#555" strokeWidth="2" strokeDasharray="4,6"/></svg>
          <span>Ferry</span>
        </div>
        <div className="leg-row">
          <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="#555" strokeWidth="1.5" strokeDasharray="2,10"/></svg>
          <span>Airplane</span>
        </div>

        <div className="leg-section-title" style={{marginTop:'10px'}}>Point size</div>
        <div style={{display:'flex', alignItems:'center', gap:'4px', marginBottom:'4px'}}>
          <svg width="8" height="8"><circle cx="4" cy="4" r="3.5" fill="#555" opacity="0.7"/></svg>
          <svg width="12" height="12"><circle cx="6" cy="6" r="5.5" fill="#555" opacity="0.7"/></svg>
          <svg width="18" height="18"><circle cx="9" cy="9" r="8.5" fill="#555" opacity="0.7"/></svg>
        </div>
        <div className="leg-note"><p>by relevance:</p><p>page range × frequency</p></div>
      </div>
    </aside>
  )
}
