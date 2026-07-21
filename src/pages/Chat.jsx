import { useEffect, useRef, useState, useCallback } from 'react'
import { MessageSquare, Send, Loader2, Bot, User as UserIcon, Sparkles } from 'lucide-react'

const suggestedQuestions = ['What does high cholesterol mean?','Explain my blood test results','What foods help lower blood pressure?','What is the difference between HDL and LDL?']

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = useCallback(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [])
  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const sendMessage = async (text) => {
    const content = text || input.trim()
    if (!content || loading) return
    const userMsg = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      // TODO: replace this with a real API call to your AI backend
      await new Promise((resolve) => setTimeout(resolve, 800))
      const assistantMsg = { role: 'assistant', content: `(placeholder response) You asked: "${content}"` }
      setMessages([...newMessages, assistantMsg])
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `I encountered an error: ${err.message}. Please try again.` }])
    } finally {
      setLoading(false)
    }
  }

  return (
   <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-3xl flex-col animate-fade-in">
      <div className="card flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50"><Sparkles className="h-4 w-4 text-teal-600" /></div>
            <div><h2 className="font-semibold text-slate-800">AI Health Assistant</h2><p className="text-xs text-slate-400">Ask about your reports or health questions</p></div>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50"><Bot className="h-8 w-8 text-teal-600" /></div>
              <div><h3 className="font-semibold text-slate-700">How can I help you today?</h3><p className="mt-1 text-sm text-slate-500">Ask me about your medical reports, lab results, or general health questions.</p></div>
              <div className="mt-2 grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestedQuestions.map((q) => <button key={q} onClick={() => sendMessage(q)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm text-slate-600 transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700">{q}</button>)}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-teal-100' : 'bg-teal-50'}`}>{msg.role === 'user' ? <UserIcon className="h-4 w-4 text-teal-700" /> : <Bot className="h-4 w-4 text-teal-600" />}</div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'}`}><p className="whitespace-pre-wrap">{msg.content}</p></div>
            </div>
          ))}
          {loading && <div className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50"><Bot className="h-4 w-4 text-teal-600" /></div><div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-4 py-3"><div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div><div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div><div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div></div></div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-slate-100 p-4">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="flex items-end gap-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} placeholder="Type your health question…" rows={1} className="input-field max-h-32 flex-1 resize-none" disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary h-[44px] w-[44px] !px-0">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
          </form>
          <p className="mt-2 text-center text-xs text-slate-400">AI responses are for informational purposes only. Always consult a healthcare professional.</p>
        </div>
      </div>
    </div>
  )
}