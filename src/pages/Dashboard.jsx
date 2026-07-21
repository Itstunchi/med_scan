import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, FileText, Upload, MessageSquare, Stethoscope, Calendar, HeartPulse, Brain, Wind, Eye, Ear, Utensils, ChevronRight, Plus, Clock, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react'

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

const mockRecentReports = [
  { id: '1', file_name: 'Blood Test Results.pdf', upload_date: '2026-07-15', status: 'completed', service_category: 'Laboratory' },
  { id: '2', file_name: 'Chest X-Ray.pdf', upload_date: '2026-07-10', status: 'completed', service_category: 'Radiology' },
  { id: '3', file_name: 'Annual Checkup Notes.pdf', upload_date: '2026-07-05', status: 'pending', service_category: 'General Health' },
]

const mockAppointments = [
  { id: '1', title: 'Dr. Smith — Cardiology Follow-up', date: '2026-07-28', time: '10:00 AM' },
  { id: '2', title: 'Annual Eye Exam', date: '2026-08-03', time: '2:30 PM' },
]

export default function Dashboard() {
  const [activeBodyPart, setActiveBodyPart] = useState(0)
  const [recentReports] = useState(mockRecentReports)
  const [appointments] = useState(mockAppointments)

  const stats = {
    total: recentReports.length,
    completed: recentReports.filter(r => r.status === 'completed').length,
    pending: recentReports.filter(r => r.status === 'pending').length,
  }

  const active = bodyParts[activeBodyPart]
  const ActiveIcon = active.icon
  const displayName = 'there'

  return (
    <div className="space-y-5 sm:space-y-6 px-4 sm:px-0 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome back, {displayName}</h1>
          <p className="mt-1 text-sm text-slate-500">Here's your health overview for today.</p>
        </div>
        <Link to="/upload" className="btn-primary w-full sm:w-auto justify-center"><Plus className="h-4 w-4" /> Upload Report</Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4">
        <StatCard icon={FileText} label="Total Reports" value={stats.total} gradient="bg-teal-gradient" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} gradient="bg-emerald-gradient" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} gradient="bg-amber-gradient" />
        <StatCard icon={Activity} label="Health Score" value="88" gradient="bg-slate-gradient" />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-4 sm:px-5 py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50"><HeartPulse className="h-4 w-4 text-teal-700" /></div>
            <div><h2 className="font-semibold text-slate-800">Health Overview</h2><p className="text-xs text-slate-400">Click a body part to see detailed health information</p></div>
          </div>
        </div>
        <div className="grid gap-4 sm:gap-5 p-4 sm:p-5 lg:grid-cols-2">
          <div className="relative flex items-center justify-center">
            <div className="relative h-[280px] sm:h-[360px] lg:h-[420px] w-full max-w-sm overflow-hidden rounded-2xl bg-slate-100">
              <img key={active.id} src={active.image} alt={active.title} className="h-full w-full object-cover animate-fade-in transition-all duration-500" />
              <div className={`absolute inset-0 bg-gradient-to-t ${active.color} opacity-20`} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
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
                  <button key={bp.id} onClick={() => setActiveBodyPart(i)} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ top: pos.top, left: pos.left }}>
                    <span className={`relative flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-all duration-300 ${isActive ? `bg-gradient-to-br ${bp.color} scale-110 shadow-lg ring-2 ${bp.ring}` : 'bg-white/90 shadow-md hover:scale-110'}`}>
                      <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? 'text-white' : bp.text}`} />
                      {isActive && <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-40" />}
                    </span>
                    <span className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} bg-slate-900 text-white`}>{bp.title.split(' ')[0]}</span>
                  </button>
                )
              })}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                <div className="flex items-center gap-2">
                  <div className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${active.color} shadow-lg`}><ActiveIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" /></div>
                  <div><p className="text-sm font-bold text-white drop-shadow">{active.title}</p><p className="text-xs text-white/80">Tap icons to explore</p></div>
                </div>
              </div>
            </div>
          </div>

          <div key={active.id} className="flex flex-col animate-slide-right">
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl ${active.bg}`}><ActiveIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${active.text}`} /></div>
              <div><h3 className="text-base sm:text-lg font-bold text-slate-800">{active.title}</h3><p className="text-xs text-slate-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p></div>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{active.description}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-2.5">
              {active.stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-slate-100 bg-slate-50 p-2 sm:p-3">
                  <p className="text-[10px] sm:text-[11px] font-medium text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800">{stat.value}</p>
                  <span className={`mt-1.5 inline-block h-1.5 w-1.5 rounded-full ${stat.status === 'good' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400"><Lightbulb className="h-3.5 w-3.5" /> Health Tips</p>
              <ul className="space-y-2">{active.tips.map((tip, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${active.text}`} /><span>{tip}</span></li>)}</ul>
            </div>
            <Link to="/chat" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800">Ask AI about this <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card-slate p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15"><FileText className="h-4 w-4 text-white" /></div><h2 className="font-semibold text-white">Recent Reports</h2></div>
              <Link to="/reports" className="inline-flex items-center gap-1 text-xs font-medium text-teal-200 hover:text-white">View all <ChevronRight className="h-3.5 w-3.5" /></Link>
            </div>
            {recentReports.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><FileText className="h-6 w-6 text-white/60" /></div>
                <p className="text-sm text-teal-100">No reports yet. Upload your first medical report.</p>
                <Link to="/upload" className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-teal-800"><Upload className="h-3.5 w-3.5" /> Upload</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentReports.slice(0, 4).map((report) => (
                  <Link key={report.id} to={`/reports/${report.id}`} className="group flex items-center gap-3 rounded-xl bg-white/10 p-3 transition-colors hover:bg-white/15">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15"><FileText className="h-4 w-4 text-white" /></div>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-white">{report.file_name}</p><p className="text-xs text-teal-200">{new Date(report.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{report.service_category && ` · ${report.service_category}`}</p></div>
                    <StatusDot status={report.status} />
                    <ChevronRight className="h-4 w-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="card-dark p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15"><Calendar className="h-4 w-4 text-white" /></div><h2 className="font-semibold text-white">Appointments</h2></div>
            {appointments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center"><p className="text-sm text-teal-100">No upcoming appointments</p><p className="text-xs text-teal-200">Schedule your next check-up</p></div>
            ) : (
              <div className="space-y-3">{appointments.map((apt) => (
                <div key={apt.id} className="rounded-xl bg-white/10 p-3">
                  <div className="flex items-center justify-between gap-2"><p className="min-w-0 truncate text-sm font-medium text-white">{apt.title || apt.doctor_name || 'Appointment'}</p><span className="shrink-0 text-xs text-teal-200">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div>
                  {apt.time && <p className="mt-1 text-xs text-teal-200">{apt.time}</p>}
                </div>
              ))}</div>
            )}
            <Link to="/services" className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/25"><Stethoscope className="h-3.5 w-3.5" /> Book Appointment</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink to="/upload" icon={Upload} title="Upload Report" desc="Add a new medical document" gradient="bg-teal-gradient" />
        <QuickLink to="/chat" icon={MessageSquare} title="AI Assistant" desc="Ask health questions" gradient="bg-slate-gradient" />
        <QuickLink to="/services" icon={Stethoscope} title="Health Services" desc="Explore specialties" gradient="bg-coral-gradient" />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className={`${gradient} rounded-2xl p-3 sm:p-4 text-white shadow-card transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/20"><Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" /></div>
      </div>
      <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-white/80">{label}</p>
    </div>
  )
}

function StatusDot({ status }) {
  const colors = { completed: 'bg-emerald-400', pending: 'bg-amber-400', failed: 'bg-rose-400' }
  return <span className={`h-2 w-2 shrink-0 rounded-full ${colors[status] || colors.pending}`} />
}

function QuickLink({ to, icon: Icon, title, desc, gradient }) {
  return (
    <Link to={to} className={`group ${gradient} flex items-center gap-3 sm:gap-4 rounded-2xl p-4 sm:p-5 text-white shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5`}>
      <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-white/20"><Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" /></div>
      <div className="min-w-0 flex-1"><p className="truncate font-semibold text-white">{title}</p><p className="truncate text-xs text-white/80">{desc}</p></div>
      <ChevronRight className="h-5 w-5 shrink-0 text-white/60 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}