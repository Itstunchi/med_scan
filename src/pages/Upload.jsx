import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { UploadCloud, FileText, X, Loader2, CheckCircle2, AlertCircle, Stethoscope, ArrowLeft, FileImage, RotateCcw } from 'lucide-react'

const serviceCategories = ['General Health','Dental Care','Eye Care','Cardiology','Neurology','Nutrition','Laboratory','Radiology','Orthopedics','Medication Information']

export default function Upload() {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [category, setCategory] = useState('General Health')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return
    const validTypes = ['application/pdf','image/png','image/jpeg','image/jpg','image/webp']
    if (!validTypes.includes(selectedFile.type)) { setError('Please upload a PDF or image file (PNG, JPEG, WebP).'); return }
    if (selectedFile.size > 10 * 1024 * 1024) { setError('File size must be under 10 MB.'); return }
    setError(''); setSuccess(false); setFile(selectedFile)
    setPreview(selectedFile.type.startsWith('image/') ? URL.createObjectURL(selectedFile) : null)
  }, [])

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]) }, [handleFileSelect])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true); setError(''); setSuccess(false); setProgress(0)
    try {
      // TODO: replace this simulated progress with real upload progress (e.g. XMLHttpRequest.upload.onprogress)
      await new Promise((resolve) => {
        let pct = 0
        const interval = setInterval(() => {
          pct += Math.random() * 25
          if (pct >= 100) {
            pct = 100
            clearInterval(interval)
            setProgress(100)
            setTimeout(resolve, 200)
          } else {
            setProgress(pct)
          }
        }, 200)
      })
      setSuccess(true)
      setUploading(false)
    } catch (err) {
      setError(err.message || 'Failed to upload. Please try again.')
      setUploading(false)
    }
  }

  const clearFile = () => { setFile(null); setPreview(null); setSuccess(false); setProgress(0); if (fileInputRef.current) fileInputRef.current.value = '' }

  const isPdf = file?.type === 'application/pdf'

  return (
    <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6 px-4 sm:px-0 animate-fade-in">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-700">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div><h1 className="text-xl sm:text-2xl font-bold text-slate-900">Upload Medical Report</h1><p className="mt-1 text-sm text-slate-500">Add a medical document to your records.</p></div>

      {error && <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 animate-fade-in"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
      {success && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-700 animate-fade-in">
          <div className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>Report uploaded successfully.</span></div>
          <button onClick={clearFile} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100">
            <RotateCcw className="h-3.5 w-3.5" /> Upload Another
          </button>
        </div>
      )}

      {!file && (
        <div onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`card flex cursor-pointer flex-col items-center gap-3 sm:gap-4 p-6 sm:p-12 text-center transition-all ${dragOver ? 'border-teal-400 bg-teal-50' : 'hover:border-teal-300 hover:bg-slate-50'}`}>
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-teal-50"><UploadCloud className="h-7 w-7 sm:h-8 sm:w-8 text-teal-700" /></div>
          <div><p className="font-semibold text-slate-700">Drop your file here or click to browse</p><p className="mt-1 text-sm text-slate-400">PDF, PNG, JPEG, or WebP — max 10 MB</p></div>
          <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => handleFileSelect(e.target.files[0])} className="hidden" />
        </div>
      )}

      {file && (
        <div className="card p-4 sm:p-6 animate-slide-up">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                {isPdf ? <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-teal-700" /> : <FileImage className="h-5 w-5 sm:h-6 sm:w-6 text-teal-700" />}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-slate-800">{file.name}</p>
                  <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{isPdf ? 'PDF' : 'Image'}</span>
                </div>
                <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!uploading && <button onClick={clearFile} className="shrink-0 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>}
          </div>

          {preview && <div className="mt-4 overflow-hidden rounded-xl border border-slate-200"><img src={preview} alt="Preview" className="max-h-64 sm:max-h-80 w-full object-contain bg-slate-50" /></div>}

          {uploading && (
            <div className="mt-4 sm:mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Uploading…</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-teal-gradient transition-all duration-200 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {!success && (
            <div className="mt-4 sm:mt-5">
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700"><Stethoscope className="h-4 w-4 text-slate-400" /> Service Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={uploading} className="input-field cursor-pointer disabled:opacity-60">{serviceCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select>
            </div>
          )}

          {!success && (
            <button onClick={handleUpload} disabled={uploading} className="btn-primary mt-4 sm:mt-5 w-full py-3">{uploading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>) : (<><CheckCircle2 className="h-4 w-4" /> Upload Report</>)}</button>
          )}
        </div>
      )}

      <div className="card flex items-start gap-3 p-4 sm:p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50"><AlertCircle className="h-5 w-5 text-teal-600" /></div>
        <div><p className="text-sm font-medium text-slate-700">Your data is secure</p><p className="mt-0.5 text-sm text-slate-500">All uploads are encrypted and stored securely. Only you can access your medical reports.</p></div>
      </div>
    </div>
  )
}