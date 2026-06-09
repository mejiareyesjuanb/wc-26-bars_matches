import { useEffect, useMemo, useState } from 'react'
import { rankBars } from '../lib/scoring.js'
import { getActiveCity, cityNeighborhoods, isCityLevel } from '../lib/city.js'
import BarCard from '../components/BarCard.jsx'
import SegmentedToggle from '../components/SegmentedToggle.jsx'
import VenueMap from '../components/VenueMap.jsx'
import VenueModal from '../components/VenueModal.jsx'
import NeighborhoodPicker from './NeighborhoodPicker.jsx'
import { useI18n } from '../lib/i18n/react.jsx'

const PER_HOOD = 10 // bars shown per neighborhood before "show all"
const PAGE = 10 // page size

export default function Bars({ neighborhoods, onSaveNeighborhoods, venues, source, reason, checks = {}, tab, setTab }) {
  const { t } = useI18n()
  const [editing, setEditing] = useState(false)
  const [group, setGroup] = useState('combined') // 'combined' | 'byHood'
  const [selected, setSelected] = useState(null)
  const [expanded, setExpanded] = useState({})
  const [shownCount, setShownCount] = useState(PAGE)

  const city = getActiveCity()
  const hoods = neighborhoods || []
  const hoodKey = hoods.join(',')
  const hasHoods = hoods.length > 0
  // A chosen item matches a venue by its fine neighborhood OR its borough
  // (two-level cities can store a whole-borough selection).
  const inHoods = (v) => hoods.includes(v.neighborhood) || hoods.includes(v.borough)

  // Neighborhood options: Seattle's curated list, else discovered from venues.
  const nList = useMemo(() => cityNeighborhoods(city, venues), [city.id, venues])
  const cityLevel = isCityLevel(nList)

  // Base set: chosen neighborhoods, or the whole city when none are selected.
  const baseVenues = useMemo(() => {
    if (!venues) return []
    return hasHoods ? venues.filter(inHoods) : venues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues, hoodKey])

  const combined = useMemo(
    () => rankBars(baseVenues, checks).filter((v) => v.included),
    [baseVenues, checks],
  )

  // Per-neighborhood rankings (grouped view; only meaningful with ≥2 hoods).
  const byHood = useMemo(() => {
    const m = {}
    for (const h of hoods) m[h] = rankBars((venues || []).filter((v) => v.neighborhood === h || v.borough === h), checks).filter((v) => v.included)
    return m
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues, hoodKey, checks])

  useEffect(() => setShownCount(PAGE), [hoodKey, group])

  // Venues arrive fully baked (checks included) in a single request, so the list
  // renders once, final — a brief skeleton covers only the network fetch.
  const loading = !venues

  // Editing the neighborhood selection (only offered when not city-level).
  if (editing && !cityLevel) {
    return (
      <NeighborhoodPicker
        initial={hoods}
        neighborhoods={nList}
        twoLevel={!!city.twoLevel}
        venues={venues}
        onSave={(h) => { onSaveNeighborhoods(h); setEditing(false) }}
        onSkip={() => setEditing(false)}
      />
    )
  }

  const multi = hoods.length > 1
  const grouped = multi && group === 'byHood'
  const mapVenues = combined

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{grouped ? t('bars.titleByHood') : t('bars.titleCombined')}</h1>
        <SegmentedToggle
          value={tab}
          onChange={setTab}
          ariaLabel={t('bars.view')}
          options={[
            { value: 'list', label: t('bars.list') },
            { value: 'map', label: t('bars.map') },
          ]}
        />
      </div>

      <p className="text-sm text-neutral-500 mt-1 mb-4">
        {t('bars.subtitle')}
        {venues && <span className="ml-1 text-neutral-400">{source === 'google' ? t('bars.sourceLive') : t('bars.sourceCurated')}</span>}
      </p>

      {!cityLevel && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span aria-hidden="true" className="text-neutral-400">📍</span>
          {hasHoods ? (
            <>
              <button
                onClick={() => onSaveNeighborhoods([])}
                className="text-sm rounded-full px-3 py-1 bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200 transition"
              >
                {t('bars.clearToAll')}
              </button>
              {hoods.map((h) => (
                <button
                  key={h}
                  onClick={() => setEditing(true)}
                  title={t('bars.changeAreas', { h })}
                  aria-label={t('bars.changeAreas', { h })}
                  className="text-sm rounded-full px-3 py-1 bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition"
                >
                  {h}
                </button>
              ))}
            </>
          ) : (
            <span className="text-sm text-neutral-500">{t('bars.allOfCity', { city: city.name })}</span>
          )}
          <button
            onClick={() => setEditing(true)}
            className="text-sm rounded-full px-3 py-1 bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200 transition"
          >
            {t('bars.choose')}
          </button>
        </div>
      )}

      {multi && tab === 'list' && (
        <div className="flex rounded-lg border border-neutral-300 overflow-hidden text-sm w-max mb-5">
          <button onClick={() => setGroup('combined')} className={`px-3 py-1 ${group === 'combined' ? 'bg-accent text-white' : 'bg-white text-neutral-600'}`}>{t('bars.combined')}</button>
          <button onClick={() => setGroup('byHood')} className={`px-3 py-1 ${group === 'byHood' ? 'bg-accent text-white' : 'bg-white text-neutral-600'}`}>{t('bars.byHood')}</button>
        </div>
      )}

      {source === 'curated' && (
        <div className="mb-4 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
          {t(reason ? `fallback.${reason}` : 'fallback.default')}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-busy="true" aria-label={t('bars.finding')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tab === 'map' ? (
        <VenueMap venues={mapVenues} onSelect={setSelected} />
      ) : grouped ? (
        <div className="space-y-8">
          {hoods.map((h) => {
            const list = byHood[h] || []
            const shown = list.slice(0, expanded[h] ? Infinity : PER_HOOD)
            return (
              <section key={h}>
                <h2 className="font-semibold mb-3">
                  {h} <span className="text-neutral-400 font-normal">({list.length})</span>
                </h2>
                {list.length === 0 ? (
                  <p className="text-neutral-400 text-sm">{t('bars.sectionEmpty', { h })}</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {shown.map((bar) => (
                      <BarCard key={bar.id} bar={bar} check={checks[bar.id]} onClick={() => setSelected(bar)} />
                    ))}
                  </div>
                )}
                {list.length > PER_HOOD && !expanded[h] && (
                  <button
                    onClick={() => setExpanded((e) => ({ ...e, [h]: true }))}
                    className="mt-3 text-sm text-accent hover:underline"
                  >
                    {t('bars.showAllIn', { n: list.length, h })}
                  </button>
                )}
              </section>
            )
          })}
        </div>
      ) : (
        <>
          {combined.length === 0 ? (
            <p className="text-neutral-400 text-sm py-8 text-center">{t('bars.emptyAll')}</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {combined.slice(0, shownCount).map((bar) => (
                <BarCard key={bar.id} bar={bar} check={checks[bar.id]} onClick={() => setSelected(bar)} />
              ))}
            </div>
          )}
          {shownCount < combined.length && (
            <button
              onClick={() => setShownCount((n) => n + PAGE)}
              className="mt-4 w-full border border-neutral-300 rounded-lg py-2.5 text-sm font-medium hover:border-accent hover:text-accent"
            >
              {t('bars.showMore', { n: combined.length - shownCount })}
            </button>
          )}
        </>
      )}

      {selected && <VenueModal venue={selected} check={checks[selected.id]} onClose={() => setSelected(null)} />}
    </div>
  )
}
