export default function BarCard({ bar }) {
  const top3 = bar.rank <= 3
  return (
    <div className={`bg-white rounded-xl border p-4 flex gap-4 ${top3 ? 'border-accent shadow-sm' : 'border-neutral-200'}`}>
      <div className={`shrink-0 w-10 h-10 rounded-full grid place-items-center font-bold ${top3 ? 'bg-accent text-white' : 'bg-neutral-100 text-neutral-600'}`}>
        {bar.rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold truncate">{bar.name}</h3>
          <span className="text-sm text-neutral-500 shrink-0">{bar.score}/100</span>
        </div>
        <div className="text-sm text-neutral-500">
          {bar.type} · {bar.neighborhood} · {bar.rating.toFixed(1)}★ ({bar.reviewCount})
        </div>
        <p className="text-sm text-neutral-600 mt-1">{bar.blurb}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {bar.reasons.map((r, i) => (
            <span key={i} className="text-xs bg-neutral-100 text-neutral-700 rounded-full px-2 py-0.5">{r}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
