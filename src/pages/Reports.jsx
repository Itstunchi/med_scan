import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Clock, CheckCircle2, AlertCircle, Search, ChevronRight, Upload } from 'lucide-react'

// Placeholder data — replace with a real API call once you have a backend
const mockReports = [
  { id: '1', file_name: 'Blood Test Results.pdf', upload_date: '2026-07-15', status: 'completed', service_category: 'Laboratory' },
  { id: '2', file_name: 'Chest X-Ray.pdf', upload_date: '2026-07-10', status: 'completed', service_category: 'Radiology' },
  { id: '3', file_name: 'Annual Checkup Notes.pdf', upload_date: '2026-07-05', status: 'pending', service_category: 'General Health' },
]

export default function Reports() {
  const [reports] = useState(mockReports)
  const [loading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = reports.filter((r) => {
    const matchesSearch = r.file_name.toLowerCase().includes(search.toLowerCase()) || (r.service_category || '').toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || r.status === filter
    return matchesSearch && matchesFilter
  })
  const filters = [{ value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' }]

  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6 px-4 sm:px-0 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Reports</h1><p className="mt-1 text-sm text-slate-500">View and manage your uploaded medical reports.</p></div>
        <Link to="/upload" className="btn-primary w-full sm:w-auto justify-center"><Upload className="h-4 w-4" /> Upload New</Link>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search reports…" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" /></div>
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 scrollbar-thin">{filters.map((f) => <button key={f.value} onClick={() => setFilter(f.value)} className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${filter === f.value ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{f.label}</button>)}</div>
      </div>
      {loading ? (
        <div className="card divide-y divide-slate-100">{[1,2,3,4].map((i) => <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4"><div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-200" /><div className="flex-1 space-y-2"><div className="h-4 w-40 sm:w-56 animate-pulse rounded bg-slate-200" /><div className="h-3 w-24 animate-pulse rounded bg-slate-200" /></div></div>)}</div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-6 sm:p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100"><FileText className="h-7 w-7 text-slate-400" /></div>
          <h3 className="font-semibold text-slate-700">{reports.length === 0 ? 'No reports yet' : 'No matching reports'}</h3>
          <p className="text-sm text-slate-500">{reports.length === 0 ? 'Upload your first medical report to get started.' : 'Try adjusting your search or filter.'}</p>
          {reports.length === 0 && <Link to="/upload" className="btn-primary mt-2"><Upload className="h-4 w-4" /> Upload Report</Link>}
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map((report) => (
            <Link key={report.id} to={`/reports/${report.id}`} className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-colors hover:bg-slate-50">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50"><FileText className="h-4 w-4 sm:h-5 sm:w-5 text-teal-700" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm sm:text-base font-medium text-slate-800">{report.file_name}</p>
                <p className="truncate text-xs text-slate-400">{new Date(report.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{report.service_category && ` · ${report.service_category}`}</p>
              </div>
              <StatusBadge status={report.status} />
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = { pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, label: 'Pending' }, completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2, label: 'Completed' }, failed: { bg: 'bg-rose-50', text: 'text-rose-700', icon: AlertCircle, label: 'Failed' } }
  const style = styles[status] || styles.pending
  const Icon = style.icon
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full ${style.bg} px-2 sm:px-2.5 py-1 text-xs font-medium ${style.text}`}>
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{style.label}</span>
    </span>
  )
}