import { useState } from 'react'
import Chip from '../components/Chip.jsx'
import { NEIGHBORHOODS } from '../data/neighborhoods.js'

export default function NeighborhoodPicker({ initial, onSave }) {
  const [hoods, setHoods] = useState(initial || [])

  const toggle = (h) =>
    setHoods((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : prev.length < 5 ? [...prev, h] : prev,
    )

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Choose your preferred neighborhoods</h1>
      <p className="text-neutral-500 mt-2">
        Pick up to 5, in order of preference. We use these to rank the best bars to watch the
        World Cup near you. <strong>This is required to see the bars.</strong>
      </p>

      <div className="flex flex-wrap gap-2 mt-6">
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
        className="mt-8 w-full bg-accent text-white rounded-lg py-3 font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {hoods.length ? 'See bars' : 'Pick at least one neighborhood'}
      </button>
    </div>
  )
}
