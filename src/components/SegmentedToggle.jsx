// A segmented toggle with two visual tiers, so primary navigation reads louder than
// secondary view switches:
//  - variant="primary":  pill track + solid accent fill on the active item (Matches/Bars).
//  - variant="secondary": gray track + a floating white pill on the active item
//    (Cards/List, List/Map). Fixed width + equal (flex-1) halves so separate secondary
//    toggles render pixel-identical (no movement when switching tabs).
const VARIANTS = {
  primary: {
    track: 'inline-flex bg-neutral-100 p-1 rounded-full border border-neutral-200 shrink-0',
    item: 'px-5 py-1.5 rounded-full text-sm font-semibold transition',
    active: 'bg-accent text-white shadow-sm',
    inactive: 'text-neutral-600 hover:text-neutral-900',
  },
  secondary: {
    track: 'flex w-40 bg-neutral-100 p-1 rounded-full shrink-0',
    item: 'flex-1 px-3 py-1 rounded-full text-sm font-medium text-center transition',
    active: 'bg-white text-accent shadow-sm',
    inactive: 'text-neutral-500 hover:text-neutral-700',
  },
}

export default function SegmentedToggle({ options, value, onChange, ariaLabel, variant = 'secondary' }) {
  const v = VARIANTS[variant] || VARIANTS.secondary
  return (
    <div role="group" aria-label={ariaLabel} className={v.track}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`${v.item} ${value === o.value ? v.active : v.inactive}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
