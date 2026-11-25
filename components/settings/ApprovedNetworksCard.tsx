'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Building2, Globe, Lightbulb, Plus, ShieldAlert, Trash2, UserCheck, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  useDismissNetworkRefusals, useDismissNetworkSuggestions, useNetworkSettings, useUpdateNetworkSettings,
} from '@/hooks/useSettings';
import { useStaff } from '@/hooks/useStaff';
import { entryFor, isLocationRefusal, keyOf, newSiteId, refusalReasonText, sameNetwork } from '@/lib/clinic-sites';
import type { ApprovedNetwork, ClinicSite, SiteAssignment } from '@/services/settings.service';
import {
  AddressTargetSelect, ClinicSiteEditor, EVERY_CLINIC, NetworkListEditor, SiteAssignmentsEditor,
} from './ClinicSitesEditor';

const DESK_ROLES = new Set(['staff', 'receptionist', 'doctor', 'nurse', 'practitioner', 'assistant']);
const roleName = (role: string) => (role || 'staff').replace(/_/g, ' ');

function when(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

const hasPin = (s: ClinicSite) => s.lat != null && s.lng != null;

/** The Allow button on a refused address, with a choice of clinic when there are several. */
function AllowAddress({ sites, onAllow }: { sites: ClinicSite[]; onAllow: (target: string) => void }) {
  const [target, setTarget] = useState(EVERY_CLINIC);
  return (
    <span className="flex flex-wrap items-center gap-1">
      {sites.length > 0 && <AddressTargetSelect sites={sites} value={target} onChange={setTarget} label="Allow at" />}
      <Button type="button" variant="outline" size="sm" onClick={() => onAllow(target)}>Allow</Button>
    </span>
  );
}

/**
 * Approved networks: desk staff (receptionists, doctors, nurses…) can only use the portal from
 * the organisation's clinics. Administrators are never restricted, so a mistake here can always
 * be fixed from anywhere. Off until an administrator turns it on.
 *
 * A clinic is recognised by its internet address (the strong check), or — for a clinic site with
 * a pin on the map — by a phone or tablet's location (for staff on mobile data, whose address
 * keeps changing). For a clinic whose own address changes: a dynamic-DNS name, approving the
 * new address from "Recently refused", or the "New addresses seen at your clinics" suggestions.
 */
export function ApprovedNetworksCard() {
  const { data, isLoading, isError } = useNetworkSettings();
  const save = useUpdateNetworkSettings();
  const dismiss = useDismissNetworkRefusals();
  const dismissSuggestion = useDismissNetworkSuggestions();
  const { data: staff } = useStaff({});
  const [on, setOn] = useState(false);
  const [networks, setNetworks] = useState<ApprovedNetwork[]>([]);
  const [sites, setSites] = useState<ClinicSite[]>([]);
  const [assignments, setAssignments] = useState<SiteAssignment[]>([]);
  const [exempt, setExempt] = useState<string[]>([]);
  const [person, setPerson] = useState('');
  const [hereTarget, setHereTarget] = useState(EVERY_CLINIC);

  useEffect(() => {
    if (!data) return;
    setOn(data.mode === 'on');
    setNetworks(data.networks ?? []);
    setSites(data.sites ?? []);
    setAssignments(data.assignments ?? []);
    setExempt(data.exempt ?? []);
  }, [data]);

  const here = data?.yourAddress ?? '';
  const refusals = data?.refusals ?? [];
  const suggestions = data?.suggestions ?? [];
  const hostAddresses = data?.hostAddresses ?? {};
  const defaultRadius = data?.limits?.defaultRadius ?? 200;
  const maxSites = data?.limits?.maxSites ?? 25;

  const deskPeople = useMemo(
    () => (staff ?? []).filter((s) => s.email && DESK_ROLES.has(String(s.role))),
    [staff],
  );
  const peopleOptions = useMemo(
    () => deskPeople.map((s) => ({ id: s.id, email: String(s.email).toLowerCase(), label: `${s.name} (${roleName(String(s.role))})` })),
    [deskPeople],
  );
  const nameByEmail = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of staff ?? []) if (s.email) map.set(s.email.toLowerCase(), s.name);
    return map;
  }, [staff]);
  const siteName = (id: string) => sites.find((s) => s.id === id)?.name || 'a clinic';

  const inList = (list: ApprovedNetwork[], value: string) => list.some((n) => sameNetwork(keyOf(n), value));
  const listedAnywhere = (value: string) => inList(networks, value) || sites.some((s) => inList(s.networks, value));

  /** Add an address to every clinic's list, or to one clinic's own list. */
  function addAddress(value: string, label: string, target: string) {
    const v = value.trim();
    if (!v) return;
    if (target === EVERY_CLINIC) {
      if (!inList(networks, v)) setNetworks((list) => [...list, entryFor(v, label)]);
      return;
    }
    setSites((list) => list.map((s) => (s.id !== target || inList(s.networks, v) ? s : { ...s, networks: [...s.networks, entryFor(v, label)] })));
  }

  function addPerson(value: string) {
    const email = value.trim().toLowerCase();
    if (!email || exempt.includes(email)) return;
    setExempt((list) => [...list, email]);
    setPerson('');
  }

  function addSite() {
    setSites((list) => [...list, { id: newSiteId(), name: '', networks: [] }]);
  }

  function removeSite(id: string) {
    setSites((list) => list.filter((s) => s.id !== id));
    // People limited to that clinic lose it; someone left with none can use every clinic.
    setAssignments((list) => list.map((a) => ({ ...a, sites: a.sites.filter((s) => s !== id) })));
    if (hereTarget === id) setHereTarget(EVERY_CLINIC);
  }

  const hasRules = networks.length > 0 || sites.some((s) => s.networks.length > 0 || hasPin(s));
  const unnamed = sites.some((s) => !s.name.trim());
  const dirty = !!data && (
    on !== (data.mode === 'on')
    || JSON.stringify(networks) !== JSON.stringify(data.networks ?? [])
    || JSON.stringify(sites) !== JSON.stringify(data.sites ?? [])
    || JSON.stringify(assignments) !== JSON.stringify(data.assignments ?? [])
    || JSON.stringify(exempt) !== JSON.stringify(data.exempt ?? [])
  );
  // Listed exactly, or (for the saved list) inside one of its ranges or hostnames.
  const hereListed = !!here && (listedAnywhere(here) || (!dirty && !!data?.yourAddressAllowed));
  const hereWhere = data && !dirty && data.yourAddressAllowed
    ? (data.yourAddressEverywhere ? 'every clinic' : (data.yourAddressSites ?? []).map(siteName).join(', '))
    : '';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4" aria-hidden="true" /> Approved networks</CardTitle>
          {data && <Badge variant={data.mode === 'on' ? 'default' : 'secondary'}>{data.mode === 'on' ? 'On' : 'Off'}</Badge>}
        </div>
        <CardDescription>
          Only allow front-desk and clinical staff to sign in at your clinics: on a clinic&rsquo;s internet connection,
          or on a phone or tablet whose location is at the clinic. Administrators can always sign in, so this can be
          changed from anywhere.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {isError && <p className="text-sm text-destructive">Could not load approved networks. Refresh to try again.</p>}
        {data && (
          <>
            <div className="space-y-2 rounded-lg border bg-muted/40 p-3 text-sm">
              <p>
                Your current address: <span className="font-mono font-medium">{here || 'unknown'}</span>
                {here && (data.yourAddressAllowed
                  ? <span className="ml-2 text-success">is on the list{hereWhere && ` (${hereWhere})`}</span>
                  : <span className="ml-2 text-muted-foreground">is not on the list</span>)}
              </p>
              {here && !hereListed && (
                <div className="flex flex-wrap items-center gap-2">
                  {sites.length > 0 && <AddressTargetSelect sites={sites} value={hereTarget} onChange={setHereTarget} label="Add this address to" />}
                  <Button type="button" variant="link" className="h-auto whitespace-normal p-0 text-left text-sm"
                    onClick={() => addAddress(here, 'Added from this device', hereTarget)}>
                    Add this address (do this while you are at the clinic, on its Wi-Fi)
                  </Button>
                </div>
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
                  Staff were refused in the last two weeks. If an address is your clinic&rsquo;s new one (internet providers
                  change it from time to time), allow it and save. Leave anything you don&rsquo;t recognise refused.
                  Refusals by location are a person away from the clinic; there is nothing to allow.
                </p>
                <ul className="space-y-2">
                  {refusals.map((r) => {
                    const byLocation = isLocationRefusal(r.reason);
                    return (
                      <li key={r.ip} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                        <span className="min-w-0">
                          <span className="font-mono font-medium">{r.ip}</span>
                          <span className="ml-2 text-muted-foreground">
                            {nameByEmail.get(r.email.toLowerCase()) || r.email || 'Someone'} ({roleName(r.role)})
                            {' · '}{r.count === 1 ? 'once' : `${r.count} times`}{r.lastAt && ` · last ${when(r.lastAt)}`}
                          </span>
                          <span className="block text-xs text-muted-foreground">{refusalReasonText(r.reason, r.site, r.distance)}</span>
                        </span>
                        <span className="flex flex-wrap items-center gap-1">
                          {!byLocation && (listedAnywhere(r.ip)
                            ? <span className="px-2 text-xs text-success">Added — save to apply</span>
                            : <AllowAddress sites={sites} onAllow={(target) => addAddress(r.ip, `Approved ${new Date().toLocaleDateString()}`, target)} />)}
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

            {suggestions.length > 0 && (
              <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Lightbulb className="h-4 w-4 text-primary" aria-hidden="true" /> New addresses seen at your clinics
                </p>
                <p className="text-xs text-muted-foreground">
                  Staff whose location placed them at a clinic were on these addresses. If one is the clinic&rsquo;s own
                  internet (its address may have changed), add it so desk computers work again. A phone on mobile data
                  shows up here too — don&rsquo;t add those. Several different people on the same address usually means
                  the clinic&rsquo;s Wi-Fi.
                </p>
                <ul className="space-y-2">
                  {suggestions.map((s) => {
                    const site = sites.find((x) => x.id === s.siteId);
                    const added = !!site && inList(site.networks, s.ip);
                    const people = s.people.map((e) => nameByEmail.get(e) || e);
                    return (
                      <li key={`${s.siteId}-${s.ip}`} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                        <span className="min-w-0">
                          <span className="font-mono font-medium">{s.ip}</span>
                          <span className="ml-2 text-muted-foreground">at {s.siteName}</span>
                          <span className="block text-xs text-muted-foreground">
                            {people.length === 1 ? '1 person' : `${people.length} people`} ({people.join(', ')})
                            {' · '}{s.count === 1 ? 'once' : `${s.count} times`}{s.lastAt && ` · last ${when(s.lastAt)}`}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          {added
                            ? <span className="px-2 text-xs text-success">Added — save to apply</span>
                            : site && (
                              <Button type="button" variant="outline" size="sm"
                                onClick={() => addAddress(s.ip, `Seen at ${s.siteName} ${new Date().toLocaleDateString()}`, s.siteId)}>
                                Add to {s.siteName}
                              </Button>
                            )}
                          <Button type="button" variant="ghost" size="icon" aria-label={`Dismiss ${s.ip}`}
                            onClick={() => dismissSuggestion.mutate({ ip: s.ip, site: s.siteId })} disabled={dismissSuggestion.isPending}>
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
              <Label className="flex items-center gap-2"><Building2 className="h-4 w-4" aria-hidden="true" /> Clinic sites</Label>
              <p className="text-xs text-muted-foreground">
                One per clinic. Give each its own networks and, so staff on phones can sign in off the Wi-Fi, a place on
                the map. Location can be faked by someone determined; the network check cannot, so add each
                clinic&rsquo;s networks too where you can.
              </p>
              {sites.length === 0 && <p className="text-sm text-muted-foreground">None yet. With one clinic, you can use the networks list below instead.</p>}
              <div className="space-y-3">
                {sites.map((s) => (
                  <ClinicSiteEditor key={s.id} site={s} hostAddresses={hostAddresses} defaultRadius={defaultRadius}
                    onChange={(next) => setSites((list) => list.map((x) => (x.id === s.id ? next : x)))}
                    onRemove={() => removeSite(s.id)} />
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addSite} disabled={sites.length >= maxSites}>
                <Plus className="mr-1 h-4 w-4" /> Add clinic site
              </Button>
            </div>

            <div className="space-y-2">
              <Label>{sites.length > 0 ? 'Networks for every clinic' : 'Networks'}</Label>
              {sites.length > 0 && (
                <p className="text-xs text-muted-foreground">Anyone may sign in from these, whichever clinics they work at.</p>
              )}
              <NetworkListEditor networks={networks} onChange={setNetworks} hostAddresses={hostAddresses}
                emptyText="None yet." labelPlaceholder="Label, e.g. Main clinic" />
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Use the public address your internet provider gives the clinic, not an in-building one like 192.168.x.x.
                  A fixed (static) IP from your provider is the most reliable. 5G home internet, Starlink and mobile
                  hotspots share their address with many strangers — don&rsquo;t list those; use the clinic&rsquo;s location instead.
                </p>
                <p>
                  <span className="font-medium text-foreground">Does your clinic&rsquo;s address change?</span>{' '}
                  Turn on dynamic DNS in the clinic&rsquo;s router (most routers support it; No-IP, Dynu and DuckDNS are
                  common free ones) and add that name here, e.g. <span className="font-mono">clinic.ddns.net</span>. The
                  new address is then accepted within a few minutes of the router updating it. Without that, desk
                  computers are refused when the address changes; it appears under &ldquo;Recently refused&rdquo; or
                  &ldquo;New addresses seen&rdquo; above, and you can allow it from anywhere.
                </p>
              </div>
            </div>

            {sites.length > 0 && (
              <SiteAssignmentsEditor sites={sites} assignments={assignments} onChange={setAssignments}
                people={peopleOptions} nameByEmail={nameByEmail} />
            )}

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
                  {peopleOptions.filter((p) => !exempt.includes(p.email)).map((p) => (
                    <option key={p.id} value={p.email}>{p.label}</option>
                  ))}
                </datalist>
                <Button type="button" variant="outline" onClick={() => addPerson(person)} disabled={!person.trim()}>
                  <Plus className="mr-1 h-4 w-4" /> Add person
                </Button>
              </div>
            </div>

            {sites.some(hasPin) && (
              <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Tell your staff.</span> Off the clinic&rsquo;s Wi-Fi, the
                portal asks their device for its location when they sign in and every few minutes while they use it. The
                position is compared with your clinics and not kept; only the clinic and the distance are recorded when
                someone is refused. Several US states (for example New York, Connecticut and Delaware) require employers
                to tell employees in writing about electronic monitoring — check with your counsel.
              </p>
            )}

            <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <Label htmlFor="network-mode">Restrict desk sign-in to your clinics</Label>
                <p className="text-xs text-muted-foreground">Staff elsewhere are signed out with a message saying why.</p>
              </div>
              <Switch id="network-mode" checked={on} onCheckedChange={setOn} disabled={!hasRules && !on} />
            </div>

            {on && !hasRules && (
              <p className="flex items-center gap-2 text-sm text-warning">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Add at least one network or clinic location before switching this on.
              </p>
            )}
            {unnamed && (
              <p className="flex items-center gap-2 text-sm text-warning">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Give every clinic site a name.
              </p>
            )}

            <Button onClick={() => save.mutate({ mode: on ? 'on' : 'off', networks, sites, assignments, exempt })}
              loading={save.isPending} disabled={!dirty || (on && !hasRules) || unnamed}>
              Save approved networks
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
