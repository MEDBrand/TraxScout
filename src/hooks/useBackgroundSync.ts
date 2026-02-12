'use client';

// Background sync hook — triggers platform scan after login
// Uses smart caching: stores lastSyncAt per source, only fetches new tracks
// Data is ready before the user ever sees a loading spinner

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-browser';

interface SyncStatus {
  syncing: boolean;
  lastSyncAt: string | null;
  sources: { id: string; status: string; trackCount: number }[];
  error: string | null;
}

const SYNC_CACHE_KEY = 'traxscout_last_sync';
const MIN_SYNC_INTERVAL_MS = 5 * 60 * 1000; // Don't re-sync within 5 minutes

export function useBackgroundSync() {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    syncing: false,
    lastSyncAt: null,
    sources: [],
    error: null,
  });
  const syncingRef = useRef(false);

  const shouldSync = useCallback((): boolean => {
    const cached = localStorage.getItem(SYNC_CACHE_KEY);
    if (!cached) return true;

    const lastSync = new Date(cached).getTime();
    return Date.now() - lastSync > MIN_SYNC_INTERVAL_MS;
  }, []);

  const triggerSync = useCallback(async () => {
    if (!user || syncingRef.current) return;
    if (!shouldSync()) return;

    syncingRef.current = true;
    setSyncStatus(prev => ({ ...prev, syncing: true, error: null }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      // Fetch with smart caching: pass lastSyncAt so backend can diff
      const lastSync = localStorage.getItem(SYNC_CACHE_KEY);
      const params = new URLSearchParams();
      if (lastSync) params.set('since', lastSync);

      const response = await fetch(`/api/tracks?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) throw new Error('Sync failed');

      const data = await response.json();
      const now = new Date().toISOString();

      localStorage.setItem(SYNC_CACHE_KEY, now);

      setSyncStatus({
        syncing: false,
        lastSyncAt: now,
        sources: data.sources || [],
        error: null,
      });
    } catch (err) {
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        error: err instanceof Error ? err.message : 'Sync failed',
      }));
    } finally {
      syncingRef.current = false;
    }
  }, [user, shouldSync]);

  // Auto-sync on login
  useEffect(() => {
    if (user) {
      triggerSync();
    }
  }, [user, triggerSync]);

  return { ...syncStatus, triggerSync };
}
