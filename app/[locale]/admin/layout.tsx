'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { LayoutDashboard, Users, LogOut, Settings, Menu, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { AdminGuard } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale as string;
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const t = useTranslations('navigation.admin');
  const tCommon = useTranslations('common.buttons');

  const navigation = [
    { name: t('dashboard'), href: `/${locale}/admin`, icon: LayoutDashboard },
    { name: t('events'), href: `/${locale}/admin/events`, icon: Calendar },
    { name: t('users'), href: `/${locale}/admin/users`, icon: Users },
    { name: t('settings'), href: `/${locale}/admin/settings`, icon: Settings },
  ];

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        {/* Mobile sidebar toggle */}
        <div className="fixed left-4 top-4 z-50 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-sidebar transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
              <Link href={`/${locale}/admin`} className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="font-heading text-sm font-bold text-primary-foreground">
                    5S
                  </span>
                </div>
                <span className="font-heading text-lg font-bold text-sidebar-foreground tracking-tight">
                  {t('title')}
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className="border-t p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-sidebar-accent">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(user?.displayName, user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {user?.displayName || user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/admin/settings`}>
                      <Settings className="mr-2 h-4 w-4" />
                      {t('settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div className="w-full">
                      <LanguageSwitcher />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {tCommon('signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6 lg:py-8">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
