
import type { Timestamp } from 'firebase/firestore';

export type Product = {
  id: string; // Firestore document ID
  imageUrl: string;
  imageAiHint?: string;
  name: string;
  category?: string;
  sku: string | null;
  price?: number;
  priceMin?: number;
  priceMax?: number;
  description?: string;
  isActive: boolean;
  createdAt?: Timestamp; // Added for Firestore
};
