'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Globe, Plus, ShieldAlert, Trash2, UserCheck, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useDismissNetworkRefusals, useNetworkSettings, useUpdateNetworkSettings } from '@/hooks/useSettings';
import { useStaff } from '@/hooks/useStaff';
import type { ApprovedNetwork } from '@/services/settings.service';

/** Digits, dots and a slash, or a colon (IPv6): an address or range. Anything else is a hostname. */
function looksLikeAddress(value: string): boolean {
  const v = value.trim();
  return /^[0-9./]+$/.test(v) || (v.includes(':') && !v.includes('://'));
}

/** The address/range or hostname an entry stands for. */
function keyOf(n: ApprovedNetwork): string {
  return n.cidr ?? n.host ?? '';
}

/** "203.0.113.7" and "203.0.113.7/32" are the same entry; hostnames ignore case. */
function sameNetwork(a: string, b: string): boolean {
  const norm = (x: string) => {
    const v = x.trim().toLowerCase();
    if (!looksLikeAddress(v)) return v.replace(/\.$/, '');
    return v.includes('/') ? v : `${v}/${v.includes(':') ? 128 : 32}`;
  };
  return norm(a) === norm(b);
}

function entryFor(value: string, label: string): ApprovedNetwork {
  const v = value.trim();
  return looksLikeAddress(v) ? { cidr: v, label } : { host: v, label };
}

const DESK_ROLES = new Set(['staff', 'receptionist', 'doctor', 'nurse', 'practitioner', 'assistant']);
const roleName = (role: string) => (role || 'staff').replace(/_/g, ' ');

function when(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/**
 * Approved networks: desk staff (receptionists, doctors, nurses…) can only use the portal and the
 * app from the clinic's own internet connections. Administrators are never restricted, so a
 * mistake here can always be fixed from anywhere. Off until an administrator turns it on.
 *
 * For a clinic whose address changes: list a dynamic-DNS name the router keeps up to date, or
 * approve the new address from "Recently refused" (from anywhere — administrators are not restricted).
 */
export function ApprovedNetworksCard() {
  const { data, isLoading, isError } = useNetworkSettings();
  const save = useUpdateNetworkSettings();
  const dismiss = useDismissNetworkRefusals();
  const { data: staff } = useStaff({});
  const [on, setOn] = useState(false);
  const [networks, setNetworks] = useState<ApprovedNetwork[]>([]);
  const [exempt, setExempt] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [person, setPerson] = useState('');

  useEffect(() => {
    if (!data) return;
    setOn(data.mode === 'on');
    setNetworks(data.networks ?? []);
    setExempt(data.exempt ?? []);
  }, [data]);

  const here = data?.yourAddress ?? '';
  const refusals = data?.refusals ?? [];
  const hostAddresses = data?.hostAddresses ?? {};

  const deskPeople = useMemo(
    () => (staff ?? []).filter((s) => s.email && DESK_ROLES.has(String(s.role))),
    [staff],
  );
  const nameByEmail = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of staff ?? []) if (s.email) map.set(s.email.toLowerCase(), s.name);
    return map;
  }, [staff]);

  const isListed = (value: string) => networks.some((n) => sameNetwork(keyOf(n), value));

  function add(value: string, name: string) {
    const v = value.trim();
    if (!v || isListed(v)) return;
    setNetworks((list) => [...list, entryFor(v, name.trim())]);
    setAddress('');
    setLabel('');
  }

  function addPerson(value: string) {
    const email = value.trim().toLowerCase();
    if (!email || exempt.includes(email)) return;
    setExempt((list) => [...list, email]);
    setPerson('');
  }

  const dirty = !!data && (
    on !== (data.mode === 'on')
    || JSON.stringify(networks) !== JSON.stringify(data.networks ?? [])
    || JSON.stringify(exempt) !== JSON.stringify(data.exempt ?? [])
  );
  // Listed exactly, or (for the saved list) inside one of its ranges or hostnames.
  const hereListed = !!here && (isListed(here) || (!dirty && !!data?.yourAddressAllowed));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4" aria-hidden="true" /> Approved networks</CardTitle>
          {data && <Badge variant={data.mode === 'on' ? 'default' : 'secondary'}>{data.mode === 'on' ? 'On' : 'Off'}</Badge>}
        </div>
        <CardDescription>
          Only allow front-desk and clinical staff to sign in from your clinic&rsquo;s internet connections.
          Administrators can always sign in, so this can be changed from anywhere.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {isError && <p className="text-sm text-destructive">Could not load approved networks. Refresh to try again.</p>}
        {data && (
          <>
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <p>
                Your current address: <span className="font-mono font-medium">{here || 'unknown'}</span>
                {here && (data.yourAddressAllowed
                  ? <span className="ml-2 text-success">is on the list</span>
                  : <span className="ml-2 text-muted-foreground">is not on the list</span>)}
              </p>
              {here && !hereListed && (
                <Button type="button" variant="link" className="h-auto whitespace-normal p-0 text-left text-sm" onClick={() => add(here, 'Added from this device')}>
                  Add this address (do this while you are at the clinic)
                </Button>
              )}
            </div>

            {refusals.length > 0 && (
              <div className="space-y-2 rounded-lg border border-warning/40 bg-warning/5 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <ShieldAlert className="h-4 w-4 text-warning" aria-hidden="true" /> Recently refused
                  </p>
                  <Button type="button" variant="ghost" size="sm" onClick={() => dismiss.mutate(undefined)} disabled={dismiss.isPending}>
                    Dismiss all
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Staff were refused from these addresses in the last two weeks. If one is your clinic&rsquo;s new
                  address (internet providers change it from time to time), allow it and save. Leave anything you
                  don&rsquo;t recognise refused.
                </p>
                <ul className="space-y-2">
                  {refusals.map((r) => {
                    const added = isListed(r.ip);
                    return (
                      <li key={r.ip} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                        <span className="min-w-0">
                          <span className="font-mono font-medium">{r.ip}</span>
                          <span className="ml-2 text-muted-foreground">
                            {nameByEmail.get(r.email.toLowerCase()) || r.email || 'Someone'} ({roleName(r.role)})
                            {' · '}{r.count === 1 ? 'once' : `${r.count} times`}{r.lastAt && ` · last ${when(r.lastAt)}`}
                          </span>
                        </span>
                        <span className="flex gap-1">
                          {added
                            ? <span className="px-2 text-xs text-success">Added — save to apply</span>
                            : (
                              <Button type="button" variant="outline" size="sm"
                                onClick={() => add(r.ip, `Approved ${new Date().toLocaleDateString()}`)}>
                                Allow
                              </Button>
                            )}
                          <Button type="button" variant="ghost" size="icon" aria-label={`Dismiss ${r.ip}`}
                            onClick={() => dismiss.mutate(r.ip)} disabled={dismiss.isPending}>
                            <X className="h-4 w-4" />
                          </Button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <Label>Networks</Label>
              {networks.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
              <ul className="space-y-2">
                {networks.map((n) => {
                  const key = keyOf(n);
                  const resolved = n.host ? hostAddresses[n.host] : undefined;
                  return (
                    <li key={key} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                      <span className="min-w-0">
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
                        onClick={() => setNetworks((list) => list.filter((x) => keyOf(x) !== key))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input aria-label="IP address, range or hostname" placeholder="203.0.113.7, 203.0.113.0/24 or clinic.ddns.net"
                  value={address} onChange={(e) => setAddress(e.target.value)} />
                <Input aria-label="Label" placeholder="Label, e.g. Main clinic" value={label} onChange={(e) => setLabel(e.target.value)} />
                <Button type="button" variant="outline" onClick={() => add(address, label)} disabled={!address.trim()}>
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Use the public address your internet provider gives the clinic, not an in-building one like 192.168.x.x.
                  A fixed (static) IP from your provider is the most reliable.
                </p>
                <p>
                  <span className="font-medium text-foreground">Does your clinic&rsquo;s address change?</span>{' '}
                  Turn on dynamic DNS in the clinic&rsquo;s router (most routers support it; No-IP, Dynu and DuckDNS are
                  common free ones) and add that name here, e.g. <span className="font-mono">clinic.ddns.net</span>. The
                  new address is then accepted within a few minutes of the router updating it. Without that, staff are
                  refused when the address changes; the attempt appears under &ldquo;Recently refused&rdquo; above and in
                  the notifications, and you can allow it from anywhere.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><UserCheck className="h-4 w-4" aria-hidden="true" /> People who can sign in from anywhere</Label>
              <p className="text-xs text-muted-foreground">
                For someone who must work away from the clinic, such as a doctor reviewing records from home, or a test
                account. Keep this list short.
              </p>
              {exempt.length === 0 && <p className="text-sm text-muted-foreground">Nobody.</p>}
              <ul className="space-y-2">
                {exempt.map((email) => (
                  <li key={email} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                    <span className="min-w-0 truncate">
                      {nameByEmail.get(email) && <span className="mr-2">{nameByEmail.get(email)}</span>}
                      <span className="text-muted-foreground">{email}</span>
                    </span>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${email}`}
                      onClick={() => setExempt((list) => list.filter((x) => x !== email))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Input aria-label="Staff email" placeholder="Staff email" list="network-exempt-people" type="email"
                  value={person} onChange={(e) => setPerson(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPerson(person); } }} />
                <datalist id="network-exempt-people">
                  {deskPeople.filter((s) => !exempt.includes(String(s.email).toLowerCase())).map((s) => (
                    <option key={s.id} value={String(s.email).toLowerCase()}>{`${s.name} (${roleName(String(s.role))})`}</option>
                  ))}
                </datalist>
                <Button type="button" variant="outline" onClick={() => addPerson(person)} disabled={!person.trim()}>
                  <Plus className="mr-1 h-4 w-4" /> Add person
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <Label htmlFor="network-mode">Restrict desk sign-in to these networks</Label>
                <p className="text-xs text-muted-foreground">Staff elsewhere are signed out with a message saying why.</p>
              </div>
              <Switch id="network-mode" checked={on} onCheckedChange={setOn} disabled={networks.length === 0 && !on} />
            </div>

            {on && networks.length === 0 && (
              <p className="flex items-center gap-2 text-sm text-warning">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Add at least one network before switching this on.
              </p>
            )}

            <Button onClick={() => save.mutate({ mode: on ? 'on' : 'off', networks, exempt })}
              loading={save.isPending} disabled={!dirty || (on && networks.length === 0)}>
              Save approved networks
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
