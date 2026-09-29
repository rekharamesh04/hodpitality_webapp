'use client';

import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, ExternalLink, FileText, ImageOff, RefreshCw, RotateCw, Trash2, ZoomIn, ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useRemovePrescriptionAttachment } from '@/hooks/usePrescriptions';
import { isOrgAdmin } from '@/constants/roles';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';
import type { PrescriptionAttachment } from '@/types/prescription';

const ZOOM_STEPS = [1, 1.5, 2, 3, 4];

function isImage(a: PrescriptionAttachment): boolean {
  return (a.contentType ?? '').startsWith('image/');
}

/**
 * The photos of a paper prescription: thumbnails, and a viewer that zooms and
 * rotates, because handwriting photographed at an angle is the whole reason
 * these exist.
 *
 * Links are signed for 15 minutes. A page left open longer shows a reload
 * button on the broken image instead of an empty frame.
 */
export function PrescriptionPhotos({
  prescriptionId,
  attachments,
  onReload,
  size = 'md',
  allowRemove = true,
}: {
  prescriptionId: string;
  attachments: PrescriptionAttachment[];
  /** Fetches fresh signed links. */
  onReload?: () => void;
  size?: 'sm' | 'md';
  allowRemove?: boolean;
}) {
  const user = useAuthStore((s) => s.user);
  const remove = useRemovePrescriptionAttachment();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [toRemove, setToRemove] = useState<PrescriptionAttachment | null>(null);
  const [broken, setBroken] = useState<Set<string>>(new Set());

  if (attachments.length === 0) return null;

  const markBroken = (id: string) => setBroken((prev) => new Set(prev).add(id));
  // The backend enforces the same rule; this only hides a button that would 403.
  const canRemove = (a: PrescriptionAttachment) =>
    allowRemove && (isOrgAdmin(user?.role) || (!!a.uploadedById && a.uploadedById === user?.id));

  function reload() {
    setBroken(new Set());
    onReload?.();
  }

  const thumb = size === 'sm' ? 'h-16 w-14' : 'h-28 w-24';

  return (
    <>
      <ul className="flex flex-wrap gap-2">
        {attachments.map((a, i) => (
          <li key={a.id}>
            {isImage(a) ? (
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                className={cn(
                  thumb,
                  'relative overflow-hidden rounded-lg border bg-muted transition-shadow hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
                aria-label={`View ${a.title || `page ${i + 1}`}`}
              >
                {a.url && !broken.has(a.id) ? (
                  // Signed S3 links change on every read, so next/image optimisation has nothing to cache.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.url} alt="" className="h-full w-full object-cover" onError={() => markBroken(a.id)} />
                ) : (
                  <ImageOff className="m-auto h-5 w-5 text-muted-foreground" aria-hidden="true" />
                )}
                <span className="absolute bottom-0 left-0 right-0 bg-black/55 px-1 py-0.5 text-center text-[10px] font-medium text-white">
                  Page {i + 1}
                </span>
              </button>
            ) : (
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  thumb,
                  'flex flex-col items-center justify-center gap-1 rounded-lg border bg-muted text-xs text-muted-foreground hover:ring-2 hover:ring-primary/40',
                )}
              >
                <FileText className="h-5 w-5" aria-hidden="true" />
                PDF · {i + 1}
              </a>
            )}
          </li>
        ))}
      </ul>
      {broken.size > 0 && onReload && (
        <Button size="sm" variant="ghost" className="mt-2 h-auto p-0 text-xs" onClick={reload}>
          <RefreshCw className="mr-1.5 h-3 w-3" aria-hidden="true" /> Photo links expired — reload
        </Button>
      )}

      {openIndex !== null && attachments[openIndex] && (
        <PhotoViewer
          attachments={attachments}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
          broken={broken}
          onBroken={markBroken}
          onReload={onReload ? reload : undefined}
          onRemove={(a) => canRemove(a) ? () => setToRemove(a) : undefined}
        />
      )}

      <ConfirmDialog
        open={!!toRemove}
        onOpenChange={(v) => !v && setToRemove(null)}
        title="Remove this photo?"
        description="The photo is deleted from the prescription and from the patient's documents. This cannot be undone."
        confirmLabel="Remove"
        destructive
        isConfirming={remove.isPending}
        onConfirm={() => {
          if (!toRemove) return;
          remove.mutate(
            { id: prescriptionId, attachmentId: toRemove.id },
            {
              onSuccess: () => {
                setToRemove(null);
                setOpenIndex(null);
              },
            },
          );
        }}
      />
    </>
  );
}

function PhotoViewer({
  attachments, index, onIndexChange, onClose, broken, onBroken, onReload, onRemove,
}: {
  attachments: PrescriptionAttachment[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  broken: Set<string>;
  onBroken: (id: string) => void;
  onReload?: () => void;
  onRemove: (a: PrescriptionAttachment) => (() => void) | undefined;
}) {
  const [zoom, setZoom] = useState(0);
  const [rotation, setRotation] = useState(0);
  const a = attachments[index];
  const scale = ZOOM_STEPS[zoom];
  const removeThis = onRemove(a);
  // A quarter turn swaps width and height, so the frame is sized for the rotated image.
  const sideways = rotation % 180 !== 0;

  function go(next: number) {
    setZoom(0);
    setRotation(0);
    onIndexChange(next);
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{a.title || `Page ${index + 1}`}</DialogTitle>
          <DialogDescription>
            Page {index + 1} of {attachments.length}
            {a.uploadedBy ? ` · added by ${a.uploadedBy}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setZoom((z) => Math.max(0, z - 1))} disabled={zoom === 0} aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-sm tabular-nums">{Math.round(scale * 100)}%</span>
          <Button size="sm" variant="outline" onClick={() => setZoom((z) => Math.min(ZOOM_STEPS.length - 1, z + 1))} disabled={zoom === ZOOM_STEPS.length - 1} aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRotation((r) => (r + 90) % 360)} aria-label="Rotate">
            <RotateCw className="mr-2 h-4 w-4" /> Rotate
          </Button>
          {a.url && (
            <Button asChild size="sm" variant="ghost">
              <a href={a.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Open original
              </a>
            </Button>
          )}
          {removeThis && (
            <Button size="sm" variant="ghost" className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={removeThis}>
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </Button>
          )}
        </div>

        <div className="relative h-[60vh] overflow-auto rounded-lg border bg-muted/40">
          {!isImage(a) ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <FileText className="h-8 w-8" aria-hidden="true" />
              This page is a PDF.
              {a.url && (
                <Button asChild size="sm" variant="outline">
                  <a href={a.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Open PDF
                  </a>
                </Button>
              )}
            </div>
          ) : a.url && !broken.has(a.id) ? (
            <div
              className="flex min-h-full min-w-full items-center justify-center p-2"
              style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.url}
                alt={a.title || `Prescription page ${index + 1}`}
                className="max-h-full max-w-full object-contain transition-transform"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  // Before the turn, the image's width is what ends up vertical.
                  ...(sideways ? { maxWidth: `calc(${scale * 60}vh - 1rem)` } : {}),
                }}
                onError={() => onBroken(a.id)}
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
              The link to this photo has expired.
              {onReload && (
                <Button size="sm" variant="outline" onClick={onReload}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reload
                </Button>
              )}
            </div>
          )}
        </div>

        {attachments.length > 1 && (
          <div className="flex items-center justify-between">
            <Button size="sm" variant="outline" onClick={() => go(index - 1)} disabled={index === 0}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button size="sm" variant="outline" onClick={() => go(index + 1)} disabled={index === attachments.length - 1}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
