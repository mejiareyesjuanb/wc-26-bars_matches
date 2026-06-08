import { useEffect, useMemo, useRef, useState } from 'react'
import { getTeam, isPlaceholder } from '../data/teams.js'
import { teamInfo, TEAM_INFO_META } from '../data/teamInfo.js'
import { formatKickoff } from '../lib/time.js'
import { googleCalendarUrl, ICS_FILENAME } from '../lib/calendar.js'
import { addMatchesToCalendar } from '../lib/addToCalendar.js'
import { stakesFor } from '../lib/stakes.js'
import { rankBars } from '../lib/scoring.js'
import { confirmScreens } from '../lib/venues.js'
import { MATCHES } from '../data/matches.js'
import BarCard from './BarCard.jsx'
import NeighborhoodPicker from '../views/NeighborhoodPicker.jsx'
import { getActiveCity, cityNeighborhoods, isCityLevel } from '../lib/city.js'
import { useI18n } from '../lib/i18n/react.jsx'

function TeamName({ team }) {
  return <span>{team.flag ? `${team.flag} ` : ''}{team.name}</span>
}

function TeamColumn({ team, info }) {
  const { t } = useI18n()
  return (
    <div>
      <div className="font-semibold text-sm"><TeamName team={team} /></div>
      <div className="text-xs text-neutral-500 mt-0.5">
        {t('detail.fifaLine', { rank: info.fifaRank, finish: info.bestFinish })}
      </div>
      <div className="text-xs font-medium text-neutral-500 mt-2">{t('detail.playersToWatch')}</div>
      <div className="mt-1 flex flex-wrap gap-1">
        {info.playersToWatch.map((p) => (
          <span key={p.name} className="text-xs bg-neutral-100 rounded-full px-2 py-0.5">
            <span className="text-neutral-700">{p.name}</span> <span className="text-neutral-400">{p.club}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// Tappable when the team is known (group stage); plain text for knockout slots.
function TeamLabel({ team, onPick }) {
  const { t } = useI18n()
  if (isPlaceholder(team) || !onPick) return <TeamName team={team} />
  return (
    <button
      onClick={() => onPick(team.code)}
      aria-label={t('detail.seeSchedule', { team: team.name })}
      className="hover:text-accent underline-offset-2 hover:underline"
    >
      <TeamName team={team} />
    </button>
  )
}

export default function MatchDetailModal({ match, venues, neighborhoods, onSaveNeighborhoods, onClose, onSeeAllBars, onPickTeam, checks = {}, onChecks }) {
  const { t, lang, stage } = useI18n()
  const [editingHoods, setEditingHoods] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Move focus into the dialog on open; restore it to the trigger on close.
  useEffect(() => {
    const prev = document.activeElement
    contentRef.current?.focus()
    return () => { if (prev && typeof prev.focus === 'function') prev.focus() }
  }, [])

  const hoods = neighborhoods || []
  const hoodKey = hoods.join(',')
  const hasHoods = hoods.length > 0
  const city = getActiveCity()
  const nList = useMemo(() => cityNeighborhoods(city, venues), [city.id, venues])
  const cityLevel = isCityLevel(nList)
  const inHoods = (v) => hoods.includes(v.neighborhood) || hoods.includes(v.borough)

  // Base set: chosen neighborhoods, or the whole city when none are selected.
  const baseVenues = useMemo(
    () => (venues ? (hasHoods ? venues.filter(inHoods) : venues) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [venues, hoodKey],
  )
  // Base ranking (no website checks) picks which venues are worth checking.
  const baseRanked = useMemo(() => rankBars(baseVenues), [baseVenues])
  // Final ranking folds in confirmations and keeps only sports bars / confirmed.
  const ranked = useMemo(
    () => rankBars(baseVenues, checks).filter((v) => v.included),
    [baseVenues, checks],
  )
  const candidates = useMemo(() => baseRanked.filter((v) => v.website).slice(0, 20), [baseRanked])

  useEffect(() => {
    const need = candidates.filter((v) => checks[v.id] === undefined)
    if (!need.length) return
    let cancelled = false
    confirmScreens(need).then((res) => {
      if (!cancelled && res && Object.keys(res).length) onChecks?.(res)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.map((v) => v.id).join(',')])

  if (!match) return null
  const home = getTeam(match.homeTeam)
  const away = getTeam(match.awayTeam)
  const homeInfo = teamInfo(match.homeTeam)
  const awayInfo = teamInfo(match.awayTeam)
  const showTeams = homeInfo && awayInfo && !isPlaceholder(home) && !isPlaceholder(away)
  const stakes = stakesFor(match, MATCHES, lang)
  const top = ranked.slice(0, 3)
  const enriching = candidates.some((v) => checks[v.id] === undefined)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${home.name} ${t('common.vs')} ${away.name}`}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle (decorative) */}
        <div className="sm:hidden flex justify-center pt-2">
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>

        {/* Header — renders instantly from the match data */}
        <div className="p-5 border-b border-neutral-100 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-accent">
              {stage(match.stage)}{match.group ? ` · ${t('match.group', { g: match.group })}` : ''}
            </div>
            <h2 className="text-lg font-semibold mt-1">
              <TeamLabel team={home} onPick={onPickTeam} /> <span className="text-neutral-400 font-normal">{t('common.vs')}</span> <TeamLabel team={away} onPick={onPickTeam} />
            </h2>
            <p className="text-sm text-neutral-500 mt-1">{formatKickoff(match.datetime, lang)} · {match.venueCity}</p>
          </div>
          <button onClick={onClose} aria-label={t('detail.close')} className="text-neutral-400 hover:text-neutral-700 text-xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-6">
          {/* Teams — FIFA rank, best World Cup finish, players to watch */}
          {showTeams && (
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TeamColumn team={home} info={homeInfo} />
                <TeamColumn team={away} info={awayInfo} />
              </div>
              <p className="mt-2 text-xs text-neutral-400">{t('detail.fifaAsOf', { date: TEAM_INFO_META.rankAsOf })}</p>
            </section>
          )}

          {/* Add to calendar (the .ics includes a 1-hour reminder alarm) */}
          <section>
            <h3 className="text-sm font-semibold mb-2">{t('detail.addToCalendar')}</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={googleCalendarUrl(match, lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 text-sm bg-accent text-white rounded-lg px-3 py-2 hover:opacity-90"
              >
                {t('detail.addGoogle')}
              </a>
              <button
                onClick={() => addMatchesToCalendar([match], { filename: ICS_FILENAME(match) })}
                className="inline-flex items-center justify-center gap-1 text-sm border border-neutral-300 rounded-lg px-3 py-2 hover:border-accent"
              >
                {t('detail.downloadIcs')}
              </button>
            </div>
            <p className="mt-2 text-xs text-neutral-400">{t('detail.reminderNote')}</p>
          </section>

          {/* Stage stakes — banner above where-to-watch */}
          {stakes && (
            <section className="text-sm bg-accent/10 text-accent rounded-lg px-3 py-2">
              ⚡ {stakes}
            </section>
          )}

          {/* Where to watch — top bars in the chosen areas, or city-wide */}
          <section>
            <h3 className="text-sm font-semibold mb-2">{t('detail.whereToWatch')}</h3>
            {editingHoods && !cityLevel ? (
              <NeighborhoodPicker
                initial={hoods}
                compact
                neighborhoods={nList}
                twoLevel={!!city.twoLevel}
                venues={venues}
                onSave={(h) => { onSaveNeighborhoods?.(h); setEditingHoods(false) }}
                onSkip={() => setEditingHoods(false)}
              />
            ) : (
              <>
                {/* Chosen neighborhoods (pin + chips), or a Choose-areas affordance */}
                {hasHoods ? (
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span aria-hidden="true" className="text-neutral-400">📍</span>
                    {hoods.map((h) => (
                      <button
                        key={h}
                        onClick={() => setEditingHoods(true)}
                        title={t('bars.changeAreas', { h })}
                        aria-label={t('bars.changeAreas', { h })}
                        className="text-sm rounded-full px-3 py-1 bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                ) : !cityLevel ? (
                  <button onClick={() => setEditingHoods(true)} className="text-sm text-accent hover:underline mb-3">
                    {t('bars.choose')}
                  </button>
                ) : null}

                {!venues || (top.length === 0 && enriching) ? (
                  <div className="space-y-2">
                    <div className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
                    <div className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
                  </div>
                ) : top.length === 0 ? (
                  <p className="text-sm text-neutral-400">{t('detail.noVenuesArea')}</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-400">{t('detail.barsNote')}</p>
                    {top.map((bar) => (
                      <BarCard key={bar.id} bar={bar} check={checks[bar.id]} />
                    ))}
                    <button onClick={onSeeAllBars} className="text-sm text-accent hover:underline">{t('detail.seeAllBars')}</button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
