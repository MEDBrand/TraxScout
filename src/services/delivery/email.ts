// Email Digest Service

import { Resend } from 'resend';
import { UserTrack } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY);

interface DigestData {
  email: string;
  userName?: string;
  tracks: UserTrack[];
  date: Date;
}

export async function sendDigestEmail({ email, userName, tracks, date }: DigestData) {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const trackListHtml = tracks
    .map(ut => {
      const t = ut.track!;
      return `
        <tr style="border-bottom: 1px solid #333;">
          <td style="padding: 12px;">
            <strong>${t.artist}</strong><br>
            <span style="color: #888;">${t.title}</span>
          </td>
          <td style="padding: 12px; color: #888;">${t.label}</td>
          <td style="padding: 12px; font-family: monospace;">${t.bpm} BPM</td>
          <td style="padding: 12px;">
            <span style="background: ${
              t.source === 'beatport' ? '#22c55e20' : 
              t.source === 'traxsource' ? '#3b82f620' : '#a855f720'
            }; color: ${
              t.source === 'beatport' ? '#22c55e' : 
              t.source === 'traxsource' ? '#3b82f6' : '#a855f7'
            }; padding: 2px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">
              ${t.source}
            </span>
          </td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin: 0; padding: 0; background: #111; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #333;">
          <h1 style="margin: 0; font-size: 24px;">🎵 Traxscout</h1>
        </div>

        <!-- Content -->
        <div style="padding: 20px 0;">
          <h2 style="margin: 0 0 8px 0;">Hey${userName ? ` ${userName}` : ''},</h2>
          <p style="margin: 0 0 20px 0; color: #888;">
            Here are ${tracks.length} tracks we found for you on ${formattedDate}.
          </p>

          <!-- Tracks Table -->
          <table style="width: 100%; border-collapse: collapse; background: #1a1a1a; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #222; text-align: left;">
                <th style="padding: 12px;">Track</th>
                <th style="padding: 12px;">Label</th>
                <th style="padding: 12px;">BPM</th>
                <th style="padding: 12px;">Source</th>
              </tr>
            </thead>
            <tbody>
              ${trackListHtml}
            </tbody>
          </table>

          <!-- CTA -->
          <div style="text-align: center; padding: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background: #a855f7; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              View All Tracks
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #333; color: #666; font-size: 12px;">
          <p>Traxscout — Dig smarter, not harder.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #888;">Manage preferences</a> · 
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #888;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await resend.emails.send({
    from: 'Traxscout <digest@traxscout.app>',
    to: email,
    subject: `🎵 ${tracks.length} new tracks for you — ${formattedDate}`,
    html,
  });

  return result;
}
