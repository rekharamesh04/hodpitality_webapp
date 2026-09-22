'use client';

import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useBulkImportGuests } from '@/hooks/use-guests';
import { guestService } from '@/services/guest.service';
import { guestCategories } from '@/constants';
import { useTerminology } from '@/hooks';
import { exportToCSV, getFriendlyErrorMessage } from '@/lib/utils';
import type { Guest } from '@/types';

/**
 * Only the fields POST /guests/bulk-import actually stores. The backend requires name, email and
 * address, defaults category to "regular", and ignores anything else (e.g. notes).
 */
type ImportRow = { name: string; email: string; address: string; phone?: string; category?: Guest['category'] };
type SkippedRow = { line: number; name: string; reason: string };

/** Accepted header spellings → field. Headers are compared lower-cased with spaces/underscores removed. */
const HEADER_ALIASES: Record<string, keyof ImportRow> = {
  name: 'name', fullname: 'name', guestname: 'name',
  email: 'email', emailaddress: 'email',
  phone: 'phone', mobile: 'phone', phonenumber: 'phone',
  address: 'address',
  category: 'category', type: 'category',
};

/** Minimal RFC 4180 parser: handles quoted fields, escaped quotes and CRLF line endings. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  return rows;
}

/**
 * Validates rows client-side and drops duplicates. Bulk import doesn't check for existing emails
 * (single-guest create does), so re-importing a file would otherwise create duplicate guests.
 */
function prepareRows(text: string, existingEmails: Set<string>, categories: readonly string[]): { rows: ImportRow[]; skipped: SkippedRow[]; headerError?: string } {
  const [header, ...body] = parseCsv(text.replace(/^﻿/, ''));
  const fields = (header ?? []).map((h) => HEADER_ALIASES[h.toLowerCase().replace(/[\s_-]/g, '')]);
  const missing = (['name', 'email', 'address'] as const).filter((f) => !fields.includes(f));
  if (!header || missing.length > 0) {
    return { rows: [], skipped: [], headerError: `The file's header row is missing: ${missing.join(', ') || 'name, email, address'}. Download the template to see the expected columns.` };
  }

  // Matches a spelling in the file to this tenant's vocabulary; an unrecognised
  // value is kept as typed rather than dropped.
  const categoryByLower = new Map(categories.map((c) => [c.toLowerCase(), c]));
  const seenInFile = new Set<string>();
  const rows: ImportRow[] = [];
  const skipped: SkippedRow[] = [];

  body.forEach((cells, idx) => {
    const line = idx + 2; // 1-based, after the header row
    const row: Partial<ImportRow> = {};
    fields.forEach((field, col) => {
      const value = cells[col]?.trim();
      if (!field || !value) return;
      if (field === 'category') row.category = categoryByLower.get(value.toLowerCase()) ?? value;
      else row[field] = value;
    });
    const name = row.name ?? '';
    const email = row.email?.toLowerCase() ?? '';
    const missingFields = (['name', 'email', 'address'] as const).filter((f) => !row[f]);
    if (missingFields.length) return skipped.push({ line, name, reason: `Missing ${missingFields.join(', ')}` });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return skipped.push({ line, name, reason: 'Invalid email' });
    if (seenInFile.has(email)) return skipped.push({ line, name, reason: 'Email repeated earlier in this file' });
    if (existingEmails.has(email)) return skipped.push({ line, name, reason: 'A guest with this email already exists' });
    seenInFile.add(email);
    rows.push(row as ImportRow);
  });
  return { rows, skipped };
}

function downloadTemplate(categories: readonly string[]) {
  exportToCSV(
    [{ name: 'Jane Doe', email: 'jane@example.com', phone: '+91 98765 43210', address: '12 MG Road, Bengaluru', category: categories[0] ?? '' }],
    'import-template'
  );
}

interface GuestImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestImportDialog({ open, onOpenChange }: GuestImportDialogProps) {
  const t = useTerminology();
  const categories = guestCategories(t.slug);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [skipped, setSkipped] = useState<SkippedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [dupCheckFailed, setDupCheckFailed] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const importGuests = useBulkImportGuests();
  const result = importGuests.data;

  function reset() {
    setFileName('');
    setRows([]);
    setSkipped([]);
    setParseError(null);
    setDupCheckFailed(false);
    importGuests.reset();
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleOpenChange(next: boolean) {
    if (importGuests.isPending || isReading) return;
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    importGuests.reset();
    setFileName(file.name);
    setIsReading(true);
    try {
      const text = await file.text();
      // GET /guests/export returns every guest in the tenant — used only to catch duplicates.
      let existing = new Set<string>();
      try {
        const res = await guestService.exportGuests();
        existing = new Set((res.data ?? []).map((g) => g.email?.toLowerCase()).filter((e): e is string => !!e));
        setDupCheckFailed(false);
      } catch {
        setDupCheckFailed(true);
      }
      const prepared = prepareRows(text, existing, categories);
      setRows(prepared.rows);
      setSkipped(prepared.skipped);
      setParseError(
        prepared.headerError ??
        (prepared.rows.length === 0 && prepared.skipped.length === 0 ? 'No guest rows were found in this file.' : null)
      );
    } catch {
      setRows([]);
      setSkipped([]);
      setParseError('This file could not be read. Please upload a .csv file.');
    } finally {
      setIsReading(false);
    }
  }

  const submitError = importGuests.error
    ? getFriendlyErrorMessage(importGuests.error, 'Unable to import guests.')
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Import {t.person.many}</DialogTitle>
          <DialogDescription>
            Upload a CSV with columns: name, email, address (required), plus phone and category.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
              <p className="text-sm font-medium">
                {result.imported ?? 0} guest{result.imported === 1 ? '' : 's'} imported.
              </p>
            </div>
            {(result.errors?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  The server rejected {result.errors.length} row{result.errors.length === 1 ? '' : 's'}
                </p>
                <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-3 text-sm">
                  {result.errors.map((e) => (
                    <li key={e.index}>
                      <span className="font-medium">{rows[e.index]?.name ?? `Row ${e.index + 1}`}</span>
                      {rows[e.index]?.email && <span className="text-muted-foreground"> ({rows[e.index].email})</span>}:{' '}
                      <span className="text-muted-foreground">{e.error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {skipped.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {skipped.length} row{skipped.length === 1 ? ' was' : 's were'} skipped before import (see reasons in the preview).
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {(parseError || submitError) && (
              <Alert variant="destructive">
                <AlertDescription>{parseError || submitError}</AlertDescription>
              </Alert>
            )}

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={importGuests.isPending || isReading}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
            >
              {isReading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
              ) : fileName ? (
                <FileSpreadsheet className="h-8 w-8 text-primary" aria-hidden="true" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              )}
              <span className="text-sm font-medium">{isReading ? 'Checking file…' : fileName || 'Choose a CSV file'}</span>
              <span className="text-xs text-muted-foreground">
                {fileName ? 'Click to choose a different file' : 'Only .csv files are supported'}
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={() => downloadTemplate(categories)}>
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Download CSV template
            </Button>

            {dupCheckFailed && (
              <Alert>
                <AlertDescription>
                  Couldn&apos;t load existing guests to check for duplicates. Guests already in the system will be added again if they&apos;re in this file.
                </AlertDescription>
              </Alert>
            )}

            {rows.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">{rows.length}</span> guest{rows.length === 1 ? '' : 's'} ready to import
                </p>
                <div className="max-h-48 overflow-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="hidden sm:table-cell">Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.slice(0, 5).map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.email}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{r.category || 'regular'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {rows.length > 5 && <p className="text-xs text-muted-foreground">Showing first 5 of {rows.length} rows.</p>}
              </div>
            )}

            {skipped.length > 0 && (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-medium text-warning">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  {skipped.length} row{skipped.length === 1 ? '' : 's'} will be skipped
                </p>
                <ul className="max-h-36 space-y-1 overflow-y-auto rounded-lg border p-3 text-sm">
                  {skipped.map((s) => (
                    <li key={s.line}>
                      <span className="font-medium">Line {s.line}{s.name ? ` · ${s.name}` : ''}:</span>{' '}
                      <span className="text-muted-foreground">{s.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={importGuests.isPending || isReading}>
                Cancel
              </Button>
              <Button
                onClick={() => importGuests.mutate(rows)}
                disabled={rows.length === 0 || isReading}
                loading={importGuests.isPending}
              >
                {importGuests.isPending ? 'Importing…' : `Import ${rows.length || ''} Guest${rows.length === 1 ? '' : 's'}`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
