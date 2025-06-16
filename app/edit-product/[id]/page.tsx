
"use client";

import type { Product } from '@/types';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SiteHeader } from "@/components/site-header";
import { DashboardSidebarNav } from "@/components/dashboard-sidebar-nav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { EditProductForm } from "@/components/edit-product-form";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined for loading, null for not found
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      console.log(`[EditProductPage] Product ID: ${productId}. Starting fetch...`);
      setIsLoading(true);
      const fetchProduct = async () => {
        try {
          const productDocRef = doc(db, "products", productId);
          console.log(`[EditProductPage] Fetching document: products/${productId}`);
          const productSnap = await getDoc(productDocRef);

          if (productSnap.exists()) {
            console.log("[EditProductPage] Product found in Firestore.");
            setProduct({ id: productSnap.id, ...productSnap.data() } as Product);
          } else {
            console.warn("[EditProductPage] Product not found in Firestore (no such document).");
            setProduct(null); // Product not found
          }
        } catch (error: any) {
          let errorMessage = "[EditProductPage] Error fetching product from Firestore. ";
          if (error.code) errorMessage += `Code: ${error.code}. `;
          if (error.message) errorMessage += `Message: ${error.message}. `;
          console.error(errorMessage, error);
          setProduct(null); // Error occurred
        } finally {
          console.log("[EditProductPage] Fetch process finished. Setting isLoading to false.");
          setIsLoading(false);
        }
      };
      fetchProduct();
    } else {
      console.warn("[EditProductPage] No product ID provided in params.");
      setIsLoading(false);
      setProduct(null); // No product ID in params
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <SiteHeader />
        <div className="flex flex-1">
          <SidebarProvider defaultOpen={true}>
            <DashboardSidebarNav />
            <SidebarInset className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <Skeleton className="h-8 w-1/2 mb-8" />
                <Skeleton className="h-64 w-full mb-6" />
                <Skeleton className="h-12 w-full mb-6" />
                <Skeleton className="h-12 w-full mb-6" />
                <Skeleton className="h-24 w-full mb-6" />
                <Skeleton className="h-12 w-32" />
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <SiteHeader />
        <div className="flex flex-1">
          <SidebarProvider defaultOpen={true}>
            <DashboardSidebarNav />
            <SidebarInset className="flex-1 p-4 md:p-8 lg:p-10 flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold text-destructive mb-4">Produk Tidak Ditemukan</h1>
              <p className="text-muted-foreground mb-6">Produk dengan ID yang Anda cari tidak dapat ditemukan atau terjadi kesalahan saat mengambil data.</p>
              <Button onClick={() => router.push('/')}>Kembali ke Dasbor</Button>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <div className="flex flex-1">
        <SidebarProvider defaultOpen={true}>
          <DashboardSidebarNav />
          <SidebarInset className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
                Edit Produk
              </h1>
              <EditProductForm product={product} />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
