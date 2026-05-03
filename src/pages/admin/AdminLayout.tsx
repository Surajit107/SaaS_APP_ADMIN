import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { adminSessionSyncRequested } from '@/features/admin/saga/adminAuthSaga';
import { logoutRequested } from '@/features/admin/slice/adminAuthSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AdminSidebar } from '@/pages/admin/AdminSidebar';

export function AdminLayout() {
  const dispatch = useAppDispatch();
  const { email, isLogoutPending } = useAppSelector((s) => s.adminAuth);

  useEffect(() => {
    dispatch(adminSessionSyncRequested());
  }, [dispatch]);

  return (
    <SidebarProvider>
      <AdminSidebar
        email={email}
        isLogoutPending={isLogoutPending}
        onLogout={() => dispatch(logoutRequested())}
      />
      <SidebarInset>
        <header className="border-border/60 bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-3 backdrop-blur-md sm:px-4">
          <SidebarTrigger className="-ml-0.5 shrink-0 sm:-ml-1" />
          <div aria-hidden className="bg-border mx-0.5 h-4 w-px shrink-0 sm:mx-1" />
          <span className="text-foreground min-w-0 flex-1 truncate text-sm font-semibold">
            Control center
          </span>
        </header>
        <main className="flex flex-1 flex-col px-3 py-6 sm:px-6 sm:py-8 md:px-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
