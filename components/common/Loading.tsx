import { Loader2 } from 'lucide-react';

export function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="editorial-label text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}