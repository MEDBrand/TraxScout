'use client';

// Crate hook — one-tap save/unsave
// Optimistic UI: updates instantly, syncs to Supabase in background
// Offline support: queues actions for when connection returns

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-browser';
import { haptic } from '@/lib/haptics';

interface CrateTrack {
  trackId: string;
  savedAt: string;
}

const OFFLINE_QUEUE_KEY = 'traxscout_crate_queue';

export function useCrate() {
  const { user } = useAuth();
  const [savedTracks, setSavedTracks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load saved tracks on mount
  useEffect(() => {
    if (!user) return;

    async function load() {
      const { data } = await supabase
        .from('user_tracks')
        .select('track_id')
        .eq('user_id', user!.id)
        .eq('status', 'saved');

      if (data) {
        setSavedTracks(new Set(data.map(d => d.track_id)));
      }
      setLoading(false);

      // Flush any offline queue
      flushOfflineQueue();
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleSave = useCallback(async (trackId: string) => {
    if (!user) return;

    const isSaved = savedTracks.has(trackId);
    const newStatus = isSaved ? 'skipped' : 'saved';

    // Optimistic update
    setSavedTracks(prev => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });

    haptic(isSaved ? 'light' : 'success');

    // Sync to database
    try {
      await supabase.from('user_tracks').upsert({
        user_id: user.id,
        track_id: trackId,
        status: newStatus,
      });
    } catch {
      // Queue for offline sync
      queueOfflineAction({ trackId, status: newStatus, userId: user.id });
    }
  }, [user, savedTracks]);

  const isSaved = useCallback((trackId: string) => savedTracks.has(trackId), [savedTracks]);

  const savedCount = savedTracks.size;

  async function flushOfflineQueue() {
    if (!user) return;
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    const remaining = [];
    for (const action of queue) {
      try {
        await supabase.from('user_tracks').upsert({
          user_id: action.userId,
          track_id: action.trackId,
          status: action.status,
        });
      } catch {
        remaining.push(action);
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  }

  return { isSaved, toggleSave, savedCount, loading };
}

function queueOfflineAction(action: { trackId: string; status: string; userId: string }) {
  const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  queue.push(action);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}
