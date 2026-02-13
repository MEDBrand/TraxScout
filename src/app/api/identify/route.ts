// Audio Identification API Route
// ACRCloud (primary) + AudD (backup)
// Accepts audio blob via multipart form data

import { NextResponse } from 'next/server';
import crypto from 'crypto';

function loadACRCloudCreds(): { accessKey: string; secretKey: string; host: string } | null {
  const accessKey = process.env.ACRCLOUD_ACCESS_KEY;
  const secretKey = process.env.ACRCLOUD_SECRET_KEY;
  const host = process.env.ACRCLOUD_HOST || 'identify-us-west-2.acrcloud.com';
  if (!accessKey || !secretKey) return null;
  return { accessKey, secretKey, host };
}

function loadAuddKey(): string | null {
  return process.env.AUDD_API_KEY || null;
}

interface IdentifyResult {
  found: boolean;
  source?: 'acrcloud' | 'audd';
  artist?: string;
  title?: string;
  album?: string;
  label?: string;
  releaseDate?: string;
  links?: {
    spotify?: string;
    youtube?: string;
    appleMusic?: string;
    deezer?: string;
    beatport?: string;
  };
  venue?: string;        // Reverse-geocoded venue name only — no GPS coords stored
  identifiedAt?: string;
  error?: string;
}

async function identifyWithACRCloud(audioBuffer: Buffer): Promise<IdentifyResult> {
  const creds = loadACRCloudCreds();
  if (!creds) return { found: false, error: 'ACRCloud not configured' };

  const httpMethod = 'POST';
  const httpUri = '/v1/identify';
  const dataType = 'audio';
  const signatureVersion = '1';
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const stringToSign = `${httpMethod}\n${httpUri}\n${creds.accessKey}\n${dataType}\n${signatureVersion}\n${timestamp}`;
  const signature = crypto
    .createHmac('sha1', creds.secretKey)
    .update(stringToSign)
    .digest('base64');

  const formData = new FormData();
  formData.append('access_key', creds.accessKey);
  formData.append('sample_bytes', audioBuffer.length.toString());
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('data_type', dataType);
  formData.append('signature_version', signatureVersion);
  formData.append('sample', new Blob([new Uint8Array(audioBuffer)]), 'sample.wav');

  const response = await fetch(`https://${creds.host}${httpUri}`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  const code = result?.status?.code;

  if (code !== 0) {
    return { found: false };
  }

  const music = result?.metadata?.music;
  if (!music?.length) return { found: false };

  const track = music[0];
  const ext = track.external_metadata || {};

  return {
    found: true,
    source: 'acrcloud',
    artist: track.artists?.[0]?.name || 'Unknown',
    title: track.title || 'Unknown',
    album: track.album?.name,
    label: track.label,
    releaseDate: track.release_date,
    links: {
      spotify: ext.spotify?.track?.id
        ? `https://open.spotify.com/track/${ext.spotify.track.id}`
        : undefined,
      youtube: ext.youtube?.vid
        ? `https://youtube.com/watch?v=${ext.youtube.vid}`
        : undefined,
      deezer: ext.deezer?.track?.id
        ? `https://www.deezer.com/track/${ext.deezer.track.id}`
        : undefined,
    },
  };
}

async function identifyWithAudd(audioBuffer: Buffer): Promise<IdentifyResult> {
  const apiKey = loadAuddKey();
  if (!apiKey) return { found: false, error: 'AudD not configured' };

  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(audioBuffer)]), 'sample.wav');
  formData.append('api_token', apiKey);
  formData.append('return', 'apple_music,spotify');

  const response = await fetch('https://api.audd.io/', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (data.status !== 'success' || !data.result) {
    return { found: false };
  }

  const r = data.result;

  return {
    found: true,
    source: 'audd',
    artist: r.artist || 'Unknown',
    title: r.title || 'Unknown',
    album: r.album,
    label: r.label,
    releaseDate: r.release_date,
    links: {
      spotify: r.spotify?.external_urls?.spotify,
      appleMusic: r.apple_music?.url,
    },
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob | null;

    // Optional GPS location from the client (privacy-first: user must opt in)
    const latitude = formData.get('latitude') as string | null;
    const longitude = formData.get('longitude') as string | null;
    const venueName = formData.get('venue') as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Sanity check: reject files over 5MB
    if (audioBuffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large (max 5MB)' },
        { status: 400 }
      );
    }

    // Try ACRCloud first (better for electronic/DJ music)
    let result = await identifyWithACRCloud(audioBuffer);

    // Fall back to AudD if ACRCloud doesn't find it
    if (!result.found) {
      result = await identifyWithAudd(audioBuffer);
    }

    // Privacy-first location: reverse geocode GPS to venue name, then discard coordinates.
    // Only the venue name is stored. User can also skip GPS and type venue manually.
    let venue: string | undefined = venueName || undefined;

    if (!venue && latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        try {
          // Reverse geocode to get venue/place name — GPS coords are NOT stored
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18`,
            { headers: { 'User-Agent': 'Traxscout/1.0' } }
          );
          const geoData = await geoRes.json();
          venue =
            geoData?.name ||
            geoData?.address?.amenity ||
            geoData?.address?.leisure ||
            geoData?.display_name?.split(',')[0] ||
            undefined;
        } catch {
          // Geocoding failed silently — venue stays undefined, no GPS stored
        }
      }
    }

    return NextResponse.json({
      ...result,
      ...(venue ? { venue } : {}),
      identifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Audio identification error:', error);
    return NextResponse.json(
      { found: false, error: 'Identification failed' },
      { status: 500 }
    );
  }
}
