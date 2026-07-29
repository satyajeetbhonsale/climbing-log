import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useSessionsData() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('sessions')
        .select('*, climbs(*)')
        .order('date', { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setSessions(data ?? []);
      }
      setLoading(false);
    }

    loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  return { sessions, setSessions, loading, error };
}
