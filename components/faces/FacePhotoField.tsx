'use client';

import { useState } from 'react';
import { Camera, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CameraCaptureDialog } from '@/components/dialogs/CameraCaptureDialog';

interface FacePhotoFieldProps {
  photo: string | null;
  onPhotoChange: (photo: string | null) => void;
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
  /** e.g. "patient" — used in the consent sentence. */
  personLabel: string;
  error?: string | null;
  disabled?: boolean;
}

/**
 * Optional face photo taken while registering someone, so the desk does not have to save the
 * record and then come back to enrol the face. Enrolment needs the person's agreement, so a
 * photo cannot be kept without the consent box ticked.
 */
export function FacePhotoField({
  photo, onPhotoChange, consent, onConsentChange, personLabel, error, disabled,
}: FacePhotoFieldProps) {
  const [cameraOpen, setCameraOpen] = useState(false);

  return (
    <div className="space-y-2 rounded-lg border border-dashed p-3">
      <div className="flex items-center gap-3">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Face photo" className="h-16 w-16 shrink-0 rounded-lg border object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border bg-muted">
            <Camera className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Face photo <span className="font-normal text-muted-foreground">(optional)</span></p>
          <p className="text-xs text-muted-foreground">
            Enrols their face for check-in as soon as the record is saved.
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={() => setCameraOpen(true)} disabled={disabled}>
            {photo ? <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> : <Camera className="mr-1.5 h-3.5 w-3.5" />}
            {photo ? 'Retake' : 'Add photo'}
          </Button>
          {photo && (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Remove photo"
              onClick={() => { onPhotoChange(null); onConsentChange(false); }}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {photo && (
        <div className="flex items-start gap-2">
          <Checkbox
            id="face-consent"
            checked={consent}
            onCheckedChange={(v) => onConsentChange(v === true)}
            disabled={disabled}
            className="mt-0.5"
          />
          <Label htmlFor="face-consent" className="text-xs font-normal leading-snug">
            The {personLabel} agreed to their face being used for check-in.
          </Label>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}

      <CameraCaptureDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        title="Face photo"
        description="Capture a clear, front-facing photo."
        submitLabel="Use photo"
        onSubmit={(image) => {
          onPhotoChange(image);
          setCameraOpen(false);
        }}
      />
    </div>
  );
}
