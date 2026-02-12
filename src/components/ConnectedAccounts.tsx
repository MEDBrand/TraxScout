'use client';

// Connected Accounts — Settings component
// Users connect their own Beatport, Traxsource, Inflyte, Trackstack accounts
// "Mint.com for DJ tracks"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { getAllSources, getSourcesForTier } from '@/config/sources';
import { connectWithCredentials, disconnectSource, getConnections } from '@/app/actions/connections';
import type { SourceConfig } from '@/types';

interface Connection {
  id: string;
  sourceId: string;
  status: string;
  lastSyncAt: string | null;
  lastError: string | null;
}

const SOURCE_ICONS: Record<string, string> = {
  beatport: '🟢',
  traxsource: '🔵',
  inflyte: '🟣',
  trackstack: '🟠',
  trackscout: '⚡',
};

export function ConnectedAccounts() {
  const { user, profile } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingSource, setConnectingSource] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tier = profile?.tier || 'basic';
  const availableSources = getSourcesForTier(tier).filter(s => s.authType !== 'none');
  const allSources = getAllSources().filter(s => s.authType !== 'none');

  useEffect(() => {
    if (user) {
      loadConnections();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadConnections() {
    if (!user) return;
    const conns = await getConnections(user.id);
    setConnections(conns);
  }

  function getConnection(sourceId: string): Connection | undefined {
    return connections.find(c => c.sourceId === sourceId);
  }

  function isAvailable(source: SourceConfig): boolean {
    return source.tier.includes(tier as SourceConfig['tier'][number]);
  }

  async function handleConnect(sourceId: string) {
    if (!user || !email || !password) return;

    setLoading(true);
    setError('');

    const result = await connectWithCredentials(user.id, sourceId, { email, password });

    setLoading(false);

    if (result.success) {
      setConnectingSource(null);
      setEmail('');
      setPassword('');
      await loadConnections();
    } else {
      setError(result.error || 'Failed to connect');
    }
  }

  async function handleDisconnect(sourceId: string) {
    if (!user) return;

    const result = await disconnectSource(user.id, sourceId);
    if (result.success) {
      await loadConnections();
    }
  }

  function handleOAuthConnect(source: SourceConfig) {
    if (!source.oauth) return;
    // Redirect to OAuth authorize URL
    // Callback will handle token storage
    const params = new URLSearchParams({
      response_type: 'code',
      redirect_uri: `${window.location.origin}/api/auth/callback/${source.id}`,
      scope: source.oauth.scopes.join(' '),
    });
    window.location.href = `${source.oauth.authorizeUrl}?${params}`;
  }

  return (
    <section className="bg-[#0A0A0A] rounded-xl p-6 mb-6 border border-white/10">
      <div className="mb-4">
        <h2 className="text-lg font-bold">Connected Accounts</h2>
        <p className="text-sm text-[#71717A] mt-1">
          Link your accounts to see everything in one place.
        </p>
      </div>

      <div className="space-y-3">
        {allSources.map(source => {
          const conn = getConnection(source.id);
          const available = isAvailable(source);
          const isConnected = conn?.status === 'connected';

          return (
            <div key={source.id}>
              <div
                className={`flex items-center justify-between p-4 rounded-xl border transition ${
                  isConnected
                    ? 'bg-[#141414] border-[#22C55E]/20'
                    : available
                    ? 'bg-[#141414] border-white/10 hover:border-white/20'
                    : 'bg-[#0A0A0A] border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{SOURCE_ICONS[source.id] || '📦'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{source.name}</span>
                      {isConnected && (
                        <span className="text-[10px] font-medium bg-[#22C55E]/15 text-[#22C55E] px-1.5 py-0.5 rounded">
                          CONNECTED
                        </span>
                      )}
                      {conn?.status === 'expired' && (
                        <span className="text-[10px] font-medium bg-[#F59E0B]/15 text-[#F59E0B] px-1.5 py-0.5 rounded">
                          EXPIRED
                        </span>
                      )}
                      {conn?.status === 'error' && (
                        <span className="text-[10px] font-medium bg-[#EF4444]/15 text-[#EF4444] px-1.5 py-0.5 rounded">
                          ERROR
                        </span>
                      )}
                      {!available && (
                        <span className="text-[10px] font-medium bg-[#7C3AED]/15 text-[#7C3AED] px-1.5 py-0.5 rounded">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#71717A] mt-0.5">{source.description}</p>
                  </div>
                </div>

                <div>
                  {isConnected ? (
                    <button
                      onClick={() => handleDisconnect(source.id)}
                      className="text-xs text-[#A1A1AA] hover:text-[#EF4444] transition px-3 py-1.5 rounded-lg border border-white/10 hover:border-[#EF4444]/30 min-h-[36px]"
                    >
                      Disconnect
                    </button>
                  ) : available ? (
                    <button
                      onClick={() => {
                        if (source.authType === 'oauth') {
                          handleOAuthConnect(source);
                        } else {
                          setConnectingSource(connectingSource === source.id ? null : source.id);
                          setEmail('');
                          setPassword('');
                          setError('');
                        }
                      }}
                      className="text-xs font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] px-3 py-1.5 rounded-lg transition min-h-[36px]"
                    >
                      Connect
                    </button>
                  ) : (
                    <span className="text-xs text-[#71717A]">Upgrade</span>
                  )}
                </div>
              </div>

              {/* Credential entry form (inline, expands below the source row) */}
              <AnimatePresence>
                {connectingSource === source.id && source.authType === 'credentials' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#141414] border border-white/10 border-t-0 rounded-b-xl p-4 space-y-3">
                      <p className="text-xs text-[#71717A]">{source.connectInstructions}</p>

                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-white text-sm placeholder:text-[#71717A] focus:border-[#7C3AED] focus:outline-none min-h-[44px]"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-white text-sm placeholder:text-[#71717A] focus:border-[#7C3AED] focus:outline-none min-h-[44px]"
                      />

                      {error && (
                        <p className="text-xs text-[#EF4444]">{error}</p>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleConnect(source.id)}
                          disabled={loading || !email || !password}
                          className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition min-h-[44px]"
                        >
                          {loading ? 'Connecting...' : 'Connect'}
                        </button>
                        <button
                          onClick={() => { setConnectingSource(null); setError(''); }}
                          className="text-[#A1A1AA] hover:text-white px-4 py-2 rounded-lg text-sm transition min-h-[44px]"
                        >
                          Cancel
                        </button>
                      </div>

                      <p className="text-[10px] text-[#52525B] flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Encrypted with AES-256. We never store or see your password in plaintext.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Sync status */}
      {connections.some(c => c.lastSyncAt) && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-[10px] text-[#52525B]">
            Last synced: {
              new Date(
                Math.max(...connections.filter(c => c.lastSyncAt).map(c => new Date(c.lastSyncAt!).getTime()))
              ).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
            }
          </p>
        </div>
      )}
    </section>
  );
}
