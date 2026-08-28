'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface CameraCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  /** Extra form fields (e.g. venue picker) rendered above the capture area. */
  children?: React.ReactNode;
  /** Called with a base64 data URL (image/jpeg) when the user confirms the capture. */
  onSubmit: (imageDataUrl: string) => void;
}

/**
 * Reusable webcam capture UI: live preview, snap-to-canvas, retake, or fall
 * back to a plain file upload when camera permission is unavailable/denied.
 */
export function CameraCaptureDialog({
  open, onOpenChange, title, description, submitLabel = 'Submit', isSubmitting, children, onSubmit,
}: CameraCaptureDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [captured, setCaptured] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      stopStream();
      setCaptured(null);
      setCameraError(null);
      return;
    }
    startCamera();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraError('Camera unavailable. You can upload a photo instead.');
    }
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCaptured(canvas.toDataURL('image/jpeg', 0.9));
    stopStream();
  }

  function handleRetake() {
    setCaptured(null);
    startCamera();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCaptured(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (captured) onSubmit(captured);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-3">
          {children}

          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
            {captured ? (
              // object-contain (not cover): an uploaded photo can be any aspect ratio/orientation,
              // so scale it to fit fully in view rather than center-cropping the face out of frame.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={captured} alt="Captured face" className="h-full w-full object-contain" />
            ) : (
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
            )}
            {cameraError && !captured && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/95 p-4 text-center">
                <Camera className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{cameraError}</p>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex justify-center gap-2">
            {!captured ? (
              <>
                <Button type="button" size="sm" onClick={handleCapture} disabled={!!cameraError}>
                  <Camera className="mr-2 h-4 w-4" /> Capture
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Upload Photo
                </Button>
              </>
            ) : (
              <Button type="button" size="sm" variant="outline" onClick={handleRetake}>
                <RotateCcw className="mr-2 h-4 w-4" /> Retake
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!captured || isSubmitting}>
            {isSubmitting ? 'Processing…' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
