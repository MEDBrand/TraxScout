'use server';

import { encrypt } from '@/lib/encryption';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Server-side Supabase client with service role for secure writes
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Derive authenticated userId from the request, never trust client input
async function getAuthUserId(): Promise<string | null> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');

  // Server actions called from client components send cookies, not bearer tokens.
  // Try cookie-based session via anon client as fallback.
  const cookieHeader = headersList.get('cookie') || '';
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: authHeader ? { Authorization: authHeader } : { cookie: cookieHeader } } },
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function storeApiKey(
  provider: 'anthropic' | 'openai',
  apiKey: string,
) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Unauthorized' };

  const keyHint = apiKey.slice(-4);
  const keyId = `${provider}_${Date.now()}`;
  const keyEncrypted = encrypt(apiKey);

  const { error } = await getSupabaseAdmin()
    .from('api_keys')
    .upsert({
      id: keyId,
      user_id: userId,
      provider,
      key_encrypted: keyEncrypted,
      key_hint: keyHint,
    });

  if (error) {
    return { error: error.message };
  }

  return { id: keyId, keyHint, provider };
}

export async function deleteApiKey(keyId: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Unauthorized' };

  const { error } = await getSupabaseAdmin()
    .from('api_keys')
    .delete()
    .eq('id', keyId)
    .eq('user_id', userId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
