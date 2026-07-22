import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Send, Loader2, Bot, User as UserIcon, Sparkles, ArrowLeft, Plus, Copy, Check, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react'

const suggestedQuestions = ['What does high cholesterol mean?','Explain my blood test results','What foods help lower blood pressure?','What is the difference between HDL and LDL?']
const MAX_CHARS = 1000

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// Very small markdown renderer: supports **bold** and "- " bullet lines
function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let listBuffer = []

  const flushList = (key) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="my-1 list-disc space-y-1 pl-5">
          {listBuffer.map((item, idx) => <li key={idx}>{renderInline(item)}</li>)}
        </ul>
      )
      listBuffer = []
    }
  }

  function renderInline(str) {
    const parts = str.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, idx) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={idx} className="font-semibold">{part.slice(2, -2)}</strong>
        : <span key={idx}>{part}</span>
    )
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listBuffer.push(trimmed.slice(2))
    } else {
      flushList(i)
      if (trimmed.length > 0) {
        elements.push(<p key={i} className="whitespace-pre-wrap">{renderInline(line)}</p>)
      }
    }
  })
  flushList('end')

  return elements
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [feedback, setFeedback] = useState({})
  const messagesEndRef = useRef(null)

  const scrollToBottom = useCallback(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [])
  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const generateResponse = async (content, history) => {
    // TODO: replace this with a real API call to your AI backend
    await new Promise((resolve) => setTimeout(resolve, 800))
    return `(placeholder response) You asked: "${content}"\n\nHere's a quick breakdown:\n- **Key point one** about your question\n- **Key point two** with more detail\n- A general recommendation to discuss with your doctor`
  }

  const sendMessage = async (text) => {
    const content = text || input.trim()
    if (!content || loading) return
    const userMsg = { role: 'user', content, time: new Date() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const responseText = await generateResponse(content, newMessages)
      const assistantMsg = { role: 'assistant', content: responseText, time: new Date() }
      setMessages([...newMessages, assistantMsg])
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `I encountered an error: ${err.message}. Please try again.`, time: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const regenerateResponse = async (assistantIndex) => {
    if (loading) return
    const userMsg = messages[assistantIndex - 1]
    if (!userMsg || userMsg.role !== 'user') return
    setLoading(true)
    try {
      const responseText = await generateResponse(userMsg.content, messages.slice(0, assistantIndex))
      const updated = [...messages]
      updated[assistantIndex] = { role: 'assistant', content: responseText, time: new Date() }
      setMessages(updated)
      setFeedback((prev) => ({ ...prev, [assistantIndex]: null }))
    } catch (err) {
      console.error('Regenerate failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1500)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleFeedback = (index, value) => {
    setFeedback((prev) => ({ ...prev, [index]: prev[index] === value ? null : value }))
  }

  const startNewChat = () => {
    setMessages([])
    setInput('')
    setFeedback({})
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-6rem)] sm:h-[calc(100dvh-8rem)] max-w-3xl flex-col animate-fade-in px-4 sm:px-0">
      <div className="mb-2 flex items-center justify-between sm:mb-3">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-700">
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to Dashboard</span>
        </Link>
        {messages.length > 0 && (
          <button onClick={startNewChat} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-teal-700">
            <Plus className="h-4 w-4" /> New Chat
          </button>
        )}
      </div>

      <div className="card flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50"><Sparkles className="h-4 w-4 text-teal-600" /></div>
            <div><h2 className="font-semibold text-slate-800">AI Health Assistant</h2><p className="text-xs text-slate-400">Ask about your reports or health questions</p></div>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50"><Bot className="h-8 w-8 text-teal-600" /></div>
              <div><h3 className="font-semibold text-slate-700">How can I help you today?</h3><p className="mt-1 text-sm text-slate-500">Ask me about your medical reports, lab results, or general health questions.</p></div>
              <div className="mt-2 grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestedQuestions.map((q) => <button key={q} onClick={() => sendMessage(q)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm text-slate-600 transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700">{q}</button>)}
              </div>
            </div>
          )}
          {messages.map((msg, i) => {
            const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1
            return (
              <div key={i} className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-teal-100' : 'bg-teal-50'}`}>{msg.role === 'user' ? <UserIcon className="h-4 w-4 text-teal-700" /> : <Bot className="h-4 w-4 text-teal-600" />}</div>
                <div className={`group flex max-w-[85%] sm:max-w-[75%] flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : <p className="whitespace-pre-wrap">{msg.content}</p>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 px-1">
                    {msg.time && <span className="text-[10px] text-slate-400">{formatTime(msg.time)}</span>}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-0">
                        <button onClick={() => handleCopy(msg.content, i)} title="Copy response">
                          {copiedIndex === i ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-slate-400 hover:text-slate-600" />}
                        </button>
                        {isLastAssistant && (
                          <button onClick={() => regenerateResponse(i)} title="Regenerate response" disabled={loading}>
                            <RotateCcw className="h-3 w-3 text-slate-400 hover:text-slate-600" />
                          </button>
                        )}
                        <button onClick={() => handleFeedback(i, 'up')} title="Good response">
                          <ThumbsUp className={`h-3 w-3 ${feedback[i] === 'up' ? 'fill-teal-600 text-teal-600' : 'text-slate-400 hover:text-slate-600'}`} />
                        </button>
                        <button onClick={() => handleFeedback(i, 'down')} title="Poor response">
                          <ThumbsDown className={`h-3 w-3 ${feedback[i] === 'down' ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-slate-600'}`} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {loading && <div className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50"><Bot className="h-4 w-4 text-teal-600" /></div><div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-4 py-3"><div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div><div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div><div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div></div></div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-slate-100 p-3 sm:p-4">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Type your health question…"
              rows={1}
              className="input-field max-h-32 flex-1 resize-none"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary h-[44px] w-[44px] shrink-0 !px-0">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
          </form>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-center text-xs text-slate-400">AI responses are for informational purposes only. Always consult a healthcare professional.</p>
            {input.length > MAX_CHARS * 0.8 && (
              <span className={`shrink-0 pl-2 text-xs ${input.length >= MAX_CHARS ? 'text-rose-500' : 'text-slate-400'}`}>{input.length}/{MAX_CHARS}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}