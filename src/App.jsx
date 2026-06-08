import { useEffect, useState } from 'react'
import { loadPrefs, savePrefs } from './lib/storage.js'
import { loadVenues } from './lib/venues.js'
import { detectLang } from './lib/i18n/index.js'
import { I18nProvider, useI18n } from './lib/i18n/react.jsx'
import Matches from './views/Matches.jsx'
import Bars from './views/Bars.jsx'

function Shell({ prefs, onSavePrefs, venueData }) {
  const { t, lang, setLang } = useI18n()
  const [tab, setTab] = useState('matches')

  const tabClass = (x) =>
    `px-4 py-1.5 ${tab === x ? 'bg-accent text-white' : 'bg-white text-neutral-600'}`
  const langClass = (l) =>
    `px-2.5 py-1.5 ${lang === l ? 'bg-accent text-white' : 'bg-white text-neutral-600'}`

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
          <span className="font-semibold">{t('app.brand')}</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex rounded-lg border border-neutral-300 overflow-hidden text-xs" role="group" aria-label="Language">
              <button className={langClass('en')} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button>
              <button className={langClass('es')} onClick={() => setLang('es')} aria-pressed={lang === 'es'}>ES</button>
            </div>
            <nav className="flex rounded-lg border border-neutral-300 overflow-hidden text-sm">
              <button className={tabClass('matches')} onClick={() => setTab('matches')}>{t('app.tabMatches')}</button>
              <button className={tabClass('bars')} onClick={() => setTab('bars')}>{t('app.tabBars')}</button>
            </nav>
          </div>
        </div>
      </header>

      {tab === 'matches' && (
        <Matches
          venues={venueData?.venues}
          prefs={prefs}
          onSavePrefs={onSavePrefs}
          onGoToBars={() => setTab('bars')}
        />
      )}
      {tab === 'bars' && (
        <Bars
          prefs={prefs}
          onSavePrefs={onSavePrefs}
          venues={venueData?.venues}
          source={venueData?.source}
          reason={venueData?.reason}
        />
      )}
    </div>
  )
}

export default function App() {
  const [prefs, setPrefs] = useState(loadPrefs)
  const [venueData, setVenueData] = useState(null)

  useEffect(() => {
    loadVenues().then(setVenueData)
  }, [])

  const savePreferences = (p) => {
    setPrefs(p)
    savePrefs(p)
  }

  const lang = detectLang(prefs)
  const setLang = (l) => savePreferences({ ...prefs, language: l })

  return (
    <I18nProvider lang={lang} setLang={setLang}>
      <Shell prefs={prefs} onSavePrefs={savePreferences} venueData={venueData} />
    </I18nProvider>
  )
}
