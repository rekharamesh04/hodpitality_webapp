'use client';

import { useState } from 'react';
import { Settings, Building2, Bell, Shield, MapPin, Users, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store';

// ─── Mock data for admin-only sections ───────────────────────────────────────

const mockLocations = [
  { id: 'l1', name: 'Harbor Street',   city: 'San Francisco', rooms: 5 },
  { id: 'l2', name: 'Downtown Studio', city: 'Oakland',       rooms: 3 },
];

const mockUsers = [
  { id: 'u1', name: 'Sarah Mitchell',  email: 'sarah@entryflow.com',  role: 'admin',    status: 'active' },
  { id: 'u2', name: 'James Cooper',    email: 'james@entryflow.com',   role: 'admin',    status: 'active' },
  { id: 'u3', name: 'Priya Sharma',    email: 'priya@entryflow.com',   role: 'admin',    status: 'active' },
  { id: 'u4', name: 'Alex Fernandez',  email: 'alex@reseller.com',     role: 'reseller', status: 'active' },
  { id: 'u5', name: 'Nina Walsh',      email: 'nina@reseller.com',     role: 'reseller', status: 'active' },
];

const mockCompanies = [
  { id: 'co1', name: 'Luxe Events Ltd',   contact: 'events@luxe.com',   locations: 2 },
  { id: 'co2', name: 'Premier Spa Group', contact: 'info@premierspa.com', locations: 1 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function LocationsPanel() {
  const [locations, setLocations] = useState(mockLocations);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', city: '', rooms: '' });

  function handleAdd() {
    if (!form.name.trim() || !form.city.trim()) return;
    setLocations((prev) => [...prev, { id: `l${Date.now()}`, name: form.name, city: form.city, rooms: Number(form.rooms) || 0 }]);
    setForm({ name: '', city: '', rooms: '' });
    setAdding(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Locations</CardTitle>
          <CardDescription>Manage spa / venue locations</CardDescription>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>+ Add Location</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && (
          <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Harbor Street" /></div>
              <div className="space-y-1"><Label>City</Label><Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="San Francisco" /></div>
              <div className="space-y-1"><Label>Rooms</Label><Input type="number" value={form.rooms} onChange={(e) => setForm((p) => ({ ...p, rooms: e.target.value }))} placeholder="4" /></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={!form.name.trim()}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}
        {locations.map((loc) => (
          <div key={loc.id} className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <p className="text-sm font-medium">{loc.name}</p>
              <p className="text-xs text-muted-foreground">{loc.city} · {loc.rooms} rooms</p>
            </div>
            <Button size="sm" variant="ghost" className="text-destructive text-xs" onClick={() => setLocations((p) => p.filter((l) => l.id !== loc.id))}>Remove</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState(mockUsers);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'admin' });

  function handleAdd() {
    if (!form.name.trim() || !form.email.trim()) return;
    setUsers((prev) => [...prev, { id: `u${Date.now()}`, name: form.name, email: form.email, role: form.role, status: 'active' }]);
    setForm({ name: '', email: '', role: 'admin' });
    setAdding(false);
  }

  const ROLE_COLOR: Record<string, string> = {
    admin:    'bg-purple-100 text-purple-800',
    reseller: 'bg-amber-100 text-amber-800',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Users</CardTitle>
          <CardDescription>Manage admin and reseller accounts</CardDescription>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>+ Add User</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && (
          <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" /></div>
              <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="user@example.com" /></div>
              <div className="space-y-1">
                <Label>Role</Label>
                <select className="w-full h-9 rounded-md border bg-background px-2 text-sm" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
                  <option value="admin">Admin</option>
                  <option value="reseller">Reseller</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={!form.name.trim() || !form.email.trim()}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between border rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {u.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
              <Button size="sm" variant="ghost" className="text-destructive text-xs" onClick={() => setUsers((p) => p.filter((x) => x.id !== u.id))}>Remove</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CompaniesPanel() {
  const [companies, setCompanies] = useState(mockCompanies);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', locations: '' });

  function handleAdd() {
    if (!form.name.trim()) return;
    setCompanies((prev) => [...prev, { id: `co${Date.now()}`, name: form.name, contact: form.contact, locations: Number(form.locations) || 0 }]);
    setForm({ name: '', contact: '', locations: '' });
    setAdding(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Companies</CardTitle>
          <CardDescription>Manage client companies you represent</CardDescription>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>+ Add Company</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && (
          <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><Label>Company Name</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Luxe Events Ltd" /></div>
              <div className="space-y-1"><Label>Contact Email</Label><Input type="email" value={form.contact} onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))} placeholder="info@company.com" /></div>
              <div className="space-y-1"><Label>Locations</Label><Input type="number" value={form.locations} onChange={(e) => setForm((p) => ({ ...p, locations: e.target.value }))} placeholder="1" /></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={!form.name.trim()}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}
        {companies.map((co) => (
          <div key={co.id} className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <p className="text-sm font-medium">{co.name}</p>
              <p className="text-xs text-muted-foreground">{co.contact} · {co.locations} location{co.locations !== 1 ? 's' : ''}</p>
            </div>
            <Button size="sm" variant="ghost" className="text-destructive text-xs" onClick={() => setCompanies((p) => p.filter((c) => c.id !== co.id))}>Remove</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin    = user?.role === 'admin' || user?.role === 'super_admin';
  const isReseller = user?.role === 'reseller';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings and preferences</p>
        </div>
        {user && (
          <Badge variant="outline" className="capitalize">{user.role}</Badge>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          {isAdmin    && <TabsTrigger value="locations">Locations</TabsTrigger>}
          {isAdmin    && <TabsTrigger value="users">Users</TabsTrigger>}
          {isReseller && <TabsTrigger value="companies">Companies</TabsTrigger>}
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user?.name ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email ?? ''} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={user?.role ?? ''} disabled className="capitalize" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact View</Label>
                  <p className="text-sm text-muted-foreground">Show more content on screen</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin-only: Locations */}
        {isAdmin && (
          <TabsContent value="locations" className="space-y-6">
            <LocationsPanel />
          </TabsContent>
        )}

        {/* Admin-only: Users */}
        {isAdmin && (
          <TabsContent value="users" className="space-y-6">
            <UsersPanel />
          </TabsContent>
        )}

        {/* Reseller-only: Companies */}
        {isReseller && (
          <TabsContent value="companies" className="space-y-6">
            <CompaniesPanel />
          </TabsContent>
        )}

        {/* Organization */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Manage your organization information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Organization Name</Label><Input placeholder="EntryFlow Corp" /></div>
              <div className="space-y-2"><Label>Organization Email</Label><Input type="email" placeholder="info@entryflow.com" /></div>
              <div className="space-y-2"><Label>Phone Number</Label><Input placeholder="+1 (555) 000-0000" /></div>
              <div className="space-y-2"><Label>Address</Label><Input placeholder="123 Business St, City, State 12345" /></div>
              <Button>Update Organization</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Email Notifications',  desc: 'Receive notifications via email' },
                { label: 'Push Notifications',   desc: 'Receive browser push notifications' },
                { label: 'Check-in Alerts',      desc: 'Get notified on guest check-ins' },
                { label: 'System Updates',       desc: 'Important system announcements' },
              ].map((item, i) => (
                <div key={item.label}>
                  {i > 0 && <Separator className="mb-4" />}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Current Password</Label><Input type="password" /></div>
              <div className="space-y-2"><Label>New Password</Label><Input type="password" /></div>
              <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" /></div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable 2FA</Label>
                  <p className="text-sm text-muted-foreground">Use authenticator app for 2FA</p>
                </div>
                <Switch />
              </div>
              <Button variant="outline">Configure 2FA</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value="Administrator" disabled />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact View</Label>
                  <p className="text-sm text-muted-foreground">Show more content on screen</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Manage your organization information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input id="orgName" placeholder="EntryFlow Corp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgEmail">Organization Email</Label>
                <Input id="orgEmail" type="email" placeholder="info@entryflow.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgPhone">Phone Number</Label>
                <Input id="orgPhone" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgAddress">Address</Label>
                <Input id="orgAddress" placeholder="123 Business St, City, State 12345" />
              </div>
              <Button>Update Organization</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Check-in Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified on guest check-ins</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">Important system announcements</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable 2FA</Label>
                  <p className="text-sm text-muted-foreground">Use authenticator app for 2FA</p>
                </div>
                <Switch />
              </div>
              <Button variant="outline">Configure 2FA</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
