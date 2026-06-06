import { useEffect, useState } from 'react'
import { loadPrefs, savePrefs } from './lib/storage.js'
import { loadVenues } from './lib/venues.js'
import Matches from './views/Matches.jsx'
import Bars from './views/Bars.jsx'

export default function App() {
  const [prefs, setPrefs] = useState(loadPrefs)
  const [tab, setTab] = useState('matches')
  const [venueData, setVenueData] = useState(null)

  useEffect(() => {
    loadVenues().then(setVenueData)
  }, [])

  const savePreferences = (p) => {
    setPrefs(p)
    savePrefs(p)
  }

  const tabClass = (t) =>
    `px-4 py-1.5 ${tab === t ? 'bg-accent text-white' : 'bg-white text-neutral-600'}`

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="font-semibold">⚽ Seattle and Eastside WC 26</span>
          <nav className="flex rounded-lg border border-neutral-300 overflow-hidden text-sm">
            <button className={tabClass('matches')} onClick={() => setTab('matches')}>Matches</button>
            <button className={tabClass('bars')} onClick={() => setTab('bars')}>Bars</button>
          </nav>
        </div>
      </header>

      {tab === 'matches' && <Matches />}
      {tab === 'bars' && (
        <Bars
          prefs={prefs}
          onSavePrefs={savePreferences}
          venues={venueData?.venues}
          source={venueData?.source}
          reason={venueData?.reason}
        />
      )}
    </div>
  )
}
