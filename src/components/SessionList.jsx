import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSessionsData } from '../lib/useSessionsData';

export default function SessionList() {
  const { sessions, setSessions, loading, error } = useSessionsData();
  const [deleteError, setDeleteError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());

  function toggleSelected(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function deleteSessions(ids) {
    setDeleteError(null);
    setDeletingIds(new Set(ids));

    const { error: deleteErr } = await supabase.from('sessions').delete().in('id', ids);

    setDeletingIds(new Set());

    if (deleteErr) {
      setDeleteError(deleteErr.message);
      return;
    }

    const idSet = new Set(ids);
    setSessions((prev) => prev.filter((s) => !idSet.has(s.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  function handleDeleteOne(id) {
    if (!window.confirm('Delete this session and all its climbs?')) return;
    deleteSessions([id]);
  }

  function handleDeleteSelected() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Delete ${ids.length} selected session${ids.length > 1 ? 's' : ''} and all their climbs?`
      )
    )
      return;
    deleteSessions(ids);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-gray-500">Loading sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Sessions</h2>
        {selectedIds.size > 0 && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={deletingIds.size > 0}
            className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 rounded-md px-3 py-1.5"
          >
            Delete selected ({selectedIds.size})
          </button>
        )}
      </div>

      {deleteError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {deleteError}
        </div>
      )}

      {sessions.length === 0 ? (
        <p className="text-gray-500">No sessions logged yet.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-lg shadow p-4 space-y-3 opacity-100"
              style={{ opacity: deletingIds.has(session.id) ? 0.5 : 1 }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(session.id)}
                    onChange={() => toggleSelected(session.id)}
                    aria-label="Select session"
                    className="h-4 w-4"
                  />
                  <span className="font-semibold text-gray-800">{session.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {session.venue_type} &middot; {session.discipline}
                    {session.location ? ` · ${session.location}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteOne(session.id)}
                    disabled={deletingIds.has(session.id)}
                    className="text-sm font-medium text-gray-400 hover:text-red-600 disabled:text-gray-300"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {session.notes && (
                <p className="text-sm text-gray-600 italic">{session.notes}</p>
              )}

              {session.climbs?.length > 0 ? (
                <ul className="text-sm text-gray-700 divide-y divide-gray-100">
                  {session.climbs.map((climb) => (
                    <li key={climb.id} className="py-1.5 flex flex-wrap gap-x-2">
                      <span className="font-medium">{climb.grade}</span>
                      <span className="text-gray-500">{climb.send_type}</span>
                      {climb.notes && (
                        <span className="text-gray-400">&mdash; {climb.notes}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No climbs recorded.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
