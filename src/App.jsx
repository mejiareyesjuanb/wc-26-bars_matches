import { useEffect, useMemo, useRef, useState } from 'react'
import { loadPrefs, savePrefs } from './lib/storage.js'
import { loadVenues } from './lib/venues.js'
import { detectLang } from './lib/i18n/index.js'
import { I18nProvider, useI18n } from './lib/i18n/react.jsx'
import { detectCity, setCurrentCity, getActiveCity, getCity, geolocateCity } from './lib/city.js'
import CityPicker from './components/CityPicker.jsx'
import SegmentedToggle from './components/SegmentedToggle.jsx'
import Matches from './views/Matches.jsx'
import Bars from './views/Bars.jsx'

// Subtle text language switcher (EN | ES) — discoverable but visually quiet.
function LangToggle({ lang, setLang }) {
  const cls = (l) =>
    lang === l ? 'text-accent font-bold' : 'text-neutral-500 hover:text-neutral-700'
  return (
    <div className="flex items-center gap-2 text-xs font-medium shrink-0" role="group" aria-label="Language">
      <button className={cls('en')} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button>
      <span className="text-neutral-300" aria-hidden="true">|</span>
      <button className={cls('es')} onClick={() => setLang('es')} aria-pressed={lang === 'es'}>ES</button>
    </div>
  )
}

function Shell({ prefs, onSavePrefs, venues, source, reason, checks }) {
  const { t, lang, setLang } = useI18n()
  const [tab, setTab] = useState('matches')
  const [cityPickerOpen, setCityPickerOpen] = useState(false)
  const [geoCityId, setGeoCityId] = useState(null)
  const [bannerOpen, setBannerOpen] = useState(false)
  const geoRan = useRef(false)
  const city = getActiveCity()
  const cityId = city.id

  // Neighborhoods are stored per city, so switching cities never loses them.
  const byCity = prefs.neighborhoodsByCity || {}
  const neighborhoods = byCity[cityId] ?? []
  const saveNeighborhoods = (hoods) =>
    onSavePrefs({ ...prefs, neighborhoodsByCity: { ...byCity, [cityId]: hoods } })

  // First visit (no saved city): geolocate → nearest city + banner. Non-blocking;
  // denial/unavailable leaves the default city. Never opens the neighborhood prompt.
  useEffect(() => {
    if (geoRan.current) return
    geoRan.current = true
    if (prefs.city) return
    geolocateCity().then((id) => {
      if (id) {
        onSavePrefs({ ...prefs, city: id })
        setGeoCityId(id)
        setBannerOpen(true)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pickCity = (id) => {
    onSavePrefs({ ...prefs, city: id }) // keep per-city neighborhoods
    setCityPickerOpen(false)
    setBannerOpen(false)
    // The post-pick neighborhood prompt is intentionally disabled — neighborhoods
    // are chosen in the Bars tab. Per-city selections still persist.
  }

  const navOptions = [
    { value: 'matches', label: t('app.tabMatches') },
    { value: 'bars', label: t('app.tabBars') },
  ]
  const PrimaryNav = () => (
    <SegmentedToggle variant="primary" value={tab} onChange={setTab} ariaLabel={t('app.nav')} options={navOptions} />
  )
  const CityPill = () => (
    <button
      onClick={() => setCityPickerOpen(true)}
      className="inline-flex items-center gap-1 text-xs sm:text-sm rounded-full px-3 py-1 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 whitespace-nowrap"
      aria-label={t('city.change')}
    >
      📍 {city.name} <span aria-hidden="true" className="text-neutral-400">▾</span>
    </button>
  )

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6">
          {/* Row 1: brand + city (left), centered primary toggle (desktop), EN|ES (right) */}
          <div className="relative flex items-center justify-between h-14">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="font-bold tracking-tight text-sm sm:text-base whitespace-nowrap">{t('app.brand')}</span>
              <CityPill />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 hidden sm:block">
              <PrimaryNav />
            </div>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          {/* Row 2 (mobile only): centered primary toggle for thumb access */}
          <div className="sm:hidden flex justify-center pb-2">
            <PrimaryNav />
          </div>
        </div>
      </header>

      {bannerOpen && geoCityId && (
        <div className="bg-accent/10 border-b border-accent/20 text-sm text-accent">
          <div className="max-w-5xl mx-auto px-6 py-2 flex items-center gap-2">
            <span>📍 {t('city.banner', { city: getCity(geoCityId).name })}</span>
            <button onClick={() => { setBannerOpen(false); setCityPickerOpen(true) }} className="underline hover:opacity-80">
              {t('city.notRight')} {t('city.change')}
            </button>
            <button onClick={() => setBannerOpen(false)} aria-label={t('detail.close')} className="ml-auto text-accent/70 hover:text-accent text-lg leading-none">×</button>
          </div>
        </div>
      )}

      {tab === 'matches' && (
        <Matches
          venues={venues}
          neighborhoods={neighborhoods}
          onSaveNeighborhoods={saveNeighborhoods}
          onGoToBars={() => setTab('bars')}
          checks={checks}
        />
      )}
      {tab === 'bars' && (
        <Bars
          neighborhoods={neighborhoods}
          onSaveNeighborhoods={saveNeighborhoods}
          venues={venues}
          source={source}
          reason={reason}
          checks={checks}
        />
      )}

      {cityPickerOpen && (
        <CityPicker
          currentId={city.id}
          nearestId={geoCityId}
          onPick={pickCity}
          onClose={() => setCityPickerOpen(false)}
        />
      )}
    </div>
  )
}

export default function App() {
  const [prefs, setPrefs] = useState(loadPrefs)
  const [venueData, setVenueData] = useState(null)

  // Keep the active-city module in sync so non-React helpers read the right city.
  const cityId = detectCity(prefs)
  setCurrentCity(cityId)

  // Reload venues whenever the city changes (clear first → loading states show).
  useEffect(() => {
    setVenueData(null)
    loadVenues(cityId).then(setVenueData)
  }, [cityId])

  const savePreferences = (p) => {
    setPrefs(p)
    savePrefs(p)
  }

  const lang = detectLang(prefs)
  const setLang = (l) => savePreferences({ ...prefs, language: l })

  // Treat venue data as "loading" until it matches the active city, so a city
  // switch never flashes the previous city's venues (and never trips the
  // neighborhood prompt's city-level check on stale data).
  const ready = venueData && venueData.city === cityId
  const venues = ready ? venueData.venues : null
  const source = ready ? venueData.source : undefined
  const reason = ready ? venueData.reason : undefined

  // Website "screens / World Cup" checks are baked into the venue objects by the
  // precomputed snapshot; expose them as the id→check map the ranking expects.
  const checks = useMemo(
    () => Object.fromEntries((venues || []).filter((v) => v.check).map((v) => [v.id, v.check])),
    [venues],
  )

  return (
    <I18nProvider lang={lang} setLang={setLang}>
      <Shell prefs={prefs} onSavePrefs={savePreferences} venues={venues} source={source} reason={reason} checks={checks} />
    </I18nProvider>
  )
}
