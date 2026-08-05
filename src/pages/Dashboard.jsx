import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity, FileText, Upload, MessageSquare, Stethoscope, Calendar,
  HeartPulse, Brain, Wind, Eye, Ear, Utensils, ChevronRight, Plus,
  Clock, CheckCircle2, ArrowRight, Lightbulb, Sun, Moon, Sunrise,
  ShieldCheck, Sparkles, AlertCircle,
} from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

const bodyPartsBase = [
  {
    id: 'heart',
    title: 'Heart Health',
    icon: HeartPulse,
    color: 'from-rose-500 to-coral-500',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    ring: 'ring-rose-400',
    image: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop',
    keys: ['heart', 'cardio', 'cardiovascular', 'blood pressure', 'cholesterol'],
    defaultTips: [
      'Maintain 30 min of cardio daily',
      'Limit sodium to under 2g per day',
      'Include omega-3 rich foods in your diet',
    ],
  },
  {
    id: 'brain',
    title: 'Brain & Nervous System',
    icon: Brain,
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    ring: 'ring-violet-400',
    image: 'https://images.pexels.com/photos/8433425/pexels-photo-8433425.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop',
    keys: ['brain', 'neuro', 'cognitive', 'sleep', 'stress', 'nervous'],
    defaultTips: [
      'Practice mindfulness 10 min daily',
      'Ensure 7-8 hours of quality sleep',
      'Challenge your brain with puzzles or reading',
    ],
  },
  {
    id: 'lungs',
    title: 'Lung & Respiratory',
    icon: Wind,
    color: 'from-sky-500 to-cyan-500',
    bg: 'bg-sky-50',
    text: 'text-sky-600',
    ring: 'ring-sky-400',
    image: 'https://images.pexels.com/photos/4226259/pexels-photo-4226259.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop',
    keys: ['lung', 'respiratory', 'oxygen', 'breathing', 'chest'],
    defaultTips: [
      'Practice deep breathing exercises',
      'Avoid smoke and polluted environments',
      'Stay active to improve lung capacity',
    ],
  },
  {
    id: 'stomach',
    title: 'Digestive Health',
    icon: Utensils,
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    ring: 'ring-amber-400',
    image: 'https://images.pexels.com/photos/5938358/pexels-photo-5938358.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop',
    keys: ['digest', 'stomach', 'gut', 'liver', 'abdomen', 'gi'],
    defaultTips: [
      'Eat 25-30g of fiber daily',
      'Include probiotic-rich foods like yogurt',
      'Stay hydrated throughout the day',
    ],
  },
  {
    id: 'eyes',
    title: 'Eye & Vision',
    icon: Eye,
    color: 'from-teal-500 to-emerald-500',
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    ring: 'ring-teal-400',
    image: 'https://images.pexels.com/photos/5996689/pexels-photo-5996689.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop',
    keys: ['eye', 'vision', 'retina', 'ocular'],
    defaultTips: [
      'Follow the 20-20-20 rule for screen breaks',
      'Wear UV-protective sunglasses outdoors',
      'Schedule annual eye exams',
    ],
  },
  {
    id: 'ear',
    title: 'Ear & Hearing',
    icon: Ear,
    color: 'from-indigo-500 to-blue-500',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    ring: 'ring-indigo-400',
    image: 'https://images.pexels.com/photos/5206951/pexels-photo-5206951.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop',
    keys: ['ear', 'hearing', 'audio', 'otolaryng'],
    defaultTips: [
      'Limit exposure to loud noises',
      'Use ear protection in noisy environments',
      'Clean ears gently — no cotton swabs deep inside',
    ],
  },
]

const dailyTips = [
  'Staying hydrated helps regulate body temperature and supports every organ system.',
  'A 10-minute walk after meals can help stabilize blood sugar levels.',
  'Consistent sleep and wake times improve sleep quality more than total hours alone.',
  'Deep breathing for 2 minutes can lower stress hormones almost immediately.',
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good morning', icon: Sunrise }
  if (hour < 18) return { text: 'Good afternoon', icon: Sun }
  return { text: 'Good evening', icon: Moon }
}

function relativeTime(dateStr) {
  const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return `${Math.floor(days / 30)} months ago`
}

function extractReportScore(report) {
  if (!report) return null
  const candidates = [
    report.health_score,
    report.overall_score,
    report.score,
    report.analysis?.score,
    report.analysis?.health_score,
    report.analysis?.overall_score,
    report.summary?.score,
    report.result?.score,
  ]
  for (const v of candidates) {
    const n = Number(v)
    if (!Number.isNaN(n) && n >= 0 && n <= 100) return Math.round(n)
  }
  return null
}

function emptyStats() {
  return [
    { label: 'Score', value: '0%', status: 'empty' },
    { label: 'Status', value: 'No data', status: 'empty' },
    { label: 'Trend', value: '—', status: 'empty' },
  ]
}

function statusFromScore(score) {
  if (score == null || score === 0) return 'empty'
  if (score >= 80) return 'good'
  if (score >= 60) return 'normal'
  return 'poor'
}

function descriptionFromScore(title, score, hasData) {
  if (!hasData || score === 0) {
    return `No report data yet for ${title}. Upload a medical report to see your results here.`
  }
  if (score >= 80) {
    return `${title} looks good based on your latest reports (${score}%). Keep up your current habits.`
  }
  if (score >= 60) {
    return `${title} is within a moderate range (${score}%). Review your reports and tips below.`
  }
  return `${title} may need attention (${score}%). Check your latest reports and consider consulting a professional.`
}

function computeHealthFromReports(reports) {
  const completed = (reports || []).filter((r) => r.status === 'completed')

  if (completed.length === 0) {
    return {
      healthScore: 0,
      bodyParts: bodyPartsBase.map((bp) => ({
        ...bp,
        score: 0,
        hasData: false,
        description: descriptionFromScore(bp.title, 0, false),
        stats: emptyStats(),
        tips: bp.defaultTips,
      })),
    }
  }

  const reportScores = completed.map(extractReportScore).filter((s) => s != null)
  let healthScore = 0
  if (reportScores.length > 0) {
    healthScore = Math.round(reportScores.reduce((a, b) => a + b, 0) / reportScores.length)
  } else {
    healthScore = Math.min(100, 35 + completed.length * 12)
  }

  const bodyParts = bodyPartsBase.map((bp) => {
    const matched = completed.filter((r) => {
      const hay = [
        r.service_category,
        r.file_name,
        r.analysis?.summary,
        r.analysis?.category,
        r.body_system,
        JSON.stringify(r.analysis || {}),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return bp.keys.some((k) => hay.includes(k))
    })

    let partScore = 0
    let hasData = false

    if (matched.length > 0) {
      const scores = matched.map(extractReportScore).filter((s) => s != null)
      if (scores.length > 0) {
        partScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        hasData = true
      } else {
        partScore = healthScore
        hasData = true
      }
    }

    const status = statusFromScore(hasData ? partScore : 0)

    return {
      ...bp,
      score: hasData ? partScore : 0,
      hasData,
      description: descriptionFromScore(bp.title, partScore, hasData),
      stats: hasData
        ? [
            { label: 'Score', value: `${partScore}%`, status },
            {
              label: 'Status',
              value: status === 'good' ? 'Good' : status === 'normal' ? 'Moderate' : 'Needs attention',
              status,
            },
            {
              label: 'Reports',
              value: String(matched.length),
              status: 'normal',
            },
          ]
        : emptyStats(),
      tips: bp.defaultTips,
    }
  })

  return { healthScore, bodyParts }
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [activeBodyPart, setActiveBodyPart] = useState(0)
  const [recentReports, setRecentReports] = useState([])
  const [appointments, setAppointments] = useState([])
  const [recentQuestions, setRecentQuestions] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [greeting, setGreeting] = useState(getGreeting())
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const greetingInterval = setInterval(() => setGreeting(getGreeting()), 60000)
    return () => clearInterval(greetingInterval)
  }, [])

  useEffect(() => {
    const tipInterval = setInterval(() => setTipIndex((prev) => (prev + 1) % dailyTips.length), 8000)
    return () => clearInterval(tipInterval)
  }, [])

  useEffect(() => {
    async function loadData() {
      if (!user?.id) {
        setDataLoading(false)
        return
      }
      const [reportsRes, apptsRes, questionsRes] = await Promise.all([
        supabase
          .from('medical_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('upload_date', { ascending: false })
          .limit(20),
        supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(3),
        supabase
          .from('chat_messages')
          .select('content, created_at')
          .eq('user_id', user.id)
          .eq('role', 'user')
          .order('created_at', { ascending: false })
          .limit(4),
      ])
      setRecentReports(reportsRes.data || [])
      setAppointments(apptsRes.data || [])
      setRecentQuestions(questionsRes.data || [])
      setDataLoading(false)
    }
    loadData()
  }, [user?.id])

  const { healthScore, bodyParts } = useMemo(
    () => computeHealthFromReports(recentReports),
    [recentReports]
  )

  const stats = {
    total: recentReports.length,
    completed: recentReports.filter((r) => r.status === 'completed').length,
    pending: recentReports.filter((r) => r.status === 'pending').length,
  }

  const active = bodyParts[activeBodyPart]
  const ActiveIcon = active.icon
  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const GreetingIcon = greeting.icon

  const healthLabel =
    healthScore === 0
      ? 'No data'
      : healthScore >= 80
        ? 'Good'
        : healthScore >= 60
          ? 'Moderate'
          : 'Needs attention'

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden space-y-4 sm:space-y-5 md:space-y-6 animate-fade-in px-0">
      {/* Header */}
      <div className="flex flex-col gap-3 xs:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <GreetingIcon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-amber-500" />
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
              {greeting.text}, {displayName}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm md:text-base text-slate-500">
            Here&apos;s your health overview for today.
          </p>
        </div>
        <Link
          to="/upload"
          className="btn-primary w-full sm:w-auto justify-center text-sm sm:text-base py-2.5 sm:py-2 shrink-0"
        >
          <Plus className="h-4 w-4" /> Upload Report
        </Link>
      </div>

      {/* Tip banner */}
      <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl bg-teal-gradient p-3 sm:p-4 text-white shadow-teal">
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-white/20">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-teal-100">
            Tip of the moment
          </p>
          <p
            key={tipIndex}
            className="mt-0.5 text-xs sm:text-sm md:text-base text-white animate-fade-in line-clamp-3 sm:line-clamp-2 md:line-clamp-none"
          >
            {dailyTips[tipIndex]}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 md:grid-cols-4">
        <StatCard icon={FileText} label="Total Reports" value={stats.total} gradient="bg-teal-gradient" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} gradient="bg-emerald-gradient" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} gradient="bg-amber-gradient" />
        <StatCard
          icon={Activity}
          label="Health Score"
          value={healthScore}
          sublabel={healthLabel}
          gradient="bg-slate-gradient"
        />
      </div>

      {healthScore === 0 && (
        <div className="flex items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 sm:px-4 sm:py-3.5">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-900">No health results yet</p>
            <p className="text-xs sm:text-sm text-amber-800/80 mt-0.5">
              Upload a medical report to unlock your Health Score and body-system insights.
            </p>
            <Link
              to="/upload"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-amber-800 hover:text-amber-900"
            >
              <Upload className="h-4 w-4" /> Upload report
            </Link>
          </div>
        </div>
      )}

      {/* Health Overview */}
      <div className="card overflow-hidden rounded-xl sm:rounded-2xl">
        <div className="border-b border-slate-100 px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50">
              <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5 text-teal-700" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate">Health Overview</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                {healthScore === 0
                  ? 'Upload reports to see scores on each body system'
                  : 'Click a body part to see detailed health information'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:gap-6 md:gap-8 p-3 sm:p-4 md:p-6 lg:grid-cols-2 lg:items-start">
          {/* Body image + icons */}
          <div className="relative flex items-center justify-center w-full">
            <div className="relative aspect-[3/4] w-full max-w-[260px] xs:max-w-[300px] sm:max-w-[340px] md:max-w-[380px] lg:max-w-none overflow-hidden rounded-xl sm:rounded-2xl bg-slate-100 shadow-inner mx-auto">
              <img
                key={active.id}
                src={active.image}
                alt={active.title}
                className="h-full w-full object-cover animate-fade-in transition-all duration-700"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${active.color} opacity-20`} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

              {bodyParts.map((bp, i) => {
                const positions = [
                  { top: '32%', left: '50%' },
                  { top: '12%', left: '50%' },
                  { top: '22%', left: '40%' },
                  { top: '48%', left: '50%' },
                  { top: '10%', left: '38%' },
                  { top: '10%', left: '62%' },
                ]
                const pos = positions[i]
                const Icon = bp.icon
                const isActive = i === activeBodyPart
                return (
                  <button
                    key={bp.id}
                    onClick={() => setActiveBodyPart(i)}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none z-10 touch-manipulation"
                    style={{ top: pos.top, left: pos.left }}
                    aria-label={`View ${bp.title}`}
                  >
                    <span
                      className={`relative flex h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-br ${bp.color} scale-110 shadow-lg ring-2 ${bp.ring}`
                          : 'bg-white/90 shadow-md hover:scale-110 active:scale-105'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 ${isActive ? 'text-white' : bp.text}`} />
                      {isActive && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-40" />
                      )}
                      {bp.hasData && (
                        <span className="absolute -bottom-1 -right-1 min-w-[16px] sm:min-w-[18px] rounded-full bg-slate-900 px-0.5 sm:px-1 text-[7px] sm:text-[8px] font-bold text-white leading-3 sm:leading-4 text-center">
                          {bp.score}%
                        </span>
                      )}
                    </span>
                    <span
                      className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-bold transition-opacity shadow-sm ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } bg-slate-900 text-white`}
                    >
                      {bp.title.split(' ')[0]}
                      {bp.hasData ? ` ${bp.score}%` : ''}
                    </span>
                  </button>
                )
              })}

              <div className="absolute bottom-2 sm:bottom-3 md:bottom-5 left-2 sm:left-3 md:left-5 right-2 sm:right-3 md:right-5">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br ${active.color} shadow-lg ring-2 ring-white/20`}
                  >
                    <ActiveIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm md:text-base font-bold text-white drop-shadow-md truncate">
                      {active.title}
                      {active.hasData ? ` · ${active.score}%` : ''}
                    </p>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-white/90 font-medium truncate">
                      {active.hasData ? 'Based on your reports' : 'Tap icons · upload for scores'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detail panel */}
          <div key={active.id} className="flex flex-col animate-slide-right min-w-0">
            <div className="mb-3 sm:mb-4 md:mb-5 flex items-center gap-2.5 sm:gap-3 md:gap-4">
              <div
                className={`flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl ${active.bg} shadow-sm`}
              >
                <ActiveIcon className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 ${active.text}`} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 truncate">
                  {active.title}
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-slate-400 truncate">
                  {active.hasData
                    ? `Score: ${active.score}% · ${new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}`
                    : 'Awaiting report data'}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-slate-600">
              {active.description}
            </p>

            <div className="mt-4 sm:mt-5 md:mt-6 grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-4">
              {active.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg sm:rounded-xl border border-slate-100 bg-slate-50 p-2 sm:p-2.5 md:p-3.5 flex flex-col items-center sm:items-start text-center sm:text-left transition-colors hover:bg-slate-100 min-w-0"
                >
                  <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-tight truncate w-full">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-[11px] sm:text-xs md:text-base font-bold text-slate-800 truncate w-full">
                    {stat.value}
                  </p>
                  <span
                    className={`mt-1.5 sm:mt-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${
                      stat.status === 'good'
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                        : stat.status === 'normal'
                          ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                          : stat.status === 'poor'
                            ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                            : 'bg-slate-300'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 sm:mt-6 md:mt-8">
              <p className="mb-2 sm:mb-3 flex items-center gap-1.5 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-slate-400">
                <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" /> Health Tips
              </p>
              <ul className="space-y-2 sm:space-y-2.5 md:space-y-3">
                {active.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-600 group">
                    <CheckCircle2
                      className={`mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 shrink-0 transition-transform group-hover:scale-110 ${active.text}`}
                    />
                    <span className="leading-snug">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/chat"
              className="mt-5 sm:mt-6 md:mt-8 inline-flex items-center gap-2 text-sm sm:text-base font-bold text-teal-700 hover:text-teal-800 transition-colors group"
            >
              Ask AI about this{' '}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Reports + Questions + Appointments */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 min-w-0">
          {/* Recent Reports */}
          <div className="card-slate p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl">
            <div className="mb-3 sm:mb-4 md:mb-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-white truncate">Recent Reports</h2>
              </div>
              <Link
                to="/reports"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-teal-200 hover:text-white transition-colors shrink-0"
              >
                View all <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>

            {dataLoading ? (
              <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 sm:h-14 md:h-16 animate-pulse rounded-xl bg-white/10" />
                ))}
              </div>
            ) : recentReports.length === 0 ? (
              <div className="flex flex-col items-center gap-2 sm:gap-3 py-8 sm:py-10 md:py-12 text-center px-2">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white/10">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-white/60" />
                </div>
                <p className="text-xs sm:text-sm md:text-base text-teal-100">
                  No reports yet. Upload your first medical report.
                </p>
                <Link
                  to="/upload"
                  className="mt-1 sm:mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-bold text-teal-800 shadow-lg hover:bg-teal-50 transition-colors"
                >
                  <Upload className="h-4 w-4" /> Upload Now
                </Link>
              </div>
            ) : (
              <div className="grid gap-2 sm:gap-2.5 md:gap-3">
                {recentReports.slice(0, 4).map((report) => (
                  <Link
                    key={report.id}
                    to={`/reports/${report.id}`}
                    className="group flex items-center gap-2.5 sm:gap-3 md:gap-4 rounded-xl bg-white/10 p-2.5 sm:p-3.5 md:p-4 transition-all hover:bg-white/15 hover:translate-x-0.5 sm:hover:translate-x-1 min-w-0"
                  >
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs sm:text-sm md:text-base font-bold text-white">
                        {report.file_name}
                      </p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-teal-200 mt-0.5 truncate">
                        {new Date(report.upload_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                        {report.service_category && <span className="mx-1 opacity-50">·</span>}
                        {report.service_category}
                        {extractReportScore(report) != null && (
                          <>
                            <span className="mx-1 opacity-50">·</span>
                            {extractReportScore(report)}%
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <StatusDot status={report.status} />
                      <ChevronRight className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-1 hidden xs:block" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent AI Questions */}
          <div className="card p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl">
            <div className="mb-3 sm:mb-4 md:mb-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-teal-700" />
                </div>
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 truncate">
                  Recent AI Questions
                </h2>
              </div>
              <Link
                to="/chat"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors shrink-0"
              >
                Ask more <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>

            {dataLoading ? (
              <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-11 sm:h-12 md:h-14 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : recentQuestions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 sm:py-8 md:py-10 text-center px-2">
                <p className="text-xs sm:text-sm md:text-base text-slate-500">No questions asked yet.</p>
                <Link to="/chat" className="btn-primary mt-1 sm:mt-2 text-sm">
                  <MessageSquare className="h-4 w-4" /> Ask the AI
                </Link>
              </div>
            ) : (
              <div className="grid gap-2 sm:gap-2.5 md:gap-3">
                {recentQuestions.map((q, i) => (
                  <Link
                    key={i}
                    to="/chat"
                    className="flex items-center gap-2.5 sm:gap-3 md:gap-4 rounded-xl border border-slate-100 bg-slate-50 p-2.5 sm:p-3.5 md:p-4 hover:bg-slate-100 transition-colors group min-w-0"
                  >
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 transition-transform group-hover:scale-110">
                      <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs sm:text-sm md:text-base font-medium text-slate-700">
                        {q.content}
                      </p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-slate-400 mt-0.5">
                        {relativeTime(q.created_at)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1 hidden sm:block" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Appointments – stacks under on mobile, sticky on large */}
        <div className="lg:col-span-1 min-w-0">
          <div className="card-dark p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl lg:sticky lg:top-6">
            <div className="mb-4 sm:mb-5 md:mb-6 flex items-center gap-2 sm:gap-2.5">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-white">Appointments</h2>
            </div>

            {dataLoading ? (
              <div className="space-y-3 sm:space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 sm:h-16 animate-pulse rounded-xl bg-white/10" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 sm:py-10 text-center px-2">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/5 mb-1 sm:mb-2">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white/30" />
                </div>
                <p className="text-sm sm:text-base font-medium text-teal-100">No upcoming appointments</p>
                <p className="text-xs sm:text-sm text-teal-300">Schedule your next check-up</p>
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-3.5 md:space-y-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="rounded-xl bg-white/10 p-3 sm:p-4 border border-white/5 hover:bg-white/15 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <p className="min-w-0 text-sm sm:text-base font-bold text-white leading-tight">
                        {apt.title || apt.doctor_name || 'Appointment'}
                      </p>
                      <span className="shrink-0 text-[10px] sm:text-xs font-bold text-teal-300 bg-teal-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {new Date(apt.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    {apt.time && (
                      <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-teal-200/80">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{apt.time}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/services"
              className="mt-5 sm:mt-6 md:mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-bold text-slate-900 shadow-xl hover:bg-teal-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Stethoscope className="h-4 w-4" /> Book Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          to="/upload"
          icon={Upload}
          title="Upload Report"
          desc="Add a new medical document"
          gradient="bg-teal-gradient"
        />
        <QuickLink
          to="/chat"
          icon={MessageSquare}
          title="AI Assistant"
          desc="Ask health questions"
          gradient="bg-slate-gradient"
        />
        <QuickLink
          to="/services"
          icon={Stethoscope}
          title="Health Services"
          desc="Explore specialties"
          gradient="bg-coral-gradient"
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-5 sm:pt-6 md:pt-8 pb-3 sm:pb-4">
        <div className="flex flex-col items-center gap-3 sm:gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base text-slate-500">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-teal-gradient shadow-sm">
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="font-medium">
              © {new Date().getFullYear()} MediScan. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs md:text-sm text-slate-400 bg-slate-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-100 max-w-full">
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600 shrink-0" />
            <span className="font-medium truncate">Your health data is encrypted and private.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sublabel, gradient }) {
  return (
    <div
      className={`${gradient} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-card transition-all hover:scale-[1.02] sm:hover:scale-[1.03] hover:shadow-lg group min-w-0`}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 md:h-11 md:w-11 items-center justify-center rounded-lg sm:rounded-xl bg-white/20 transition-transform group-hover:rotate-6">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
        </div>
      </div>
      <p className="mt-2 sm:mt-3 md:mt-4 text-xl sm:text-2xl md:text-3xl font-black tracking-tight truncate">
        {value}
      </p>
      <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-widest truncate">
        {label}
      </p>
      {sublabel && (
        <p className="mt-0.5 text-[9px] sm:text-[10px] text-white/70 font-medium truncate">{sublabel}</p>
      )}
    </div>
  )
}

function StatusDot({ status }) {
  const colors = {
    completed: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]',
    pending: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
    failed: 'bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]',
  }
  return <span className={`h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0 rounded-full ${colors[status] || colors.pending}`} />
}

function QuickLink({ to, icon: Icon, title, desc, gradient }) {
  return (
    <Link
      to={to}
      className={`group ${gradient} flex items-center gap-3 sm:gap-4 md:gap-5 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 sm:hover:-translate-y-1 active:scale-[0.98] min-w-0`}
    >
      <div className="flex h-10 w-10 sm:h-11 sm:w-11 md:h-13 md:w-13 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 shadow-inner group-hover:scale-110 transition-transform">
        <Icon className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm sm:text-base md:text-lg font-bold text-white">{title}</p>
        <p className="truncate text-[11px] sm:text-xs md:text-sm text-white/80 font-medium">{desc}</p>
      </div>
      <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 transition-colors shrink-0">
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}