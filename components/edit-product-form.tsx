
"use client";

import type * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label'; // Not directly used if FormLabel is used
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
import type { Product } from '@/types';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

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

interface EditProductFormProps {
  product: Product;
}

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: product.name || '',
      category: product.category || '',
      price: product.price,
      description: product.description || '',
      productImage: undefined,
    },
  });

  useEffect(() => {
    form.reset({
      productName: product.name || '',
      category: product.category || '',
      price: product.price,
      description: product.description || '',
      productImage: undefined,
    });
    setImagePreview(product.imageUrl);
  }, [product, form]);

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    let newImageUrl = product.imageUrl;
    let newImageAiHint = product.imageAiHint || 'product image';

    if (data.productImage) {
      try {
        newImageUrl = await fileToDataUri(data.productImage);
        newImageAiHint = data.category || 'user uploaded';
      } catch (error) {
        console.error("Error converting file to data URI:", error);
        toast({
          title: "Error Unggah Gambar",
          description: "Gagal memproses gambar produk baru. Perubahan lain akan disimpan.",
          variant: "destructive",
        });
      }
    }

    const productDocRef = doc(db, "products", product.id);
    
    const updatedProductData: Partial<Product> = {
      name: data.productName,
      category: data.category,
      price: data.price,
      description: data.description || '',
      imageUrl: newImageUrl,
      imageAiHint: newImageAiHint,
      // @ts-ignore
      updatedAt: serverTimestamp(),
    };
    
    try {
      await updateDoc(productDocRef, updatedProductData);
      toast({
        title: "Sukses!",
        description: `Produk "${data.productName}" berhasil diperbarui di Firestore.`,
      });
      router.push('/');
    } catch (error) {
      console.error("Error updating product in Firestore:", error);
      toast({
        title: "Error Penyimpanan",
        description: "Gagal menyimpan perubahan produk ke Firestore. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
                              data-ai-hint={product.imageAiHint || 'product image'}
                            />
                          </div>
                        ) : (
                          <div className="space-y-2 text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Seret & lepas atau <span className="font-semibold text-primary">jelajahi</span> untuk mengganti gambar
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
                            } else {
                              field.onChange(undefined);
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
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
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

    