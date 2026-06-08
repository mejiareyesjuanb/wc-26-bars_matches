// A compact two-or-more segmented toggle with a fixed total width and equal-width
// segments (flex-1). Fixed width keeps separate toggles (e.g. Matches Cards/List and
// Bars List/Map) pixel-identical regardless of label length or language, so switching
// tabs shows no toggle "movement".
export default function SegmentedToggle({ options, value, onChange, ariaLabel }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex w-40 rounded-lg border border-neutral-300 overflow-hidden text-sm shrink-0"
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`flex-1 px-3 py-1 text-center ${value === o.value ? 'bg-accent text-white' : 'bg-white text-neutral-600'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
