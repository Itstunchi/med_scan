import { useState, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UploadCloud, FileText, X, Loader2, CheckCircle2, AlertCircle, Stethoscope, ArrowLeft, FileImage } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs'
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc

const serviceCategories = ['General Health','Dental Care','Eye Care','Cardiology','Neurology','Nutrition','Laboratory','Radiology','Orthopedics','Medication Information']

export default function Upload() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [category, setCategory] = useState('General Health')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(selectedFile.type)) { setError('Please upload a PDF or image file (PNG, JPEG, WebP).'); return }
    if (selectedFile.size > 10 * 1024 * 1024) { setError('File size must be under 10 MB.'); return }
    setError('')
    setFile(selectedFile)
    setPreview(selectedFile.type.startsWith('image/') ? URL.createObjectURL(selectedFile) : null)
  }, [])

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]) }, [handleFileSelect])

  async function fileToImageBase64(selectedFile) {
    if (selectedFile.type.startsWith('image/')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(selectedFile)
      })
    }
    const arrayBuffer = await selectedFile.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext('2d')
    await page.render({ canvasContext: context, viewport }).promise
    return canvas.toDataURL('image/png')
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    setProgress(10)
    setStatusText('Uploading file…')

    try {
      const filePath = `${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('medical-reports').upload(filePath, file)
      if (uploadError) throw uploadError
      setProgress(35)

      const { data: urlData } = supabase.storage.from('medical-reports').getPublicUrl(filePath)

      setStatusText('Saving report…')
      const { data: reportRow, error: dbError } = await supabase
        .from('medical_reports')
        .insert({
          file_name: file.name,
          file_url: urlData.publicUrl,
          report_type: category.toLowerCase().replace(/\s+/g, '_'),
          service_category: category,
          status: 'pending',
        })
        .select('id')
        .single()
      if (dbError) throw dbError
      setProgress(55)

      setStatusText('Reading document…')
      const imageBase64 = await fileToImageBase64(file)
      setProgress(70)

      setStatusText('Analyzing with AI…')
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-report`
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ reportId: reportRow.id, imageBase64, serviceCategory: category }),
      })
      const result = await response.json()
      if (result.error) throw new Error(result.error)

      setProgress(100)
      setStatusText('Done!')
      setTimeout(() => navigate(`/reports/${reportRow.id}`), 400)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to upload and analyze. Please try again.')
      setUploading(false)
      setProgress(0)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setProgress(0)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isPdf = file?.type === 'application/pdf'

  return (
    <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6 px-4 sm:px-0 animate-fade-in">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-sky-700">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div><h1 className="text-xl sm:text-2xl font-bold text-slate-900">Upload Medical Report</h1><p className="mt-1 text-sm text-slate-500">Add a document and get an AI-generated explanation.</p></div>

      {error && <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 animate-fade-in"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}

      {!file && (
        <div onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`card flex cursor-pointer flex-col items-center gap-3 sm:gap-4 p-6 sm:p-12 text-center transition-all ${dragOver ? 'border-sky-400 bg-sky-50' : 'hover:border-sky-300 hover:bg-slate-50'}`}>
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-sky-50"><UploadCloud className="h-7 w-7 sm:h-8 sm:w-8 text-sky-700" /></div>
          <div><p className="font-semibold text-slate-700">Drop your file here or click to browse</p><p className="mt-1 text-sm text-slate-400">PDF, PNG, JPEG, or WebP — max 10 MB</p></div>
          <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => handleFileSelect(e.target.files[0])} className="hidden" />
        </div>
      )}

      {file && (
        <div className="card p-4 sm:p-6 animate-slide-up">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                {isPdf ? <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-sky-700" /> : <FileImage className="h-5 w-5 sm:h-6 sm:w-6 text-sky-700" />}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800">{file.name}</p>
                <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!uploading && <button onClick={clearFile} className="shrink-0 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>}
          </div>

          {preview && <div className="mt-4 overflow-hidden rounded-xl border border-slate-200"><img src={preview} alt="Preview" className="max-h-64 sm:max-h-80 w-full object-contain bg-slate-50" /></div>}

          {uploading && (
            <div className="mt-4 sm:mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>{statusText}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-600 to-cyan-600 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {!uploading && (
            <>
              <div className="mt-4 sm:mt-5">
                <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700"><Stethoscope className="h-4 w-4 text-slate-400" /> Service Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field cursor-pointer">{serviceCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select>
              </div>
              <button onClick={handleUpload} className="btn-primary mt-4 sm:mt-5 w-full py-3"><CheckCircle2 className="h-4 w-4" /> Upload & Analyze</button>
            </>
          )}
        </div>
      )}

      <div className="card flex items-start gap-3 p-4 sm:p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50"><AlertCircle className="h-5 w-5 text-sky-600" /></div>
        <div><p className="text-sm font-medium text-slate-700">Your data is secure</p><p className="mt-0.5 text-sm text-slate-500">All uploads are encrypted and stored securely. Only you can access your medical reports.</p></div>
      </div>
    </div>
  )
}