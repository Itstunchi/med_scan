import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Clock, CheckCircle2, AlertCircle, Search, ChevronRight, Upload, ArrowLeft, ArrowUpDown, LayoutGrid, List, Share2, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

function relativeTime(dateStr) {
  const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return `${months} month${months > 1 ? 's' : ''} ago`
}

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [view, setView] = useState('list')
  const [shareMessage, setShareMessage] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    async function loadReports() {
      const { data, error } = await supabase
        .from('medical_reports')
        .select('id, file_name, upload_date, status, service_category')
        .order('upload_date', { ascending: false })
      if (error) console.error('Failed to load reports:', error)
      setReports(data || [])
      setLoading(false)
    }
    loadReports()
  }, [])

  const categories = ['all', ...new Set(reports.map((r) => r.service_category).filter(Boolean))]

  const filtered = reports
    .filter((r) => {
      const matchesSearch = r.file_name.toLowerCase().includes(search.toLowerCase()) || (r.service_category || '').toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === 'all' || r.status === filter
      const matchesCategory = categoryFilter === 'all' || r.service_category === categoryFilter
      return matchesSearch && matchesFilter && matchesCategory
    })
    .sort((a, b) => {
      const diff = new Date(b.upload_date) - new Date(a.upload_date)
      return sortOrder === 'newest' ? diff : -diff
    })

  const filters = [{ value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' }]

  const summary = {
    total: reports.length,
    completed: reports.filter((r) => r.status === 'completed').length,
    pending: reports.filter((r) => r.status === 'pending').length,
  }

  const handleShare = async () => {
    const shareData = {
      title: 'My Medical Reports',
      text: `I have ${summary.total} medical report${summary.total !== 1 ? 's' : ''} on MediScan.`,
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share failed:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url)
        setShareMessage('Link copied to clipboard!')
        setTimeout(() => setShareMessage(''), 2500)
      } catch (err) {
        setShareMessage('Could not copy link.')
        setTimeout(() => setShareMessage(''), 2500)
      }
    }
  }

  const handleDelete = async (reportId) => {
    setDeletingId(reportId)
    try {
      const { error } = await supabase.from('medical_reports').delete().eq('id', reportId)
      if (error) throw error
      setReports((prev) => prev.filter((r) => r.id !== reportId))
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6 px-4 sm:px-0 animate-fade-in">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-sky-700">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Reports</h1><p className="mt-1 text-sm text-slate-500">View and manage your uploaded medical reports.</p></div>
        <div className="flex gap-2">
          <button onClick={handleShare} className="btn-secondary relative flex-1 justify-center sm:flex-none">
            <Share2 className="h-4 w-4" /> Share
            {shareMessage && (
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs text-white shadow-lg animate-fade-in">
                {shareMessage}
              </span>
            )}
          </button>
          <Link to="/upload" className="btn-primary flex-1 sm:flex-none justify-center"><Upload className="h-4 w-4" /> Upload New</Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center sm:p-4">
          <p className="text-lg sm:text-xl font-bold text-slate-800">{summary.total}</p>
          <p className="text-[11px] sm:text-xs text-slate-400">Total Reports</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center sm:p-4">
          <p className="text-lg sm:text-xl font-bold text-emerald-700">{summary.completed}</p>
          <p className="text-[11px] sm:text-xs text-emerald-600">Completed</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-center sm:p-4">
          <p className="text-lg sm:text-xl font-bold text-amber-700">{summary.pending}</p>
          <p className="text-[11px] sm:text-xs text-amber-600">Pending</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search reports…" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" /></div>
        <div className="flex gap-2">
          <div className="flex flex-1 gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 scrollbar-thin sm:flex-none">{filters.map((f) => <button key={f.value} onClick={() => setFilter(f.value)} className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${filter === f.value ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{f.label}</button>)}</div>
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            title="Toggle sort order"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
          </button>
          <div className="hidden shrink-0 gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:flex">
            <button onClick={() => setView('list')} className={`rounded-lg p-1.5 ${view === 'list' ? 'bg-sky-700 text-white' : 'text-slate-500 hover:bg-slate-100'}`} title="List view">
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setView('grid')} className={`rounded-lg p-1.5 ${view === 'grid' ? 'bg-sky-700 text-white' : 'text-slate-500 hover:bg-slate-100'}`} title="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {categories.length > 2 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="card divide-y divide-slate-100">{[1,2,3,4].map((i) => <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4"><div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-200" /><div className="flex-1 space-y-2"><div className="h-4 w-40 sm:w-56 animate-pulse rounded bg-slate-200" /><div className="h-3 w-24 animate-pulse rounded bg-slate-200" /></div></div>)}</div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-6 sm:p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100"><FileText className="h-7 w-7 text-slate-400" /></div>
          <h3 className="font-semibold text-slate-700">{reports.length === 0 ? 'No reports yet' : 'No matching reports'}</h3>
          <p className="text-sm text-slate-500">{reports.length === 0 ? 'Upload your first medical report to get started.' : 'Try adjusting your search or filter.'}</p>
          {reports.length === 0 && <Link to="/upload" className="btn-primary mt-2"><Upload className="h-4 w-4" /> Upload Report</Link>}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((report) => (
            <div key={report.id} className="card group flex flex-col gap-3 p-4 transition-colors hover:bg-slate-50">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50"><FileText className="h-5 w-5 text-sky-700" /></div>
                <div className="flex items-center gap-1">
                  <StatusBadge status={report.status} />
                  {confirmDeleteId === report.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(report.id)} disabled={deletingId === report.id} className="rounded-lg bg-rose-600 px-1.5 py-1 text-[10px] font-semibold text-white hover:bg-rose-700">
                        {deletingId === report.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Delete'}
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} className="rounded-lg px-1.5 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(report.id)} className="rounded-lg p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500" title="Delete report">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <Link to={`/reports/${report.id}`} className="min-w-0">
                <p className="truncate font-medium text-slate-800">{report.file_name}</p>
                <p className="mt-0.5 text-xs text-slate-400">{relativeTime(report.upload_date)}{report.service_category && ` · ${report.service_category}`}</p>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map((report) => (
            <div key={report.id} className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-colors hover:bg-slate-50">
              <Link to={`/reports/${report.id}`} className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50"><FileText className="h-4 w-4 sm:h-5 sm:w-5 text-sky-700" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm sm:text-base font-medium text-slate-800">{report.file_name}</p>
                  <p className="truncate text-xs text-slate-400">{relativeTime(report.upload_date)}{report.service_category && ` · ${report.service_category}`}</p>
                </div>
              </Link>
              <StatusBadge status={report.status} />
              {confirmDeleteId === report.id ? (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button onClick={() => handleDelete(report.id)} disabled={deletingId === report.id} className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700">
                    {deletingId === report.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Delete'}
                  </button>
                  <button onClick={() => setConfirmDeleteId(null)} className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDeleteId(report.id)} className="shrink-0 rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500" title="Delete report">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <Link to={`/reports/${report.id}`}>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" />
              </Link>
            </div>
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