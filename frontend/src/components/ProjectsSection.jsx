import { useState } from 'react'

function TechBadge({ tech }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
      {tech}
    </span>
  )
}

function AttendanceProject({ project }) {
  return (
    <div className="space-y-4">
      <p className="text-slate-600 text-sm leading-relaxed">
        <strong>動機與目的：</strong>{project.motivation}
      </p>
      <p className="text-slate-600 text-sm leading-relaxed">{project.description}</p>
      {project.images?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.images.map((img, i) => (
            <div key={i}>
              <p className="text-xs text-slate-500 mb-1">{project.image_captions?.[i]}</p>
              <img src={img} alt={project.image_captions?.[i]} className="rounded-lg border border-slate-200 w-full object-cover" />
            </div>
          ))}
        </div>
      )}
      {project.github && (
        <a href={project.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
          🐙 查看 GitHub 專案
        </a>
      )}
    </div>
  )
}

function EETProject({ project }) {
  const [selected, setSelected] = useState(0)
  const ex = project.examples?.[selected]

  return (
    <div className="space-y-4">
      <p className="text-slate-600 text-sm leading-relaxed">
        <strong>動機與目的：</strong>{project.motivation}
      </p>
      <p className="text-slate-600 text-sm leading-relaxed">{project.description}</p>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">選擇範例：</label>
        <div className="flex gap-2 mb-4">
          {project.examples?.map((ex, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selected === i ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {ex.label}
            </button>
          ))}
        </div>
        {ex && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">原始 X-ray 影像</p>
              <img src={ex.init} alt="init" className="rounded-lg border border-slate-200 w-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">預測的 Mask</p>
              <img src={ex.pred} alt="pred" className="rounded-lg border border-slate-200 w-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">真實 Mask</p>
              <img src={ex.label_img} alt="label" className="rounded-lg border border-slate-200 w-full object-cover" />
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        {project.doc_pdf && (
          <a href={project.doc_pdf} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
            📄 成果文件
          </a>
        )}
        {project.github && (
          <a href={project.github} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
            🐙 GitHub
          </a>
        )}
      </div>
    </div>
  )
}

function LicenseProject({ project }) {
  return (
    <div className="space-y-4">
      <p className="text-slate-600 text-sm leading-relaxed">
        <strong>動機與目的：</strong>{project.motivation}
      </p>
      <p className="text-slate-600 text-sm leading-relaxed">{project.description}</p>
      {project.video_result && (
        <div>
          <p className="text-xs text-slate-500 mb-2">車牌辨識成果影片</p>
          <video
            src={project.video_result}
            controls
            className="rounded-lg border border-slate-200 w-full max-w-lg"
          />
        </div>
      )}
      <div className="flex gap-4">
        {project.doc_pdf && (
          <a href={project.doc_pdf} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
            📄 成果文件
          </a>
        )}
        {project.github && (
          <a href={project.github} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
            🐙 GitHub
          </a>
        )}
      </div>
    </div>
  )
}

function MiscProject({ project }) {
  return (
    <div className="space-y-4">
      <p className="text-slate-600 text-sm leading-relaxed">{project.motivation}</p>
      <div className="space-y-4">
        {project.sub_projects?.map((sub, i) => (
          <div key={i} className="pl-4 border-l-2 border-blue-200">
            <h4 className="font-semibold text-slate-700 text-sm">{sub.name}</h4>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">{sub.detail}</p>
            <div className="flex gap-3 mt-2">
              {sub.dataset_url && (
                <a href={sub.dataset_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                  📊 資料集
                </a>
              )}
              {sub.doc_pdf && (
                <a href={sub.doc_pdf} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                  📄 文件
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectCard({ project }) {
  const [open, setOpen] = useState(false)

  const renderContent = () => {
    switch (project.id) {
      case 'attendance': return <AttendanceProject project={project} />
      case 'eet': return <EETProject project={project} />
      case 'license': return <LicenseProject project={project} />
      case 'ml-misc': return <MiscProject project={project} />
      default: return (
        <div className="space-y-3">
          <p className="text-slate-600 text-sm leading-relaxed">
            <strong>動機與目的：</strong>{project.motivation}
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">{project.description}</p>
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
              🐙 GitHub
            </a>
          )}
        </div>
      )
    }
  }

  return (
    <div className="card mb-6">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-lg">{project.title}</h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {project.tech?.map(t => <TechBadge key={t} tech={t} />)}
          </div>
        </div>
        <span className="text-slate-400 text-xl ml-4 flex-shrink-0">
          {open ? '▲' : '▼'}
        </span>
      </div>
      {open && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          {renderContent()}
        </div>
      )}
    </div>
  )
}

export default function ProjectsSection({ projects }) {
  if (!projects.length) {
    return <div className="flex items-center justify-center h-48 text-slate-400">載入中...</div>
  }

  return (
    <div>
      <h2 className="section-title">專案展示</h2>
      {projects.map(p => <ProjectCard key={p.id} project={p} />)}
    </div>
  )
}
