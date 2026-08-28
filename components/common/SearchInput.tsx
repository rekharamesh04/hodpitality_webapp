'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  defaultValue?: string;
  className?: string;
}

export function SearchInput({ placeholder = 'Search...', onSearch, debounceMs = 300, defaultValue = '', className }: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);
  const debouncedValue = useDebounce(value, debounceMs);
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Skip the mount-time fire so a defaultValue seeded from the URL doesn't re-trigger the same search.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    onSearch(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9 pr-9"
        aria-label={placeholder}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
