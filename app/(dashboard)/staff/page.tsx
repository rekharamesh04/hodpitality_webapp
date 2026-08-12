'use client';

import { useState } from 'react';
import { UserCog, Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff, useUpdateStaffSchedule } from '@/hooks/useStaff';
import type { Staff } from '@/types';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

function getInitials(name?: string) {
  if (!name) return '??';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(val?: string) {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString(); } catch { return val; }
}

const EMPTY_FORM = { name: '', email: '', phone: '', department: '', role: 'Staff' };

export default function StaffPage() {
  const { data, isLoading } = useStaff();
  const createStaff  = useCreateStaff();
  const updateStaff  = useUpdateStaff();
  const deleteStaff  = useDeleteStaff();
  const updateSchedule = useUpdateStaffSchedule();

  const staffList: Staff[] = data?.data ?? [];

  const totalStaff  = staffList.length;
  const activeCount = staffList.filter((s) => s.status === 'active').length;
  const departments = new Set(staffList.map((s) => s.department).filter(Boolean)).size;
  const roles       = new Set(staffList.map((s) => s.role).filter(Boolean)).size;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<Staff | null>(null);
  const [form, setForm]             = useState(EMPTY_FORM);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); }

  function openEdit(s: Staff) {
    setEditing(s);
    setForm({ name: s.name ?? '', email: s.email ?? '', phone: s.phone ?? '', department: s.department ?? '', role: s.role ?? 'Staff' });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.name) return toast.error('Name is required');
    if (editing) {
      const id = editing.id ?? editing.PK?.replace('STAFF#', '') ?? '';
      updateStaff.mutate({ id, data: form }, {
        onSuccess: () => { toast.success('Staff updated'); setDialogOpen(false); },
        onError:   () => toast.error('Failed to update staff'),
      });
    } else {
      createStaff.mutate(form, {
        onSuccess: () => { toast.success('Staff created'); setDialogOpen(false); },
        onError:   () => toast.error('Failed to create staff'),
      });
    }
  }

  function handleDelete(s: Staff) {
    if (!confirm(`Delete ${s.name}?`)) return;
    const id = s.id ?? s.PK?.replace('STAFF#', '') ?? '';
    deleteStaff.mutate(id, {
      onSuccess: () => toast.success('Staff deleted'),
      onError:   () => toast.error('Failed to delete staff'),
    });
  }

  const [scheduleOpen, setScheduleOpen]   = useState(false);
  const [scheduleStaff, setScheduleStaff] = useState<Staff | null>(null);
  const [schedule, setSchedule]           = useState<Record<string, string>>({});

  function openSchedule(s: Staff) {
    setScheduleStaff(s);
    setSchedule((s.schedule as Record<string, string>) ?? {});
    setScheduleOpen(true);
  }

  function handleScheduleUpdate() {
    if (!scheduleStaff) return;
    const id   = scheduleStaff.id ?? scheduleStaff.PK?.replace('STAFF#', '') ?? '';
    const data = Object.fromEntries(Object.entries(schedule).filter(([, v]) => v.trim() !== ''));
    updateSchedule.mutate({ id, schedule: data }, {
      onSuccess: () => { toast.success('Schedule updated'); setScheduleOpen(false); },
      onError:   () => toast.error('Failed to update schedule'),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Staff</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Staff',  value: totalStaff  },
          { label: 'Active',       value: activeCount  },
          { label: 'Departments',  value: departments  },
          { label: 'Roles',        value: roles        },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{s.label}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent>
          </Card>
        ))}
      </div>

      {isLoading && <p className="text-muted-foreground py-10 text-center">Loading staff…</p>}
      {!isLoading && staffList.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No staff found.</CardContent></Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staffList.map((s) => (
          <Card key={s.id ?? s.PK} className="card-hover">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(s.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{s.name ?? '—'}</h3>
                  <p className="text-sm text-muted-foreground truncate">{s.email ?? '—'}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">{s.role ?? 'Staff'}</Badge>
                    {s.department && <Badge variant="secondary" className="text-xs">{s.department}</Badge>}
                    {s.status && (
                      <Badge className={`text-xs ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{s.status}</Badge>
                    )}
                  </div>
                  {(s.joinedDate || s.createdAt) && (
                    <p className="text-xs text-muted-foreground mt-1">Joined: {formatDate(s.joinedDate ?? s.createdAt)}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => openSchedule(s)}>
                  <Clock className="mr-1 h-3 w-3" />Set Schedule
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? 'Edit Staff' : 'Add Staff Member'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { id: 'name',       label: 'Name',       placeholder: 'Full name' },
              { id: 'email',      label: 'Email',      placeholder: 'email@example.com' },
              { id: 'phone',      label: 'Phone',      placeholder: '+1 555 000 0000' },
              { id: 'department', label: 'Department', placeholder: 'e.g. Front Desk' },
            ].map(({ id, label, placeholder }) => (
              <div key={id} className="space-y-1">
                <Label htmlFor={id}>{label}</Label>
                <Input id={id} placeholder={placeholder} value={(form as any)[id]}
                  onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))} />
              </div>
            ))}
            <div className="space-y-1">
              <Label htmlFor="role">Role</Label>
              <select id="role" className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                {['Staff', 'Manager', 'Supervisor', 'Admin'].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createStaff.isPending || updateStaff.isPending}>
              {editing ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Set Schedule – {scheduleStaff?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-3">
                <Label className="w-10 capitalize shrink-0">{day}</Label>
                <Input placeholder="HH:MM-HH:MM (blank = off)" value={schedule[day] ?? ''}
                  onChange={(e) => setSchedule((p) => ({ ...p, [day]: e.target.value }))} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleUpdate} disabled={updateSchedule.isPending}>
              {updateSchedule.isPending ? 'Saving…' : 'Save Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
