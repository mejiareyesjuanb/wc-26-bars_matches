import { useState } from 'react'
import Chip from '../components/Chip.jsx'
import { NEIGHBORHOODS } from '../data/neighborhoods.js'
import { VENUE_TYPES } from '../data/bars.js'

export default function Onboarding({ initial, onSave }) {
  const [hoods, setHoods] = useState(initial.neighborhoods)
  const [types, setTypes] = useState(initial.venueTypes)
  const [wantsReservations, setRes] = useState(initial.wantsReservations)
  const [wantsBigScreen, setBig] = useState(initial.wantsBigScreen)
  const [atmosphere, setAtmo] = useState(initial.atmosphere)

  const toggleHood = (h) => {
    if (hoods.includes(h)) setHoods(hoods.filter((x) => x !== h))
    else if (hoods.length < 5) setHoods([...hoods, h])
  }
  const toggleType = (t) =>
    setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t])

  const save = () =>
    onSave({ city: 'Seattle', neighborhoods: hoods, venueTypes: types, wantsReservations, wantsBigScreen, atmosphere, onboarded: true })

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Watch the World Cup in Seattle</h1>
      <p className="text-neutral-500 mt-1">Tell us your spots and tastes; we’ll rank the best venues for every match.</p>

      <section className="mt-6">
        <h2 className="font-semibold">Neighborhoods <span className="text-neutral-400 font-normal">(up to 5, in order of preference)</span></h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {NEIGHBORHOODS.map((h) => (
            <Chip key={h} active={hoods.includes(h)} disabled={!hoods.includes(h) && hoods.length >= 5} onClick={() => toggleHood(h)}>
              {hoods.includes(h) ? `${hoods.indexOf(h) + 1}. ${h}` : h}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Venue types</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {VENUE_TYPES.map((t) => (
            <Chip key={t} active={types.includes(t)} onClick={() => toggleType(t)}>{t}</Chip>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Atmosphere</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {['lively', 'low-key'].map((a) => (
            <Chip key={a} active={atmosphere === a} onClick={() => setAtmo(atmosphere === a ? null : a)}>{a}</Chip>
          ))}
        </div>
      </section>

      <section className="mt-6 flex flex-wrap gap-2">
        <Chip active={wantsBigScreen} onClick={() => setBig(!wantsBigScreen)}>Big screen / projector</Chip>
        <Chip active={wantsReservations} onClick={() => setRes(!wantsReservations)}>Needs reservations</Chip>
      </section>

      <button onClick={save} className="mt-8 w-full bg-accent text-white rounded-lg py-3 font-semibold hover:opacity-90">
        See matches
      </button>
    </div>
  )
}
