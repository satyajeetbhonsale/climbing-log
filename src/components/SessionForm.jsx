import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getGradeSystem, getGradeOptions } from '../lib/grades';

const VENUE_TYPES = ['indoor', 'outdoor'];
const DISCIPLINES = ['top-rope', 'lead', 'boulder'];
const SEND_TYPES = ['onsight', 'flash', 'redpoint', 'attempt', 'fall'];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyClimb() {
  return { grade: '', send_type: SEND_TYPES[0], notes: '' };
}

function emptySession() {
  return {
    date: today(),
    venue_type: '',
    discipline: '',
    location: '',
    notes: '',
  };
}

export default function SessionForm() {
  const [session, setSession] = useState(emptySession);
  const [climbs, setClimbs] = useState([emptyClimb()]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const gradeSystem = getGradeSystem(session.discipline, session.venue_type);
  const gradeOptions = getGradeOptions(gradeSystem);

  const isValid =
    session.date &&
    session.venue_type &&
    session.discipline &&
    climbs.every((c) => c.grade);

  function updateSession(field, value) {
    setSuccess(false);
    setSession((s) => ({ ...s, [field]: value }));
  }

  function updateClimb(index, field, value) {
    setSuccess(false);
    setClimbs((rows) =>
      rows.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  function addClimb() {
    setClimbs((rows) => [...rows, emptyClimb()]);
  }

  function removeClimb(index) {
    setClimbs((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!isValid || saving) return;

    setSaving(true);
    setError(null);

    const { data: sessionRow, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        date: session.date,
        venue_type: session.venue_type,
        discipline: session.discipline,
        location: session.location,
        notes: session.notes,
      })
      .select()
      .single();

    if (sessionError) {
      setError(sessionError.message);
      setSaving(false);
      return;
    }

    const climbRows = climbs.map((c) => ({
      session_id: sessionRow.id,
      grade: c.grade,
      send_type: c.send_type,
      notes: c.notes,
      grade_system: gradeSystem,
    }));

    const { error: climbsError } = await supabase.from('climbs').insert(climbRows);

    if (climbsError) {
      setError(climbsError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);
    setSession(emptySession());
    setClimbs([emptyClimb()]);
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Log a session</h2>

      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={session.date}
              onChange={(e) => updateSession('date', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue type
            </label>
            <select
              value={session.venue_type}
              onChange={(e) => updateSession('venue_type', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select...</option>
              {VENUE_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discipline
            </label>
            <select
              value={session.discipline}
              onChange={(e) => updateSession('discipline', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select...</option>
              {DISCIPLINES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={session.location}
              onChange={(e) => updateSession('location', e.target.value)}
              placeholder="e.g. Boulder Gym Downtown"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={session.notes}
            onChange={(e) => updateSession('notes', e.target.value)}
            rows={2}
            placeholder="Optional"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Climbs</h3>

        {climbs.map((climb, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-4 flex gap-3 items-end"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <select
                value={climb.grade}
                onChange={(e) => updateClimb(index, 'grade', e.target.value)}
                disabled={!gradeSystem}
                className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">
                  {gradeSystem ? 'Select...' : 'Set discipline/venue first'}
                </option>
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Send type
              </label>
              <select
                value={climb.send_type}
                onChange={(e) => updateClimb(index, 'send_type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {SEND_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={climb.notes}
                onChange={(e) => updateClimb(index, 'notes', e.target.value)}
                placeholder="Optional"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {climbs.length > 1 && (
              <button
                type="button"
                onClick={() => removeClimb(index)}
                aria-label="Remove climb"
                className="mb-2 text-gray-400 hover:text-red-600 px-2 py-2"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addClimb}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          + Add another climb
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          Session saved!
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={!isValid || saving}
        className="w-full bg-blue-600 text-white font-semibold rounded-md py-2.5 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Save session'}
      </button>
    </div>
  );
}
