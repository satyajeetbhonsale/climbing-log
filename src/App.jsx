import { useState } from 'react'
import SessionForm from './components/SessionForm'
import SessionList from './components/SessionList'
import Dashboard from './components/Dashboard'

const TABS = [
  { id: 'log', label: 'Log Session' },
  { id: 'view', label: 'View Sessions' },
  { id: 'dashboard', label: 'Dashboard' },
]

function App() {
  const [tab, setTab] = useState('log')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
