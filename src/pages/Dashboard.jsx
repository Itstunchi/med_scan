import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Activity, FileText, Upload, MessageSquare, Stethoscope, Calendar, HeartPulse, Brain, Wind, Eye, Ear, Utensils, ChevronRight, Plus, Clock, CheckCircle2, ArrowRight, Lightbulb, Sun, Moon, Sunrise, ShieldCheck, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

const bodyParts = [
  {
    id: 'heart', title: 'Heart Health', icon: HeartPulse, color: 'from-rose-500 to-coral-500', bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-400',
    image: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop',
    description: 'Your cardiovascular system is functioning well. Blood pressure and heart rate are within healthy ranges.',
    stats: [
      { label: 'Blood Pressure', value: '118/76', status: 'good' },
      { label: 'Heart Rate', value: '72 bpm', status: 'good' },
      { label: 'Cholesterol', value: '165 mg/dL', status: 'normal' },
    ],
    tips: ['Maintain 30 min of cardio daily', 'Limit sodium to under 2g per day', 'Include omega-3 rich foods in your diet'],
  },
  {
    id: 'brain', title: 'Brain & Nervous System', icon: Brain, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-400',
    image: 'https://images.pexels.com/photos/8433425/pexels-photo-8433425.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop',
    description: 'Cognitive function and nervous system indicators are normal. Keep up with mental wellness activities.',
    stats: [
      { label: 'Cognitive Score', value: '92/100', status: 'good' },
      { label: 'Sleep Quality', value: '7.5 hrs', status: 'good' },
      { label: 'Stress Level', value: 'Moderate', status: 'normal' },
    ],
    tips: ['Practice mindfulness 10 min daily', 'Ensure 7-8 hours of quality sleep', 'Challenge your brain with puzzles or reading'],
  },
  {
    id: 'lungs', title: 'Lung & Respiratory', icon: Wind, color: 'from-sky-500 to-cyan-500', bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-400',
    image: 'https://images.pexels.com/photos/4226259/pexels-photo-4226259.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop',
    description: 'Respiratory function is healthy. Lung capacity and oxygen saturation are within optimal ranges.',
    stats: [
      { label: 'Oxygen Sat', value: '98%', status: 'good' },
      { label: 'Lung Capacity', value: '4.2 L', status: 'good' },
      { label: 'Respiratory Rate', value: '16/min', status: 'good' },
    ],
    tips: ['Practice deep breathing exercises', 'Avoid smoke and polluted environments', 'Stay active to improve lung capacity'],
  },
  {
    id: 'stomach', title: 'Digestive Health', icon: Utensils, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-400',
    image: 'https://images.pexels.com/photos/5938358/pexels-photo-5938358.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop',
    description: 'Digestive system is functioning normally. Consider adding more fiber to your diet for improved gut health.',
    stats: [
      { label: 'Digestion Score', value: '85/100', status: 'good' },
      { label: 'Gut Health', value: 'Balanced', status: 'good' },
      { label: 'Hydration', value: '1.8 L/day', status: 'normal' },
    ],
    tips: ['Eat 25-30g of fiber daily', 'Include probiotic-rich foods like yogurt', 'Stay hydrated throughout the day'],
  },
  {
    id: 'eyes', title: 'Eye & Vision', icon: Eye, color: 'from-teal-500 to-emerald-500', bg: 'bg-teal-50', text: 'text-teal-600', ring: 'ring-teal-400',
    image: 'https://images.pexels.com/photos/5996689/pexels-photo-5996689.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop',
    description: 'Vision is clear and healthy. Eye pressure and retinal screening show no abnormalities.',
    stats: [
      { label: 'Visual Acuity', value: '20/20', status: 'good' },
      { label: 'Eye Pressure', value: '15 mmHg', status: 'good' },
      { label: 'Screen Time', value: '6 hrs/day', status: 'normal' },
    ],
    tips: ['Follow the 20-20-20 rule for screen breaks', 'Wear UV-protective sunglasses outdoors', 'Schedule annual eye exams'],
  },
  {
    id: 'ear', title: 'Ear & Hearing', icon: Ear, color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-400',
    image: 'https://images.pexels.com/photos/5206951/pexels-photo-5206951.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop',
    description: 'Hearing is within normal range across all frequencies. No signs of hearing degradation detected.',
    stats: [
      { label: 'Hearing Threshold', value: '15 dB', status: 'good' },
      { label: 'Speech Recognition', value: '98%', status: 'good' },
      { label: 'Ear Health', value: 'Good', status: 'good' },
    ],
    tips: ['Limit exposure to loud noises', 'Use ear protection in noisy environments', 'Clean ears gently — no cotton swabs deep inside'],
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
      const [reportsRes, apptsRes, questionsRes] = await Promise.all([
        supabase.from('medical_reports').select('*').order('upload_date', { ascending: false }).limit(6),
        supabase.from('appointments').select('*').gte('date', new Date().toISOString()).order('date', { ascending: true }).limit(3),
        user?.id
          ? supabase.from('chat_messages').select('content, created_at').eq('user_id', user.id).eq('role', 'user').order('created_at', { ascending: false }).limit(4)
          : Promise.resolve({ data: [] }),
      ])
      setRecentReports(reportsRes.data || [])
      setAppointments(apptsRes.data || [])
      setRecentQuestions(questionsRes.data || [])
      setDataLoading(false)
    }
    loadData()
  }, [user?.id])

  const stats = {
    total: recentReports.length,
    completed: recentReports.filter(r => r.status === 'completed').length,
    pending: recentReports.filter(r => r.status === 'pending').length,
  }

  const active = bodyParts[activeBodyPart]
  const ActiveIcon = active.icon
  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const GreetingIcon = greeting.icon

  return (
    <div className="w-full space-y-5 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <GreetingIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">{greeting.text}, {displayName}</h1>
          </div>
          <p className="mt-1 text-sm sm:text-base text-slate-500">Here's your health overview for today.</p>
        </div>
        <Link to="/upload" className="btn-primary w-full sm:w-auto justify-center text-sm sm:text-base py-2.5 sm:py-2">
          <Plus className="h-4 w-4" /> Upload Report
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-teal-gradient p-3.5 sm:p-4 text-white shadow-teal">
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-teal-100">Tip of the moment</p>
          <p key={tipIndex} className="mt-0.5 text-xs sm:text-sm md:text-base text-white animate-fade-in line-clamp-2 sm:line-clamp-none">{dailyTips[tipIndex]}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard icon={FileText} label="Total Reports" value={stats.total} gradient="bg-teal-gradient" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} gradient="bg-emerald-gradient" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} gradient="bg-amber-gradient" />
        <StatCard icon={Activity} label="Health Score" value="88" gradient="bg-slate-gradient" />
      </div>

      <div className="card overflow-hidden rounded-2xl">
        <div className="border-b border-slate-100 px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50">
              <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5 text-teal-700" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate">Health Overview</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">Click a body part to see detailed health information</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8 p-4 sm:p-6 lg:grid-cols-2 lg:items-start">
          <div className="relative flex items-center justify-center">
            <div className="relative aspect-[3/4] w-full max-w-[320px] sm:max-w-[380px] lg:max-w-none overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
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
                    className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none z-10"
                    style={{ top: pos.top, left: pos.left }}
                    aria-label={`View ${bp.title}`}
                  >
                    <span className={`relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300 ${isActive ? `bg-gradient-to-br ${bp.color} scale-110 shadow-lg ring-2 ${bp.ring}` : 'bg-white/90 shadow-md hover:scale-110'}`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'text-white' : bp.text}`} />
                      {isActive && <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-40" />}
                    </span>
                    <span className={`absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[9px] sm:text-[10px] font-bold transition-opacity shadow-sm ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} bg-slate-900 text-white`}>
                      {bp.title.split(' ')[0]}
                    </span>
                  </button>
                )
              })}

              <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 right-3 sm:right-5">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${active.color} shadow-lg ring-2 ring-white/20`}>
                    <ActiveIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-bold text-white drop-shadow-md truncate">{active.title}</p>
                    <p className="text-[10px] sm:text-xs text-white/90 font-medium">Tap icons to explore</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div key={active.id} className="flex flex-col animate-slide-right">
            <div className="mb-4 sm:mb-5 flex items-center gap-3 sm:gap-4">
              <div className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl ${active.bg} shadow-sm`}>
                <ActiveIcon className={`h-6 w-6 sm:h-7 sm:w-7 ${active.text}`} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">{active.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-slate-600">{active.description}</p>

            <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-2.5 sm:gap-4">
              {active.stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 sm:p-3.5 flex flex-col items-center sm:items-start text-center sm:text-left transition-colors hover:bg-slate-100">
                  <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-tight">{stat.label}</p>
                  <p className="mt-1 text-xs sm:text-base font-bold text-slate-800 truncate w-full">{stat.value}</p>
                  <span className={`mt-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${stat.status === 'good' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} />
                </div>
              ))}
            </div>

            <div className="mt-6 sm:mt-8">
              <p className="mb-3 flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
                <Lightbulb className="h-4 w-4 text-amber-500" /> Health Tips
              </p>
              <ul className="space-y-2.5 sm:space-y-3">
                {active.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 group">
                    <CheckCircle2 className={`mt-0.5 h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-transform group-hover:scale-110 ${active.text}`} />
                    <span className="leading-snug">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link to="/chat" className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-sm sm:text-base font-bold text-teal-700 hover:text-teal-800 transition-colors group">
              Ask AI about this <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="card-slate p-4 sm:p-6 rounded-2xl">
            <div className="mb-4 sm:mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">Recent Reports</h2>
              </div>
              <Link to="/reports" className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-teal-200 hover:text-white transition-colors">
                View all <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>

            {dataLoading ? (
              <div className="space-y-2.5 sm:space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 sm:h-16 animate-pulse rounded-xl bg-white/10" />)}
              </div>
            ) : recentReports.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 sm:py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <FileText className="h-7 w-7 text-white/60" />
                </div>
                <p className="text-sm sm:text-base text-teal-100">No reports yet. Upload your first medical report.</p>
                <Link to="/upload" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-teal-800 shadow-lg hover:bg-teal-50 transition-colors">
                  <Upload className="h-4 w-4" /> Upload Now
                </Link>
              </div>
            ) : (
              <div className="grid gap-2.5 sm:gap-3">
                {recentReports.slice(0, 4).map((report) => (
                  <Link key={report.id} to={`/reports/${report.id}`} className="group flex items-center gap-3 sm:gap-4 rounded-xl bg-white/10 p-3.5 sm:p-4 transition-all hover:bg-white/15 hover:translate-x-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm sm:text-base font-bold text-white">{report.file_name}</p>
                      <p className="text-xs sm:text-sm text-teal-200 mt-0.5">
                        {new Date(report.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {report.service_category && <span className="mx-1.5 opacity-50">·</span>}
                        {report.service_category}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusDot status={report.status} />
                      <ChevronRight className="h-4 w-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card p-4 sm:p-6 rounded-2xl">
            <div className="mb-4 sm:mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-teal-700" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800">Recent AI Questions</h2>
              </div>
              <Link to="/chat" className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors">
                Ask more <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>

            {dataLoading ? (
              <div className="space-y-2.5 sm:space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-12 sm:h-14 animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : recentQuestions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 sm:py-10 text-center">
                <p className="text-sm sm:text-base text-slate-500">No questions asked yet.</p>
                <Link to="/chat" className="btn-primary mt-2">
                  <MessageSquare className="h-4 w-4" /> Ask the AI
                </Link>
              </div>
            ) : (
              <div className="grid gap-2.5 sm:gap-3">
                {recentQuestions.map((q, i) => (
                  <Link key={i} to="/chat" className="flex items-center gap-3 sm:gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5 sm:p-4 hover:bg-slate-100 transition-colors group">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 transition-transform group-hover:scale-110">
                      <MessageSquare className="h-4 w-4 text-teal-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm sm:text-base font-medium text-slate-700">{q.content}</p>
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{relativeTime(q.created_at)}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card-dark p-4 sm:p-6 rounded-2xl sticky top-6">
            <div className="mb-5 sm:mb-6 flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">Appointments</h2>
            </div>

            {dataLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/10" />)}
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 mb-2">
                  <Calendar className="h-6 w-6 text-white/30" />
                </div>
                <p className="text-sm sm:text-base font-medium text-teal-100">No upcoming appointments</p>
                <p className="text-xs sm:text-sm text-teal-300">Schedule your next check-up</p>
              </div>
            ) : (
              <div className="space-y-3.5 sm:space-y-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="rounded-xl bg-white/10 p-4 border border-white/5 hover:bg-white/15 transition-colors group">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-sm sm:text-base font-bold text-white leading-tight">
                        {apt.title || apt.doctor_name || 'Appointment'}
                      </p>
                      <span className="shrink-0 text-[10px] sm:text-xs font-bold text-teal-300 bg-teal-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {apt.time && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-teal-200/80">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{apt.time}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Link to="/services" className="mt-6 sm:mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-xl hover:bg-teal-50 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Stethoscope className="h-4 w-4" /> Book Appointment
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink to="/upload" icon={Upload} title="Upload Report" desc="Add a new medical document" gradient="bg-teal-gradient" />
        <QuickLink to="/chat" icon={MessageSquare} title="AI Assistant" desc="Ask health questions" gradient="bg-slate-gradient" />
        <QuickLink to="/services" icon={Stethoscope} title="Health Services" desc="Explore specialties" gradient="bg-coral-gradient" />
      </div>

      <footer className="border-t border-slate-200 pt-6 sm:pt-8 pb-4">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex items-center gap-3 text-sm sm:text-base text-slate-500">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-gradient shadow-sm">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium">© {new Date().getFullYear()} MediScan. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span className="font-medium">Your health data is encrypted and private.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className={`${gradient} rounded-2xl p-4 sm:p-5 text-white shadow-card transition-all hover:scale-[1.03] hover:shadow-lg group`}>
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-white/20 transition-transform group-hover:rotate-6">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
      <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-black tracking-tight">{value}</p>
      <p className="text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-widest">{label}</p>
    </div>
  )
}

function StatusDot({ status }) {
  const colors = { completed: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]', pending: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]', failed: 'bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]' }
  return <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${colors[status] || colors.pending}`} />
}

function QuickLink({ to, icon: Icon, title, desc, gradient }) {
  return (
    <Link to={to} className={`group ${gradient} flex items-center gap-4 sm:gap-5 rounded-2xl p-5 sm:p-6 text-white shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1 active:scale-[0.98]`}>
      <div className="flex h-11 w-11 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner group-hover:scale-110 transition-transform">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base sm:text-lg font-bold text-white">{title}</p>
        <p className="truncate text-xs sm:text-sm text-white/80 font-medium">{desc}</p>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
        <ChevronRight className="h-5 w-5 shrink-0 text-white transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}