'use client';

import { Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';
import type { DuplicateFaceMatch } from '@/lib/utils';

/** Where a matched person's record opens — guests and customers live on different pages. */
export function personHref(match: Pick<DuplicateFaceMatch, 'id' | 'entityType'>): string {
  return match.entityType === 'CUSTOMER' ? `/customers/${match.id}` : `/guests/${match.id}`;
}

interface FaceMatchCardProps {
  match: DuplicateFaceMatch;
  onOpen: () => void;
  openLabel?: string;
}

/** One person a face matched: enough for the desk to recognise them, and a way into their record. */
export function FaceMatchCard({ match, onOpen, openLabel = 'Open record' }: FaceMatchCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={match.photoUrl || undefined} alt={match.name} />
        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
          {match.name ? getInitials(match.name) : '?'}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm font-semibold">{match.name || 'Unnamed record'}</p>
        {match.email && (
          <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" aria-hidden="true" /> {match.email}
          </p>
        )}
        {match.phone && (
          <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <Phone className="h-3 w-3 shrink-0" aria-hidden="true" /> {match.phone}
          </p>
        )}
        {typeof match.similarity === 'number' && match.similarity > 0 && (
          <p className="text-xs text-muted-foreground">{Math.round(match.similarity)}% face match</p>
        )}
      </div>
      <Button size="sm" variant="outline" className="shrink-0" onClick={onOpen}>
        {openLabel}
      </Button>
    </div>
  );
}
