export default function Chip({ active, children, onClick, disabled }) {
  const base = 'px-3 py-1.5 rounded-full text-sm border transition select-none'
  const cls = active
    ? 'bg-accent text-white border-accent'
    : disabled
      ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
      : 'bg-white text-neutral-700 border-neutral-300 hover:border-accent'
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`${base} ${cls}`}>
      {children}
    </button>
  )
}
