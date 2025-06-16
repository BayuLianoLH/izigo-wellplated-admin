
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { ProductTableRowActions } from "./product-table-row-actions";
import type { Product } from "@/types";
import { Search } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp, type Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

function formatPrice(product: Product): string {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  if (product.price !== undefined) {
    return formatter.format(product.price);
  }
  if (product.priceMin !== undefined && product.priceMax !== undefined) {
    return `${formatter.format(product.priceMin)} - ${formatter.format(product.priceMax)}`;
  }
  return "N/A";
}

function formatFirestoreTimestamp(timestamp: Timestamp | undefined): string {
  if (!timestamp) return 'N/A';
  return timestamp.toDate().toLocaleDateString('id-ID');
}


export function ProductManagementSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    console.log("[ProductManagementSection] Attempting to fetch products from Firestore via onSnapshot...");

    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      console.log(`[ProductManagementSection] Products fetched/updated via onSnapshot. Count: ${productsData.length}`);
      setProducts(productsData);
      setIsLoading(false);
    }, (err: any) => {
      console.error("[ProductManagementSection] Error fetching products from Firestore via onSnapshot: ", err);
      let userFriendlyError = "Gagal memuat produk. Silakan coba lagi.";
      if (err.code === 'permission-denied') {
        userFriendlyError = "Akses ditolak. Periksa aturan keamanan Firestore Anda untuk membaca koleksi 'products'.";
      } else if (err.code === 'unimplemented' || (err.code === 'failed-precondition' && err.message.includes('indexes'))) {
         userFriendlyError = "Query membutuhkan indeks. Periksa console Firebase (Developer Console browser) untuk membuat indeks yang diperlukan pada koleksi 'products' di field 'createdAt'.";
      } else {
        userFriendlyError = `Gagal memuat produk (Kode: ${err.code || 'UNKNOWN'}). Cek console untuk detail.`;
      }
      console.error(`[ProductManagementSection] User friendly error: ${userFriendlyError}`);
      setError(userFriendlyError);
      setProducts([]); 
      setIsLoading(false);
    });

    return () => {
      console.log("[ProductManagementSection] Unsubscribing from Firestore listener.");
      unsubscribe(); 
    }
  }, []);

  const handleStatusChange = async (productId: string, isActive: boolean) => {
    const productDocRef = doc(db, "products", productId);
    try {
      await updateDoc(productDocRef, {
        isActive: isActive,
        // @ts-ignore
        updatedAt: serverTimestamp()
      });
      // UI will update via onSnapshot
    } catch (err) {
      console.error("[ProductManagementSection] Error updating product status in Firestore: ", err);
      // Potentially show a toast notification for the error
    }
  };

  const handleProductDeleted = (deletedProductId: string) => {
    // onSnapshot should handle UI update automatically
    console.log(`[ProductManagementSection] Product with ID ${deletedProductId} was deleted. onSnapshot should update the list.`);
    // Optionally, to make it feel even faster, you could optimistically update here:
    // setProducts((prevProducts) => prevProducts.filter(p => p.id !== deletedProductId));
    // But be careful if the Firestore delete fails later, the UI would be out of sync.
    // Relying on onSnapshot is generally safer.
  };

  const filteredProducts = useMemo(() => {
    let tempProducts = products;

    if (activeTab === "active") {
      tempProducts = tempProducts.filter((p) => p.isActive);
    } else if (activeTab === "inactive") {
      tempProducts = tempProducts.filter((p) => !p.isActive);
    }

    if (searchTerm) {
      tempProducts = tempProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return tempProducts;
  }, [products, searchTerm, activeTab]);

  const counts = useMemo(() => {
    return {
      all: products.length,
      active: products.filter(p => p.isActive).length,
      inactive: products.filter(p => !p.isActive).length,
    };
  }, [products]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Skeleton className="h-10 pl-10 w-full md:w-1/3 rounded-md" />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
                <Skeleton className="h-10 w-28 mr-2 rounded-md" />
                <Skeleton className="h-10 w-24 mr-2 rounded-md" />
                <Skeleton className="h-10 w-28 rounded-md" />
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
                <Card className="shadow-md">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px] hidden md:table-cell">Gambar</TableHead>
                                    <TableHead>Nama Produk</TableHead>
                                    <TableHead className="hidden sm:table-cell">SKU</TableHead>
                                    <TableHead className="hidden sm:table-cell">Harga</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="hidden md:table-cell"><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-3/4 rounded-md" /></TableCell>
                                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-20 rounded-md" /></TableCell>
                                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-24 rounded-md" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-10 rounded-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold text-destructive mb-2">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground text-center">{error}</p>
        <p className="text-sm text-muted-foreground mt-2 text-center">Pastikan Anda telah mengisi konfigurasi Firebase dengan benar dan aturan keamanan Firestore memperbolehkan akses baca ke koleksi 'products'.</p>
         {error.includes("indeks") && (
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Buka Firebase Console, navigasi ke Firestore Database &gt; Indexes, dan buat indeks yang diperlukan (biasanya untuk field 'createdAt').
          </p>
        )}
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari nama produk atau SKU"
          className="pl-10 w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Cari nama produk atau SKU"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="transition-all duration-300">
        <TabsList>
          <TabsTrigger value="all">Semua Produk ({counts.all})</TabsTrigger>
          <TabsTrigger value="active">Aktif ({counts.active})</TabsTrigger>
          <TabsTrigger value="inactive">Nonaktif ({counts.inactive})</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          <Card className="shadow-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] hidden md:table-cell">Gambar</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead className="hidden sm:table-cell">SKU</TableHead>
                    <TableHead className="hidden sm:table-cell">Harga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="hidden md:table-cell">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="rounded-md object-cover"
                            data-ai-hint={product.imageAiHint || 'food item'}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {product.sku || '-'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{formatPrice(product)}</TableCell>
                        <TableCell>
                          <Switch
                            checked={product.isActive}
                            onCheckedChange={(checked) => handleStatusChange(product.id, checked)}
                            aria-label={`Status produk ${product.name}`}
                            className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-muted transition-colors duration-300"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <ProductTableRowActions product={product} onProductDeleted={handleProductDeleted} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        {isLoading ? "Memuat produk..." : 
                         products.length === 0 && searchTerm === "" && (activeTab === "all") 
                          ? "Belum ada produk di database. Coba tambahkan produk baru."
                          : "Tidak ada produk yang cocok dengan kriteria pencarian atau filter."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Shadcn card component parts (simplified for this file, typically imported)
const Card = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-lg border bg-card text-card-foreground ${className}`} {...props} />
);
const CardContent = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-0 ${className}`} {...props} /> 
);
