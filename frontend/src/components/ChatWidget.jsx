import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

// Tailwind 的 preflight 會清掉 markdown 元素的預設樣式，
// 這裡替每個元素補上對應的 class，讓 AI 回覆的標題/清單/粗體等正常顯示。
const mdComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 last:mb-0 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 last:mb-0 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <h1 className="text-base font-bold mt-1 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-bold mt-1 mb-1.5">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mt-1 mb-1">{children}</h3>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 underline">{children}</a>
  ),
  code: ({ children }) => (
    <code className="bg-slate-100 text-slate-800 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="bg-slate-100 rounded-lg p-2 my-2 overflow-x-auto text-xs [&_code]:bg-transparent [&_code]:p-0">{children}</pre>
  ),
}

const QUICK_QUESTIONS = [
  '請自我介紹一下（請詳細介紹）',
  '有參與過哪些專案？',
  '有哪些證照或技能？',
  '有什麼特殊經歷？',
  '論文研究主題是什麼？',
]

function Message({ role, text }) {
  const isUser = role === 'user'
  return (
    <div className={`chat-bubble flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          isUser ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
        }`}
      >
        {isUser ? '我' : 'AI'}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm whitespace-pre-wrap'
            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm'
        }`}
      >
        {isUser
          ? (text || <span className="opacity-50">▌</span>)
          : (text
              ? <ReactMarkdown components={mdComponents}>{text}</ReactMarkdown>
              : <span className="opacity-50">▌</span>)}
      </div>
    </div>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTeaser, setShowTeaser] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // 進站 1.5 秒後顯示引導氣泡，10 秒後自動消失；打開過聊天就不再出現
  useEffect(() => {
    const showTimer = setTimeout(() => setShowTeaser(true), 1500)
    const hideTimer = setTimeout(() => setShowTeaser(false), 11500)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* 聊天視窗 */}
      {open && (
        <div className="chat-widget-panel w-[min(380px,calc(100vw-2.5rem))] h-[min(560px,calc(100vh-7rem))] bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 text-white flex items-center gap-2 flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="font-medium text-sm">AI 履歷助手</span>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                disabled={loading}
                className="ml-auto w-7 h-7 rounded-full hover:bg-white/15 disabled:opacity-40 transition-colors flex items-center justify-center"
                aria-label="清除對話"
                title="清除對話"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1.5 3.5h11M5.5 3.5V2a1 1 0 011-1h1a1 1 0 011 1v1.5M3 3.5l.7 8.6a1 1 0 001 .9h4.6a1 1 0 001-.9l.7-8.6" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className={`${messages.length > 0 ? '' : 'ml-auto '}w-7 h-7 rounded-full hover:bg-white/15 transition-colors flex items-center justify-center`}
              aria-label="關閉聊天視窗"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 2l10 10M12 2L2 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-2">
                <div className="text-3xl">🤖</div>
                <div>
                  <p className="text-slate-600 font-medium text-sm">你好！我是巫宇哲的 AI 助手</p>
                  <p className="text-slate-400 text-xs mt-1">可以向我詢問關於他的任何問題</p>
                </div>
                <div className="flex flex-col gap-2 w-full mt-1">
                  {QUICK_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="px-3 py-2 rounded-lg text-xs bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm"
                    >
                      {q}
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
          <div className="px-3 py-2.5 bg-white border-t border-slate-200 flex gap-2 items-end flex-shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="輸入問題..."
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 max-h-20"
              style={{ height: 'auto' }}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0 flex items-center justify-center"
              aria-label="送出"
            >
              {loading ? (
                <span className="text-xs">...</span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.5 8L14.5 1.5 11 8l3.5 6.5L1.5 8z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 引導氣泡 */}
      {showTeaser && !open && (
        <div className="chat-widget-panel bg-white rounded-2xl rounded-br-sm shadow-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 flex items-center gap-2">
          <span>問問 AI 關於我的事 👋</span>
          <button
            onClick={() => setShowTeaser(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="關閉提示"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l8 8M10 2L2 10" />
            </svg>
          </button>
        </div>
      )}

      {/* 浮動按鈕 */}
      <button
        onClick={() => { setOpen(o => !o); setShowTeaser(false) }}
        className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        aria-label={open ? '關閉 AI 助手' : '開啟 AI 助手'}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 7.5l5 5 5-5" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.5 3 2 6.9 2 11.7c0 2.5 1.2 4.7 3.2 6.3-.1.9-.5 2.3-1.5 3.5 0 0 2.6-.3 4.5-1.6 1.2.4 2.5.6 3.8.6 5.5 0 10-3.9 10-8.8S17.5 3 12 3z" />
            <circle cx="8" cy="11.7" r="1.2" fill="#fff" />
            <circle cx="12" cy="11.7" r="1.2" fill="#fff" />
            <circle cx="16" cy="11.7" r="1.2" fill="#fff" />
          </svg>
        )}
      </button>
    </div>
  )
}
