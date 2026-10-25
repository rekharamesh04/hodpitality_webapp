'use client';

import { ScanFace, UserRoundCheck, UserRoundX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatDate } from '@/lib/utils';

interface FaceCheckInCardProps {
  enrolled: boolean;
  /** The backend's consent summary on the person's record. */
  consent?: boolean;
  consentAt?: string;
  consentSource?: string;
  onEnroll: () => void;
  onRemove: () => void;
  removing?: boolean;
  onDecline: () => void;
  declining?: boolean;
}

/**
 * How this person checks in: by face, or — because face recognition needs their consent, and
 * some people say no — by phone number at the kiosk or by name at the desk. Either way the visit,
 * queue and checkout are the same; only the way they are found differs.
 */
export function FaceCheckInCard({
  enrolled, consent, consentAt, consentSource, onEnroll, onRemove, removing, onDecline, declining,
}: FaceCheckInCardProps) {
  const declined = !enrolled && consent === false;
  const when = consentAt ? formatDate(consentAt) : undefined;

  const state = enrolled
    ? { icon: UserRoundCheck, tone: 'bg-success/10 text-success', title: 'Face check-in on', detail: when ? `Consent recorded ${when}` : 'Checks in by face at the desk or kiosk' }
    : declined
    ? {
        icon: UserRoundX,
        tone: 'bg-warning/10 text-warning',
        title: consentSource === 'withdrawn' ? 'Face removed' : 'Declined face check-in',
        detail: `${when ? `${when} · ` : ''}Checks in by phone number at the kiosk, or at the desk`,
      }
    : { icon: ScanFace, tone: 'bg-muted text-muted-foreground', title: 'Not set up', detail: 'Ask whether they would like face check-in' };
  const Icon = state.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Check-in method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', state.tone)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{state.title}</p>
            <p className="text-xs text-muted-foreground">{state.detail}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={enrolled ? 'outline' : 'default'} onClick={onEnroll}>
            {enrolled ? 'Retake photo' : declined ? 'They changed their mind' : 'Set up face check-in'}
          </Button>
          {enrolled && (
            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" loading={removing} onClick={onRemove}>
              Remove face
            </Button>
          )}
          {!enrolled && !declined && (
            <Button size="sm" variant="outline" loading={declining} onClick={onDecline}>
              They declined
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          New email or phone? Use <span className="font-medium text-foreground">Edit</span> — the face and full
          history stay on this record. Don&apos;t register them again.
        </p>
      </CardContent>
    </Card>
  );
}
