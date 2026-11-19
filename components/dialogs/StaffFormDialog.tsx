'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn, isValidEmail, isValidPhone } from '@/lib/utils';
import {
  isClinicalIndustry, npiError, npiLocation, npiPersonName, npiRegistrySummary,
} from '@/lib/clinical';
import { roleLabel } from '@/constants/roles';
import { useIndustry } from '@/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import { useNpiLookup, useNpiSearch } from '@/hooks/useStaff';
import type { CreateStaffPayload, UpdateStaffPayload } from '@/services/staff.service';
import type { NpiLookupResult, Staff } from '@/types';

type NpiTone = 'hint' | 'loading' | 'good' | 'bad' | 'warn' | 'search';

/** The doctors a name search found. Picking one puts their NPI in the box. */
function NpiSearchResults({ longEnough, waiting, failure, results, onPick }: {
  longEnough: boolean;
  waiting: boolean;
  failure: string | null;
  results?: NpiLookupResult[];
  onPick: (r: NpiLookupResult) => void;
}) {
  if (!longEnough) {
    return <p className="text-xs text-muted-foreground">Type at least two letters of the doctor’s name.</p>;
  }
  if (waiting) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Searching the US NPI Registry…
      </p>
    );
  }
  if (failure) return <p className="text-xs text-amber-700 dark:text-amber-400">{failure}</p>;
  if (!results) return null;
  if (results.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No active providers found. Try the full name, or add a state, e.g. “Allen, TX”.
      </p>
    );
  }
  return (
    <div className="space-y-1.5">
      <ul className="max-h-60 divide-y overflow-y-auto rounded-md border" aria-label="Matching providers">
        {results.map((r) => {
          const who = [npiPersonName(r), r.credential].filter(Boolean).join(', ');
          return (
            <li key={r.npi}>
              <button
                type="button"
                disabled={!!r.problem}
                onClick={() => onPick(r)}
                className="w-full px-3 py-2 text-left text-xs transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-transparent"
              >
                <span className="block text-sm font-medium">{who}</span>
                <span className="block text-muted-foreground">
                  {[r.specialty, npiLocation(r), `NPI ${r.npi}`].filter(Boolean).join(' · ')}
                </span>
                {r.problem && <span className="block text-destructive">{r.message}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">
        Pick the right person — check the specialty and city. Up to 10 shown; add “, TX” to narrow by state.
      </p>
    </div>
  );
}

interface NpiView {
  tone: NpiTone;
  title?: string;
  text: string;
  /** Offered when the registry name differs from what is typed in Name. */
  useName?: string;
}

/** What to show under the NPI box, from what is typed and what the registry said. */
function describeNpi(s: {
  typed: string;
  shapeOk: boolean;
  onFile: boolean;
  staff?: Staff | null;
  waiting: boolean;
  result?: NpiLookupResult;
  notFound: boolean;
  failure: string | null;
  currentName: string;
}): NpiView {
  if (!s.typed) {
    return { tone: 'hint', text: 'Doctors and pharmacists: type the NPI, or the doctor’s name to search for it. The name and specialty are filled in from the official US NPI Registry. Optional for other staff.' };
  }
  if (s.typed.length < 10) return { tone: 'hint', text: `${10 - s.typed.length} more digit${s.typed.length === 9 ? '' : 's'}…` };
  if (!s.shapeOk) return { tone: 'bad', text: npiError(s.typed) ?? 'That NPI is not valid.' };
  if (s.onFile) {
    return { tone: 'good', title: 'Verified with the US NPI Registry', text: npiRegistrySummary(s.staff?.npiRegistry) };
  }
  if (s.waiting) return { tone: 'loading', text: 'Looking up the US NPI Registry…' };
  if (s.notFound) {
    return { tone: 'bad', text: 'This NPI is not in the official US NPI Registry. Check the number with the doctor.' };
  }
  if (s.failure) return { tone: 'warn', text: s.failure };
  if (!s.result) return { tone: 'hint', text: '' };

  const r = s.result;
  const where = npiLocation(r);
  const who = [npiRegistrySummary(r), where].filter(Boolean).join(' · ');
  if (r.problem) return { tone: 'bad', title: who, text: r.message ?? 'This NPI cannot be used.' };
  const registered = npiPersonName(r);
  const typedName = s.currentName.trim();
  return {
    tone: 'good',
    title: 'Found in the US NPI Registry',
    text: who,
    useName: typedName && registered && typedName.toLowerCase() !== registered.toLowerCase() ? registered : undefined,
  };
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: string;
  tenantId: string;
  npi: string;
}

function emptyForm(): FormState {
  return { name: '', email: '', phone: '', department: '', role: '', status: '', tenantId: '', npi: '' };
}

function toFormState(staff: Staff): FormState {
  return {
    name: staff.name ?? '',
    email: staff.email ?? '',
    phone: staff.phone ?? '',
    department: staff.department ?? '',
    role: typeof staff.role === 'string' ? staff.role : '',
    status: staff.status ?? '',
    tenantId: '',
    npi: staff.npi ?? '',
  };
}

/** `isEditing` mirrors the pattern proven necessary for Guest/Customer/Venue/Event edits: the
 * backend's UpdateItem call needs free-text fields present in the body even blank, or it can
 * 500 on a missing DynamoDB expression attribute value. Create omits blank optional fields so
 * the backend can default a brand-new item. Email is deliberately excluded from the edit
 * payload — see the "Email" field note below. */
/** `clinical`: the NPI field is shown, so its value is sent. Other industries never send it. */
function toCreatePayload(form: FormState, clinical: boolean): CreateStaffPayload {
  const payload: CreateStaffPayload = {
    name: form.name.trim(),
    email: form.email.trim(),
  };
  if (form.phone.trim())       payload.phone = form.phone.trim();
  if (form.department.trim()) payload.department = form.department.trim();
  if (form.role)               payload.role = form.role;
  if (form.status)             payload.status = form.status as Staff['status'];
  if (form.tenantId)           payload.tenant_id = form.tenantId;
  if (clinical && form.npi.trim()) payload.npi = form.npi.trim();
  return payload;
}

/** NPI is sent only when it changed — "" then clears it on the server. */
function toUpdatePayload(form: FormState, clinical: boolean, original: Staff | null | undefined): UpdateStaffPayload {
  const payload: UpdateStaffPayload = {
    name: form.name.trim(),
    phone: form.phone.trim(),
    department: form.department.trim(),
    role: form.role || undefined,
    status: (form.status || undefined) as Staff['status'] | undefined,
  };
  if (clinical && form.npi.trim() !== (original?.npi ?? '')) payload.npi = form.npi.trim();
  return payload;
}

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'tenantId' | 'role' | 'npi', string>>;

function validate(form: FormState, needsHospital: boolean, isEditing: boolean, clinical: boolean): FieldErrors {
  const errors: FieldErrors = {};
  if (clinical && form.npi.trim()) {
    const npiProblem = npiError(form.npi);
    if (npiProblem) errors.npi = npiProblem;
  }
  if (!isEditing && !form.role) errors.role = 'Choose a role';
  // A super admin needs no company; every other role belongs to one.
  if (needsHospital && form.role !== 'super_admin' && !form.tenantId) errors.tenantId = 'Choose a company';
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(form.email.trim())) errors.email = 'Enter a valid email address';
  if (form.phone.trim() && !isValidPhone(form.phone.trim())) errors.phone = 'Enter a valid phone number';
  return errors;
}

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: Staff | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  roleOptions: string[];
  /** Hospitals to choose from — only passed for super_admin / reseller callers. */
  /** `industry` lets role labels follow the chosen company (a spa's "doctor" is a Therapist). */
  hospitalOptions?: { value: string; label: string; industry?: string }[];
  /** Pre-selects the company for a new staff member — the one a platform user is viewing. */
  defaultTenantId?: string;
  departmentOptions: string[];
  onSubmit: (payload: CreateStaffPayload | UpdateStaffPayload) => void;
}

/** Legacy role id → the industry-neutral id with the same label and permissions. */
const LEGACY_ROLE_ALIASES: Record<string, string> = { doctor: 'practitioner', nurse: 'assistant' };

export function StaffFormDialog({
  open, onOpenChange, staff, isSubmitting, submitError, roleOptions, hospitalOptions = [], departmentOptions, onSubmit,
  defaultTenantId,
}: StaffFormDialogProps) {
  const ownIndustry = useIndustry();
  const isEditing = !!staff;
  // doctor/nurse and practitioner/assistant carry the same label in every
  // industry, so offering all four listed "Doctor" and "Nurse" twice. New
  // staff get the neutral ids; a legacy id is kept only for someone who
  // already holds it, so their current role still shows.
  const currentRole = typeof staff?.role === 'string' ? staff.role : '';
  const visibleRoleOptions = roleOptions.filter(
    (r) => !(r in LEGACY_ROLE_ALIASES) || r === currentRole || !roleOptions.includes(LEGACY_ROLE_ALIASES[r]),
  );
  const needsHospital = !isEditing && hospitalOptions.length > 0;
  const [form, setForm] = useState<FormState>(emptyForm());
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open) {
      setForm(staff
        ? toFormState(staff)
        : { ...emptyForm(), tenantId: hospitalOptions.some((h) => h.value === defaultTenantId) ? defaultTenantId ?? '' : '' });
      setFieldErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, staff?.id]);

  // Role names in the words of the company this person belongs to.
  const industry = (hospitalOptions.find((h) => h.value === form.tenantId)?.industry
    || staff?.tenantIndustry || ownIndustry) as Parameters<typeof roleLabel>[1];
  // Hospitals and pharmacies record a US NPI; hotels and schools never see the field.
  const clinical = isClinicalIndustry(industry);

  // ── NPI lookup as it is typed ──
  // Once the NPI is well-formed, ask the US NPI Registry (through our server) who it belongs
  // to, fill in the name and department if they are empty, and warn before saving if the
  // number cannot be used. The server checks everything again on save.
  const typedNpi = form.npi.trim();
  const npiShapeOk = clinical && typedNpi.length === 10 && !npiError(typedNpi);
  const npiOnFile = isEditing && !!staff?.npi && typedNpi === staff.npi && !!staff.npiRegistry?.name;
  const debouncedNpi = useDebounce(npiShapeOk && !npiOnFile ? typedNpi : '', 400);
  const npiQuery = useNpiLookup(open ? debouncedNpi : '', {
    tenantId: form.tenantId || undefined,
    staffId: staff?.id,
  });
  const npiCurrent = !!debouncedNpi && debouncedNpi === typedNpi;
  const npiResult = npiCurrent ? npiQuery.data : undefined;
  const npiFailure = npiCurrent && npiQuery.error
    ? npiQuery.error as { response?: { status?: number }; backendMessage?: string }
    : null;
  const npiNotFound = npiFailure?.response?.status === 404;

  // What the registry last filled in. A field is only ever replaced if it is empty or still
  // holds that auto-filled value — never something the person typed themselves.
  const autoFilled = useRef({ npi: '', name: '', department: '' });
  useEffect(() => {
    if (open) autoFilled.current = { npi: '', name: '', department: '' };
  }, [open]);
  useEffect(() => {
    if (!npiResult || npiResult.problem || autoFilled.current.npi === npiResult.npi) return;
    const prev = autoFilled.current;
    const name = npiPersonName(npiResult);
    const department = npiResult.specialty ?? '';
    setForm((f) => ({
      ...f,
      name: !f.name.trim() || (prev.name && f.name === prev.name) ? name : f.name,
      department: !f.department.trim() || (prev.department && f.department === prev.department) ? department : f.department,
    }));
    autoFilled.current = { npi: npiResult.npi, name, department };
  }, [npiResult]);

  // ── Search by name ──
  // Letters in the NPI box search the registry by name instead ("Coburn Allen", "Allen, TX").
  // Picking a result puts its NPI in the box, and the lookup above takes over from there.
  const npiSearching = clinical && /[a-z]/i.test(form.npi);
  const searchText = form.npi.trim();
  const debouncedSearch = useDebounce(npiSearching ? searchText : '', 400);
  const searchLongEnough = debouncedSearch.replace(/[^a-z]/gi, '').length >= 2;
  const npiSearch = useNpiSearch(open && npiSearching && searchLongEnough ? debouncedSearch : '', {
    tenantId: form.tenantId || undefined,
    staffId: staff?.id,
  });
  const searchCurrent = !!debouncedSearch && debouncedSearch === searchText;
  const searchFailure = searchCurrent && npiSearch.error
    ? npiSearch.error as { response?: { status?: number }; backendMessage?: string }
    : null;

  const npiView: NpiView = npiSearching
    ? { tone: 'search', text: '' }
    : describeNpi({
      typed: typedNpi, shapeOk: npiShapeOk, onFile: npiOnFile, staff,
      waiting: npiShapeOk && !npiOnFile && (!npiCurrent || npiQuery.isFetching),
      result: npiResult, notFound: npiNotFound,
      failure: npiFailure && !npiNotFound ? (npiFailure.backendMessage ?? "Couldn't reach the US NPI Registry right now. It will be checked again when you save.") : null,
      currentName: form.name,
    });

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key as keyof FieldErrors]) {
      setFieldErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    const errors = validate(form, needsHospital, isEditing, clinical);
    // The registry has already said no: don't send a save the server will refuse.
    if (!errors.npi && npiView.tone === 'bad') errors.npi = npiView.text;
    // A name still in the box is a search, not an NPI.
    if (npiSearching) errors.npi = 'Pick the doctor from the list, or type the 10-digit NPI.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    onSubmit(isEditing ? toUpdatePayload(form, clinical, staff) : toCreatePayload(form, clinical));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isSubmitting && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update this staff member’s details.'
              : 'Adds a staff record and sends an account invite to their email.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            {submitError && (
              <Alert variant="destructive" className="sm:col-span-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {clinical && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="staff-npi">NPI</Label>
                <Input
                  id="staff-npi"
                  autoComplete="off"
                  value={form.npi}
                  onChange={(e) => {
                    // Digits are an NPI (spaces and dashes dropped, 10 at most); letters are a name search.
                    const v = e.target.value;
                    update('npi', /[a-z]/i.test(v) ? v.slice(0, 60) : v.replace(/\D/g, '').slice(0, 10));
                  }}
                  placeholder="10-digit NPI, or search by name (e.g. Coburn Allen, TX)"
                  aria-invalid={!!fieldErrors.npi || npiView.tone === 'bad'}
                  aria-describedby="staff-npi-status"
                />
                <div id="staff-npi-status" aria-live="polite">
                  {fieldErrors.npi ? (
                    <p className="text-xs text-destructive">{fieldErrors.npi}</p>
                  ) : npiView.tone === 'search' ? (
                    <NpiSearchResults
                      longEnough={searchLongEnough}
                      waiting={searchLongEnough && (!searchCurrent || npiSearch.isFetching)}
                      failure={searchFailure
                        ? (searchFailure.backendMessage ?? "Couldn't reach the US NPI Registry right now. Try again, or type the 10-digit NPI.")
                        : null}
                      results={searchCurrent ? npiSearch.data : undefined}
                      onPick={(r) => update('npi', r.npi)}
                    />
                  ) : npiView.tone === 'hint' ? (
                    <p className="text-xs text-muted-foreground">{npiView.text}</p>
                  ) : npiView.tone === 'loading' ? (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> {npiView.text}
                    </p>
                  ) : (
                    <div
                      className={cn(
                        'flex items-start gap-2 rounded-md border p-2.5 text-xs',
                        npiView.tone === 'good' && 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200',
                        npiView.tone === 'bad' && 'border-destructive/40 bg-destructive/5 text-destructive',
                        npiView.tone === 'warn' && 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200',
                      )}
                    >
                      {npiView.tone === 'good'
                        ? <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                        : <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        {npiView.title && <p className="font-medium">{npiView.title}</p>}
                        <p>{npiView.text}</p>
                        {npiView.useName && (
                          <button
                            type="button"
                            className="font-medium underline underline-offset-2"
                            onClick={() => update('name', npiView.useName!)}
                          >
                            Use the registered name “{npiView.useName}”
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="staff-name">Name *</Label>
              <Input
                id="staff-name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Jane Smith"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'staff-name-error' : undefined}
              />
              {fieldErrors.name && <p id="staff-name-error" className="text-xs text-destructive">{fieldErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-email">Email *</Label>
              <Input
                id="staff-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="jane@example.com"
                disabled={isEditing}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'staff-email-error' : 'staff-email-hint'}
              />
              {fieldErrors.email && <p id="staff-email-error" className="text-xs text-destructive">{fieldErrors.email}</p>}
              {isEditing && !fieldErrors.email && (
                <p id="staff-email-hint" className="text-xs text-muted-foreground">Email is tied to their account and can’t be changed here.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-phone">Phone</Label>
              <Input
                id="staff-phone"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+1 234 567 8900"
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? 'staff-phone-error' : undefined}
              />
              {fieldErrors.phone && <p id="staff-phone-error" className="text-xs text-destructive">{fieldErrors.phone}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-department">Department</Label>
              <Input
                id="staff-department"
                list="staff-department-options"
                value={form.department}
                onChange={(e) => update('department', e.target.value)}
                placeholder="Front Desk, Operations…"
              />
              <datalist id="staff-department-options">
                {departmentOptions.map((d) => <option key={d} value={d} />)}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-role">Role *</Label>
              <Select value={form.role || undefined} onValueChange={(v) => update('role', v)}>
                <SelectTrigger id="staff-role" aria-invalid={!!fieldErrors.role}><SelectValue placeholder="Choose a role" /></SelectTrigger>
                <SelectContent>
                  {visibleRoleOptions.map((r) => <SelectItem key={r} value={r}>{roleLabel(r, industry)}</SelectItem>)}
                </SelectContent>
              </Select>
              {fieldErrors.role && <p className="text-xs text-destructive">{fieldErrors.role}</p>}
              {isEditing && (
                <p className="text-xs text-muted-foreground">Changing the role signs them out so the new access applies at next login.</p>
              )}
            </div>

            {needsHospital && form.role !== 'super_admin' && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="staff-hospital">Company *</Label>
                <Select value={form.tenantId || undefined} onValueChange={(v) => update('tenantId', v)}>
                  <SelectTrigger id="staff-hospital" aria-invalid={!!fieldErrors.tenantId}><SelectValue placeholder="Choose a company" /></SelectTrigger>
                  <SelectContent>
                    {hospitalOptions.map((h) => <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {fieldErrors.tenantId && <p className="text-xs text-destructive">{fieldErrors.tenantId}</p>}
              </div>
            )}

            {isEditing && (
              <div className="space-y-1.5">
                <Label htmlFor="staff-status">Status</Label>
                <Select value={form.status || undefined} onValueChange={(v) => update('status', v)}>
                  <SelectTrigger id="staff-status"><SelectValue placeholder="Backend default" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Inactive staff cannot sign in.</p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
