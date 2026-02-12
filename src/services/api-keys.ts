// Secure API Key Storage Service
// Handles user-provided AI API keys with bulletproof encryption

import { encrypt, decrypt, generateToken } from '@/lib/encryption';
import { createServerClient } from '@/lib/supabase';
import { logSecurityEvent } from '@/lib/security';

export type AIProvider = 'anthropic' | 'openai';

interface StoredApiKey {
  id: string;
  userId: string;
  provider: AIProvider;
  keyEncrypted: string;
  keyHint: string;        // Last 4 chars for display
  createdAt: Date;
  lastUsedAt: Date | null;
  usageCount: number;
}

/**
 * Store user's API key securely
 * - Key is encrypted with AES-256-GCM before storage
 * - Only the last 4 characters are stored in plain text for UI display
 */
export async function storeApiKey(
  userId: string,
  provider: AIProvider,
  apiKey: string
): Promise<{ id: string; hint: string }> {
  const supabase = createServerClient();
  
  // Validate API key format
  if (!validateApiKeyFormat(provider, apiKey)) {
    throw new Error('Invalid API key format');
  }
  
  // Encrypt the key
  const keyEncrypted = encrypt(apiKey);
  const keyHint = apiKey.slice(-4);
  const id = generateToken(16);
  
  // Delete existing key for this provider (one key per provider per user)
  await supabase
    .from('api_keys')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider);
  
  // Store encrypted key
  const { error } = await supabase.from('api_keys').insert({
    id,
    user_id: userId,
    provider,
    key_encrypted: keyEncrypted,
    key_hint: keyHint,
    created_at: new Date().toISOString(),
    last_used_at: null,
    usage_count: 0,
  });
  
  if (error) {
    logSecurityEvent('api_key_store_failed', { userId, provider, error: error.message }, 'warning');
    throw new Error('Failed to store API key');
  }
  
  logSecurityEvent('api_key_stored', { userId, provider }, 'info');
  
  return { id, hint: keyHint };
}

/**
 * Retrieve and decrypt user's API key for use
 */
export async function getApiKey(
  userId: string,
  provider: AIProvider
): Promise<string | null> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('key_encrypted, id')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  try {
    const decryptedKey = decrypt(data.key_encrypted);
    
    // Update usage stats
    await supabase
      .from('api_keys')
      .update({
        last_used_at: new Date().toISOString(),
        usage_count: supabase.rpc('increment_usage_count'),
      })
      .eq('id', data.id);
    
    return decryptedKey;
  } catch (err) {
    logSecurityEvent('api_key_decrypt_failed', { userId, provider }, 'critical');
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Delete user's API key
 */
export async function deleteApiKey(
  userId: string,
  provider: AIProvider
): Promise<void> {
  const supabase = createServerClient();
  
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider);
  
  if (error) {
    throw new Error('Failed to delete API key');
  }
  
  logSecurityEvent('api_key_deleted', { userId, provider }, 'info');
}

/**
 * Get API key metadata (without the actual key)
 */
export async function getApiKeyInfo(
  userId: string
): Promise<{ provider: AIProvider; hint: string; lastUsed: Date | null }[]> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('provider, key_hint, last_used_at')
    .eq('user_id', userId);
  
  if (error || !data) {
    return [];
  }
  
  return data.map(row => ({
    provider: row.provider as AIProvider,
    hint: row.key_hint,
    lastUsed: row.last_used_at ? new Date(row.last_used_at) : null,
  }));
}

/**
 * Validate API key format before storage
 */
function validateApiKeyFormat(provider: AIProvider, key: string): boolean {
  if (!key || key.length < 20) return false;
  
  switch (provider) {
    case 'anthropic':
      // Anthropic keys start with 'sk-ant-'
      return key.startsWith('sk-ant-') && key.length > 40;
    case 'openai':
      // OpenAI keys start with 'sk-'
      return key.startsWith('sk-') && key.length > 40;
    default:
      return false;
  }
}

/**
 * Test if API key is valid by making a minimal API call
 */
export async function testApiKey(
  provider: AIProvider,
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      
      if (response.status === 401) {
        return { valid: false, error: 'Invalid API key' };
      }
      return { valid: true };
    }
    
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      
      if (response.status === 401) {
        return { valid: false, error: 'Invalid API key' };
      }
      return { valid: true };
    }
    
    return { valid: false, error: 'Unknown provider' };
  } catch (err) {
    return { valid: false, error: 'Connection failed' };
  }
}
