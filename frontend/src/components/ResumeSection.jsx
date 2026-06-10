import { useState } from 'react'

function SkillBadge({ skill }) {
  return (
    <span className="badge">{skill}</span>
  )
}

function ExperienceCard({ exp }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 text-base">{exp.title}</h3>
          <p className="text-slate-500 text-sm mt-1">{exp.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {exp.proof_image && (
            <a
              href={exp.proof_image}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              證明圖片
            </a>
          )}
          {exp.proof_pdf && (
            <a
              href={exp.proof_pdf}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              相關文件
            </a>
          )}
          <button
            onClick={() => setOpen(v => !v)}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded border border-slate-200 hover:border-slate-300 transition-colors"
          >
            {open ? '收起' : '詳情'}
          </button>
        </div>
      </div>
      {open && (
        <p className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
          {exp.detail}
        </p>
      )}
    </div>
  )
}

function CertRow({ cert }) {
  const [imgOpen, setImgOpen] = useState(false)

  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
        <td className="py-3 px-4 text-sm font-medium text-slate-700">{cert.name}</td>
        <td className="py-3 px-4 text-sm text-slate-500">{cert.org}</td>
        <td className="py-3 px-4">
          {cert.image && (
            <button
              onClick={() => setImgOpen(v => !v)}
              className="text-xs text-blue-600 hover:underline"
            >
              {imgOpen ? '收起' : '查看'}
            </button>
          )}
        </td>
      </tr>
      {imgOpen && cert.image && (
        <tr className="bg-slate-50">
          <td colSpan={3} className="px-4 pb-4">
            <img
              src={cert.image}
              alt={cert.name}
              className="max-h-48 rounded-lg border border-slate-200 object-contain"
            />
          </td>
        </tr>
      )}
    </>
  )
}

export default function ResumeSection({ data }) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        載入中...
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* About */}
      <section>
        <h2 className="section-title">關於我</h2>
        <p className="text-slate-600 leading-relaxed">{data.about}</p>
      </section>

      {/* Skills */}
      <section>
        <h2 className="section-title">技能</h2>
        <div className="flex flex-wrap gap-3">
          {data.skills?.map(s => <SkillBadge key={s} skill={s} />)}
        </div>
      </section>

      {/* Experience */}
      <section>
        <h2 className="section-title">特殊經歷</h2>
        {data.experiences?.map((exp, i) => (
          <ExperienceCard key={i} exp={exp} />
        ))}
      </section>

      {/* Certificates */}
      <section>
        <h2 className="section-title">證照</h2>
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-600">證照名稱</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-600">發證機構</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-600">證照照片</th>
              </tr>
            </thead>
            <tbody>
              {data.certificates?.map((cert, i) => (
                <CertRow key={i} cert={cert} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
