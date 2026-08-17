'use client';

import { useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useVenues, useCreateVenue, useUpdateVenue, useDeleteVenue, useUpdateVenueOccupancy } from '@/hooks/useVenues';
import type { Venue } from '@/types';

const EMPTY_FORM = { name: '', capacity: '', type: '', location: '' };

export default function VenuesPage() {
  const { data, isLoading } = useVenues();
  const createVenue  = useCreateVenue();
  const updateVenue  = useUpdateVenue();
  const deleteVenue  = useDeleteVenue();
  const updateOccupancy = useUpdateVenueOccupancy();

  const venues: Venue[] = Array.isArray(data) ? data as Venue[] : [];

  const totalVenues    = venues.length;
  const activeVenues   = venues.filter((v) => v.status === 'active' || !v.status).length;
  const totalCapacity  = venues.reduce((sum, v) => sum + (Number(v.capacity) || 0), 0);
  const avgOccupancy   = venues.length
    ? Math.round(venues.reduce((sum, v) => {
        const occ = Number(v.occupancy ?? v.currentOccupancy ?? 0);
        const cap = Number(v.capacity) || 1;
        return sum + (occ / cap) * 100;
      }, 0) / venues.length)
    : 0;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<Venue | null>(null);
  const [form, setForm]             = useState(EMPTY_FORM);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); }

  function openEdit(v: Venue) {
    setEditing(v);
    setForm({ name: v.name ?? '', capacity: String(v.capacity ?? ''), type: v.type ?? '', location: v.location ?? '' });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.name) return toast.error('Name is required');
    const payload = { ...form, capacity: Number(form.capacity) || 0 };
    if (editing) {
      const id = editing.id ?? editing.PK?.replace('VENUE#', '') ?? '';
      updateVenue.mutate({ id, data: payload }, {
        onSuccess: () => { toast.success('Venue updated'); setDialogOpen(false); },
        onError:   () => toast.error('Failed to update venue'),
      });
    } else {
      createVenue.mutate(payload, {
        onSuccess: () => { toast.success('Venue created'); setDialogOpen(false); },
        onError:   () => toast.error('Failed to create venue'),
      });
    }
  }

  function handleDelete(v: Venue) {
    if (!confirm(`Delete ${v.name ?? 'this venue'}?`)) return;
    const id = v.id ?? v.PK?.replace('VENUE#', '') ?? '';
    deleteVenue.mutate(id, {
      onSuccess: () => toast.success('Venue deleted'),
      onError:   () => toast.error('Failed to delete venue'),
    });
  }

  const [occDialog, setOccDialog]   = useState(false);
  const [occVenue, setOccVenue]     = useState<Venue | null>(null);
  const [occValue, setOccValue]     = useState('');

  function openOccupancy(v: Venue) {
    setOccVenue(v);
    setOccValue(String(v.occupancy ?? v.currentOccupancy ?? ''));
    setOccDialog(true);
  }

  function handleOccUpdate() {
    if (!occVenue) return;
    const id = occVenue.id ?? occVenue.PK?.replace('VENUE#', '') ?? '';
    updateOccupancy.mutate({ id, currentOccupancy: Number(occValue) }, {
      onSuccess: () => { toast.success('Occupancy updated'); setOccDialog(false); },
      onError:   () => toast.error('Failed to update occupancy'),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Venues</h1>
          <p className="text-muted-foreground">Manage event venues and occupancy</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Venue</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Venues',    value: totalVenues   },
          { label: 'Active',          value: activeVenues  },
          { label: 'Total Capacity',  value: totalCapacity },
          { label: 'Avg Occupancy',   value: `${avgOccupancy}%` },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{s.label}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent>
          </Card>
        ))}
      </div>

      {isLoading && <p className="text-muted-foreground py-10 text-center">Loading venues…</p>}
      {!isLoading && venues.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No venues found.</CardContent></Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {venues.map((v) => {
          const cap = Number(v.capacity) || 0;
          const occ = Number(v.occupancy ?? v.currentOccupancy ?? 0);
          const pct = cap > 0 ? Math.min(Math.round((occ / cap) * 100), 100) : 0;
          return (
            <Card key={v.id ?? v.PK} className="card-hover">
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{v.name ?? '—'}</h3>
                    <p className="text-sm text-muted-foreground truncate">{v.location ?? '—'}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {v.type && <Badge variant="outline" className="text-xs">{v.type}</Badge>}
                      {v.status && <Badge className={`text-xs ${v.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{v.status}</Badge>}
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span><Users className="inline h-3 w-3 mr-1" />{occ} / {cap}</span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => openOccupancy(v)}>
                    Update Occupancy
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(v)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? 'Edit Venue' : 'Add Venue'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { id: 'name',     label: 'Name',     placeholder: 'Venue name'     },
              { id: 'capacity', label: 'Capacity', placeholder: 'Max capacity'   },
              { id: 'type',     label: 'Type',     placeholder: 'e.g. Ballroom'  },
              { id: 'location', label: 'Location', placeholder: 'Address or room' },
            ].map(({ id, label, placeholder }) => (
              <div key={id} className="space-y-1">
                <Label htmlFor={id}>{label}</Label>
                <Input id={id} placeholder={placeholder} value={(form as any)[id]}
                  onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createVenue.isPending || updateVenue.isPending}>
              {editing ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={occDialog} onOpenChange={setOccDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle>Update Occupancy – {occVenue?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Current Occupancy</Label>
            <Input type="number" placeholder="e.g. 50" value={occValue} onChange={(e) => setOccValue(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOccDialog(false)}>Cancel</Button>
            <Button onClick={handleOccUpdate} disabled={updateOccupancy.isPending}>
              {updateOccupancy.isPending ? 'Saving…' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
