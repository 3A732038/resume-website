import { useState, useEffect } from 'react'
import ResumeSection from './components/ResumeSection'
import ProjectsSection from './components/ProjectsSection'
import AIAssistant from './components/AIAssistant'

const TABS = [
  { id: 'resume', label: '履歷資料' },
  { id: 'projects', label: '專案展示' },
  { id: 'ai', label: 'AI 小助手' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('resume')
  const [resumeData, setResumeData] = useState(null)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetch('/api/resume').then(r => r.json()).then(setResumeData)
    fetch('/api/projects').then(r => r.json()).then(setProjects)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <header className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-8">
          <img
            src={encodeURI("/assets/頭貼.jpg")}
            alt="巫宇哲"
            className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-400 ring-offset-4 ring-offset-slate-800 flex-shrink-0"
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2">巫宇哲</h1>
            <p className="text-blue-300 text-lg mb-4">
              {resumeData?.title ?? '軟體工程師 | AI 愛好者 | 數據分析師'}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-300">
              {resumeData?.email && (
                <a href={`mailto:${resumeData.email}`} className="hover:text-white transition-colors">
                  📧 {resumeData.email}
                </a>
              )}
              {resumeData?.phone && (
                <span>📱 {resumeData.phone}</span>
              )}
              {resumeData?.github && (
                <a href={resumeData.github} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  🐙 GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active text-white border-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {activeTab === 'resume' && <ResumeSection data={resumeData} />}
        {activeTab === 'projects' && <ProjectsSection projects={projects} />}
        {activeTab === 'ai' && <AIAssistant />}
      </main>

      <footer className="text-center py-6 text-slate-400 text-sm border-t border-slate-200">
        © 2024 巫宇哲. All rights reserved.
      </footer>
    </div>
  )
}
