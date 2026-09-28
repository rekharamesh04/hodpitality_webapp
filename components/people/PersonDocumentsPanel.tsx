'use client';

import { useRef, useState } from 'react';
import { ExternalLink, FileText, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { usePersonDocuments, useUploadPersonDocument, useDeletePersonDocument } from '@/hooks/usePersonDocuments';
import { DOCUMENT_ACCEPT, DOCUMENT_CATEGORIES } from '@/services/document.service';
import type { DocumentCategory, PersonDocument, PersonEntity } from '@/services/document.service';
import { isOrgAdmin } from '@/constants/roles';
import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';

const MAX_BYTES = 8 * 1024 * 1024;

function categoryLabel(value?: string): string {
  return DOCUMENT_CATEGORIES.find((c) => c.value === value)?.label ?? 'Other';
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface PersonDocumentsPanelProps {
  entity: PersonEntity;
  personId: string;
}

/** Lab reports, scans and other files on a person's record. */
export function PersonDocumentsPanel({ entity, personId }: PersonDocumentsPanelProps) {
  const user = useAuthStore((s) => s.user);
  const { data: documents, isLoading, isError, refetch } = usePersonDocuments(entity, personId);
  const upload = useUploadPersonDocument(entity, personId);
  const remove = useDeletePersonDocument(entity, personId);

  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('lab_report');
  const [notes, setNotes] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PersonDocument | null>(null);

  function resetForm() {
    setFile(null);
    setTitle('');
    setNotes('');
    setFileError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setFileError(null);
    if (picked && picked.size > MAX_BYTES) {
      setFileError('That file is larger than 8 MB.');
      setFile(null);
      return;
    }
    setFile(picked);
    if (picked && !title) setTitle(picked.name.replace(/\.[^.]+$/, ''));
  }

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setFileError('Choose a file to upload.');
      return;
    }
    upload.mutate({ file, title, category, notes }, { onSuccess: resetForm });
  }

  // The uploader may remove their own upload; anyone else needs company admin (backend enforces).
  function canDelete(doc: PersonDocument): boolean {
    return isOrgAdmin(user?.role) || (!!doc.uploadedById && doc.uploadedById === user?.id);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleUpload} className="grid gap-3 rounded-lg border border-dashed p-3 sm:grid-cols-2" noValidate>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="doc-file">File (PDF or image, up to 8 MB)</Label>
          <Input id="doc-file" ref={fileRef} type="file" accept={DOCUMENT_ACCEPT} onChange={handleFile} disabled={upload.isPending} />
          {fileError && <p className="text-xs text-destructive">{fileError}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-title">Title</Label>
          <Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Blood test — Sept" disabled={upload.isPending} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-category">Type</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)} disabled={upload.isPending}>
            <SelectTrigger id="doc-category"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DOCUMENT_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="doc-notes">Notes</Label>
          <Textarea id="doc-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional" disabled={upload.isPending} />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" size="sm" loading={upload.isPending}>
            {!upload.isPending && <Upload className="mr-2 h-4 w-4" />}
            {upload.isPending ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
          <span className="text-muted-foreground">Could not load documents.</span>
          <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : (documents ?? []).length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No reports or documents yet.</p>
      ) : (
        <ul className="space-y-2">
          {(documents ?? []).map((doc) => {
            const isImage = (doc.contentType ?? '').startsWith('image/');
            const Icon = isImage ? ImageIcon : FileText;
            const created = doc.created_at ?? doc.createdAt;
            return (
              <li key={doc.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.title || doc.fileName || 'Document'}</p>
                  <p className="text-xs text-muted-foreground">
                    {categoryLabel(doc.category)}
                    {created ? ` · ${formatDate(created, 'MMM dd, yyyy')}` : ''}
                    {doc.size ? ` · ${formatSize(doc.size)}` : ''}
                    {doc.uploadedBy ? ` · ${doc.uploadedBy}` : ''}
                  </p>
                  {doc.notes && <p className="mt-1 text-xs text-foreground/80">{doc.notes}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  {doc.url && (
                    <Button asChild size="icon-sm" variant="ghost" aria-label="Open document">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {canDelete(doc) && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete document"
                      onClick={() => setDeleteTarget(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete this document?"
        description={`"${deleteTarget?.title || deleteTarget?.fileName || 'This document'}" will be removed from the record. This cannot be undone.`}
        confirmLabel="Delete"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={remove.isPending}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      />
    </div>
  );
}
