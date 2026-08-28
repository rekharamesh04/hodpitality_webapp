'use client';

import { useState } from 'react';
import { Settings, Building2, Bell, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store';
import {
  useUpdateProfile,
  useUpdateOrganisation,
  useUpdateNotificationPrefs,
  useChangePassword,
} from '@/hooks/useSettings';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  // ── Profile ──────────────────────────────────────────────────────────────
  const updateProfile = useUpdateProfile();
  const [profile, setProfile] = useState({
    name:  user?.name  ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });

  function handleProfileSave() {
    updateProfile.mutate(profile);
  }

  // ── Organisation ─────────────────────────────────────────────────────────
  const updateOrg = useUpdateOrganisation();
  const [org, setOrg] = useState({ name: '', email: '', phone: '', address: '' });

  function handleOrgSave() {
    updateOrg.mutate(org);
  }

  // ── Notification prefs ───────────────────────────────────────────────────
  const updateNotifPrefs = useUpdateNotificationPrefs();
  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true, sms: false });

  function handleNotifPrefsSave() {
    updateNotifPrefs.mutate(notifPrefs);
  }

  // ── Password ─────────────────────────────────────────────────────────────
  const changePassword = useChangePassword();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  function handlePasswordSave() {
    setPwError('');
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      return setPwError('All password fields are required.');
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      return setPwError('New passwords do not match.');
    }
    changePassword.mutate(
      { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
      { onSuccess: () => setPwForm({ currentPassword: '', newPassword: '', confirm: '' }) }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings and preferences</p>
        </div>
        {user && <Badge variant="outline" className="capitalize">{user.role}</Badge>}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general"><Settings className="mr-1.5 h-3.5 w-3.5" />General</TabsTrigger>
          <TabsTrigger value="organization"><Building2 className="mr-1.5 h-3.5 w-3.5" />Organization</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-1.5 h-3.5 w-3.5" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-1.5 h-3.5 w-3.5" />Security</TabsTrigger>
        </TabsList>

        {/* ── General / Profile ── */}
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
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={user?.role ?? ''} disabled className="capitalize" />
                </div>
              </div>
              <Button onClick={handleProfileSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Organization ── */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Manage your organization information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input
                  placeholder="EntryFlow Corp"
                  value={org.name}
                  onChange={(e) => setOrg((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Organization Email</Label>
                <Input
                  type="email"
                  placeholder="info@entryflow.com"
                  value={org.email}
                  onChange={(e) => setOrg((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={org.phone}
                  onChange={(e) => setOrg((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  placeholder="123 Business St, City, State 12345"
                  value={org.address}
                  onChange={(e) => setOrg((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
              <Button onClick={handleOrgSave} disabled={updateOrg.isPending}>
                {updateOrg.isPending ? 'Saving…' : 'Update Organization'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notification Preferences ── */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                { key: 'email', label: 'Email Notifications',  desc: 'Receive notifications via email'           },
                { key: 'push',  label: 'Push Notifications',   desc: 'Receive browser push notifications'        },
                { key: 'sms',   label: 'SMS Notifications',    desc: 'Receive notifications via text message'    },
              ] as { key: keyof typeof notifPrefs; label: string; desc: string }[]).map((item, i) => (
                <div key={item.key}>
                  {i > 0 && <Separator className="mb-4" />}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifPrefs[item.key]}
                      onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, [item.key]: v }))}
                    />
                  </div>
                </div>
              ))}
              <Separator />
              <Button onClick={handleNotifPrefsSave} disabled={updateNotifPrefs.isPending}>
                {updateNotifPrefs.isPending ? 'Saving…' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security / Password ── */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <PasswordInput
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <PasswordInput
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <PasswordInput
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                />
              </div>
              {pwError && <p className="text-sm text-destructive">{pwError}</p>}
              <Button onClick={handlePasswordSave} disabled={changePassword.isPending}>
                {changePassword.isPending ? 'Updating…' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
