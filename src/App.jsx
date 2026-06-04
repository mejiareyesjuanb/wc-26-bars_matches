import { useEffect, useState } from 'react'
import { loadPrefs, savePrefs } from './lib/storage.js'
import { loadVenues } from './lib/venues.js'
import Onboarding from './views/Onboarding.jsx'
import Matches from './views/Matches.jsx'
import MatchDetail from './views/MatchDetail.jsx'

export default function App() {
  const [prefs, setPrefs] = useState(loadPrefs)
  const [view, setView] = useState(prefs.onboarded ? 'matches' : 'onboarding')
  const [selected, setSelected] = useState(null)
  const [venueData, setVenueData] = useState(null)

  useEffect(() => {
    loadVenues().then(setVenueData)
  }, [])

  const handleSave = (p) => {
    setPrefs(p)
    savePrefs(p)
    setView('matches')
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-3 font-semibold">⚽ Seattle WC26</div>
      </header>

      {view === 'onboarding' && <Onboarding initial={prefs} onSave={handleSave} />}
      {view === 'matches' && (
        <Matches
          onSelectMatch={(m) => { setSelected(m); setView('detail') }}
          onEditPrefs={() => setView('onboarding')}
        />
      )}
      {view === 'detail' && selected && (
        <MatchDetail
          match={selected}
          prefs={prefs}
          venues={venueData?.venues}
          source={venueData?.source}
          reason={venueData?.reason}
          onBack={() => setView('matches')}
        />
      )}
    </div>
  )
}
