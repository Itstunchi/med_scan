import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Clock, CheckCircle2, AlertCircle, Loader2, Download, Stethoscope, MessageSquare, HeartPulse, ListChecks, HelpCircle, Lightbulb } from 'lucide-react'

// Placeholder data — replace with a real API call once you have a backend
const mockReport = {
  file_name: 'Blood Test Results.pdf',
  upload_date: new Date().toISOString(),
  service_category: 'Laboratory',
  status: 'completed',
  file_url: null,
}

const mockAnalysis = {
  summary: 'Your recent blood test shows results mostly within normal ranges, with a couple of values worth discussing with your doctor.',
  health_insights: 'Your cholesterol levels are slightly elevated, which is common and often manageable through diet and exercise.',
  recommended_specialty: 'General Practitioner',
  findings: [
    'Total cholesterol is slightly above the recommended range.',
    'Blood glucose levels are within normal range.',
    'Vitamin D levels are on the lower end of normal.',
  ],
  results: [
    { label: 'Total Cholesterol', value: '210 mg/dL', range: '<200 mg/dL' },
    { label: 'Fasting Glucose', value: '92 mg/dL', range: '70-99 mg/dL' },
    { label: 'Vitamin D', value: '28 ng/mL', range: '30-100 ng/mL' },
  ],
  medical_terms: [
    { term: 'LDL Cholesterol', definition: 'Often called "bad" cholesterol; high levels can increase heart disease risk.' },
    { term: 'HDL Cholesterol', definition: 'Often called "good" cholesterol; helps remove other forms of cholesterol from the bloodstream.' },
  ],
  questions_for_doctor: [
    'Should I make dietary changes to lower my cholesterol?',
    'Do I need a Vitamin D supplement?',
    'How often should I repeat this bloodwork?',
  ],
}

export default function ReportDetail() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: replace with a real fetch, e.g. fetch(`/api/reports/${id}`)
    const timer = setTimeout(() => {
      setReport(mockReport)
      setAnalysis(mockAnalysis)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [id])

  if (loading) return <div className="flex items-center justify-center py-16 sm:py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-700" /></div>
  if (!report) return <div className="mx-auto max-w-2xl px-4 sm:px-0"><div className="card flex flex-col items-center gap-3 p-6 sm:p-10 text-center"><AlertCircle className="h-10 w-10 text-slate-400" /><h3 className="font-semibold text-slate-700">Report not found</h3><Link to="/reports" className="btn-primary mt-2">Back to Reports</Link></div></div>

  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6 px-4 sm:px-0 animate-fade-in">
      <Link to="/reports" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-700"><ArrowLeft className="h-4 w-4" /> Back to Reports</Link>
      <div className="card p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50"><FileText className="h-6 w-6 sm:h-7 sm:w-7 text-teal-700" /></div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 break-words">{report.file_name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-slate-500">
                <span>{new Date(report.upload_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                {report.service_category && <span className="inline-flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" /> {report.service_category}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3"><StatusBadge status={report.status} />{report.file_url && <a href={report.file_url} target="_blank" rel="noopener noreferrer" className="btn-secondary"><Download className="h-4 w-4" /> View</a>}</div>
        </div>
      </div>
      {report.status === 'pending' && !analysis && <div className="card flex flex-col items-center gap-4 p-6 sm:p-10 text-center"><Loader2 className="h-10 w-10 animate-spin text-teal-700" /><div><h3 className="font-semibold text-slate-700">Processing your report…</h3><p className="mt-1 text-sm text-slate-500">Your report is being saved. This usually takes a few seconds.</p></div></div>}
      {analysis && <AnalysisView analysis={analysis} />}
      {report.status === 'failed' && !analysis && <div className="card flex flex-col items-center gap-3 p-6 sm:p-10 text-center"><AlertCircle className="h-10 w-10 text-rose-500" /><h3 className="font-semibold text-slate-700">Processing failed</h3><p className="text-sm text-slate-500">We couldn't process this report. Please try uploading again.</p><Link to="/upload" className="btn-primary mt-2">Upload Again</Link></div>}
    </div>
  )
}

function AnalysisView({ analysis }) {
  const findings = analysis.findings || []
  const results = analysis.results || []
  const medicalTerms = analysis.medical_terms || []
  const questions = analysis.questions_for_doctor || []
  return (
    <div className="space-y-4 sm:space-y-5 animate-slide-up">
      {analysis.summary && <div className="card p-4 sm:p-6"><div className="mb-3 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50"><FileText className="h-4 w-4 text-teal-700" /></div><h2 className="font-semibold text-slate-800">Summary</h2></div><p className="text-sm leading-relaxed text-slate-600">{analysis.summary}</p></div>}
      {analysis.health_insights && <div className="card p-4 sm:p-6"><div className="mb-3 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50"><Lightbulb className="h-4 w-4 text-teal-600" /></div><h2 className="font-semibold text-slate-800">Health Insights</h2></div><p className="text-sm leading-relaxed text-slate-600">{analysis.health_insights}</p></div>}
      {analysis.recommended_specialty && <div className="card flex items-center gap-3 sm:gap-4 p-4 sm:p-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50"><HeartPulse className="h-5 w-5 text-teal-700" /></div><div><p className="text-sm text-slate-500">Recommended Specialist</p><p className="font-semibold text-slate-800">{analysis.recommended_specialty}</p></div></div>}
      {findings.length > 0 && <div className="card p-4 sm:p-6"><div className="mb-4 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50"><ListChecks className="h-4 w-4 text-teal-700" /></div><h2 className="font-semibold text-slate-800">Key Findings</h2></div><ul className="space-y-2.5">{findings.map((finding, i) => <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" /><span>{typeof finding === 'string' ? finding : finding.text || JSON.stringify(finding)}</span></li>)}</ul></div>}
      {results.length > 0 && <div className="card p-4 sm:p-6"><div className="mb-4 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50"><Stethoscope className="h-4 w-4 text-teal-600" /></div><h2 className="font-semibold text-slate-800">Detailed Results</h2></div><div className="space-y-3">{results.map((result, i) => <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3">{typeof result === 'string' ? <p className="text-sm text-slate-600">{result}</p> : <div className="space-y-1">{result.label && <p className="text-sm font-medium text-slate-700">{result.label}</p>}{result.value && <p className="text-sm text-slate-600">{result.value}</p>}{result.range && <p className="text-xs text-slate-400">Reference: {result.range}</p>}</div>}</div>)}</div></div>}
      {medicalTerms.length > 0 && <div className="card p-4 sm:p-6"><div className="mb-4 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50"><FileText className="h-4 w-4 text-teal-700" /></div><h2 className="font-semibold text-slate-800">Medical Terms Explained</h2></div><div className="space-y-3">{medicalTerms.map((term, i) => <div key={i} className="border-l-2 border-teal-200 pl-3"><p className="text-sm font-medium text-slate-700">{typeof term === 'string' ? term : term.term || term.name}</p>{typeof term === 'object' && (term.definition || term.description) && <p className="mt-0.5 text-sm text-slate-500">{term.definition || term.description}</p>}</div>)}</div></div>}
      {questions.length > 0 && <div className="card p-4 sm:p-6"><div className="mb-4 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50"><HelpCircle className="h-4 w-4 text-teal-600" /></div><h2 className="font-semibold text-slate-800">Questions to Ask Your Doctor</h2></div><ul className="space-y-2.5">{questions.map((q, i) => <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600"><span className="mt-0.5 font-semibold text-teal-600">Q{i + 1}.</span><span>{typeof q === 'string' ? q : q.question || JSON.stringify(q)}</span></li>)}</ul></div>}
      <div className="card flex flex-col items-center gap-3 p-4 sm:p-6 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50"><MessageSquare className="h-6 w-6 text-teal-600" /></div><h3 className="font-semibold text-slate-700">Have more questions?</h3><p className="text-sm text-slate-500">Ask our AI assistant about your report results.</p><Link to="/chat" className="btn-primary mt-1"><MessageSquare className="h-4 w-4" /> Ask AI Assistant</Link></div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = { pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, label: 'Processing' }, completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2, label: 'Completed' }, failed: { bg: 'bg-rose-50', text: 'text-rose-700', icon: AlertCircle, label: 'Failed' } }
  const style = styles[status] || styles.pending
  const Icon = style.icon
  return <span className={`inline-flex items-center gap-1.5 rounded-full ${style.bg} px-3 py-1.5 text-xs font-medium ${style.text}`}><Icon className="h-3.5 w-3.5" />{style.label}</span>
}