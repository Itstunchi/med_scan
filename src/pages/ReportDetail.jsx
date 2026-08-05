// import { useEffect, useState, useCallback } from 'react'
// import { useParams, Link, useNavigate } from 'react-router-dom'
// import { ArrowLeft, FileText, Clock, CheckCircle2, AlertCircle, Loader2, Download, Stethoscope, MessageSquare, HeartPulse, ListChecks, HelpCircle, Lightbulb } from 'lucide-react'
// import { supabase } from '../lib/supabase.js'

// export default function ReportDetail() {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const [report, setReport] = useState(null)
//   const [analysis, setAnalysis] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [polling, setPolling] = useState(false)

//   const loadReport = useCallback(async () => {
//     const [reportRes, analysisRes] = await Promise.all([
//       supabase.from('medical_reports').select('*').eq('id', id).maybeSingle(),
//       supabase.from('report_analyses').select('*').eq('report_id', id).maybeSingle(),
//     ])
//     if (reportRes.error) console.error('Failed to load report:', reportRes.error)
//     if (analysisRes.error) console.error('Failed to load analysis:', analysisRes.error)
//     setReport(reportRes.data)
//     setAnalysis(analysisRes.data)
//     setLoading(false)
//     setPolling(reportRes.data?.status === 'pending' && !analysisRes.data)
//   }, [id])

//   useEffect(() => { loadReport() }, [loadReport])
//   useEffect(() => {
//     if (!polling) return
//     const interval = setInterval(loadReport, 4000)
//     return () => clearInterval(interval)
//   }, [polling, loadReport])

//   const askAiAboutReport = () => {
//     if (!analysis || !report) return
//     const context = {
//       fileName: report.file_name,
//       summary: analysis.summary,
//       healthInsights: analysis.health_insights,
//       findings: analysis.findings,
//       results: analysis.results,
//     }
//     sessionStorage.setItem('reportContext', JSON.stringify(context))
//     navigate('/chat?fromReport=' + id)
//   }

//   if (loading) return <div className="flex items-center justify-center py-16 sm:py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-700" /></div>
//   if (!report) return <div className="mx-auto max-w-2xl px-4 sm:px-0"><div className="card flex flex-col items-center gap-3 p-6 sm:p-10 text-center"><AlertCircle className="h-10 w-10 text-slate-400" /><h3 className="font-semibold text-slate-700">Report not found</h3><Link to="/reports" className="btn-primary mt-2">Back to Reports</Link></div></div>

//   return (
//     <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6 px-4 sm:px-0 animate-fade-in">
//       <Link to="/reports" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-700"><ArrowLeft className="h-4 w-4" /> Back to Reports</Link>
//       <div className="card p-4 sm:p-6">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
//           <div className="flex items-start gap-3 sm:gap-4">
//             <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50"><FileText className="h-6 w-6 sm:h-7 sm:w-7 text-teal-700" /></div>
//             <div>
//               <h1 className="text-lg sm:text-xl font-bold text-slate-900 break-words">{report.file_name}</h1>
//               <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-slate-500">
//                 <span>{new Date(report.upload_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
//                 {report.service_category && <span className="inline-flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" /> {report.service_category}</span>}
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-3"><StatusBadge status={report.status} />{report.file_url && <a href={report.file_url} target="_blank" rel="noopener noreferrer" className="btn-secondary"><Download className="h-4 w-4" /> View</a>}</div>
//         </div>
//       </div>
//       {report.status === 'pending' && !analysis && <div className="card flex flex-col items-center gap-4 p-6 sm:p-10 text-center"><Loader2 className="h-10 w-10 animate-spin text-teal-700" /><div><h3 className="font-semibold text-slate-700">Analyzing your report…</h3><p className="mt-1 text-sm text-slate-500">This usually takes 15–30 seconds.</p></div></div>}
//       {analysis && <AnalysisView analysis={analysis} onAskAi={askAiAboutReport} />}
//       {report.status === 'failed' && !analysis && <div className="card flex flex-col items-center gap-3 p-6 sm:p-10 text-center"><AlertCircle className="h-10 w-10 text-rose-500" /><h3 className="font-semibold text-slate-700">Processing failed</h3><p className="text-sm text-slate-500">We couldn't process this report. Please try uploading again.</p><Link to="/upload" className="btn-primary mt-2">Upload Again</Link></div>}
//     </div>
//   )
// }

// function AnalysisView({ analysis, onAskAi }) {
//   const findings = analysis.findings || []
//   const results = analysis.results || []
//   const medicalTerms = analysis.medical_terms || []
//   const questions = analysis.questions_for_doctor || []
//   return (
//     <div className="space-y-4 sm:space-y-5 animate-slide-up">
//       {analysis.summary && <div className="card p-4 sm:p-6"><div className="mb-3 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50"><FileText className="h-4 w-4 text-teal-700" /></div><h2 className="font-semibold text-slate-800">Summary</h2></div><p className="text-sm leading-relaxed text-slate-600">{analysis.summary}</p></div>}
//       {analysis.health_insights && <div className="card p-4 sm:p-6"><div className="mb-3 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50"><Lightbulb className="h-4 w-4 text-teal-600" /></div><h2 className="font-semibold text-slate-800">Health Insights</h2></div><p className="text-sm leading-relaxed text-slate-600">{analysis.health_insights}</p></div>}
//       {analysis.recommended_specialty && <div className="card flex items-center gap-3 sm:gap-4 p-4 sm:p-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50"><HeartPulse className="h-5 w-5 text-teal-700" /></div><div><p className="text-sm text-slate-500">Recommended Specialist</p><p className="font-semibold text-slate-800">{analysis.recommended_specialty}</p></div></div>}
//       {findings.length > 0 && <div className="card p-4 sm:p-6"><div className="mb-4 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50"><ListChecks className="h-4 w-4 text-teal-700" /></div><h2 className="font-semibold text-slate-800">Key Findings</h2></div><ul className="space-y-2.5">{findings.map((finding, i) => <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" /><span>{typeof finding === 'string' ? finding : finding.text || JSON.stringify(finding)}</span></li>)}</ul></div>}
//       {results.length > 0 && <div className="card p-4 sm:p-6"><div className="mb-4 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50"><Stethoscope className="h-4 w-4 text-teal-600" /></div><h2 className="font-semibold text-slate-800">Detailed Results</h2></div><div className="space-y-3">{results.map((result, i) => <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3">{typeof result === 'string' ? <p className="text-sm text-slate-600">{result}</p> : <div className="space-y-1">{result.label && <p className="text-sm font-medium text-slate-700">{result.label}</p>}{result.value && <p className="text-sm text-slate-600">{result.value}</p>}{result.range && <p className="text-xs text-slate-400">Reference: {result.range}</p>}</div>}</div>)}</div></div>}
//       {medicalTerms.length > 0 && <div className="card p-4 sm:p-6"><div className="mb-4 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50"><FileText className="h-4 w-4 text-teal-700" /></div><h2 className="font-semibold text-slate-800">Medical Terms Explained</h2></div><div className="space-y-3">{medicalTerms.map((term, i) => <div key={i} className="border-l-2 border-teal-200 pl-3"><p className="text-sm font-medium text-slate-700">{typeof term === 'string' ? term : term.term || term.name}</p>{typeof term === 'object' && (term.definition || term.description) && <p className="mt-0.5 text-sm text-slate-500">{term.definition || term.description}</p>}</div>)}</div></div>}
//       {questions.length > 0 && <div className="card p-4 sm:p-6"><div className="mb-4 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50"><HelpCircle className="h-4 w-4 text-teal-600" /></div><h2 className="font-semibold text-slate-800">Questions to Ask Your Doctor</h2></div><ul className="space-y-2.5">{questions.map((q, i) => <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600"><span className="mt-0.5 font-semibold text-teal-600">Q{i + 1}.</span><span>{typeof q === 'string' ? q : q.question || JSON.stringify(q)}</span></li>)}</ul></div>}
//       <div className="card flex flex-col items-center gap-3 p-4 sm:p-6 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50"><MessageSquare className="h-6 w-6 text-teal-600" /></div><h3 className="font-semibold text-slate-700">Have more questions?</h3><p className="text-sm text-slate-500">Ask our AI assistant about this specific report.</p><button onClick={onAskAi} className="btn-primary mt-1"><MessageSquare className="h-4 w-4" /> Ask AI About This Report</button></div>
//     </div>
//   )
// }

// function StatusBadge({ status }) {
//   const styles = { pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, label: 'Processing' }, completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2, label: 'Completed' }, failed: { bg: 'bg-rose-50', text: 'text-rose-700', icon: AlertCircle, label: 'Failed' } }
//   const style = styles[status] || styles.pending
//   const Icon = style.icon
//   return <span className={`inline-flex items-center gap-1.5 rounded-full ${style.bg} px-3 py-1.5 text-xs font-medium ${style.text}`}><Icon className="h-3.5 w-3.5" />{style.label}</span>
// }


import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Clock, CheckCircle2, AlertCircle, Loader2, Download, Stethoscope, MessageSquare, HeartPulse, ListChecks, HelpCircle, Lightbulb, TrendingUp, AlertTriangle, CheckCheck, Share2 } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})

  const loadReport = useCallback(async () => {
    const [reportRes, analysisRes] = await Promise.all([
      supabase.from('medical_reports').select('*').eq('id', id).maybeSingle(),
      supabase.from('report_analyses').select('*').eq('report_id', id).maybeSingle(),
    ])
    if (reportRes.error) console.error('Failed to load report:', reportRes.error)
    if (analysisRes.error) console.error('Failed to load analysis:', analysisRes.error)
    setReport(reportRes.data)
    setAnalysis(analysisRes.data)
    setLoading(false)
    setPolling(reportRes.data?.status === 'pending' && !analysisRes.data)
  }, [id])

  useEffect(() => { loadReport() }, [loadReport])
  useEffect(() => {
    if (!polling) return
    const interval = setInterval(loadReport, 4000)
    return () => clearInterval(interval)
  }, [polling, loadReport])

  const askAiAboutReport = () => {
    if (!analysis || !report) return
    const context = {
      fileName: report.file_name,
      summary: analysis.summary,
      healthInsights: analysis.health_insights,
      findings: analysis.findings,
      results: analysis.results,
      medicalTerms: analysis.medical_terms,
      questions: analysis.questions_for_doctor,
    }
    sessionStorage.setItem('reportContext', JSON.stringify(context))
    navigate('/chat?fromReport=' + id)
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-teal-700" />
          <p className="text-slate-600 font-medium">Loading your report...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="card flex flex-col items-center gap-4 p-6 sm:p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Report Not Found</h3>
              <p className="mt-2 text-slate-600">The report you're looking for doesn't exist or has been deleted.</p>
            </div>
            <Link to="/reports" className="btn-primary mt-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Reports
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back Button */}
        <Link to="/reports" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors mb-6 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Reports</span>
        </Link>

        {/* Report Header Card */}
        <div className="card mb-6 sm:mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-slate-200 px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-100">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-teal-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold text-slate-900 break-words line-clamp-2">{report.file_name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(report.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {report.service_category && (
                      <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full">
                        <Stethoscope className="h-3.5 w-3.5" />
                        {report.service_category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <StatusBadge status={report.status} />
                {report.file_url && (
                  <a
                    href={report.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <Download className="h-4 w-4" />
                    <span>View File</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {report.status === 'pending' && !analysis && (
          <div className="card flex flex-col items-center gap-4 p-8 sm:p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Analyzing Your Report</h3>
              <p className="mt-2 text-slate-600">Our AI is carefully reviewing your medical report. This usually takes 15–30 seconds.</p>
            </div>
            <div className="mt-4 w-full max-w-xs bg-slate-200 rounded-full h-2">
              <div className="bg-teal-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* Failed State */}
        {report.status === 'failed' && !analysis && (
          <div className="card flex flex-col items-center gap-4 p-8 sm:p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Processing Failed</h3>
              <p className="mt-2 text-slate-600">We encountered an issue analyzing this report. Please try uploading again or contact support.</p>
            </div>
            <Link to="/upload" className="btn-primary mt-4">
              Upload Another Report
            </Link>
          </div>
        )}

        {/* Analysis View */}
        {analysis && <AnalysisView analysis={analysis} onAskAi={askAiAboutReport} expandedSections={expandedSections} toggleSection={toggleSection} />}
      </div>
    </div>
  )
}

function AnalysisView({ analysis, onAskAi, expandedSections, toggleSection }) {
  const findings = analysis.findings || []
  const results = analysis.results || []
  const medicalTerms = analysis.medical_terms || []
  const questions = analysis.questions_for_doctor || []
  const riskLevel = analysis.risk_level || 'normal'

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' }
      case 'medium':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-600' }
      default:
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' }
    }
  }

  const riskColors = getRiskColor(riskLevel)

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      {/* Risk Assessment Banner */}
      {riskLevel && (
        <div className={`card border-l-4 ${riskColors.border} ${riskColors.bg} p-4 sm:p-6`}>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg ${riskColors.bg}`}>
              {riskLevel.toLowerCase() === 'high' ? (
                <AlertTriangle className={`h-6 w-6 sm:h-7 sm:w-7 ${riskColors.icon}`} />
              ) : riskLevel.toLowerCase() === 'medium' ? (
                <TrendingUp className={`h-6 w-6 sm:h-7 sm:w-7 ${riskColors.icon}`} />
              ) : (
                <CheckCheck className={`h-6 w-6 sm:h-7 sm:w-7 ${riskColors.icon}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm sm:text-base ${riskColors.text}`}>
                Risk Level: {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
              </h3>
              <p className={`mt-1 text-xs sm:text-sm ${riskColors.text} opacity-90`}>
                {riskLevel.toLowerCase() === 'high'
                  ? 'This report indicates findings that require prompt medical attention. Please consult with your healthcare provider.'
                  : riskLevel.toLowerCase() === 'medium'
                  ? 'This report shows some findings that may need monitoring. Schedule a follow-up with your doctor.'
                  : 'This report shows normal or healthy findings. Continue regular check-ups.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Section */}
      {analysis.summary && (
        <AnalysisCard
          icon={FileText}
          title="Summary"
          color="teal"
          expanded={expandedSections.summary}
          onToggle={() => toggleSection('summary')}
        >
          <p className="text-sm sm:text-base leading-relaxed text-slate-700">{analysis.summary}</p>
        </AnalysisCard>
      )}

      {/* Health Insights Section */}
      {analysis.health_insights && (
        <AnalysisCard
          icon={Lightbulb}
          title="Health Insights"
          color="amber"
          expanded={expandedSections.insights}
          onToggle={() => toggleSection('insights')}
        >
          <p className="text-sm sm:text-base leading-relaxed text-slate-700">{analysis.health_insights}</p>
        </AnalysisCard>
      )}

      {/* Recommended Specialist */}
      {analysis.recommended_specialty && (
        <div className="card p-4 sm:p-6 border-l-4 border-teal-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-teal-100">
              <HeartPulse className="h-6 w-6 sm:h-7 sm:w-7 text-teal-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Recommended Specialist</p>
              <p className="mt-1 font-semibold text-sm sm:text-base text-slate-900">{analysis.recommended_specialty}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Findings Section */}
      {findings.length > 0 && (
        <AnalysisCard
          icon={ListChecks}
          title="Key Findings"
          color="teal"
          count={findings.length}
          expanded={expandedSections.findings}
          onToggle={() => toggleSection('findings')}
        >
          <ul className="space-y-3">
            {findings.map((finding, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                <span className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  {typeof finding === 'string' ? finding : finding.text || JSON.stringify(finding)}
                </span>
              </li>
            ))}
          </ul>
        </AnalysisCard>
      )}

      {/* Detailed Results Section */}
      {results.length > 0 && (
        <AnalysisCard
          icon={Stethoscope}
          title="Detailed Results"
          color="blue"
          count={results.length}
          expanded={expandedSections.results}
          onToggle={() => toggleSection('results')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {results.map((result, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4 hover:border-teal-300 transition-colors">
                {typeof result === 'string' ? (
                  <p className="text-sm sm:text-base text-slate-700">{result}</p>
                ) : (
                  <div className="space-y-2">
                    {result.label && (
                      <p className="font-semibold text-sm sm:text-base text-slate-900">{result.label}</p>
                    )}
                    {result.value && (
                      <p className="text-sm sm:text-base text-slate-700">{result.value}</p>
                    )}
                    {result.range && (
                      <p className="text-xs sm:text-sm text-slate-500 border-t border-slate-200 pt-2">
                        <span className="font-medium">Reference Range:</span> {result.range}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </AnalysisCard>
      )}

      {/* Medical Terms Section */}
      {medicalTerms.length > 0 && (
        <AnalysisCard
          icon={MessageSquare}
          title="Medical Terms Explained"
          color="purple"
          count={medicalTerms.length}
          expanded={expandedSections.terms}
          onToggle={() => toggleSection('terms')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {medicalTerms.map((term, i) => (
              <div key={i} className="border-l-4 border-purple-300 bg-purple-50 p-3 sm:p-4 rounded-r-lg">
                <p className="font-semibold text-sm sm:text-base text-slate-900">
                  {typeof term === 'string' ? term : term.term || term.name}
                </p>
                {typeof term === 'object' && (term.definition || term.description) && (
                  <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {term.definition || term.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </AnalysisCard>
      )}

      {/* Questions for Doctor Section */}
      {questions.length > 0 && (
        <AnalysisCard
          icon={HelpCircle}
          title="Questions to Ask Your Doctor"
          color="cyan"
          count={questions.length}
          expanded={expandedSections.questions}
          onToggle={() => toggleSection('questions')}
        >
          <ul className="space-y-3">
            {questions.map((q, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 font-semibold text-xs text-cyan-700">
                  {i + 1}
                </span>
                <span className="text-sm sm:text-base text-slate-700 leading-relaxed pt-0.5">
                  {typeof q === 'string' ? q : q.question || JSON.stringify(q)}
                </span>
              </li>
            ))}
          </ul>
        </AnalysisCard>
      )}

      {/* CTA Section */}
      <div className="card p-6 sm:p-8 text-center bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200">
        <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-teal-100 mx-auto mb-4">
          <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8 text-teal-700" />
        </div>
        <h3 className="font-semibold text-slate-900 text-lg sm:text-xl">Have More Questions?</h3>
        <p className="mt-2 text-slate-700 text-sm sm:text-base">
          Chat with our AI assistant to get personalized insights about this report and discuss your health concerns.
        </p>
        <button
          onClick={onAskAi}
          className="btn-primary mt-6 mx-auto"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Ask AI About This Report</span>
        </button>
      </div>
    </div>
  )
}

function AnalysisCard({ icon: Icon, title, color, count, expanded, onToggle, children }) {
  const colorMap = {
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-700', header: 'text-teal-900' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-700', header: 'text-amber-900' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-700', header: 'text-blue-900' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-700', header: 'text-purple-900' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: 'text-cyan-700', header: 'text-cyan-900' },
  }

  const colors = colorMap[color] || colorMap.teal

  return (
    <div className={`card border-l-4 ${colors.border} overflow-hidden transition-all hover:shadow-md`}>
      <button
        onClick={onToggle}
        className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${colors.icon}`} />
          </div>
          <div className="text-left min-w-0">
            <h3 className={`font-semibold text-sm sm:text-base ${colors.header}`}>{title}</h3>
            {count && (
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{count} item{count !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.bg} transition-transform ${expanded ? 'rotate-180' : ''}`}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className={`border-t ${colors.border} px-4 sm:px-6 py-4 sm:py-5 bg-white`}>
          {children}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, label: 'Processing' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2, label: 'Completed' },
    failed: { bg: 'bg-rose-50', text: 'text-rose-700', icon: AlertCircle, label: 'Failed' },
  }
  const style = styles[status] || styles.pending
  const Icon = style.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${style.bg} px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium ${style.text} whitespace-nowrap`}>
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      {style.label}
    </span>
  )
}
