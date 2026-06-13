function MetricCard({ metric }) {
  return (
    <div className="card text-center py-5">
      <p className="text-2xl font-bold text-blue-600">{metric.value}</p>
      <p className="text-slate-500 text-sm mt-1">{metric.label}</p>
    </div>
  )
}

function ContentCard({ icon, title, text }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed">{text}</p>
    </div>
  )
}

export default function ThesisSection({ data }) {
  const thesis = data?.thesis
  if (!thesis) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        載入中...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h2 className="section-title">論文研究</h2>

      {/* 標題卡 */}
      <div className="card bg-gradient-to-br from-slate-800 to-slate-700 border-0 text-white">
        <span className="inline-flex items-center gap-1.5 text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full px-3 py-1 mb-3">
          🎓 {thesis.conference}
        </span>
        <h3 className="text-xl font-bold leading-snug">{thesis.title}</h3>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {thesis.tech?.map(t => (
            <span key={t} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-slate-200">
              {t}
            </span>
          ))}
        </div>
        <div className="flex gap-4 mt-4">
          {thesis.proof_pdf && (
            <a href={thesis.proof_pdf} target="_blank" rel="noreferrer" className="text-sm text-blue-300 hover:text-white transition-colors">
              📄 研討會論文
            </a>
          )}
          {thesis.proof_image && (
            <a href={thesis.proof_image} target="_blank" rel="noreferrer" className="text-sm text-blue-300 hover:text-white transition-colors">
              🏅 發表證明
            </a>
          )}
        </div>
      </div>

      {/* 動機 / 方法 / 成果 */}
      <div className="space-y-4">
        <ContentCard icon="💡" title="研究動機" text={thesis.motivation} />
        <ContentCard icon="🔬" title="研究方法" text={thesis.method} />
        <ContentCard icon="📈" title="研究成果" text={thesis.results} />
      </div>

      {/* 成果數據 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {thesis.metrics?.map(m => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>
    </div>
  )
}
