import { Activity } from 'lucide-react'
export default function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-gradient shadow-teal">
          <Activity className="h-8 w-8 animate-pulse text-white" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-teal-600 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-teal-600 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-teal-600"></div>
        </div>
        <p className="text-sm font-medium text-slate-500">Loading MediScan…</p>
      </div>
    </div>
  )
}
