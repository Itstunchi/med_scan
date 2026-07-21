import { useState, useRef, useCallback } from 'react'
import { UploadCloud, FileText, X, Loader2, CheckCircle2, AlertCircle, Stethoscope } from 'lucide-react'

const serviceCategories = ['General Health','Dental Care','Eye Care','Cardiology','Neurology','Nutrition','Laboratory','Radiology','Orthopedics','Medication Information']

export default function Upload() {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [category, setCategory] = useState('General Health')
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return
    const validTypes = ['application/pdf','image/png','image/jpeg','image/jpg','image/webp']
    if (!validTypes.includes(selectedFile.type)) { setError('Please upload a PDF or image file (PNG, JPEG, WebP).'); return }
    if (selectedFile.size > 10 * 1024 * 1024) { setError('File size must be under 10 MB.'); return }
    setError(''); setFile(selectedFile)
    setPreview(selectedFile.type.startsWith('image/') ? URL.createObjectURL(selectedFile) : null)
  }, [])

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]) }, [handleFileSelect])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true); setError(''); setSuccess(false)
    try {
      // TODO: replace this with a real upload to your backend/storage
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
      setUploading(false)
    } catch (err) {
      setError(err.message || 'Failed to upload. Please try again.')
      setUploading(false)
    }
  }

  const clearFile = () => { setFile(null); setPreview(null); setSuccess(false); if (fileInputRef.current) fileInputRef.current.value = '' }

  return (
    <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6 px-4 sm:px-0 animate-fade-in">
      <div><h1 className="text-xl sm:text-2xl font-bold text-slate-900">Upload Medical Report</h1><p className="mt-1 text-sm text-slate-500">Add a medical document to your records.</p></div>
      {error && <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 animate-fade-in"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
      {success && <div className="flex items-start gap-2.5 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-700 animate-fade-in"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>Report uploaded successfully.</span></div>}
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
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50"><FileText className="h-5 w-5 sm:h-6 sm:w-6 text-teal-700" /></div>
              <div className="min-w-0"><p className="truncate font-medium text-slate-800">{file.name}</p><p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
            </div>
            <button onClick={clearFile} className="shrink-0 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
          </div>
          {preview && <div className="mt-4 overflow-hidden rounded-xl border border-slate-200"><img src={preview} alt="Preview" className="max-h-64 sm:max-h-80 w-full object-contain bg-slate-50" /></div>}
          <div className="mt-4 sm:mt-5">
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700"><Stethoscope className="h-4 w-4 text-slate-400" /> Service Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field cursor-pointer">{serviceCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select>
          </div>
          <button onClick={handleUpload} disabled={uploading} className="btn-primary mt-4 sm:mt-5 w-full py-3">{uploading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>) : (<><CheckCircle2 className="h-4 w-4" /> Upload Report</>)}</button>
        </div>
      )}
      <div className="card flex items-start gap-3 p-4 sm:p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50"><AlertCircle className="h-5 w-5 text-teal-600" /></div>
        <div><p className="text-sm font-medium text-slate-700">Your data is secure</p><p className="mt-0.5 text-sm text-slate-500">All uploads are encrypted and stored securely. Only you can access your medical reports.</p></div>
      </div>
    </div>
  )
}