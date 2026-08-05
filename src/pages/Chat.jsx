import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  MessageSquare, Send, Loader2, Bot, User as UserIcon, Sparkles, ArrowLeft,
  Plus, Copy, Check, RotateCcw, ThumbsUp, ThumbsDown, History, X as CloseIcon,
  Trash2, Paperclip, Image as ImageIcon,
} from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

const suggestedQuestions = [
  'What does high cholesterol mean?',
  'Explain my blood test results',
  'What foods help lower blood pressure?',
  'What is the difference between HDL and LDL?',
]

const MAX_CHARS = 1000
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
]

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let listBuffer = []

  const flushList = (key) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="my-1 list-disc space-y-1 pl-5">
          {listBuffer.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      )
      listBuffer = []
    }
  }

  function renderInline(str) {
    const parts = str.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, idx) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={idx} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={idx}>{part}</span>
      )
    )
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listBuffer.push(trimmed.slice(2))
    } else {
      flushList(i)
      if (trimmed.length > 0) {
        elements.push(
          <p key={i} className="whitespace-pre-wrap">
            {renderInline(line)}
          </p>
        )
      }
    }
  })
  flushList('end')

  return elements
}

export default function Chat() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [feedback, setFeedback] = useState({})
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState([])
  const [filePreview, setFilePreview] = useState(null)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    const fromReport = searchParams.get('fromReport')
    if (!fromReport) return
    const stored = sessionStorage.getItem('reportContext')
    if (!stored) return
    try {
      const ctx = JSON.parse(stored)
      const intro = `I just uploaded a report called "${ctx.fileName}". Here's what the analysis found:\n\nSummary: ${ctx.summary}\n\n${
        ctx.healthInsights ? `Health Insights: ${ctx.healthInsights}\n\n` : ''
      }Can you help me understand this better and answer any follow-up questions?`
      sendMessage(intro)
      sessionStorage.removeItem('reportContext')
    } catch (err) {
      console.error('Failed to load report context:', err)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateResponse = async (content, historyMsgs) => {
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        messages: [...historyMsgs, { role: 'user', content }],
      }),
    })
    if (!response.ok) throw new Error(`Request failed (${response.status})`)
    const data = await response.json()
    if (data.error) throw new Error(data.error)
    return data.message
  }

  const saveToHistory = async (userContent, assistantContent) => {
    if (!user?.id) return
    try {
      await supabase.from('chat_messages').insert([
        { user_id: user.id, role: 'user', content: userContent },
        { user_id: user.id, role: 'assistant', content: assistantContent },
      ])
    } catch (err) {
      console.error('Failed to save chat history:', err)
    }
  }

  const loadHistory = async () => {
    if (!user?.id) return
    setHistoryLoading(true)
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, content, created_at')
      .eq('user_id', user.id)
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(30)
    if (error) console.error('Failed to load history:', error)
    setHistory(data || [])
    setHistoryLoading(false)
  }

  /** Permanently delete one past question + nearby assistant reply */
  const deleteHistoryItem = async (item) => {
    if (!user?.id || !item) return
    if (!window.confirm('Delete this conversation permanently? This cannot be undone.')) return

    try {
      // Prefer delete by id when available
      if (item.id) {
        const { error: userErr } = await supabase
          .from('chat_messages')
          .delete()
          .eq('user_id', user.id)
          .eq('id', item.id)
        if (userErr) throw userErr
      } else {
        const { error: userErr } = await supabase
          .from('chat_messages')
          .delete()
          .eq('user_id', user.id)
          .eq('role', 'user')
          .eq('content', item.content)
          .eq('created_at', item.created_at)
        if (userErr) throw userErr
      }

      // Remove assistant replies created shortly after this question
      if (item.created_at) {
        const start = new Date(item.created_at).toISOString()
        const end = new Date(new Date(item.created_at).getTime() + 2 * 60 * 1000).toISOString()
        await supabase
          .from('chat_messages')
          .delete()
          .eq('user_id', user.id)
          .eq('role', 'assistant')
          .gte('created_at', start)
          .lte('created_at', end)
      }

      setHistory((prev) =>
        prev.filter((h) => (item.id ? h.id !== item.id : h.created_at !== item.created_at))
      )
    } catch (err) {
      console.error('Failed to delete history item:', err)
      alert('Failed to delete. Please try again.')
    }
  }

  /** Permanently delete ALL chat history for this user */
  const deleteAllHistory = async () => {
    if (!user?.id) return
    if (
      !window.confirm(
        'Permanently delete ALL chat history? This cannot be undone.'
      )
    ) {
      return
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id)
      if (error) throw error
      setHistory([])
    } catch (err) {
      console.error('Failed to delete history:', err)
      alert('Failed to delete chat history. Please try again.')
    }
  }

  const toggleHistory = () => {
    setShowHistory((prev) => {
      const next = !prev
      if (next) loadHistory()
      return next
    })
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])

    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" is too large. Maximum size is 5MB.`)
        return false
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert(
          `File "${file.name}" has an unsupported format. Allowed: images (JPEG, PNG, GIF, WebP), PDF, and text.`
        )
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setAttachedFiles((prev) => [...prev, ...validFiles])

      if (validFiles[0].type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setFilePreview({
            type: 'image',
            src: event.target.result,
            name: validFiles[0].name,
          })
        }
        reader.readAsDataURL(validFiles[0])
      } else if (validFiles[0].type === 'application/pdf') {
        setFilePreview({ type: 'pdf', name: validFiles[0].name })
      } else {
        setFilePreview({ type: 'file', name: validFiles[0].name })
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachedFile = (index) => {
    const newFiles = attachedFiles.filter((_, i) => i !== index)
    setAttachedFiles(newFiles)
    if (newFiles.length === 0) {
      setFilePreview(null)
    } else if (filePreview && attachedFiles[index]?.name === filePreview.name) {
      if (newFiles[0].type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setFilePreview({
            type: 'image',
            src: event.target.result,
            name: newFiles[0].name,
          })
        }
        reader.readAsDataURL(newFiles[0])
      } else if (newFiles[0].type === 'application/pdf') {
        setFilePreview({ type: 'pdf', name: newFiles[0].name })
      } else {
        setFilePreview({ type: 'file', name: newFiles[0].name })
      }
    }
  }

  const sendMessage = async (text) => {
    const content = text || input.trim()
    if ((!content && attachedFiles.length === 0) || loading) return

    let messageContent = content
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map((f) => f.name).join(', ')
      messageContent = `${content}${content ? '\n\n' : ''}[Attached files: ${fileNames}]`
    }

    const userMsg = {
      role: 'user',
      content: messageContent,
      time: new Date(),
      files: attachedFiles,
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setAttachedFiles([])
    setFilePreview(null)
    setLoading(true)

    try {
      const responseText = await generateResponse(content || messageContent, newMessages)
      const assistantMsg = { role: 'assistant', content: responseText, time: new Date() }
      setMessages([...newMessages, assistantMsg])
      await saveToHistory(messageContent, responseText)
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `I encountered an error: ${err.message}. Please try again.`,
          time: new Date(),
        },
      ])
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
      const responseText = await generateResponse(
        userMsg.content,
        messages.slice(0, assistantIndex)
      )
      const updated = [...messages]
      updated[assistantIndex] = {
        role: 'assistant',
        content: responseText,
        time: new Date(),
      }
      setMessages(updated)
      setFeedback((prev) => ({ ...prev, [assistantIndex]: null }))
      await saveToHistory(userMsg.content, responseText)
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
    setFeedback((prev) => ({
      ...prev,
      [index]: prev[index] === value ? null : value,
    }))
  }

  const startNewChat = () => {
    setMessages([])
    setInput('')
    setFeedback({})
    setAttachedFiles([])
    setFilePreview(null)
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-6rem)] md:h-[calc(100dvh-8rem)] w-full max-w-4xl flex-col animate-fade-in px-3 sm:px-4 md:px-0">
      {/* Top bar */}
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:mb-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleHistory}
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-teal-700 transition-colors"
          >
            <History className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">History</span>
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={startNewChat}
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-teal-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="mb-2 sm:mb-3 max-h-48 sm:max-h-56 overflow-y-auto rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-3 shadow-lg animate-fade-in">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-400">
              Past Questions
            </p>
            <div className="flex items-center gap-1 sm:gap-1.5">
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={deleteAllHistory}
                  title="Delete all history permanently"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] sm:text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Delete all</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <CloseIcon className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
          </div>

          {historyLoading ? (
            <div className="space-y-1.5 sm:space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 sm:h-8 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="py-2 text-center text-xs sm:text-sm text-slate-400">
              No past questions yet.
            </p>
          ) : (
            <div className="space-y-0.5 sm:space-y-1">
              {history.map((h, i) => (
                <div
                  key={h.id || `${h.created_at}-${i}`}
                  className="group flex items-center gap-1 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setInput(h.content)
                      setShowHistory(false)
                    }}
                    className="min-w-0 flex-1 truncate px-2 sm:px-2.5 py-1 sm:py-1.5 text-left text-xs sm:text-sm text-slate-600"
                  >
                    {h.content}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteHistoryItem(h)}
                    title="Delete permanently"
                    className="shrink-0 rounded-md p-1.5 text-slate-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat card */}
      <div className="card flex flex-1 flex-col overflow-hidden rounded-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-teal-50">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-slate-800 truncate">
                AI Health Assistant
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Ask about your reports or health questions
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto p-3 sm:p-4 md:p-5 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 sm:gap-4 text-center px-2">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-teal-50">
                <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-700">
                  How can I help you today?
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Ask me about your medical reports, lab results, or general health questions. You
                  can also attach photos or files.
                </p>
              </div>
              <div className="mt-2 w-full grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-2 sm:py-2.5 text-left text-xs sm:text-sm text-slate-600 transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1
            return (
              <div
                key={i}
                className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full ${
                    msg.role === 'user' ? 'bg-teal-100' : 'bg-teal-50'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-teal-700" />
                  ) : (
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600" />
                  )}
                </div>
                <div
                  className={`group flex max-w-[85%] sm:max-w-sm md:max-w-md lg:max-w-lg flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`rounded-lg sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm leading-relaxed break-words ${
                      msg.role === 'user'
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      renderMarkdown(msg.content)
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>

                  {msg.role === 'user' && msg.files && msg.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-teal-50 rounded-lg px-2.5 py-1.5 text-xs"
                        >
                          {file.type?.startsWith('image/') ? (
                            <ImageIcon className="h-3.5 w-3.5 text-teal-600" />
                          ) : (
                            <Paperclip className="h-3.5 w-3.5 text-teal-600" />
                          )}
                          <span className="text-teal-700 truncate max-w-[120px]">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 px-1">
                    {msg.time && (
                      <span className="text-[9px] sm:text-[10px] text-slate-400">
                        {formatTime(msg.time)}
                      </span>
                    )}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.content, i)}
                          title="Copy response"
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          {copiedIndex === i ? (
                            <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 hover:text-slate-600" />
                          )}
                        </button>
                        {isLastAssistant && (
                          <button
                            type="button"
                            onClick={() => regenerateResponse(i)}
                            title="Regenerate response"
                            disabled={loading}
                            className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 hover:text-slate-600" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleFeedback(i, 'up')}
                          title="Good response"
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <ThumbsUp
                            className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                              feedback[i] === 'up'
                                ? 'fill-teal-600 text-teal-600'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback(i, 'down')}
                          title="Poor response"
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <ThumbsDown
                            className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                              feedback[i] === 'down'
                                ? 'fill-rose-500 text-rose-500'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {loading && (
            <div className="flex gap-2 sm:gap-3">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-teal-50">
                <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600" />
              </div>
              <div className="flex items-center gap-1 rounded-lg sm:rounded-2xl bg-slate-100 px-3 sm:px-4 py-2 sm:py-3">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-slate-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* File preview */}
        {filePreview && (
          <div className="border-t border-slate-100 bg-slate-50 p-2.5 sm:p-3">
            <div className="flex items-start gap-2">
              {filePreview.type === 'image' ? (
                <img
                  src={filePreview.src}
                  alt="preview"
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : filePreview.type === 'pdf' ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-red-100">
                  <span className="text-xs font-bold text-red-600">PDF</span>
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-200">
                  <Paperclip className="h-6 w-6 text-slate-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                  {filePreview.name}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                  {attachedFiles.length} file(s) attached
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeAttachedFile(0)}
                className="p-1 hover:bg-slate-200 rounded transition-colors flex-shrink-0"
              >
                <CloseIcon className="h-4 w-4 text-slate-500 hover:text-slate-700" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-slate-100 p-2.5 sm:p-3 md:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex items-end gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,.pdf,.txt"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title="Attach file or photo"
              className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 hover:text-teal-700" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Type your health question…"
              rows={1}
              className="input-field max-h-32 flex-1 resize-none text-xs sm:text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || (!input.trim() && attachedFiles.length === 0)}
              className="btn-primary h-10 w-10 sm:h-11 sm:w-11 shrink-0 !px-0 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </form>
          <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2">
            <p className="text-center sm:text-left text-[10px] sm:text-xs text-slate-400 flex-1">
              AI responses are for informational purposes only. Always consult a healthcare
              professional.
            </p>
            {input.length > MAX_CHARS * 0.8 && (
              <span
                className={`shrink-0 text-[10px] sm:text-xs whitespace-nowrap ${
                  input.length >= MAX_CHARS ? 'text-rose-500' : 'text-slate-400'
                }`}
              >
                {input.length}/{MAX_CHARS}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}