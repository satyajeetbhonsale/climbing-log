import { useState } from 'react'
import SessionForm from './components/SessionForm'
import SessionList from './components/SessionList'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import { useAuth } from './lib/useAuth'
import { supabase } from './lib/supabaseClient'

const TABS = [
  { id: 'log', label: 'Log Session' },
  { id: 'view', label: 'View Sessions' },
  { id: 'dashboard', label: 'Dashboard' },
]

function App() {
  const [tab, setTab] = useState('log')
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="flex justify-end max-w-4xl mx-auto px-6 mb-2">
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="text-sm font-medium text-gray-500 hover:text-red-600"
        >
          Log out
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
        Climbing Tracker
      </h1>

      <div className="flex justify-center gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              tab === t.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'log' && <SessionForm />}
      {tab === 'view' && <SessionList />}
      {tab === 'dashboard' && <Dashboard />}
    </div>
  )
}

export default App
