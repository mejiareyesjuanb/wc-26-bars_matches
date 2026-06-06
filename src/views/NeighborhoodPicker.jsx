import { useState } from 'react'
import Chip from '../components/Chip.jsx'
import { NEIGHBORHOODS } from '../data/neighborhoods.js'

// `compact` renders an embeddable version (no full-page wrapper / heading) for
// use inside the match-detail modal.
export default function NeighborhoodPicker({ initial, onSave, compact = false }) {
  const [hoods, setHoods] = useState(initial || [])

  const toggle = (h) =>
    setHoods((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : prev.length < 5 ? [...prev, h] : prev,
    )

  return (
    <div className={compact ? '' : 'max-w-2xl mx-auto p-6'}>
      {compact ? (
        <p className="text-sm text-neutral-500 mb-3">
          Pick up to 5 neighborhoods or cities to see the best nearby bars showing the World Cup.
        </p>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Choose your neighborhoods or cities</h1>
          <p className="text-neutral-500 mt-2">
            Pick up to 5, in order of preference (Seattle neighborhoods or Eastside cities). We use
            these to rank the best bars to watch the World Cup near you.{' '}
            <strong>This is required to see the bars.</strong>
          </p>
        </>
      )}

      <div className={`flex flex-wrap gap-2 ${compact ? '' : 'mt-6'}`}>
        {NEIGHBORHOODS.map((h) => (
          <Chip
            key={h}
            active={hoods.includes(h)}
            disabled={!hoods.includes(h) && hoods.length >= 5}
            onClick={() => toggle(h)}
          >
            {hoods.includes(h) ? `${hoods.indexOf(h) + 1}. ${h}` : h}
          </Chip>
        ))}
      </div>

      <button
        onClick={() => onSave(hoods)}
        disabled={!hoods.length}
        className={`${compact ? 'mt-4' : 'mt-8'} w-full bg-accent text-white rounded-lg py-3 font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {hoods.length ? 'See bars' : 'Pick at least one neighborhood or city'}
      </button>
    </div>
  )
}
