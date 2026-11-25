'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTerminology } from '@/hooks';
import { BIOMETRIC_POLICY_PATH, faceNoticePoints } from '@/constants/face-notice';

export type ConsentGivenBy = 'self' | 'guardian';

interface FaceConsentNoticeProps {
  /** Unique per screen, for the form ids. */
  idPrefix: string;
  personName?: string;
  givenBy: ConsentGivenBy;
  onGivenByChange: (value: ConsentGivenBy) => void;
  consent: boolean;
  onConsentChange: (value: boolean) => void;
  disabled?: boolean;
}

/**
 * The notice a person is shown before their face is enrolled, and the desk's record that they
 * agreed. Staff show or read it to them; for a child, a parent or guardian agrees. The wording is
 * the shared one in constants/face-notice.ts, and its version is stored with the consent.
 */
export function FaceConsentNotice({
  idPrefix, personName, givenBy, onGivenByChange, consent, onConsentChange, disabled,
}: FaceConsentNoticeProps) {
  const t = useTerminology();
  const who = personName || `The ${t.person.one.toLowerCase()}`;
  const policy = typeof window === 'undefined' ? BIOMETRIC_POLICY_PATH : `${window.location.host}${BIOMETRIC_POLICY_PATH}`;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-3 text-xs">
      <p className="font-medium text-foreground">Show or read this to them and ask if they agree. Nothing is saved until you tick the box.</p>
      <ul className="list-disc space-y-1 pl-4 leading-snug text-muted-foreground">
        {faceNoticePoints(t.org.toLowerCase(), 'enrol').map((point) => <li key={point.topic}>{point.text}</li>)}
      </ul>
      <p className="text-muted-foreground">
        Full policy: <span className="font-medium text-foreground">{policy}</span>
      </p>

      <div className="space-y-1.5">
        <p className="font-medium text-foreground">Who agreed?</p>
        <RadioGroup
          value={givenBy}
          onValueChange={(v) => onGivenByChange(v === 'guardian' ? 'guardian' : 'self')}
          className="flex flex-wrap gap-4"
          disabled={disabled}
        >
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="self" id={`${idPrefix}-self`} />
            <Label htmlFor={`${idPrefix}-self`} className="text-xs font-normal">{who} themselves</Label>
          </div>
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="guardian" id={`${idPrefix}-guardian`} />
            <Label htmlFor={`${idPrefix}-guardian`} className="text-xs font-normal">A parent or guardian (under 18, or unable to agree)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id={`${idPrefix}-consent`}
          checked={consent}
          onCheckedChange={(v) => onConsentChange(v === true)}
          disabled={disabled}
          className="mt-0.5"
        />
        <Label htmlFor={`${idPrefix}-consent`} className="text-xs font-normal leading-snug">
          {givenBy === 'guardian' ? `${who}'s parent or guardian` : who} was shown this notice and agreed to face
          check-in. If they said no, don&rsquo;t take the photo — they can check in with their phone number.
        </Label>
      </div>
    </div>
  );
}
