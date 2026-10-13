'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Longest edge of the photo sent for matching — plenty for a face, small enough to upload fast. */
const MAX_EDGE = 1280;

/**
 * The kiosk's camera: a live, mirrored view and one large button. Uses the front camera, which on
 * an iPad mounted at reception is the one facing the patient. Calls `onCapture` with a JPEG data
 * URL — the same thing the desk's face flows take.
 */
export function KioskCamera({ onCapture, onCancel }: { onCapture: (dataUrl: string) => void; onCancel: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 } } })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError('The camera is not available. Please see the reception desk.'));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const scale = Math.min(1, MAX_EDGE / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL('image/jpeg', 0.9));
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border-4 border-primary/30 bg-black">
        {error ? (
          <div className="flex h-full items-center justify-center p-8 text-center text-lg text-white">{error}</div>
        ) : (
          <>
            {/* Mirrored, as people expect a camera facing them to be. The captured photo is not. */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onLoadedData={() => setReady(true)}
              className="h-full w-full -scale-x-100 object-cover"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-3/4 w-1/2 rounded-[50%] border-4 border-white/70" aria-hidden="true" />
            </div>
          </>
        )}
      </div>
      <p className="text-center text-lg text-muted-foreground">Look at the camera, with your face inside the oval.</p>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" className="h-16 px-10 text-xl" onClick={capture} disabled={!!error || !ready}>
          <Camera className="mr-3 h-6 w-6" /> Scan my face
        </Button>
        <Button size="lg" variant="outline" className="h-16 px-10 text-xl" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
