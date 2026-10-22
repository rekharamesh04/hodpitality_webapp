import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="editorial-dots relative min-h-screen overflow-hidden bg-background">
      <div className="relative">{children}</div>
    </div>
  );
}
