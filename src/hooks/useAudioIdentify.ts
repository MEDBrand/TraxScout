'use client';

// Hook for recording audio and identifying tracks
// Uses MediaRecorder API to capture mic input
// Sends to /api/identify for ACRCloud + AudD recognition

import { useState, useRef, useCallback, useEffect } from 'react';
import { haptic } from '@/lib/haptics';

export type IdentifyStatus = 'idle' | 'recording' | 'identifying' | 'found' | 'not-found' | 'error';

export interface IdentifyLocation {
  latitude: number;
  longitude: number;
  venue?: string;
  identifiedAt: string;
}

export interface IdentifyResult {
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
  location?: IdentifyLocation;
  alsoPlayedBy?: string[];  // DJs who recently played this track (Phase 2: 1001Tracklists)
  error?: string;
}

interface UseAudioIdentifyOptions {
  recordDurationMs?: number; // How long to record (default 10s)
  includeLocation?: boolean; // Request GPS coords (default true, user must grant permission)
  onResult?: (result: IdentifyResult) => void;
  onError?: (error: string) => void;
}

export function useAudioIdentify(options: UseAudioIdentifyOptions = {}) {
  const {
    recordDurationMs = 10000,
    includeLocation = true,
    onResult,
    onError,
  } = options;

  const [status, setStatus] = useState<IdentifyStatus>('idle');
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [analyserData, setAnalyserData] = useState<Uint8Array | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    analyserRef.current = null;
    setAnalyserData(null);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setStatus('recording');
      setResult(null);
      setElapsed(0);
      chunksRef.current = [];
      haptic('medium');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      // Set up analyser for waveform visualization
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Pump waveform data for visualization
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateWaveform = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        setAnalyserData(new Uint8Array(dataArray));
        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      // Start recording
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Build the audio blob and send to API
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await identifyAudio(blob);
      };

      recorder.start();

      // Elapsed timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 100);

      // Auto-stop after duration
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, recordDurationMs);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microphone access denied';
      setStatus('error');
      onError?.(message);
      haptic('error');
    }
  }, [recordDurationMs, stopRecording, onError]);

  // Grab GPS coords silently. Returns null if denied or unavailable.
  const getLocation = useCallback((): Promise<GeolocationPosition | null> => {
    if (!includeLocation || !navigator.geolocation) return Promise.resolve(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null), // user denied or timeout, no big deal
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    });
  }, [includeLocation]);

  const identifyAudio = useCallback(async (blob: Blob) => {
    setStatus('identifying');
    haptic('light');

    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      // Attach location if available
      const position = await getLocation();
      if (position) {
        formData.append('latitude', String(position.coords.latitude));
        formData.append('longitude', String(position.coords.longitude));
      }

      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      });

      const data: IdentifyResult = await response.json();

      setResult(data);

      if (data.found) {
        setStatus('found');
        haptic('success');
      } else {
        setStatus('not-found');
        haptic('warning');
      }

      onResult?.(data);
    } catch (err) {
      setStatus('error');
      haptic('error');
      onError?.('Failed to identify track');
    }
  }, [onResult, onError, getLocation]);

  const cancel = useCallback(() => {
    stopRecording();
    setStatus('idle');
    setResult(null);
    setElapsed(0);
  }, [stopRecording]);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setElapsed(0);
  }, []);

  return {
    status,
    result,
    elapsed,
    analyserData,
    startRecording,
    stopRecording,
    cancel,
    reset,
    isRecording: status === 'recording',
    isIdentifying: status === 'identifying',
  };
}
