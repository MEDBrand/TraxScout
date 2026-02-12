'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-browser';
import { storeApiKey, deleteApiKey } from '@/app/actions/api-keys';
import { ConnectedAccounts } from '@/components/ConnectedAccounts';

const GENRES = [
  'Tech House', 'Deep House', 'Afro House', 'Minimal / Deep Tech',
  'Melodic House & Techno', 'House', 'Techno', 'Progressive House',
];

const CAMELOT_KEYS = [
  '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B',
  '5A', '5B', '6A', '6B', '7A', '7B', '8A', '8B',
  '9A', '9B', '10A', '10B', '11A', '11B', '12A', '12B',
];

interface ApiKeyData {
  id: string;
  provider: 'anthropic' | 'openai';
  keyHint: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();

  // Preferences
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Tech House', 'Deep House']);
  const [bpmMin, setBpmMin] = useState(122);
  const [bpmMax, setBpmMax] = useState(128);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [labels, setLabels] = useState('Solid Grooves, Toolroom, Defected');
  const [digestTime, setDigestTime] = useState('09:00');
  const [digestFrequency, setDigestFrequency] = useState<'daily' | 'weekly'>('daily');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKeyProvider, setNewKeyProvider] = useState<'anthropic' | 'openai'>('anthropic');
  const [newApiKey, setNewApiKey] = useState('');
  const [addingKey, setAddingKey] = useState(false);

  // Subscription
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    async function loadPreferences() {
      if (!user) return;

      const { data } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSelectedGenres(data.genres || []);
        setBpmMin(data.bpm_min || 122);
        setBpmMax(data.bpm_max || 128);
        setSelectedKeys(data.keys || []);
        setLabels(data.labels?.join(', ') || '');
        setDigestTime(data.digest_time || '09:00');
        setDigestFrequency(data.digest_frequency || 'daily');
      }

      // Load API keys
      const { data: keysData } = await supabase
        .from('api_keys')
        .select('id, provider, key_hint, created_at')
        .eq('user_id', user.id);

      if (keysData) {
        setApiKeys(keysData.map(k => ({
          id: k.id,
          provider: k.provider,
          keyHint: k.key_hint,
          createdAt: k.created_at,
        })));
      }
    }

    if (user) {
      loadPreferences();
    }
  }, [user, authLoading, router]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const toggleKey = (key: string) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSaveMessage('');

    const labelsArray = labels.split(',').map(l => l.trim()).filter(Boolean);

    const { error } = await supabase
      .from('preferences')
      .upsert({
        user_id: user.id,
        genres: selectedGenres,
        bpm_min: bpmMin,
        bpm_max: bpmMax,
        keys: selectedKeys,
        labels: labelsArray,
        digest_time: digestTime,
        digest_frequency: digestFrequency,
      });

    setSaving(false);

    if (error) {
      setSaveMessage('Failed to save. Please try again.');
    } else {
      setSaveMessage('Settings saved!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleAddApiKey = async () => {
    if (!user || !newApiKey) return;

    setAddingKey(true);

    const result = await storeApiKey(newKeyProvider, newApiKey);

    setAddingKey(false);

    if ('error' in result) {
      console.error('Failed to store API key:', result.error);
      return;
    }

    setApiKeys(prev => [...prev, {
      id: result.id,
      provider: result.provider,
      keyHint: result.keyHint,
      createdAt: new Date().toISOString(),
    }]);
    setNewApiKey('');
    setShowAddKey(false);
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!user) return;

    const result = await deleteApiKey(keyId);
    if ('error' in result) {
      console.error('Failed to delete API key:', result.error);
      return;
    }

    setApiKeys(prev => prev.filter(k => k.id !== keyId));
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const response = await fetch('/api/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession?.access_token}`,
        },
      });

      const { url, error } = await response.json();

      if (error) {
        console.error('Portal error:', error);
      } else if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to open portal:', error);
    } finally {
      setLoadingPortal(false);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-[#A1A1AA]">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/5 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2">
            <span className="text-[#A1A1AA]">&#x2190;</span>
            <span className="text-[#7C3AED]">TRAXSCOUT</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Subscription Section */}
        <section id="subscription" className="bg-[#0A0A0A] rounded-xl p-6 mb-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">Subscription</h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {profile?.tier === 'pro' ? 'Pro Plan' : profile?.tier === 'basic' ? 'Basic Plan' : 'Free'}
                </span>
                {profile?.tier === 'pro' && (
                  <span className="bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-0.5 rounded text-xs font-medium">PRO</span>
                )}
              </div>
              <div className="text-sm text-[#A1A1AA]">
                {profile?.subscriptionStatus === 'trialing' && 'Free trial active'}
                {profile?.subscriptionStatus === 'active' && 'Active subscription'}
                {profile?.subscriptionStatus === 'past_due' && 'Payment past due'}
                {profile?.subscriptionStatus === 'canceled' && 'Subscription canceled'}
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-[#F59E0B]">
                ${profile?.tier === 'pro' ? '38.88' : profile?.tier === 'basic' ? '19.88' : '0'}
                <span className="text-sm text-[#A1A1AA] font-normal">/mo</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleManageSubscription}
              disabled={loadingPortal}
              className="flex-1 bg-[#141414] hover:bg-white/10 py-2 rounded-lg font-semibold transition"
            >
              {loadingPortal ? 'Loading...' : 'Manage Subscription'}
            </button>

            {profile?.tier !== 'pro' && (
              <Link
                href="/signup?tier=pro"
                className="flex-1 bg-[#F59E0B] hover:bg-[#d97706] py-2 rounded-lg font-semibold transition text-center"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
        </section>

        {/* Connected Accounts */}
        <ConnectedAccounts />

        {/* API Keys Section (Pro only) */}
        {profile?.tier === 'pro' && (
          <section className="bg-[#0A0A0A] rounded-xl p-6 mb-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">API Keys</h2>
                <p className="text-sm text-[#A1A1AA]">For AI-powered features</p>
              </div>
              <button
                onClick={() => setShowAddKey(!showAddKey)}
                className="text-[#7C3AED] hover:text-[#8b5cf6] transition"
              >
                + Add Key
              </button>
            </div>

            {showAddKey && (
              <div className="bg-[#141414] rounded-lg p-4 mb-4">
                <div className="flex gap-3 mb-3">
                  <select
                    value={newKeyProvider}
                    onChange={e => setNewKeyProvider(e.target.value as 'anthropic' | 'openai')}
                    className="p-2 rounded bg-[#141414] border border-white/10"
                  >
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="openai">OpenAI</option>
                  </select>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={newApiKey}
                    onChange={e => setNewApiKey(e.target.value)}
                    className="flex-1 p-2 rounded bg-[#141414] border border-white/10"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddApiKey}
                    disabled={addingKey || !newApiKey}
                    className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] rounded font-medium transition disabled:opacity-50"
                  >
                    {addingKey ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    onClick={() => { setShowAddKey(false); setNewApiKey(''); }}
                    className="px-4 py-2 bg-[#1A1A1A] hover:bg-white/15 rounded transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {apiKeys.length === 0 ? (
              <div className="text-[#A1A1AA] text-sm">
                No API keys added. Add your Anthropic or OpenAI key to enable AI features.
              </div>
            ) : (
              <div className="space-y-2">
                {apiKeys.map(key => (
                  <div key={key.id} className="flex items-center justify-between p-3 bg-[#141414] rounded-lg">
                    <div>
                      <span className="font-medium capitalize">{key.provider}</span>
                      <span className="text-[#A1A1AA] ml-2">****{key.keyHint}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteApiKey(key.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Genres */}
        <section className="bg-[#0A0A0A] rounded-xl p-6 mb-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedGenres.includes(genre)
                    ? 'bg-[#7C3AED] text-white'
                    : 'bg-[#141414] text-[#D4D4D8] hover:bg-white/10'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </section>

        {/* BPM Range */}
        <section className="bg-[#0A0A0A] rounded-xl p-6 mb-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">BPM Range</h2>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={bpmMin}
              onChange={e => setBpmMin(Number(e.target.value))}
              className="w-24 p-2 rounded bg-[#141414] border border-white/10"
            />
            <span className="text-[#A1A1AA]">to</span>
            <input
              type="number"
              value={bpmMax}
              onChange={e => setBpmMax(Number(e.target.value))}
              className="w-24 p-2 rounded bg-[#141414] border border-white/10"
            />
            <span className="text-[#A1A1AA]">BPM</span>
          </div>
        </section>

        {/* Key Filter */}
        <section className="bg-[#0A0A0A] rounded-xl p-6 mb-6 border border-white/10">
          <h2 className="text-lg font-bold mb-2">Key Filter (Camelot)</h2>
          <p className="text-[#A1A1AA] text-sm mb-4">Leave empty to show all keys</p>
          <div className="grid grid-cols-6 gap-2">
            {CAMELOT_KEYS.map(key => (
              <button
                key={key}
                onClick={() => toggleKey(key)}
                className={`p-2 rounded text-sm font-mono transition ${
                  selectedKeys.includes(key)
                    ? 'bg-[#7C3AED] text-white'
                    : 'bg-[#141414] text-[#D4D4D8] hover:bg-white/10'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </section>

        {/* Labels */}
        <section className="bg-[#0A0A0A] rounded-xl p-6 mb-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">Favorite Labels</h2>
          <textarea
            value={labels}
            onChange={e => setLabels(e.target.value)}
            placeholder="Solid Grooves, Toolroom, Defected..."
            className="w-full p-3 rounded bg-[#141414] border border-white/10 h-24"
          />
          <p className="text-[#A1A1AA] text-sm mt-2">Comma-separated</p>
        </section>

        {/* Digest Settings */}
        <section className="bg-[#0A0A0A] rounded-xl p-6 mb-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">Email Digest</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Frequency</label>
              <select
                value={digestFrequency}
                onChange={e => setDigestFrequency(e.target.value as 'daily' | 'weekly')}
                className="w-full p-2 rounded bg-[#141414] border border-white/10"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Time</label>
              <input
                type="time"
                value={digestTime}
                onChange={e => setDigestTime(e.target.value)}
                className="w-full p-2 rounded bg-[#141414] border border-white/10"
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#1A1A1A] py-3 rounded-lg font-semibold transition"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saveMessage && (
            <span className={`text-sm ${saveMessage.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
              {saveMessage}
            </span>
          )}
        </div>

        {/* Account */}
        <section className="mt-8 pt-8 border-t border-white/10">
          <h2 className="text-lg font-bold mb-4 text-[#A1A1AA]">Account</h2>
          <p className="text-[#A1A1AA] text-sm mb-4">
            Signed in as {user?.email}
          </p>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="text-red-400 hover:text-red-300 transition"
          >
            Sign Out
          </button>
        </section>
      </div>
    </main>
  );
}
