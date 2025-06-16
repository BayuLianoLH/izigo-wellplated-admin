
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const productFormSchema = z.object({
  productName: z.string().min(3, "Nama Produk minimal 3 karakter"),
  category: z.string().min(3, "Kategori minimal 3 karakter"),
  price: z.coerce.number({ invalid_type_error: "Harga harus berupa angka" }).positive("Harga harus positif").min(1, "Harga tidak boleh kosong"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").optional(),
  productImage: z.instanceof(File).optional()
    .refine(file => !file || file.size <= 5 * 1024 * 1024, `Ukuran file maksimal 5MB.`)
    .refine(file => !file || ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type), `Format file yang didukung: JPG, PNG, GIF, WEBP.`),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const fileToDataUri = (file: File): Promise<string> => {
  console.log("[AddProductForm] fileToDataUri called for file:", file.name);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      console.log("[AddProductForm] fileToDataUri successful for:", file.name);
      resolve(reader.result as string);
    }
    reader.onerror = (error) => {
      console.error("[AddProductForm] fileToDataUri error for:", file.name, error);
      reject(error);
    }
    reader.readAsDataURL(file);
  });
};

export function AddProductForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: '',
      category: '',
      price: undefined, 
      description: '',
      productImage: undefined,
    },
  });

  async function onSubmit(data: ProductFormValues) {
    console.log("[AddProductForm] onSubmit started. Data:", data);
    setIsSubmitting(true);
    console.log("[AddProductForm] isSubmitting set to true.");

    let imageUrl = 'https://placehold.co/600x400.png';
    let imageAiHint = 'product image';

    if (data.productImage) {
      console.log("[AddProductForm] Processing product image...");
      try {
        imageUrl = await fileToDataUri(data.productImage);
        imageAiHint = data.category || 'user uploaded';
        console.log("[AddProductForm] Product image processed to Data URI. Length:", imageUrl.length);
      } catch (error) {
        console.error("[AddProductForm] Error converting file to data URI:", error);
        toast({
          title: "Error Unggah Gambar",
          description: "Gagal memproses gambar produk. Silakan coba lagi.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        console.log("[AddProductForm] isSubmitting set to false due to image processing error.");
        console.log("[AddProductForm] onSubmit ended due to image processing error.");
        return;
      }
    } else {
      console.log("[AddProductForm] No product image provided, using placeholder.");
    }
    console.log("[AddProductForm] Image processing complete. Image URL:", imageUrl.substring(0,100) + "...", "AI Hint:", imageAiHint);


    const newProductData = {
      name: data.productName,
      category: data.category,
      price: data.price,
      description: data.description || '',
      imageUrl: imageUrl,
      imageAiHint: imageAiHint,
      sku: `SKU${Date.now().toString().slice(-6)}`, 
      isActive: true,
      createdAt: serverTimestamp(),
    };
    console.log("[AddProductForm] Prepared new product data for Firestore:", newProductData);
    
    if (!db) {
      console.error("[AddProductForm] Firestore database instance (db) is not available!");
      toast({
        title: "Error Konfigurasi",
        description: "Koneksi ke database tidak tersedia. Periksa konfigurasi Firebase.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      console.log("[AddProductForm] isSubmitting set to false due to missing db instance.");
      return;
    }

    try {
      console.log("[AddProductForm] Attempting to call addDoc to Firestore 'products' collection...");
      const docRef = await addDoc(collection(db, "products"), newProductData);
      console.log("[AddProductForm] addDoc successful. Document ID:", docRef.id);
      toast({
        title: "Sukses!",
        description: `Produk "${data.productName}" berhasil ditambahkan.`,
      });
      router.push('/'); 
    } catch (error: any) {
      console.error("[AddProductForm] Error saving product to Firestore:", error);
      let errorMessage = "Gagal menyimpan produk ke Firestore. Silakan coba lagi.";
      if (error.code) {
        errorMessage = `Error: ${error.message} (Kode: ${error.code}).`;
        if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
          errorMessage = "Penyimpanan gagal: Akses ditolak oleh Firestore. Periksa Aturan Keamanan (Security Rules) Firestore Anda untuk koleksi 'products' dan pastikan operasi 'create' atau 'write' diizinkan.";
        } else {
           errorMessage += " Pastikan Aturan Keamanan (Security Rules) Firestore Anda mengizinkan penulisan ke koleksi 'products'.";
        }
      }
      console.error("[AddProductForm] Firestore save error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      toast({
        title: "Error Penyimpanan Firestore",
        description: errorMessage,
        variant: "destructive",
        duration: 9000, 
      });
    } finally {
      console.log("[AddProductForm] Entering finally block of Firestore operation.");
      setIsSubmitting(false);
      console.log("[AddProductForm] isSubmitting set to false in finally block.");
      console.log("[AddProductForm] onSubmit finished.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Gambar Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="productImage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div>
                      <label
                        htmlFor="productImage"
                        className="flex flex-col justify-center items-center w-full h-64 px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary focus-within:border-primary bg-background hover:bg-muted/50 transition-colors"
                      >
                        {imagePreview ? (
                          <div className="relative w-full h-full max-w-[200px] max-h-[200px] mx-auto">
                            <Image 
                              src={imagePreview} 
                              alt="Pratinjau Gambar Produk" 
                              layout="fill" 
                              objectFit="contain" 
                              className="rounded-md" 
                            />
                          </div>
                        ) : (
                          <div className="space-y-2 text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Seret & lepas atau <span className="font-semibold text-primary">jelajahi</span>
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WEBP (MAX. 5MB)</p>
                          </div>
                        )}
                        <Input
                          id="productImage"
                          type="file"
                          className="sr-only"
                          accept="image/png, image/jpeg, image/gif, image/webp"
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                              const currentPreview = URL.createObjectURL(file);
                              setImagePreview(currentPreview);
                              console.log("[AddProductForm] Image selected:", file.name);
                            } else {
                              field.onChange(undefined);
                              setImagePreview(null);
                              console.log("[AddProductForm] Image selection cleared.");
                            }
                          }}
                        />
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Detail Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Produk</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Roti Gandum Sehat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Makanan Pokok" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Contoh: 25000" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                  </FormControl>
                  <FormDescription>Masukkan harga dalam Rupiah (IDR).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan detail produk Anda di sini..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button type="submit" size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow" disabled={isSubmitting}>
            {isSubmitting ? "Mengirim..." : "Kirim"}
          </Button>
          <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => router.push('/')}>
             <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </form>
    </Form>
  );
}
    

    