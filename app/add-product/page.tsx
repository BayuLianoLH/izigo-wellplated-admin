
import { SiteHeader } from "@/components/site-header";
import { DashboardSidebarNav } from "@/components/dashboard-sidebar-nav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AddProductForm } from "@/components/add-product-form";

export default function AddProductPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <div className="flex flex-1">
        <SidebarProvider defaultOpen={true}>
          <DashboardSidebarNav />
          <SidebarInset className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
                Tambah Produk Baru
              </h1>
              <AddProductForm />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
