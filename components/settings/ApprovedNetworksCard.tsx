'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Globe, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNetworkSettings, useUpdateNetworkSettings } from '@/hooks/useSettings';
import type { ApprovedNetwork } from '@/services/settings.service';

/** "203.0.113.7" and "203.0.113.7/32" are the same entry. */
function sameNetwork(a: string, b: string): boolean {
  const norm = (x: string) => (x.includes('/') ? x : `${x}/${x.includes(':') ? 128 : 32}`).trim().toLowerCase();
  return norm(a) === norm(b);
}

/**
 * Approved networks: desk staff (receptionists, doctors, nurses…) can only use the portal and the
 * app from the clinic's own internet connections. Administrators are never restricted, so a
 * mistake here can always be fixed from anywhere. Off until an administrator turns it on.
 */
export function ApprovedNetworksCard() {
  const { data, isLoading, isError } = useNetworkSettings();
  const save = useUpdateNetworkSettings();
  const [on, setOn] = useState(false);
  const [networks, setNetworks] = useState<ApprovedNetwork[]>([]);
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!data) return;
    setOn(data.mode === 'on');
    setNetworks(data.networks ?? []);
  }, [data]);

  const here = data?.yourAddress ?? '';

  function add(cidr: string, name: string) {
    const value = cidr.trim();
    if (!value || networks.some((n) => sameNetwork(n.cidr, value))) return;
    setNetworks((list) => [...list, { cidr: value, label: name.trim() }]);
    setAddress('');
    setLabel('');
  }

  const dirty = !!data && (on !== (data.mode === 'on') || JSON.stringify(networks) !== JSON.stringify(data.networks ?? []));
  // Listed exactly, or (for the saved list) inside one of its ranges.
  const hereListed = !!here && (networks.some((n) => sameNetwork(n.cidr, here)) || (!dirty && !!data?.yourAddressAllowed));

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
                <Button type="button" variant="link" className="h-auto p-0 text-sm" onClick={() => add(here, 'Added from this device')}>
                  Add this address (do this while you are at the clinic)
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Networks</Label>
              {networks.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
              <ul className="space-y-2">
                {networks.map((n) => (
                  <li key={n.cidr} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                    <span>
                      <span className="font-mono">{n.cidr}</span>
                      {n.label && <span className="ml-2 text-muted-foreground">{n.label}</span>}
                    </span>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${n.cidr}`}
                      onClick={() => setNetworks((list) => list.filter((x) => x.cidr !== n.cidr))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input aria-label="IP address or range" placeholder="Public IP, e.g. 203.0.113.7 or 203.0.113.0/24"
                  value={address} onChange={(e) => setAddress(e.target.value)} />
                <Input aria-label="Label" placeholder="Label, e.g. Main clinic" value={label} onChange={(e) => setLabel(e.target.value)} />
                <Button type="button" variant="outline" onClick={() => add(address, label)} disabled={!address.trim()}>
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use the public address your internet provider gives the clinic, not an in-building one like 192.168.x.x.
                Ask your provider for a fixed (static) IP; an address that changes would lock the desk out when it does.
              </p>
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

            <Button onClick={() => save.mutate({ mode: on ? 'on' : 'off', networks })}
              loading={save.isPending} disabled={!dirty || (on && networks.length === 0)}>
              Save approved networks
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
