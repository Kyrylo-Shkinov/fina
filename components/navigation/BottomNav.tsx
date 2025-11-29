'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Home, Calendar, FolderTree, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}

export function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale();

  const navItemsWithLocale: NavItem[] = [
    { id: 'home', label: 'Домівка', icon: Home, route: `/${locale}/home` },
    { id: 'plan', label: 'План', icon: Calendar, route: `/${locale}/plan` },
    { id: 'categories', label: 'Категорії', icon: FolderTree, route: `/${locale}/categories` },
    { id: 'stats', label: 'Статистика', icon: BarChart3, route: `/${locale}/stats` },
  ];

  return (
    <>
      {/* Mobile Navigation - Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
        <div className="flex h-16 items-center justify-around">
          {navItemsWithLocale.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.route || 
              (item.route !== `/${locale}/home` && pathname?.startsWith(item.route));
            
            return (
              <Link
                key={item.id}
                href={item.route}
                prefetch
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Navigation - Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 z-50 border-r border-border bg-card flex-col items-center py-6 gap-6">
        {navItemsWithLocale.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.route || 
            (item.route !== `/${locale}/home` && pathname?.startsWith(item.route));
          
          return (
            <Link
              key={item.id}
              href={item.route}
              prefetch
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-colors w-full",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              title={item.label}
            >
              <Icon className={cn(
                "h-6 w-6 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium text-center",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

