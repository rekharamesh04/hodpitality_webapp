'use client';

import { useState } from 'react';
import { Building2, Crosshair, MapPin, Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RADIUS_CHOICES, describeDistance, entryFor, keyOf, parseCoordinates, radiusLabel, sameNetwork } from '@/lib/clinic-sites';
import { readPosition } from '@/lib/location-pass';
import type { ApprovedNetwork, ClinicSite, SiteAssignment } from '@/services/settings.service';

/** Where an address being added goes: every clinic ('all') or one site's own list. */
export const EVERY_CLINIC = 'all';

export function AddressTargetSelect({ sites, value, onChange, label }: {
  sites: ClinicSite[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-full sm:w-48" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={EVERY_CLINIC}>Every clinic</SelectItem>
        {sites.map((s) => (
          <SelectItem key={s.id} value={s.id}>{s.name || 'Unnamed clinic'}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** A list of addresses, ranges and dynamic-DNS names, with a row to add one. */
export function NetworkListEditor({ networks, onChange, hostAddresses, emptyText, labelPlaceholder }: {
  networks: ApprovedNetwork[];
  onChange: (networks: ApprovedNetwork[]) => void;
  hostAddresses: Record<string, string[]>;
  emptyText: string;
  labelPlaceholder: string;
}) {
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');

  function add() {
    const v = address.trim();
    if (!v) return;
    if (!networks.some((n) => sameNetwork(keyOf(n), v))) onChange([...networks, entryFor(v, label.trim())]);
    setAddress('');
    setLabel('');
  }

  return (
    <div className="space-y-2">
      {networks.length === 0 && <p className="text-sm text-muted-foreground">{emptyText}</p>}
      <ul className="space-y-2">
        {networks.map((n) => {
          const key = keyOf(n);
          const resolved = n.host ? hostAddresses[n.host] : undefined;
          return (
            <li key={key} className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm">
              <span className="min-w-0 break-words">
                <span className="font-mono">{key}</span>
                {n.label && <span className="ml-2 text-muted-foreground">{n.label}</span>}
                {n.host && (
                  <span className="block text-xs text-muted-foreground">
                    {resolved === undefined
                      ? 'Dynamic-DNS name — checked after you save'
                      : resolved.length
                        ? <>Points to <span className="font-mono">{resolved.join(', ')}</span> now</>
                        : <span className="text-warning">Not found right now — check the name and your router&rsquo;s dynamic-DNS setting</span>}
                  </span>
                )}
              </span>
              <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${key}`}
                onClick={() => onChange(networks.filter((x) => keyOf(x) !== key))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          );
        })}
      </ul>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input aria-label="IP address, range or hostname" placeholder="203.0.113.7, 203.0.113.0/24 or clinic.ddns.net"
          value={address} onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <Input aria-label="Label" placeholder={labelPlaceholder} value={label} onChange={(e) => setLabel(e.target.value)} />
        <Button type="button" variant="outline" onClick={add} disabled={!address.trim()}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
}

/** One clinic: its name, its place on the map (optional) and its own networks. */
export function ClinicSiteEditor({ site, onChange, onRemove, hostAddresses, defaultRadius }: {
  site: ClinicSite;
  onChange: (site: ClinicSite) => void;
  onRemove: () => void;
  hostAddresses: Record<string, string[]>;
  defaultRadius: number;
}) {
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState<{ text: string; tone: 'info' | 'warning' | 'error' } | null>(null);
  const [pasted, setPasted] = useState('');
  const pinned = site.lat != null && site.lng != null;
  const radius = site.radius ?? defaultRadius;
  const radiusChoices = RADIUS_CHOICES.includes(radius) ? RADIUS_CHOICES : [...RADIUS_CHOICES, radius].sort((a, b) => a - b);

  async function useMyLocation() {
    setLocating(true);
    setNote(null);
    const reading = await readPosition();
    setLocating(false);
    if ('problem' in reading) {
      setNote({
        tone: 'error',
        text: reading.problem === 'denied'
          ? 'Location is blocked for this site in your browser. Allow it (address bar → site settings), or paste the clinic’s coordinates below.'
          : 'This device could not find its location. Paste the clinic’s coordinates below instead.',
      });
      return;
    }
    if (reading.accuracy > 1000) {
      setNote({
        tone: 'error',
        text: `This device could only place you within about ${describeDistance(reading.accuracy)} — too vague for a clinic. Do this on a phone inside the clinic, or paste the clinic’s coordinates below.`,
      });
      return;
    }
    onChange({ ...site, lat: Math.round(reading.lat * 1e6) / 1e6, lng: Math.round(reading.lng * 1e6) / 1e6, radius });
    setNote(reading.accuracy > 100
      ? { tone: 'warning', text: `Set, but this device was only sure to within about ${describeDistance(reading.accuracy)}. Check the pin on the map; for an exact one, do this on a phone inside the clinic.` }
      : { tone: 'info', text: 'Set to where you are now. Check the pin on the map.' });
  }

  function usePasted() {
    const point = parseCoordinates(pasted);
    if (!point) {
      setNote({ tone: 'error', text: 'Paste the two numbers from the map, for example 29.7420, -95.3780.' });
      return;
    }
    onChange({ ...site, ...point, radius });
    setPasted('');
    setNote({ tone: 'info', text: 'Set. Check the pin on the map.' });
  }

  const toneClass = { info: 'text-muted-foreground', warning: 'text-warning', error: 'text-destructive' };

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <Input aria-label="Clinic name" placeholder="Clinic name, e.g. Midtown" value={site.name} maxLength={60}
          onChange={(e) => onChange({ ...site, name: e.target.value })} />
        <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${site.name || 'this clinic'}`} onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" aria-hidden="true" /> Location</Label>
        {pinned ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <a className="font-mono text-primary underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer"
              href={`https://www.google.com/maps?q=${site.lat},${site.lng}`}>
              {site.lat?.toFixed(5)}, {site.lng?.toFixed(5)}
            </a>
            <span className="text-muted-foreground">within</span>
            <Select value={String(radius)} onValueChange={(v) => onChange({ ...site, radius: Number(v) })}>
              <SelectTrigger className="h-9 w-44" aria-label="Distance from the pin that counts as at the clinic">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {radiusChoices.map((r) => <SelectItem key={r} value={String(r)}>{radiusLabel(r)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button type="button" variant="ghost" size="sm" onClick={() => { onChange({ ...site, lat: undefined, lng: undefined, radius: undefined }); setNote(null); }}>
              Remove location
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Not set — staff can only sign in here on this clinic&rsquo;s networks below.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={useMyLocation} loading={locating}>
            <Crosshair className="mr-1 h-4 w-4" /> {pinned ? 'Set again from where I am' : 'Use my current location'}
          </Button>
          <div className="flex w-full min-w-0 gap-2 sm:w-auto sm:flex-1">
            <Input className="h-9 min-w-0" aria-label="Clinic coordinates" placeholder="or paste coordinates, e.g. 29.7420, -95.3780"
              value={pasted} onChange={(e) => setPasted(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); usePasted(); } }} />
            <Button type="button" variant="outline" size="sm" onClick={usePasted} disabled={!pasted.trim()}>Set</Button>
          </div>
        </div>
        {note && <p className={`text-xs ${toneClass[note.tone]}`}>{note.text}</p>}
        <p className="text-xs text-muted-foreground">
          Lets staff sign in on a phone or tablet when it is inside this circle, even off the clinic&rsquo;s Wi-Fi.
          Press the button while standing inside the clinic, or in Google Maps right-click the building and click the
          numbers to copy them. 150&ndash;300 m suits most clinics; use more for a large campus.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">This clinic&rsquo;s networks</Label>
        <NetworkListEditor networks={site.networks} onChange={(networks) => onChange({ ...site, networks })}
          hostAddresses={hostAddresses} emptyText="None yet." labelPlaceholder="Label, e.g. Front desk Wi-Fi" />
      </div>
    </div>
  );
}

/** Who may sign in only at some clinics. Everyone not listed may use every clinic. */
export function SiteAssignmentsEditor({ sites, assignments, onChange, people, nameByEmail }: {
  sites: ClinicSite[];
  assignments: SiteAssignment[];
  onChange: (assignments: SiteAssignment[]) => void;
  people: { id: string; email: string; label: string }[];
  nameByEmail: Map<string, string>;
}) {
  const [email, setEmail] = useState('');
  const siteName = (id: string) => sites.find((s) => s.id === id)?.name || 'Unnamed clinic';

  function toggle(person: string, siteId: string, on: boolean) {
    onChange(assignments.map((a) => a.email !== person ? a : {
      ...a, sites: on ? [...a.sites, siteId] : a.sites.filter((s) => s !== siteId),
    }));
  }

  function add() {
    const e = email.trim().toLowerCase();
    if (!e || assignments.some((a) => a.email === e) || sites.length === 0) return;
    onChange([...assignments, { email: e, sites: [sites[0].id] }]);
    setEmail('');
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2"><Users className="h-4 w-4" aria-hidden="true" /> Staff who work at certain clinics only</Label>
      <p className="text-xs text-muted-foreground">
        Everyone else can sign in at every clinic. Tick the clinics each person works at.
      </p>
      {assignments.length === 0 && <p className="text-sm text-muted-foreground">Nobody — everyone can use every clinic.</p>}
      <ul className="space-y-2">
        {assignments.map((a) => (
          <li key={a.email} className="space-y-2 rounded-md border px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate">
                {nameByEmail.get(a.email) && <span className="mr-2">{nameByEmail.get(a.email)}</span>}
                <span className="text-muted-foreground">{a.email}</span>
              </span>
              <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${a.email}`}
                onClick={() => onChange(assignments.filter((x) => x.email !== a.email))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {sites.map((s) => {
                const id = `assign-${a.email}-${s.id}`;
                return (
                  <label key={s.id} htmlFor={id} className="flex items-center gap-2">
                    <Checkbox id={id} checked={a.sites.includes(s.id)} onCheckedChange={(v) => toggle(a.email, s.id, v === true)} />
                    {s.name || 'Unnamed clinic'}
                  </label>
                );
              })}
            </div>
            {a.sites.length === 0 && (
              <p className="text-xs text-warning">No clinic ticked — when saved, they can sign in at every clinic.</p>
            )}
            {a.sites.length > 0 && (
              <p className="text-xs text-muted-foreground">Only at {a.sites.map(siteName).join(', ')}.</p>
            )}
          </li>
        ))}
      </ul>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input aria-label="Staff email" placeholder="Staff email" list="network-site-people" type="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <datalist id="network-site-people">
          {people.filter((p) => !assignments.some((a) => a.email === p.email)).map((p) => (
            <option key={p.id} value={p.email}>{p.label}</option>
          ))}
        </datalist>
        <Button type="button" variant="outline" onClick={add} disabled={!email.trim() || sites.length === 0}>
          <Plus className="mr-1 h-4 w-4" /> Add person
        </Button>
      </div>
    </div>
  );
}
