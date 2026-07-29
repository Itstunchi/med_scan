import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) { console.error('Error fetching profile:', error); return null }
    return data
  }, [])

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      if (session?.user?.id) fetchProfile(session.user.id).then((p) => { if (mounted) setProfile(p) })
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user?.id) fetchProfile(session.user.id).then((p) => setProfile(p))
      else setProfile(null)
      setLoading(false)
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [fetchProfile])

  const signIn = async (email, password) => { const { data, error } = await supabase.auth.signInWithPassword({ email, password }); return { data, error } }
  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    if (data.user && !error) await supabase.from('profiles').upsert({ id: data.user.id, email, full_name: fullName, role: 'patient' })
    return { data, error }
  }
  const signOut = async () => { await supabase.auth.signOut(); setSession(null); setProfile(null) }
  const refreshProfile = async () => { if (session?.user?.id) setProfile(await fetchProfile(session.user.id)) }

  const value = { session, profile, user: session?.user ?? null, loading, signIn, signUp, signOut, refreshProfile }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
