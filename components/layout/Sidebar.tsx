'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore, useAuthStore } from '@/store';
import { NAV_SECTIONS } from '@/constants/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

function NavItems({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.role ?? '';

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.roles || item.roles.includes(role)
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <nav className="space-y-6">
      {visibleSections.map((section) => (
        <div key={section.label}>
          {!collapsed && (
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
              {section.label}
            </h3>
          )}
          {collapsed && <div className="mb-2 h-px bg-sidebar-border" />}
          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={onNavigate}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-sidebar-active text-sidebar-foreground shadow-sm'
                        : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && (
                          <Badge
                            className={cn(
                              'h-5 min-w-[20px] border-transparent px-1.5 text-xs',
                              isActive ? 'bg-white text-primary' : 'bg-white/20 text-white'
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                    {collapsed && item.badge !== undefined && (
                      <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-white" />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, closeMobileSidebar } = useUIStore();

  const logo = (full: boolean) => (
    <Link
      href="/dashboard"
      className={cn('flex items-center', full ? 'space-x-2' : 'justify-center w-full')}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
        <span className="text-lg font-bold text-primary">H</span>
      </div>
      {full && <span className="text-lg font-semibold text-sidebar-foreground">HospitalityAdmin</span>}
    </Link>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 'var(--sidebar-collapsed-w)' : 'var(--sidebar-w)' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar lg:flex"
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {logo(!sidebarCollapsed)}
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <NavItems collapsed={sidebarCollapsed} />
        </ScrollArea>

        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-center text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </motion.aside>

      {/* ── Mobile sidebar overlay ───────────────────────── */}
      <AnimatePresence>
        {sidebarMobileOpen && (
          <>
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={closeMobileSidebar}
            />
            {/* drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed left-0 top-0 z-50 flex h-screen w-[var(--sidebar-w)] flex-col border-r border-sidebar-border bg-sidebar lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
                {logo(true)}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMobileSidebar}
                  className="text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 px-3 py-4">
                <NavItems collapsed={false} onNavigate={closeMobileSidebar} />
              </ScrollArea>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


