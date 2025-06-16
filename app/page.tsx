
import Link from 'next/link';
import { SiteHeader } from "@/components/site-header";
import { DashboardSidebarNav } from "@/components/dashboard-sidebar-nav";
import { ProductManagementSection } from "@/components/product-management-section";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <div className="flex flex-1">
        <SidebarProvider defaultOpen={true}>
          <DashboardSidebarNav />
          <SidebarInset className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Kelola Produk
              </h1>
              <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                <Link href="/add-product">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Tambah Produk
                </Link>
              </Button>
            </div>
            <ProductManagementSection />
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
