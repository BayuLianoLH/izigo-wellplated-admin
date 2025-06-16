
"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package2, LogOut, Settings, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardSidebarNav() {
  const pathname = usePathname();
  const isKelolaProdukActive = pathname === '/' || pathname.startsWith('/add-product') || pathname.startsWith('/edit-product');

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden" prefetch={false}>
             <Package2 className="h-6 w-6 text-primary" />
             <span className="font-semibold text-primary">GiziGO!</span>
           </Link>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/" isActive={isKelolaProdukActive} tooltip="Kelola Produk">
              <LayoutGrid />
              <span>Kelola Produk</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" tooltip="Menu Lain" isActive={pathname === '/other-menu'}>
              <Settings />
              <span>Menu Lain</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <Separator className="my-2" />
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" tooltip="Keluar">
              <LogOut />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
