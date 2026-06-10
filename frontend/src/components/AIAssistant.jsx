import { useState, useRef, useEffect } from 'react'

const EXAMPLES = [
  '請自我介紹一下（請詳細介紹）',
  '有參與過哪些專案？',
  '有哪些證照或技能？',
  '有什麼特殊經歷？',
  '論文研究主題是什麼？',
]

function Message({ role, text }) {
  const isUser = role === 'user'
  return (
    <div className={`chat-bubble flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          isUser ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
        }`}
      >
        {isUser ? '我' : 'AI'}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm'
        }`}
      >
        {text || <span className="opacity-50">▌</span>}
      </div>
    </div>
  )
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return
    const userMsg = text.trim()
    setInput('')
    setLoading(true)

    const history = messages.map((m, i) => {
      if (m.role === 'user') {
        const next = messages[i + 1]
        return next?.role === 'assistant' ? { user: m.text, assistant: next.text } : null
      }
      return null
    }).filter(Boolean)

    setMessages(prev => [...prev, { role: 'user', text: userMsg }, { role: 'assistant', text: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history }),
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const { text } = JSON.parse(data)
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                text: updated[updated.length - 1].text + text,
              }
              return updated
            })
          } catch {}
        }
      }
    } catch (e) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { ...updated[updated.length - 1], text: '發生錯誤，請稍後再試。' }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div>
      <h2 className="section-title">AI 履歷助手</h2>
      <div className="card p-0 overflow-hidden flex flex-col" style={{ height: '70vh' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 text-white text-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="font-medium">巫宇哲的 AI 個人助手</span>
          <span className="text-slate-400 text-xs ml-auto">使用 RAG 技術 · 基於個人履歷資料</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="text-4xl">🤖</div>
              <div>
                <p className="text-slate-600 font-medium">你好！我是巫宇哲的 AI 助手</p>
                <p className="text-slate-400 text-sm mt-1">可以向我詢問關於他的任何問題</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {EXAMPLES.map(ex => (
                  <button
                    key={ex}
                    onClick={() => sendMessage(ex)}
                    className="px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <Message key={i} role={msg.role} text={msg.text} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-slate-200 flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="輸入問題，按 Enter 送出（Shift+Enter 換行）"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 max-h-24"
            style={{ height: 'auto' }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {loading ? '...' : '送出'}
          </button>
        </div>
      </div>
    </div>
  )
}
