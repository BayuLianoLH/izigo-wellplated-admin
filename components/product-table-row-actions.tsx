
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // AlertDialogTrigger is not needed here directly for this pattern
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/types";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from "firebase/firestore";

interface ProductTableRowActionsProps {
  product: Product;
  onProductDeleted: (productId: string) => void;
}

export function ProductTableRowActions({ product, onProductDeleted }: ProductTableRowActionsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);

  const handleEdit = () => {
    router.push(`/edit-product/${product.id}`);
  };

  const executeDelete = async () => {
    console.log(`[ProductTableRowActions] Confirmed delete for product: ${product.name} (ID: ${product.id})`);
    try {
      const productDocRef = doc(db, "products", product.id);
      console.log(`[ProductTableRowActions] Product document reference created for ID: ${product.id}`);
      await deleteDoc(productDocRef);
      console.log(`[ProductTableRowActions] deleteDoc successful for product ID: ${product.id}`);
      
      toast({
        title: "Sukses!",
        description: `Produk "${product.name}" berhasil dihapus.`,
      });
      
      if (onProductDeleted) {
          onProductDeleted(product.id);
      }
      setIsConfirmDeleteDialogOpen(false); 

    } catch (error: any) {
      console.error(`[ProductTableRowActions] Error deleting product ID ${product.id} from Firestore:`, error);
      let toastMessage = "Gagal menghapus produk. Silakan coba lagi.";
      if (error.code) {
        console.error(`[ProductTableRowActions] Firestore Error Code: ${error.code}`);
        console.error(`[ProductTableRowActions] Firestore Error Message: ${error.message}`);
        if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
          toastMessage = "Penghapusan gagal: Akses ditolak oleh Firestore. Periksa Aturan Keamanan (Security Rules) Firestore Anda untuk operasi 'delete' pada koleksi 'products'.";
        } else {
          toastMessage = `Error: ${error.message} (Kode: ${error.code}). Pastikan aturan keamanan Firestore mengizinkan penghapusan.`;
        }
      }

      toast({
        title: "Error Penghapusan",
        description: toastMessage,
        variant: "destructive",
        duration: 9000,
      });
      setIsConfirmDeleteDialogOpen(false); 
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
            onSelect={(e) => {
              e.preventDefault(); // Prevents DropdownMenu from closing immediately
              setIsConfirmDeleteDialogOpen(true); // Open the AlertDialog
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Hapus</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus produk "{product.name}" secara permanen dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
