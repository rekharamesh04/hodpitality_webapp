import { useEffect, useRef, useState } from "react";

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useDebouncedCallback<T extends unknown[]>(
  fn: (...args: T) => void,
  delay = 400
): (...args: T) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (...args: T) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  };
}
