'use server';

// Connected Accounts — Server Actions
// Handles credential encryption and storage for user platform connections
// All credentials encrypted with AES-256 before touching the database

import { encrypt, decrypt } from '@/lib/encryption';
import { createClient } from '@supabase/supabase-js';
import { getSourceConfig } from '@/config/sources';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export interface ConnectResult {
  success: boolean;
  error?: string;
  connectionId?: string;
}

// Connect a platform account with credentials (email/password)
export async function connectWithCredentials(
  userId: string,
  sourceId: string,
  credentials: { email: string; password: string },
): Promise<ConnectResult> {
  const config = getSourceConfig(sourceId);
  if (!config) return { success: false, error: 'Unknown source' };
  if (config.authType !== 'credentials') return { success: false, error: 'Source does not use credential auth' };

  // Encrypt the full credential payload
  const payload = JSON.stringify({
    email: credentials.email,
    password: credentials.password,
    connectedAt: new Date().toISOString(),
  });
  const encrypted = encrypt(payload);

  // Upsert: one connection per user per source
  const { data, error } = await supabaseAdmin
    .from('connected_accounts')
    .upsert(
      {
        user_id: userId,
        source_id: sourceId,
        status: 'connected',
        credentials_encrypted: encrypted,
        last_sync_at: null,
        last_error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,source_id' }
    )
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, connectionId: data?.id };
}

// Store OAuth tokens for a platform
export async function connectWithOAuth(
  userId: string,
  sourceId: string,
  tokens: { accessToken: string; refreshToken?: string; expiresAt?: string },
): Promise<ConnectResult> {
  const config = getSourceConfig(sourceId);
  if (!config) return { success: false, error: 'Unknown source' };
  if (config.authType !== 'oauth') return { success: false, error: 'Source does not use OAuth' };

  const payload = JSON.stringify({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt,
    connectedAt: new Date().toISOString(),
  });
  const encrypted = encrypt(payload);

  const { data, error } = await supabaseAdmin
    .from('connected_accounts')
    .upsert(
      {
        user_id: userId,
        source_id: sourceId,
        status: 'connected',
        credentials_encrypted: encrypted,
        last_sync_at: null,
        last_error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,source_id' }
    )
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, connectionId: data?.id };
}

// Disconnect a platform
export async function disconnectSource(
  userId: string,
  sourceId: string,
): Promise<ConnectResult> {
  const { error } = await supabaseAdmin
    .from('connected_accounts')
    .delete()
    .eq('user_id', userId)
    .eq('source_id', sourceId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Get all connected accounts for a user (without decrypted credentials)
export async function getConnections(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('connected_accounts')
    .select('id, source_id, status, last_sync_at, last_error, created_at, updated_at')
    .eq('user_id', userId);

  if (error) return [];
  return (data || []).map(row => ({
    id: row.id,
    sourceId: row.source_id,
    status: row.status,
    lastSyncAt: row.last_sync_at,
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// Internal: get decrypted credentials for a connection (server-side only)
export async function getDecryptedCredentials(
  userId: string,
  sourceId: string,
): Promise<Record<string, string> | null> {
  const { data, error } = await supabaseAdmin
    .from('connected_accounts')
    .select('credentials_encrypted')
    .eq('user_id', userId)
    .eq('source_id', sourceId)
    .single();

  if (error || !data) return null;

  try {
    return JSON.parse(decrypt(data.credentials_encrypted));
  } catch {
    return null;
  }
}

// Update connection status (after sync attempt)
export async function updateConnectionStatus(
  userId: string,
  sourceId: string,
  status: 'connected' | 'expired' | 'error',
  lastError?: string,
) {
  await supabaseAdmin
    .from('connected_accounts')
    .update({
      status,
      last_error: lastError || null,
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('source_id', sourceId);
}
